import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const sql = await readFile(new URL("../supabase/migrations/20260804084000_agent_registry_service_read.sql", import.meta.url), "utf8");

test("agent registry correction grants only the read privilege required by its invoker RPC", () => {
  assert.match(sql, /grant select on workflow\.agent_registry to service_role/);
  assert.match(sql, /revoke insert, update, delete, truncate, references, trigger[\s\S]*from service_role/);
  assert.doesNotMatch(sql, /grant (?:all|insert|update|delete)/i);
});
