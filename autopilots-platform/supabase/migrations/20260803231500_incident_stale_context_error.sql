begin;

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
    raise exception 'stale incident context' using errcode = 'P0001';
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

revoke all on function public.autopilots_acknowledge_incident(uuid, uuid, bigint, text) from public, anon, authenticated;
grant execute on function public.autopilots_acknowledge_incident(uuid, uuid, bigint, text) to service_role;

commit;
