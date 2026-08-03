begin;

create or replace function public.autopilots_resolve_app_session(p_token_hash text)
returns jsonb
language plpgsql
volatile
security invoker
set search_path = pg_catalog, public, core, iam
as $$
declare
  v_result jsonb;
  v_session_id uuid;
begin
  with active_session as (
    select s.id, s.profile_id, s.auth_user_id, s.assurance_level, s.expires_at
    from iam.app_sessions s
    join iam.profiles p on p.id = s.profile_id
    where s.token_hash = p_token_hash
      and s.revoked_at is null
      and s.expires_at > now()
      and p.status = 'active'
      and p.auth_user_id = s.auth_user_id
      and (not p.mfa_required or s.assurance_level = 'aal2')
  ), primary_membership as (
    select m.profile_id, m.role, m.legal_entity_id
    from iam.memberships m
    join active_session s on s.profile_id = m.profile_id
    where m.status = 'active'
    order by case m.role
      when 'owner' then 1 when 'admin' then 2 when 'operator' then 3
      when 'finance' then 4 when 'auditor' then 5 else 6
    end, m.created_at, m.legal_entity_id
    limit 1
  ), accessible_brands as (
    select distinct b.id, b.slug, b.name, b.code, b.status, b.legal_entity_id
    from core.brands b
    join primary_membership pm on pm.legal_entity_id = b.legal_entity_id
    join iam.memberships m
      on m.profile_id = pm.profile_id
     and m.legal_entity_id = pm.legal_entity_id
     and m.status = 'active'
     and (m.brand_id is null or m.brand_id = b.id)
    where b.status <> 'retired'
  )
  select jsonb_build_object(
    'sessionId', s.id,
    'expiresAt', s.expires_at,
    'profileId', p.id,
    'authUserId', p.auth_user_id,
    'email', p.email,
    'displayName', p.display_name,
    'role', pm.role,
    'legalEntityId', pm.legal_entity_id,
    'mfaRequired', p.mfa_required,
    'assuranceLevel', s.assurance_level,
    'brands', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'slug', b.slug, 'name', b.name, 'code', b.code,
        'status', b.status, 'legalEntityId', b.legal_entity_id
      ) order by b.slug)
      from accessible_brands b
    ), '[]'::jsonb)
  ), s.id into v_result, v_session_id
  from active_session s
  join iam.profiles p on p.id = s.profile_id
  cross join primary_membership pm;

  if v_result is not null then
    update iam.app_sessions
    set last_seen_at = now()
    where id = v_session_id
      and last_seen_at < now() - interval '5 minutes';
  end if;

  return v_result;
end;
$$;

revoke all on function public.autopilots_resolve_app_session(text) from public, anon, authenticated;
grant execute on function public.autopilots_resolve_app_session(text) to service_role;

commit;
