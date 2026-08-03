begin;

create table integration.connector_requests (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete cascade,
  brand_id uuid not null references core.brands(id) on delete cascade,
  environment_id uuid not null,
  onboarding_run_id uuid not null references integration.onboarding_runs(id) on delete cascade,
  onboarding_step_id uuid not null references integration.onboarding_steps(id) on delete cascade,
  connector_definition_id uuid not null references integration.connector_definitions(id) on delete restrict,
  requested_by uuid not null references iam.profiles(id) on delete restrict,
  display_label text not null check (length(display_label) between 2 and 120),
  requested_scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(requested_scopes) = 'array'),
  risk_class text not null check (risk_class in ('R2', 'R3')),
  request_status text not null default 'approval_required' check (
    request_status in ('approval_required', 'approved', 'rejected', 'cancelled', 'authorization_ready')
  ),
  context_version bigint not null check (context_version > 0),
  provider_authorization_started boolean not null default false check (provider_authorization_started = false),
  provider_account_connected boolean not null default false check (provider_account_connected = false),
  discovery_started boolean not null default false check (discovery_started = false),
  credentials_stored boolean not null default false check (credentials_stored = false),
  external_writes boolean not null default false check (external_writes = false),
  command_id uuid not null unique references workflow.commands(id) on delete restrict,
  approval_id uuid not null unique references workflow.approvals(id) on delete restrict,
  idempotency_key text not null check (idempotency_key ~ '^[A-Za-z0-9:_-]{8,120}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete cascade,
  foreign key (environment_id, brand_id) references core.environments(id, brand_id) on delete cascade,
  unique (brand_id, environment_id, idempotency_key)
);

create unique index connector_requests_open_step_uidx
  on integration.connector_requests (onboarding_step_id)
  where request_status in ('approval_required', 'approved', 'authorization_ready');
create index connector_requests_brand_status_idx
  on integration.connector_requests (brand_id, request_status, created_at desc);

alter table integration.connector_requests enable row level security;
revoke all on integration.connector_requests from public, anon, authenticated;
grant select, insert, update on integration.connector_requests to service_role;

create or replace function public.autopilots_stage_connector_request(
  p_profile_id uuid,
  p_brand_slug text,
  p_step_key text,
  p_display_label text,
  p_idempotency_key text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog, public, core, iam, integration, workflow, ledger, audit
as $$
declare
  v_brand core.brands%rowtype;
  v_environment core.environments%rowtype;
  v_run integration.onboarding_runs%rowtype;
  v_step integration.onboarding_steps%rowtype;
  v_connector integration.connector_definitions%rowtype;
  v_request integration.connector_requests%rowtype;
  v_display_label text := trim(coalesce(p_display_label, ''));
  v_risk_class text;
  v_command_id uuid := gen_random_uuid();
  v_approval_id uuid := gen_random_uuid();
  v_request_id uuid := gen_random_uuid();
  v_inserted_command_id uuid;
begin
  if coalesce(p_brand_slug, '') !~ '^[a-z][a-z0-9-]{2,62}$' then
    raise exception 'operating brand not found' using errcode = 'P0002';
  end if;
  if coalesce(p_step_key, '') !~ '^[a-z][a-z0-9_]{2,62}$' then
    raise exception 'connector onboarding step not found' using errcode = 'P0002';
  end if;
  if length(v_display_label) not between 2 and 120 then
    raise exception 'bounded connector label required' using errcode = '22023';
  end if;
  if coalesce(p_idempotency_key, '') !~ '^[A-Za-z0-9:_-]{8,120}$' then
    raise exception 'invalid idempotency key' using errcode = '22023';
  end if;

  select b.* into v_brand from core.brands b
  where b.slug = p_brand_slug and b.status <> 'archived';
  if not found then raise exception 'operating brand not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin')
  ) then
    raise exception 'organization connector manager required' using errcode = '42501';
  end if;

  select e.* into strict v_environment from core.environments e
  where e.brand_id = v_brand.id and e.kind = 'sandbox';
  select r.* into strict v_run from integration.onboarding_runs r
  where r.brand_id = v_brand.id and r.environment_id = v_environment.id
    and r.template_key = 'software_launch_v1'
  order by r.template_version desc limit 1;
  select s.* into v_step from integration.onboarding_steps s
  where s.run_id = v_run.id and s.brand_id = v_brand.id and s.step_key = p_step_key;
  if not found or v_step.connector_definition_id is null
    or coalesce((v_step.configuration ->> 'authorization_required')::boolean, false) is not true then
    raise exception 'connector authorization step not found' using errcode = 'P0002';
  end if;
  if v_step.status in ('completed', 'skipped') then
    raise exception 'connector onboarding step is already closed' using errcode = '55000';
  end if;

  select d.* into strict v_connector from integration.connector_definitions d
  where d.id = v_step.connector_definition_id and d.status = 'available';
  v_risk_class := case when v_step.risk_class = 'R3' then 'R3' else 'R2' end;

  insert into workflow.commands (
    id, brand_id, environment_id, actor_profile_id, command_type, risk_class,
    idempotency_key, status, context_version, payload, correlation_id
  ) values (
    v_command_id, v_brand.id, v_environment.id, p_profile_id,
    'integration.connector.stage', v_risk_class, p_idempotency_key,
    'approval_required', v_step.context_version,
    jsonb_build_object(
      'legalEntityId', v_brand.legal_entity_id,
      'brandId', v_brand.id,
      'environmentId', v_environment.id,
      'onboardingStepId', v_step.id,
      'connectorDefinitionId', v_connector.id,
      'connectorKey', v_connector.key,
      'displayLabel', v_display_label,
      'requestedScopes', v_connector.required_scopes,
      'providerAuthorizationStarted', false,
      'providerAccountConnected', false,
      'discoveryStarted', false,
      'credentialsStored', false,
      'externalWrites', false
    ),
    v_request_id
  )
  on conflict (brand_id, environment_id, idempotency_key) do nothing
  returning id into v_inserted_command_id;

  if v_inserted_command_id is null then
    select r.* into strict v_request from integration.connector_requests r
    where r.brand_id = v_brand.id and r.environment_id = v_environment.id
      and r.idempotency_key = p_idempotency_key;
    if v_request.onboarding_step_id <> v_step.id or v_request.display_label <> v_display_label then
      raise exception 'idempotency key reused with different connector request' using errcode = '23505';
    end if;
    return jsonb_build_object(
      'contract', 'autopilots.connector-request.v1',
      'requestId', v_request.id,
      'commandId', v_request.command_id,
      'approvalId', v_request.approval_id,
      'status', v_request.request_status,
      'riskClass', v_request.risk_class,
      'replayed', true,
      'providerAuthorizationStarted', false,
      'providerAccountConnected', false,
      'discoveryStarted', false,
      'credentialsStored', false,
      'externalWrites', false
    );
  end if;

  insert into workflow.approvals (
    id, command_id, brand_id, risk_class, status, context_version, rationale,
    evidence, requested_by, requested_at
  ) values (
    v_approval_id, v_command_id, v_brand.id, v_risk_class, 'pending',
    v_step.context_version,
    'Connector authorization is staged only. Human approval is required before OAuth, discovery, credentials or provider access may start.',
    jsonb_build_array(
      'connector_request:' || v_request_id::text,
      'provider_authorization_started:false',
      'provider_account_connected:false',
      'discovery_started:false',
      'credentials_stored:false',
      'external_writes:false'
    ),
    p_profile_id, now()
  );

  insert into integration.connector_requests (
    id, legal_entity_id, brand_id, environment_id, onboarding_run_id,
    onboarding_step_id, connector_definition_id, requested_by, display_label,
    requested_scopes, risk_class, request_status, context_version,
    provider_authorization_started, provider_account_connected,
    discovery_started, credentials_stored, external_writes,
    command_id, approval_id, idempotency_key
  ) values (
    v_request_id, v_brand.legal_entity_id, v_brand.id, v_environment.id, v_run.id,
    v_step.id, v_connector.id, p_profile_id, v_display_label,
    v_connector.required_scopes, v_risk_class, 'approval_required', v_step.context_version,
    false, false, false, false, false,
    v_command_id, v_approval_id, p_idempotency_key
  ) returning * into v_request;

  insert into ledger.usage_entries (
    legal_entity_id, brand_id, environment_id, provider, metric, quantity, unit,
    total_cost_minor, currency, quality, source_reference, idempotency_key, occurred_at
  ) values (
    v_brand.legal_entity_id, v_brand.id, v_environment.id,
    'autopilots-control-plane', 'governed_command', 1, 'command',
    0, 'EUR', 'measured', v_command_id::text, 'usage:' || p_idempotency_key, now()
  );

  insert into audit.events (
    legal_entity_id, brand_id, environment_id, actor_type, actor_id, action,
    entity_type, entity_id, risk_class, result, reason, evidence,
    correlation_id, source
  ) values (
    v_brand.legal_entity_id, v_brand.id, v_environment.id,
    'user', p_profile_id::text, 'integration.connector.stage',
    'connector_request', v_request_id::text, v_risk_class, 'requested',
    'Connector intent staged; provider authorization, discovery, credentials and external writes remain blocked.',
    jsonb_build_array(jsonb_build_object(
      'commandId', v_command_id,
      'approvalId', v_approval_id,
      'onboardingStepId', v_step.id,
      'connectorKey', v_connector.key,
      'providerAuthorizationStarted', false,
      'providerAccountConnected', false,
      'discoveryStarted', false,
      'credentialsStored', false,
      'externalWrites', false
    )),
    v_request_id, 'autopilots-control-plane'
  );

  return jsonb_build_object(
    'contract', 'autopilots.connector-request.v1',
    'requestId', v_request.id,
    'commandId', v_request.command_id,
    'approvalId', v_request.approval_id,
    'status', v_request.request_status,
    'riskClass', v_request.risk_class,
    'replayed', false,
    'providerAuthorizationStarted', false,
    'providerAccountConnected', false,
    'discoveryStarted', false,
    'credentialsStored', false,
    'externalWrites', false
  );
end;
$$;

create or replace function public.autopilots_brand_onboarding(
  p_profile_id uuid,
  p_brand_slug text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, integration
as $$
declare
  v_brand core.brands%rowtype;
  v_result jsonb;
  v_can_manage boolean;
begin
  select b.* into v_brand from core.brands b where b.slug = p_brand_slug;
  if v_brand.id is null then raise exception 'brand not found' using errcode = 'P0002'; end if;
  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id and m.status = 'active'
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and (m.brand_id is null or m.brand_id = v_brand.id)
  ) then raise exception 'brand access denied' using errcode = '42501'; end if;

  select exists (
    select 1 from iam.memberships m
    where m.profile_id = p_profile_id and m.legal_entity_id = v_brand.legal_entity_id
      and m.brand_id is null and m.status = 'active' and m.role in ('owner', 'admin')
  ) into v_can_manage;

  select jsonb_build_object(
    'contract', 'autopilots.onboarding.v2',
    'brand', jsonb_build_object('id', v_brand.id, 'slug', v_brand.slug, 'name', v_brand.name, 'code', v_brand.code),
    'viewer', jsonb_build_object('profileId', p_profile_id, 'canManageConnectors', v_can_manage),
    'run', jsonb_build_object('id', r.id, 'status', r.status, 'currentStepKey', r.current_step_key, 'contextVersion', r.context_version),
    'steps', coalesce((select jsonb_agg(jsonb_build_object(
      'key', s.step_key, 'position', s.position, 'title', s.title, 'status', s.status,
      'riskClass', s.risk_class, 'required', s.required, 'instructions', s.instructions,
      'errorCode', s.error_code, 'evidence', s.evidence,
      'authorizationRequired', coalesce((s.configuration ->> 'authorization_required')::boolean, false),
      'contextVersion', s.context_version,
      'connector', case when d.id is null then null else jsonb_build_object(
        'key', d.key, 'name', d.display_name, 'authorizationType', d.authorization_type
      ) end
    ) order by s.position)
    from integration.onboarding_steps s
    left join integration.connector_definitions d on d.id = s.connector_definition_id
    where s.run_id = r.id), '[]'::jsonb),
    'connections', coalesce((select jsonb_agg(jsonb_build_object(
      'id', c.id, 'connectorKey', d.key, 'status', c.status,
      'lastSuccessAt', c.last_success_at, 'lastFailureAt', c.last_failure_at,
      'latestHealth', (select jsonb_build_object(
        'status', h.status, 'errorCode', h.error_code, 'severity', h.severity,
        'summary', h.summary, 'observedAt', h.observed_at
      ) from integration.health_events h where h.connection_id = c.id order by h.observed_at desc limit 1)
    ) order by d.key)
    from integration.connections c
    join integration.connector_definitions d on d.id = c.connector_definition_id
    where c.brand_id = v_brand.id), '[]'::jsonb),
    'connectorRequests', coalesce((select jsonb_agg(jsonb_build_object(
      'id', cr.id,
      'stepKey', s.step_key,
      'connectorKey', d.key,
      'displayLabel', cr.display_label,
      'status', cr.request_status,
      'riskClass', cr.risk_class,
      'contextVersion', cr.context_version,
      'commandId', cr.command_id,
      'approvalId', cr.approval_id,
      'providerAuthorizationStarted', cr.provider_authorization_started,
      'providerAccountConnected', cr.provider_account_connected,
      'discoveryStarted', cr.discovery_started,
      'credentialsStored', cr.credentials_stored,
      'externalWrites', cr.external_writes,
      'requestedAt', cr.created_at
    ) order by cr.created_at desc)
    from integration.connector_requests cr
    join integration.onboarding_steps s on s.id = cr.onboarding_step_id
    join integration.connector_definitions d on d.id = cr.connector_definition_id
    where cr.brand_id = v_brand.id), '[]'::jsonb),
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  ) into v_result
  from integration.onboarding_runs r
  where r.brand_id = v_brand.id and r.template_key = 'software_launch_v1'
  order by r.template_version desc limit 1;

  return v_result;
end;
$$;

revoke all on function public.autopilots_stage_connector_request(uuid, text, text, text, text) from public, anon, authenticated;
grant execute on function public.autopilots_stage_connector_request(uuid, text, text, text, text) to service_role;
revoke all on function public.autopilots_brand_onboarding(uuid, text) from public, anon, authenticated;
grant execute on function public.autopilots_brand_onboarding(uuid, text) to service_role;

commit;
