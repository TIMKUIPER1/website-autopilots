import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sql = await readFile(new URL("../supabase/migrations/20260804000500_audit_approved_result.sql", import.meta.url), "utf8");

test("approved becomes an explicit validated audit result without weakening append-only evidence", () => {
  assert.match(sql, /result in \('requested', 'succeeded', 'failed', 'rejected', 'blocked', 'approved'\)/i);
  assert.match(sql, /add constraint events_result_check[\s\S]*not valid/i);
  assert.match(sql, /validate constraint events_result_check/i);
  assert.doesNotMatch(sql, /disable trigger/i);
  assert.doesNotMatch(sql, /drop table/i);
});
