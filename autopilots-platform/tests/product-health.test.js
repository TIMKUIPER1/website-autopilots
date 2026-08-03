import assert from "node:assert/strict";
import test from "node:test";
import { fetchPortfolioHealth, fetchProductHealth } from "../src/adapters/product-health.js";

const response = (data, status = 200) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(data) });

test("AutoPlanner readiness cannot hide missing durable dependencies", async () => {
  const result = await fetchProductHealth("autoplanner", {
    fetchImpl: async (url) => url.endsWith("/ready")
      ? response({ ready: true, environment: "development", checks: { application: { status: "ok" }, database: { status: "missing" }, queue: { status: "missing" } } })
      : response({ status: "ok", service: "autoplanner" })
  });
  assert.equal(result.status, "degraded");
  assert.equal(result.errorCode, "AUTOPLANNER_DEPENDENCIES_MISSING");
  assert.deepEqual(result.details.missingDependencies, ["database", "queue"]);
  assert.equal(result.externalWrites, false);
});

test("AutoPlanner transport failures use bounded product-specific codes", async () => {
  const unreachable = await fetchProductHealth("autoplanner", {
    fetchImpl: async () => { throw new Error("private network detail"); }
  });
  assert.equal(unreachable.status, "unavailable");
  assert.equal(unreachable.errorCode, "AUTOPLANNER_API_UNREACHABLE");
  assert.equal(JSON.stringify(unreachable).includes("private network detail"), false);

  const accessDenied = await fetchProductHealth("autoplanner", {
    fetchImpl: async (url) => url.endsWith("/health")
      ? response({}, 403)
      : response({ ready: true, checks: {} })
  });
  assert.equal(accessDenied.errorCode, "AUTOPLANNER_API_ACCESS_DENIED");

  const readinessUnavailable = await fetchProductHealth("autoplanner", {
    fetchImpl: async (url) => url.endsWith("/health")
      ? response({ status: "ok" })
      : response({}, 503)
  });
  assert.equal(readinessUnavailable.status, "degraded");
  assert.equal(readinessUnavailable.errorCode, "AUTOPLANNER_READINESS_UNAVAILABLE");
});

test("AutoPlanner malformed contracts identify the failing endpoint", async () => {
  const invalid = (body) => ({ ok: true, status: 200, text: async () => body });
  const health = await fetchProductHealth("autoplanner", {
    fetchImpl: async () => invalid("not-json")
  });
  assert.equal(health.errorCode, "AUTOPLANNER_HEALTH_CONTRACT_INVALID");

  const readiness = await fetchProductHealth("autoplanner", {
    fetchImpl: async (url) => url.endsWith("/health")
      ? response({ status: "ok" })
      : invalid("not-json")
  });
  assert.equal(readiness.errorCode, "AUTOPLANNER_READINESS_CONTRACT_INVALID");
});

test("RoofPlanner offline becomes a stable safe error code", async () => {
  const result = await fetchProductHealth("roofplanner", { fetchImpl: async () => { throw new Error("private network detail"); } });
  assert.equal(result.status, "unavailable");
  assert.equal(result.errorCode, "ROOFPLANNER_API_UNREACHABLE");
  assert.equal(JSON.stringify(result).includes("private network detail"), false);
});

test("remote product probes require HTTPS and an exact configured origin", async () => {
  let called = false;
  const blocked = await fetchProductHealth("autoplanner", {
    baseUrl: "http://metadata.internal",
    allowedOrigin: "http://metadata.internal",
    fetchImpl: async () => { called = true; }
  });
  assert.equal(called, false);
  assert.equal(blocked.errorCode, "AUTOPLANNER_DESTINATION_BLOCKED");

  const mismatched = await fetchProductHealth("roofplanner", {
    baseUrl: "https://roofplanner.example",
    allowedOrigin: "https://different.example",
    fetchImpl: async () => { called = true; }
  });
  assert.equal(called, false);
  assert.equal(mismatched.errorCode, "ROOFPLANNER_DESTINATION_BLOCKED");
});

test("unknown products fail closed", async () => {
  await assert.rejects(() => fetchProductHealth("unknown"), (error) => error.status === 404);
});

test("portfolio health deduplicates authorized brands and summarizes attention", async () => {
  const called = [];
  const result = await fetchPortfolioHealth(["autopilots", "autoplanner", "autoplanner"], {
    probe: async (slug) => {
      called.push(slug);
      return {
        contract: "autopilots.product-health.v1",
        product: slug,
        status: slug === "autopilots" ? "healthy" : "degraded",
        errorCode: slug === "autopilots" ? null : "AUTOPLANNER_DEPENDENCIES_MISSING",
        sourceQuality: "live_readonly_probe",
        externalWrites: false
      };
    }
  });
  assert.deepEqual(called, ["autopilots", "autoplanner"]);
  assert.equal(result.status, "attention_required");
  assert.deepEqual(result.counts, { healthy: 1, degraded: 1, unavailable: 0 });
  assert.equal(result.externalWrites, false);
});
