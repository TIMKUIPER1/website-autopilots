import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const sql = await fs.readFile(new URL("../supabase/migrations/20260804003000_durable_portfolio_snapshot.sql", import.meta.url), "utf8");

test("portfolio snapshot is profile, legal-entity and brand scoped", () => {
  assert.match(sql, /p_profile_id uuid[\s\S]*p_legal_entity_id uuid/i);
  assert.match(sql, /m\.profile_id = p_profile_id[\s\S]*m\.legal_entity_id = p_legal_entity_id[\s\S]*m\.status = 'active'/i);
  assert.match(sql, /m\.brand_id is null or m\.brand_id = b\.id/i);
  assert.match(sql, /security invoker/i);
});

test("portfolio snapshot stays honest and service-role only", () => {
  assert.match(sql, /'customerCount', 0/i);
  assert.match(sql, /'goalCount', 0/i);
  assert.match(sql, /'financialQuality', 'unavailable'/i);
  assert.match(sql, /'sourceQuality', 'durable_control_plane'/i);
  assert.match(sql, /'demoMode', false/i);
  assert.match(sql, /'externalWrites', false/i);
  assert.match(sql, /revoke all on function public\.autopilots_portfolio_snapshot\(uuid, uuid\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_portfolio_snapshot\(uuid, uuid\) to service_role/i);
});
