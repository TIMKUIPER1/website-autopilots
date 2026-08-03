import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260804130000_product_data_plane_registry.sql", import.meta.url), "utf8");

test("data-plane registry separates one control plane from optional product planes", () => {
  assert.match(sql, /create table integration\.product_data_planes/i);
  assert.match(sql, /purpose in \('control_plane', 'product_data'\)/i);
  assert.match(sql, /purpose = 'control_plane' and brand_id is null/i);
  assert.match(sql, /purpose = 'product_data' and brand_id is not null/i);
  assert.match(sql, /product_data_planes_scope_uidx/i);
});

test("only the proven Autopilots project is registered", () => {
  assert.match(sql, /'wurycoodzcybaxcgqxps'/);
  assert.match(sql, /'current_runtime_project_ref'/);
  assert.doesNotMatch(sql, /insert into integration\.product_data_planes[\s\S]*Autoplanner/i);
  assert.match(sql, /'status', 'not_registered'/i);
});

test("registry stores no credential material and cannot authorize or write providers", () => {
  assert.match(sql, /credential_material_stored = false/i);
  assert.match(sql, /provider_authorization_enabled = false/i);
  assert.match(sql, /provider_writes_enabled = false/i);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from service_role/i);
  assert.match(sql, /'crossProjectCredentialSharingEnabled', false/i);
  assert.match(sql, /'credentialMaterialExposed', false/i);
  assert.match(sql, /'genericRegistrationActionEnabled', false/i);
});

test("registry is organization scoped and browser denied", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /m\.brand_id is null/i);
  assert.match(sql, /m\.role in \('owner', 'admin', 'operator', 'auditor'\)/i);
  assert.match(sql, /revoke all on function public\.autopilots_data_plane_registry\(uuid, uuid\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_data_plane_registry\(uuid, uuid\) to service_role/i);
});
