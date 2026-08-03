import assert from "node:assert/strict";
import test from "node:test";
import { fetchAutoreviewsSnapshot } from "../src/adapters/autoreviews.js";

test("AutoReviews adapter accepteert uitsluitend het aggregate no-PII contract", async () => {
  const result = await fetchAutoreviewsSnapshot({
    baseUrl: "https://autoreviews.test",
    allowedOrigin: "https://autoreviews.test",
    fetchImpl: async () => ({
      ok: true,
      text: async () => JSON.stringify({ schemaVersion: "autoreviews.os-snapshot.v1", dataClassification: "aggregate_no_pii" })
    })
  });
  assert.equal(result.status, "connected");
  assert.equal(result.snapshot.dataClassification, "aggregate_no_pii");

  const invalid = await fetchAutoreviewsSnapshot({
    baseUrl: "https://autoreviews.test",
    allowedOrigin: "https://autoreviews.test",
    fetchImpl: async () => ({ ok: true, text: async () => JSON.stringify({ schemaVersion: "unknown" }) })
  });
  assert.equal(invalid.status, "degraded");
  assert.equal(invalid.errorCode, "invalid_contract");
});

test("AutoReviews secret wordt nooit naar een niet-geautoriseerde bestemming gestuurd", async () => {
  let called = false;
  const result = await fetchAutoreviewsSnapshot({
    baseUrl: "https://attacker.example",
    allowedOrigin: "https://autoreviews.example",
    secret: "sensitive-value",
    fetchImpl: async () => { called = true; }
  });
  assert.equal(called, false);
  assert.equal(result.errorCode, "destination_blocked");
  assert.equal(JSON.stringify(result).includes("attacker.example"), false);
  assert.equal(JSON.stringify(result).includes("sensitive-value"), false);
});

test("AutoReviews responsegrootte is begrensd vóór JSON parsing", async () => {
  const result = await fetchAutoreviewsSnapshot({
    baseUrl: "http://127.0.0.1:43117",
    fetchImpl: async () => ({ ok: true, text: async () => "x".repeat(100001) })
  });
  assert.equal(result.errorCode, "response_too_large");
});

test("AutoReviews malformed JSON wordt een veilige contractfout", async () => {
  const result = await fetchAutoreviewsSnapshot({
    baseUrl: "http://127.0.0.1:43117",
    fetchImpl: async () => ({ ok: true, text: async () => "not-json" })
  });
  assert.equal(result.errorCode, "invalid_json");
});

test("AutoReviews adapter degradeert veilig wanneer de website-backend offline is", async () => {
  const result = await fetchAutoreviewsSnapshot({
    fetchImpl: async () => { throw Object.assign(new Error("private detail"), { code: "ECONNREFUSED" }); }
  });
  assert.deepEqual({ status: result.status, errorCode: result.errorCode, snapshot: result.snapshot }, {
    status: "degraded", errorCode: "unreachable", snapshot: null
  });
});
