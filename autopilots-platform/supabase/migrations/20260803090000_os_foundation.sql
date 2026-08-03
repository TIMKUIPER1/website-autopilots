begin;

create extension if not exists pgcrypto;

create schema if not exists core;
create schema if not exists iam;
create schema if not exists integration;
create schema if not exists workflow;
create schema if not exists ledger;
create schema if not exists audit;

revoke all on schema core, iam, integration, workflow, ledger, audit from public, anon;
grant usage on schema core, iam, integration, workflow, ledger, audit to authenticated, service_role;

create table core.legal_entities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z][a-z0-9-]{2,62}$'),
  legal_name text not null,
  base_currency text not null default 'EUR' check (base_currency ~ '^[A-Z]{3}$'),
  status text not null default 'active' check (status in ('active', 'paused', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table core.brands (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z][a-z0-9-]{2,62}$'),
  name text not null,
  code text not null check (code ~ '^[A-Z0-9]{2,12}$'),
  status text not null default 'foundation' check (status in ('foundation', 'active', 'paused', 'retired')),
  risk_profile text not null default 'standard' check (risk_profile in ('low', 'standard', 'high', 'regulated')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (legal_entity_id, code),
  unique (id, legal_entity_id)
);

create table core.environments (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete cascade,
  kind text not null check (kind in ('demo', 'sandbox', 'staging', 'production')),
  status text not null default 'configured' check (status in ('configured', 'active', 'degraded', 'paused', 'retired')),
  region text,
  external_writes_enabled boolean not null default false,
  context_version bigint not null default 1 check (context_version > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, kind),
  unique (id, brand_id),
  check (kind = 'production' or external_writes_enabled = false)
);

create table iam.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null,
  status text not null default 'active' check (status in ('invited', 'active', 'suspended', 'deactivated')),
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_lower_uq on iam.profiles (lower(email));

create table iam.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references iam.profiles(id) on delete cascade,
  legal_entity_id uuid not null references core.legal_entities(id) on delete cascade,
  brand_id uuid,
  role text not null check (role in ('owner', 'admin', 'operator', 'finance', 'auditor', 'viewer')),
  status text not null default 'active' check (status in ('active', 'suspended', 'revoked')),
  granted_by uuid references iam.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete cascade
);

create unique index memberships_scope_uq
  on iam.memberships (profile_id, legal_entity_id, coalesce(brand_id, '00000000-0000-0000-0000-000000000000'::uuid));
create index memberships_profile_status_idx on iam.memberships (profile_id, status);
create index memberships_brand_status_idx on iam.memberships (brand_id, status) where brand_id is not null;

create or replace function iam.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = iam, auth, pg_catalog
as $$
  select p.id from iam.profiles p where p.auth_user_id = auth.uid() and p.status = 'active'
$$;

create or replace function iam.has_legal_entity_access(target_legal_entity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = iam, pg_catalog
as $$
  select exists (
    select 1
    from iam.memberships m
    where m.profile_id = iam.current_profile_id()
      and m.legal_entity_id = target_legal_entity_id
      and m.status = 'active'
  )
$$;

create or replace function iam.has_brand_access(target_brand_id uuid)
returns boolean
language sql
stable
security definer
set search_path = iam, core, pg_catalog
as $$
  select exists (
    select 1
    from core.brands b
    join iam.memberships m on m.legal_entity_id = b.legal_entity_id
    where b.id = target_brand_id
      and m.profile_id = iam.current_profile_id()
      and m.status = 'active'
      and (m.brand_id is null or m.brand_id = b.id)
  )
$$;

revoke all on function iam.current_profile_id(), iam.has_legal_entity_access(uuid), iam.has_brand_access(uuid) from public, anon;
grant execute on function iam.current_profile_id(), iam.has_legal_entity_access(uuid), iam.has_brand_access(uuid) to authenticated, service_role;

create table integration.connector_definitions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique check (key ~ '^[a-z][a-z0-9_]{2,62}$'),
  display_name text not null,
  category text not null,
  authorization_type text not null check (authorization_type in ('oauth2', 'api_key', 'service_account', 'signed_webhook', 'internal')),
  capabilities jsonb not null default '[]'::jsonb check (jsonb_typeof(capabilities) = 'array'),
  required_scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(required_scopes) = 'array'),
  risk_class text not null default 'R1' check (risk_class in ('R0', 'R1', 'R2', 'R3')),
  supports_discovery boolean not null default false,
  supports_sandbox boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'available', 'deprecated', 'blocked')),
  contract_version integer not null default 1 check (contract_version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table integration.connections (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete cascade,
  environment_id uuid not null,
  connector_definition_id uuid not null references integration.connector_definitions(id) on delete restrict,
  external_account_id text check (external_account_id is null or length(trim(external_account_id)) > 0),
  display_name text not null,
  status text not null default 'pending' check (status in ('pending', 'authorizing', 'connected', 'degraded', 'expired', 'revoked', 'blocked')),
  credential_reference text check (credential_reference is null or credential_reference ~ '^vault://'),
  granted_scopes jsonb not null default '[]'::jsonb check (jsonb_typeof(granted_scopes) = 'array'),
  configuration jsonb not null default '{}'::jsonb,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  context_version bigint not null default 1 check (context_version > 0),
  created_by uuid references iam.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (environment_id, brand_id) references core.environments(id, brand_id) on delete cascade,
  unique (id, brand_id)
);

create index connections_brand_status_idx on integration.connections (brand_id, status);
create index connections_environment_idx on integration.connections (environment_id);
create unique index connections_account_uq
  on integration.connections (environment_id, connector_definition_id, coalesce(external_account_id, ''));

create table integration.discovered_resources (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null,
  brand_id uuid not null references core.brands(id) on delete cascade,
  resource_type text not null,
  external_id text not null,
  display_name text,
  classification text not null default 'unclassified' check (classification in ('unclassified', 'demo', 'sandbox', 'staging', 'production')),
  metadata jsonb not null default '{}'::jsonb,
  discovered_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  unique (connection_id, resource_type, external_id),
  foreign key (connection_id, brand_id) references integration.connections(id, brand_id) on delete cascade
);

create table integration.resource_mappings (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null,
  brand_id uuid not null references core.brands(id) on delete cascade,
  resource_type text not null,
  external_id text not null,
  internal_entity_type text not null,
  internal_entity_id uuid not null,
  confidence numeric(5,4) not null check (confidence between 0 and 1),
  status text not null default 'proposed' check (status in ('proposed', 'approved', 'rejected', 'superseded')),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  proposed_by text not null check (proposed_by in ('deterministic', 'ai', 'human')),
  approved_by uuid references iam.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (connection_id, resource_type, external_id, internal_entity_type, internal_entity_id),
  foreign key (connection_id, brand_id) references integration.connections(id, brand_id) on delete cascade
);

create table integration.sync_runs (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null,
  brand_id uuid not null references core.brands(id) on delete cascade,
  mode text not null check (mode in ('discovery', 'incremental', 'full', 'reconciliation', 'health_check')),
  status text not null check (status in ('queued', 'running', 'succeeded', 'partial', 'failed', 'cancelled')),
  cursor_before text,
  cursor_after text,
  records_seen bigint not null default 0 check (records_seen >= 0),
  records_changed bigint not null default 0 check (records_changed >= 0),
  error_code text,
  error_detail jsonb,
  correlation_id uuid not null default gen_random_uuid(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (connection_id, brand_id) references integration.connections(id, brand_id) on delete cascade
);

create index sync_runs_connection_created_idx on integration.sync_runs (connection_id, created_at desc);
create index sync_runs_brand_status_idx on integration.sync_runs (brand_id, status);

create table integration.health_events (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null,
  brand_id uuid not null references core.brands(id) on delete cascade,
  status text not null check (status in ('healthy', 'degraded', 'unavailable', 'expired', 'blocked', 'unknown')),
  error_code text,
  severity text not null default 'P3' check (severity in ('P0', 'P1', 'P2', 'P3')),
  summary text not null,
  details jsonb not null default '{}'::jsonb,
  correlation_id uuid not null default gen_random_uuid(),
  observed_at timestamptz not null default now(),
  foreign key (connection_id, brand_id) references integration.connections(id, brand_id) on delete cascade
);

create index health_events_connection_observed_idx on integration.health_events (connection_id, observed_at desc);
create index health_events_brand_severity_idx on integration.health_events (brand_id, severity, observed_at desc);

create table integration.incidents (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete cascade,
  connection_id uuid,
  code text not null,
  severity text not null check (severity in ('P0', 'P1', 'P2', 'P3')),
  status text not null default 'open' check (status in ('open', 'acknowledged', 'mitigating', 'resolved', 'closed')),
  title text not null,
  impact text not null,
  retryable boolean not null default false,
  retry_at timestamptz,
  occurrence_count bigint not null default 1 check (occurrence_count > 0),
  first_observed_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  owner_profile_id uuid references iam.profiles(id) on delete set null,
  runbook_reference text,
  correlation_id uuid not null default gen_random_uuid(),
  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (connection_id, brand_id) references integration.connections(id, brand_id) on delete restrict,
  unique (id, brand_id)
);

create index incidents_brand_status_severity_idx on integration.incidents (brand_id, status, severity);

create table workflow.commands (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete restrict,
  environment_id uuid not null,
  actor_profile_id uuid references iam.profiles(id) on delete set null,
  command_type text not null,
  risk_class text not null check (risk_class in ('R0', 'R1', 'R2', 'R3')),
  idempotency_key text not null,
  status text not null default 'requested' check (status in ('requested', 'approval_required', 'approved', 'running', 'succeeded', 'failed', 'rejected', 'cancelled')),
  context_version bigint not null check (context_version > 0),
  payload jsonb not null default '{}'::jsonb,
  result jsonb,
  error_code text,
  correlation_id uuid not null default gen_random_uuid(),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (brand_id, environment_id, idempotency_key),
  unique (id, brand_id),
  foreign key (environment_id, brand_id) references core.environments(id, brand_id) on delete restrict
);

create index commands_brand_status_idx on workflow.commands (brand_id, status, requested_at desc);

create table workflow.approvals (
  id uuid primary key default gen_random_uuid(),
  command_id uuid not null unique,
  brand_id uuid not null references core.brands(id) on delete restrict,
  risk_class text not null check (risk_class in ('R2', 'R3')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired', 'superseded')),
  context_version bigint not null check (context_version > 0),
  rationale text not null,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  requested_by uuid references iam.profiles(id) on delete set null,
  decided_by uuid references iam.profiles(id) on delete set null,
  requested_at timestamptz not null default now(),
  decided_at timestamptz,
  expires_at timestamptz,
  foreign key (command_id, brand_id) references workflow.commands(id, brand_id) on delete cascade,
  unique (id, brand_id),
  check (
    (status = 'pending' and decided_by is null and decided_at is null)
    or status in ('expired', 'superseded')
    or (status in ('approved', 'rejected') and decided_by is not null and decided_at is not null)
  )
);

create index approvals_brand_status_idx on workflow.approvals (brand_id, status, requested_at desc);

create table workflow.tasks (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete cascade,
  incident_id uuid,
  approval_id uuid,
  title text not null,
  priority text not null default 'P2' check (priority in ('P0', 'P1', 'P2', 'P3')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'waiting', 'resolved', 'cancelled')),
  assigned_profile_id uuid references iam.profiles(id) on delete set null,
  due_at timestamptz,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (incident_id, brand_id) references integration.incidents(id, brand_id) on delete set null (incident_id),
  foreign key (approval_id, brand_id) references workflow.approvals(id, brand_id) on delete set null (approval_id)
);

create index tasks_brand_status_priority_idx on workflow.tasks (brand_id, status, priority);

create table ledger.usage_entries (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  brand_id uuid not null references core.brands(id) on delete restrict,
  environment_id uuid not null,
  customer_id uuid,
  provider text not null,
  metric text not null,
  quantity numeric(20,6) not null check (quantity >= 0),
  unit text not null,
  total_cost_minor bigint not null,
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  quality text not null check (quality in ('estimated', 'measured', 'reconciled', 'booked')),
  source_reference text not null,
  adjusts_entry_id uuid,
  idempotency_key text not null,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (brand_id, environment_id, idempotency_key),
  unique (id, brand_id),
  check (adjusts_entry_id is null or adjusts_entry_id <> id),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete restrict,
  foreign key (environment_id, brand_id) references core.environments(id, brand_id) on delete restrict,
  foreign key (adjusts_entry_id, brand_id) references ledger.usage_entries(id, brand_id) on delete restrict
);

create index usage_entries_brand_occurred_idx on ledger.usage_entries (brand_id, occurred_at desc);

create table audit.events (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid references core.legal_entities(id) on delete restrict,
  brand_id uuid references core.brands(id) on delete restrict,
  environment_id uuid references core.environments(id) on delete restrict,
  actor_type text not null check (actor_type in ('user', 'system', 'agent', 'provider')),
  actor_id text,
  action text not null,
  entity_type text not null,
  entity_id text,
  risk_class text not null default 'R0' check (risk_class in ('R0', 'R1', 'R2', 'R3')),
  result text not null check (result in ('requested', 'succeeded', 'failed', 'rejected', 'blocked')),
  reason text,
  before_value jsonb,
  after_value jsonb,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  correlation_id uuid not null default gen_random_uuid(),
  causation_id uuid,
  source text not null,
  occurred_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete restrict,
  foreign key (environment_id, brand_id) references core.environments(id, brand_id) on delete restrict
);

create index audit_events_brand_occurred_idx on audit.events (brand_id, occurred_at desc);
create index audit_events_correlation_idx on audit.events (correlation_id);

create or replace function audit.reject_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception '% is append-only', tg_table_name using errcode = '55000';
end
$$;

create trigger audit_events_append_only
before update or delete on audit.events
for each row execute function audit.reject_mutation();

create trigger usage_entries_append_only
before update or delete on ledger.usage_entries
for each row execute function audit.reject_mutation();

alter table core.legal_entities enable row level security;
alter table core.brands enable row level security;
alter table core.environments enable row level security;
alter table iam.profiles enable row level security;
alter table iam.memberships enable row level security;
alter table integration.connector_definitions enable row level security;
alter table integration.connections enable row level security;
alter table integration.discovered_resources enable row level security;
alter table integration.resource_mappings enable row level security;
alter table integration.sync_runs enable row level security;
alter table integration.health_events enable row level security;
alter table integration.incidents enable row level security;
alter table workflow.commands enable row level security;
alter table workflow.approvals enable row level security;
alter table workflow.tasks enable row level security;
alter table ledger.usage_entries enable row level security;
alter table audit.events enable row level security;

create policy legal_entities_read on core.legal_entities for select to authenticated
  using (iam.has_legal_entity_access(id));
create policy brands_read on core.brands for select to authenticated
  using (iam.has_brand_access(id));
create policy environments_read on core.environments for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy profiles_self_read on iam.profiles for select to authenticated
  using (auth_user_id = auth.uid());
create policy memberships_self_read on iam.memberships for select to authenticated
  using (profile_id = iam.current_profile_id());
create policy connector_definitions_read on integration.connector_definitions for select to authenticated
  using (status in ('available', 'deprecated'));
create policy connections_read on integration.connections for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy discovered_resources_read on integration.discovered_resources for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy resource_mappings_read on integration.resource_mappings for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy sync_runs_read on integration.sync_runs for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy health_events_read on integration.health_events for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy incidents_read on integration.incidents for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy commands_read on workflow.commands for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy approvals_read on workflow.approvals for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy tasks_read on workflow.tasks for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy usage_entries_read on ledger.usage_entries for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy audit_events_read on audit.events for select to authenticated
  using (brand_id is not null and iam.has_brand_access(brand_id));

grant select on all tables in schema core, iam, integration, workflow, ledger, audit to authenticated;
grant select, insert, update, delete on all tables in schema core, iam, integration, workflow to service_role;
grant select, insert on all tables in schema ledger, audit to service_role;
grant usage, select on all sequences in schema core, iam, integration, workflow, ledger, audit to service_role;

insert into core.legal_entities (id, slug, legal_name, base_currency, status)
values ('10000000-0000-4000-8000-000000000001', 'autopilots-ai-agency', 'Autopilots AI Agency LLC', 'EUR', 'active')
on conflict (id) do nothing;

insert into core.brands (id, legal_entity_id, slug, name, code, status)
values
  ('20000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', 'autopilots', 'Autopilots', 'AP', 'active'),
  ('20000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000001', 'autoreviews', 'AutoReviews', 'AR', 'foundation'),
  ('20000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', 'autoplanner', 'AutoPlanner', 'PL', 'foundation'),
  ('20000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', 'roofplanner', 'RoofPlanner', 'RP', 'foundation')
on conflict (id) do nothing;

insert into core.environments (brand_id, kind, status, external_writes_enabled)
select id, kind, 'configured', false
from core.brands
cross join (values ('demo'), ('sandbox'), ('staging'), ('production')) as environments(kind)
on conflict (brand_id, kind) do nothing;

insert into integration.connector_definitions
  (key, display_name, category, authorization_type, capabilities, required_scopes, risk_class, supports_discovery, supports_sandbox, status)
values
  ('stripe', 'Stripe', 'billing', 'oauth2', '["discover","health","sync","webhooks","reconcile"]', '[]', 'R3', true, true, 'available'),
  ('website', 'Website', 'experience', 'internal', '["health","release_identity","acquisition"]', '[]', 'R1', true, true, 'available'),
  ('supabase', 'Supabase', 'database', 'api_key', '["discover","health","usage","backups"]', '[]', 'R3', true, true, 'available'),
  ('github', 'GitHub', 'source_control', 'oauth2', '["discover","health","deployments"]', '[]', 'R2', true, true, 'available'),
  ('gohighlevel', 'GoHighLevel', 'crm', 'oauth2', '["discover","health","sync","webhooks"]', '[]', 'R2', true, true, 'draft')
on conflict (key) do nothing;

commit;
