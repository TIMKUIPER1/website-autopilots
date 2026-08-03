begin;

alter table integration.product_snapshot_contracts
  add constraint product_snapshot_contracts_id_brand_entity_uq
  unique (id, brand_id, legal_entity_id);

create table integration.product_connection_gate_policies (
  gate_key text primary key check (gate_key in (
    'project_identity', 'owned_https_endpoint', 'vault_secret_reference',
    'contract_probe', 'privacy_probe', 'freshness_probe', 'reconciliation',
    'revocation_test', 'rate_limit_test', 'failure_mode_test',
    'independent_review', 'current_human_approval'
  )),
  position smallint not null unique check (position between 1 and 12),
  blocker_code text not null unique check (blocker_code ~ '^[A-Z][A-Z0-9_]{3,63}$'),
  maximum_age_seconds integer not null check (maximum_age_seconds between 900 and 2592000),
  requires_current_context boolean not null default false,
  external_effect boolean not null default false check (external_effect = false)
);

alter table integration.product_connection_gate_policies enable row level security;
revoke all on integration.product_connection_gate_policies from public, anon, authenticated;
grant select on integration.product_connection_gate_policies to service_role;
revoke insert, update, delete, truncate, references, trigger
  on integration.product_connection_gate_policies from service_role;

insert into integration.product_connection_gate_policies (
  gate_key, position, blocker_code, maximum_age_seconds, requires_current_context
) values
  ('project_identity', 1, 'PROJECT_IDENTITY_UNVERIFIED', 2592000, false),
  ('owned_https_endpoint', 2, 'ENDPOINT_NOT_VERIFIED', 604800, false),
  ('vault_secret_reference', 3, 'SECRET_REFERENCE_MISSING', 604800, false),
  ('contract_probe', 4, 'CONTRACT_PROBE_REQUIRED', 86400, false),
  ('privacy_probe', 5, 'PRIVACY_PROBE_REQUIRED', 86400, false),
  ('freshness_probe', 6, 'FRESHNESS_PROBE_REQUIRED', 86400, false),
  ('reconciliation', 7, 'RECONCILIATION_REQUIRED', 86400, false),
  ('revocation_test', 8, 'REVOCATION_TEST_REQUIRED', 2592000, false),
  ('rate_limit_test', 9, 'RATE_LIMIT_TEST_REQUIRED', 2592000, false),
  ('failure_mode_test', 10, 'FAILURE_MODE_TEST_REQUIRED', 604800, false),
  ('independent_review', 11, 'INDEPENDENT_REVIEW_REQUIRED', 2592000, false),
  ('current_human_approval', 12, 'CURRENT_APPROVAL_REQUIRED', 900, true);

create table integration.product_connection_gate_evidence (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  brand_id uuid not null,
  snapshot_contract_id uuid not null,
  gate_key text not null references integration.product_connection_gate_policies(gate_key) on delete restrict,
  result text not null check (result in ('passed', 'failed')),
  evidence_sha256 text not null check (evidence_sha256 ~ '^[0-9a-f]{64}$'),
  source_category text not null check (source_category in (
    'schema_verifier', 'transport_probe', 'contract_validator', 'reconciliation',
    'security_test', 'independent_review', 'human_approval'
  )),
  observed_at timestamptz not null,
  expires_at timestamptz not null,
  context_version bigint,
  recorded_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id)
    references core.brands(id, legal_entity_id) on delete restrict,
  foreign key (snapshot_contract_id, brand_id, legal_entity_id)
    references integration.product_snapshot_contracts(id, brand_id, legal_entity_id) on delete restrict,
  check (observed_at <= recorded_at + interval '60 seconds'),
  check (expires_at > observed_at),
  check ((gate_key = 'current_human_approval') = (context_version is not null)),
  unique (snapshot_contract_id, gate_key, observed_at, evidence_sha256)
);

alter table integration.product_connection_gate_evidence enable row level security;
revoke all on integration.product_connection_gate_evidence from public, anon, authenticated;
grant select on integration.product_connection_gate_evidence to service_role;
revoke insert, update, delete, truncate, references, trigger
  on integration.product_connection_gate_evidence from service_role;

create or replace function public.autopilots_product_connection_readiness(
  p_profile_id uuid,
  p_legal_entity_id uuid
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = pg_catalog, public, core, iam, integration
as $$
declare
  v_result jsonb;
begin
  if not exists (
    select 1
    from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator', 'auditor')
  ) then
    raise exception 'organization readiness role required' using errcode = '42501';
  end if;

  with scoped_contracts as (
    select c.*, b.slug, b.name, d.registration_status, d.verified_at as identity_verified_at
    from integration.product_snapshot_contracts c
    join core.brands b on b.id = c.brand_id and b.legal_entity_id = c.legal_entity_id
    left join integration.product_data_planes d
      on d.id = c.product_data_plane_id and d.brand_id = c.brand_id
      and d.legal_entity_id = c.legal_entity_id and d.purpose = 'product_data'
    where c.legal_entity_id = p_legal_entity_id and b.status <> 'retired'
  ), latest_evidence as (
    select distinct on (e.snapshot_contract_id, e.gate_key)
      e.snapshot_contract_id, e.gate_key, e.result, e.observed_at, e.expires_at
    from integration.product_connection_gate_evidence e
    join scoped_contracts c on c.id = e.snapshot_contract_id
    where e.gate_key <> 'current_human_approval'
    order by e.snapshot_contract_id, e.gate_key, e.observed_at desc, e.recorded_at desc
  ), gate_rows as (
    select
      c.id as contract_id,
      p.gate_key,
      p.position,
      case
        when p.gate_key = 'project_identity'
          and c.registration_status = 'verified'
          and c.identity_verified_at > now() - make_interval(secs => p.maximum_age_seconds)
          then 'passed'
        when p.gate_key = 'current_human_approval' then 'blocked'
        when e.result = 'passed'
          and e.observed_at <= now() + interval '60 seconds'
          and e.expires_at > now()
          and e.expires_at - e.observed_at <= make_interval(secs => p.maximum_age_seconds)
          then 'passed'
        else 'blocked'
      end as gate_status,
      case
        when p.gate_key = 'project_identity'
          and c.registration_status = 'verified'
          and c.identity_verified_at > now() - make_interval(secs => p.maximum_age_seconds)
          then null
        when p.gate_key = 'current_human_approval' then p.blocker_code
        when e.result = 'passed' and (
          e.expires_at <= now()
          or e.observed_at > now() + interval '60 seconds'
          or e.expires_at - e.observed_at > make_interval(secs => p.maximum_age_seconds)
        ) then p.blocker_code || '_STALE'
        else p.blocker_code
      end as blocker_code,
      case
        when p.gate_key = 'project_identity' then c.identity_verified_at
        else e.observed_at
      end as observed_at,
      case when p.gate_key = 'current_human_approval' then null else e.expires_at end as expires_at
    from scoped_contracts c
    cross join integration.product_connection_gate_policies p
    left join latest_evidence e
      on e.snapshot_contract_id = c.id and e.gate_key = p.gate_key
  ), product_rows as (
    select
      c.id, c.slug, c.name,
      count(*) filter (where g.gate_status = 'passed')::int as passed_gates,
      count(*) filter (where g.gate_status <> 'passed')::int as blocked_gates,
      jsonb_agg(jsonb_build_object(
        'key', g.gate_key,
        'status', g.gate_status,
        'code', g.blocker_code,
        'observedAt', g.observed_at,
        'expiresAt', g.expires_at
      ) order by g.position) as gates
    from scoped_contracts c
    join gate_rows g on g.contract_id = c.id
    group by c.id, c.slug, c.name
  )
  select jsonb_build_object(
    'contract', 'autopilots.product-connection-readiness.v1',
    'organizationId', p_legal_entity_id,
    'products', coalesce((select jsonb_agg(jsonb_build_object(
      'brand', jsonb_build_object('slug', p.slug, 'name', p.name),
      'readyForActivation', false,
      'passedGates', p.passed_gates,
      'blockedGates', p.blocked_gates,
      'gates', p.gates
    ) order by p.name) from product_rows p), '[]'::jsonb),
    'summary', jsonb_build_object(
      'products', (select count(*) from product_rows),
      'readyForActivation', 0,
      'blocked', (select count(*) from product_rows)
    ),
    'dataConnectionEnabled', false,
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.autopilots_product_connection_readiness(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.autopilots_product_connection_readiness(uuid, uuid)
  to service_role;

commit;
