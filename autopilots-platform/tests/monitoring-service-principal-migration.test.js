import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803234500_monitoring_service_principal.sql", import.meta.url), "utf8");

test("monitoring principal cannot log in or perform external writes", () => {
  assert.match(sql, /login_allowed boolean not null default false check \(login_allowed = false\)/i);
  assert.match(sql, /external_writes_allowed boolean not null default false check \(external_writes_allowed = false\)/i);
  assert.match(sql, /'autopilots:health-monitor'/i);
  assert.match(sql, /'monitoring\.health\.write'[\s\S]*'monitoring\.lease\.manage'[\s\S]*'monitoring\.freshness\.read'/i);
});

test("service scopes are legal-entity and optionally brand bounded", () => {
  assert.match(sql, /foreign key \(principal_id, legal_entity_id\)[\s\S]*service_principals\(id, legal_entity_id\)/i);
  assert.match(sql, /foreign key \(brand_id, legal_entity_id\)[\s\S]*core\.brands\(id, legal_entity_id\)/i);
  assert.match(sql, /service_principal_has_scope/i);
  assert.match(sql, /p\.status = 'active'/i);
});

test("monitoring v2 requires a service principal and disables human lease RPCs", () => {
  assert.match(sql, /authority_principal_id uuid references iam\.service_principals/i);
  assert.match(sql, /num_nonnulls\(authority_profile_id, authority_principal_id\) = 1/i);
  assert.match(sql, /unique \(legal_entity_id, lease_key, bucket\)/i);
  assert.match(sql, /revoke execute on function public\.autopilots_claim_monitoring_run[\s\S]*from service_role/i);
  assert.match(sql, /grant execute on function public\.autopilots_claim_monitoring_run_v2[\s\S]*to service_role/i);
});

test("scheduled observations and completion audit the machine identity", () => {
  assert.match(sql, /'authorityType', v_authority_type/i);
  assert.match(sql, /'service_principal'/i);
  assert.match(sql, /'monitoring\.run_completed'/i);
  assert.match(sql, /v_principal\.key/i);
  assert.match(sql, /'externalWrites', false/i);
});

test("service-principal tables and RPCs deny browser roles", () => {
  assert.match(sql, /revoke all on iam\.service_principals, iam\.service_principal_scopes from public, anon, authenticated/i);
  assert.match(sql, /revoke all on function public\.autopilots_monitoring_freshness_v2[\s\S]*from public, anon, authenticated/i);
});
