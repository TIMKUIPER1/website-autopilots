import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804073000_organization_approval_queue.sql", import.meta.url), "utf8");

test("approval queue is organization scoped and governance-role bounded", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id[\s\S]*m\.brand_id is null/);
  assert.match(sql, /m\.role in \('owner', 'admin', 'auditor'\)/);
  assert.match(sql, /where b\.legal_entity_id = p_legal_entity_id/);
});

test("approval queue exposes bounded evidence without command payloads", () => {
  assert.match(sql, /'commandType', c\.command_type/);
  assert.match(sql, /'evidence', a\.evidence/);
  assert.doesNotMatch(sql, /'payload', c\.payload|'result', c\.result/);
  assert.match(sql, /'genericDecisionEnabled', false/);
  assert.match(sql, /'providerAuthorizationEnabled', false/);
  assert.match(sql, /'externalWritesEnabled', false/);
});

test("approval queue remains service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_approval_queue\(uuid, uuid\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_approval_queue\(uuid, uuid\) to service_role/);
});
