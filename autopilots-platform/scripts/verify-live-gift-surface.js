import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const projectRef = "wurycoodzcybaxcgqxps";
const apiUrl = `https://${projectRef}.supabase.co/rest/v1`;
const inventory = JSON.parse(await readFile(new URL("../config/gift-public-surface.json", import.meta.url), "utf8"));

let keys;
try {
  keys = JSON.parse(execFileSync("supabase", [
    "projects", "api-keys", "--project-ref", projectRef, "--reveal", "-o", "json"
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
} catch {
  fail("LIVE_GIFT_KEYS_UNAVAILABLE");
}

const serviceRoleKey = keys.find((key) => key.name === "service_role" && key.type === "legacy")?.api_key;
const anonKey = keys.find((key) => key.name === "anon" && key.type === "legacy")?.api_key;
if (!serviceRoleKey || !anonKey) fail("LIVE_GIFT_KEYS_UNAVAILABLE");

const evidence = [];
for (const table of inventory.tables) {
  const serviceResult = await countRows(table.name, serviceRoleKey);
  if (!serviceResult.ok) fail("GIFT_SERVICE_ROLE_TABLE_UNAVAILABLE", { table: table.name, status: serviceResult.status });
  const anonResult = await countRows(table.name, anonKey);
  if (anonResult.ok) fail("GIFT_TABLE_BROWSER_ACCESSIBLE", { table: table.name, status: anonResult.status });
  evidence.push({
    table: table.name,
    sensitivity: table.sensitivity,
    serviceRoleRows: serviceResult.count,
    browserDenied: true,
    browserStatus: anonResult.status
  });
}

console.log(JSON.stringify({
  ok: true,
  contract: "autopilots.live-gift-surface.v1",
  projectRef,
  tables: evidence,
  persistentWrites: false,
  externalWrites: false
}, null, 2));

async function countRows(table, key) {
  const response = await fetch(`${apiUrl}/${table}?select=*&limit=1`, {
    method: "HEAD",
    headers: { apikey: key, authorization: `Bearer ${key}`, prefer: "count=exact" },
    signal: AbortSignal.timeout(10_000)
  });
  const range = response.headers.get("content-range") || "";
  const count = Number(range.split("/")[1]);
  return { ok: response.ok, status: response.status, count: Number.isFinite(count) ? count : null };
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
