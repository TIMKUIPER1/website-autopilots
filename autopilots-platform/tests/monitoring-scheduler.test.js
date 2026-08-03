import assert from "node:assert/strict";
import test from "node:test";
import { MonitoringScheduler } from "../src/monitoring/scheduler.js";

const principalId = "41000000-0000-4000-8000-000000000001";
const health = (product, status = "healthy") => ({
  contract: "autopilots.product-health.v1", product, status,
  errorCode: status === "healthy" ? null : "SAFE_ERROR",
  observedAt: "2026-08-03T17:30:00.000Z", sourceQuality: "live_readonly_probe", externalWrites: false
});

function durableRepository(overrides = {}) {
  return {
    claimMonitoringRun: async (_principalId, request) => ({
      contract: "autopilots.monitoring-lease.v2", claimed: true, reason: "claimed",
      runId: "87a784a1-31c2-477f-adaf-7c1afb6b628e", attemptCount: 1, bucket: request.bucket
    }),
    heartbeatMonitoringRun: async () => true,
    completeMonitoringRun: async (_principalId, runId, _holderId, status, counts) => ({
      contract: "autopilots.monitoring-run.v2", runId, status, counts
    }),
    monitoringFreshness: async () => ({
      contract: "autopilots.monitoring-freshness.v2", brands: [], externalWrites: false
    }),
    recordProductHealth: async () => ({ replayed: false }),
    ...overrides
  };
}

test("scheduler uses deterministic time buckets and delegated authority", async () => {
  const calls = [];
  const scheduler = new MonitoringScheduler({
    enabled: true, intervalMs: 60000, authorityPrincipalId: principalId,
    brandSlugs: ["autopilots", "autoplanner", "autoplanner"],
    probe: async (slug) => health(slug, slug === "autoplanner" ? "degraded" : "healthy"),
    repository: durableRepository({ recordProductHealth: async (...args) => { calls.push(args); return { replayed: false }; } })
  });
  const result = await scheduler.runOnce(new Date("2026-08-03T17:30:00.000Z"));
  assert.equal(result.outcome, "succeeded");
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], principalId);
  assert.match(calls[0][2], /^scheduled_\d+_autopilots$/);
  assert.deepEqual(result.counts, { healthy: 1, degraded: 1, unavailable: 0, failed: 0 });
  assert.equal(scheduler.status().externalWrites, false);
});

test("scheduler blocks overlapping runs and strips private failures", async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const scheduler = new MonitoringScheduler({
    enabled: true, intervalMs: 60000, authorityPrincipalId: principalId,
    brandSlugs: ["autoplanner"],
    probe: async () => { await gate; throw new Error("private provider detail"); },
    repository: durableRepository()
  });
  const first = scheduler.runOnce(new Date("2026-08-03T17:31:00.000Z"));
  const overlap = await scheduler.runOnce(new Date("2026-08-03T17:31:01.000Z"));
  assert.deepEqual(overlap, { skipped: true, reason: "overlap_blocked" });
  release();
  const result = await first;
  assert.equal(result.outcome, "partial");
  assert.equal(result.results[0].errorCode, "MONITORING_CAPTURE_FAILED");
  assert.equal(JSON.stringify(result).includes("private provider detail"), false);
});

test("scheduler accepts only one durable lease winner per bucket", async () => {
  let claims = 0;
  const repository = durableRepository({
    claimMonitoringRun: async (_principalId, request) => ({
      contract: "autopilots.monitoring-lease.v2",
      claimed: claims++ === 0,
      reason: claims === 1 ? "claimed" : "lease_active",
      runId: "87a784a1-31c2-477f-adaf-7c1afb6b628e",
      attemptCount: 1,
      bucket: request.bucket
    })
  });
  const options = {
    enabled: true, intervalMs: 60000, authorityPrincipalId: principalId,
    brandSlugs: ["autopilots"], probe: async (slug) => health(slug), repository
  };
  const first = new MonitoringScheduler({ ...options, instanceId: "63ef75f9-7a1b-4c45-a470-1cc4511437bb" });
  const second = new MonitoringScheduler({ ...options, instanceId: "150b9624-2d82-42af-9ea9-56baecbb2ee0" });
  const at = new Date("2026-08-03T17:32:00.000Z");
  assert.equal((await first.runOnce(at)).outcome, "succeeded");
  assert.deepEqual(await second.runOnce(at), {
    skipped: true, reason: "lease_active", runId: "87a784a1-31c2-477f-adaf-7c1afb6b628e", bucket: Math.floor(at.getTime() / 60000)
  });
});

test("scheduler closes a claimed run with safe failed evidence", async () => {
  const completions = [];
  const repository = durableRepository({
    heartbeatMonitoringRun: async () => false,
    completeMonitoringRun: async (...args) => { completions.push(args); return { contract: "autopilots.monitoring-run.v2", runId: args[1] }; }
  });
  const scheduler = new MonitoringScheduler({
    enabled: true, intervalMs: 60000, authorityPrincipalId: principalId,
    brandSlugs: ["autopilots"], probe: async (slug) => health(slug), repository
  });
  const result = await scheduler.runOnce(new Date("2026-08-03T17:33:00.000Z"));
  assert.equal(result.outcome, "failed");
  assert.equal(completions[0][3], "failed");
  assert.equal(completions[0][5], "MONITORING_RUN_FAILED");
  assert.equal(JSON.stringify(result).includes("lease"), false);
});
