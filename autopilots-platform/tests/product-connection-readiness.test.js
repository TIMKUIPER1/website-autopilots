import assert from "node:assert/strict";
import test from "node:test";
import {
  PRODUCT_CONNECTION_GATES,
  productConnectionReadiness
} from "../src/adapters/product-connection-readiness.js";

const now = Date.parse("2026-08-04T16:00:00.000Z");

function completeEvidence() {
  return Object.fromEntries(PRODUCT_CONNECTION_GATES.map(({ key, maxAgeSeconds, requiresContextVersion }) => [key, {
    status: "passed",
    observedAt: new Date(now - 1000).toISOString(),
    expiresAt: new Date(now + Math.min(maxAgeSeconds * 1000 - 2000, 600000)).toISOString(),
    ...(requiresContextVersion ? { contextVersion: 7 } : {})
  }]));
}

test("all twelve current gates are required before activation readiness", () => {
  const result = productConnectionReadiness(completeEvidence(), { now, currentContextVersion: 7 });
  assert.equal(result.readyForActivation, true);
  assert.equal(result.gates.length, 12);
  assert.deepEqual(result.blockers, []);
  assert.equal(result.dataConnectionEnabled, false);
  assert.equal(result.providerAuthorizationEnabled, false);
  assert.equal(result.externalWritesEnabled, false);
});

test("missing evidence produces stable complete blocker codes", () => {
  const result = productConnectionReadiness({}, { now, currentContextVersion: 7 });
  assert.equal(result.readyForActivation, false);
  assert.deepEqual(result.blockers, PRODUCT_CONNECTION_GATES.map(({ code }) => code));
});

test("expired evidence and overlong validity fail closed", () => {
  const evidence = completeEvidence();
  evidence.contract_probe.expiresAt = new Date(now).toISOString();
  evidence.revocation_test.expiresAt = new Date(now + 2592001 * 1000).toISOString();
  const result = productConnectionReadiness(evidence, { now, currentContextVersion: 7 });
  assert.deepEqual(result.blockers, ["CONTRACT_PROBE_REQUIRED_STALE", "REVOCATION_TEST_REQUIRED_STALE"]);
});

test("human approval must match the current context version", () => {
  const result = productConnectionReadiness(completeEvidence(), { now, currentContextVersion: 8 });
  assert.deepEqual(result.blockers, ["APPROVAL_CONTEXT_STALE"]);
});

test("unknown gates and malformed context are rejected", () => {
  assert.throws(() => productConnectionReadiness({ invented: {} }, { now }), /READINESS_EVIDENCE_INVALID/);
  assert.throws(() => productConnectionReadiness({}, { now, currentContextVersion: 0 }), /READINESS_CONTEXT_INVALID/);
});
