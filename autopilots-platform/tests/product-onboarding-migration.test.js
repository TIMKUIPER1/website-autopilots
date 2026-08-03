import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = fs.readFileSync(path.join(root, "supabase/migrations/20260803203000_product_onboarding_registry.sql"), "utf8");

test("onboarding is reusable, ordered and RLS-scoped", () => {
  assert.match(sql, /create table integration\.onboarding_runs/i);
  assert.match(sql, /create table integration\.onboarding_steps/i);
  assert.match(sql, /unique \(run_id, step_key\)/i);
  assert.match(sql, /alter table integration\.onboarding_runs enable row level security/i);
  assert.match(sql, /using \(iam\.has_brand_access\(brand_id\)\)/i);
  for (const step of ["foundation", "website", "supabase", "product_api", "stripe", "monitoring"]) {
    assert.match(sql, new RegExp(`'${step}'`));
  }
});

test("discovery is read-only and honest about current product health", () => {
  assert.match(sql, /'external_writes_enabled', false/i);
  assert.match(sql, /AUTOPLANNER_DEPENDENCIES_MISSING/i);
  assert.match(sql, /AUTOREVIEWS_LEGACY_SOURCE_UNREACHABLE/i);
  assert.match(sql, /ROOFPLANNER_API_UNREACHABLE/i);
  assert.match(sql, /autopilots\.product-snapshot\.v1/i);
});

test("server read RPC rechecks profile and brand membership", () => {
  assert.match(sql, /p\.id = p_profile_id and p\.status = 'active'/i);
  assert.match(sql, /m\.status = 'active'/i);
  assert.match(sql, /m\.brand_id is null or m\.brand_id = v_brand\.id/i);
  assert.match(sql, /revoke all on function public\.autopilots_brand_onboarding\(uuid, text\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_brand_onboarding\(uuid, text\) to service_role/i);
});
