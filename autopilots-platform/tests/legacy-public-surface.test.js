import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const inventory = JSON.parse(await fs.readFile(new URL("../config/legacy-public-surface.json", import.meta.url), "utf8"));
const salesServer = await fs.readFile(new URL("../../sales-dashboard/server.js", import.meta.url), "utf8");
const salesProbe = await fs.readFile(new URL("../../sales-dashboard/scripts/check-supabase.js", import.meta.url), "utf8");

test("legacy Advisor inventory is exact, unique and explicitly owned", () => {
  assert.equal(inventory.contract, "autopilots.legacy-public-surface.v1");
  assert.equal(inventory.owner, "sales-dashboard");
  assert.equal(inventory.tables.length, 18);
  const names = inventory.tables.map((table) => table.name);
  assert.deepEqual(names, [...new Set(names)].sort());
  for (const table of inventory.tables) {
    assert.ok(["medium", "high", "critical"].includes(table.sensitivity));
    assert.ok(["none", "service_role_write_mirror"].includes(table.runtimeAccess));
    assert.equal(Boolean(table.caller), table.runtimeAccess !== "none");
  }
});

test("sales-dashboard runtime touches exactly four legacy tables via server mirrors", () => {
  const runtimeTables = [...salesServer.matchAll(/supabaseRequest\("([a-z_]+)"/g)].map((match) => match[1]).sort();
  const declaredRuntimeTables = inventory.tables.filter((table) => table.runtimeAccess !== "none").map((table) => table.name).sort();
  assert.deepEqual([...new Set(runtimeTables)], declaredRuntimeTables);
  assert.deepEqual(declaredRuntimeTables, ["audit_log", "integration_health", "invoices_sales", "raw_imports"]);
  assert.match(salesServer, /Authorization:\s*`Bearer \$\{SUPABASE_SERVICE_ROLE_KEY\}`/);
  assert.doesNotMatch(salesServer, /Authorization:\s*`Bearer \$\{SUPABASE_ANON_KEY\}`/);
});

test("legacy connectivity probe is service-role-only and covers the same four tables", () => {
  const probeMatch = salesProbe.match(/const tables = \[([^\]]+)\]/);
  assert.ok(probeMatch);
  const probed = [...probeMatch[1].matchAll(/"([a-z_]+)"/g)].map((match) => match[1]).sort();
  const declaredRuntimeTables = inventory.tables.filter((table) => table.runtimeAccess !== "none").map((table) => table.name).sort();
  assert.deepEqual(probed, declaredRuntimeTables);
  assert.match(salesProbe, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(salesProbe, /SUPABASE_ANON_KEY/);
});
