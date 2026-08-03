import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803233000_durable_monitoring_leases.sql", import.meta.url), "utf8");

test("monitoring runs have one durable lease per bucket and bounded recovery", () => {
  assert.match(sql, /unique \(lease_key, bucket\)/i);
  assert.match(sql, /run_status = 'running' and v_run\.lease_expires_at <= now\(\)/i);
  assert.match(sql, /attempt_count = attempt_count \+ 1/i);
  assert.match(sql, /autopilots_heartbeat_monitoring_run/i);
});

test("monitoring completion emits R0 audit evidence without provider writes", () => {
  assert.match(sql, /'monitoring\.run_completed'/i);
  assert.match(sql, /'R0'/i);
  assert.match(sql, /'externalWrites', false/i);
  assert.match(sql, /raise exception 'monitoring lease lost'/i);
});

test("freshness is portfolio scoped and service-role only", () => {
  assert.match(sql, /autopilots_monitoring_freshness/i);
  assert.match(sql, /m\.brand_id is null/i);
  assert.match(sql, /'never_observed'/i);
  assert.match(sql, /grant execute on function public\.autopilots_monitoring_freshness[\s\S]*to service_role/i);
  assert.match(sql, /revoke all on integration\.monitoring_runs from public, anon, authenticated/i);
});
