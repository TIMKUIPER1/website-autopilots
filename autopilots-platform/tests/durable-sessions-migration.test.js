import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = fs.readFileSync(path.join(root, "supabase/migrations/20260803193000_durable_app_sessions.sql"), "utf8");

test("durable sessions store only a one-way token hash and enforce RLS", () => {
  assert.match(sql, /token_hash text not null unique check \(token_hash ~ '\^\[0-9a-f\]\{64\}\$'\)/i);
  assert.doesNotMatch(sql, /\b(access_token|refresh_token|raw_token|session_token)\b/i);
  assert.match(sql, /alter table iam\.app_sessions enable row level security/i);
  assert.match(sql, /revoke all on table iam\.app_sessions from public, anon, authenticated/i);
});

test("session creation is MFA-gated and resolution rechecks live membership", () => {
  assert.match(sql, /not p\.mfa_required or p_assurance_level = 'aal2'/i);
  assert.match(sql, /s\.revoked_at is null/i);
  assert.match(sql, /s\.expires_at > now\(\)/i);
  assert.match(sql, /m\.status = 'active'/i);
  assert.match(sql, /m\.brand_id is null or m\.brand_id = b\.id/i);
});

test("create and revoke append audit evidence and RPCs are service-role only", () => {
  assert.match(sql, /auth\.session\.created/i);
  assert.match(sql, /auth\.session\.revoked/i);
  assert.match(sql, /grant execute on function public\.autopilots_create_app_session[\s\S]*to service_role/i);
  assert.match(sql, /revoke all on function public\.autopilots_resolve_app_session[\s\S]*from public, anon, authenticated/i);
});
