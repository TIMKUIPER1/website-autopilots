const POLICY_VERSION = "autopilots.product-connection-readiness.v1";

export const PRODUCT_CONNECTION_GATES = Object.freeze([
  Object.freeze({ key: "project_identity", code: "PROJECT_IDENTITY_UNVERIFIED", maxAgeSeconds: 2592000 }),
  Object.freeze({ key: "owned_https_endpoint", code: "ENDPOINT_NOT_VERIFIED", maxAgeSeconds: 604800 }),
  Object.freeze({ key: "vault_secret_reference", code: "SECRET_REFERENCE_MISSING", maxAgeSeconds: 604800 }),
  Object.freeze({ key: "contract_probe", code: "CONTRACT_PROBE_REQUIRED", maxAgeSeconds: 86400 }),
  Object.freeze({ key: "privacy_probe", code: "PRIVACY_PROBE_REQUIRED", maxAgeSeconds: 86400 }),
  Object.freeze({ key: "freshness_probe", code: "FRESHNESS_PROBE_REQUIRED", maxAgeSeconds: 86400 }),
  Object.freeze({ key: "reconciliation", code: "RECONCILIATION_REQUIRED", maxAgeSeconds: 86400 }),
  Object.freeze({ key: "revocation_test", code: "REVOCATION_TEST_REQUIRED", maxAgeSeconds: 2592000 }),
  Object.freeze({ key: "rate_limit_test", code: "RATE_LIMIT_TEST_REQUIRED", maxAgeSeconds: 2592000 }),
  Object.freeze({ key: "failure_mode_test", code: "FAILURE_MODE_TEST_REQUIRED", maxAgeSeconds: 604800 }),
  Object.freeze({ key: "independent_review", code: "INDEPENDENT_REVIEW_REQUIRED", maxAgeSeconds: 2592000 }),
  Object.freeze({ key: "current_human_approval", code: "CURRENT_APPROVAL_REQUIRED", maxAgeSeconds: 900, requiresContextVersion: true })
]);

const GATE_KEYS = new Set(PRODUCT_CONNECTION_GATES.map(({ key }) => key));

export function productConnectionReadiness(evidence, {
  now = Date.now(),
  currentContextVersion = null
} = {}) {
  if (!Number.isFinite(now)) throw new TypeError("READINESS_TIME_INVALID");
  if (!isRecord(evidence) || Object.keys(evidence).some((key) => !GATE_KEYS.has(key))) {
    throw new TypeError("READINESS_EVIDENCE_INVALID");
  }
  if (currentContextVersion !== null
    && (!Number.isSafeInteger(currentContextVersion) || currentContextVersion < 1)) {
    throw new TypeError("READINESS_CONTEXT_INVALID");
  }

  const gates = PRODUCT_CONNECTION_GATES.map((policy) => {
    const result = evaluateGate(evidence[policy.key], policy, { now, currentContextVersion });
    return { key: policy.key, status: result.status, code: result.code };
  });
  const blockers = gates.filter(({ status }) => status !== "passed").map(({ code }) => code);

  return {
    contract: POLICY_VERSION,
    readyForActivation: blockers.length === 0,
    blockers,
    gates,
    dataConnectionEnabled: false,
    providerAuthorizationEnabled: false,
    externalWritesEnabled: false
  };
}

function evaluateGate(value, policy, { now, currentContextVersion }) {
  if (!isRecord(value) || value.status !== "passed") return blocked(policy.code);
  const observedAt = Date.parse(value.observedAt);
  const expiresAt = Date.parse(value.expiresAt);
  if (!Number.isFinite(observedAt) || !Number.isFinite(expiresAt)
    || observedAt > now + 60000 || expiresAt <= now
    || expiresAt <= observedAt || expiresAt - observedAt > policy.maxAgeSeconds * 1000) {
    return blocked(`${policy.code}_STALE`);
  }
  if (policy.requiresContextVersion
    && (!Number.isSafeInteger(currentContextVersion)
      || value.contextVersion !== currentContextVersion)) {
    return blocked("APPROVAL_CONTEXT_STALE");
  }
  return { status: "passed", code: null };
}

function blocked(code) {
  return { status: "blocked", code };
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}
