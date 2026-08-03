begin;

create table iam.access_requests (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete cascade,
  brand_id uuid,
  requested_by uuid not null references iam.profiles(id) on delete restrict,
  normalized_email text not null check (
    normalized_email = lower(normalized_email)
    and normalized_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and length(normalized_email) <= 254
  ),
  display_name text not null check (length(display_name) between 2 and 120),
  requested_role text not null check (requested_role in ('admin', 'operator', 'finance', 'auditor', 'viewer')),
  request_status text not null default 'approval_required' check (
    request_status in ('approval_required', 'approved', 'rejected', 'cancelled', 'applied')
  ),
  context_version bigint not null default 1 check (context_version > 0),
  provider_invite_required boolean not null,
  provider_invite_sent boolean not null default false check (provider_invite_sent = false),
  external_writes boolean not null default false check (external_writes = false),
  command_id uuid not null unique references workflow.commands(id) on delete restrict,
  approval_id uuid not null unique references workflow.approvals(id) on delete restrict,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete cascade,
  unique (legal_entity_id, idempotency_key),
  check (idempotency_key ~ '^[A-Za-z0-9:_-]{8,160}$')
);

create unique index access_requests_open_scope_uidx
  on iam.access_requests (
    legal_entity_id,
    normalized_email,
    coalesce(brand_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where request_status in ('approval_required', 'approved');

create index access_requests_legal_status_idx
  on iam.access_requests (legal_entity_id, request_status, created_at desc);

alter table iam.access_requests enable row level security;
revoke all on iam.access_requests from public, anon, authenticated;
grant select, insert, update on iam.access_requests to service_role;

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
      'tradingName', v_organization.trading_name,
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

create or replace function public.autopilots_stage_access_request(
  p_profile_id uuid,
  p_legal_entity_id uuid,
  p_email text,
  p_display_name text,
  p_role text,
  p_brand_slug text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, workflow, ledger, audit
as $$
declare
  v_email text := lower(trim(coalesce(p_email, '')));
  v_display_name text := trim(coalesce(p_display_name, ''));
  v_brand core.brands%rowtype;
  v_command_brand core.brands%rowtype;
  v_environment core.environments%rowtype;
  v_request iam.access_requests%rowtype;
  v_command_id uuid := gen_random_uuid();
  v_approval_id uuid := gen_random_uuid();
  v_request_id uuid := gen_random_uuid();
  v_provider_invite_required boolean;
  v_existing_command_id uuid;
begin
  if v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or length(v_email) > 254 then
    raise exception 'valid access email required' using errcode = '22023';
  end if;
  if length(v_display_name) not between 2 and 120 then
    raise exception 'bounded display name required' using errcode = '22023';
  end if;
  if p_role not in ('admin', 'operator', 'finance', 'auditor', 'viewer') then
    raise exception 'invalid requested role' using errcode = '22023';
  end if;
  if coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9:_-]{8,160}$' then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;
  if p_brand_slug is not null and p_brand_slug !~ '^[a-z][a-z0-9-]{2,62}$' then
    raise exception 'operating brand not found' using errcode = 'P0002';
  end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin')
  ) then
    raise exception 'organization access manager required' using errcode = '42501';
  end if;

  if p_brand_slug is not null then
    select b.* into v_brand from core.brands b
    where b.legal_entity_id = p_legal_entity_id and b.slug = p_brand_slug and b.status <> 'archived';
    if not found then raise exception 'operating brand not found' using errcode = 'P0002'; end if;
  end if;

  select b.* into v_command_brand from core.brands b
  where b.legal_entity_id = p_legal_entity_id and b.slug = 'autopilots' and b.status <> 'archived';
  if not found then raise exception 'control brand not found' using errcode = 'P0002'; end if;
  select e.* into strict v_environment from core.environments e
  where e.brand_id = v_command_brand.id and e.kind = 'sandbox';

  v_provider_invite_required := not exists (
    select 1 from iam.profiles p where lower(p.email) = v_email and p.status <> 'deactivated'
  );

  insert into workflow.commands (
    id, brand_id, environment_id, actor_profile_id, command_type, risk_class,
    idempotency_key, status, context_version, payload, correlation_id
  ) values (
    v_command_id, v_command_brand.id, v_environment.id, p_profile_id,
    'iam.access.stage', 'R2', p_idempotency_key, 'approval_required',
    v_environment.context_version,
    jsonb_build_object(
      'legalEntityId', p_legal_entity_id,
      'email', v_email,
      'displayName', v_display_name,
      'requestedRole', p_role,
      'brandId', v_brand.id,
      'providerInviteRequired', v_provider_invite_required,
      'providerInviteSent', false,
      'externalWrites', false
    ),
    v_request_id
  )
  on conflict (brand_id, environment_id, idempotency_key) do nothing
  returning id into v_existing_command_id;

  if v_existing_command_id is null then
    select r.* into strict v_request from iam.access_requests r
    where r.legal_entity_id = p_legal_entity_id and r.idempotency_key = p_idempotency_key;
    if v_request.normalized_email <> v_email
      or v_request.display_name <> v_display_name
      or v_request.requested_role <> p_role
      or v_request.brand_id is distinct from v_brand.id then
      raise exception 'idempotency key reused with different access request' using errcode = '23505';
    end if;
    return jsonb_build_object(
      'contract', 'autopilots.access-request.v1',
      'requestId', v_request.id,
      'commandId', v_request.command_id,
      'approvalId', v_request.approval_id,
      'status', v_request.request_status,
      'replayed', true,
      'providerInviteSent', false,
      'externalWrites', false
    );
  end if;

  insert into workflow.approvals (
    id, command_id, brand_id, risk_class, status, context_version, rationale,
    evidence, requested_by, requested_at
  ) values (
    v_approval_id, v_command_id, v_command_brand.id, 'R2', 'pending',
    v_environment.context_version,
    'Nieuwe of gewijzigde toegang vereist een actuele menselijke beslissing voordat een provideruitnodiging of membership mogelijk is.',
    jsonb_build_array(
      'access_request:' || v_request_id::text,
      'provider_invite_sent:false',
      'external_writes:false'
    ),
    p_profile_id, now()
  );

  insert into iam.access_requests (
    id, legal_entity_id, brand_id, requested_by, normalized_email, display_name,
    requested_role, request_status, context_version, provider_invite_required,
    provider_invite_sent, external_writes, command_id, approval_id, idempotency_key
  ) values (
    v_request_id, p_legal_entity_id, v_brand.id, p_profile_id, v_email, v_display_name,
    p_role, 'approval_required', v_environment.context_version, v_provider_invite_required,
    false, false, v_command_id, v_approval_id, p_idempotency_key
  ) returning * into v_request;

  insert into ledger.usage_entries (
    legal_entity_id, brand_id, environment_id, provider, metric, quantity, unit,
    total_cost_minor, currency, quality, source_reference, idempotency_key, occurred_at
  ) values (
    p_legal_entity_id, v_command_brand.id, v_environment.id,
    'autopilots-control-plane', 'governed_command', 1, 'command',
    0, 'EUR', 'measured', v_command_id::text,
    'usage:' || p_idempotency_key, now()
  );

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, reason, evidence,
    correlation_id, source
  ) values (
    p_legal_entity_id, v_command_brand.id, v_environment.id,
    'user', p_profile_id::text, 'iam.access.stage', 'access_request', v_request_id::text,
    'R2', 'requested', 'Access is staged only; human approval and provider invite remain pending.',
    jsonb_build_array(
      jsonb_build_object(
        'commandId', v_command_id,
        'approvalId', v_approval_id,
        'scope', case when v_brand.id is null then 'legal_entity' else v_brand.slug end,
        'requestedRole', p_role,
        'providerInviteSent', false,
        'externalWrites', false
      )
    ),
    v_request_id, 'autopilots-control-plane'
  );

  return jsonb_build_object(
    'contract', 'autopilots.access-request.v1',
    'requestId', v_request.id,
    'commandId', v_request.command_id,
    'approvalId', v_request.approval_id,
    'status', v_request.request_status,
    'replayed', false,
    'providerInviteRequired', v_request.provider_invite_required,
    'providerInviteSent', false,
    'externalWrites', false
  );
end;
$$;

revoke all on function public.autopilots_access_roster(uuid, uuid) from public, anon, authenticated;
revoke all on function public.autopilots_stage_access_request(uuid, uuid, text, text, text, text, text) from public, anon, authenticated;
grant execute on function public.autopilots_access_roster(uuid, uuid) to service_role;
grant execute on function public.autopilots_stage_access_request(uuid, uuid, text, text, text, text, text) to service_role;

commit;
