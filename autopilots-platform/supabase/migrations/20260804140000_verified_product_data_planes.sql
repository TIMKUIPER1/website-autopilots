begin;

alter table integration.product_data_plane_discoveries
  add column schema_evidence_status text,
  add column schema_path_count integer,
  add column schema_fingerprint_sha256 text,
  add column schema_observed_at timestamptz;

update integration.product_data_plane_discoveries
set
  schema_evidence_status = case project_ref
    when 'zivpzcpxtqqtsrasppez' then 'empty_public_schema'
    else 'verified_product_identity'
  end,
  schema_path_count = case project_ref
    when 'ixcqwwqldptoschrbtvf' then 54
    when 'ggzapceuibzbgbevbvhx' then 38
    when 'zivpzcpxtqqtsrasppez' then 0
  end,
  schema_fingerprint_sha256 = case project_ref
    when 'ixcqwwqldptoschrbtvf' then 'bc1b8190d9759a4d393974fb5c4dcd27c6568b358c4b59207bdd717ce09c3704'
    when 'ggzapceuibzbgbevbvhx' then '778ce86830ba4f140906ae30c8cd6e7963d12614e76cef09b5bb81c1703d336a'
    when 'zivpzcpxtqqtsrasppez' then 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  end,
  schema_observed_at = now()
where project_ref in (
  'ixcqwwqldptoschrbtvf',
  'ggzapceuibzbgbevbvhx',
  'zivpzcpxtqqtsrasppez'
);

alter table integration.product_data_plane_discoveries
  alter column schema_evidence_status set not null,
  alter column schema_path_count set not null,
  alter column schema_fingerprint_sha256 set not null,
  alter column schema_observed_at set not null,
  add constraint product_data_plane_discovery_schema_evidence_ck check (
    schema_evidence_status in ('verified_product_identity', 'empty_public_schema')
    and schema_path_count >= 0
    and schema_fingerprint_sha256 ~ '^[0-9a-f]{64}$'
    and (
      (candidate_kind = 'exact_name_candidate'
        and schema_evidence_status = 'verified_product_identity'
        and schema_path_count > 0)
      or (candidate_kind = 'backup_label'
        and schema_evidence_status = 'empty_public_schema'
        and schema_path_count = 0)
    )
  );

insert into integration.product_data_planes (
  id, legal_entity_id, brand_id, provider, purpose, project_ref, region,
  registration_status, evidence_source, verified_at
) values
  (
    '93000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000003',
    'supabase', 'product_data', 'ixcqwwqldptoschrbtvf', 'eu-central-1',
    'verified', 'approved_readonly_discovery', now()
  ),
  (
    '93000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000004',
    'supabase', 'product_data', 'ggzapceuibzbgbevbvhx', 'eu-central-1',
    'verified', 'approved_readonly_discovery', now()
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
    'contract', 'autopilots.data-plane-registry.v3',
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
        where x.legal_entity_id = p_legal_entity_id and x.authority_status = 'excluded_non_primary')
    ),
    'singleLoginEnabled', true,
    'crossProjectCredentialSharingEnabled', false,
    'providerAuthorizationEnabled', false,
    'dataConnectionsEnabled', false,
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
