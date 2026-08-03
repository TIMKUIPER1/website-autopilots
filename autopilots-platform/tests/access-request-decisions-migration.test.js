import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = await readFile(new URL("../supabase/migrations/20260803235900_access_request_decisions.sql", import.meta.url), "utf8");

test("access decisions require scoped managers and current pending context", () => {
  assert.match(sql, /m\.brand_id is null[\s\S]*m\.role in \('owner', 'admin'\)/i);
  assert.match(sql, /request_status <> 'approval_required'/i);
  assert.match(sql, /stale access request context[\s\S]*P0001/i);
  assert.match(sql, /v_approval\.context_version <> p_context_version/i);
});

test("approval decisions remain internal and emit complete R2 evidence", () => {
  assert.match(sql, /'iam\.access\.decide', 'R2'/i);
  assert.match(sql, /insert into ledger\.usage_entries/i);
  assert.match(sql, /insert into audit\.events/i);
  assert.match(sql, /'membershipApplied', false/i);
  assert.match(sql, /'providerInviteSent', false/i);
  assert.match(sql, /'externalWrites', false/i);
  assert.doesNotMatch(sql, /insert into iam\.memberships/i);
  assert.doesNotMatch(sql, /auth\.users/i);
});

test("decision idempotency replays identical evidence and rejects divergence", () => {
  assert.match(sql, /command_type = 'iam\.access\.decide'/i);
  assert.match(sql, /v_decision_command\.result \|\| jsonb_build_object\('replayed', true\)/i);
  assert.match(sql, /idempotency key reused with different access decision[\s\S]*23505/i);
});

test("decision RPC remains service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_decide_access_request[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_decide_access_request[\s\S]*to service_role/i);
});
