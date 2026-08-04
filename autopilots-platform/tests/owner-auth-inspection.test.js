import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../scripts/inspect-live-owner-auth-readiness.js", import.meta.url), "utf8"
);

test("owner auth inspection is exact-target and SELECT-only", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /const OWNER_PROFILE_ID = "40000000-0000-4000-8000-000000000001"/);
  assert.match(source, /const LEGAL_ENTITY_ID = "10000000-0000-4000-8000-000000000001"/);
  assert.match(source, /select jsonb_build_object/);
  assert.doesNotMatch(source, /\b(?:insert|update|delete|alter|create|drop|truncate)\s+(?:into|table|function|from)?/iu);
  assert.match(source, /databaseWrites: false/);
  assert.match(source, /externalWrites: false/);
});

test("owner auth inspection returns no identity or factor material", () => {
  assert.match(source, /ownerProfileActive/);
  assert.match(source, /ownerMembershipActive/);
  assert.match(source, /authUserLinked/);
  assert.match(source, /verifiedTotpFactors/);
  assert.match(source, /activeAal2Sessions/);
  assert.match(source, /s\.revoked_at is null and s\.assurance_level = 'aal2'/);
  assert.doesNotMatch(source, /s\.status = 'active'/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:accessToken|token|query|payload|response)/i);
  assert.doesNotMatch(source, /(?:email|phone|friendly_name|secret|factor_id)/i);
});
