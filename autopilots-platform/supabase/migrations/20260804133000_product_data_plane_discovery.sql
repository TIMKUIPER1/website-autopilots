begin;

create table integration.product_data_plane_discoveries (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  brand_id uuid not null,
  provider text not null check (provider = 'supabase'),
  project_ref text not null unique check (project_ref ~ '^[a-z]{20}$'),
  observed_project_name text not null check (char_length(observed_project_name) between 1 and 120),
  provider_organization_ref text not null check (provider_organization_ref ~ '^[a-z]{20}$'),
  region text not null check (region ~ '^[a-z]{2}-[a-z]+-[0-9]$'),
  provider_status text not null check (provider_status in ('active_healthy')),
  candidate_kind text not null check (candidate_kind in ('exact_name_candidate', 'backup_label')),
  authority_status text not null check (authority_status in ('verification_required', 'excluded_non_primary')),
  evidence_source text not null check (evidence_source = 'approved_readonly_discovery'),
  credential_material_stored boolean not null default false check (credential_material_stored = false),
  provider_authorization_enabled boolean not null default false check (provider_authorization_enabled = false),
  provider_writes_enabled boolean not null default false check (provider_writes_enabled = false),
  discovered_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete restrict,
  check (
    (candidate_kind = 'exact_name_candidate' and authority_status = 'verification_required')
    or (candidate_kind = 'backup_label' and authority_status = 'excluded_non_primary')
  )
);

create unique index product_data_plane_discovery_brand_kind_uidx
  on integration.product_data_plane_discoveries (brand_id, candidate_kind);

alter table integration.product_data_plane_discoveries enable row level security;
revoke all on integration.product_data_plane_discoveries from public, anon, authenticated;
grant select on integration.product_data_plane_discoveries to service_role;
revoke insert, update, delete, truncate, references, trigger
  on integration.product_data_plane_discoveries from service_role;

insert into integration.product_data_plane_discoveries (
  id, legal_entity_id, brand_id, provider, project_ref, observed_project_name,
  provider_organization_ref, region, provider_status, candidate_kind,
  authority_status, evidence_source, discovered_at
) values
  (
    '94000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000003',
    'supabase', 'ixcqwwqldptoschrbtvf', 'Autoplanner',
    'llcougghguwonclcdoua', 'eu-central-1', 'active_healthy',
    'exact_name_candidate', 'verification_required',
    'approved_readonly_discovery', now()
  ),
  (
    '94000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000004',
    'supabase', 'ggzapceuibzbgbevbvhx', 'Roofplanner',
    'llcougghguwonclcdoua', 'eu-central-1', 'active_healthy',
    'exact_name_candidate', 'verification_required',
    'approved_readonly_discovery', now()
  ),
  (
    '94000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    'supabase', 'zivpzcpxtqqtsrasppez', 'AutoReviews Backups EU',
    'iicqqzobumpiloqktfxn', 'eu-central-1', 'active_healthy',
    'backup_label', 'excluded_non_primary',
    'approved_readonly_discovery', now()
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
    'contract', 'autopilots.data-plane-registry.v2',
    'organization', jsonb_build_object('id', v_entity.id, 'legalName', v_entity.legal_name),
    'controlPlane', coalesce((
      select jsonb_build_object(
        'provider', d.provider,
        'purpose', d.purpose,
        'status', d.registration_status,
        'projectRef', d.project_ref,
        'dashboardUrl', 'https://supabase.com/dashboard/project/' || d.project_ref,
        'region', d.region,
        'evidenceSource', d.evidence_source,
        'verifiedAt', d.verified_at
      )
      from integration.product_data_planes d
      where d.legal_entity_id = p_legal_entity_id
        and d.purpose = 'control_plane'
        and d.registration_status <> 'retired'
      order by d.created_at desc limit 1
    ), jsonb_build_object('provider', 'supabase', 'purpose', 'control_plane', 'status', 'not_registered')),
    'products', coalesce((
      select jsonb_agg(jsonb_build_object(
        'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
        'dataPlane', case when d.id is null then jsonb_build_object(
          'provider', 'supabase', 'purpose', 'product_data', 'status', 'not_registered',
          'projectRef', null, 'dashboardUrl', null, 'region', null,
          'evidenceSource', null, 'verifiedAt', null
        ) else jsonb_build_object(
          'provider', d.provider, 'purpose', d.purpose, 'status', d.registration_status,
          'projectRef', d.project_ref,
          'dashboardUrl', 'https://supabase.com/dashboard/project/' || d.project_ref,
          'region', d.region, 'evidenceSource', d.evidence_source, 'verifiedAt', d.verified_at
        ) end,
        'discovery', case when x.id is null then jsonb_build_object(
          'status', 'not_found', 'projectRef', null, 'observedProjectName', null,
          'candidateKind', null, 'providerStatus', null, 'region', null,
          'organizationBoundary', null
        ) else jsonb_build_object(
          'status', x.authority_status,
          'projectRef', x.project_ref,
          'observedProjectName', x.observed_project_name,
          'candidateKind', x.candidate_kind,
          'providerStatus', x.provider_status,
          'region', x.region,
          'organizationBoundary', case
            when x.provider_organization_ref = v_control_provider_org then 'same_provider_organization'
            else 'separate_provider_organization'
          end
        ) end
      ) order by b.name)
      from core.brands b
      left join integration.product_data_planes d
        on d.brand_id = b.id and d.legal_entity_id = b.legal_entity_id
        and d.provider = 'supabase' and d.purpose = 'product_data'
        and d.registration_status <> 'retired'
      left join integration.product_data_plane_discoveries x
        on x.brand_id = b.id and x.legal_entity_id = b.legal_entity_id
      where b.legal_entity_id = p_legal_entity_id
        and b.status <> 'retired' and b.slug <> 'autopilots'
    ), '[]'::jsonb),
    'summary', jsonb_build_object(
      'registeredProjects', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.registration_status <> 'retired'),
      'registeredProductDataPlanes', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.purpose = 'product_data'
          and d.registration_status <> 'retired'),
      'unregisteredProducts', (select count(*) from core.brands b
        where b.legal_entity_id = p_legal_entity_id and b.status <> 'retired'
          and b.slug <> 'autopilots'
          and not exists (select 1 from integration.product_data_planes d
            where d.brand_id = b.id and d.purpose = 'product_data'
              and d.registration_status <> 'retired')),
      'verificationCandidates', (select count(*) from integration.product_data_plane_discoveries x
        where x.legal_entity_id = p_legal_entity_id and x.authority_status = 'verification_required'),
      'excludedNonPrimaryCandidates', (select count(*) from integration.product_data_plane_discoveries x
        where x.legal_entity_id = p_legal_entity_id and x.authority_status = 'excluded_non_primary')
    ),
    'singleLoginEnabled', true,
    'crossProjectCredentialSharingEnabled', false,
    'providerAuthorizationEnabled', false,
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
