begin;

create or replace function public.autopilots_portfolio_snapshot(
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
  v_result jsonb;
begin
  if not exists (
    select 1 from iam.profiles p
    where p.id = p_profile_id and p.status = 'active'
  ) then
    raise exception 'active profile required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from iam.memberships m
    where m.profile_id = p_profile_id
      and m.legal_entity_id = p_legal_entity_id
      and m.status = 'active'
  ) then
    raise exception 'legal entity access denied' using errcode = '42501';
  end if;

  if not exists (
    select 1 from core.legal_entities le
    where le.id = p_legal_entity_id and le.status <> 'archived'
  ) then
    raise exception 'legal entity not found' using errcode = 'P0002';
  end if;

  with scoped_brands as (
    select b.*
    from core.brands b
    where b.legal_entity_id = p_legal_entity_id
      and b.status <> 'retired'
      and exists (
        select 1 from iam.memberships m
        where m.profile_id = p_profile_id
          and m.legal_entity_id = b.legal_entity_id
          and m.status = 'active'
          and (m.brand_id is null or m.brand_id = b.id)
      )
  ), scoped_connections as (
    select c.*
    from integration.connections c
    join scoped_brands b on b.id = c.brand_id
  ), source_rows as (
    select
      d.key as provider,
      d.category as data_class,
      d.display_name as authority,
      case
        when bool_and(c.status = 'connected') then 'connected'
        when bool_or(c.status in ('degraded', 'expired', 'revoked', 'blocked')) then 'blocked'
        else 'pending'
      end as status,
      case when bool_and(c.status = 'connected') then 'current' else 'blocked_missing_connection' end as reconciliation_status
    from scoped_connections c
    join integration.connector_definitions d on d.id = c.connector_definition_id
    group by d.key, d.category, d.display_name
  ), latest_runs as (
    select distinct on (r.brand_id) r.*
    from integration.onboarding_runs r
    join scoped_brands b on b.id = r.brand_id
    where r.template_key = 'software_launch_v1'
    order by r.brand_id, r.template_version desc
  ), brand_readiness as (
    select
      b.id as brand_id,
      r.id as run_id,
      r.status as run_status,
      r.current_step_key,
      count(s.id)::int as total_steps,
      count(s.id) filter (where s.status = 'completed')::int as completed_steps,
      count(s.id) filter (where s.status in ('blocked', 'validation_required'))::int as attention_steps,
      count(s.id) filter (where s.status = 'blocked')::int as blocked_steps,
      case when count(s.id) = 0 then 0
        else round(100.0 * count(s.id) filter (where s.status = 'completed') / count(s.id))::int
      end as progress_percent
    from scoped_brands b
    left join latest_runs r on r.brand_id = b.id
    left join integration.onboarding_steps s on s.run_id = r.id
    group by b.id, r.id, r.status, r.current_step_key
  ), request_counts as (
    select
      b.id as brand_id,
      count(cr.id) filter (where cr.request_status = 'approval_required')::int as approval_required,
      count(cr.id) filter (where cr.request_status = 'approved')::int as approved_intents
    from scoped_brands b
    left join integration.connector_requests cr on cr.brand_id = b.id
    group by b.id
  )
  select jsonb_build_object(
    'contract', 'autopilots.portfolio.v2',
    'scope', jsonb_build_object(
      'type', 'portfolio',
      'legalEntityId', le.id,
      'environment', 'sandbox'
    ),
    'legalEntity', jsonb_build_object(
      'id', le.id,
      'slug', le.slug,
      'legalName', le.legal_name,
      'baseCurrency', le.base_currency,
      'status', le.status
    ),
    'brands', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', b.id,
        'legalEntityId', b.legal_entity_id,
        'slug', b.slug,
        'name', b.name,
        'code', b.code,
        'status', b.status,
        'customerCount', 0,
        'goalCount', 0,
        'openExceptionCount', (
          select count(*) from integration.incidents i
          where i.brand_id = b.id and i.status in ('open', 'acknowledged', 'mitigating')
        ),
        'connectedSourceCount', (
          select count(*) from scoped_connections c
          where c.brand_id = b.id and c.status = 'connected'
        ),
        'financialQuality', 'unavailable',
        'onboarding', jsonb_build_object(
          'runId', br.run_id,
          'runStatus', br.run_status,
          'currentStepKey', br.current_step_key,
          'totalSteps', br.total_steps,
          'completedSteps', br.completed_steps,
          'attentionSteps', br.attention_steps,
          'blockedSteps', br.blocked_steps,
          'approvalRequired', rc.approval_required,
          'approvedIntents', rc.approved_intents,
          'progressPercent', br.progress_percent,
          'status', case
            when br.total_steps > 0 and br.completed_steps = br.total_steps then 'ready'
            when br.attention_steps > 0 then 'attention'
            when br.completed_steps > 0 then 'in_progress'
            else 'not_started'
          end,
          'nextAction', (
            select jsonb_build_object(
              'key', s.step_key,
              'title', s.title,
              'status', s.status,
              'riskClass', s.risk_class,
              'errorCode', s.error_code,
              'authorizationRequired', coalesce((s.configuration ->> 'authorization_required')::boolean, false)
            )
            from integration.onboarding_steps s
            where s.run_id = br.run_id and s.status not in ('completed', 'skipped')
            order by s.position
            limit 1
          ),
          'providerAuthorizationEnabled', false,
          'externalWritesEnabled', false
        )
      ) order by b.name), '[]'::jsonb)
      from scoped_brands b
      join brand_readiness br on br.brand_id = b.id
      join request_counts rc on rc.brand_id = b.id
    ),
    'launchReadiness', jsonb_build_object(
      'totalSteps', (select coalesce(sum(total_steps), 0) from brand_readiness),
      'completedSteps', (select coalesce(sum(completed_steps), 0) from brand_readiness),
      'attentionSteps', (select coalesce(sum(attention_steps), 0) from brand_readiness),
      'blockedSteps', (select coalesce(sum(blocked_steps), 0) from brand_readiness),
      'approvalRequired', (select coalesce(sum(approval_required), 0) from request_counts),
      'approvedIntents', (select coalesce(sum(approved_intents), 0) from request_counts),
      'brandsReady', (select count(*) from brand_readiness where total_steps > 0 and completed_steps = total_steps),
      'providerAuthorizationEnabled', false,
      'externalWritesEnabled', false
    ),
    'ownerExceptions', '[]'::jsonb,
    'dataHealth', jsonb_build_object(
      'totalSources', (select count(*) from scoped_connections),
      'healthy', (select count(*) from scoped_connections where status = 'connected'),
      'blocked', (select count(*) from scoped_connections where status <> 'connected'),
      'unknown', (select count(*) from scoped_connections where status in ('pending', 'authorizing'))
    ),
    'sourceOfTruth', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'provider', s.provider,
        'dataClass', s.data_class,
        'authority', s.authority,
        'status', s.status,
        'freshnessExpectation', 'registered health + live read-only probe',
        'reconciliationStatus', s.reconciliation_status
      ) order by s.provider), '[]'::jsonb)
      from source_rows s
    ),
    'sourceQuality', 'durable_control_plane',
    'generatedAt', now(),
    'demoMode', false,
    'externalWrites', false
  ) into v_result
  from core.legal_entities le
  where le.id = p_legal_entity_id;

  return v_result;
end;
$$;

revoke all on function public.autopilots_portfolio_snapshot(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_portfolio_snapshot(uuid, uuid) to service_role;

commit;
