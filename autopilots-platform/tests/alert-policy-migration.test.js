import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804100000_alert_policy_projection.sql", import.meta.url), "utf8");

test("alert policy has bounded deterministic thresholds per severity", () => {
  assert.match(sql, /create table workflow\.alert_policies/);
  assert.match(sql, /unique \(legal_entity_id, severity\)/);
  assert.match(sql, /minimum_occurrences between 1 and 100/);
  assert.match(sql, /repeat_suppression_seconds between 60 and 604800/);
  assert.match(sql, /'policyState', case[\s\S]*'observe'[\s\S]*'human_attention'[\s\S]*'escalation_due'/);
});

test("repeated signals remain deduplicated evidence instead of deliveries", () => {
  assert.match(sql, /'deduplicatedOccurrences', greatest\(0, i\.occurrence_count - 1\)/);
  assert.match(sql, /'notificationAttempts', 0/);
  assert.match(sql, /'deliveries', 0/);
  assert.match(sql, /'notificationAttempted', false/);
  assert.match(sql, /'notificationDelivered', false/);
});

test("alert policy cannot remediate notify or write providers", () => {
  assert.match(sql, /check \(notification_channel = 'none'\)/);
  assert.match(sql, /check \(automatic_remediation_enabled = false\)/);
  assert.match(sql, /check \(notification_delivery_enabled = false\)/);
  assert.match(sql, /check \(provider_writes_enabled = false\)/);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger on workflow\.alert_policies from service_role/);
});

test("alert snapshot is organization scoped and browser denied", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /m\.brand_id is null and m\.status = 'active'/);
  assert.match(sql, /where b\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /revoke all on function public\.autopilots_alert_policy_snapshot\(uuid, uuid\) from public, anon, authenticated/);
});
