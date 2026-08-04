begin;

create table integration.product_runtime_identities (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  brand_id uuid not null,
  product_data_plane_id uuid,
  provider text not null check (provider in ('render', 'supabase')),
  runtime_class text not null check (runtime_class in ('managed_service', 'supabase_project')),
  primary_store text not null check (primary_store in ('sqlite', 'postgresql')),
  registration_status text not null check (registration_status in (
    'repository_verified', 'provider_verified', 'retired'
  )),
  evidence_source text not null check (evidence_source in (
    'repository_architecture', 'approved_readonly_discovery'
  )),
  endpoint_verified boolean not null default false check (endpoint_verified = false),
  credential_material_stored boolean not null default false check (credential_material_stored = false),
  data_connection_enabled boolean not null default false check (data_connection_enabled = false),
  provider_authorization_enabled boolean not null default false check (provider_authorization_enabled = false),
  external_writes_enabled boolean not null default false check (external_writes_enabled = false),
  verified_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id)
    references core.brands(id, legal_entity_id) on delete restrict,
  foreign key (product_data_plane_id, brand_id)
    references integration.product_data_planes(id, brand_id) on delete restrict,
  check (
    (provider = 'render' and runtime_class = 'managed_service'
      and primary_store = 'sqlite' and product_data_plane_id is null
      and registration_status in ('repository_verified', 'retired')
      and evidence_source = 'repository_architecture')
    or
    (provider = 'supabase' and runtime_class = 'supabase_project'
      and primary_store = 'postgresql' and product_data_plane_id is not null
      and registration_status in ('provider_verified', 'retired')
      and evidence_source = 'approved_readonly_discovery')
  )
);

create unique index product_runtime_identities_active_brand_uidx
  on integration.product_runtime_identities (legal_entity_id, brand_id)
  where registration_status <> 'retired';

alter table integration.product_runtime_identities enable row level security;
revoke all on integration.product_runtime_identities from public, anon, authenticated;
grant select on integration.product_runtime_identities to service_role;
revoke insert, update, delete, truncate, references, trigger
  on integration.product_runtime_identities from service_role;

insert into integration.product_runtime_identities (
  id, legal_entity_id, brand_id, product_data_plane_id, provider,
  runtime_class, primary_store, registration_status, evidence_source, verified_at
) values
  (
    '96000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    null, 'render', 'managed_service', 'sqlite',
    'repository_verified', 'repository_architecture', now()
  ),
  (
    '96000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000003',
    '93000000-0000-4000-8000-000000000002',
    'supabase', 'supabase_project', 'postgresql',
    'provider_verified', 'approved_readonly_discovery', now()
  ),
  (
    '96000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000004',
    '93000000-0000-4000-8000-000000000003',
    'supabase', 'supabase_project', 'postgresql',
    'provider_verified', 'approved_readonly_discovery', now()
  );

create or replace function public.autopilots_product_runtime_topology(
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
    select 1 from iam.profiles p
    join iam.memberships m on m.profile_id = p.id
    where p.id = p_profile_id and p.status = 'active'
      and m.legal_entity_id = p_legal_entity_id
      and m.brand_id is null and m.status = 'active'
      and m.role in ('owner', 'admin', 'operator', 'auditor')
  ) then
    raise exception 'organization runtime-topology role required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'contract', 'autopilots.product-runtime-topology.v1',
    'organizationId', p_legal_entity_id,
    'runtimes', coalesce(jsonb_agg(jsonb_build_object(
      'brand', jsonb_build_object('slug', b.slug, 'name', b.name, 'code', b.code),
      'identity', jsonb_build_object(
        'provider', r.provider,
        'runtimeClass', r.runtime_class,
        'primaryStore', r.primary_store,
        'registrationStatus', r.registration_status,
        'evidenceSource', r.evidence_source,
        'dataPlaneLinked', r.product_data_plane_id is not null,
        'endpointVerified', r.endpoint_verified
      )
    ) order by b.name), '[]'::jsonb),
    'summary', jsonb_build_object(
      'registeredRuntimeIdentities', count(*)::int,
      'providerVerified', count(*) filter (where r.registration_status = 'provider_verified')::int,
      'repositoryVerified', count(*) filter (where r.registration_status = 'repository_verified')::int,
      'activeDataConnections', 0
    ),
    'credentialMaterialStored', false,
    'dataConnectionsEnabled', false,
    'providerAuthorizationEnabled', false,
    'externalWritesEnabled', false,
    'generatedAt', now()
  ) into v_result
  from integration.product_runtime_identities r
  join core.brands b on b.id = r.brand_id and b.legal_entity_id = r.legal_entity_id
  where r.legal_entity_id = p_legal_entity_id
    and r.registration_status <> 'retired'
    and b.status <> 'retired';

  return v_result;
end;
$$;

revoke all on function public.autopilots_product_runtime_topology(uuid, uuid)
  from public, anon, authenticated;
grant execute on function public.autopilots_product_runtime_topology(uuid, uuid)
  to service_role;

commit;
