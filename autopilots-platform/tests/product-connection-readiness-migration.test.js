import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL(
  "../supabase/migrations/20260804150000_product_connection_readiness.sql",
  import.meta.url
), "utf8");

test("durable readiness contains all twelve expiring gates", () => {
  assert.match(sql, /create table integration\.product_connection_gate_policies/i);
  for (const key of [
    "project_identity", "owned_https_endpoint", "vault_secret_reference", "contract_probe",
    "privacy_probe", "freshness_probe", "reconciliation", "revocation_test",
    "rate_limit_test", "failure_mode_test", "independent_review", "current_human_approval"
  ]) assert.match(sql, new RegExp(`'${key}'`));
  assert.match(sql, /maximum_age_seconds between 900 and 2592000/i);
  assert.match(sql, /requires_current_context/i);
});

test("evidence is scoped, hashed, bounded and immutable to the runtime role", () => {
  assert.match(sql, /create table integration\.product_connection_gate_evidence/i);
  assert.match(sql, /evidence_sha256.*\^\[0-9a-f\]\{64\}\$/i);
  assert.match(sql, /foreign key \(snapshot_contract_id, brand_id, legal_entity_id\)/i);
  assert.match(sql, /expires_at > observed_at/i);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger[\s\S]*product_connection_gate_evidence[\s\S]*from service_role/i);
});

test("readiness is organization scoped and current approval remains blocked", () => {
  assert.match(sql, /p\.id = p_profile_id[\s\S]*m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /m\.brand_id is null[\s\S]*m\.role in \('owner', 'admin', 'operator', 'auditor'\)/i);
  assert.match(sql, /when p\.gate_key = 'current_human_approval' then 'blocked'/i);
  assert.match(sql, /'readyForActivation', false/i);
  assert.match(sql, /'dataConnectionEnabled', false/i);
  assert.match(sql, /'providerAuthorizationEnabled', false/i);
  assert.match(sql, /'externalWritesEnabled', false/i);
});

test("readiness projection is server-only and has no mutation path", () => {
  assert.match(sql, /revoke all on function public\.autopilots_product_connection_readiness\(uuid, uuid\)[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_product_connection_readiness\(uuid, uuid\)[\s\S]*to service_role/i);
  const functionBody = sql.slice(sql.indexOf("create or replace function public.autopilots_product_connection_readiness"));
  assert.doesNotMatch(functionBody, /insert into|update integration|delete from/i);
});
