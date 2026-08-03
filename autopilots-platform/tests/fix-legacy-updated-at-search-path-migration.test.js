import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804040000_fix_legacy_updated_at_search_path.sql", import.meta.url), "utf8");

test("legacy updated-at trigger receives a fixed minimal search path", () => {
  assert.match(sql, /alter function public\.set_updated_at\(\)\s+set search_path = pg_catalog, public;/);
  assert.doesNotMatch(sql, /create or replace function/i);
});

test("search-path correction preserves function body, triggers and data", () => {
  assert.doesNotMatch(sql, /\b(?:drop|delete|truncate|insert|update|create trigger|drop trigger)\b/i);
  assert.match(sql, /^begin;/);
  assert.match(sql, /commit;\s*$/);
});
