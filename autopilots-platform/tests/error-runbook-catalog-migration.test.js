import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804093000_error_runbook_catalog.sql", import.meta.url), "utf8");

test("error runbooks are exact brand-scoped versioned guidance", () => {
  assert.match(sql, /create table workflow\.error_runbooks/);
  assert.match(sql, /unique \(brand_id, error_code\)/);
  assert.match(sql, /jsonb_array_length\(first_response\) between 1 and 6/);
  assert.match(sql, /'contract', 'autopilots\.error-runbooks\.v1'/);
  assert.match(sql, /where b\.legal_entity_id = p_legal_entity_id/);
});

test("runbook catalog cannot remediate notify or write to providers", () => {
  assert.match(sql, /check \(automatic_remediation_enabled = false\)/);
  assert.match(sql, /check \(notification_delivery_enabled = false\)/);
  assert.match(sql, /check \(provider_writes_enabled = false\)/);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger on workflow\.error_runbooks from service_role/);
});

test("runbook read is legal-entity role scoped and browser denied", () => {
  assert.match(sql, /m\.brand_id is null and m\.status = 'active'/);
  assert.match(sql, /m\.role in \('owner', 'admin', 'operator', 'auditor'\)/);
  assert.match(sql, /revoke all on function public\.autopilots_error_runbooks\(uuid, uuid\) from public, anon, authenticated/);
});
