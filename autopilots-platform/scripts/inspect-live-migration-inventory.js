import { spawnSync } from "node:child_process";
import { APPLIED_MIGRATIONS, liveMigrationInventory } from "./migration-manifest.js";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
if (process.platform !== "darwin") fail("MIGRATION_INVENTORY_KEYCHAIN_UNSUPPORTED");

let accessToken = readKeychainToken();
const rows = await databaseQuery(
  "select version, checksum, change_id from public.autopilots_schema_migrations order by version",
  accessToken
);
accessToken = "";

if (!Array.isArray(rows) || rows.some((row) => typeof row?.version !== "string"
  || !/^[0-9a-f]{64}$/.test(String(row?.checksum || "")))) {
  fail("MIGRATION_INVENTORY_INVALID_RESPONSE");
}

const expected = new Map(liveMigrationInventory());
const live = new Map(rows.map((row) => [row.version, row.checksum]));
const missing = [...expected.keys()].filter((version) => !live.has(version));
const unexpected = [...live.keys()].filter((version) => !expected.has(version));
const checksumMismatches = rows
  .filter((row) => expected.has(row.version) && expected.get(row.version) !== row.checksum)
  .map((row) => row.version);

console.log(JSON.stringify({
  ok: missing.length === 0 && unexpected.length === 0 && checksumMismatches.length === 0,
  contract: "autopilots.migration-inventory-inspection.v1",
  projectRef: PROJECT_REF,
  liveCount: rows.length,
  expectedCount: expected.size,
  liveVersions: rows.map((row) => ({ version: row.version, changeId: row.change_id || null })),
  missing,
  unexpected,
  checksumMismatches,
  databaseWrites: false,
  externalWrites: false
}, null, 2));

function readKeychainToken() {
  const result = spawnSync("security", ["find-generic-password", "-s", "Supabase CLI", "-w"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024
  });
  const value = result.status === 0 ? String(result.stdout || "").trim() : "";
  if (value.length < 20) fail("MIGRATION_INVENTORY_KEYCHAIN_ACCESS_REQUIRED");
  return value;
}

async function databaseQuery(query, token) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
    });
  } catch {
    fail("MIGRATION_INVENTORY_API_UNREACHABLE");
  }
  if (!response.ok) fail("MIGRATION_INVENTORY_API_REJECTED", { status: response.status });
  try {
    const payload = await response.json();
    if (!Array.isArray(payload)) fail("MIGRATION_INVENTORY_INVALID_RESPONSE");
    return payload;
  } catch {
    fail("MIGRATION_INVENTORY_INVALID_JSON");
  }
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
