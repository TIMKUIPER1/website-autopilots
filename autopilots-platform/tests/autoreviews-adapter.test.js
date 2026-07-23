import assert from "node:assert/strict";
import test from "node:test";
import { fetchAutoreviewsSnapshot } from "../src/adapters/autoreviews.js";

test("AutoReviews adapter accepteert uitsluitend het aggregate no-PII contract", async () => {
  const result = await fetchAutoreviewsSnapshot({
    baseUrl: "http://autoreviews.test",
    fetchImpl: async () => ({
      ok: true,
      json: async () => ({ schemaVersion: "autoreviews.os-snapshot.v1", dataClassification: "aggregate_no_pii" })
    })
  });
  assert.equal(result.status, "connected");
  assert.equal(result.snapshot.dataClassification, "aggregate_no_pii");

  const invalid = await fetchAutoreviewsSnapshot({
    baseUrl: "http://autoreviews.test",
    fetchImpl: async () => ({ ok: true, json: async () => ({ schemaVersion: "unknown" }) })
  });
  assert.equal(invalid.status, "degraded");
  assert.equal(invalid.errorCode, "invalid_contract");
});

test("AutoReviews adapter degradeert veilig wanneer de website-backend offline is", async () => {
  const result = await fetchAutoreviewsSnapshot({
    fetchImpl: async () => { throw Object.assign(new Error("private detail"), { code: "ECONNREFUSED" }); }
  });
  assert.deepEqual({ status: result.status, errorCode: result.errorCode, snapshot: result.snapshot }, {
    status: "degraded", errorCode: "unreachable", snapshot: null
  });
});
