import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804103000_security_posture_snapshot.sql", import.meta.url), "utf8");

test("security posture is restricted to organization governance roles", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /m\.brand_id is null and m\.status = 'active'/);
  assert.match(sql, /m\.role in \('owner', 'admin', 'auditor'\)/);
  assert.match(sql, /current session does not belong to profile/);
});

test("security posture separates MFA requirement from session assurance", () => {
  assert.match(sql, /'mfaRequiredProfiles'/);
  assert.match(sql, /'activeAal2Sessions'/);
  assert.match(sql, /'activeAal1Sessions'/);
  assert.match(sql, /'expiringSoon'/);
  assert.match(sql, /'expiredNotRevoked'/);
});

test("security posture excludes secrets and generic revocation", () => {
  assert.match(sql, /'tokenHashesExposed', false/);
  assert.match(sql, /'authUserIdsExposed', false/);
  assert.match(sql, /'revocationReasonsExposed', false/);
  assert.match(sql, /'genericSessionRevocationEnabled', false/);
  assert.doesNotMatch(sql, /'tokenHash'/);
  assert.doesNotMatch(sql, /'authUserId'/);
  assert.doesNotMatch(sql, /'revocationReason'/);
});

test("security posture RPC denies browser roles", () => {
  assert.match(sql, /revoke all on function public\.autopilots_security_posture\(uuid, uuid, uuid\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_security_posture\(uuid, uuid, uuid\) to service_role/);
});
