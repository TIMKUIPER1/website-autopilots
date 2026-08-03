import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804090000_monitoring_history_attention_fix.sql", import.meta.url), "utf8");

test("scheduler completion and product attention are separate truths", () => {
  assert.match(sql, /'schedulerSucceeded24h'/);
  assert.match(sql, /'runFailures24h'/);
  assert.match(sql, /'attention24h'[\s\S]*counts->>'degraded'/);
  assert.match(sql, /counts->>'unavailable'/);
  assert.match(sql, /counts->>'failed'/);
});

test("attention correction preserves scope and no-effect boundaries", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /r\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /'automaticRemediationEnabled', false/);
  assert.match(sql, /'notificationDeliveryEnabled', false/);
  assert.match(sql, /'externalWritesEnabled', false/);
});
