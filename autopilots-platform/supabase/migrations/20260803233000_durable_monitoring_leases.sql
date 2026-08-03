begin;

create table if not exists integration.monitoring_runs (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  authority_profile_id uuid not null references iam.profiles(id) on delete restrict,
  lease_key text not null,
  bucket bigint not null check (bucket >= 0),
  holder_id uuid not null,
  run_status text not null check (run_status in ('running', 'succeeded', 'partial', 'failed')),
  interval_seconds integer not null check (interval_seconds between 60 and 3600),
  lease_expires_at timestamptz not null,
  claimed_at timestamptz not null default now(),
  heartbeat_at timestamptz not null default now(),
  completed_at timestamptz,
  attempt_count integer not null default 1 check (attempt_count > 0),
  counts jsonb not null default '{"healthy":0,"degraded":0,"unavailable":0,"failed":0}'::jsonb,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (lease_key, bucket),
  check (lease_key ~ '^[a-z][a-z0-9:_-]{7,119}$'),
  check (error_code is null or error_code ~ '^[A-Z][A-Z0-9_]{2,119}$'),
  check (jsonb_typeof(counts) = 'object')
);

create index if not exists monitoring_runs_recent_idx
  on integration.monitoring_runs (lease_key, claimed_at desc);

alter table integration.monitoring_runs enable row level security;
revoke all on integration.monitoring_runs from public, anon, authenticated;
grant select, insert, update on integration.monitoring_runs to service_role;

create or replace function public.autopilots_claim_monitoring_run(
  p_authority_profile_id uuid,
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
  v_legal_entity_id uuid;
  v_run integration.monitoring_runs%rowtype;
  v_claimed boolean := false;
  v_reason text;
begin
  if coalesce(p_lease_key, '') !~ '^[a-z][a-z0-9:_-]{7,119}$'
    or p_bucket < 0
    or p_interval_seconds not between 60 and 3600
    or p_lease_seconds not between 30 and 600 then
    raise exception 'invalid monitoring lease request' using errcode = '22023';
  end if;

  select m.legal_entity_id into v_legal_entity_id
  from iam.profiles p
  join iam.memberships m on m.profile_id = p.id
  where p.id = p_authority_profile_id
    and p.status = 'active'
    and m.status = 'active'
    and m.brand_id is null
    and m.role in ('owner', 'admin', 'operator')
  order by m.created_at
  limit 1;
  if not found then
    raise exception 'portfolio monitoring authority required' using errcode = '42501';
  end if;

  insert into integration.monitoring_runs (
    legal_entity_id, authority_profile_id, lease_key, bucket, holder_id,
    run_status, interval_seconds, lease_expires_at
  ) values (
    v_legal_entity_id, p_authority_profile_id, p_lease_key, p_bucket, p_holder_id,
    'running', p_interval_seconds, now() + make_interval(secs => p_lease_seconds)
  )
  on conflict (lease_key, bucket) do nothing
  returning * into v_run;

  if found then
    v_claimed := true;
    v_reason := 'claimed';
  else
    select * into strict v_run
    from integration.monitoring_runs
    where lease_key = p_lease_key and bucket = p_bucket
    for update;

    if v_run.run_status = 'running' and v_run.lease_expires_at <= now() then
      update integration.monitoring_runs
      set holder_id = p_holder_id,
          authority_profile_id = p_authority_profile_id,
          legal_entity_id = v_legal_entity_id,
          interval_seconds = p_interval_seconds,
          lease_expires_at = now() + make_interval(secs => p_lease_seconds),
          heartbeat_at = now(),
          claimed_at = now(),
          attempt_count = attempt_count + 1,
          updated_at = now()
      where id = v_run.id
      returning * into v_run;
      v_claimed := true;
      v_reason := 'expired_lease_recovered';
    elsif v_run.run_status = 'running' then
      v_reason := 'lease_active';
    else
      v_reason := 'bucket_completed';
    end if;
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.monitoring-lease.v1',
    'claimed', v_claimed,
    'reason', v_reason,
    'runId', v_run.id,
    'bucket', v_run.bucket,
    'status', v_run.run_status,
    'attemptCount', v_run.attempt_count,
    'leaseExpiresAt', v_run.lease_expires_at,
    'externalWrites', false
  );
end;
$$;

create or replace function public.autopilots_heartbeat_monitoring_run(
  p_run_id uuid,
  p_holder_id uuid,
  p_lease_seconds integer
)
returns boolean
language plpgsql
security invoker
set search_path = pg_catalog, public, integration
as $$
declare
  v_updated integer;
begin
  if p_lease_seconds not between 30 and 600 then
    raise exception 'invalid monitoring heartbeat' using errcode = '22023';
  end if;
  update integration.monitoring_runs
  set heartbeat_at = now(),
      lease_expires_at = now() + make_interval(secs => p_lease_seconds),
      updated_at = now()
  where id = p_run_id and holder_id = p_holder_id and run_status = 'running';
  get diagnostics v_updated = row_count;
  return v_updated = 1;
end;
$$;

create or replace function public.autopilots_complete_monitoring_run(
  p_run_id uuid,
  p_holder_id uuid,
  p_outcome text,
  p_counts jsonb,
  p_error_code text default null
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, integration, audit
as $$
declare
  v_run integration.monitoring_runs%rowtype;
  v_key text;
begin
  if p_outcome not in ('succeeded', 'partial', 'failed')
    or jsonb_typeof(p_counts) <> 'object'
    or exists (
      select 1 from jsonb_object_keys(p_counts) as key
      where key not in ('healthy', 'degraded', 'unavailable', 'failed')
    )
    or exists (
      select 1 from jsonb_each_text(p_counts) as item
      where item.value !~ '^[0-9]{1,6}$'
    )
    or (p_error_code is not null and p_error_code !~ '^[A-Z][A-Z0-9_]{2,119}$') then
    raise exception 'invalid monitoring completion' using errcode = '22023';
  end if;

  foreach v_key in array array['healthy', 'degraded', 'unavailable', 'failed'] loop
    if not (p_counts ? v_key) then
      raise exception 'complete monitoring counts required' using errcode = '22023';
    end if;
  end loop;

  update integration.monitoring_runs
  set run_status = p_outcome,
      counts = p_counts,
      error_code = p_error_code,
      completed_at = now(),
      heartbeat_at = now(),
      updated_at = now()
  where id = p_run_id and holder_id = p_holder_id and run_status = 'running'
  returning * into v_run;
  if not found then
    raise exception 'monitoring lease lost' using errcode = 'P0001';
  end if;

  insert into audit.events (
    legal_entity_id, actor_type, actor_id, action, entity_type, entity_id,
    risk_class, result, evidence, source
  ) values (
    v_run.legal_entity_id, 'system', 'autopilots-health-monitor',
    'monitoring.run_completed', 'monitoring_run', v_run.id::text,
    'R0', case when p_outcome = 'failed' then 'failed' else 'succeeded' end,
    jsonb_build_array(jsonb_build_object(
      'leaseKey', v_run.lease_key,
      'bucket', v_run.bucket,
      'attemptCount', v_run.attempt_count,
      'outcome', p_outcome,
      'counts', p_counts,
      'externalWrites', false
    )),
    'autopilots-health-monitor'
  );

  return jsonb_build_object(
    'contract', 'autopilots.monitoring-run.v1',
    'runId', v_run.id,
    'status', v_run.run_status,
    'completedAt', v_run.completed_at,
    'counts', v_run.counts,
    'externalWrites', false
  );
end;
$$;

create or replace function public.autopilots_monitoring_freshness(
  p_authority_profile_id uuid,
  p_stale_after_seconds integer
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = pg_catalog, public, core, iam, integration
as $$
declare
  v_legal_entity_id uuid;
  v_last_run integration.monitoring_runs%rowtype;
  v_brands jsonb;
begin
  if p_stale_after_seconds not between 60 and 86400 then
    raise exception 'invalid freshness threshold' using errcode = '22023';
  end if;
  select m.legal_entity_id into v_legal_entity_id
  from iam.profiles p
  join iam.memberships m on m.profile_id = p.id
  where p.id = p_authority_profile_id and p.status = 'active'
    and m.status = 'active' and m.brand_id is null
    and m.role in ('owner', 'admin', 'operator')
  order by m.created_at limit 1;
  if not found then
    raise exception 'portfolio monitoring authority required' using errcode = '42501';
  end if;

  select * into v_last_run from integration.monitoring_runs
  where legal_entity_id = v_legal_entity_id and run_status <> 'running'
  order by completed_at desc nulls last limit 1;

  select coalesce(jsonb_agg(jsonb_build_object(
    'brand', scoped.slug,
    'status', case
      when scoped.observed_at is null then 'never_observed'
      when scoped.observed_at < now() - make_interval(secs => p_stale_after_seconds) then 'stale'
      else 'fresh'
    end,
    'lastObservedAt', scoped.observed_at,
    'ageSeconds', case when scoped.observed_at is null then null else greatest(0, floor(extract(epoch from now() - scoped.observed_at)))::bigint end,
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
    where b.legal_entity_id = v_legal_entity_id and b.status <> 'archived'
  ) scoped;

  return jsonb_build_object(
    'contract', 'autopilots.monitoring-freshness.v1',
    'lastRun', case when v_last_run.id is null then null else jsonb_build_object(
      'runId', v_last_run.id,
      'status', v_last_run.run_status,
      'completedAt', v_last_run.completed_at,
      'counts', v_last_run.counts,
      'attemptCount', v_last_run.attempt_count
    ) end,
    'brands', v_brands,
    'staleAfterSeconds', p_stale_after_seconds,
    'externalWrites', false
  );
end;
$$;

revoke all on function public.autopilots_claim_monitoring_run(uuid, text, bigint, uuid, integer, integer) from public, anon, authenticated;
revoke all on function public.autopilots_heartbeat_monitoring_run(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.autopilots_complete_monitoring_run(uuid, uuid, text, jsonb, text) from public, anon, authenticated;
revoke all on function public.autopilots_monitoring_freshness(uuid, integer) from public, anon, authenticated;
grant execute on function public.autopilots_claim_monitoring_run(uuid, text, bigint, uuid, integer, integer) to service_role;
grant execute on function public.autopilots_heartbeat_monitoring_run(uuid, uuid, integer) to service_role;
grant execute on function public.autopilots_complete_monitoring_run(uuid, uuid, text, jsonb, text) to service_role;
grant execute on function public.autopilots_monitoring_freshness(uuid, integer) to service_role;

commit;
