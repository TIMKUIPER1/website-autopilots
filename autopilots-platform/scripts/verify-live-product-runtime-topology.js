const PROJECT_REF = "wurycoodzcybaxcgqxps";
const MIGRATION = "20260804163000_product_runtime_topology.sql";
const CHECKSUM = "1b4887e72abce6dcd76be5e331d31691747eff57dcc4c9ca764a7c74db4062c1";
const CHANGE_ID = "AP-INT-20260803-013";
const token = String(process.env.SUPABASE_ACCESS_TOKEN || "").trim();
const requestedRef = String(process.env.SUPABASE_PROJECT_REF || PROJECT_REF).trim();
if (requestedRef !== PROJECT_REF) fail("Targetproject komt niet overeen met het vastgelegde Autopilots-project.");
if (!token || token.length < 20) fail("Een tijdelijk SUPABASE_ACCESS_TOKEN is vereist.");

const rows = await databaseQuery(`
select jsonb_build_object(
  'migrationCount', (select count(*)::int from public.autopilots_schema_migrations),
  'governedRpcCount', (select count(distinct p.proname)::int
    from pg_catalog.pg_proc p join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and left(p.proname, 11) = 'autopilots_'),
  'checksum', (select checksum from public.autopilots_schema_migrations where version = '${MIGRATION}'),
  'changeId', (select change_id from public.autopilots_schema_migrations where version = '${MIGRATION}'),
  'rlsEnabled', (select relrowsecurity from pg_catalog.pg_class c
    join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'integration' and c.relname = 'product_runtime_identities'),
  'runtimeCount', (select count(*)::int from integration.product_runtime_identities
    where registration_status <> 'retired'),
  'renderSqliteCount', (select count(*)::int from integration.product_runtime_identities
    where provider = 'render' and runtime_class = 'managed_service' and primary_store = 'sqlite'
      and registration_status = 'repository_verified' and product_data_plane_id is null),
  'supabasePostgresCount', (select count(*)::int from integration.product_runtime_identities
    where provider = 'supabase' and runtime_class = 'supabase_project' and primary_store = 'postgresql'
      and registration_status = 'provider_verified' and product_data_plane_id is not null),
  'unsafeEffectCount', (select count(*)::int from integration.product_runtime_identities
    where endpoint_verified or credential_material_stored or data_connection_enabled
      or provider_authorization_enabled or external_writes_enabled),
  'serviceRoleCanRead', has_table_privilege('service_role',
    'integration.product_runtime_identities', 'SELECT'),
  'serviceRoleCanInsert', has_table_privilege('service_role',
    'integration.product_runtime_identities', 'INSERT'),
  'authenticatedCanRead', has_table_privilege('authenticated',
    'integration.product_runtime_identities', 'SELECT'),
  'anonCanRead', has_table_privilege('anon',
    'integration.product_runtime_identities', 'SELECT'),
  'serviceRoleCanExecute', has_function_privilege('service_role',
    'public.autopilots_product_runtime_topology(uuid,uuid)', 'EXECUTE'),
  'authenticatedCanExecute', has_function_privilege('authenticated',
    'public.autopilots_product_runtime_topology(uuid,uuid)', 'EXECUTE'),
  'anonCanExecute', has_function_privilege('anon',
    'public.autopilots_product_runtime_topology(uuid,uuid)', 'EXECUTE'),
  'topology', public.autopilots_product_runtime_topology(
    '40000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000001'::uuid
  )
) as evidence`);

if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.evidence) {
  fail("De live runtime-topologiequery gaf een onverwacht antwoordcontract.");
}
const value = rows[0].evidence;
const topology = value.topology;
const runtimes = Array.isArray(topology?.runtimes) ? topology.runtimes : [];
const bySlug = new Map(runtimes.map((item) => [item?.brand?.slug, item?.identity]));
const autoreviews = bySlug.get("autoreviews");
const autoplanner = bySlug.get("autoplanner");
const roofplanner = bySlug.get("roofplanner");
if (value.migrationCount !== 49 || value.governedRpcCount !== 41
  || value.checksum !== CHECKSUM || value.changeId !== CHANGE_ID || value.rlsEnabled !== true
  || value.runtimeCount !== 3 || value.renderSqliteCount !== 1 || value.supabasePostgresCount !== 2
  || value.unsafeEffectCount !== 0 || value.serviceRoleCanRead !== true
  || value.serviceRoleCanInsert !== false || value.authenticatedCanRead !== false
  || value.anonCanRead !== false || value.serviceRoleCanExecute !== true
  || value.authenticatedCanExecute !== false || value.anonCanExecute !== false
  || topology?.contract !== "autopilots.product-runtime-topology.v1"
  || topology.organizationId !== "10000000-0000-4000-8000-000000000001"
  || topology.credentialMaterialStored !== false || topology.dataConnectionsEnabled !== false
  || topology.providerAuthorizationEnabled !== false || topology.externalWritesEnabled !== false
  || runtimes.length !== 3 || bySlug.size !== 3
  || autoreviews?.provider !== "render" || autoreviews.runtimeClass !== "managed_service"
  || autoreviews.primaryStore !== "sqlite" || autoreviews.dataPlaneLinked !== false
  || autoplanner?.provider !== "supabase" || autoplanner.primaryStore !== "postgresql"
  || autoplanner.dataPlaneLinked !== true || roofplanner?.provider !== "supabase"
  || roofplanner.primaryStore !== "postgresql" || roofplanner.dataPlaneLinked !== true
  || runtimes.some((item) => item.identity?.endpointVerified !== false)) {
  fail("De live product-runtime-topologieacceptatie is niet geslaagd.");
}
console.log(JSON.stringify({
  ok: true, contract: "autopilots.product-runtime-topology-acceptance.v1",
  projectRef: PROJECT_REF, migrationCount: 49, governedRpcCount: 41,
  runtimeIdentities: 3, activeDataConnections: 0,
  credentialMaterialStored: false, providerAuthorizationEnabled: false,
  externalWritesEnabled: false
}, null, 2));

async function databaseQuery(query) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }), signal: AbortSignal.timeout(30000)
    });
  } catch {
    fail("De Supabase Management API was niet bereikbaar.");
  }
  if (!response.ok) fail(`De Supabase Management API weigerde de acceptatiequery (${response.status}).`);
  try {
    const payload = await response.json();
    if (!Array.isArray(payload)) fail("De Supabase Management API gaf een onverwacht antwoordcontract.");
    return payload;
  } catch {
    fail("De Supabase Management API gaf geen geldig JSON-antwoord.");
  }
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
