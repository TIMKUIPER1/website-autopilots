import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { SupabaseControlPlaneRepository } from "../src/persistence/supabase-control-plane.js";

const profileId = "40000000-0000-4000-8000-000000000001";
const legalEntityId = "10000000-0000-4000-8000-000000000001";
const gateKeys = [
  "project_identity", "owned_https_endpoint", "vault_secret_reference",
  "contract_probe", "privacy_probe", "freshness_probe", "reconciliation",
  "revocation_test", "rate_limit_test", "failure_mode_test",
  "independent_review", "current_human_approval"
];

function payload() {
  return {
    contract: "autopilots.product-connection-readiness.v1",
    organizationId: legalEntityId,
    products: [{
      brand: { slug: "autoplanner", name: "AutoPlanner" }, readyForActivation: false,
      passedGates: 1, blockedGates: 11,
      gates: gateKeys.map((key, index) => ({
        key, status: index === 0 ? "passed" : "blocked",
        code: index === 0 ? null : "EVIDENCE_REQUIRED", observedAt: null, expiresAt: null
      }))
    }],
    summary: { products: 1, readyForActivation: 0, blocked: 1 },
    dataConnectionEnabled: false, providerAuthorizationEnabled: false, externalWritesEnabled: false
  };
}

test("repository reads only the scoped fail-closed readiness contract", async () => {
  const calls = [];
  const repository = new SupabaseControlPlaneRepository({ client: { rpc: async (name, args) => {
    calls.push({ name, args });
    return { data: payload(), error: null };
  } } });
  const result = await repository.productConnectionReadiness(profileId, legalEntityId);
  assert.equal(result.products[0].readyForActivation, false);
  assert.deepEqual(calls[0], { name: "autopilots_product_connection_readiness", args: {
    p_profile_id: profileId, p_legal_entity_id: legalEntityId
  } });
});

test("repository rejects activation claims and malformed gate sets", async () => {
  for (const mutate of [
    (value) => { value.products[0].readyForActivation = true; },
    (value) => { value.products[0].gates.pop(); },
    (value) => { value.products[0].gates[0].key = "invented"; },
    (value) => { value.dataConnectionEnabled = true; }
  ]) {
    const data = payload();
    mutate(data);
    const repository = new SupabaseControlPlaneRepository({ client: { rpc: async () => ({ data, error: null }) } });
    await assert.rejects(() => repository.productConnectionReadiness(profileId, legalEntityId),
      (error) => error.status === 503);
  }
});

test("readiness route requires an internal managed session", async () => {
  const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");
  assert.match(server, /url\.pathname === "\/api\/v1\/data-planes\/readiness"[\s\S]*requireSession\(req\)[\s\S]*requireInternal\(session\)[\s\S]*productConnectionReadiness\([\s\S]*session\.id, session\.organizationId/);
});

test("portfolio shows a Dutch fail-closed twelve-gate overview without activation actions", async () => {
  const [workspace, styles] = await Promise.all([
    readFile(new URL("../public/workspace.js", import.meta.url), "utf8"),
    readFile(new URL("../public/workspace.css", import.meta.url), "utf8")
  ]);
  assert.match(workspace, /fetch\('\/api\/v1\/data-planes\/readiness'\)/);
  assert.match(workspace, /function productConnectionReadinessPanel\(\)/);
  assert.match(workspace, /Twaalf bewijzen vóór koppelen/);
  assert.match(workspace, /Activatiepoort nog niet live/);
  assert.match(workspace, /providerautorisatie en externe writes uit/);
  assert.match(workspace, /Bekijk alle controles/);
  assert.doesNotMatch(workspace, /data-action="(?:activate|connect-product|approve-readiness)"/);
  assert.match(styles, /#workspaceApp \.readiness-grid/);
  assert.match(styles, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:1050px\)\{#workspaceApp \.readiness-grid\{grid-template-columns:1fr\}\}/);
});
