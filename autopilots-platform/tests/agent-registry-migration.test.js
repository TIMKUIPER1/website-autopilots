import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804083000_agent_registry_read_model.sql", import.meta.url), "utf8");

test("agent registry stores bounded facts and cannot enable controls or writes", () => {
  assert.match(sql, /create table workflow\.agent_registry/);
  assert.match(sql, /check \(control_enabled = false\)/);
  assert.match(sql, /check \(external_writes_enabled = false\)/);
  assert.match(sql, /runtime_status = 'unknown'[\s\S]*last_observed_at is null[\s\S]*source_quality = 'registered'/);
  assert.match(sql, /runtime_status <> 'unknown'[\s\S]*last_observed_at is not null/);
  assert.doesNotMatch(sql, /insert into workflow\.agent_registry/i);
});

test("agent registry read is profile and operating-brand scoped", () => {
  assert.match(sql, /p\.id = p_profile_id and p\.status = 'active'/);
  assert.match(sql, /m\.legal_entity_id = v_brand\.legal_entity_id/);
  assert.match(sql, /m\.brand_id is null or m\.brand_id = v_brand\.id/);
  assert.match(sql, /m\.role in \('owner', 'admin', 'operator', 'auditor'\)/);
  assert.match(sql, /where a\.brand_id = v_brand\.id/);
});

test("agent registry contract excludes demo authority and generic actions", () => {
  assert.match(sql, /'contract', 'autopilots\.agent-registry\.v1'/);
  assert.match(sql, /'registryAvailable', true/);
  assert.match(sql, /'genericAgentActionEnabled', false/);
  assert.match(sql, /'externalWritesEnabled', false/);
  assert.match(sql, /'demoMode', false/);
});

test("agent registry RPC is service-role only and table denies browser roles", () => {
  assert.match(sql, /alter table workflow\.agent_registry enable row level security/);
  assert.match(sql, /revoke all on workflow\.agent_registry from public, anon, authenticated/);
  assert.match(sql, /revoke all on function public\.autopilots_agent_registry\(uuid, text\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_agent_registry\(uuid, text\) to service_role/);
});
