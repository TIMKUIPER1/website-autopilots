begin;

create table iam.service_principals (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete cascade,
  key text not null unique check (key ~ '^[a-z][a-z0-9:_-]{7,119}$'),
  display_name text not null,
  purpose text not null check (length(purpose) between 8 and 240),
  status text not null default 'active' check (status in ('active', 'suspended', 'retired')),
  login_allowed boolean not null default false check (login_allowed = false),
  external_writes_allowed boolean not null default false check (external_writes_allowed = false),
  created_by uuid references iam.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, legal_entity_id)
);

create table iam.service_principal_scopes (
  id uuid primary key default gen_random_uuid(),
  principal_id uuid not null,
  legal_entity_id uuid not null,
  brand_id uuid,
  permission text not null check (permission in (
    'monitoring.health.write',
    'monitoring.lease.manage',
    'monitoring.freshness.read'
  )),
  created_at timestamptz not null default now(),
  foreign key (principal_id, legal_entity_id)
    references iam.service_principals(id, legal_entity_id) on delete cascade,
  foreign key (brand_id, legal_entity_id)
    references core.brands(id, legal_entity_id) on delete cascade
);

create unique index service_principal_scopes_scope_uidx
  on iam.service_principal_scopes (
    principal_id,
    permission,
    coalesce(brand_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

alter table iam.service_principals enable row level security;
alter table iam.service_principal_scopes enable row level security;
revoke all on iam.service_principals, iam.service_principal_scopes from public, anon, authenticated;
grant select, insert, update on iam.service_principals, iam.service_principal_scopes to service_role;

create or replace function iam.service_principal_has_scope(
  p_principal_id uuid,
  p_legal_entity_id uuid,
  p_brand_id uuid,
  p_permission text
)
returns boolean
language sql
stable
security invoker
set search_path = pg_catalog, iam
as $$
  select exists (
    select 1
    from iam.service_principals p
    join iam.service_principal_scopes s
      on s.principal_id = p.id and s.legal_entity_id = p.legal_entity_id
    where p.id = p_principal_id
      and p.legal_entity_id = p_legal_entity_id
      and p.status = 'active'
      and p.login_allowed = false
      and p.external_writes_allowed = false
      and s.permission = p_permission
      and (
        (p_brand_id is null and s.brand_id is null)
        or (p_brand_id is not null and (s.brand_id is null or s.brand_id = p_brand_id))
      )
  )
$$;

revoke all on function iam.service_principal_has_scope(uuid, uuid, uuid, text) from public, anon, authenticated;
grant execute on function iam.service_principal_has_scope(uuid, uuid, uuid, text) to service_role;

insert into iam.service_principals (
  id, legal_entity_id, key, display_name, purpose, status,
  login_allowed, external_writes_allowed, created_by
) values (
  '41000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'autopilots:health-monitor',
  'Autopilots Health Monitor',
  'Read-only product probing and governed health evidence for the Autopilots portfolio.',
  'active', false, false,
  '40000000-0000-4000-8000-000000000001'
)
on conflict (id) do update set
  display_name = excluded.display_name,
  purpose = excluded.purpose,
  status = excluded.status,
  login_allowed = false,
  external_writes_allowed = false,
  updated_at = now();

insert into iam.service_principal_scopes (
  id, principal_id, legal_entity_id, brand_id, permission
) values
  ('51000000-0000-4000-8000-000000000001', '41000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null, 'monitoring.health.write'),
  ('51000000-0000-4000-8000-000000000002', '41000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null, 'monitoring.lease.manage'),
  ('51000000-0000-4000-8000-000000000003', '41000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null, 'monitoring.freshness.read')
on conflict (id) do nothing;

alter table integration.monitoring_runs
  add column authority_principal_id uuid references iam.service_principals(id) on delete restrict;
alter table integration.monitoring_runs alter column authority_profile_id drop not null;
alter table integration.monitoring_runs drop constraint monitoring_runs_lease_key_bucket_key;
alter table integration.monitoring_runs
  add constraint monitoring_runs_legal_lease_bucket_key unique (legal_entity_id, lease_key, bucket);
alter table integration.monitoring_runs
  add constraint monitoring_runs_single_authority_check
  check (num_nonnulls(authority_profile_id, authority_principal_id) = 1) not valid;
alter table integration.monitoring_runs validate constraint monitoring_runs_single_authority_check;

create or replace function public.autopilots_record_product_health(
  p_profile_id uuid,
  p_brand_slug text,
  p_status text,
  p_error_code text,
  p_summary text,
  p_observed_at timestamptz,
  p_observation_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, integration, audit
as $$
declare
  v_brand core.brands%rowtype;
  v_connection integration.connections%rowtype;
  v_principal iam.service_principals%rowtype;
  v_event_id uuid;
  v_incident integration.incidents%rowtype;
  v_severity text;
  v_human_authority boolean := false;
  v_authority_type text;
  v_actor_id text;
  v_source text;
begin
  if p_status not in ('healthy', 'degraded', 'unavailable', 'expired', 'blocked', 'unknown') then
    raise exception 'invalid health status' using errcode = '22023';
  end if;
  if p_status <> 'healthy' and coalesce(p_error_code, '') !~ '^[A-Z][A-Z0-9_]{2,119}$' then
    raise exception 'stable error code required' using errcode = '22023';
  end if;
  if coalesce(p_summary, '') = '' or length(p_summary) > 240 then
    raise exception 'bounded summary required' using errcode = '22023';
  end if;
  if coalesce(p_observation_key, '') !~ '^[A-Za-z0-9:_-]{8,160}$' then
    raise exception 'invalid observation key' using errcode = '22023';
  end if;
  if p_observed_at > now() + interval '5 minutes' or p_observed_at < now() - interval '24 hours' then
    raise exception 'observation timestamp outside accepted window' using errcode = '22023';
  end if;

  select b.* into v_brand
  from core.brands b
  where b.slug = p_brand_slug and b.status <> 'archived';
  if not found then raise exception 'operating brand not found' using errcode = 'P0002'; end if;

  select exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active' and m.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and (m.brand_id is null or m.brand_id = v_brand.id)
      and m.role in ('owner', 'admin', 'operator')
  ) into v_human_authority;

  if v_human_authority then
    v_authority_type := 'profile';
    v_actor_id := p_profile_id::text;
    v_source := 'autopilots-control-plane';
  else
    select p.* into v_principal from iam.service_principals p where p.id = p_profile_id;
    if not iam.service_principal_has_scope(
      p_profile_id, v_brand.legal_entity_id, v_brand.id, 'monitoring.health.write'
    ) then
      raise exception 'active monitoring authority required' using errcode = '42501';
    end if;
    v_authority_type := 'service_principal';
    v_actor_id := v_principal.key;
    v_source := v_principal.key;
  end if;

  select c.* into v_connection
  from integration.connections c
  join integration.connector_definitions d on d.id = c.connector_definition_id
  join core.environments e on e.id = c.environment_id and e.brand_id = c.brand_id
  where c.brand_id = v_brand.id and d.key = 'product_api' and e.kind = 'sandbox';
  if not found then raise exception 'product connector not found' using errcode = 'P0002'; end if;

  v_severity := case p_status when 'unavailable' then 'P1' when 'degraded' then 'P2' when 'healthy' then 'P3' else 'P2' end;

  insert into integration.health_events (
    connection_id, brand_id, status, error_code, severity, summary, details,
    observed_at, observation_key
  ) values (
    v_connection.id, v_brand.id, p_status,
    case when p_status = 'healthy' then null else p_error_code end,
    v_severity, p_summary,
    jsonb_build_object(
      'contract', 'autopilots.product-health.v1',
      'sourceQuality', 'live_readonly_probe',
      'authorityType', v_authority_type,
      'externalWrites', false
    ),
    p_observed_at, p_observation_key
  )
  on conflict (connection_id, observation_key) where observation_key is not null do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select h.id into v_event_id from integration.health_events h
    where h.connection_id = v_connection.id and h.observation_key = p_observation_key;
    return jsonb_build_object('eventId', v_event_id, 'replayed', true, 'incident', null);
  end if;

  if p_status = 'healthy' then
    update integration.incidents i
    set status = 'resolved', last_observed_at = p_observed_at, updated_at = now(),
        context = i.context || jsonb_build_object('resolvedByObservationId', v_event_id)
    where i.brand_id = v_brand.id and i.connection_id = v_connection.id
      and i.status in ('open', 'acknowledged', 'mitigating');
  else
    insert into integration.incidents (
      brand_id, connection_id, code, severity, status, title, impact,
      retryable, occurrence_count, first_observed_at, last_observed_at,
      runbook_reference, context
    ) values (
      v_brand.id, v_connection.id, p_error_code, v_severity, 'open',
      v_brand.name || ' vraagt aandacht', p_summary, true, 1,
      p_observed_at, p_observed_at,
      'docs/runbooks/deployments/AP-INT-20260803-001.md',
      jsonb_build_object('lastObservationId', v_event_id, 'sourceQuality', 'live_readonly_probe')
    )
    on conflict (brand_id, connection_id, code) where status in ('open', 'acknowledged', 'mitigating')
    do update set
      severity = excluded.severity,
      occurrence_count = integration.incidents.occurrence_count + 1,
      last_observed_at = excluded.last_observed_at,
      impact = excluded.impact,
      context = integration.incidents.context || excluded.context,
      updated_at = now()
    returning * into v_incident;
  end if;

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, evidence, source
  ) values (
    v_brand.legal_entity_id, v_brand.id, v_connection.environment_id,
    case when v_human_authority then 'user' else 'system' end,
    v_actor_id, 'product.health_observed', 'health_event', v_event_id::text,
    'R0', 'succeeded', jsonb_build_array(jsonb_build_object(
      'observationKey', p_observation_key,
      'status', p_status,
      'incidentId', v_incident.id,
      'authorityType', v_authority_type,
      'externalWrites', false
    )), v_source
  );

  return jsonb_build_object(
    'eventId', v_event_id,
    'replayed', false,
    'incident', case when v_incident.id is null then null else jsonb_build_object(
      'id', v_incident.id,
      'status', v_incident.status,
      'severity', v_incident.severity,
      'code', v_incident.code,
      'contextVersion', v_incident.occurrence_count
    ) end
  );
end;
$$;

create or replace function public.autopilots_claim_monitoring_run_v2(
  p_principal_id uuid,
  p_lease_key text,
  p_bucket bigint,
  p_holder_id uuid,
  p_interval_seconds integer,
  p_lease_seconds integer
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, integration
as $$
declare
  v_principal iam.service_principals%rowtype;
  v_run integration.monitoring_runs%rowtype;
  v_claimed boolean := false;
  v_reason text;
begin
  if coalesce(p_lease_key, '') !~ '^[a-z][a-z0-9:_-]{7,119}$'
    or p_bucket < 0 or p_interval_seconds not between 60 and 3600
    or p_lease_seconds not between 30 and 600 then
    raise exception 'invalid monitoring lease request' using errcode = '22023';
  end if;
  select p.* into v_principal from iam.service_principals p where p.id = p_principal_id;
  if not found or not iam.service_principal_has_scope(
    p_principal_id, v_principal.legal_entity_id, null, 'monitoring.lease.manage'
  ) then
    raise exception 'monitoring service principal required' using errcode = '42501';
  end if;

  insert into integration.monitoring_runs (
    legal_entity_id, authority_profile_id, authority_principal_id, lease_key,
    bucket, holder_id, run_status, interval_seconds, lease_expires_at
  ) values (
    v_principal.legal_entity_id, null, p_principal_id, p_lease_key,
    p_bucket, p_holder_id, 'running', p_interval_seconds,
    now() + make_interval(secs => p_lease_seconds)
  )
  on conflict (legal_entity_id, lease_key, bucket) do nothing
  returning * into v_run;

  if found then
    v_claimed := true;
    v_reason := 'claimed';
  else
    select * into strict v_run from integration.monitoring_runs
    where legal_entity_id = v_principal.legal_entity_id
      and lease_key = p_lease_key and bucket = p_bucket for update;
    if v_run.run_status = 'running' and v_run.lease_expires_at <= now() then
      update integration.monitoring_runs
      set holder_id = p_holder_id,
          authority_profile_id = null,
          authority_principal_id = p_principal_id,
          interval_seconds = p_interval_seconds,
          lease_expires_at = now() + make_interval(secs => p_lease_seconds),
          heartbeat_at = now(), claimed_at = now(),
          attempt_count = attempt_count + 1, updated_at = now()
      where id = v_run.id returning * into v_run;
      v_claimed := true;
      v_reason := 'expired_lease_recovered';
    elsif v_run.run_status = 'running' then
      v_reason := 'lease_active';
    else
      v_reason := 'bucket_completed';
    end if;
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.monitoring-lease.v2',
    'claimed', v_claimed, 'reason', v_reason, 'runId', v_run.id,
    'bucket', v_run.bucket, 'status', v_run.run_status,
    'attemptCount', v_run.attempt_count,
    'leaseExpiresAt', v_run.lease_expires_at,
    'authority', v_principal.key, 'externalWrites', false
  );
end;
$$;

create or replace function public.autopilots_heartbeat_monitoring_run_v2(
  p_principal_id uuid,
  p_run_id uuid,
  p_holder_id uuid,
  p_lease_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public, iam, integration
as $$
declare
  v_updated integer;
  v_legal_entity_id uuid;
begin
  if p_lease_seconds not between 30 and 600 then
    raise exception 'invalid monitoring heartbeat' using errcode = '22023';
  end if;
  select p.legal_entity_id into v_legal_entity_id from iam.service_principals p where p.id = p_principal_id;
  if not found or not iam.service_principal_has_scope(
    p_principal_id, v_legal_entity_id, null, 'monitoring.lease.manage'
  ) then
    raise exception 'monitoring service principal required' using errcode = '42501';
  end if;
  update integration.monitoring_runs
  set heartbeat_at = now(), lease_expires_at = now() + make_interval(secs => p_lease_seconds), updated_at = now()
  where id = p_run_id and authority_principal_id = p_principal_id
    and holder_id = p_holder_id and run_status = 'running';
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.autopilots_complete_monitoring_run_v2(
  p_principal_id uuid,
  p_run_id uuid,
  p_holder_id uuid,
  p_outcome text,
  p_counts jsonb,
  p_error_code text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, iam, integration, audit
as $$
declare
  v_principal iam.service_principals%rowtype;
  v_run integration.monitoring_runs%rowtype;
  v_key text;
begin
  select p.* into v_principal from iam.service_principals p where p.id = p_principal_id;
  if not found or not iam.service_principal_has_scope(
    p_principal_id, v_principal.legal_entity_id, null, 'monitoring.lease.manage'
  ) then
    raise exception 'monitoring service principal required' using errcode = '42501';
  end if;
  if p_outcome not in ('succeeded', 'partial', 'failed')
    or jsonb_typeof(p_counts) <> 'object'
    or exists (select 1 from jsonb_object_keys(p_counts) as key where key not in ('healthy', 'degraded', 'unavailable', 'failed'))
    or exists (select 1 from jsonb_each_text(p_counts) as item where item.value !~ '^[0-9]{1,6}$')
    or (p_error_code is not null and p_error_code !~ '^[A-Z][A-Z0-9_]{2,119}$') then
    raise exception 'invalid monitoring completion' using errcode = '22023';
  end if;
  foreach v_key in array array['healthy', 'degraded', 'unavailable', 'failed'] loop
    if not (p_counts ? v_key) then raise exception 'complete monitoring counts required' using errcode = '22023'; end if;
  end loop;

  update integration.monitoring_runs
  set run_status = p_outcome, counts = p_counts, error_code = p_error_code,
      completed_at = now(), heartbeat_at = now(), updated_at = now()
  where id = p_run_id and authority_principal_id = p_principal_id
    and holder_id = p_holder_id and run_status = 'running'
  returning * into v_run;
  if not found then raise exception 'monitoring lease lost' using errcode = 'P0001'; end if;

  insert into audit.events (
    legal_entity_id, actor_type, actor_id, action, entity_type, entity_id,
    risk_class, result, evidence, source
  ) values (
    v_run.legal_entity_id, 'system', v_principal.key,
    'monitoring.run_completed', 'monitoring_run', v_run.id::text,
    'R0', case when p_outcome = 'failed' then 'failed' else 'succeeded' end,
    jsonb_build_array(jsonb_build_object(
      'leaseKey', v_run.lease_key, 'bucket', v_run.bucket,
      'attemptCount', v_run.attempt_count, 'outcome', p_outcome,
      'counts', p_counts, 'authorityType', 'service_principal',
      'externalWrites', false
    )), v_principal.key
  );
  return jsonb_build_object(
    'contract', 'autopilots.monitoring-run.v2',
    'runId', v_run.id, 'status', v_run.run_status,
    'completedAt', v_run.completed_at, 'counts', v_run.counts,
    'authority', v_principal.key, 'externalWrites', false
  );
end;
$$;

create or replace function public.autopilots_monitoring_freshness_v2(
  p_principal_id uuid,
  p_stale_after_seconds integer
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = pg_catalog, public, core, iam, integration
as $$
declare
  v_principal iam.service_principals%rowtype;
  v_last_run integration.monitoring_runs%rowtype;
  v_brands jsonb;
begin
  if p_stale_after_seconds not between 60 and 86400 then
    raise exception 'invalid freshness threshold' using errcode = '22023';
  end if;
  select p.* into v_principal from iam.service_principals p where p.id = p_principal_id;
  if not found or not iam.service_principal_has_scope(
    p_principal_id, v_principal.legal_entity_id, null, 'monitoring.freshness.read'
  ) then
    raise exception 'monitoring service principal required' using errcode = '42501';
  end if;
  select * into v_last_run from integration.monitoring_runs
  where legal_entity_id = v_principal.legal_entity_id and run_status <> 'running'
  order by completed_at desc nulls last limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'brand', scoped.slug,
    'status', case when scoped.observed_at is null then 'never_observed'
      when scoped.observed_at < now() - make_interval(secs => p_stale_after_seconds) then 'stale' else 'fresh' end,
    'lastObservedAt', scoped.observed_at,
    'ageSeconds', case when scoped.observed_at is null then null
      else greatest(0, floor(extract(epoch from now() - scoped.observed_at)))::bigint end,
    'staleAfterSeconds', p_stale_after_seconds
  ) order by scoped.slug), '[]'::jsonb) into v_brands
  from (
    select b.slug, latest.observed_at
    from core.brands b
    join integration.connections c on c.brand_id = b.id
    join integration.connector_definitions d on d.id = c.connector_definition_id and d.key = 'product_api'
    join core.environments e on e.id = c.environment_id and e.kind = 'sandbox'
    left join lateral (
      select h.observed_at from integration.health_events h
      where h.connection_id = c.id order by h.observed_at desc limit 1
    ) latest on true
    where b.legal_entity_id = v_principal.legal_entity_id and b.status <> 'archived'
  ) scoped;

  return jsonb_build_object(
    'contract', 'autopilots.monitoring-freshness.v2',
    'lastRun', case when v_last_run.id is null then null else jsonb_build_object(
      'runId', v_last_run.id, 'status', v_last_run.run_status,
      'completedAt', v_last_run.completed_at, 'counts', v_last_run.counts,
      'attemptCount', v_last_run.attempt_count
    ) end,
    'brands', v_brands, 'staleAfterSeconds', p_stale_after_seconds,
    'authority', v_principal.key, 'externalWrites', false
  );
end;
$$;

insert into audit.events (
  id, legal_entity_id, actor_type, actor_id, action, entity_type, entity_id,
  risk_class, result, reason, after_value, evidence, source
) values (
  '81000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  'system', 'autopilots-control-plane-migration', 'iam.service_principal.created',
  'service_principal', '41000000-0000-4000-8000-000000000001',
  'R2', 'succeeded', 'Dedicated least-privilege monitoring identity under Werktoestemming A.',
  jsonb_build_object(
    'key', 'autopilots:health-monitor', 'loginAllowed', false,
    'externalWritesAllowed', false, 'scopeCount', 3
  ),
  jsonb_build_array('user_consent:werktoestemming_a', 'change:AP-IAM-20260803-004'),
  'authorized_migration'
)
on conflict (id) do nothing;

revoke execute on function public.autopilots_claim_monitoring_run(uuid, text, bigint, uuid, integer, integer) from service_role;
revoke execute on function public.autopilots_heartbeat_monitoring_run(uuid, uuid, integer) from service_role;
revoke execute on function public.autopilots_complete_monitoring_run(uuid, uuid, text, jsonb, text) from service_role;
revoke execute on function public.autopilots_monitoring_freshness(uuid, integer) from service_role;

revoke all on function public.autopilots_claim_monitoring_run_v2(uuid, text, bigint, uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.autopilots_heartbeat_monitoring_run_v2(uuid, uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.autopilots_complete_monitoring_run_v2(uuid, uuid, uuid, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.autopilots_monitoring_freshness_v2(uuid, integer) from public, anon, authenticated;
grant execute on function public.autopilots_claim_monitoring_run_v2(uuid, text, bigint, uuid, integer, integer) to service_role;
grant execute on function public.autopilots_heartbeat_monitoring_run_v2(uuid, uuid, uuid, integer) to service_role;
grant execute on function public.autopilots_complete_monitoring_run_v2(uuid, uuid, uuid, text, jsonb, text) to service_role;
grant execute on function public.autopilots_monitoring_freshness_v2(uuid, integer) to service_role;

commit;
