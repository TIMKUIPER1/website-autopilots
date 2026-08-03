begin;

create or replace function public.autopilots_audit_timeline(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, audit
as $$
declare
  v_entity core.legal_entities%rowtype;
begin
  select le.* into v_entity from core.legal_entities le
  where le.id = p_legal_entity_id and le.status = 'active';
  if not found then raise exception 'organization not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'auditor')
  ) then
    raise exception 'organization audit role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.audit-timeline.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'summary', jsonb_build_object(
      'events24h', (select count(*) from audit.events e
        where e.legal_entity_id = p_legal_entity_id and e.occurred_at >= now() - interval '24 hours'),
      'failed24h', (select count(*) from audit.events e
        where e.legal_entity_id = p_legal_entity_id and e.occurred_at >= now() - interval '24 hours'
          and e.result = 'failed'),
      'blocked24h', (select count(*) from audit.events e
        where e.legal_entity_id = p_legal_entity_id and e.occurred_at >= now() - interval '24 hours'
          and e.result = 'blocked'),
      'humanEvents24h', (select count(*) from audit.events e
        where e.legal_entity_id = p_legal_entity_id and e.occurred_at >= now() - interval '24 hours'
          and e.actor_type = 'user'),
      'systemEvents24h', (select count(*) from audit.events e
        where e.legal_entity_id = p_legal_entity_id and e.occurred_at >= now() - interval '24 hours'
          and e.actor_type = 'system'),
      'highRisk24h', (select count(*) from audit.events e
        where e.legal_entity_id = p_legal_entity_id and e.occurred_at >= now() - interval '24 hours'
          and e.risk_class in ('R2', 'R3'))
    ),
    'events', coalesce((select jsonb_agg(jsonb_build_object(
      'eventId', scoped.id,
      'brand', case when scoped.brand_id is null then null else jsonb_build_object(
        'id', scoped.brand_id, 'slug', scoped.brand_slug, 'name', scoped.brand_name, 'code', scoped.brand_code
      ) end,
      'actorType', scoped.actor_type,
      'actorLabel', case
        when scoped.actor_type = 'user' then coalesce(scoped.profile_name, 'Bevoegde gebruiker')
        when scoped.actor_type = 'system' then 'Autopilots systeem'
        when scoped.actor_type = 'agent' then 'Geregistreerde agent'
        else 'Externe provider'
      end,
      'action', scoped.action,
      'entityType', scoped.entity_type,
      'riskClass', scoped.risk_class,
      'result', scoped.result,
      'source', scoped.source,
      'correlationId', scoped.correlation_id,
      'occurredAt', scoped.occurred_at
    ) order by scoped.occurred_at desc)
    from (
      select e.id, e.brand_id, b.slug as brand_slug, b.name as brand_name, b.code as brand_code,
        e.actor_type, p.display_name as profile_name, e.action, e.entity_type,
        e.risk_class, e.result, e.source, e.correlation_id, e.occurred_at
      from audit.events e
      left join core.brands b on b.id = e.brand_id and b.legal_entity_id = e.legal_entity_id
      left join iam.profiles p on e.actor_type = 'user'
        and e.actor_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
        and p.id::text = lower(e.actor_id)
      where e.legal_entity_id = p_legal_entity_id
      order by e.occurred_at desc
      limit 50
    ) scoped), '[]'::jsonb),
    'historyLimit', 50,
    'actorIdsExposed', false,
    'reasonsExposed', false,
    'payloadsExposed', false,
    'evidencePayloadsExposed', false,
    'genericAuditActionEnabled', false,
    'externalWritesEnabled', false,
    'demoMode', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_audit_timeline(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_audit_timeline(uuid, uuid) to service_role;

commit;
