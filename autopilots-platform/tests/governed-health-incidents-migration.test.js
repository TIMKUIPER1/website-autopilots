import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803220000_governed_health_incidents.sql", import.meta.url), "utf8");

test("health observations are idempotent and active incidents deduplicate", () => {
  assert.match(sql, /health_events_connection_observation_uidx/i);
  assert.match(sql, /on conflict \(connection_id, observation_key\)[\s\S]*do nothing/i);
  assert.match(sql, /incidents_active_dedupe_uidx/i);
  assert.match(sql, /occurrence_count = integration\.incidents\.occurrence_count \+ 1/i);
});

test("incident acknowledgement is a complete governed R1 command", () => {
  assert.match(sql, /'incident\.acknowledge', 'R1'/i);
  assert.match(sql, /p_context_version[\s\S]*stale incident context/i);
  assert.match(sql, /insert into ledger\.usage_entries/i);
  assert.match(sql, /insert into audit\.events/i);
  assert.match(sql, /on conflict \(brand_id, environment_id, idempotency_key\) do nothing/i);
});

test("incident RPCs are service-role only and provider writes stay off", () => {
  assert.match(sql, /revoke all on function public\.autopilots_record_product_health[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_acknowledge_incident[\s\S]*to service_role/i);
  assert.match(sql, /'externalWrites', false/i);
});
