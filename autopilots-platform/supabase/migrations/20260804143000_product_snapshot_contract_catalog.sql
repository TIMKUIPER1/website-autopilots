begin;

alter table integration.product_data_planes
  add constraint product_data_planes_id_brand_uq unique (id, brand_id);

create table integration.product_snapshot_contracts (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  brand_id uuid not null,
  product_data_plane_id uuid,
  contract_key text not null check (contract_key = 'autopilots.product-snapshot.v1'),
  transport text not null check (transport = 'product_aggregate_api'),
  data_classification text not null check (data_classification = 'aggregate_no_pii'),
  status text not null check (status in (
    'contract_required', 'identity_verified_contract_required', 'implemented_unverified', 'verified'
  )),
  allowed_aggregates jsonb not null check (
    jsonb_typeof(allowed_aggregates) = 'array' and jsonb_array_length(allowed_aggregates) > 0
  ),
  prohibited_data_classes jsonb not null check (
    jsonb_typeof(prohibited_data_classes) = 'array'
    and prohibited_data_classes @> '["raw_pii","row_level_records","message_content","secrets","provider_tokens"]'::jsonb
  ),
  freshness_expectation_seconds integer not null check (freshness_expectation_seconds between 60 and 86400),
  small_cell_suppression_threshold integer not null default 5 check (small_cell_suppression_threshold >= 5),
  direct_database_access_enabled boolean not null default false check (direct_database_access_enabled = false),
  row_level_data_enabled boolean not null default false check (row_level_data_enabled = false),
  credential_material_stored boolean not null default false check (credential_material_stored = false),
  provider_authorization_enabled boolean not null default false check (provider_authorization_enabled = false),
  endpoint_implemented boolean not null default false,
  contract_verified boolean not null default false,
  external_writes_enabled boolean not null default false check (external_writes_enabled = false),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete restrict,
  foreign key (product_data_plane_id, brand_id)
    references integration.product_data_planes(id, brand_id) on delete restrict,
  unique (brand_id, contract_key),
  check (
    (status = 'contract_required' and product_data_plane_id is null)
    or (status <> 'contract_required' and product_data_plane_id is not null)
  ),
  check ((status = 'verified') = contract_verified),
  check (contract_verified = (verified_at is not null)),
  check (not contract_verified or endpoint_implemented)
);

alter table integration.product_snapshot_contracts enable row level security;
revoke all on integration.product_snapshot_contracts from public, anon, authenticated;
grant select on integration.product_snapshot_contracts to service_role;
revoke insert, update, delete, truncate, references, trigger
  on integration.product_snapshot_contracts from service_role;

insert into integration.product_snapshot_contracts (
  id, legal_entity_id, brand_id, product_data_plane_id, contract_key,
  transport, data_classification, status, allowed_aggregates,
  prohibited_data_classes, freshness_expectation_seconds,
  small_cell_suppression_threshold
) values
  (
    '95000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    null,
    'autopilots.product-snapshot.v1', 'product_aggregate_api', 'aggregate_no_pii',
    'contract_required',
    '["organizations_count","reviews_requested_count","reviews_completed_count","average_rating","failed_deliveries_count","open_incidents_count","usage_totals"]'::jsonb,
    '["raw_pii","row_level_records","message_content","secrets","provider_tokens","payment_instrument_data"]'::jsonb,
    900, 5
  ),
  (
    '95000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000003',
    '93000000-0000-4000-8000-000000000002',
    'autopilots.product-snapshot.v1', 'product_aggregate_api', 'aggregate_no_pii',
    'identity_verified_contract_required',
    '["organizations_count","leads_by_status","appointments_by_status","conversations_by_state","job_failures_count","integration_health","usage_totals"]'::jsonb,
    '["raw_pii","row_level_records","message_content","secrets","provider_tokens","payment_instrument_data"]'::jsonb,
    900, 5
  ),
  (
    '95000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000004',
    '93000000-0000-4000-8000-000000000003',
    'autopilots.product-snapshot.v1', 'product_aggregate_api', 'aggregate_no_pii',
    'identity_verified_contract_required',
    '["organizations_count","trial_accounts_by_state","activation_gates_by_state","appointments_by_status","provider_failures_count","entitlement_counts","usage_totals"]'::jsonb,
    '["raw_pii","row_level_records","message_content","secrets","provider_tokens","payment_instrument_data"]'::jsonb,
    900, 5
  );

create or replace function public.autopilots_data_plane_registry(
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
  v_entity core.legal_entities%rowtype;
  v_control_provider_org text := 'llcougghguwonclcdoua';
begin
  select le.* into v_entity
  from core.legal_entities le
  where le.id = p_legal_entity_id and le.status = 'active';
  if not found then raise exception 'organization not found' using errcode = 'P0002'; end if;

  if not exists (
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator', 'auditor')
  ) then
    raise exception 'organization data-plane role required' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'contract', 'autopilots.data-plane-registry.v4',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'controlPlane', coalesce((
      select jsonb_build_object(
        'provider', d.provider, 'purpose', d.purpose, 'status', d.registration_status,
        'projectRef', d.project_ref,
        'dashboardUrl', 'https://supabase.com/dashboard/project/' || d.project_ref,
        'region', d.region, 'evidenceSource', d.evidence_source,
        'verifiedAt', d.verified_at, 'dataConnectionStatus', 'internal_runtime'
      )
      from integration.product_data_planes d
      where d.legal_entity_id = p_legal_entity_id
        and d.purpose = 'control_plane' and d.registration_status <> 'retired'
      order by d.created_at desc limit 1
    ), jsonb_build_object('provider', 'supabase', 'purpose', 'control_plane', 'status', 'not_registered')),
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
        'dataPlane', case when d.id is null then jsonb_build_object(
          'provider', 'supabase', 'purpose', 'product_data', 'status', 'not_registered',
          'projectRef', null, 'dashboardUrl', null, 'region', null,
          'evidenceSource', null, 'verifiedAt', null, 'dataConnectionStatus', 'not_registered'
        ) else jsonb_build_object(
          'provider', d.provider, 'purpose', d.purpose, 'status', d.registration_status,
          'projectRef', d.project_ref,
          'dashboardUrl', 'https://supabase.com/dashboard/project/' || d.project_ref,
          'region', d.region, 'evidenceSource', d.evidence_source,
          'verifiedAt', d.verified_at, 'dataConnectionStatus', 'not_authorized'
        ) end,
        'discovery', case when x.id is null then jsonb_build_object(
          'status', 'not_found', 'projectRef', null, 'observedProjectName', null,
          'candidateKind', null, 'providerStatus', null, 'region', null,
          'organizationBoundary', null, 'schemaEvidenceStatus', null,
          'schemaPathCount', null, 'schemaFingerprintSha256', null
        ) else jsonb_build_object(
          'status', x.authority_status, 'projectRef', x.project_ref,
          'observedProjectName', x.observed_project_name,
          'candidateKind', x.candidate_kind, 'providerStatus', x.provider_status,
          'region', x.region,
          'organizationBoundary', case
            when x.provider_organization_ref = v_control_provider_org then 'same_provider_organization'
            else 'separate_provider_organization'
          end,
          'schemaEvidenceStatus', x.schema_evidence_status,
          'schemaPathCount', x.schema_path_count,
          'schemaFingerprintSha256', x.schema_fingerprint_sha256
        ) end,
        'snapshotContract', case when c.id is null then null else jsonb_build_object(
          'contractKey', c.contract_key,
          'transport', c.transport,
          'dataClassification', c.data_classification,
          'status', c.status,
          'allowedAggregates', c.allowed_aggregates,
          'prohibitedDataClasses', c.prohibited_data_classes,
          'freshnessExpectationSeconds', c.freshness_expectation_seconds,
          'smallCellSuppressionThreshold', c.small_cell_suppression_threshold,
          'directDatabaseAccessEnabled', c.direct_database_access_enabled,
          'rowLevelDataEnabled', c.row_level_data_enabled,
          'credentialMaterialStored', c.credential_material_stored,
          'providerAuthorizationEnabled', c.provider_authorization_enabled,
          'endpointImplemented', c.endpoint_implemented,
          'contractVerified', c.contract_verified,
          'externalWritesEnabled', c.external_writes_enabled
        ) end
      ) order by b.name)
      from core.brands b
      left join integration.product_data_planes d
        on d.brand_id = b.id and d.legal_entity_id = b.legal_entity_id
        and d.provider = 'supabase' and d.purpose = 'product_data'
        and d.registration_status <> 'retired'
      left join integration.product_data_plane_discoveries x
        on x.brand_id = b.id and x.legal_entity_id = b.legal_entity_id
      left join integration.product_snapshot_contracts c
        on c.brand_id = b.id and c.legal_entity_id = b.legal_entity_id
      where b.legal_entity_id = p_legal_entity_id
        and b.status <> 'retired' and b.slug <> 'autopilots'
    ), '[]'::jsonb),
    'summary', jsonb_build_object(
      'registeredProjects', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.registration_status <> 'retired'),
      'registeredProductDataPlanes', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.purpose = 'product_data'
          and d.registration_status <> 'retired'),
      'verifiedProductIdentities', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.purpose = 'product_data'
          and d.registration_status = 'verified'),
      'activeDataConnections', 0,
      'unregisteredProducts', (select count(*) from core.brands b
        where b.legal_entity_id = p_legal_entity_id and b.status <> 'retired'
          and b.slug <> 'autopilots'
          and not exists (select 1 from integration.product_data_planes d
            where d.brand_id = b.id and d.purpose = 'product_data'
              and d.registration_status <> 'retired')),
      'verificationCandidates', (select count(*)
        from integration.product_data_plane_discoveries x
        where x.legal_entity_id = p_legal_entity_id
          and x.authority_status = 'verification_required'
          and not exists (select 1 from integration.product_data_planes d
            where d.brand_id = x.brand_id and d.purpose = 'product_data'
              and d.registration_status <> 'retired')),
      'excludedNonPrimaryCandidates', (select count(*) from integration.product_data_plane_discoveries x
        where x.legal_entity_id = p_legal_entity_id and x.authority_status = 'excluded_non_primary'),
      'snapshotContracts', (select count(*) from integration.product_snapshot_contracts c
        where c.legal_entity_id = p_legal_entity_id),
      'verifiedSnapshotContracts', (select count(*) from integration.product_snapshot_contracts c
        where c.legal_entity_id = p_legal_entity_id and c.contract_verified),
      'contractsRequiringImplementation', (select count(*) from integration.product_snapshot_contracts c
        where c.legal_entity_id = p_legal_entity_id and not c.contract_verified)
    ),
    'singleLoginEnabled', true,
    'crossProjectCredentialSharingEnabled', false,
    'providerAuthorizationEnabled', false,
    'dataConnectionsEnabled', false,
    'directDatabaseAccessEnabled', false,
    'rowLevelDataEnabled', false,
    'credentialMaterialExposed', false,
    'genericRegistrationActionEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  );
end;
$$;

revoke all on function public.autopilots_data_plane_registry(uuid, uuid) from public, anon, authenticated;
grant execute on function public.autopilots_data_plane_registry(uuid, uuid) to service_role;

commit;
