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

for (const rpc of ["autopilots_portfolio_snapshot", "autopilots_brand_twin", "autopilots_agent_registry", "autopilots_incident_snapshot_v2", "autopilots_access_roster"]) {
  const body = rpc === "autopilots_brand_twin" || rpc === "autopilots_agent_registry"
    ? { p_profile_id: ownerProfileId, p_brand_slug: "autoplanner" }
    : rpc === "autopilots_incident_snapshot_v2"
      ? { p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId, p_brand_slug: null }
    : { p_profile_id: ownerProfileId, p_legal_entity_id: legalEntityId };
  const response = await callRpc(rpc, body, anonKey);
  if (response.status < 400) fail("ANONYMOUS_RPC_ACCESSIBLE", { rpc, status: response.status });
  evidence.push({ case: `anonymous-${rpc}`, denied: true, status: response.status, errorCode: safeCode(response.payload?.code) });
}

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
