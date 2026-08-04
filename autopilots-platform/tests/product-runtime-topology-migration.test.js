import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL(
  "../supabase/migrations/20260804163000_product_runtime_topology.sql",
  import.meta.url,
), "utf8");

test("runtime topology represents all product backends without credentials or activation", () => {
  assert.match(sql, /create table integration\.product_runtime_identities/iu);
  assert.match(sql, /'render', 'managed_service', 'sqlite'/u);
  assert.match(sql, /'supabase', 'supabase_project', 'postgresql'/u);
  assert.match(sql, /check \(credential_material_stored = false\)/u);
  assert.match(sql, /check \(data_connection_enabled = false\)/u);
  assert.match(sql, /check \(provider_authorization_enabled = false\)/u);
  assert.match(sql, /check \(external_writes_enabled = false\)/u);
  assert.doesNotMatch(sql, /endpoint_url|service_role_key|access_token|credential_value/iu);
});

test("AutoReviews runtime is separate from its excluded Supabase backup", () => {
  assert.match(sql, /20000000-0000-4000-8000-000000000002'[\s\S]*null, 'render'/u);
  assert.doesNotMatch(sql, /zivpzcpxtqqtsrasppez/u);
});

test("runtime topology is organization scoped and server only", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/iu);
  assert.match(sql, /m\.brand_id is null/iu);
  assert.match(sql, /revoke all on integration\.product_runtime_identities from public, anon, authenticated/iu);
  assert.match(sql, /revoke all on function public\.autopilots_product_runtime_topology\(uuid, uuid\)[\s\S]*from public, anon, authenticated/iu);
  assert.match(sql, /grant execute on function public\.autopilots_product_runtime_topology\(uuid, uuid\)[\s\S]*to service_role/iu);
});
