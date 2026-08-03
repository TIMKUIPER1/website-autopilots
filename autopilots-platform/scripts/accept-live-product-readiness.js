import { spawnSync } from "node:child_process";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const token = String(process.env.SUPABASE_ACCESS_TOKEN || "").trim();
const requestedRef = String(process.env.SUPABASE_PROJECT_REF || PROJECT_REF).trim();
if (requestedRef !== PROJECT_REF) fail("PRODUCT_READINESS_WRONG_TARGET");
if (!token || token.length < 20) fail("PRODUCT_READINESS_TOKEN_REQUIRED");

runReadOnlyVerifier("PRODUCT_READINESS_BASELINE_FAILED");
await databaseQuery(ROLLBACK_ACCEPTANCE_SQL);
runReadOnlyVerifier("PRODUCT_READINESS_POSTCHECK_FAILED");

console.log(JSON.stringify({
  ok: true,
  contract: "autopilots.product-readiness-rollback-acceptance.v1",
  projectRef: PROJECT_REF,
  successfulEvidenceRecords: 4,
  exactReplayVerified: true,
  divergentReplayDenied: true,
  atomicFailureRolledBack: true,
  wrongProfileDenied: true,
  wrongOrganizationDenied: true,
  auditorDenied: true,
  derivedGateDenied: true,
  staleEvidenceDenied: true,
  wrongSourceDenied: true,
  mutationDenied: true,
  persistentWrites: false,
  providerAuthorizationEnabled: false,
  externalWritesEnabled: false
}, null, 2));

function runReadOnlyVerifier(errorCode) {
  const result = spawnSync(process.execPath, ["scripts/verify-live-product-readiness.js"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: ["ignore", "ignore", "ignore"],
    timeout: 45_000
  });
  if (result.status !== 0) fail(errorCode);
}

async function databaseQuery(query) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(45_000)
    });
  } catch {
    fail("PRODUCT_READINESS_ACCEPTANCE_UNREACHABLE");
  }
  if (!response.ok) fail("PRODUCT_READINESS_ACCEPTANCE_REJECTED", { status: response.status });
  try {
    const payload = await response.json();
    if (!Array.isArray(payload)) fail("PRODUCT_READINESS_ACCEPTANCE_RESPONSE_INVALID");
  } catch {
    fail("PRODUCT_READINESS_ACCEPTANCE_RESPONSE_INVALID");
  }
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}

const ROLLBACK_ACCEPTANCE_SQL = `begin;
do $acceptance$
declare
  v_profile_id constant uuid := '40000000-0000-4000-8000-000000000001';
  v_legal_entity_id constant uuid := '10000000-0000-4000-8000-000000000001';
  v_outside_legal_entity_id constant uuid := '90000000-0000-4000-8000-000000000002';
  v_membership_id constant uuid := '50000000-0000-4000-8000-000000000001';
  v_observed_at timestamptz := clock_timestamp();
  v_batch jsonb;
  v_single jsonb;
  v_readiness jsonb;
  v_baseline_evidence integer;
  v_baseline_commands integer;
  v_baseline_usage integer;
  v_baseline_audit integer;
  v_mutation_denied boolean := false;
begin
  if not exists (
    select 1 from iam.memberships
    where id = v_membership_id and profile_id = v_profile_id
      and legal_entity_id = v_legal_entity_id and brand_id is null
      and role = 'owner' and status = 'active'
  ) then
    raise exception 'ACCEPTANCE_OWNER_BASELINE_INVALID';
  end if;

  select count(*) into v_baseline_evidence
  from integration.product_connection_gate_evidence;
  select count(*) into v_baseline_commands
  from workflow.commands where command_type = 'integration.connection-evidence.record';
  select count(*) into v_baseline_usage
  from ledger.usage_entries where source_reference in (
    select id::text from workflow.commands
    where command_type = 'integration.connection-evidence.record'
  );
  select count(*) into v_baseline_audit
  from audit.events where action = 'integration.connection-evidence.record';

  v_batch := public.autopilots_record_product_snapshot_evidence(
    v_profile_id, v_legal_entity_id, 'autoplanner',
    repeat('a', 64), repeat('b', 64), repeat('c', 64), v_observed_at,
    'snapshot:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  );
  if v_batch ->> 'contract' <> 'autopilots.product-snapshot-evidence-recorded.v1'
    or v_batch ->> 'brand' <> 'autoplanner'
    or jsonb_array_length(v_batch -> 'records') <> 3
    or (v_batch ->> 'atomic')::boolean is not true
    or (v_batch ->> 'replayed')::boolean is not false
    or (v_batch ->> 'dataConnectionEnabled')::boolean is not false
    or (v_batch ->> 'providerAuthorizationEnabled')::boolean is not false
    or (v_batch ->> 'externalWritesEnabled')::boolean is not false then
    raise exception 'ACCEPTANCE_VALID_BATCH_CONTRACT_FAILED';
  end if;
  if (select array_agg(value ->> 'gateKey' order by value ->> 'gateKey')
      from jsonb_array_elements(v_batch -> 'records'))
      <> array['contract_probe', 'freshness_probe', 'privacy_probe'] then
    raise exception 'ACCEPTANCE_VALID_BATCH_GATES_FAILED';
  end if;
  if exists (
    select 1 from jsonb_array_elements(v_batch -> 'records') item
    where item ->> 'result' <> 'passed'
      or item ->> 'riskClass' <> 'R1'
      or (item ->> 'dataConnectionEnabled')::boolean is not false
      or (item ->> 'providerAuthorizationEnabled')::boolean is not false
      or (item ->> 'externalWritesEnabled')::boolean is not false
  ) then
    raise exception 'ACCEPTANCE_VALID_BATCH_RECORD_FAILED';
  end if;
  if (select count(*) from integration.product_connection_gate_evidence) <> v_baseline_evidence + 3
    or (select count(*) from workflow.commands where command_type = 'integration.connection-evidence.record') <> v_baseline_commands + 3
    or (select count(*) from ledger.usage_entries where source_reference in (
      select id::text from workflow.commands where command_type = 'integration.connection-evidence.record'
    )) <> v_baseline_usage + 3
    or (select count(*) from audit.events where action = 'integration.connection-evidence.record') <> v_baseline_audit + 3 then
    raise exception 'ACCEPTANCE_VALID_BATCH_EVIDENCE_INCOMPLETE';
  end if;

  v_batch := public.autopilots_record_product_snapshot_evidence(
    v_profile_id, v_legal_entity_id, 'autoplanner',
    repeat('a', 64), repeat('b', 64), repeat('c', 64), v_observed_at,
    'snapshot:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
  );
  if (v_batch ->> 'replayed')::boolean is not true
    or (select count(*) from integration.product_connection_gate_evidence) <> v_baseline_evidence + 3
    or (select count(*) from workflow.commands where command_type = 'integration.connection-evidence.record') <> v_baseline_commands + 3 then
    raise exception 'ACCEPTANCE_EXACT_REPLAY_FAILED';
  end if;

  begin
    perform public.autopilots_record_product_snapshot_evidence(
      v_profile_id, v_legal_entity_id, 'autoplanner',
      repeat('d', 64), repeat('b', 64), repeat('c', 64), v_observed_at,
      'snapshot:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
    );
    raise exception 'ACCEPTANCE_DIVERGENT_REPLAY_ALLOWED';
  exception when unique_violation then null;
  end;

  begin
    perform public.autopilots_record_product_connection_evidence(
      '90000000-0000-4000-8000-000000000001', v_legal_entity_id, 'autoplanner',
      'contract_probe', 'passed', repeat('d', 64), 'contract_validator',
      v_observed_at, 'acceptance:wrong-profile:evidence:v1'
    );
    raise exception 'ACCEPTANCE_WRONG_PROFILE_ALLOWED';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.autopilots_record_product_connection_evidence(
      v_profile_id, v_outside_legal_entity_id, 'autoplanner',
      'contract_probe', 'passed', repeat('d', 64), 'contract_validator',
      v_observed_at, 'acceptance:wrong-organization:evidence:v1'
    );
    raise exception 'ACCEPTANCE_WRONG_ORGANIZATION_ALLOWED';
  exception when insufficient_privilege then null;
  end;

  update iam.memberships set role = 'operator', updated_at = clock_timestamp()
  where id = v_membership_id and role = 'owner';
  v_single := public.autopilots_record_product_connection_evidence(
    v_profile_id, v_legal_entity_id, 'autoplanner', 'independent_review', 'passed',
    repeat('d', 64), 'independent_review', v_observed_at,
    'acceptance:operator:evidence:v1'
  );
  if v_single ->> 'gateKey' <> 'independent_review'
    or v_single ->> 'riskClass' <> 'R1'
    or (v_single ->> 'externalWritesEnabled')::boolean is not false then
    raise exception 'ACCEPTANCE_OPERATOR_CONTRACT_FAILED';
  end if;

  update iam.memberships set role = 'auditor', updated_at = clock_timestamp()
  where id = v_membership_id and role = 'operator';
  begin
    perform public.autopilots_record_product_connection_evidence(
      v_profile_id, v_legal_entity_id, 'autoplanner',
      'contract_probe', 'passed', repeat('e', 64), 'contract_validator',
      v_observed_at, 'acceptance:auditor:evidence:v1'
    );
    raise exception 'ACCEPTANCE_AUDITOR_ALLOWED';
  exception when insufficient_privilege then null;
  end;
  update iam.memberships set role = 'owner', updated_at = clock_timestamp()
  where id = v_membership_id and role = 'auditor';

  begin
    perform public.autopilots_record_product_connection_evidence(
      v_profile_id, v_legal_entity_id, 'autoplanner',
      'current_human_approval', 'passed', repeat('e', 64), 'independent_review',
      v_observed_at, 'acceptance:derived-gate:evidence:v1'
    );
    raise exception 'ACCEPTANCE_DERIVED_GATE_ALLOWED';
  exception when insufficient_privilege then null;
  end;

  begin
    perform public.autopilots_record_product_connection_evidence(
      v_profile_id, v_legal_entity_id, 'autoplanner',
      'contract_probe', 'passed', repeat('e', 64), 'contract_validator',
      v_observed_at - interval '2 days', 'acceptance:stale:evidence:v1'
    );
    raise exception 'ACCEPTANCE_STALE_EVIDENCE_ALLOWED';
  exception when invalid_parameter_value then null;
  end;

  begin
    perform public.autopilots_record_product_connection_evidence(
      v_profile_id, v_legal_entity_id, 'autoplanner',
      'contract_probe', 'passed', repeat('e', 64), 'security_test',
      v_observed_at, 'acceptance:wrong-source:evidence:v1'
    );
    raise exception 'ACCEPTANCE_WRONG_SOURCE_ALLOWED';
  exception when insufficient_privilege then null;
  end;

  begin
    update integration.product_connection_gate_evidence
    set result = 'failed'
    where evidence_sha256 = repeat('a', 64) and gate_key = 'contract_probe';
  exception when others then
    v_mutation_denied := true;
  end;
  if not v_mutation_denied then
    raise exception 'ACCEPTANCE_EVIDENCE_MUTATION_ALLOWED';
  end if;

  begin
    perform public.autopilots_record_product_snapshot_evidence(
      v_profile_id, v_legal_entity_id, 'autoplanner',
      repeat('e', 64), repeat('f', 64), 'invalid-hash', v_observed_at,
      'snapshot:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    );
    raise exception 'ACCEPTANCE_PARTIAL_BATCH_ALLOWED';
  exception when invalid_parameter_value then null;
  end;
  if exists (
    select 1 from workflow.commands
    where idempotency_key like 'snapshot:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb:%'
  ) or exists (
    select 1 from integration.product_connection_gate_evidence
    where evidence_sha256 in (repeat('e', 64), repeat('f', 64))
  ) then
    raise exception 'ACCEPTANCE_PARTIAL_BATCH_RESIDUE';
  end if;

  if (select count(*) from integration.product_connection_gate_evidence) <> v_baseline_evidence + 4
    or (select count(*) from workflow.commands where command_type = 'integration.connection-evidence.record') <> v_baseline_commands + 4
    or (select count(*) from ledger.usage_entries where source_reference in (
      select id::text from workflow.commands where command_type = 'integration.connection-evidence.record'
    )) <> v_baseline_usage + 4
    or (select count(*) from audit.events where action = 'integration.connection-evidence.record') <> v_baseline_audit + 4 then
    raise exception 'ACCEPTANCE_FINAL_TRANSACTION_COUNTS_INVALID';
  end if;

  v_readiness := public.autopilots_product_connection_readiness(v_profile_id, v_legal_entity_id);
  if exists (
    select 1 from jsonb_array_elements(v_readiness -> 'products') product
    where (product ->> 'readyForActivation')::boolean is true
  ) or (v_readiness ->> 'dataConnectionEnabled')::boolean is not false
    or (v_readiness ->> 'providerAuthorizationEnabled')::boolean is not false
    or (v_readiness ->> 'externalWritesEnabled')::boolean is not false then
    raise exception 'ACCEPTANCE_EVIDENCE_ACTIVATED_PRODUCT';
  end if;
end;
$acceptance$;
rollback;`;
