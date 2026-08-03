import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const sql = fs.readFileSync(new URL("../supabase/migrations/20260803231500_incident_stale_context_error.sql", import.meta.url), "utf8");

test("stale incident context uses a non-retryable application error", () => {
  assert.match(sql, /stale incident context' using errcode = 'P0001'/i);
  assert.doesNotMatch(sql, /errcode = '40001'/i);
});

test("corrected acknowledgement keeps the complete governed command evidence", () => {
  assert.match(sql, /'incident\.acknowledge', 'R1'/i);
  assert.match(sql, /insert into ledger\.usage_entries/i);
  assert.match(sql, /insert into audit\.events/i);
  assert.match(sql, /to service_role/i);
});
