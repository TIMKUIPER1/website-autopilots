import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804063000_brand_launch_request_staging.sql", import.meta.url), "utf8");

test("brand launch requests are durable organization-scoped intent", () => {
  assert.match(sql, /create table core\.brand_launch_requests/i);
  assert.match(sql, /legal_entity_id uuid not null references core\.legal_entities/i);
  assert.match(sql, /authority_brand_id/i);
  assert.match(sql, /where b\.legal_entity_id = p_legal_entity_id and b\.slug = 'autopilots'/i);
});

test("brand launch staging can create no brand, environment, onboarding or provider effect", () => {
  for (const field of ["brand_created", "sandbox_environment_created", "onboarding_run_created", "provider_authorization_started", "credentials_stored", "external_writes"]) {
    assert.match(sql, new RegExp(`${field} boolean not null default false check \\(${field} = false\\)`, "i"));
  }
  assert.doesNotMatch(sql, /insert into core\.brands|insert into core\.environments|insert into integration\.onboarding_runs/i);
});

test("brand launch staging emits R2 command approval usage and audit evidence", () => {
  assert.match(sql, /'core\.brand-launch\.stage', 'R2'/i);
  assert.match(sql, /insert into workflow\.approvals/i);
  assert.match(sql, /total_cost_minor[\s\S]*0, 'EUR'/i);
  assert.match(sql, /'core\.brand-launch\.stage'[\s\S]*'brand_launch_request'/i);
});

test("brand launch contracts are service-role only", () => {
  assert.match(sql, /revoke all on core\.brand_launch_requests from public, anon, authenticated/i);
  assert.match(sql, /grant select, insert, update on core\.brand_launch_requests to service_role/i);
  assert.match(sql, /revoke all on function public\.autopilots_brand_launch_requests\(uuid, uuid\) from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.autopilots_stage_brand_launch_request\(uuid, uuid, text, text, text, text, text\)[\s\S]*to service_role/i);
});
