import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = fs.readFileSync(
  path.join(root, "supabase", "migrations", "20260803162000_owner_bootstrap.sql"),
  "utf8"
);

test("owner bootstrap is transactioneel, idempotent en MFA-verplicht", () => {
  assert.match(migration, /^begin;/i);
  assert.match(migration, /commit;\s*$/i);
  assert.match(migration, /on conflict \(auth_user_id\) do update/i);
  assert.match(migration, /on conflict \(brand_id, environment_id, idempotency_key\) do nothing/i);
  assert.match(migration, /'admin@auto-pilots\.io'/i);
  assert.match(migration, /mfa_required[\s\S]*true/i);
});

test("owner bootstrap heeft R3 approval en audit evidence", () => {
  assert.match(migration, /'iam\.owner\.bootstrap'/i);
  assert.match(migration, /'R3'/);
  assert.match(migration, /insert into workflow\.approvals/i);
  assert.match(migration, /werktoestemming_a/i);
  assert.match(migration, /insert into audit\.events/i);
  assert.match(migration, /bootstrap_exception:initial_owner/i);
});
