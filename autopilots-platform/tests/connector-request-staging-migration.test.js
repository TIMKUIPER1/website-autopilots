import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804050000_connector_request_staging.sql", import.meta.url), "utf8");

test("connector intent is durable, scoped and permanently no-effect", () => {
  assert.match(sql, /create table integration\.connector_requests/i);
  assert.match(sql, /foreign key \(brand_id, legal_entity_id\)/i);
  assert.match(sql, /foreign key \(environment_id, brand_id\)/i);
  for (const flag of ["provider_authorization_started", "provider_account_connected", "discovery_started", "credentials_stored", "external_writes"]) {
    assert.match(sql, new RegExp(`${flag} boolean not null default false check \\(${flag} = false\\)`, "i"));
  }
  assert.match(sql, /unique \(brand_id, environment_id, idempotency_key\)/i);
});

test("connector staging requires an organization manager and current authorization step", () => {
  assert.match(sql, /m\.brand_id is null[\s\S]*m\.role in \('owner', 'admin'\)/i);
  assert.match(sql, /configuration ->> 'authorization_required'/i);
  assert.match(sql, /v_step\.status in \('completed', 'skipped'\)/i);
  assert.match(sql, /case when v_step\.risk_class = 'R3' then 'R3' else 'R2' end/i);
});

test("connector staging emits command, approval, usage and audit evidence", () => {
  assert.match(sql, /insert into workflow\.commands/i);
  assert.match(sql, /insert into workflow\.approvals/i);
  assert.match(sql, /insert into ledger\.usage_entries/i);
  assert.match(sql, /insert into audit\.events/i);
  assert.match(sql, /'integration\.connector\.stage'/i);
  assert.match(sql, /on conflict \(brand_id, environment_id, idempotency_key\) do nothing/i);
});

test("onboarding v2 exposes requests but keeps activation disabled", () => {
  assert.match(sql, /'contract', 'autopilots\.onboarding\.v2'/i);
  assert.match(sql, /'connectorRequests'/i);
  assert.match(sql, /'canManageConnectors'/i);
  assert.match(sql, /'providerAuthorizationEnabled', false/i);
  assert.match(sql, /'externalWritesEnabled', false/i);
});

test("connector request tables and RPCs are service-role only", () => {
  assert.match(sql, /alter table integration\.connector_requests enable row level security/i);
  assert.match(sql, /revoke all on integration\.connector_requests from public, anon, authenticated/i);
  assert.match(sql, /revoke all on function public\.autopilots_stage_connector_request\(uuid, text, text, text, text\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_stage_connector_request\(uuid, text, text, text, text\) to service_role/i);
});
