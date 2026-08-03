begin;

create or replace function public.autopilots_incident_snapshot_v2(
  p_profile_id uuid,
  p_legal_entity_id uuid,
  p_brand_slug text default null
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
  if p_brand_slug is not null and p_brand_slug !~ '^[a-z][a-z0-9-]{2,62}$' then
    raise exception 'operating brand not found' using errcode = 'P0002';
  end if;

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

  if p_brand_slug is not null and not exists (
    select 1
    from core.brands b
    join iam.memberships m
      on m.legal_entity_id = b.legal_entity_id
     and (m.brand_id is null or m.brand_id = b.id)
    where b.slug = p_brand_slug
      and b.legal_entity_id = p_legal_entity_id
      and b.status <> 'retired'
      and m.profile_id = p_profile_id
      and m.status = 'active'
  ) then
    if exists (
      select 1 from core.brands b
      where b.slug = p_brand_slug
        and b.legal_entity_id = p_legal_entity_id
        and b.status <> 'retired'
    ) then
      raise exception 'brand access denied' using errcode = '42501';
    end if;
    raise exception 'operating brand not found' using errcode = 'P0002';
  end if;

  with scoped as (
    select i.*, b.slug as brand_slug, b.name as brand_name, b.code as brand_code
    from integration.incidents i
    join core.brands b on b.id = i.brand_id
    where b.legal_entity_id = p_legal_entity_id
      and b.status <> 'retired'
      and i.status in ('open', 'acknowledged', 'mitigating')
      and (p_brand_slug is null or b.slug = p_brand_slug)
      and exists (
        select 1 from iam.memberships m
        where m.profile_id = p_profile_id
          and m.legal_entity_id = p_legal_entity_id
          and m.status = 'active'
          and (m.brand_id is null or m.brand_id = b.id)
      )
  )
  select jsonb_build_object(
    'contract', 'autopilots.incidents.v2',
    'scope', case when p_brand_slug is null then 'portfolio' else 'operating_brand' end,
    'legalEntityId', p_legal_entity_id,
    'brandSlug', p_brand_slug,
    'counts', jsonb_build_object(
      'active', count(*),
      'open', count(*) filter (where status = 'open'),
      'acknowledged', count(*) filter (where status = 'acknowledged'),
      'p0', count(*) filter (where severity = 'P0'),
      'p1', count(*) filter (where severity = 'P1'),
      'p2', count(*) filter (where severity = 'P2'),
      'p3', count(*) filter (where severity = 'P3')
    ),
    'incidents', coalesce(jsonb_agg(jsonb_build_object(
      'id', id,
      'brand', jsonb_build_object('slug', brand_slug, 'name', brand_name, 'code', brand_code),
      'code', code,
      'severity', severity,
      'status', status,
      'title', title,
      'impact', impact,
      'retryable', retryable,
      'occurrenceCount', occurrence_count,
      'contextVersion', occurrence_count,
      'firstObservedAt', first_observed_at,
      'lastObservedAt', last_observed_at,
      'ownerProfileId', owner_profile_id,
      'runbookReference', runbook_reference
    ) order by
      case severity when 'P0' then 0 when 'P1' then 1 when 'P2' then 2 else 3 end,
      last_observed_at desc), '[]'::jsonb),
    'externalWritesEnabled', false,
    'generatedAt', now()
  ) into v_result
  from scoped;

  return v_result;
end;
$$;

revoke all on function public.autopilots_incident_snapshot_v2(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.autopilots_incident_snapshot_v2(uuid, uuid, text) to service_role;
revoke execute on function public.autopilots_incident_snapshot(uuid, text) from service_role;

commit;
