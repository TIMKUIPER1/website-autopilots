import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260804143000_product_snapshot_contract_catalog.sql", import.meta.url), "utf8");

test("snapshot contracts are product scoped and aggregate only", () => {
  assert.match(sql, /create table integration\.product_snapshot_contracts/i);
  assert.match(sql, /contract_key = 'autopilots\.product-snapshot\.v1'/i);
  assert.match(sql, /transport = 'product_aggregate_api'/i);
  assert.match(sql, /data_classification = 'aggregate_no_pii'/i);
  assert.match(sql, /small_cell_suppression_threshold >= 5/i);
  assert.match(sql, /foreign key \(brand_id, legal_entity_id\)/i);
});

test("catalog denies direct databases rows credentials providers and writes", () => {
  assert.match(sql, /direct_database_access_enabled = false/i);
  assert.match(sql, /row_level_data_enabled = false/i);
  assert.match(sql, /credential_material_stored = false/i);
  assert.match(sql, /provider_authorization_enabled = false/i);
  assert.match(sql, /external_writes_enabled = false/i);
  assert.match(sql, /raw_pii.*row_level_records.*message_content.*secrets.*provider_tokens/i);
});

test("all three products have explicit bounded aggregate allowlists", () => {
  assert.match(sql, /reviews_requested_count/);
  assert.match(sql, /leads_by_status/);
  assert.match(sql, /trial_accounts_by_state/);
  assert.match(sql, /'contract_required'/);
  assert.match(sql, /'identity_verified_contract_required'/);
});

test("catalog and v4 projection remain server-only", () => {
  assert.match(sql, /revoke all on integration\.product_snapshot_contracts from public, anon, authenticated/i);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from service_role/i);
  assert.match(sql, /'autopilots\.data-plane-registry\.v4'/);
  assert.match(sql, /revoke all on function public\.autopilots_data_plane_registry\(uuid, uuid\) from public, anon, authenticated/i);
});
