import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { FOUNDATION_MIGRATION, REQUIRED_TABLES } from "../scripts/foundation-manifest.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sql = fs.readFileSync(path.join(root, "supabase", "migrations", FOUNDATION_MIGRATION), "utf8");

test("iedere funderingstabel heeft RLS", () => {
  for (const table of REQUIRED_TABLES) {
    assert.match(sql, new RegExp(`alter table ${table.replace(".", "\\.")} enable row level security`, "i"), table);
  }
});

test("credentials zijn uitsluitend vaultreferenties", () => {
  assert.match(sql, /credential_reference text check \(credential_reference is null or credential_reference ~ '\^vault:\/\/'\)/);
  assert.doesNotMatch(sql, /\b(access_token|refresh_token|service_role_key|password)\s+text\b/i);
});

test("audit en usage zijn append-only", () => {
  assert.match(sql, /create trigger audit_events_append_only[\s\S]*before update or delete on audit\.events/i);
  assert.match(sql, /create trigger usage_entries_append_only[\s\S]*before update or delete on ledger\.usage_entries/i);
});

test("idempotency en niet-productie write boundaries zijn databaseconstraints", () => {
  assert.match(sql, /unique \(brand_id, environment_id, idempotency_key\)/i);
  assert.match(sql, /check \(kind = 'production' or external_writes_enabled = false\)/i);
});
