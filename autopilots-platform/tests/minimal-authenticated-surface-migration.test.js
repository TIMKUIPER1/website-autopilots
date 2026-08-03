import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const sql = await fs.readFile(new URL("../supabase/migrations/20260804023000_minimal_authenticated_surface.sql", import.meta.url), "utf8");

test("session v2 deterministically scopes brands to one primary legal entity", () => {
  assert.match(sql, /security definer/i);
  assert.match(sql, /set search_path = pg_catalog, auth, iam, core/i);
  assert.match(sql, /where p\.auth_user_id = auth\.uid\(\)[\s\S]*p\.status = 'active'/i);
  assert.match(sql, /join primary_membership pm on pm\.legal_entity_id = b\.legal_entity_id/i);
  assert.match(sql, /m\.profile_id = pm\.profile_id[\s\S]*m\.legal_entity_id = pm\.legal_entity_id[\s\S]*m\.status = 'active'/i);
  assert.match(sql, /'contract', 'autopilots\.session-context\.v2'/i);
});

test("authenticated keeps one RPC and loses every direct governed table read", () => {
  assert.match(sql, /revoke select on all tables in schema core, iam, integration, workflow, ledger, audit from authenticated/i);
  assert.match(sql, /revoke all on function public\.autopilots_session_context_v2\(\) from public, anon, service_role/i);
  assert.match(sql, /grant execute on function public\.autopilots_session_context_v2\(\) to authenticated/i);
  assert.match(sql, /revoke execute on function public\.autopilots_session_context\(\) from authenticated/i);
  assert.match(sql, /alter function audit\.reject_mutation\(\) set search_path = pg_catalog/i);
});
