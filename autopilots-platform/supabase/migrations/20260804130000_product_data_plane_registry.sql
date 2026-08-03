begin;

create table integration.product_data_planes (
  id uuid primary key default gen_random_uuid(),
  legal_entity_id uuid not null references core.legal_entities(id) on delete restrict,
  brand_id uuid,
  provider text not null check (provider in ('supabase')),
  purpose text not null check (purpose in ('control_plane', 'product_data')),
  project_ref text not null check (project_ref ~ '^[a-z]{20}$'),
  region text check (region is null or region ~ '^[a-z]{2}-[a-z]+-[0-9]$'),
  registration_status text not null check (registration_status in ('verified', 'verification_required', 'paused', 'retired')),
  evidence_source text not null check (evidence_source in ('current_runtime_project_ref', 'approved_readonly_discovery')),
  credential_material_stored boolean not null default false check (credential_material_stored = false),
  provider_authorization_enabled boolean not null default false check (provider_authorization_enabled = false),
  provider_writes_enabled boolean not null default false check (provider_writes_enabled = false),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (brand_id, legal_entity_id) references core.brands(id, legal_entity_id) on delete restrict,
  check (
    (purpose = 'control_plane' and brand_id is null)
    or (purpose = 'product_data' and brand_id is not null)
  ),
  check ((registration_status = 'verified') = (verified_at is not null))
);

create unique index product_data_planes_scope_uidx
  on integration.product_data_planes (
    legal_entity_id,
    provider,
    purpose,
    coalesce(brand_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where registration_status <> 'retired';

alter table integration.product_data_planes enable row level security;
revoke all on integration.product_data_planes from public, anon, authenticated;
grant select on integration.product_data_planes to service_role;
revoke insert, update, delete, truncate, references, trigger on integration.product_data_planes from service_role;

insert into integration.product_data_planes (
  id, legal_entity_id, brand_id, provider, purpose, project_ref, region,
  registration_status, evidence_source, verified_at
) values (
  '93000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000001',
  null,
  'supabase',
  'control_plane',
  'wurycoodzcybaxcgqxps',
  'eu-central-1',
  'verified',
  'current_runtime_project_ref',
  now()
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
    'contract', 'autopilots.data-plane-registry.v1',
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
          'provider', 'supabase',
          'purpose', 'product_data',
          'status', 'not_registered',
          'projectRef', null,
          'dashboardUrl', null,
          'region', null,
          'evidenceSource', null,
          'verifiedAt', null
        ) else jsonb_build_object(
          'provider', d.provider,
          'purpose', d.purpose,
          'status', d.registration_status,
          'projectRef', d.project_ref,
          'dashboardUrl', 'https://supabase.com/dashboard/project/' || d.project_ref,
          'region', d.region,
          'evidenceSource', d.evidence_source,
          'verifiedAt', d.verified_at
        ) end
      ) order by b.name)
      from core.brands b
      left join integration.product_data_planes d
        on d.brand_id = b.id
        and d.legal_entity_id = b.legal_entity_id
        and d.provider = 'supabase'
        and d.purpose = 'product_data'
        and d.registration_status <> 'retired'
      where b.legal_entity_id = p_legal_entity_id and b.status <> 'retired'
    ), '[]'::jsonb),
    'summary', jsonb_build_object(
      'registeredProjects', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.registration_status <> 'retired'),
      'registeredProductDataPlanes', (select count(*) from integration.product_data_planes d
        where d.legal_entity_id = p_legal_entity_id and d.purpose = 'product_data'
          and d.registration_status <> 'retired'),
      'unregisteredProducts', (select count(*) from core.brands b
        where b.legal_entity_id = p_legal_entity_id and b.status <> 'retired'
          and not exists (select 1 from integration.product_data_planes d
            where d.brand_id = b.id and d.purpose = 'product_data'
              and d.registration_status <> 'retired'))
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
