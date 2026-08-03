import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const inventory = JSON.parse(await fs.readFile(new URL("../config/legacy-public-surface.json", import.meta.url), "utf8"));
const sql = await fs.readFile(new URL("../supabase/migrations/20260804030000_protect_unused_legacy_tables.sql", import.meta.url), "utf8");

test("first legacy RLS group contains every and only no-caller table", () => {
  const expected = inventory.tables.filter((table) => table.runtimeAccess === "none").map((table) => table.name).sort();
  const enabled = [...sql.matchAll(/alter table public\.([a-z_]+) enable row level security/gi)].map((match) => match[1]).sort();
  const revoked = [...sql.matchAll(/revoke all privileges on table public\.([a-z_]+) from public, anon, authenticated/gi)].map((match) => match[1]).sort();
  assert.equal(expected.length, 14);
  assert.deepEqual(enabled, expected);
  assert.deepEqual(revoked, expected);
});

test("active service-role mirrors are untouched by the first legacy RLS group", () => {
  const active = inventory.tables.filter((table) => table.runtimeAccess !== "none").map((table) => table.name);
  for (const table of active) assert.doesNotMatch(sql, new RegExp(`public\\.${table}\\b`, "i"));
  assert.match(sql, /^begin;/i);
  assert.match(sql, /commit;\s*$/i);
  assert.doesNotMatch(sql, /drop\s|delete\s|truncate\s|alter\s+column/i);
});
