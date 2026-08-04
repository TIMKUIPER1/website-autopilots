import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const scriptUrl = new URL("../scripts/apply-product-readiness-chain.js", import.meta.url);
const source = await readFile(scriptUrl, "utf8");

test("migration chain is pinned to the exact Autopilots project and three reviewed changes", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  for (const value of [
    "20260804150000_product_connection_readiness.sql", "AP-INT-20260803-010",
    "20260804153000_product_connection_evidence_recording.sql", "AP-INT-20260803-011",
    "20260804160000_atomic_product_snapshot_evidence.sql", "AP-INT-20260803-012"
  ]) assert.ok(source.includes(value), value);
  assert.match(source, /requestedRef !== PROJECT_REF/);
});

test("default execution is read-only and apply needs two exact independent gates", () => {
  assert.match(source, /const apply = process\.argv\.includes\("--apply"\)/);
  assert.match(source, /apply && \(process\.env\.ALLOW_DATABASE_MIGRATIONS !== "true"/);
  assert.match(source, /process\.env\.MIGRATION_CHAIN_CONFIRM !== APPLY_CONFIRMATION/);
  assert.match(source, /if \(!apply\) \{[\s\S]*mode: "preflight"[\s\S]*process\.exit\(0\)/);
  const result = spawnSync(process.execPath, [fileURLToPath(scriptUrl), "--apply"], {
    encoding: "utf8", env: { ...process.env, SUPABASE_ACCESS_TOKEN: "" }
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SUPABASE_ACCESS_TOKEN is vereist/);
});

test("preflight compares the complete ordered filename and checksum inventory", () => {
  assert.match(source, /select version, checksum, change_id[\s\S]*order by version/);
  assert.match(source, /JSON\.stringify\(actual\) === JSON\.stringify\(candidate\)/);
  assert.match(source, /READINESS_TARGET_LAST = "20260804160000_atomic_product_snapshot_evidence\.sql"/);
  assert.match(source, /targetManifestEntries = manifestEntries\.slice\(0, readinessTargetIndex \+ 1\)/);
  assert.match(source, /expectedAfter = liveMigrationInventory\(targetManifestEntries\)/);
  assert.match(source, /expectedBefore = liveMigrationInventory/);
  assert.match(source, /assertInventory\(before, \[expectedBefore, expectedAfter\]\)/);
  assert.match(source, /if \(before\.length === expectedAfter\.length\)[\s\S]*mode: "already_applied"/);
});

test("apply builds one transaction with an in-database inventory guard", () => {
  assert.match(source, /return `begin;[\s\S]*MIGRATION_INVENTORY_COUNT_MISMATCH[\s\S]*MIGRATION_INVENTORY_CHECKSUM_MISMATCH[\s\S]*commit;`/);
  assert.match(source, /const sql = await buildAtomicChain\(expectedBefore\);[\s\S]*await databaseQuery\(sql\);[\s\S]*assertInventory\(after, expectedAfter\)/);
  assert.match(source, /APPLIED_MIGRATIONS\[name\] !== checksum/);
});

test("management API errors are bounded and never print token, SQL or response bodies", () => {
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:token|query|payload|response)/i);
  assert.match(source, /Management API weigerde de query \(\$\{response\.status\}\)/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*response\.(?:text|json)/);
});
