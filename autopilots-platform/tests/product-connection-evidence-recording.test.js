import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL(
  "../supabase/migrations/20260804153000_product_connection_evidence_recording.sql",
  import.meta.url
), "utf8");

test("connection evidence is immutable, hash-only and directly unwritable", () => {
  assert.match(migration, /product_connection_gate_evidence_append_only[\s\S]*before update or delete/);
  assert.match(migration, /p_evidence_sha256[\s\S]*\^\[0-9a-f\]\{64\}\$/);
  assert.doesNotMatch(migration, /p_(?:payload|endpoint|secret|token|credential|raw_evidence)/);
  assert.match(migration, /insert into integration\.product_connection_gate_evidence[\s\S]*evidence_sha256/);
});

test("derived identity and current human approval cannot be recorded by the probe RPC", () => {
  assert.match(migration, /p_gate_key in \('project_identity', 'current_human_approval'\)[\s\S]*derived by a separate authority/);
  assert.match(migration, /organization evidence operator required/);
  assert.match(migration, /m\.brand_id is null[\s\S]*m\.role in \('owner', 'admin', 'operator'\)/);
});

test("each technical gate has one bounded owning source category", () => {
  assert.match(migration, /p_source_category <> \(case[\s\S]*end\) then/);
  for (const expected of [
    "owned_https_endpoint' then 'transport_probe",
    "vault_secret_reference' then 'security_test",
    "contract_probe', 'privacy_probe', 'freshness_probe') then 'contract_validator",
    "reconciliation' then 'reconciliation",
    "revocation_test', 'rate_limit_test', 'failure_mode_test') then 'security_test",
    "independent_review' then 'independent_review"
  ]) assert.ok(migration.includes(expected), expected);
  assert.match(migration, /p_observed_at < now\(\) - \(v_policy\.maximum_age_seconds \* interval '1 second'\)/);
  assert.match(migration, /p_observed_at \+ \(v_policy\.maximum_age_seconds \* interval '1 second'\)/);
});

test("evidence recording is a complete idempotent R1 command with no activation effect", () => {
  assert.match(migration, /integration\.connection-evidence\.record/);
  assert.match(migration, /idempotency key reused with different connection evidence/);
  assert.match(migration, /insert into workflow\.commands/);
  assert.match(migration, /insert into ledger\.usage_entries/);
  assert.match(migration, /insert into audit\.events/);
  assert.match(migration, /'riskClass', 'R1'/);
  for (const effect of ["dataConnectionEnabled", "providerAuthorizationEnabled", "externalWritesEnabled"]) {
    assert.match(migration, new RegExp(`'${effect}', false`));
  }
  assert.doesNotMatch(migration, /insert into workflow\.approvals/);
});

test("evidence recorder is security-definer but browser-denied and service-role-only", () => {
  assert.match(migration, /security definer[\s\S]*set search_path = pg_catalog/);
  assert.match(migration, /revoke all on function public\.autopilots_record_product_connection_evidence\([\s\S]*from public, anon, authenticated/);
  assert.match(migration, /grant execute on function public\.autopilots_record_product_connection_evidence\([\s\S]*to service_role/);
});
