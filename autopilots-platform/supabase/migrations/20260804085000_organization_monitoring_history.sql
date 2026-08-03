begin;

create or replace function public.autopilots_monitoring_history(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, integration
as $$
declare
  v_entity core.legal_entities%rowtype;
begin
  select le.* into v_entity
  from core.legal_entities le
  where le.id = p_legal_entity_id and le.status = 'active';
  if not found then raise exception 'organization not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1
    from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator', 'auditor')
  ) then
    raise exception 'organization monitoring role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.monitoring-history.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'summary', jsonb_build_object(
      'runs24h', (select count(*) from integration.monitoring_runs r
        where r.legal_entity_id = p_legal_entity_id and r.claimed_at >= now() - interval '24 hours'),
      'succeeded24h', (select count(*) from integration.monitoring_runs r
        where r.legal_entity_id = p_legal_entity_id and r.claimed_at >= now() - interval '24 hours'
          and r.run_status = 'succeeded'),
      'attention24h', (select count(*) from integration.monitoring_runs r
        where r.legal_entity_id = p_legal_entity_id and r.claimed_at >= now() - interval '24 hours'
          and r.run_status in ('partial', 'failed')),
      'running', (select count(*) from integration.monitoring_runs r
        where r.legal_entity_id = p_legal_entity_id and r.run_status = 'running'),
      'recoveredLeases24h', (select count(*) from integration.monitoring_runs r
        where r.legal_entity_id = p_legal_entity_id and r.claimed_at >= now() - interval '24 hours'
          and r.attempt_count > 1)
    ),
    'runs', coalesce((select jsonb_agg(jsonb_build_object(
      'runId', recent.id,
      'monitorKey', recent.lease_key,
      'bucket', recent.bucket,
      'status', recent.run_status,
      'counts', recent.counts,
      'errorCode', recent.error_code,
      'attemptCount', recent.attempt_count,
      'leaseRecovered', recent.attempt_count > 1,
      'intervalSeconds', recent.interval_seconds,
      'claimedAt', recent.claimed_at,
      'heartbeatAt', recent.heartbeat_at,
      'completedAt', recent.completed_at,
      'durationMs', case when recent.completed_at is null then null else
        greatest(0, floor(extract(epoch from recent.completed_at - recent.claimed_at) * 1000))::bigint end,
      'authority', case when recent.authority_principal_id is null then 'legacy_human_authority'
        else coalesce(principal.key, 'registered_machine_authority') end
    ) order by recent.claimed_at desc)
    from (
      select r.*
      from integration.monitoring_runs r
      where r.legal_entity_id = p_legal_entity_id
      order by r.claimed_at desc
      limit 20
    ) recent
    left join iam.service_principals principal on principal.id = recent.authority_principal_id), '[]'::jsonb),
    'historyLimit', 20,
    'automaticRemediationEnabled', false,
    'notificationDeliveryEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_monitoring_history(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_monitoring_history(uuid, uuid) to service_role;

commit;
