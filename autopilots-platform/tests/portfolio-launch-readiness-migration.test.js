import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804060000_portfolio_launch_readiness.sql", import.meta.url), "utf8");

test("portfolio v2 summarizes launch readiness only inside membership scope", () => {
  assert.match(sql, /m\.profile_id = p_profile_id[\s\S]*m\.legal_entity_id = b\.legal_entity_id[\s\S]*m\.brand_id is null or m\.brand_id = b\.id/i);
  assert.match(sql, /'contract', 'autopilots\.portfolio\.v2'/i);
  assert.match(sql, /'launchReadiness', jsonb_build_object/i);
  assert.match(sql, /'onboarding', jsonb_build_object/i);
});

test("launch summary is derived from governed steps and connector requests", () => {
  assert.match(sql, /integration\.onboarding_steps/i);
  assert.match(sql, /integration\.connector_requests/i);
  assert.match(sql, /'completedSteps', br\.completed_steps/i);
  assert.match(sql, /'attentionSteps', br\.attention_steps/i);
  assert.match(sql, /'approvalRequired', rc\.approval_required/i);
  assert.match(sql, /'nextAction'/i);
});

test("portfolio readiness cannot claim provider activation or external writes", () => {
  assert.match(sql, /'providerAuthorizationEnabled', false/i);
  assert.match(sql, /'externalWritesEnabled', false/i);
  assert.match(sql, /'externalWrites', false/i);
  assert.doesNotMatch(sql, /insert into|update integration|delete from/i);
});

test("portfolio v2 remains service-role only", () => {
  assert.match(sql, /revoke all on function public\.autopilots_portfolio_snapshot\(uuid, uuid\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_portfolio_snapshot\(uuid, uuid\) to service_role/i);
});
