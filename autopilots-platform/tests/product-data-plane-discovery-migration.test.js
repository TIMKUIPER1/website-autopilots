import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260804133000_product_data_plane_discovery.sql", import.meta.url), "utf8");

test("read-only discovery records only relevant product candidates", () => {
  assert.match(sql, /create table integration\.product_data_plane_discoveries/i);
  assert.match(sql, /'ixcqwwqldptoschrbtvf', 'Autoplanner'/);
  assert.match(sql, /'ggzapceuibzbgbevbvhx', 'Roofplanner'/);
  assert.match(sql, /'zivpzcpxtqqtsrasppez', 'AutoReviews Backups EU'/);
  assert.doesNotMatch(sql, /Animals Faith|Dakcentrale Nederland/);
});

test("name matches remain candidates and backup labels cannot become live authority", () => {
  assert.match(sql, /'exact_name_candidate', 'verification_required'/);
  assert.match(sql, /'backup_label', 'excluded_non_primary'/);
  assert.match(sql, /candidate_kind = 'backup_label' and authority_status = 'excluded_non_primary'/i);
  assert.match(sql, /and b\.slug <> 'autopilots'/i);
});

test("discovery stores no credentials and grants no provider authority", () => {
  assert.match(sql, /credential_material_stored = false/i);
  assert.match(sql, /provider_authorization_enabled = false/i);
  assert.match(sql, /provider_writes_enabled = false/i);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from service_role/i);
  assert.match(sql, /revoke all on integration\.product_data_plane_discoveries from public, anon, authenticated/i);
});

test("v2 projection is organization scoped and browser denied", () => {
  assert.match(sql, /'autopilots\.data-plane-registry\.v2'/);
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /revoke all on function public\.autopilots_data_plane_registry\(uuid, uuid\) from public, anon, authenticated/i);
});
