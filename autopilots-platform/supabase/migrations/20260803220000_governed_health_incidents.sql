begin;

alter table integration.health_events
  add column if not exists observation_key text;

create unique index if not exists health_events_connection_observation_uidx
  on integration.health_events (connection_id, observation_key)
  where observation_key is not null;

create unique index if not exists incidents_active_dedupe_uidx
  on integration.incidents (brand_id, connection_id, code)
  where status in ('open', 'acknowledged', 'mitigating');

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
  v_event_id uuid;
  v_incident integration.incidents%rowtype;
  v_severity text;
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

  if not exists (
    select 1
    from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id
      and p.status = 'active'
      and m.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and (m.brand_id is null or m.brand_id = v_brand.id)
      and m.role in ('owner', 'admin', 'operator')
  ) then
    raise exception 'active operator membership required' using errcode = '42501';
  end if;

  select c.* into v_connection
  from integration.connections c
  join integration.connector_definitions d on d.id = c.connector_definition_id
  join core.environments e on e.id = c.environment_id and e.brand_id = c.brand_id
  where c.brand_id = v_brand.id
    and d.key = 'product_api'
    and e.kind = 'sandbox';
  if not found then raise exception 'product connector not found' using errcode = 'P0002'; end if;

  v_severity := case p_status when 'unavailable' then 'P1' when 'degraded' then 'P2' when 'healthy' then 'P3' else 'P2' end;

  insert into integration.health_events (
    connection_id, brand_id, status, error_code, severity, summary, details,
    observed_at, observation_key
  ) values (
    v_connection.id, v_brand.id, p_status,
    case when p_status = 'healthy' then null else p_error_code end,
    v_severity, p_summary,
    jsonb_build_object('contract', 'autopilots.product-health.v1', 'sourceQuality', 'live_readonly_probe', 'externalWrites', false),
    p_observed_at, p_observation_key
  )
  on conflict (connection_id, observation_key) where observation_key is not null do nothing
  returning id into v_event_id;

  if v_event_id is null then
    select h.id into v_event_id
    from integration.health_events h
    where h.connection_id = v_connection.id and h.observation_key = p_observation_key;
    return jsonb_build_object('eventId', v_event_id, 'replayed', true, 'incident', null);
  end if;

  if p_status = 'healthy' then
    update integration.incidents i
    set status = 'resolved',
        last_observed_at = p_observed_at,
        updated_at = now(),
        context = i.context || jsonb_build_object('resolvedByObservationId', v_event_id)
    where i.brand_id = v_brand.id
      and i.connection_id = v_connection.id
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
    'system', 'autopilots-health-monitor', 'product.health_observed',
    'health_event', v_event_id::text, 'R0', 'succeeded',
    jsonb_build_array(jsonb_build_object('observationKey', p_observation_key, 'status', p_status, 'incidentId', v_incident.id)),
    'autopilots-health-monitor'
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

create or replace function public.autopilots_acknowledge_incident(
  p_profile_id uuid,
  p_incident_id uuid,
  p_context_version bigint,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, integration, workflow, ledger, audit
as $$
declare
  v_incident integration.incidents%rowtype;
  v_brand core.brands%rowtype;
  v_environment core.environments%rowtype;
  v_command_id uuid;
  v_existing workflow.commands%rowtype;
begin
  if coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9:_-]{8,160}$' then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  select i.* into v_incident from integration.incidents i where i.id = p_incident_id for update;
  if not found then raise exception 'incident not found' using errcode = 'P0002'; end if;
  select b.* into strict v_brand from core.brands b where b.id = v_incident.brand_id;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and (m.brand_id is null or m.brand_id = v_brand.id)
      and m.role in ('owner', 'admin', 'operator')
  ) then
    raise exception 'active operator membership required' using errcode = '42501';
  end if;
  if v_incident.status not in ('open', 'acknowledged') then
    raise exception 'incident cannot be acknowledged' using errcode = '55000';
  end if;
  if v_incident.occurrence_count <> p_context_version then
    raise exception 'stale incident context' using errcode = '40001';
  end if;

  select e.* into strict v_environment
  from core.environments e where e.brand_id = v_brand.id and e.kind = 'sandbox';

  insert into workflow.commands (
    brand_id, environment_id, actor_profile_id, command_type, risk_class,
    idempotency_key, status, context_version, payload, result, completed_at
  ) values (
    v_brand.id, v_environment.id, p_profile_id, 'incident.acknowledge', 'R1',
    p_idempotency_key, 'succeeded', p_context_version,
    jsonb_build_object('incidentId', p_incident_id),
    jsonb_build_object('status', 'acknowledged'), now()
  )
  on conflict (brand_id, environment_id, idempotency_key) do nothing
  returning id into v_command_id;

  if v_command_id is null then
    select c.* into strict v_existing from workflow.commands c
    where c.brand_id = v_brand.id and c.environment_id = v_environment.id and c.idempotency_key = p_idempotency_key;
    if v_existing.command_type <> 'incident.acknowledge'
      or v_existing.context_version <> p_context_version
      or v_existing.payload <> jsonb_build_object('incidentId', p_incident_id) then
      raise exception 'idempotency key reused with different command' using errcode = '23505';
    end if;
    return jsonb_build_object('commandId', v_existing.id, 'incidentId', p_incident_id, 'status', 'acknowledged', 'replayed', true);
  end if;

  update integration.incidents
  set status = 'acknowledged', owner_profile_id = p_profile_id, updated_at = now()
  where id = p_incident_id;

  insert into ledger.usage_entries (
    legal_entity_id, brand_id, environment_id, provider, metric, quantity, unit,
    total_cost_minor, currency, quality, source_reference, idempotency_key, occurred_at
  ) values (
    v_brand.legal_entity_id, v_brand.id, v_environment.id,
    'autopilots-control-plane', 'governed_command', 1, 'command',
    0, 'EUR', 'measured', v_command_id::text, 'usage:' || p_idempotency_key, now()
  );

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, evidence, source
  ) values (
    v_brand.legal_entity_id, v_brand.id, v_environment.id,
    'user', p_profile_id::text, 'incident.acknowledge', 'incident', p_incident_id::text,
    'R1', 'succeeded', jsonb_build_array(jsonb_build_object('commandId', v_command_id, 'contextVersion', p_context_version)),
    'autopilots-control-plane'
  );

  return jsonb_build_object('commandId', v_command_id, 'incidentId', p_incident_id, 'status', 'acknowledged', 'replayed', false);
end;
$$;

revoke all on function public.autopilots_record_product_health(uuid, text, text, text, text, timestamptz, text) from public, anon, authenticated;
revoke all on function public.autopilots_acknowledge_incident(uuid, uuid, bigint, text) from public, anon, authenticated;
grant execute on function public.autopilots_record_product_health(uuid, text, text, text, text, timestamptz, text) to service_role;
grant execute on function public.autopilots_acknowledge_incident(uuid, uuid, bigint, text) to service_role;

commit;
