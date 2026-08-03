begin;

create or replace function public.autopilots_session_context_v2()
returns jsonb
language sql
stable
security definer
set search_path = pg_catalog, auth, iam, core
as $$
  with current_profile as (
    select p.id, p.auth_user_id, p.email, p.display_name, p.mfa_required
    from iam.profiles p
    where p.auth_user_id = auth.uid()
      and p.status = 'active'
  ), primary_membership as (
    select m.profile_id, m.role, m.legal_entity_id
    from iam.memberships m
    join current_profile p on p.id = m.profile_id
    where m.status = 'active'
    order by case m.role
      when 'owner' then 1
      when 'admin' then 2
      when 'operator' then 3
      when 'finance' then 4
      when 'auditor' then 5
      else 6
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
    'contract', 'autopilots.session-context.v2',
    'profileId', p.id,
    'authUserId', p.auth_user_id,
    'email', p.email,
    'displayName', p.display_name,
    'role', pm.role,
    'legalEntityId', pm.legal_entity_id,
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
  cross join primary_membership pm
$$;

revoke all on function public.autopilots_session_context_v2() from public, anon, service_role;
grant execute on function public.autopilots_session_context_v2() to authenticated;
revoke execute on function public.autopilots_session_context() from authenticated;

revoke select on all tables in schema core, iam, integration, workflow, ledger, audit from authenticated;
revoke execute on function iam.current_profile_id() from authenticated;
revoke execute on function iam.has_legal_entity_access(uuid) from authenticated;
revoke execute on function iam.has_brand_access(uuid) from authenticated;

alter function audit.reject_mutation() set search_path = pg_catalog;

commit;
