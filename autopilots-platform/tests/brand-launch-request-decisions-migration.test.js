import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804070000_brand_launch_request_decisions.sql", import.meta.url), "utf8");

test("brand launch decisions lock organization manager request and current context", () => {
  assert.match(sql, /m\.role in \('owner', 'admin'\)/i);
  assert.match(sql, /r\.id = p_request_id and r\.legal_entity_id = p_legal_entity_id for update/i);
  assert.match(sql, /v_request\.context_version <> p_context_version/i);
  assert.match(sql, /v_approval\.context_version <> p_context_version/i);
});

test("brand launch approval remains a no-effect internal decision", () => {
  for (const field of ["brandCreated", "sandboxEnvironmentCreated", "onboardingRunCreated", "providerAuthorizationStarted", "credentialsStored", "externalWrites"]) {
    assert.match(sql, new RegExp(`'${field}', false`, "i"));
  }
  assert.doesNotMatch(sql, /insert into core\.brands|insert into core\.environments|insert into integration\.onboarding_runs/i);
});

test("brand launch decision creates idempotent R2 audit and zero-cost evidence", () => {
  assert.match(sql, /'core\.brand-launch\.decide', 'R2'/i);
  assert.match(sql, /idempotency key reused with different brand launch decision/i);
  assert.match(sql, /total_cost_minor[\s\S]*0, 'EUR'/i);
  assert.match(sql, /'brand_launch_request'[\s\S]*'R2', p_decision/i);
});

test("brand launch decision remains service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_decide_brand_launch_request\(uuid, uuid, uuid, text, bigint, text\)[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_decide_brand_launch_request\(uuid, uuid, uuid, text, bigint, text\)[\s\S]*to service_role/i);
});
