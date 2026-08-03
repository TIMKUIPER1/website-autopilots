import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803230000_scoped_incident_snapshot.sql", import.meta.url), "utf8");

test("incident snapshot is membership scoped and active-only", () => {
  assert.match(sql, /m\.profile_id = p_profile_id[\s\S]*m\.legal_entity_id = b\.legal_entity_id[\s\S]*m\.brand_id is null or m\.brand_id = b\.id/i);
  assert.match(sql, /i\.status in \('open', 'acknowledged', 'mitigating'\)/i);
  assert.match(sql, /p_brand_slug is null or b\.slug = p_brand_slug/i);
});

test("incident snapshot exposes bounded operational fields and no private context", () => {
  assert.match(sql, /'contract', 'autopilots\.incidents\.v1'/i);
  assert.match(sql, /'contextVersion', occurrence_count/i);
  assert.match(sql, /'externalWritesEnabled', false/i);
  assert.doesNotMatch(sql, /'context', context/i);
});

test("incident snapshot RPC is service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_incident_snapshot\(uuid, text\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_incident_snapshot\(uuid, text\) to service_role/i);
});
