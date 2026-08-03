import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260804140000_verified_product_data_planes.sql", import.meta.url), "utf8");

test("schema evidence is fingerprinted without storing rows or credentials", () => {
  assert.match(sql, /schema_fingerprint_sha256 text/i);
  assert.match(sql, /'bc1b8190d9759a4d393974fb5c4dcd27c6568b358c4b59207bdd717ce09c3704'/);
  assert.match(sql, /'778ce86830ba4f140906ae30c8cd6e7963d12614e76cef09b5bb81c1703d336a'/);
  assert.match(sql, /'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'/);
  assert.match(sql, /schema_path_count > 0/i);
  assert.match(sql, /candidate_kind = 'backup_label'[\s\S]*schema_path_count = 0/i);
  assert.match(sql, /where project_ref in \([\s\S]*'ixcqwwqldptoschrbtvf'[\s\S]*'ggzapceuibzbgbevbvhx'[\s\S]*'zivpzcpxtqqtsrasppez'[\s\S]*\)/i);
});

test("only AutoPlanner and RoofPlanner become verified project identities", () => {
  assert.match(sql, /'20000000-0000-4000-8000-000000000003'[\s\S]*'ixcqwwqldptoschrbtvf'/);
  assert.match(sql, /'20000000-0000-4000-8000-000000000004'[\s\S]*'ggzapceuibzbgbevbvhx'/);
  assert.doesNotMatch(sql, /'product_data', 'zivpzcpxtqqtsrasppez'/);
  assert.match(sql, /'verified', 'approved_readonly_discovery'/);
});

test("verified identity remains separate from data authorization", () => {
  assert.match(sql, /'dataConnectionStatus', 'not_authorized'/);
  assert.match(sql, /'activeDataConnections', 0/);
  assert.match(sql, /'providerAuthorizationEnabled', false/);
  assert.match(sql, /'dataConnectionsEnabled', false/);
  assert.match(sql, /'externalWritesEnabled', false/);
});

test("v3 remains organization scoped and browser denied", () => {
  assert.match(sql, /'autopilots\.data-plane-registry\.v3'/);
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /revoke all on function public\.autopilots_data_plane_registry\(uuid, uuid\) from public, anon, authenticated/i);
});
