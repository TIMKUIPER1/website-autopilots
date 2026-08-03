import assert from "node:assert/strict";
import test from "node:test";
import { MonitoringScheduler } from "../src/monitoring/scheduler.js";

const profileId = "40000000-0000-4000-8000-000000000001";
const health = (product, status = "healthy") => ({
  contract: "autopilots.product-health.v1", product, status,
  errorCode: status === "healthy" ? null : "SAFE_ERROR",
  observedAt: "2026-08-03T17:30:00.000Z", sourceQuality: "live_readonly_probe", externalWrites: false
});

test("scheduler uses deterministic time buckets and delegated authority", async () => {
  const calls = [];
  const scheduler = new MonitoringScheduler({
    enabled: true, intervalMs: 60000, authorityProfileId: profileId,
    brandSlugs: ["autopilots", "autoplanner", "autoplanner"],
    probe: async (slug) => health(slug, slug === "autoplanner" ? "degraded" : "healthy"),
    repository: { recordProductHealth: async (...args) => { calls.push(args); return { replayed: false }; } }
  });
  const result = await scheduler.runOnce(new Date("2026-08-03T17:30:00.000Z"));
  assert.equal(result.outcome, "succeeded");
  assert.equal(calls.length, 2);
  assert.equal(calls[0][0], profileId);
  assert.match(calls[0][2], /^scheduled_\d+_autopilots$/);
  assert.deepEqual(result.counts, { healthy: 1, degraded: 1, unavailable: 0, failed: 0 });
  assert.equal(scheduler.status().externalWrites, false);
});

test("scheduler blocks overlapping runs and strips private failures", async () => {
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const scheduler = new MonitoringScheduler({
    enabled: true, intervalMs: 60000, authorityProfileId: profileId,
    brandSlugs: ["autoplanner"],
    probe: async () => { await gate; throw new Error("private provider detail"); },
    repository: { recordProductHealth: async () => ({ replayed: false }) }
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
