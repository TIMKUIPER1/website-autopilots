begin;

create or replace function public.autopilots_access_roster(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
security invoker
stable
set search_path = pg_catalog, public, core, iam, workflow
as $$
declare
  v_organization core.legal_entities%rowtype;
  v_can_manage boolean;
  v_members jsonb;
  v_requests jsonb;
begin
  select le.* into v_organization from core.legal_entities le
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
    raise exception 'organization access governance role required' using errcode = '42501';
  end if;

  select exists (
    select 1 from iam.memberships m
    where m.profile_id = p_profile_id and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active' and m.role in ('owner', 'admin')
  ) into v_can_manage;

  select coalesce(jsonb_agg(jsonb_build_object(
    'profileId', scoped.id,
    'email', scoped.email,
    'displayName', scoped.display_name,
    'status', scoped.profile_status,
    'mfaRequired', scoped.mfa_required,
    'memberships', scoped.memberships
  ) order by scoped.display_name, scoped.email), '[]'::jsonb) into v_members
  from (
    select p.id, p.email, p.display_name, p.status as profile_status, p.mfa_required,
      (
        select coalesce(jsonb_agg(jsonb_build_object(
          'membershipId', m2.id,
          'role', m2.role,
          'status', m2.status,
          'scope', case when m2.brand_id is null then 'legal_entity' else 'operating_brand' end,
          'brand', case when b.id is null then null else jsonb_build_object(
            'id', b.id, 'slug', b.slug, 'name', b.name, 'code', b.code
          ) end
        ) order by m2.created_at), '[]'::jsonb)
        from iam.memberships m2
        left join core.brands b on b.id = m2.brand_id
        where m2.profile_id = p.id and m2.legal_entity_id = p_legal_entity_id
      ) as memberships
    from iam.profiles p
    where exists (
      select 1 from iam.memberships m
      where m.profile_id = p.id and m.legal_entity_id = p_legal_entity_id
    )
  ) scoped;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', r.id,
    'email', r.normalized_email,
    'displayName', r.display_name,
    'requestedRole', r.requested_role,
    'status', r.request_status,
    'contextVersion', r.context_version,
    'scope', case when r.brand_id is null then 'legal_entity' else 'operating_brand' end,
    'brand', case when b.id is null then null else jsonb_build_object(
      'id', b.id, 'slug', b.slug, 'name', b.name, 'code', b.code
    ) end,
    'providerInviteRequired', r.provider_invite_required,
    'providerInviteSent', r.provider_invite_sent,
    'externalWrites', r.external_writes,
    'commandId', r.command_id,
    'approvalId', r.approval_id,
    'requestedAt', r.created_at
  ) order by r.created_at desc), '[]'::jsonb) into v_requests
  from iam.access_requests r
  left join core.brands b on b.id = r.brand_id
  where r.legal_entity_id = p_legal_entity_id;

  return jsonb_build_object(
    'contract', 'autopilots.access-roster.v1',
    'organization', jsonb_build_object(
      'id', v_organization.id,
      'legalName', v_organization.legal_name,
      'tradingName', coalesce(v_organization.metadata->>'tradingName', v_organization.legal_name),
      'status', v_organization.status
    ),
    'viewer', jsonb_build_object('profileId', p_profile_id, 'canManageAccess', v_can_manage),
    'members', v_members,
    'requests', v_requests,
    'counts', jsonb_build_object(
      'members', jsonb_array_length(v_members),
      'approvalRequired', (select count(*) from iam.access_requests r where r.legal_entity_id = p_legal_entity_id and r.request_status = 'approval_required')
    ),
    'providerInvitesEnabled', false,
    'externalWrites', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_access_roster(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_access_roster(uuid, uuid) to service_role;

commit;
