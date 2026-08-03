import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260804123000_health_observation_ordering.sql", import.meta.url), "utf8");

test("health ingestion is serialized per product connection", () => {
  assert.match(sql, /pg_advisory_xact_lock\(hashtextextended\(new\.connection_id::text, 0\)\)/i);
  assert.match(sql, /before insert on integration\.health_events/i);
});

test("late or equal-time observations cannot replace newer current truth", () => {
  assert.match(sql, /new\.observed_at <= v_latest_observed_at/i);
  assert.match(sql, /raise exception 'stale health observation'/i);
  assert.match(sql, /errcode = 'P0001'/i);
});

test("exact idempotent replays still reach the existing conflict contract", () => {
  assert.match(sql, /new\.observation_key is not null and exists/i);
  assert.match(sql, /h\.observation_key = new\.observation_key/i);
  assert.match(sql, /return new;/i);
});

test("ordering guard remains outside browser authority", () => {
  assert.match(sql, /set search_path = pg_catalog, integration/i);
  assert.match(sql, /revoke all on function integration\.enforce_health_observation_order\(\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function integration\.enforce_health_observation_order\(\) to service_role/i);
});
