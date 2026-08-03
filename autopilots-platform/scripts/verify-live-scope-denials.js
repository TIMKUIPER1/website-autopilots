import { execFileSync } from "node:child_process";

const projectRef = "wurycoodzcybaxcgqxps";
const apiUrl = `https://${projectRef}.supabase.co`;
const ownerProfileId = "40000000-0000-4000-8000-000000000001";
const legalEntityId = "10000000-0000-4000-8000-000000000001";
const unknownProfileId = "90000000-0000-4000-8000-000000000001";
const outsideLegalEntityId = "90000000-0000-4000-8000-000000000002";

let keys;
try {
  keys = JSON.parse(execFileSync("supabase", [
    "projects", "api-keys", "--project-ref", projectRef, "--reveal", "-o", "json"
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
} catch {
  fail("LIVE_SCOPE_KEYS_UNAVAILABLE");
}

const serviceRoleKey = keys.find((key) => key.name === "service_role" && key.type === "legacy")?.api_key;
const anonKey = keys.find((key) => key.name === "anon" && key.type === "legacy")?.api_key;
if (!serviceRoleKey || !anonKey) fail("LIVE_SCOPE_KEYS_UNAVAILABLE");

const denialCases = [
  ["portfolio-outside-legal-entity", "autopilots_portfolio_snapshot", "42501", {
    p_profile_id: ownerProfileId, p_legal_entity_id: outsideLegalEntityId
  }],
  ["portfolio-unknown-profile", "autopilots_portfolio_snapshot", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId
  }],
  ["brand-twin-unknown-profile", "autopilots_brand_twin", "42501", {
    p_profile_id: unknownProfileId, p_brand_slug: "autoplanner"
  }],
  ["agent-registry-unknown-profile", "autopilots_agent_registry", "42501", {
    p_profile_id: unknownProfileId, p_brand_slug: "autoplanner"
  }],
  ["data-plane-registry-unknown-profile", "autopilots_data_plane_registry", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId
  }],
  ["monitoring-history-unknown-profile", "autopilots_monitoring_history", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId
  }],
  ["error-runbooks-unknown-profile", "autopilots_error_runbooks", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId
  }],
  ["alert-policy-unknown-profile", "autopilots_alert_policy_snapshot", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId
  }],
  ["security-posture-unknown-profile", "autopilots_security_posture", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId, p_current_session_id: null
  }],
  ["audit-timeline-unknown-profile", "autopilots_audit_timeline", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId
  }],
  ["onboarding-unknown-profile", "autopilots_brand_onboarding", "42501", {
    p_profile_id: unknownProfileId, p_brand_slug: "autoplanner"
  }],
  ["incidents-v2-unknown-profile", "autopilots_incident_snapshot_v2", "42501", {
    p_profile_id: unknownProfileId, p_legal_entity_id: legalEntityId, p_brand_slug: "autoplanner"
  }],
  ["access-roster-unknown-legal-entity", "autopilots_access_roster", "P0002", {
    p_profile_id: ownerProfileId, p_legal_entity_id: outsideLegalEntityId
  }]
];

const evidence = [];
for (const [name, rpc, expectedCode, body] of denialCases) {
  const response = await callRpc(rpc, body, serviceRoleKey);
  if (response.status < 400 || response.payload?.code !== expectedCode) {
    fail("LIVE_SCOPE_DENIAL_FAILED", { case: name, status: response.status, errorCode: safeCode(response.payload?.code) });
  }
  evidence.push({ case: name, denied: true, status: response.status, errorCode: expectedCode });
}

const validAgentRegistry = await callRpc("autopilots_agent_registry", {
  p_profile_id: ownerProfileId, p_brand_slug: "autopilots"
}, serviceRoleKey);
if (validAgentRegistry.status !== 200
  || validAgentRegistry.payload?.contract !== "autopilots.agent-registry.v1"
  || !Array.isArray(validAgentRegistry.payload?.agents)
  || validAgentRegistry.payload?.genericAgentActionEnabled !== false
  || validAgentRegistry.payload?.externalWritesEnabled !== false) {
  fail("AGENT_REGISTRY_SERVICE_ROLE_READ_FAILED", {
    status: validAgentRegistry.status,
    errorCode: safeCode(validAgentRegistry.payload?.code)
  });
}
evidence.push({
  case: "service-role-agent-registry-read",
  allowed: true,
  status: validAgentRegistry.status,
  agents: validAgentRegistry.payload.agents.length,
  genericAgentActionEnabled: false,
  externalWritesEnabled: false
});

const validDataPlaneRegistry = await callRpc("autopilots_data_plane_registry", {
  p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId
}, serviceRoleKey);
if (validDataPlaneRegistry.status !== 200
  || validDataPlaneRegistry.payload?.contract !== "autopilots.data-plane-registry.v4"
  || validDataPlaneRegistry.payload?.controlPlane?.projectRef !== projectRef
  || validDataPlaneRegistry.payload?.controlPlane?.status !== "verified"
  || !Array.isArray(validDataPlaneRegistry.payload?.products)
  || validDataPlaneRegistry.payload.products.length !== 3
  || validDataPlaneRegistry.payload.products.filter((item) => item?.dataPlane?.status === "verified").length !== 2
  || validDataPlaneRegistry.payload.products.filter((item) => item?.dataPlane?.status === "not_registered").length !== 1
  || validDataPlaneRegistry.payload.products.find((item) => item?.brand?.slug === "autoplanner")?.dataPlane?.projectRef !== "ixcqwwqldptoschrbtvf"
  || validDataPlaneRegistry.payload.products.find((item) => item?.brand?.slug === "roofplanner")?.dataPlane?.projectRef !== "ggzapceuibzbgbevbvhx"
  || validDataPlaneRegistry.payload.products.find((item) => item?.brand?.slug === "autoreviews")?.dataPlane?.status !== "not_registered"
  || validDataPlaneRegistry.payload.products.some((item) => item?.dataPlane?.status === "verified"
    && item?.dataPlane?.dataConnectionStatus !== "not_authorized")
  || validDataPlaneRegistry.payload.products.filter((item) => item?.discovery?.schemaEvidenceStatus === "verified_product_identity").length !== 2
  || validDataPlaneRegistry.payload?.summary?.registeredProjects !== 3
  || validDataPlaneRegistry.payload?.summary?.registeredProductDataPlanes !== 2
  || validDataPlaneRegistry.payload?.summary?.verifiedProductIdentities !== 2
  || validDataPlaneRegistry.payload?.summary?.activeDataConnections !== 0
  || validDataPlaneRegistry.payload?.summary?.unregisteredProducts !== 1
  || validDataPlaneRegistry.payload?.summary?.verificationCandidates !== 0
  || validDataPlaneRegistry.payload?.summary?.excludedNonPrimaryCandidates !== 1
  || validDataPlaneRegistry.payload?.summary?.snapshotContracts !== 3
  || validDataPlaneRegistry.payload?.summary?.verifiedSnapshotContracts !== 0
  || validDataPlaneRegistry.payload?.summary?.contractsRequiringImplementation !== 3
  || validDataPlaneRegistry.payload.products.filter((item) => item?.discovery?.status === "excluded_non_primary").length !== 1
  || validDataPlaneRegistry.payload.products.some((item) => item?.snapshotContract?.contractKey !== "autopilots.product-snapshot.v1")
  || validDataPlaneRegistry.payload.products.some((item) => item?.snapshotContract?.dataClassification !== "aggregate_no_pii")
  || validDataPlaneRegistry.payload.products.some((item) => !Array.isArray(item?.snapshotContract?.allowedAggregates)
    || item.snapshotContract.allowedAggregates.length === 0)
  || validDataPlaneRegistry.payload.products.some((item) => item?.snapshotContract?.directDatabaseAccessEnabled !== false
    || item?.snapshotContract?.rowLevelDataEnabled !== false
    || item?.snapshotContract?.credentialMaterialStored !== false
    || item?.snapshotContract?.providerAuthorizationEnabled !== false
    || item?.snapshotContract?.externalWritesEnabled !== false)
  || validDataPlaneRegistry.payload?.singleLoginEnabled !== true
  || validDataPlaneRegistry.payload?.crossProjectCredentialSharingEnabled !== false
  || validDataPlaneRegistry.payload?.providerAuthorizationEnabled !== false
  || validDataPlaneRegistry.payload?.dataConnectionsEnabled !== false
  || validDataPlaneRegistry.payload?.directDatabaseAccessEnabled !== false
  || validDataPlaneRegistry.payload?.rowLevelDataEnabled !== false
  || validDataPlaneRegistry.payload?.credentialMaterialExposed !== false
  || validDataPlaneRegistry.payload?.genericRegistrationActionEnabled !== false
  || validDataPlaneRegistry.payload?.externalWritesEnabled !== false) {
  fail("DATA_PLANE_REGISTRY_SERVICE_ROLE_READ_FAILED", {
    status: validDataPlaneRegistry.status,
    errorCode: safeCode(validDataPlaneRegistry.payload?.code)
  });
}
evidence.push({
  case: "service-role-data-plane-registry-read",
  allowed: true,
  status: validDataPlaneRegistry.status,
  controlPlaneProjectRef: projectRef,
  products: validDataPlaneRegistry.payload.products.length,
  registeredProductDataPlanes: 2,
  verifiedProductIdentities: 2,
  activeDataConnections: 0,
  verificationCandidates: 0,
  excludedNonPrimaryCandidates: 1,
  snapshotContracts: 3,
  verifiedSnapshotContracts: 0,
  contractsRequiringImplementation: 3,
  directDatabaseAccessEnabled: false,
  rowLevelDataEnabled: false,
  crossProjectCredentialSharingEnabled: false,
  providerAuthorizationEnabled: false,
  externalWritesEnabled: false
});

const validMonitoringHistory = await callRpc("autopilots_monitoring_history", {
  p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId
}, serviceRoleKey);
if (validMonitoringHistory.status !== 200
  || validMonitoringHistory.payload?.contract !== "autopilots.monitoring-history.v1"
  || !Array.isArray(validMonitoringHistory.payload?.runs)
  || !Number.isInteger(validMonitoringHistory.payload?.summary?.schedulerSucceeded24h)
  || !Number.isInteger(validMonitoringHistory.payload?.summary?.runFailures24h)
  || !Number.isInteger(validMonitoringHistory.payload?.summary?.attention24h)
  || validMonitoringHistory.payload?.automaticRemediationEnabled !== false
  || validMonitoringHistory.payload?.notificationDeliveryEnabled !== false
  || validMonitoringHistory.payload?.externalWritesEnabled !== false) {
  fail("MONITORING_HISTORY_SERVICE_ROLE_READ_FAILED", {
    status: validMonitoringHistory.status,
    errorCode: safeCode(validMonitoringHistory.payload?.code)
  });
}
evidence.push({
  case: "service-role-monitoring-history-read",
  allowed: true,
  status: validMonitoringHistory.status,
  runs: validMonitoringHistory.payload.runs.length,
  attention24h: validMonitoringHistory.payload.summary?.attention24h || 0,
  schedulerSucceeded24h: validMonitoringHistory.payload.summary?.schedulerSucceeded24h || 0,
  runFailures24h: validMonitoringHistory.payload.summary?.runFailures24h || 0,
  automaticRemediationEnabled: false,
  notificationDeliveryEnabled: false,
  externalWritesEnabled: false
});

const validErrorRunbooks = await callRpc("autopilots_error_runbooks", {
  p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId
}, serviceRoleKey);
if (validErrorRunbooks.status !== 200
  || validErrorRunbooks.payload?.contract !== "autopilots.error-runbooks.v1"
  || !Array.isArray(validErrorRunbooks.payload?.runbooks)
  || validErrorRunbooks.payload?.automaticRemediationEnabled !== false
  || validErrorRunbooks.payload?.notificationDeliveryEnabled !== false
  || validErrorRunbooks.payload?.providerWritesEnabled !== false) {
  fail("ERROR_RUNBOOKS_SERVICE_ROLE_READ_FAILED", {
    status: validErrorRunbooks.status,
    errorCode: safeCode(validErrorRunbooks.payload?.code)
  });
}
evidence.push({
  case: "service-role-error-runbooks-read", allowed: true,
  status: validErrorRunbooks.status, runbooks: validErrorRunbooks.payload.runbooks.length,
  automaticRemediationEnabled: false, notificationDeliveryEnabled: false,
  providerWritesEnabled: false
});

const validAlertPolicy = await callRpc("autopilots_alert_policy_snapshot", {
  p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId
}, serviceRoleKey);
if (validAlertPolicy.status !== 200
  || validAlertPolicy.payload?.contract !== "autopilots.alert-policy-snapshot.v1"
  || !Array.isArray(validAlertPolicy.payload?.policies)
  || !Array.isArray(validAlertPolicy.payload?.candidates)
  || validAlertPolicy.payload?.summary?.notificationAttempts !== 0
  || validAlertPolicy.payload?.summary?.deliveries !== 0
  || validAlertPolicy.payload?.automaticRemediationEnabled !== false
  || validAlertPolicy.payload?.notificationDeliveryEnabled !== false
  || validAlertPolicy.payload?.providerWritesEnabled !== false) {
  fail("ALERT_POLICY_SERVICE_ROLE_READ_FAILED", {
    status: validAlertPolicy.status,
    errorCode: safeCode(validAlertPolicy.payload?.code)
  });
}
evidence.push({
  case: "service-role-alert-policy-read", allowed: true,
  status: validAlertPolicy.status,
  policies: validAlertPolicy.payload.policies.length,
  candidates: validAlertPolicy.payload.candidates.length,
  escalationDue: validAlertPolicy.payload.summary?.escalationDue || 0,
  notificationAttempts: 0, deliveries: 0,
  automaticRemediationEnabled: false, notificationDeliveryEnabled: false,
  providerWritesEnabled: false
});

const validSecurityPosture = await callRpc("autopilots_security_posture", {
  p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId, p_current_session_id: null
}, serviceRoleKey);
if (validSecurityPosture.status !== 200
  || validSecurityPosture.payload?.contract !== "autopilots.security-posture.v1"
  || !validSecurityPosture.payload?.summary
  || !Array.isArray(validSecurityPosture.payload?.sessions)
  || validSecurityPosture.payload?.tokenHashesExposed !== false
  || validSecurityPosture.payload?.authUserIdsExposed !== false
  || validSecurityPosture.payload?.revocationReasonsExposed !== false
  || validSecurityPosture.payload?.genericSessionRevocationEnabled !== false
  || validSecurityPosture.payload?.externalWritesEnabled !== false
  || validSecurityPosture.payload?.demoMode !== false) {
  fail("SECURITY_POSTURE_SERVICE_ROLE_READ_FAILED", {
    status: validSecurityPosture.status,
    errorCode: safeCode(validSecurityPosture.payload?.code)
  });
}
evidence.push({
  case: "service-role-security-posture-read", allowed: true,
  status: validSecurityPosture.status,
  activeProfiles: validSecurityPosture.payload.summary.activeProfiles || 0,
  activeSessions: validSecurityPosture.payload.summary.activeSessions || 0,
  activeAal2Sessions: validSecurityPosture.payload.summary.activeAal2Sessions || 0,
  activeAal1Sessions: validSecurityPosture.payload.summary.activeAal1Sessions || 0,
  secretSessionMaterialExposed: false,
  genericSessionRevocationEnabled: false,
  externalWritesEnabled: false
});

const validAuditTimeline = await callRpc("autopilots_audit_timeline", {
  p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId
}, serviceRoleKey);
if (validAuditTimeline.status !== 200
  || validAuditTimeline.payload?.contract !== "autopilots.audit-timeline.v1"
  || !validAuditTimeline.payload?.summary
  || !Array.isArray(validAuditTimeline.payload?.events)
  || validAuditTimeline.payload?.actorIdsExposed !== false
  || validAuditTimeline.payload?.reasonsExposed !== false
  || validAuditTimeline.payload?.payloadsExposed !== false
  || validAuditTimeline.payload?.evidencePayloadsExposed !== false
  || validAuditTimeline.payload?.genericAuditActionEnabled !== false
  || validAuditTimeline.payload?.externalWritesEnabled !== false
  || validAuditTimeline.payload?.demoMode !== false) {
  fail("AUDIT_TIMELINE_SERVICE_ROLE_READ_FAILED", {
    status: validAuditTimeline.status,
    errorCode: safeCode(validAuditTimeline.payload?.code)
  });
}
evidence.push({
  case: "service-role-audit-timeline-read", allowed: true,
  status: validAuditTimeline.status,
  events: validAuditTimeline.payload.events.length,
  events24h: validAuditTimeline.payload.summary.events24h || 0,
  failed24h: validAuditTimeline.payload.summary.failed24h || 0,
  blocked24h: validAuditTimeline.payload.summary.blocked24h || 0,
  privatePayloadsExposed: false,
  genericAuditActionEnabled: false,
  externalWritesEnabled: false
});

for (const rpc of ["autopilots_portfolio_snapshot", "autopilots_brand_twin", "autopilots_agent_registry", "autopilots_data_plane_registry", "autopilots_monitoring_history", "autopilots_error_runbooks", "autopilots_alert_policy_snapshot", "autopilots_security_posture", "autopilots_audit_timeline", "autopilots_incident_snapshot_v2", "autopilots_access_roster"]) {
  const body = rpc === "autopilots_brand_twin" || rpc === "autopilots_agent_registry"
    ? { p_profile_id: ownerProfileId, p_brand_slug: "autoplanner" }
    : rpc === "autopilots_incident_snapshot_v2"
      ? { p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId, p_brand_slug: null }
    : rpc === "autopilots_security_posture"
      ? { p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId, p_current_session_id: null }
    : { p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId };
  const response = await callRpc(rpc, body, anonKey);
  if (response.status < 400) fail("ANONYMOUS_RPC_ACCESSIBLE", { rpc, status: response.status });
  evidence.push({ case: `anonymous-${rpc}`, denied: true, status: response.status, errorCode: safeCode(response.payload?.code) });
}

const impossibleSessionHash = "0".repeat(64);
const missingSession = await callRpc("autopilots_resolve_app_session", {
  p_token_hash: impossibleSessionHash
}, serviceRoleKey);
if (missingSession.status !== 200 || missingSession.payload !== null) {
  fail("SESSION_RESOLVER_SERVICE_ROLE_CONTRACT_FAILED", {
    status: missingSession.status,
    errorCode: safeCode(missingSession.payload?.code)
  });
}
evidence.push({
  case: "service-role-session-resolver-miss", allowed: true,
  status: missingSession.status, sessionFound: false, persistentWrites: false
});

const anonymousSessionResolver = await callRpc("autopilots_resolve_app_session", {
  p_token_hash: impossibleSessionHash
}, anonKey);
if (anonymousSessionResolver.status < 400) {
  fail("ANONYMOUS_SESSION_RESOLVER_ACCESSIBLE", { status: anonymousSessionResolver.status });
}
evidence.push({
  case: "anonymous-autopilots_resolve_app_session", denied: true,
  status: anonymousSessionResolver.status,
  errorCode: safeCode(anonymousSessionResolver.payload?.code)
});

const legacyIncident = await callRpc("autopilots_incident_snapshot", {
  p_profile_id: ownerProfileId, p_brand_slug: null
}, serviceRoleKey);
if (legacyIncident.status < 400) fail("LEGACY_INCIDENT_RPC_ACCESSIBLE", { status: legacyIncident.status });
evidence.push({
  case: "service-role-legacy-incident-v1",
  denied: true,
  status: legacyIncident.status,
  errorCode: safeCode(legacyIncident.payload?.code)
});

console.log(JSON.stringify({
  ok: true,
  contract: "autopilots.live-scope-denial.v1",
  projectRef,
  checks: evidence,
  persistentWrites: false,
  externalWrites: false
}, null, 2));

async function callRpc(rpc, body, key) {
  const response = await fetch(`${apiUrl}/rest/v1/rpc/${rpc}`, {
    method: "POST",
    headers: { apikey: key, authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10_000)
  });
  let payload = null;
  try { payload = await response.json(); } catch {}
  return { status: response.status, payload };
}

function safeCode(value) {
  return /^[A-Z0-9_]{2,32}$/.test(String(value || "")) ? String(value) : "UNSPECIFIED";
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
