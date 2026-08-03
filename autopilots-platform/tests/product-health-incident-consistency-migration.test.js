import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260804120000_product_health_incident_consistency.sql", import.meta.url), "utf8");

test("every bounded connector failure has an exact guidance-only runbook", () => {
  for (const code of [
    "AUTOREVIEWS_DESTINATION_BLOCKED",
    "AUTOREVIEWS_INVALID_CONTRACT",
    "AUTOREVIEWS_INVALID_JSON",
    "AUTOREVIEWS_RESPONSE_TOO_LARGE",
    "AUTOPLANNER_API_ACCESS_DENIED",
    "AUTOPLANNER_API_UNREACHABLE",
    "AUTOPLANNER_HEALTH_CONTRACT_INVALID",
    "AUTOPLANNER_READINESS_CONTRACT_INVALID",
    "AUTOPLANNER_READINESS_UNAVAILABLE"
  ]) assert.match(sql, new RegExp(`'${code}'`));
  assert.match(sql, /docs\/runbooks\/ERROR_RESPONSE\.md/);
});

test("a new health observation supersedes stale active codes without deleting history", () => {
  assert.match(sql, /resolutionReason', 'superseded_by_current_health_code'/);
  assert.match(sql, /i\.code <> p_error_code/);
  assert.match(sql, /get diagnostics v_superseded_count = row_count/);
  assert.doesNotMatch(sql, /delete\s+from\s+integration\.incidents/i);
});

test("legacy AutoPlanner generic code is normalized with evidence", () => {
  assert.match(sql, /normalizedFromCode', 'UNREACHABLE'/);
  assert.match(sql, /AUTOPLANNER_API_UNREACHABLE/);
  assert.match(sql, /superseded_by_latest_health_observation/);
});

test("corrected health recording remains server-only and read-only toward products", () => {
  assert.match(sql, /revoke all on function public\.autopilots_record_product_health[\s\S]*from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_record_product_health[\s\S]*to service_role/);
  assert.match(sql, /'externalWrites', false/);
});
