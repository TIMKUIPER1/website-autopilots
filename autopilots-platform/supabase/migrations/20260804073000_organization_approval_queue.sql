begin;

create or replace function public.autopilots_approval_queue(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, workflow
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
    raise exception 'organization approval governance role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.approval-queue.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'summary', jsonb_build_object(
      'pending', (select count(*) from workflow.approvals a join core.brands b on b.id = a.brand_id
        where b.legal_entity_id = p_legal_entity_id and a.status = 'pending'),
      'r2Pending', (select count(*) from workflow.approvals a join core.brands b on b.id = a.brand_id
        where b.legal_entity_id = p_legal_entity_id and a.status = 'pending' and a.risk_class = 'R2'),
      'r3Pending', (select count(*) from workflow.approvals a join core.brands b on b.id = a.brand_id
        where b.legal_entity_id = p_legal_entity_id and a.status = 'pending' and a.risk_class = 'R3')
    ),
    'approvals', coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id,
      'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
      'commandType', c.command_type,
      'riskClass', a.risk_class,
      'status', a.status,
      'contextVersion', a.context_version,
      'rationale', a.rationale,
      'evidence', a.evidence,
      'requestedAt', a.requested_at,
      'expiresAt', a.expires_at,
      'decidedAt', a.decided_at
    ) order by (a.status = 'pending') desc, a.requested_at desc)
    from workflow.approvals a
    join workflow.commands c on c.id = a.command_id and c.brand_id = a.brand_id
    join core.brands b on b.id = a.brand_id
    where b.legal_entity_id = p_legal_entity_id
      and a.status in ('pending', 'approved', 'rejected', 'expired', 'superseded')),
      '[]'::jsonb),
    'genericDecisionEnabled', false,
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_approval_queue(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_approval_queue(uuid, uuid) to service_role;

commit;
