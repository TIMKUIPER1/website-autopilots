begin;

create table core.brand_launch_requests (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete cascade,
  authority_brand_id uuid not null,
  authority_environment_id uuid not null,
  requested_by uuid not null references iam.profiles(id) on delete restrict,
  proposed_slug text not null check (proposed_slug ~ '^[a-z][a-z0-9-]{2,62}$'),
  proposed_name text not null check (length(proposed_name) between 2 and 120),
  proposed_code text not null check (proposed_code ~ '^[A-Z0-9]{2,12}$'),
  proposed_risk_profile text not null check (proposed_risk_profile in ('low', 'standard', 'high', 'regulated')),
  request_status text not null default 'approval_required' check (
    request_status in ('approval_required', 'approved', 'rejected', 'cancelled', 'applied')
  ),
  context_version bigint not null default 1 check (context_version > 0),
  brand_created boolean not null default false check (brand_created = false),
  sandbox_environment_created boolean not null default false check (sandbox_environment_created = false),
  onboarding_run_created boolean not null default false check (onboarding_run_created = false),
  provider_authorization_started boolean not null default false check (provider_authorization_started = false),
  credentials_stored boolean not null default false check (credentials_stored = false),
  external_writes boolean not null default false check (external_writes = false),
  command_id uuid not null unique references workflow.commands(id) on delete restrict,
  approval_id uuid not null unique references workflow.approvals(id) on delete restrict,
  idempotency_key text not null check (idempotency_key ~ '^[A-Za-z0-9:_-]{8,120}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (authority_brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete restrict,
  foreign key (authority_environment_id, authority_brand_id) references core.environments(id, brand_id) on delete restrict,
  unique (legal_entity_id, idempotency_key)
);

create unique index brand_launch_requests_open_slug_uidx
  on core.brand_launch_requests (proposed_slug)
  where request_status in ('approval_required', 'approved');
create unique index brand_launch_requests_open_code_uidx
  on core.brand_launch_requests (legal_entity_id, proposed_code)
  where request_status in ('approval_required', 'approved');
create index brand_launch_requests_legal_status_idx
  on core.brand_launch_requests (legal_entity_id, request_status, created_at desc);

alter table core.brand_launch_requests enable row level security;
revoke all on core.brand_launch_requests from public, anon, authenticated;
grant select, insert, update on core.brand_launch_requests to service_role;

create or replace function public.autopilots_brand_launch_requests(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam
as $$
declare
  v_organization core.legal_entities%rowtype;
  v_can_manage boolean;
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
    raise exception 'organization launch governance role required' using errcode = '42501';
  end if;

  select exists (
    select 1 from iam.memberships m
    where m.profile_id = p_profile_id and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active' and m.role in ('owner', 'admin')
  ) into v_can_manage;

  return jsonb_build_object(
    'contract', 'autopilots.brand-launch-requests.v1',
    'organization', jsonb_build_object(
      'id', v_organization.id,
      'legalName', v_organization.legal_name,
      'status', v_organization.status
    ),
    'viewer', jsonb_build_object('profileId', p_profile_id, 'canManageBrandLaunches', v_can_manage),
    'requests', coalesce((select jsonb_agg(jsonb_build_object(
      'id', r.id,
      'slug', r.proposed_slug,
      'name', r.proposed_name,
      'code', r.proposed_code,
      'riskProfile', r.proposed_risk_profile,
      'status', r.request_status,
      'contextVersion', r.context_version,
      'commandId', r.command_id,
      'approvalId', r.approval_id,
      'brandCreated', r.brand_created,
      'sandboxEnvironmentCreated', r.sandbox_environment_created,
      'onboardingRunCreated', r.onboarding_run_created,
      'providerAuthorizationStarted', r.provider_authorization_started,
      'credentialsStored', r.credentials_stored,
      'externalWrites', r.external_writes,
      'requestedAt', r.created_at
    ) order by r.created_at desc)
    from core.brand_launch_requests r
    where r.legal_entity_id = p_legal_entity_id), '[]'::jsonb),
    'brandCreationEnabled', false,
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

create or replace function public.autopilots_stage_brand_launch_request(
  p_profile_id uuid,
  p_legal_entity_id uuid,
  p_proposed_slug text,
  p_proposed_name text,
  p_proposed_code text,
  p_risk_profile text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, workflow, ledger, audit
as $$
declare
  v_slug text := lower(trim(coalesce(p_proposed_slug, '')));
  v_name text := trim(coalesce(p_proposed_name, ''));
  v_code text := upper(trim(coalesce(p_proposed_code, '')));
  v_authority_brand core.brands%rowtype;
  v_authority_environment core.environments%rowtype;
  v_request core.brand_launch_requests%rowtype;
  v_command_id uuid := gen_random_uuid();
  v_approval_id uuid := gen_random_uuid();
  v_request_id uuid := gen_random_uuid();
  v_inserted_command_id uuid;
begin
  if v_slug !~ '^[a-z][a-z0-9-]{2,62}$' then
    raise exception 'valid proposed brand slug required' using errcode = '22023';
  end if;
  if length(v_name) not between 2 and 120 then
    raise exception 'bounded proposed brand name required' using errcode = '22023';
  end if;
  if v_code !~ '^[A-Z0-9]{2,12}$' then
    raise exception 'valid proposed brand code required' using errcode = '22023';
  end if;
  if p_risk_profile not in ('low', 'standard', 'high', 'regulated') then
    raise exception 'valid proposed brand risk profile required' using errcode = '22023';
  end if;
  if coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9:_-]{8,120}$' then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  if not exists (
    select 1 from core.legal_entities le
    where le.id = p_legal_entity_id and le.status = 'active'
  ) then raise exception 'organization not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin')
  ) then
    raise exception 'organization launch manager required' using errcode = '42501';
  end if;

  if exists (select 1 from core.brands b where b.slug = v_slug) then
    raise exception 'proposed brand slug already exists' using errcode = '23505';
  end if;
  if exists (select 1 from core.brands b where b.legal_entity_id = p_legal_entity_id and b.code = v_code) then
    raise exception 'proposed brand code already exists' using errcode = '23505';
  end if;

  select b.* into strict v_authority_brand from core.brands b
  where b.legal_entity_id = p_legal_entity_id and b.slug = 'autopilots' and b.status = 'active';
  select e.* into strict v_authority_environment from core.environments e
  where e.brand_id = v_authority_brand.id and e.kind = 'sandbox';

  insert into workflow.commands (
    id, brand_id, environment_id, actor_profile_id, command_type, risk_class,
    idempotency_key, status, context_version, payload, correlation_id
  ) values (
    v_command_id, v_authority_brand.id, v_authority_environment.id,
    p_profile_id, 'core.brand-launch.stage', 'R2', p_idempotency_key,
    'approval_required', 1,
    jsonb_build_object(
      'legalEntityId', p_legal_entity_id,
      'authorityBrandId', v_authority_brand.id,
      'proposedSlug', v_slug,
      'proposedName', v_name,
      'proposedCode', v_code,
      'riskProfile', p_risk_profile,
      'brandCreated', false,
      'sandboxEnvironmentCreated', false,
      'onboardingRunCreated', false,
      'providerAuthorizationStarted', false,
      'credentialsStored', false,
      'externalWrites', false
    ),
    v_request_id
  )
  on conflict (brand_id, environment_id, idempotency_key) do nothing
  returning id into v_inserted_command_id;

  if v_inserted_command_id is null then
    select r.* into strict v_request from core.brand_launch_requests r
    where r.legal_entity_id = p_legal_entity_id and r.idempotency_key = p_idempotency_key;
    if v_request.proposed_slug <> v_slug or v_request.proposed_name <> v_name
      or v_request.proposed_code <> v_code or v_request.proposed_risk_profile <> p_risk_profile then
      raise exception 'idempotency key reused with different brand launch request' using errcode = '23505';
    end if;
    return jsonb_build_object(
      'contract', 'autopilots.brand-launch-request.v1',
      'requestId', v_request.id,
      'commandId', v_request.command_id,
      'approvalId', v_request.approval_id,
      'status', v_request.request_status,
      'riskClass', 'R2',
      'replayed', true,
      'brandCreated', false,
      'sandboxEnvironmentCreated', false,
      'onboardingRunCreated', false,
      'providerAuthorizationStarted', false,
      'credentialsStored', false,
      'externalWrites', false
    );
  end if;

  insert into workflow.approvals (
    id, command_id, brand_id, risk_class, status, context_version, rationale,
    evidence, requested_by, requested_at
  ) values (
    v_approval_id, v_command_id, v_authority_brand.id, 'R2', 'pending', 1,
    'New software brand intent is staged only. Human approval and a separately governed apply step are required before any brand or environment exists.',
    jsonb_build_array(
      'brand_launch_request:' || v_request_id::text,
      'brand_created:false',
      'sandbox_environment_created:false',
      'onboarding_run_created:false',
      'provider_authorization_started:false',
      'credentials_stored:false',
      'external_writes:false'
    ),
    p_profile_id, now()
  );

  insert into core.brand_launch_requests (
    id, legal_entity_id, authority_brand_id, authority_environment_id,
    requested_by, proposed_slug, proposed_name, proposed_code,
    proposed_risk_profile, request_status, context_version,
    brand_created, sandbox_environment_created, onboarding_run_created,
    provider_authorization_started, credentials_stored, external_writes,
    command_id, approval_id, idempotency_key
  ) values (
    v_request_id, p_legal_entity_id, v_authority_brand.id, v_authority_environment.id,
    p_profile_id, v_slug, v_name, v_code, p_risk_profile,
    'approval_required', 1, false, false, false, false, false, false,
    v_command_id, v_approval_id, p_idempotency_key
  ) returning * into v_request;

  insert into ledger.usage_entries (
    legal_entity_id, brand_id, environment_id, provider, metric, quantity, unit,
    total_cost_minor, currency, quality, source_reference, idempotency_key, occurred_at
  ) values (
    p_legal_entity_id, v_authority_brand.id, v_authority_environment.id,
    'autopilots-control-plane', 'governed_command', 1, 'command',
    0, 'EUR', 'measured', v_command_id::text,
    'usage:' || p_idempotency_key, now()
  );

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, reason, evidence,
    correlation_id, source
  ) values (
    p_legal_entity_id, v_authority_brand.id, v_authority_environment.id,
    'user', p_profile_id::text, 'core.brand-launch.stage',
    'brand_launch_request', v_request_id::text, 'R2', 'requested',
    'New software brand intent staged under Autopilots authority; no brand, environment, onboarding run, provider access, credentials or external write was created.',
    jsonb_build_array(jsonb_build_object(
      'commandId', v_command_id,
      'approvalId', v_approval_id,
      'authorityBrandId', v_authority_brand.id,
      'brandCreated', false,
      'sandboxEnvironmentCreated', false,
      'onboardingRunCreated', false,
      'providerAuthorizationStarted', false,
      'credentialsStored', false,
      'externalWrites', false
    )),
    v_request_id,
    'autopilots-control-plane'
  );

  return jsonb_build_object(
    'contract', 'autopilots.brand-launch-request.v1',
    'requestId', v_request.id,
    'commandId', v_request.command_id,
    'approvalId', v_request.approval_id,
    'status', v_request.request_status,
    'riskClass', 'R2',
    'replayed', false,
    'brandCreated', false,
    'sandboxEnvironmentCreated', false,
    'onboardingRunCreated', false,
    'providerAuthorizationStarted', false,
    'credentialsStored', false,
    'externalWrites', false
  );
end;
$$;

revoke all on function public.autopilots_brand_launch_requests(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_brand_launch_requests(uuid, uuid) to service_role;
revoke all on function public.autopilots_stage_brand_launch_request(uuid, uuid, text, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.autopilots_stage_brand_launch_request(uuid, uuid, text, text, text, text, text)
  to service_role;

commit;
