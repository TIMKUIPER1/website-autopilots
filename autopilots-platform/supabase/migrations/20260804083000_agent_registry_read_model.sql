begin;

create table workflow.agent_registry (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete restrict,
  agent_key text not null check (agent_key ~ '^[a-z][a-z0-9_]{2,62}$'),
  display_name text not null check (char_length(display_name) between 2 and 120),
  purpose text not null check (char_length(purpose) between 2 and 500),
  version text not null check (version ~ '^[0-9]+\.[0-9]+\.[0-9]+([+-][0-9A-Za-z.-]+)?$'),
  lifecycle_status text not null default 'draft'
    check (lifecycle_status in ('draft', 'registered', 'disabled', 'retired')),
  runtime_status text not null default 'unknown'
    check (runtime_status in ('unknown', 'ready', 'running', 'paused', 'stopped', 'unavailable')),
  risk_ceiling text not null default 'R0' check (risk_ceiling in ('R0', 'R1', 'R2', 'R3')),
  tool_allowlist jsonb not null default '[]'::jsonb check (jsonb_typeof(tool_allowlist) = 'array'),
  budget_limit_minor bigint check (budget_limit_minor is null or budget_limit_minor >= 0),
  currency text not null default 'EUR' check (currency ~ '^[A-Z]{3}$'),
  source_quality text not null default 'registered'
    check (source_quality in ('registered', 'observed', 'reconciled')),
  last_observed_at timestamptz,
  control_enabled boolean not null default false check (control_enabled = false),
  external_writes_enabled boolean not null default false check (external_writes_enabled = false),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, agent_key),
  unique (id, brand_id),
  check (
    (runtime_status = 'unknown' and last_observed_at is null and source_quality = 'registered')
    or (runtime_status <> 'unknown' and last_observed_at is not null and source_quality in ('observed', 'reconciled'))
  )
);

create index agent_registry_brand_lifecycle_idx
  on workflow.agent_registry (brand_id, lifecycle_status, display_name);

alter table workflow.agent_registry enable row level security;
revoke all on workflow.agent_registry from public, anon, authenticated;

create or replace function public.autopilots_agent_registry(
  p_profile_id uuid,
  p_brand_slug text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, workflow
as $$
declare
  v_brand core.brands%rowtype;
begin
  select b.* into v_brand
  from core.brands b
  where b.slug = p_brand_slug and b.status in ('foundation', 'active');
  if not found then raise exception 'operating brand not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1
    from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = v_brand.legal_entity_id
      and (m.brand_id is null or m.brand_id = v_brand.id)
      and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator', 'auditor')
  ) then
    raise exception 'operating brand agent registry role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.agent-registry.v1',
    'brand', jsonb_build_object('id', v_brand.id, 'slug', v_brand.slug, 'name', v_brand.name, 'code', v_brand.code),
    'summary', jsonb_build_object(
      'registeredAgents', (select count(*) from workflow.agent_registry a where a.brand_id = v_brand.id and a.lifecycle_status in ('registered', 'disabled')),
      'observedAgents', (select count(*) from workflow.agent_registry a where a.brand_id = v_brand.id and a.last_observed_at is not null),
      'activeControls', 0
    ),
    'agents', coalesce((select jsonb_agg(jsonb_build_object(
      'id', a.id,
      'key', a.agent_key,
      'name', a.display_name,
      'purpose', a.purpose,
      'version', a.version,
      'lifecycleStatus', a.lifecycle_status,
      'runtimeStatus', a.runtime_status,
      'riskCeiling', a.risk_ceiling,
      'tools', a.tool_allowlist,
      'budgetLimitMinor', a.budget_limit_minor,
      'currency', a.currency,
      'sourceQuality', a.source_quality,
      'lastObservedAt', a.last_observed_at,
      'controlEnabled', a.control_enabled,
      'externalWritesEnabled', a.external_writes_enabled,
      'updatedAt', a.updated_at
    ) order by a.display_name)
    from workflow.agent_registry a
    where a.brand_id = v_brand.id and a.lifecycle_status <> 'retired'), '[]'::jsonb),
    'registryAvailable', true,
    'genericAgentActionEnabled', false,
    'externalWritesEnabled', false,
    'demoMode', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_agent_registry(uuid, text) from public, anon, authenticated;
grant execute on function public.autopilots_agent_registry(uuid, text) to service_role;

commit;
