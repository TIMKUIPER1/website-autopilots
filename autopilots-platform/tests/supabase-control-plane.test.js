import assert from "node:assert/strict";
import test from "node:test";
import { SupabaseControlPlaneRepository } from "../src/persistence/supabase-control-plane.js";

test("onboarding read passes explicit profile and brand scope", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: {
      contract: "autopilots.onboarding.v2", steps: [], connections: [], connectorRequests: [],
      providerAuthorizationEnabled: false, externalWritesEnabled: false
    }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const result = await repository.brandOnboarding("40000000-0000-4000-8000-000000000001", "autoplanner");
  assert.equal(result.contract, "autopilots.onboarding.v2");
  assert.deepEqual(calls[0], {
    name: "autopilots_brand_onboarding",
    args: { p_profile_id: "40000000-0000-4000-8000-000000000001", p_brand_slug: "autoplanner" }
  });
});

test("connector staging sends bounded no-effect intent to the governed RPC", async () => {
  const calls = [];
  const requestId = "51000000-0000-4000-8000-000000000001";
  const commandId = "51000000-0000-4000-8000-000000000002";
  const approvalId = "51000000-0000-4000-8000-000000000003";
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: {
      contract: "autopilots.connector-request.v1", requestId, commandId, approvalId,
      status: "approval_required", riskClass: "R3", replayed: false,
      providerAuthorizationStarted: false, providerAccountConnected: false,
      discoveryStarted: false, credentialsStored: false, externalWrites: false
    }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const profileId = "40000000-0000-4000-8000-000000000001";
  const result = await repository.stageConnectorRequest(profileId, "autoplanner", {
    stepKey: "supabase", displayLabel: "AutoPlanner Supabase"
  }, "connector_12345678");
  assert.equal(result.providerAuthorizationStarted, false);
  assert.deepEqual(calls[0], {
    name: "autopilots_stage_connector_request",
    args: {
      p_profile_id: profileId,
      p_brand_slug: "autoplanner",
      p_step_key: "supabase",
      p_display_label: "AutoPlanner Supabase",
      p_idempotency_key: "connector_12345678"
    }
  });
});

test("connector staging rejects unbounded input before service-role access", async () => {
  const repository = new SupabaseControlPlaneRepository({ client: { rpc: async () => assert.fail("RPC must not run") } });
  await assert.rejects(() => repository.stageConnectorRequest(
    "40000000-0000-4000-8000-000000000001", "autoplanner",
    { stepKey: "../supabase", displayLabel: "x" }, "short"
  ), (error) => error.status === 400);
});

test("connector decision carries brand, current context and permanent no-effect evidence", async () => {
  const calls = [];
  const requestId = "52000000-0000-4000-8000-000000000001";
  const decisionCommandId = "52000000-0000-4000-8000-000000000002";
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: {
      contract: "autopilots.connector-decision.v1", requestId, decisionCommandId,
      status: "approved", riskClass: "R3", contextVersion: 2, replayed: false,
      providerAuthorizationStarted: false, providerAccountConnected: false,
      discoveryStarted: false, credentialsStored: false, externalWrites: false
    }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const result = await repository.decideConnectorRequest(
    "40000000-0000-4000-8000-000000000001", "autoplanner", requestId,
    "approved", 1, "connector_decide_12345678"
  );
  assert.equal(result.providerAuthorizationStarted, false);
  assert.deepEqual(calls[0], {
    name: "autopilots_decide_connector_request",
    args: {
      p_profile_id: "40000000-0000-4000-8000-000000000001",
      p_brand_slug: "autoplanner",
      p_request_id: requestId,
      p_decision: "approved",
      p_context_version: 1,
      p_idempotency_key: "connector_decide_12345678"
    }
  });
});

test("portfolio read passes explicit profile and legal-entity scope", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: {
      contract: "autopilots.portfolio.v2", brands: [], sourceOfTruth: [], dataHealth: {},
      launchReadiness: { providerAuthorizationEnabled: false, externalWritesEnabled: false },
      demoMode: false, externalWrites: false
    }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const profileId = "40000000-0000-4000-8000-000000000001";
  const legalEntityId = "10000000-0000-4000-8000-000000000001";
  const result = await repository.portfolio(profileId, legalEntityId);
  assert.equal(result.contract, "autopilots.portfolio.v2");
  assert.deepEqual(calls[0], {
    name: "autopilots_portfolio_snapshot",
    args: { p_profile_id: profileId, p_legal_entity_id: legalEntityId }
  });
});

test("brand twin read passes explicit profile and brand scope", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: {
      contract: "autopilots.brand-twin.v1", brand: { slug: "autoplanner" }, integrations: [], ownerExceptions: [],
      demoMode: false, externalWrites: false
    }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  await repository.brandTwin("40000000-0000-4000-8000-000000000001", "autoplanner");
  assert.deepEqual(calls[0], {
    name: "autopilots_brand_twin",
    args: { p_profile_id: "40000000-0000-4000-8000-000000000001", p_brand_slug: "autoplanner" }
  });
});

test("invalid scope fails before service-role access", async () => {
  const repository = new SupabaseControlPlaneRepository({ client: { rpc: async () => assert.fail("RPC must not run") } });
  await assert.rejects(() => repository.brandOnboarding("bad", "../other"), (error) => error.status === 404);
});

test("incident read is explicitly profile, legal-entity and brand scoped", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.incidents.v2", legalEntityId: "10000000-0000-4000-8000-000000000001", incidents: [], counts: { active: 0 } }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  await repository.incidents("40000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000001", "autoplanner");
  assert.deepEqual(calls[0], {
    name: "autopilots_incident_snapshot_v2",
    args: {
      p_profile_id: "40000000-0000-4000-8000-000000000001",
      p_legal_entity_id: "10000000-0000-4000-8000-000000000001",
      p_brand_slug: "autoplanner"
    }
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
    if (name === "autopilots_claim_monitoring_run_v2") return { data: { contract: "autopilots.monitoring-lease.v2", claimed: true, runId }, error: null };
    if (name === "autopilots_heartbeat_monitoring_run_v2") return { data: true, error: null };
    return { data: { contract: "autopilots.monitoring-run.v2", runId }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const principalId = "41000000-0000-4000-8000-000000000001";
  await repository.claimMonitoringRun(principalId, {
    leaseKey: "product_health_portfolio", bucket: 123, holderId, intervalSeconds: 900, leaseSeconds: 120
  });
  assert.equal(await repository.heartbeatMonitoringRun(principalId, runId, holderId, 120), true);
  await repository.completeMonitoringRun(principalId, runId, holderId, "succeeded", { healthy: 1, degraded: 1, unavailable: 2, failed: 0 });
  assert.deepEqual(calls[0].args, {
    p_principal_id: principalId,
    p_lease_key: "product_health_portfolio", p_bucket: 123, p_holder_id: holderId,
    p_interval_seconds: 900, p_lease_seconds: 120
  });
  assert.equal(calls[2].args.p_error_code, null);
});

test("monitoring freshness requires its versioned safe contract", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.monitoring-freshness.v2", brands: [], externalWrites: false }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const principalId = "41000000-0000-4000-8000-000000000001";
  const result = await repository.monitoringFreshness(principalId, 1800);
  assert.equal(result.externalWrites, false);
  assert.deepEqual(calls[0], {
    name: "autopilots_monitoring_freshness_v2",
    args: { p_principal_id: principalId, p_stale_after_seconds: 1800 }
  });
});

test("access roster is explicitly profile and organization scoped", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.access-roster.v1", members: [], requests: [], externalWrites: false }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  await repository.accessRoster("40000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000001");
  assert.deepEqual(calls[0], {
    name: "autopilots_access_roster",
    args: {
      p_profile_id: "40000000-0000-4000-8000-000000000001",
      p_legal_entity_id: "10000000-0000-4000-8000-000000000001"
    }
  });
});

test("access request normalizes bounded input and returns no-write evidence", async () => {
  const calls = [];
  const requestId = "9c856ac8-0145-488f-98b3-5b0e85057b81";
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.access-request.v1", requestId, status: "approval_required", replayed: false, externalWrites: false }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const result = await repository.stageAccessRequest(
    "40000000-0000-4000-8000-000000000001",
    "10000000-0000-4000-8000-000000000001",
    { email: "  TEAM@Example.com ", displayName: " Team Lid ", role: "viewer", brandSlug: "autoplanner" },
    "access_12345678"
  );
  assert.equal(result.externalWrites, false);
  assert.deepEqual(calls[0], {
    name: "autopilots_stage_access_request",
    args: {
      p_profile_id: "40000000-0000-4000-8000-000000000001",
      p_legal_entity_id: "10000000-0000-4000-8000-000000000001",
      p_email: "team@example.com",
      p_display_name: "Team Lid",
      p_role: "viewer",
      p_brand_slug: "autoplanner",
      p_idempotency_key: "access_12345678"
    }
  });
});

test("access decision carries organization, current context and no-apply evidence", async () => {
  const calls = [], requestId = "9c856ac8-0145-488f-98b3-5b0e85057b81";
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: { contract: "autopilots.access-decision.v1", requestId, status: "approved", contextVersion: 2, membershipApplied: false, providerInviteSent: false, externalWrites: false, replayed: false }, error: null };
  } };
  const repository = new SupabaseControlPlaneRepository({ client });
  const result = await repository.decideAccessRequest(
    "40000000-0000-4000-8000-000000000001", "10000000-0000-4000-8000-000000000001",
    requestId, "approved", 1, "access_decide_12345678"
  );
  assert.equal(result.membershipApplied, false);
  assert.deepEqual(calls[0], { name: "autopilots_decide_access_request", args: {
    p_profile_id: "40000000-0000-4000-8000-000000000001",
    p_legal_entity_id: "10000000-0000-4000-8000-000000000001",
    p_request_id: requestId, p_decision: "approved", p_context_version: 1,
    p_idempotency_key: "access_decide_12345678"
  } });
});
