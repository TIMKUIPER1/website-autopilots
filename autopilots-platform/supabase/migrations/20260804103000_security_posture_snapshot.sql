begin;

create or replace function public.autopilots_security_posture(
  p_profile_id uuid,
  p_legal_entity_id uuid,
  p_current_session_id uuid default null
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam
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
    raise exception 'organization security governance role required' using errcode = '42501';
  end if;

  if p_current_session_id is not null and not exists (
    select 1 from iam.app_sessions s
    where s.id = p_current_session_id and s.profile_id = p_profile_id
      and s.revoked_at is null and s.expires_at > now()
  ) then
    raise exception 'current session does not belong to profile' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.security-posture.v1',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'summary', jsonb_build_object(
      'activeProfiles', (select count(distinct p.id) from iam.profiles p
        join iam.memberships m on m.profile_id = p.id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active' and p.status = 'active'),
      'mfaRequiredProfiles', (select count(distinct p.id) from iam.profiles p
        join iam.memberships m on m.profile_id = p.id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and p.status = 'active' and p.mfa_required = true),
      'activeSessions', (select count(distinct s.id) from iam.app_sessions s
        join iam.memberships m on m.profile_id = s.profile_id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and s.revoked_at is null and s.expires_at > now()),
      'activeAal2Sessions', (select count(distinct s.id) from iam.app_sessions s
        join iam.memberships m on m.profile_id = s.profile_id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and s.revoked_at is null and s.expires_at > now() and s.assurance_level = 'aal2'),
      'activeAal1Sessions', (select count(distinct s.id) from iam.app_sessions s
        join iam.memberships m on m.profile_id = s.profile_id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and s.revoked_at is null and s.expires_at > now() and s.assurance_level = 'aal1'),
      'expiringSoon', (select count(distinct s.id) from iam.app_sessions s
        join iam.memberships m on m.profile_id = s.profile_id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and s.revoked_at is null and s.expires_at > now() and s.expires_at <= now() + interval '15 minutes'),
      'expiredNotRevoked', (select count(distinct s.id) from iam.app_sessions s
        join iam.memberships m on m.profile_id = s.profile_id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and s.revoked_at is null and s.expires_at <= now()),
      'revoked24h', (select count(distinct s.id) from iam.app_sessions s
        join iam.memberships m on m.profile_id = s.profile_id
        where m.legal_entity_id = p_legal_entity_id and m.status = 'active'
          and s.revoked_at >= now() - interval '24 hours')
    ),
    'sessions', coalesce((select jsonb_agg(jsonb_build_object(
      'sessionId', scoped.id,
      'profile', jsonb_build_object('id', scoped.profile_id, 'displayName', scoped.display_name),
      'assuranceLevel', scoped.assurance_level,
      'status', case when scoped.revoked_at is not null then 'revoked'
        when scoped.expires_at <= now() then 'expired' else 'active' end,
      'isCurrent', scoped.id = p_current_session_id,
      'createdAt', scoped.created_at,
      'lastSeenAt', scoped.last_seen_at,
      'expiresAt', scoped.expires_at,
      'revokedAt', scoped.revoked_at,
      'minutesToExpiry', case when scoped.expires_at <= now() then 0
        else floor(extract(epoch from scoped.expires_at - now()) / 60)::bigint end
    ) order by (scoped.revoked_at is null and scoped.expires_at > now()) desc, scoped.last_seen_at desc)
    from (
      select distinct s.id, s.profile_id, p.display_name, s.assurance_level,
        s.created_at, s.last_seen_at, s.expires_at, s.revoked_at
      from iam.app_sessions s
      join iam.profiles p on p.id = s.profile_id
      join iam.memberships m on m.profile_id = s.profile_id
      where m.legal_entity_id = p_legal_entity_id
        and m.status = 'active' and p.status = 'active'
      order by s.last_seen_at desc
      limit 20
    ) scoped), '[]'::jsonb),
    'historyLimit', 20,
    'tokenHashesExposed', false,
    'authUserIdsExposed', false,
    'revocationReasonsExposed', false,
    'genericSessionRevocationEnabled', false,
    'externalWritesEnabled', false,
    'demoMode', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_security_posture(uuid, uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_security_posture(uuid, uuid, uuid) to service_role;

commit;
