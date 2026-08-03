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
