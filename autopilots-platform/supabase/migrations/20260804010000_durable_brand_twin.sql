begin;

create or replace function public.autopilots_brand_twin(
  p_profile_id uuid,
  p_brand_slug text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, integration, ledger
as $$
declare
  v_brand core.brands%rowtype;
  v_legal core.legal_entities%rowtype;
  v_result jsonb;
begin
  if p_brand_slug !~ '^[a-z][a-z0-9-]{2,62}$' then
    raise exception 'operating brand not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from iam.profiles p
    where p.id = p_profile_id and p.status = 'active'
  ) then
    raise exception 'active profile required' using errcode = '42501';
  end if;

  select b.* into v_brand
  from core.brands b
  where b.slug = p_brand_slug and b.status <> 'retired';
  if not found then
    raise exception 'operating brand not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from iam.memberships m
    where m.profile_id = p_profile_id
      and m.legal_entity_id = v_brand.legal_entity_id
      and m.status = 'active'
      and (m.brand_id is null or m.brand_id = v_brand.id)
  ) then
    raise exception 'brand access denied' using errcode = '42501';
  end if;

  select le.* into strict v_legal
  from core.legal_entities le
  where le.id = v_brand.legal_entity_id and le.status <> 'archived';

  select jsonb_build_object(
    'contract', 'autopilots.brand-twin.v1',
    'scope', jsonb_build_object(
      'type', 'operating_brand',
      'legalEntityId', v_legal.id,
      'brandId', v_brand.id,
      'environment', 'sandbox'
    ),
    'legalEntity', jsonb_build_object(
      'id', v_legal.id,
      'slug', v_legal.slug,
      'legalName', v_legal.legal_name,
      'baseCurrency', v_legal.base_currency,
      'status', v_legal.status
    ),
    'brand', jsonb_build_object(
      'id', v_brand.id,
      'legalEntityId', v_brand.legal_entity_id,
      'slug', v_brand.slug,
      'name', v_brand.name,
      'code', v_brand.code,
      'status', v_brand.status,
      'riskProfile', v_brand.risk_profile
    ),
    'goals', '[]'::jsonb,
    'products', '[]'::jsonb,
    'customers', '[]'::jsonb,
    'lifecycles', '[]'::jsonb,
    'integrations', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', c.id,
        'provider', d.key,
        'displayName', c.display_name,
        'status', c.status,
        'health', coalesce(h.status, 'unknown'),
        'lastSuccessfulSyncAt', c.last_success_at,
        'reconciliationStatus', case
          when c.status = 'connected' and c.last_success_at is not null then 'current'
          when c.status = 'connected' then 'awaiting_first_reconciliation'
          else 'blocked_missing_connection'
        end,
        'contextVersion', c.context_version
      ) order by d.key), '[]'::jsonb)
      from integration.connections c
      join integration.connector_definitions d on d.id = c.connector_definition_id
      left join lateral (
        select he.status
        from integration.health_events he
        where he.connection_id = c.id and he.brand_id = c.brand_id
        order by he.observed_at desc
        limit 1
      ) h on true
      where c.brand_id = v_brand.id
    ),
    'externalMappings', '[]'::jsonb,
    'events', '[]'::jsonb,
    'ownerExceptions', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', i.id,
        'severity', i.severity,
        'type', 'incident',
        'title', i.title,
        'consequence', i.impact,
        'status', i.status,
        'requiresOwnerDecision', i.severity in ('P0', 'P1'),
        'nextAction', coalesce(i.runbook_reference, 'Inspecteer de actuele foutcode en bronstatus.'),
        'evidence', jsonb_build_array(i.code),
        'contextVersion', i.occurrence_count
      ) order by
        case i.severity when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end,
        i.last_observed_at desc), '[]'::jsonb)
      from integration.incidents i
      where i.brand_id = v_brand.id and i.status in ('open', 'acknowledged', 'mitigating')
    ),
    'finance', (
      select jsonb_build_object(
        'brandId', v_brand.id,
        'currency', v_legal.base_currency,
        'revenueCents', null,
        'measuredCostCents', case when count(*) = 0 then null else coalesce(sum(u.total_cost_minor), 0) end,
        'allocatedCostCents', null,
        'marginCents', null,
        'quality', case when count(*) = 0 then 'unavailable' else 'partial' end,
        'reason', case when count(*) = 0
          then 'Geen gereconcilieerde financiële bron of ledgerregels.'
          else 'Alleen gemeten of gereconcilieerde kosten zijn beschikbaar; omzet ontbreekt.' end,
        'entryCount', count(*)
      )
      from ledger.usage_entries u
      where u.brand_id = v_brand.id and u.quality in ('measured', 'reconciled', 'booked')
    ),
    'dataHealth', (
      select jsonb_build_object(
        'totalSources', count(*),
        'healthy', count(*) filter (where c.status = 'connected'),
        'blocked', count(*) filter (where c.status <> 'connected'),
        'unknown', count(*) filter (where c.status in ('pending', 'authorizing'))
      )
      from integration.connections c
      where c.brand_id = v_brand.id
    ),
    'operations', null,
    'sourceQuality', 'durable_control_plane',
    'generatedAt', now(),
    'demoMode', false,
    'externalWrites', false
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.autopilots_brand_twin(uuid, text) from public, anon, authenticated;
grant execute on function public.autopilots_brand_twin(uuid, text) to service_role;

commit;
