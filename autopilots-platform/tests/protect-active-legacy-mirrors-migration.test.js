import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const inventory = JSON.parse(await readFile(new URL("../config/legacy-public-surface.json", import.meta.url), "utf8"));
const sql = await readFile(new URL("../supabase/migrations/20260804033000_protect_active_legacy_mirrors.sql", import.meta.url), "utf8");

test("second legacy RLS group contains every and only active service-role mirror", () => {
  const active = inventory.tables.filter((table) => table.runtimeAccess === "service_role_write_mirror").map((table) => table.name).sort();
  const altered = [...sql.matchAll(/alter table public\.([a-z_]+) enable row level security/g)].map((match) => match[1]).sort();
  const revoked = [...sql.matchAll(/revoke all privileges on table public\.([a-z_]+) from public, anon, authenticated/g)].map((match) => match[1]).sort();
  assert.deepEqual(active, ["audit_log", "integration_health", "invoices_sales", "raw_imports"]);
  assert.deepEqual(altered, active);
  assert.deepEqual(revoked, active);
});

test("active mirror migration preserves service-role authority, data and schema", () => {
  assert.doesNotMatch(sql, /service_role/i);
  assert.doesNotMatch(sql, /\b(?:drop|delete|truncate|insert|update)\b/i);
  assert.match(sql, /^begin;/);
  assert.match(sql, /commit;\s*$/);
});
