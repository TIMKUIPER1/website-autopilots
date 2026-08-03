import assert from "node:assert/strict";
import test from "node:test";
import { normalizeContext, SupabaseAuthError } from "../src/auth/supabase.js";

const base = {
  profileId: "profile-1",
  authUserId: "auth-1",
  email: "ADMIN@AUTO-PILOTS.IO",
  displayName: "Autopilots Owner",
  role: "owner",
  legalEntityId: "entity-1",
  mfaRequired: true,
  assuranceLevel: "aal1",
  brands: [
    { slug: "autopilots" },
    { slug: "autoreviews" },
    { slug: "autoplanner" },
    { slug: "roofplanner" }
  ]
};

test("Supabase context becomes a scoped internal owner session", () => {
  const session = normalizeContext(base);
  assert.equal(session.email, "admin@auto-pilots.io");
  assert.equal(session.role, "internal");
  assert.equal(session.iamRole, "owner");
  assert.equal(session.mfaRequired, true);
  assert.equal(session.assuranceLevel, "aal1");
  assert.deepEqual(session.companyIds, ["autopilots", "autoreviews", "autoplanner", "roofplanner"]);
});

test("incomplete or unscoped contexts fail closed", () => {
  assert.throws(
    () => normalizeContext({ ...base, brands: [] }),
    (error) => error instanceof SupabaseAuthError && error.code === "INVALID_SESSION_CONTEXT"
  );
});

test("MFA verification input is rejected before any provider request", async () => {
  const { SupabaseAuthGateway } = await import("../src/auth/supabase.js");
  const gateway = new SupabaseAuthGateway({ url: "https://example.supabase.co", publishableKey: "public-example" });
  await assert.rejects(
    () => gateway.verifyMfa("access", "refresh", "not-a-factor", "123"),
    (error) => error instanceof SupabaseAuthError && error.code === "INVALID_MFA_INPUT"
  );
});
