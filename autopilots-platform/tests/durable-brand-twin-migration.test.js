import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const sql = await fs.readFile(new URL("../supabase/migrations/20260804010000_durable_brand_twin.sql", import.meta.url), "utf8");

test("brand twin requires an active profile and exact membership scope", () => {
  assert.match(sql, /p_profile_id uuid[\s\S]*p_brand_slug text/i);
  assert.match(sql, /m\.profile_id = p_profile_id[\s\S]*m\.legal_entity_id = v_brand\.legal_entity_id[\s\S]*m\.brand_id is null or m\.brand_id = v_brand\.id/i);
  assert.match(sql, /security invoker/i);
  assert.match(sql, /revoke all on function public\.autopilots_brand_twin\(uuid, text\) from public, anon, authenticated/i);
});

test("brand twin derives operations from governed tables without invented business truth", () => {
  assert.match(sql, /integration\.connections/i);
  assert.match(sql, /integration\.health_events/i);
  assert.match(sql, /integration\.incidents/i);
  assert.match(sql, /ledger\.usage_entries/i);
  assert.match(sql, /'goals', '\[\]'::jsonb/i);
  assert.match(sql, /'customers', '\[\]'::jsonb/i);
  assert.match(sql, /'revenueCents', null/i);
  assert.match(sql, /when count\(\*\) = 0 then null/i);
  assert.match(sql, /'demoMode', false/i);
  assert.match(sql, /'externalWrites', false/i);
});
