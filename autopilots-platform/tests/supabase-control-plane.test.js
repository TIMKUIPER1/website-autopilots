import assert from "node:assert/strict";
import test from "node:test";
import { SupabaseControlPlaneRepository } from "../src/persistence/supabase-control-plane.js";

test("onboarding read passes explicit profile and brand scope", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.onboarding.v1", steps: [] }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const result = await repository.brandOnboarding("40000000-0000-4000-8000-000000000001", "autoplanner");
  assert.equal(result.contract, "autopilots.onboarding.v1");
  assert.deepEqual(calls[0], {
    name: "autopilots_brand_onboarding",
    args: { p_profile_id: "40000000-0000-4000-8000-000000000001", p_brand_slug: "autoplanner" }
  });
});

test("invalid scope fails before service-role access", async () => {
  const repository = new SupabaseControlPlaneRepository({ client: { rpc: async () => assert.fail("RPC must not run") } });
  await assert.rejects(() => repository.brandOnboarding("bad", "../other"), (error) => error.status === 404);
});

test("incident read is explicitly profile and brand scoped", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.incidents.v1", incidents: [], counts: { active: 0 } }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  await repository.incidents("40000000-0000-4000-8000-000000000001", "autoplanner");
  assert.deepEqual(calls[0], {
    name: "autopilots_incident_snapshot",
    args: { p_profile_id: "40000000-0000-4000-8000-000000000001", p_brand_slug: "autoplanner" }
  });
});

test("health ingestion accepts only the allowlisted read-only contract", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { eventId: "event-1", replayed: false }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  await repository.recordProductHealth("40000000-0000-4000-8000-000000000001", {
    contract: "autopilots.product-health.v1",
    product: "autoplanner",
    status: "degraded",
    errorCode: "AUTOPLANNER_DEPENDENCIES_MISSING",
    observedAt: new Date().toISOString(),
    sourceQuality: "live_readonly_probe",
    externalWrites: false
  }, "probe_12345678");
  assert.equal(calls[0].name, "autopilots_record_product_health");
  assert.equal(calls[0].args.p_observation_key, "manual:probe_12345678");
  assert.equal(calls[0].args.p_summary.includes("database"), false);
  await assert.rejects(() => repository.recordProductHealth("40000000-0000-4000-8000-000000000001", {
    contract: "autopilots.product-health.v1", product: "autoplanner", status: "healthy",
    observedAt: new Date().toISOString(), sourceQuality: "live_readonly_probe", externalWrites: true
  }, "probe_87654321"), (error) => error.status === 400);
});

test("incident acknowledgement carries context and idempotency and maps stale state", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return calls.length === 1
      ? { data: { commandId: "command-1", status: "acknowledged", replayed: false }, error: null }
      : { data: null, error: { code: "P0001", message: "stale incident context" } };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const incidentId = "87a784a1-31c2-477f-adaf-7c1afb6b628e";
  await repository.acknowledgeIncident("40000000-0000-4000-8000-000000000001", incidentId, 2, "ack_12345678");
  assert.deepEqual(calls[0].args, {
    p_profile_id: "40000000-0000-4000-8000-000000000001",
    p_incident_id: incidentId,
    p_context_version: 2,
    p_idempotency_key: "ack_12345678"
  });
  await assert.rejects(
    () => repository.acknowledgeIncident("40000000-0000-4000-8000-000000000001", incidentId, 1, "ack_87654321"),
    (error) => error.status === 409 && /ververs/.test(error.message)
  );
});

test("durable monitoring lease passes only bounded scheduler authority", async () => {
  const calls = [];
  const runId = "87a784a1-31c2-477f-adaf-7c1afb6b628e";
  const holderId = "63ef75f9-7a1b-4c45-a470-1cc4511437bb";
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    if (name === "autopilots_claim_monitoring_run") return { data: { contract: "autopilots.monitoring-lease.v1", claimed: true, runId }, error: null };
    if (name === "autopilots_heartbeat_monitoring_run") return { data: true, error: null };
    return { data: { contract: "autopilots.monitoring-run.v1", runId }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  await repository.claimMonitoringRun("40000000-0000-4000-8000-000000000001", {
    leaseKey: "product_health_portfolio", bucket: 123, holderId, intervalSeconds: 900, leaseSeconds: 120
  });
  assert.equal(await repository.heartbeatMonitoringRun(runId, holderId, 120), true);
  await repository.completeMonitoringRun(runId, holderId, "succeeded", { healthy: 1, degraded: 1, unavailable: 2, failed: 0 });
  assert.deepEqual(calls[0].args, {
    p_authority_profile_id: "40000000-0000-4000-8000-000000000001",
    p_lease_key: "product_health_portfolio", p_bucket: 123, p_holder_id: holderId,
    p_interval_seconds: 900, p_lease_seconds: 120
  });
  assert.equal(calls[2].args.p_error_code, null);
});

test("monitoring freshness requires its versioned safe contract", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.monitoring-freshness.v1", brands: [], externalWrites: false }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const result = await repository.monitoringFreshness("40000000-0000-4000-8000-000000000001", 1800);
  assert.equal(result.externalWrites, false);
  assert.deepEqual(calls[0], {
    name: "autopilots_monitoring_freshness",
    args: { p_authority_profile_id: "40000000-0000-4000-8000-000000000001", p_stale_after_seconds: 1800 }
  });
});
