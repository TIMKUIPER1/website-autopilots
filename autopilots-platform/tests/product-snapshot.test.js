import assert from "node:assert/strict";
import test from "node:test";
import { PRODUCT_AGGREGATE_ALLOWLISTS, validateProductSnapshot } from "../src/adapters/product-snapshot.js";

const now = Date.parse("2026-08-03T23:00:00.000Z");

function snapshot(product = "autoplanner") {
  return {
    contract: "autopilots.product-snapshot.v1",
    product,
    environment: "production",
    observedAt: "2026-08-03T22:55:00.000Z",
    sourceQuality: "product_aggregate",
    dataClassification: "aggregate_no_pii",
    aggregates: Object.fromEntries(PRODUCT_AGGREGATE_ALLOWLISTS[product].map((key) => [key,
      key.includes("_by_") || key.endsWith("_health") || key === "usage_totals"
        ? { active: { value: 12, sampleSize: 12, suppressed: false } }
        : { value: 12, sampleSize: 12, suppressed: false }
    ])),
    privacy: {
      minimumGroupSize: 5,
      smallCellsSuppressed: true,
      containsPersonalData: false,
      containsRowLevelRecords: false,
      containsMessageContent: false,
      containsSecrets: false,
      containsProviderTokens: false,
      containsPaymentInstrumentData: false
    },
    externalWrites: false
  };
}

test("accepts each exact governed product aggregate allowlist", () => {
  for (const product of Object.keys(PRODUCT_AGGREGATE_ALLOWLISTS)) {
    const result = validateProductSnapshot(snapshot(product), { expectedProduct: product, now });
    assert.equal(result.ok, true, `${product}: ${result.errorCode}`);
  }
});

test("rejects extra, missing and cross-product aggregates", () => {
  const extra = snapshot();
  extra.aggregates.customer_emails = { value: 12, sampleSize: 12, suppressed: false };
  assert.equal(validateProductSnapshot(extra, { expectedProduct: "autoplanner", now }).errorCode, "AGGREGATE_NOT_ALLOWED");

  const missing = snapshot();
  delete missing.aggregates.organizations_count;
  assert.equal(validateProductSnapshot(missing, { expectedProduct: "autoplanner", now }).errorCode, "AGGREGATE_NOT_ALLOWED");
  assert.equal(validateProductSnapshot(snapshot("roofplanner"), { expectedProduct: "autoplanner", now }).errorCode, "PRODUCT_MISMATCH");
});

test("requires small cells to be suppressed without retaining their value", () => {
  const unsafe = snapshot();
  unsafe.aggregates.organizations_count = { value: 4, sampleSize: 4, suppressed: false };
  assert.equal(validateProductSnapshot(unsafe, { expectedProduct: "autoplanner", now }).errorCode, "INVALID_AGGREGATE_CELL");

  unsafe.aggregates.organizations_count = { value: null, sampleSize: null, suppressed: true };
  assert.equal(validateProductSnapshot(unsafe, { expectedProduct: "autoplanner", now }).ok, true);

  unsafe.aggregates.organizations_count = { value: null, sampleSize: 4, suppressed: true };
  assert.equal(validateProductSnapshot(unsafe, { expectedProduct: "autoplanner", now }).errorCode, "INVALID_AGGREGATE_CELL");
});

test("rejects stale, future and unparseable observations", () => {
  const stale = snapshot();
  stale.observedAt = "2026-08-03T22:44:59.000Z";
  assert.equal(validateProductSnapshot(stale, { expectedProduct: "autoplanner", now }).errorCode, "SNAPSHOT_STALE");
  stale.observedAt = "2026-08-03T23:01:01.000Z";
  assert.equal(validateProductSnapshot(stale, { expectedProduct: "autoplanner", now }).errorCode, "SNAPSHOT_STALE");
  stale.observedAt = "not-a-date";
  assert.equal(validateProductSnapshot(stale, { expectedProduct: "autoplanner", now }).errorCode, "SNAPSHOT_STALE");
});

test("fails closed when privacy claims, writes or envelope fields change", () => {
  const pii = snapshot();
  pii.privacy.containsPersonalData = true;
  assert.equal(validateProductSnapshot(pii, { expectedProduct: "autoplanner", now }).errorCode, "PRIVACY_GUARD_FAILED");

  const writes = snapshot();
  writes.externalWrites = true;
  assert.equal(validateProductSnapshot(writes, { expectedProduct: "autoplanner", now }).errorCode, "PRIVACY_GUARD_FAILED");

  const secretField = snapshot();
  secretField.token = "must-not-pass";
  assert.equal(validateProductSnapshot(secretField, { expectedProduct: "autoplanner", now }).errorCode, "INVALID_ENVELOPE");
  assert.equal(JSON.stringify(validateProductSnapshot(secretField, { expectedProduct: "autoplanner", now })).includes("must-not-pass"), false);
});

test("rejects nested objects, unsafe segment names and unbounded values", () => {
  const nested = snapshot();
  nested.aggregates.leads_by_status = { active: { value: { count: 12 }, sampleSize: 12, suppressed: false } };
  assert.equal(validateProductSnapshot(nested, { expectedProduct: "autoplanner", now }).errorCode, "INVALID_AGGREGATE_CELL");

  nested.aggregates.leads_by_status = { "person@example.com": { value: 12, sampleSize: 12, suppressed: false } };
  assert.equal(validateProductSnapshot(nested, { expectedProduct: "autoplanner", now }).errorCode, "INVALID_AGGREGATE_CELL");

  nested.aggregates.leads_by_status = { active: { value: Number.POSITIVE_INFINITY, sampleSize: 12, suppressed: false } };
  assert.equal(validateProductSnapshot(nested, { expectedProduct: "autoplanner", now }).errorCode, "INVALID_AGGREGATE_CELL");
});
