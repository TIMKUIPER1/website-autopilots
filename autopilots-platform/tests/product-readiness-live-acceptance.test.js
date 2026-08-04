import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateProductReadinessAcceptance } from "../src/acceptance/product-readiness.js";

const checksums = {
  "20260804150000_product_connection_readiness.sql": "f7f1c3331cea00aef21db98d36fba5307344c477d3e11c000194ef2af54e8a3b",
  "20260804153000_product_connection_evidence_recording.sql": "d2b557c13aedab1f3dd5604de6cf21e9de6473dbc611f7a65d41ee6ff78f7b8c",
  "20260804160000_atomic_product_snapshot_evidence.sql": "199e05eb4fcb58a0c344f4546cb7c1fde976c164b99ea9f0dfac320d9d83ec12"
};

const changeIds = {
  "20260804150000_product_connection_readiness.sql": "AP-INT-20260803-010",
  "20260804153000_product_connection_evidence_recording.sql": "AP-INT-20260803-011",
  "20260804160000_atomic_product_snapshot_evidence.sql": "AP-INT-20260803-012"
};

const gateKeys = [
  "project_identity", "owned_https_endpoint", "vault_secret_reference",
  "contract_probe", "privacy_probe", "freshness_probe", "reconciliation",
  "revocation_test", "rate_limit_test", "failure_mode_test",
  "independent_review", "current_human_approval"
];

function acceptance() {
  return {
    migrationCount: 48, governedRpcCount: 40, pendingChecksums: { ...checksums },
    pendingChangeIds: { ...changeIds }, gatePolicyCount: 12,
    snapshotContractCount: 3, evidenceRowCount: 0, evidenceCommandCount: 0,
    evidenceUsageCount: 0, evidenceAuditCount: 0, appendOnlyTriggerEnabled: true,
    serviceRoleCanReadEvidence: true, serviceRoleCanInsertEvidence: false,
    authenticatedCanReadEvidence: false, authenticatedCanInsertEvidence: false,
    anonCanReadEvidence: false, anonCanInsertEvidence: false,
    serviceRoleCanRecordSingle: true,
    serviceRoleCanRecordBatch: true, authenticatedCanRecordSingle: false,
    authenticatedCanRecordBatch: false, anonCanRecordSingle: false,
    anonCanRecordBatch: false, contractExternalWritesEnabledCount: 0,
    contractProviderAuthorizationEnabledCount: 0, contractCredentialMaterialStoredCount: 0,
    contractDirectDatabaseAccessEnabledCount: 0, contractRowLevelDataEnabledCount: 0,
    readiness: {
      contract: "autopilots.product-connection-readiness.v1",
      organizationId: "10000000-0000-4000-8000-000000000001",
      products: ["autoreviews", "autoplanner", "roofplanner"].map((slug) => ({
        brand: { slug, name: slug }, readyForActivation: false,
        passedGates: slug === "autoreviews" ? 0 : 1,
        blockedGates: slug === "autoreviews" ? 12 : 11,
        gates: gateKeys.map((key) => ({ key, status: "blocked" }))
      })),
      summary: { products: 3, readyForActivation: 0, blocked: 3 },
      dataConnectionEnabled: false, providerAuthorizationEnabled: false,
      externalWritesEnabled: false
    }
  };
}

test("acceptance proves the exact empty no-effect live readiness posture", () => {
  const result = validateProductReadinessAcceptance(acceptance());
  assert.deepEqual(result, {
    contract: "autopilots.product-readiness-live-acceptance.v1",
    migrationCount: 48, governedRpcCount: 40, products: 3, gatesPerProduct: 12,
    evidenceRows: 0, readyProducts: 0, dataConnectionEnabled: false,
    providerAuthorizationEnabled: false, externalWritesEnabled: false
  });
});

test("acceptance treats registry maps as exact values independent of key order", () => {
  const value = acceptance();
  value.pendingChecksums = Object.fromEntries(Object.entries(value.pendingChecksums).reverse());
  value.pendingChangeIds = Object.fromEntries(Object.entries(value.pendingChangeIds).reverse());
  assert.equal(validateProductReadinessAcceptance(value).governedRpcCount, 40);
});

test("acceptance rejects residue, privilege escalation, mutation and activation claims", () => {
  for (const mutate of [
    (value) => { value.migrationCount = 47; },
    (value) => { value.governedRpcCount = 39; },
    (value) => { value.pendingChecksums[Object.keys(checksums)[0]] = "0".repeat(64); },
    (value) => { value.pendingChangeIds[Object.keys(changeIds)[0]] = "AP-INT-wrong"; },
    (value) => { value.evidenceRowCount = 1; },
    (value) => { value.evidenceCommandCount = 1; },
    (value) => { value.appendOnlyTriggerEnabled = false; },
    (value) => { value.serviceRoleCanInsertEvidence = true; },
    (value) => { value.anonCanReadEvidence = true; },
    (value) => { value.authenticatedCanRecordBatch = true; },
    (value) => { value.contractExternalWritesEnabledCount = 1; },
    (value) => { value.contractDirectDatabaseAccessEnabledCount = 1; },
    (value) => { value.readiness.products[0].brand.slug = "unknown"; },
    (value) => { value.readiness.products[0].gates[0].key = "unknown"; },
    (value) => { value.readiness.products[0].readyForActivation = true; },
    (value) => { value.readiness.externalWritesEnabled = true; }
  ]) {
    const value = acceptance();
    mutate(value);
    assert.throws(() => validateProductReadinessAcceptance(value),
      (error) => error.code === "PRODUCT_READINESS_ACCEPTANCE_FAILED");
  }
});

test("live verifier is project-pinned, select-only and secret-safe", async () => {
  const source = await readFile(new URL("../scripts/verify-live-product-readiness.js", import.meta.url), "utf8");
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /select jsonb_build_object/);
  assert.match(source, /count\(distinct p\.proname\)/);
  assert.match(source, /pendingChangeIds/);
  assert.doesNotMatch(source, /\b(?:insert|update|delete|alter|drop|create|truncate)\s+(?:into|table|function|trigger|schema)?/i);
  assert.match(source, /has_table_privilege\('service_role'/);
  assert.match(source, /has_function_privilege\('authenticated'/);
  assert.match(source, /product_connection_gate_evidence_append_only/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:token|query|payload|response)/i);
});
