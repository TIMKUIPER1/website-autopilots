begin;

create table iam.app_sessions (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  profile_id uuid not null references iam.profiles(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  assurance_level text not null check (assurance_level in ('aal1', 'aal2')),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  revocation_reason text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  check (expires_at > created_at),
  check ((revoked_at is null and revocation_reason is null) or (revoked_at is not null and revocation_reason is not null))
);

create index app_sessions_profile_active_idx
  on iam.app_sessions (profile_id, expires_at desc)
  where revoked_at is null;
create index app_sessions_expiry_idx on iam.app_sessions (expires_at);

alter table iam.app_sessions enable row level security;
revoke all on table iam.app_sessions from public, anon, authenticated;
grant select, insert, update, delete on table iam.app_sessions to service_role;

create or replace function public.autopilots_create_app_session(
  p_token_hash text,
  p_profile_id uuid,
  p_auth_user_id uuid,
  p_assurance_level text,
  p_expires_at timestamptz
)
returns uuid
language plpgsql
security invoker
set search_path = public, core, iam, audit, pg_catalog
as $$
declare
  v_session_id uuid;
  v_brand_id uuid;
  v_environment_id uuid;
begin
  if p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid session token hash' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from iam.profiles p
    where p.id = p_profile_id
      and p.auth_user_id = p_auth_user_id
      and p.status = 'active'
      and (not p.mfa_required or p_assurance_level = 'aal2')
  ) then
    raise exception 'active MFA-satisfied profile required' using errcode = '42501';
  end if;

  insert into iam.app_sessions (
    token_hash, profile_id, auth_user_id, assurance_level, expires_at
  ) values (
    p_token_hash, p_profile_id, p_auth_user_id, p_assurance_level, p_expires_at
  )
  returning id into v_session_id;

  select b.id, e.id into v_brand_id, v_environment_id
  from core.brands b
  join core.environments e on e.brand_id = b.id and e.kind = 'sandbox'
  where b.slug = 'autopilots';

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, reason, after_value,
    evidence, correlation_id, source
  )
  select
    m.legal_entity_id, v_brand_id, v_environment_id, 'user', p_profile_id,
    'auth.session.created', 'app_session', v_session_id, 'R1', 'succeeded',
    'MFA-satisfied managed application session created.',
    jsonb_build_object('assurance_level', p_assurance_level, 'expires_at', p_expires_at),
    jsonb_build_array('supabase_auth_user:' || p_auth_user_id::text),
    gen_random_uuid(), 'managed_session_registry'
  from iam.memberships m
  where m.profile_id = p_profile_id and m.status = 'active'
  order by (m.brand_id is null) desc
  limit 1;

  return v_session_id;
end
$$;

create or replace function public.autopilots_resolve_app_session(p_token_hash text)
returns jsonb
language sql
stable
security invoker
set search_path = public, core, iam, pg_catalog
as $$
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
  ), active_memberships as (
    select m.profile_id, m.legal_entity_id, m.brand_id, m.role
    from iam.memberships m
    join active_session s on s.profile_id = m.profile_id
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
      when 'owner' then 1 when 'admin' then 2 when 'operator' then 3
      when 'finance' then 4 when 'auditor' then 5 else 6 end
    limit 1
  )
  select jsonb_build_object(
    'sessionId', s.id,
    'expiresAt', s.expires_at,
    'profileId', p.id,
    'authUserId', p.auth_user_id,
    'email', p.email,
    'displayName', p.display_name,
    'role', m.role,
    'legalEntityId', m.legal_entity_id,
    'mfaRequired', p.mfa_required,
    'assuranceLevel', s.assurance_level,
    'brands', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', b.id, 'slug', b.slug, 'name', b.name, 'code', b.code,
        'status', b.status, 'legalEntityId', b.legal_entity_id
      ) order by b.slug)
      from accessible_brands b
    ), '[]'::jsonb)
  )
  from active_session s
  join iam.profiles p on p.id = s.profile_id
  cross join primary_membership m
$$;

create or replace function public.autopilots_revoke_app_session(
  p_token_hash text,
  p_reason text default 'user_logout'
)
returns boolean
language plpgsql
security invoker
set search_path = public, core, iam, audit, pg_catalog
as $$
declare
  v_session iam.app_sessions%rowtype;
  v_brand_id uuid;
  v_environment_id uuid;
  v_legal_entity_id uuid;
begin
  update iam.app_sessions
  set revoked_at = now(), revocation_reason = left(coalesce(nullif(p_reason, ''), 'revoked'), 120)
  where token_hash = p_token_hash and revoked_at is null
  returning * into v_session;

  if v_session.id is null then return false; end if;

  select m.legal_entity_id into v_legal_entity_id
  from iam.memberships m
  where m.profile_id = v_session.profile_id
  order by (m.status = 'active') desc, (m.brand_id is null) desc
  limit 1;

  select b.id, e.id into v_brand_id, v_environment_id
  from core.brands b
  join core.environments e on e.brand_id = b.id and e.kind = 'sandbox'
  where b.slug = 'autopilots';

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, reason, after_value,
    evidence, correlation_id, source
  ) values (
    v_legal_entity_id, v_brand_id, v_environment_id, 'user', v_session.profile_id,
    'auth.session.revoked', 'app_session', v_session.id, 'R1', 'succeeded',
    left(coalesce(nullif(p_reason, ''), 'revoked'), 120),
    jsonb_build_object('revoked_at', now()), '[]'::jsonb,
    gen_random_uuid(), 'managed_session_registry'
  );

  return true;
end
$$;

revoke all on function public.autopilots_create_app_session(text, uuid, uuid, text, timestamptz) from public, anon, authenticated;
revoke all on function public.autopilots_resolve_app_session(text) from public, anon, authenticated;
revoke all on function public.autopilots_revoke_app_session(text, text) from public, anon, authenticated;
grant execute on function public.autopilots_create_app_session(text, uuid, uuid, text, timestamptz) to service_role;
grant execute on function public.autopilots_resolve_app_session(text) to service_role;
grant execute on function public.autopilots_revoke_app_session(text, text) to service_role;

commit;
