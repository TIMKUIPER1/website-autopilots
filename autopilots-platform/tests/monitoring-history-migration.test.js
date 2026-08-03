import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804085000_organization_monitoring_history.sql", import.meta.url), "utf8");

test("monitoring history is organization and portfolio-role scoped", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /m\.brand_id is null and m\.status = 'active'/);
  assert.match(sql, /m\.role in \('owner', 'admin', 'operator', 'auditor'\)/);
  assert.match(sql, /r\.legal_entity_id = p_legal_entity_id/);
  assert.match(sql, /limit 20/);
});

test("monitoring history exposes bounded evidence without runtime holder identifiers", () => {
  assert.match(sql, /'contract', 'autopilots\.monitoring-history\.v1'/);
  assert.match(sql, /'errorCode', recent\.error_code/);
  assert.match(sql, /'leaseRecovered', recent\.attempt_count > 1/);
  assert.match(sql, /'durationMs'/);
  assert.doesNotMatch(sql, /'holderId'/);
  assert.doesNotMatch(sql, /'authorityProfileId'/);
  assert.doesNotMatch(sql, /'authorityPrincipalId'/);
});

test("monitoring history cannot remediate, notify, or write externally", () => {
  assert.match(sql, /'automaticRemediationEnabled', false/);
  assert.match(sql, /'notificationDeliveryEnabled', false/);
  assert.match(sql, /'externalWritesEnabled', false/);
  assert.match(sql, /revoke all on function public\.autopilots_monitoring_history\(uuid, uuid\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_monitoring_history\(uuid, uuid\) to service_role/);
});
