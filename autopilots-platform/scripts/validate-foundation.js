import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FOUNDATION_MIGRATION, REQUIRED_SCHEMAS, REQUIRED_TABLES, REQUIRED_BRANDS } from "./foundation-manifest.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationPath = path.join(root, "supabase", "migrations", FOUNDATION_MIGRATION);
const sql = await fs.readFile(migrationPath, "utf8");
const failures = [];

for (const schema of REQUIRED_SCHEMAS) expect(`create schema if not exists ${schema}`, `schema ${schema}`);
for (const table of REQUIRED_TABLES) {
  expect(`create table ${table}`, `table ${table}`);
  expect(`alter table ${table} enable row level security`, `RLS ${table}`);
}
for (const brand of REQUIRED_BRANDS) expect(`'${brand}'`, `bootstrap brand ${brand}`);

expect("credential_reference text check", "vault-only credential reference");
expect("create trigger audit_events_append_only", "append-only audit trigger");
expect("create trigger usage_entries_append_only", "append-only usage trigger");
expect("unique (brand_id, environment_id, idempotency_key)", "tenant-scoped idempotency");
expect("check (kind = 'production' or external_writes_enabled = false)", "non-production write boundary");
expect("create policy connections_read", "connection brand policy");
expect("create policy commands_read", "command brand policy");

if (/\b(password|access_token|refresh_token|service_role_key)\s+text\b/i.test(sql)) {
  failures.push("Migration bevat een verboden plaintext secretkolom.");
}
if (!/^begin;[\s\S]*commit;\s*$/i.test(sql.trim())) failures.push("Migration is niet volledig transactioneel omsloten.");

if (failures.length) {
  console.error(JSON.stringify({ ok: false, migration: FOUNDATION_MIGRATION, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  migration: FOUNDATION_MIGRATION,
  schemas: REQUIRED_SCHEMAS.length,
  tables: REQUIRED_TABLES.length,
  brands: REQUIRED_BRANDS.length
}, null, 2));

function expect(fragment, label) {
  if (!sql.includes(fragment)) failures.push(`Ontbreekt: ${label}`);
}
