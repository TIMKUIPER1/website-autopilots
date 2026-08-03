import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804053000_connector_request_decisions.sql", import.meta.url), "utf8");

test("connector decisions lock organization manager, request and current context", () => {
  assert.match(sql, /m\.brand_id is null[\s\S]*m\.role in \('owner', 'admin'\)/i);
  assert.match(sql, /where r\.id = p_request_id and r\.brand_id = v_brand\.id for update/i);
  assert.match(sql, /v_request\.context_version <> p_context_version/i);
  assert.match(sql, /v_approval\.context_version <> p_context_version/i);
});

test("connector approval is a decision only and cannot activate a provider", () => {
  for (const field of [
    "providerAuthorizationStarted", "providerAccountConnected", "discoveryStarted",
    "credentialsStored", "externalWrites"
  ]) assert.match(sql, new RegExp(`'${field}', false`, "i"));
  assert.doesNotMatch(sql, /oauth_callback|access_token|refresh_token|secret_value/i);
  assert.match(sql, /provider authorization, account connection, discovery, credentials and external writes remain unapplied/i);
});

test("connector decision creates idempotent risk-matched audit and zero-cost evidence", () => {
  assert.match(sql, /command_type = 'integration\.connector\.decide'[\s\S]*idempotency_key = p_idempotency_key/i);
  assert.match(sql, /v_request\.risk_class[\s\S]*'integration\.connector\.decide'/i);
  assert.match(sql, /total_cost_minor[\s\S]*0, 'EUR'/i);
  assert.match(sql, /'integration\.connector\.decide'[\s\S]*v_request\.risk_class, p_decision/i);
});

test("connector decision remains service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_decide_connector_request\(uuid, text, uuid, text, bigint, text\)[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_decide_connector_request\(uuid, text, uuid, text, bigint, text\)[\s\S]*to service_role/i);
});
