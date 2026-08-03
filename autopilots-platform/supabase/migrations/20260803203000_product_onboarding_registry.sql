begin;

create table integration.onboarding_runs (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references core.brands(id) on delete cascade,
  environment_id uuid not null,
  template_key text not null check (template_key ~ '^[a-z][a-z0-9_]{2,62}$'),
  template_version integer not null check (template_version > 0),
  status text not null check (status in ('not_started', 'in_progress', 'blocked', 'ready', 'completed')),
  current_step_key text,
  context_version bigint not null default 1 check (context_version > 0),
  created_by uuid references iam.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (environment_id, brand_id) references core.environments(id, brand_id) on delete cascade,
  unique (brand_id, environment_id, template_key, template_version),
  unique (id, brand_id)
);

create table integration.onboarding_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null,
  brand_id uuid not null references core.brands(id) on delete cascade,
  step_key text not null check (step_key ~ '^[a-z][a-z0-9_]{2,62}$'),
  position integer not null check (position > 0),
  connector_definition_id uuid references integration.connector_definitions(id) on delete restrict,
  status text not null check (status in ('pending', 'ready', 'authorizing', 'discovering', 'validation_required', 'blocked', 'completed', 'skipped')),
  risk_class text not null check (risk_class in ('R0', 'R1', 'R2', 'R3')),
  required boolean not null default true,
  title text not null,
  instructions text not null,
  error_code text,
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  configuration jsonb not null default '{}'::jsonb,
  context_version bigint not null default 1 check (context_version > 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (run_id, brand_id) references integration.onboarding_runs(id, brand_id) on delete cascade,
  unique (run_id, step_key),
  unique (run_id, position)
);

create index onboarding_runs_brand_status_idx on integration.onboarding_runs (brand_id, status);
create index onboarding_steps_brand_status_idx on integration.onboarding_steps (brand_id, status, position);

alter table integration.onboarding_runs enable row level security;
alter table integration.onboarding_steps enable row level security;
create policy onboarding_runs_read on integration.onboarding_runs for select to authenticated
  using (iam.has_brand_access(brand_id));
create policy onboarding_steps_read on integration.onboarding_steps for select to authenticated
  using (iam.has_brand_access(brand_id));
grant select on integration.onboarding_runs, integration.onboarding_steps to authenticated;
grant select, insert, update, delete on integration.onboarding_runs, integration.onboarding_steps to service_role;

insert into integration.connector_definitions (
  id, key, display_name, category, authorization_type, capabilities,
  required_scopes, risk_class, supports_discovery, supports_sandbox, status
) values (
  '30000000-0000-4000-8000-000000000006', 'product_api', 'Product API',
  'product_runtime', 'internal', '["health","ready","snapshot","incidents","usage"]',
  '[]', 'R1', true, true, 'available'
)
on conflict (key) do update set
  display_name = excluded.display_name,
  capabilities = excluded.capabilities,
  supports_discovery = excluded.supports_discovery,
  supports_sandbox = excluded.supports_sandbox,
  status = excluded.status,
  updated_at = now();

insert into integration.onboarding_runs (
  id, brand_id, environment_id, template_key, template_version, status,
  current_step_key, created_by
)
select
  case b.slug
    when 'autopilots' then '91000000-0000-4000-8000-000000000001'::uuid
    when 'autoreviews' then '91000000-0000-4000-8000-000000000002'::uuid
    when 'autoplanner' then '91000000-0000-4000-8000-000000000003'::uuid
    when 'roofplanner' then '91000000-0000-4000-8000-000000000004'::uuid
  end,
  b.id, e.id, 'software_launch_v1', 1, 'in_progress', 'website',
  '40000000-0000-4000-8000-000000000001'
from core.brands b
join core.environments e on e.brand_id = b.id and e.kind = 'sandbox'
where b.slug in ('autopilots', 'autoreviews', 'autoplanner', 'roofplanner')
on conflict (brand_id, environment_id, template_key, template_version) do nothing;

insert into integration.onboarding_steps (
  run_id, brand_id, step_key, position, connector_definition_id, status,
  risk_class, required, title, instructions, error_code, evidence, configuration,
  completed_at
)
select
  r.id, r.brand_id, s.step_key, s.position, d.id,
  case
    when s.step_key = 'foundation' then 'completed'
    when s.step_key = 'product_api' and b.slug = 'autopilots' then 'completed'
    when s.step_key = 'product_api' and b.slug = 'autoplanner' then 'validation_required'
    when s.step_key = 'product_api' then 'blocked'
    when s.step_key = 'monitoring' then 'validation_required'
    else 'pending'
  end,
  s.risk_class, true, s.title, s.instructions,
  case
    when s.step_key = 'product_api' and b.slug = 'autoplanner' then 'AUTOPLANNER_DEPENDENCIES_MISSING'
    when s.step_key = 'product_api' and b.slug = 'autoreviews' then 'AUTOREVIEWS_LEGACY_SOURCE_UNREACHABLE'
    when s.step_key = 'product_api' and b.slug = 'roofplanner' then 'ROOFPLANNER_API_UNREACHABLE'
    else null
  end,
  case
    when s.step_key = 'foundation' then jsonb_build_array('brand_seeded', 'sandbox_environment_seeded')
    when s.step_key = 'product_api' and b.slug = 'autopilots' then jsonb_build_array('health:http_200', 'durable_sessions:verified')
    when s.step_key = 'product_api' and b.slug = 'autoplanner' then jsonb_build_array('health:http_200', 'database:missing', 'queue:missing')
    when s.step_key = 'product_api' and b.slug = 'roofplanner' then jsonb_build_array('repository:TIMKUIPER1/roofplanner', 'health_contract:/health', 'ready_contract:/ready')
    when s.step_key = 'product_api' and b.slug = 'autoreviews' then jsonb_build_array('legacy_adapter:aggregate_no_pii')
    else '[]'::jsonb
  end,
  jsonb_build_object('external_writes_enabled', false, 'authorization_required', s.authorization_required),
  case when s.step_key = 'foundation' or (s.step_key = 'product_api' and b.slug = 'autopilots') then now() else null end
from integration.onboarding_runs r
join core.brands b on b.id = r.brand_id
cross join (values
  ('foundation', 1, null::text, 'R0', 'Fundament', 'Bevestig brand, eigenaar, omgeving en server-side scope.', false),
  ('website', 2, 'website', 'R1', 'Website', 'Koppel domein, health-URL en release-identiteit; start read-only.', true),
  ('supabase', 3, 'supabase', 'R3', 'Supabase', 'Log in, ontdek projecten en keur de juiste projectmapping menselijk goed.', true),
  ('product_api', 4, 'product_api', 'R1', 'Product-backend', 'Valideer health, readiness en het versioned no-PII snapshotcontract.', false),
  ('stripe', 5, 'stripe', 'R3', 'Stripe', 'Log in en ontdek testproducten read-only; geen prijs- of subscriptionwrites.', true),
  ('monitoring', 6, null::text, 'R1', 'Monitoring', 'Activeer foutcodes, freshness, incidenten en owner alerts.', false)
) as s(step_key, position, connector_key, risk_class, title, instructions, authorization_required)
left join integration.connector_definitions d on d.key = s.connector_key
where r.template_key = 'software_launch_v1' and r.template_version = 1
on conflict (run_id, step_key) do nothing;

insert into integration.connections (
  id, brand_id, environment_id, connector_definition_id, external_account_id,
  display_name, status, granted_scopes, configuration, last_success_at,
  last_failure_at, created_by
)
select
  case b.slug
    when 'autopilots' then '92000000-0000-4000-8000-000000000001'::uuid
    when 'autoreviews' then '92000000-0000-4000-8000-000000000002'::uuid
    when 'autoplanner' then '92000000-0000-4000-8000-000000000003'::uuid
    when 'roofplanner' then '92000000-0000-4000-8000-000000000004'::uuid
  end,
  b.id, e.id, d.id, 'sandbox-runtime', b.name || ' product runtime',
  case when b.slug = 'autopilots' then 'connected' else 'degraded' end,
  '["health","ready","snapshot"]',
  jsonb_build_object(
    'contract', 'autopilots.product-snapshot.v1',
    'external_writes_enabled', false,
    'source_quality', case when b.slug = 'autopilots' then 'local_runtime_verified' else 'repository_and_endpoint_inspection' end,
    'health_path', case when b.slug in ('autopilots','roofplanner') then '/health' else '/api/health' end,
    'ready_path', case when b.slug = 'roofplanner' then '/ready' when b.slug = 'autoplanner' then '/api/health/ready' else null end,
    'repository', case when b.slug = 'autoplanner' then 'Autopilots-AI-Agency/autoplanner' when b.slug = 'roofplanner' then 'TIMKUIPER1/roofplanner' else null end
  ),
  case when b.slug = 'autopilots' then now() else null end,
  case when b.slug <> 'autopilots' then now() else null end,
  '40000000-0000-4000-8000-000000000001'
from core.brands b
join core.environments e on e.brand_id = b.id and e.kind = 'sandbox'
join integration.connector_definitions d on d.key = 'product_api'
where b.slug in ('autopilots', 'autoreviews', 'autoplanner', 'roofplanner')
on conflict (environment_id, connector_definition_id, coalesce(external_account_id, '')) do nothing;

insert into integration.health_events (
  connection_id, brand_id, status, error_code, severity, summary, details
)
select
  c.id, c.brand_id,
  case when b.slug = 'autoplanner' then 'degraded' else 'unavailable' end,
  case b.slug
    when 'autoplanner' then 'AUTOPLANNER_DEPENDENCIES_MISSING'
    when 'autoreviews' then 'AUTOREVIEWS_LEGACY_SOURCE_UNREACHABLE'
    when 'roofplanner' then 'ROOFPLANNER_API_UNREACHABLE'
  end,
  'P2',
  case b.slug
    when 'autoplanner' then 'Health antwoordt, maar database en queue ontbreken.'
    when 'autoreviews' then 'Legacy aggregate bron is lokaal niet bereikbaar.'
    when 'roofplanner' then 'Product API contract bestaat, maar de runtime is niet bereikbaar.'
  end,
  jsonb_build_object('external_writes_enabled', false, 'observation', '2026-08-03 local read-only inspection')
from integration.connections c
join core.brands b on b.id = c.brand_id
join integration.connector_definitions d on d.id = c.connector_definition_id and d.key = 'product_api'
where b.slug in ('autoreviews', 'autoplanner', 'roofplanner')
  and not exists (
    select 1 from integration.health_events h
    where h.connection_id = c.id and h.error_code = case b.slug
      when 'autoplanner' then 'AUTOPLANNER_DEPENDENCIES_MISSING'
      when 'autoreviews' then 'AUTOREVIEWS_LEGACY_SOURCE_UNREACHABLE'
      when 'roofplanner' then 'ROOFPLANNER_API_UNREACHABLE' end
  );

create or replace function public.autopilots_brand_onboarding(
  p_profile_id uuid,
  p_brand_slug text
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = public, core, iam, integration, pg_catalog
as $$
declare
  v_brand core.brands%rowtype;
  v_result jsonb;
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

  select jsonb_build_object(
    'contract', 'autopilots.onboarding.v1',
    'brand', jsonb_build_object('id', v_brand.id, 'slug', v_brand.slug, 'name', v_brand.name, 'code', v_brand.code),
    'run', jsonb_build_object('id', r.id, 'status', r.status, 'currentStepKey', r.current_step_key, 'contextVersion', r.context_version),
    'steps', coalesce((select jsonb_agg(jsonb_build_object(
      'key', s.step_key, 'position', s.position, 'title', s.title, 'status', s.status,
      'riskClass', s.risk_class, 'required', s.required, 'instructions', s.instructions,
      'errorCode', s.error_code, 'evidence', s.evidence,
      'connector', case when d.id is null then null else jsonb_build_object('key', d.key, 'name', d.display_name, 'authorizationType', d.authorization_type) end
    ) order by s.position)
    from integration.onboarding_steps s
    left join integration.connector_definitions d on d.id = s.connector_definition_id
    where s.run_id = r.id), '[]'::jsonb),
    'connections', coalesce((select jsonb_agg(jsonb_build_object(
      'id', c.id, 'connectorKey', d.key, 'status', c.status,
      'lastSuccessAt', c.last_success_at, 'lastFailureAt', c.last_failure_at,
      'latestHealth', (select jsonb_build_object('status', h.status, 'errorCode', h.error_code, 'severity', h.severity, 'summary', h.summary, 'observedAt', h.observed_at)
        from integration.health_events h where h.connection_id = c.id order by h.observed_at desc limit 1)
    ) order by d.key)
    from integration.connections c
    join integration.connector_definitions d on d.id = c.connector_definition_id
    where c.brand_id = v_brand.id), '[]'::jsonb),
    'externalWritesEnabled', false,
    'generatedAt', now()
  ) into v_result
  from integration.onboarding_runs r
  where r.brand_id = v_brand.id and r.template_key = 'software_launch_v1'
  order by r.template_version desc limit 1;

  return v_result;
end
$$;

revoke all on function public.autopilots_brand_onboarding(uuid, text) from public, anon, authenticated;
grant execute on function public.autopilots_brand_onboarding(uuid, text) to service_role;

commit;
