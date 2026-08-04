import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APPLIED_MIGRATIONS, liveMigrationInventory } from "./migration-manifest.js";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const MIGRATION = "20260804163000_product_runtime_topology.sql";
const CHANGE_ID = "AP-INT-20260803-013";
const APPLY_CONFIRMATION = `${PROJECT_REF}:48:49`;
const apply = process.argv.includes("--apply");
const token = String(process.env.SUPABASE_ACCESS_TOKEN || "").trim();
const requestedRef = String(process.env.SUPABASE_PROJECT_REF || PROJECT_REF).trim();

if (requestedRef !== PROJECT_REF) fail("Targetproject komt niet overeen met het vastgelegde Autopilots-project.");
if (!token || token.length < 20) fail("Een tijdelijk SUPABASE_ACCESS_TOKEN is vereist.");
if (apply && (process.env.ALLOW_DATABASE_MIGRATIONS !== "true"
  || process.env.RUNTIME_TOPOLOGY_CONFIRM !== APPLY_CONFIRMATION)) {
  fail(`Apply blijft geblokkeerd zonder de exacte runtimebevestiging ${APPLY_CONFIRMATION}.`);
}

const entries = Object.entries(APPLIED_MIGRATIONS);
if (entries.at(-1)?.[0] !== MIGRATION) fail("De runtime-topologiemigratie is niet de exacte volgende migratie.");
const expectedBefore = liveMigrationInventory(entries.slice(0, -1));
const expectedAfter = liveMigrationInventory(entries);
const before = await migrationInventory();
assertInventory(before, [expectedBefore, expectedAfter]);

if (!apply) {
  const state = before.length === expectedAfter.length ? "already_applied" : "ready_to_apply";
  console.log(JSON.stringify({
    ok: true, mode: "preflight", projectRef: PROJECT_REF, state,
    appliedMigrations: before.length, pendingMigrations: state === "already_applied" ? 0 : 1,
    dataConnectionsEnabled: false, providerAuthorizationEnabled: false,
    externalWritesEnabled: false
  }, null, 2));
  process.exit(0);
}

if (before.length === expectedAfter.length) {
  console.log(JSON.stringify({
    ok: true, mode: "already_applied", projectRef: PROJECT_REF,
    appliedMigrations: before.length, pendingMigrations: 0,
    dataConnectionsEnabled: false, providerAuthorizationEnabled: false,
    externalWritesEnabled: false
  }, null, 2));
  process.exit(0);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const body = await fs.readFile(path.join(root, "supabase", "migrations", MIGRATION), "utf8");
const checksum = crypto.createHash("sha256").update(body).digest("hex");
if (APPLIED_MIGRATIONS[MIGRATION] !== checksum) fail("De runtime-topologiechecksum wijkt af.");
const statements = body.trim().replace(/^begin;\s*/i, "").replace(/\s*commit;$/i, "");
const expectedValues = expectedBefore.map(([version, expectedChecksum]) =>
  `(${literal(version)}, ${literal(expectedChecksum)})`
).join(",\n      ");
await databaseQuery(`begin;
do $guard$
begin
  if (select count(*) from public.autopilots_schema_migrations) <> ${expectedBefore.length} then
    raise exception 'MIGRATION_INVENTORY_COUNT_MISMATCH';
  end if;
  if exists (
    with expected(version, checksum) as (values ${expectedValues})
    select 1 from expected e
    full join public.autopilots_schema_migrations m on m.version = e.version
    where e.version is null or m.version is null or e.checksum <> m.checksum
  ) then
    raise exception 'MIGRATION_INVENTORY_CHECKSUM_MISMATCH';
  end if;
end
$guard$;
${statements}
insert into public.autopilots_schema_migrations (version, checksum, change_id)
values (${literal(MIGRATION)}, ${literal(checksum)}, ${literal(CHANGE_ID)});
commit;`);
const after = await migrationInventory();
assertInventory(after, expectedAfter);
console.log(JSON.stringify({
  ok: true, mode: "applied", projectRef: PROJECT_REF,
  appliedMigrations: after.length, appliedChangeId: CHANGE_ID,
  dataConnectionsEnabled: false, providerAuthorizationEnabled: false,
  externalWritesEnabled: false
}, null, 2));

async function migrationInventory() {
  const rows = await databaseQuery(
    "select version, checksum, change_id from public.autopilots_schema_migrations order by version"
  );
  if (!Array.isArray(rows) || rows.some((row) => typeof row?.version !== "string"
    || !/^[0-9a-f]{64}$/.test(String(row?.checksum || "")))) {
    fail("De live migratie-inventaris heeft een ongeldig antwoordcontract.");
  }
  return rows.map((row) => [row.version, row.checksum]);
}

function assertInventory(actual, expected) {
  const candidates = Array.isArray(expected[0]?.[0]) ? expected : [expected];
  if (!candidates.some((candidate) => JSON.stringify(actual) === JSON.stringify(candidate))) {
    fail("De live migratie-inventaris wijkt af; er is niets toegepast.");
  }
}

async function databaseQuery(query) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
    });
  } catch {
    fail("De Supabase Management API was niet bereikbaar.");
  }
  if (!response.ok) fail(`De Supabase Management API weigerde de query (${response.status}).`);
  try {
    const payload = await response.json();
    if (!Array.isArray(payload)) fail("De Supabase Management API gaf een onverwacht antwoordcontract.");
    return payload;
  } catch {
    fail("De Supabase Management API gaf geen geldig JSON-antwoord.");
  }
}

function literal(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
