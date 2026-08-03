import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const inventory = JSON.parse(await readFile(new URL("../config/gift-public-surface.json", import.meta.url), "utf8"));
const sql = await readFile(new URL("../supabase/migrations/20260804043000_protect_gift_graphql_surface.sql", import.meta.url), "utf8");
const verifier = await readFile(new URL("../scripts/verify-live-gift-surface.js", import.meta.url), "utf8");

test("Gift GraphQL migration revokes every and only inventoried table", () => {
  const expected = inventory.tables.map((table) => table.name).sort();
  const revoked = [...sql.matchAll(/revoke all privileges on table public\.([a-z_]+) from public, anon, authenticated/g)]
    .map((match) => match[1]).sort();
  assert.equal(inventory.contract, "autopilots.gift-public-surface.v1");
  assert.deepEqual(revoked, expected);
});

test("Gift migration preserves RLS, policies, service role, schema and records", () => {
  assert.doesNotMatch(sql, /service_role/i);
  assert.doesNotMatch(sql, /\b(?:alter table|create policy|drop policy|drop|delete|truncate|insert|update)\b/i);
  assert.match(sql, /^begin;/);
  assert.match(sql, /commit;\s*$/);
});

test("Gift live verifier is read-only, project-pinned and secret-safe", () => {
  assert.match(verifier, /const projectRef = "wurycoodzcybaxcgqxps"/);
  assert.match(verifier, /method: "HEAD"/);
  assert.doesNotMatch(verifier, /method: "(?:POST|PUT|PATCH|DELETE)"/);
  assert.doesNotMatch(verifier, /console\.(?:log|error)\([^\n]*(?:serviceRoleKey|anonKey|keys)/);
});
