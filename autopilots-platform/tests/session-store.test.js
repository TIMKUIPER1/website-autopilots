import assert from "node:assert/strict";
import test from "node:test";
import { SupabaseSessionStore, assertTokenHash } from "../src/auth/session-store.js";

const tokenHash = "a".repeat(64);
const context = {
  sessionId: "session-1",
  expiresAt: "2026-08-03T22:00:00.000Z",
  profileId: "profile-1",
  authUserId: "auth-1",
  email: "admin@auto-pilots.io",
  displayName: "Owner",
  role: "owner",
  legalEntityId: "entity-1",
  mfaRequired: true,
  assuranceLevel: "aal2",
  brands: [{ slug: "autopilots", legalEntityId: "entity-1" }]
};

test("session store sends only token hashes to service-role RPCs", async () => {
  const calls = [];
  const client = { rpc: async (name, args) => {
    calls.push({ name, args });
    if (name === "autopilots_create_app_session") return { data: "session-1", error: null };
    if (name === "autopilots_resolve_app_session") return { data: context, error: null };
    return { data: true, error: null };
  } };
  const store = new SupabaseSessionStore({ client });
  await store.create(tokenHash, { id: "profile-1", authUserId: "auth-1", assuranceLevel: "aal2" }, Date.now() + 60000);
  const resolved = await store.resolve(tokenHash);
  await store.revoke(tokenHash);
  assert.equal(resolved.assuranceLevel, "aal2");
  assert.equal(calls.every((call) => JSON.stringify(call).includes(tokenHash)), true);
  assert.equal(calls.some((call) => /access|refresh|raw.?token/i.test(JSON.stringify(call.args))), false);
});

test("malformed hashes fail before database access", () => {
  assert.throws(() => assertTokenHash("raw-session-token"), /Invalid session token hash/);
});
