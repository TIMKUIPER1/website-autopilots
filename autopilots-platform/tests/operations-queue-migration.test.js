import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804080000_organization_operations_queue.sql", import.meta.url), "utf8");

test("operations queue scopes tasks incidents onboarding and commands to one organization", () => {
  assert.match(sql, /m\.role in \('owner', 'admin', 'operator', 'auditor'\)/);
  assert.match(sql, /from workflow\.tasks t[\s\S]*b\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /from integration\.incidents i[\s\S]*b\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /from integration\.onboarding_steps s[\s\S]*b\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /from workflow\.commands c[\s\S]*b\.legal_entity_id = p_legal_entity_id/);
});

test("operations queue exposes bounded error evidence without private contexts or payloads", () => {
  assert.match(sql, /'errorCode', error_code/);
  assert.match(sql, /'runbookReference', runbook_reference/);
  assert.doesNotMatch(sql, /'context', i\.context|'payload', c\.payload|'result', c\.result/);
  assert.match(sql, /'genericTaskActionEnabled', false/);
  assert.match(sql, /'automaticRemediationEnabled', false/);
  assert.match(sql, /'providerWritesEnabled', false/);
});

test("operations queue remains service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_operations_queue\(uuid, uuid\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_operations_queue\(uuid, uuid\) to service_role/);
});
