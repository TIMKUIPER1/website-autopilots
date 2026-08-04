const PENDING_CHECKSUMS = Object.freeze({
  "20260804150000_product_connection_readiness.sql": "f7f1c3331cea00aef21db98d36fba5307344c477d3e11c000194ef2af54e8a3b",
  "20260804153000_product_connection_evidence_recording.sql": "d2b557c13aedab1f3dd5604de6cf21e9de6473dbc611f7a65d41ee6ff78f7b8c",
  "20260804160000_atomic_product_snapshot_evidence.sql": "199e05eb4fcb58a0c344f4546cb7c1fde976c164b99ea9f0dfac320d9d83ec12"
});

const PENDING_CHANGE_IDS = Object.freeze({
  "20260804150000_product_connection_readiness.sql": "AP-INT-20260803-010",
  "20260804153000_product_connection_evidence_recording.sql": "AP-INT-20260803-011",
  "20260804160000_atomic_product_snapshot_evidence.sql": "AP-INT-20260803-012"
});

const PRODUCT_SLUGS = Object.freeze(["autoplanner", "autoreviews", "roofplanner"]);
const GATE_KEYS = Object.freeze([
  "project_identity", "owned_https_endpoint", "vault_secret_reference",
  "contract_probe", "privacy_probe", "freshness_probe", "reconciliation",
  "revocation_test", "rate_limit_test", "failure_mode_test",
  "independent_review", "current_human_approval"
]);

export function validateProductReadinessAcceptance(value) {
  if (!isRecord(value)
    || value.migrationCount !== 48
    || value.governedRpcCount !== 40
    || !exactRecord(value.pendingChecksums, PENDING_CHECKSUMS)
    || !exactRecord(value.pendingChangeIds, PENDING_CHANGE_IDS)
    || value.gatePolicyCount !== 12 || value.snapshotContractCount !== 3
    || value.evidenceRowCount !== 0 || value.evidenceCommandCount !== 0
    || value.evidenceUsageCount !== 0 || value.evidenceAuditCount !== 0
    || value.appendOnlyTriggerEnabled !== true
    || value.serviceRoleCanReadEvidence !== true || value.serviceRoleCanInsertEvidence !== false
    || value.authenticatedCanReadEvidence !== false || value.authenticatedCanInsertEvidence !== false
    || value.anonCanReadEvidence !== false || value.anonCanInsertEvidence !== false
    || value.serviceRoleCanRecordSingle !== true || value.serviceRoleCanRecordBatch !== true
    || value.authenticatedCanRecordSingle !== false || value.authenticatedCanRecordBatch !== false
    || value.anonCanRecordSingle !== false || value.anonCanRecordBatch !== false
    || value.contractExternalWritesEnabledCount !== 0
    || value.contractProviderAuthorizationEnabledCount !== 0
    || value.contractCredentialMaterialStoredCount !== 0
    || value.contractDirectDatabaseAccessEnabledCount !== 0
    || value.contractRowLevelDataEnabledCount !== 0
    || !validReadiness(value.readiness)) {
    throw Object.assign(new Error("Live product-readiness acceptance failed."), {
      code: "PRODUCT_READINESS_ACCEPTANCE_FAILED"
    });
  }
  return {
    contract: "autopilots.product-readiness-live-acceptance.v1",
    migrationCount: value.migrationCount,
    governedRpcCount: value.governedRpcCount,
    products: value.readiness.products.length,
    gatesPerProduct: 12,
    evidenceRows: 0,
    readyProducts: 0,
    dataConnectionEnabled: false,
    providerAuthorizationEnabled: false,
    externalWritesEnabled: false
  };
}

function validReadiness(value) {
  return isRecord(value)
    && value.contract === "autopilots.product-connection-readiness.v1"
    && value.organizationId === "10000000-0000-4000-8000-000000000001"
    && Array.isArray(value.products) && value.products.length === 3
    && exactValues(value.products.map((product) => product?.brand?.slug), PRODUCT_SLUGS)
    && value.products.every((product) => product?.readyForActivation === false
      && product.passedGates >= 0 && product.blockedGates >= 0
      && product.passedGates + product.blockedGates === 12
      && Array.isArray(product.gates) && product.gates.length === 12
      && exactValues(product.gates.map((gate) => gate?.key), GATE_KEYS)
      && product.gates.every((gate) => gate?.status === "passed" || gate?.status === "blocked"))
    && value.summary?.products === 3 && value.summary.readyForActivation === 0
    && value.summary.blocked === 3
    && value.dataConnectionEnabled === false
    && value.providerAuthorizationEnabled === false
    && value.externalWritesEnabled === false;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function exactRecord(value, expected) {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  const expectedKeys = Object.keys(expected).sort();
  return keys.length === expectedKeys.length
    && keys.every((key, index) => key === expectedKeys[index] && value[key] === expected[key]);
}

function exactValues(value, expected) {
  return Array.isArray(value) && value.length === expected.length
    && [...value].sort().every((entry, index) => entry === [...expected].sort()[index]);
}
