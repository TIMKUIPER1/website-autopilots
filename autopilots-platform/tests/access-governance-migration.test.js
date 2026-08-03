import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803235500_access_governance.sql", import.meta.url), "utf8");

test("access requests cannot send provider invites or external writes", () => {
  assert.match(sql, /provider_invite_sent boolean not null default false check \(provider_invite_sent = false\)/i);
  assert.match(sql, /external_writes boolean not null default false check \(external_writes = false\)/i);
  assert.doesNotMatch(sql, /auth\.admin|invite_user|create_user|send_email/i);
});

test("access roster is organization scoped and limited to governance roles", () => {
  assert.match(sql, /autopilots_access_roster/i);
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /m\.brand_id is null[\s\S]*m\.role in \('owner', 'admin', 'auditor'\)/i);
  assert.match(sql, /'canManageAccess', v_can_manage/i);
  assert.match(sql, /'providerInvitesEnabled', false/i);
  assert.doesNotMatch(sql, /'authUserId'/i);
});

test("staging access is a complete governed R2 command", () => {
  assert.match(sql, /'iam\.access\.stage', 'R2'/i);
  assert.match(sql, /'approval_required'/i);
  assert.match(sql, /insert into workflow\.approvals/i);
  assert.match(sql, /'R2', 'pending'/i);
  assert.match(sql, /insert into ledger\.usage_entries/i);
  assert.match(sql, /insert into audit\.events/i);
  assert.match(sql, /'R2', 'requested'/i);
});

test("access staging is idempotent and rejects open duplicates", () => {
  assert.match(sql, /unique \(legal_entity_id, idempotency_key\)/i);
  assert.match(sql, /access_requests_open_scope_uidx/i);
  assert.match(sql, /on conflict \(brand_id, environment_id, idempotency_key\) do nothing/i);
  assert.match(sql, /idempotency key reused with different access request/i);
});

test("access tables and RPCs are service-role only", () => {
  assert.match(sql, /alter table iam\.access_requests enable row level security/i);
  assert.match(sql, /revoke all on iam\.access_requests from public, anon, authenticated/i);
  assert.match(sql, /revoke all on function public\.autopilots_access_roster[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_stage_access_request[\s\S]*to service_role/i);
});
