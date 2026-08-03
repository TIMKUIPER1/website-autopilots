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
  )
  select jsonb_build_object(
    'contract', 'autopilots.portfolio.v1',
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
        'financialQuality', 'unavailable'
      ) order by b.name), '[]'::jsonb)
      from scoped_brands b
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
