import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804110000_organization_audit_timeline.sql", import.meta.url), "utf8");

test("audit timeline is organization scoped and governance-role bounded", () => {
  assert.match(sql, /e\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /m\.brand_id is null and m\.status = 'active'/);
  assert.match(sql, /m\.role in \('owner', 'admin', 'auditor'\)/);
});

test("audit timeline excludes actor identifiers reasons payloads and evidence", () => {
  assert.match(sql, /'actorIdsExposed', false/);
  assert.match(sql, /'reasonsExposed', false/);
  assert.match(sql, /'payloadsExposed', false/);
  assert.match(sql, /'evidencePayloadsExposed', false/);
  assert.doesNotMatch(sql, /'actorId'/);
  assert.doesNotMatch(sql, /'reason'/);
  assert.doesNotMatch(sql, /'beforeValue'|'afterValue'|'evidence'/);
});

test("audit timeline is read-only and denies browser roles", () => {
  assert.match(sql, /'genericAuditActionEnabled', false/);
  assert.match(sql, /'externalWritesEnabled', false/);
  assert.match(sql, /revoke all on function public\.autopilots_audit_timeline\(uuid, uuid\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_audit_timeline\(uuid, uuid\) to service_role/);
});
