import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803235800_access_roster_legal_name_fix.sql", import.meta.url), "utf8");

test("roster trading name uses legal-entity metadata with a legal-name fallback", () => {
  assert.match(sql, /coalesce\(v_organization\.metadata->>'tradingName', v_organization\.legal_name\)/i);
  assert.doesNotMatch(sql, /v_organization\.trading_name/i);
});

test("corrected roster remains service-role only and organization scoped", () => {
  assert.match(sql, /m\.legal_entity_id = p_legal_entity_id/i);
  assert.match(sql, /revoke all on function public\.autopilots_access_roster[\s\S]*from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_access_roster\(uuid, uuid\) to service_role/i);
});
