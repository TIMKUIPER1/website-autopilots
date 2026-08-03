begin;

create or replace function public.autopilots_session_context()
returns jsonb
language sql
stable
security invoker
set search_path = public, core, iam, auth, pg_catalog
as $$
  with current_profile as (
    select p.id, p.auth_user_id, p.email, p.display_name, p.mfa_required
    from iam.profiles p
    where p.auth_user_id = auth.uid()
      and p.status = 'active'
  ), active_memberships as (
    select m.profile_id, m.legal_entity_id, m.brand_id, m.role
    from iam.memberships m
    join current_profile p on p.id = m.profile_id
    where m.status = 'active'
  ), accessible_brands as (
    select distinct b.id, b.slug, b.name, b.code, b.status, b.legal_entity_id
    from core.brands b
    join active_memberships m
      on m.legal_entity_id = b.legal_entity_id
     and (m.brand_id is null or m.brand_id = b.id)
  ), primary_membership as (
    select m.role, m.legal_entity_id
    from active_memberships m
    order by case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'operator' then 3
      when 'finance' then 4
      when 'auditor' then 5
      else 6
    end
    limit 1
  )
  select jsonb_build_object(
    'profileId', p.id,
    'authUserId', p.auth_user_id,
    'email', p.email,
    'displayName', p.display_name,
    'role', m.role,
    'legalEntityId', m.legal_entity_id,
    'mfaRequired', p.mfa_required,
    'assuranceLevel', coalesce(auth.jwt() ->> 'aal', 'aal1'),
    'brands', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id,
        'slug', b.slug,
        'name', b.name,
        'code', b.code,
        'status', b.status,
        'legalEntityId', b.legal_entity_id
      ) order by b.slug)
      from accessible_brands b
    ), '[]'::jsonb)
  )
  from current_profile p
  cross join primary_membership m
$$;

revoke all on function public.autopilots_session_context() from public, anon;
grant execute on function public.autopilots_session_context() to authenticated;

commit;
