import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const sql = await fs.readFile(new URL("../supabase/migrations/20260804020000_scoped_incident_snapshot_v2.sql", import.meta.url), "utf8");

test("incident v2 requires explicit legal-entity membership and filters every row", () => {
  assert.match(sql, /p_profile_id uuid[\s\S]*p_legal_entity_id uuid[\s\S]*p_brand_slug text/i);
  assert.match(sql, /m\.profile_id = p_profile_id[\s\S]*m\.legal_entity_id = p_legal_entity_id[\s\S]*m\.status = 'active'/i);
  assert.match(sql, /where b\.legal_entity_id = p_legal_entity_id[\s\S]*exists \([\s\S]*m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /'legalEntityId', p_legal_entity_id/i);
});

test("incident v1 is retired and v2 stays server-only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_incident_snapshot_v2\(uuid, uuid, text\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_incident_snapshot_v2\(uuid, uuid, text\) to service_role/i);
  assert.match(sql, /revoke execute on function public\.autopilots_incident_snapshot\(uuid, text\) from service_role/i);
});
