import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804113000_session_scope_and_activity.sql", import.meta.url), "utf8");

test("durable session restore selects one deterministic organization", () => {
  assert.match(sql, /primary_membership[\s\S]*order by case m\.role[\s\S]*m\.created_at, m\.legal_entity_id[\s\S]*limit 1/);
  assert.match(sql, /join primary_membership pm on pm\.legal_entity_id = b\.legal_entity_id/);
  assert.match(sql, /m\.legal_entity_id = pm\.legal_entity_id/);
  assert.doesNotMatch(sql, /join active_memberships m/);
});

test("session activity touch is throttled and only follows valid resolution", () => {
  assert.match(sql, /if v_result is not null then[\s\S]*update iam\.app_sessions/);
  assert.match(sql, /where id = v_session_id[\s\S]*last_seen_at < now\(\) - interval '5 minutes'/);
  assert.doesNotMatch(sql, /insert into audit\.events/);
});

test("corrected resolver remains server-only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_resolve_app_session\(text\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.autopilots_resolve_app_session\(text\) to service_role/);
});
