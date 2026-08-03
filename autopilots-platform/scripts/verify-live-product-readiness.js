import { validateProductReadinessAcceptance } from "../src/acceptance/product-readiness.js";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const token = String(process.env.SUPABASE_ACCESS_TOKEN || "").trim();
const requestedRef = String(process.env.SUPABASE_PROJECT_REF || PROJECT_REF).trim();
if (requestedRef !== PROJECT_REF) fail("Targetproject komt niet overeen met het vastgelegde Autopilots-project.");
if (!token || token.length < 20) fail("Een tijdelijk SUPABASE_ACCESS_TOKEN is vereist.");

const rows = await databaseQuery(`
select jsonb_build_object(
  'migrationCount', (select count(*)::int from public.autopilots_schema_migrations),
  'governedRpcCount', (select count(distinct p.proname)::int
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and left(p.proname, 11) = 'autopilots_'),
  'pendingChecksums', (select jsonb_object_agg(version, checksum order by version)
    from public.autopilots_schema_migrations where version in (
      '20260804150000_product_connection_readiness.sql',
      '20260804153000_product_connection_evidence_recording.sql',
      '20260804160000_atomic_product_snapshot_evidence.sql'
    )),
  'pendingChangeIds', (select jsonb_object_agg(version, change_id order by version)
    from public.autopilots_schema_migrations where version in (
      '20260804150000_product_connection_readiness.sql',
      '20260804153000_product_connection_evidence_recording.sql',
      '20260804160000_atomic_product_snapshot_evidence.sql'
    )),
  'gatePolicyCount', (select count(*)::int from integration.product_connection_gate_policies),
  'snapshotContractCount', (select count(*)::int from integration.product_snapshot_contracts),
  'evidenceRowCount', (select count(*)::int from integration.product_connection_gate_evidence),
  'evidenceCommandCount', (select count(*)::int from workflow.commands
    where command_type = 'integration.connection-evidence.record'),
  'evidenceUsageCount', (select count(*)::int from ledger.usage_entries
    where source_reference in (select id::text from workflow.commands
      where command_type = 'integration.connection-evidence.record')),
  'evidenceAuditCount', (select count(*)::int from audit.events
    where action = 'integration.connection-evidence.record'),
  'appendOnlyTriggerEnabled', exists (select 1 from pg_catalog.pg_trigger
    where tgname = 'product_connection_gate_evidence_append_only' and tgenabled <> 'D'),
  'serviceRoleCanReadEvidence', has_table_privilege('service_role',
    'integration.product_connection_gate_evidence', 'SELECT'),
  'serviceRoleCanInsertEvidence', has_table_privilege('service_role',
    'integration.product_connection_gate_evidence', 'INSERT'),
  'authenticatedCanReadEvidence', has_table_privilege('authenticated',
    'integration.product_connection_gate_evidence', 'SELECT'),
  'authenticatedCanInsertEvidence', has_table_privilege('authenticated',
    'integration.product_connection_gate_evidence', 'INSERT'),
  'anonCanReadEvidence', has_table_privilege('anon',
    'integration.product_connection_gate_evidence', 'SELECT'),
  'anonCanInsertEvidence', has_table_privilege('anon',
    'integration.product_connection_gate_evidence', 'INSERT'),
  'serviceRoleCanRecordSingle', has_function_privilege('service_role',
    'public.autopilots_record_product_connection_evidence(uuid,uuid,text,text,text,text,text,timestamptz,text)', 'EXECUTE'),
  'serviceRoleCanRecordBatch', has_function_privilege('service_role',
    'public.autopilots_record_product_snapshot_evidence(uuid,uuid,text,text,text,text,timestamptz,text)', 'EXECUTE'),
  'authenticatedCanRecordSingle', has_function_privilege('authenticated',
    'public.autopilots_record_product_connection_evidence(uuid,uuid,text,text,text,text,text,timestamptz,text)', 'EXECUTE'),
  'authenticatedCanRecordBatch', has_function_privilege('authenticated',
    'public.autopilots_record_product_snapshot_evidence(uuid,uuid,text,text,text,text,timestamptz,text)', 'EXECUTE'),
  'anonCanRecordSingle', has_function_privilege('anon',
    'public.autopilots_record_product_connection_evidence(uuid,uuid,text,text,text,text,text,timestamptz,text)', 'EXECUTE'),
  'anonCanRecordBatch', has_function_privilege('anon',
    'public.autopilots_record_product_snapshot_evidence(uuid,uuid,text,text,text,text,timestamptz,text)', 'EXECUTE'),
  'contractExternalWritesEnabledCount', (select count(*)::int from integration.product_snapshot_contracts
    where external_writes_enabled),
  'contractProviderAuthorizationEnabledCount', (select count(*)::int from integration.product_snapshot_contracts
    where provider_authorization_enabled),
  'contractCredentialMaterialStoredCount', (select count(*)::int from integration.product_snapshot_contracts
    where credential_material_stored),
  'contractDirectDatabaseAccessEnabledCount', (select count(*)::int from integration.product_snapshot_contracts
    where direct_database_access_enabled),
  'contractRowLevelDataEnabledCount', (select count(*)::int from integration.product_snapshot_contracts
    where row_level_data_enabled),
  'readiness', public.autopilots_product_connection_readiness(
    '40000000-0000-4000-8000-000000000001'::uuid,
    '10000000-0000-4000-8000-000000000001'::uuid
  )
) as evidence
`);
if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.evidence) {
  fail("De live acceptatiequery gaf een onverwacht antwoordcontract.");
}
let result;
try {
  result = validateProductReadinessAcceptance(rows[0].evidence);
} catch {
  fail("De live product-readinessacceptatie is niet geslaagd.");
}
console.log(JSON.stringify({ ok: true, projectRef: PROJECT_REF, ...result }, null, 2));

async function databaseQuery(query) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
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
