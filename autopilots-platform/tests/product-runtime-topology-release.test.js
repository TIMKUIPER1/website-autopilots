import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const applyUrl = new URL("../scripts/apply-product-runtime-topology.js", import.meta.url);
const verifyUrl = new URL("../scripts/verify-live-product-runtime-topology.js", import.meta.url);
const releaseUrl = new URL("../scripts/release-control-plane-foundation.js", import.meta.url);
const [apply, verify, release] = await Promise.all(
  [applyUrl, verifyUrl, releaseUrl].map((url) => readFile(url, "utf8")),
);

test("runtime topology apply is project pinned, checksum exact and 48 to 49 only", () => {
  for (const source of [apply, verify, release]) {
    assert.match(source, /wurycoodzcybaxcgqxps/u);
  }
  assert.match(apply, /20260804163000_product_runtime_topology\.sql/u);
  assert.match(apply, /AP-INT-20260803-013/u);
  assert.match(apply, /RUNTIME_TOPOLOGY_CONFIRM/u);
  assert.match(apply, /48:49/u);
  assert.match(apply, /begin;[\s\S]*MIGRATION_INVENTORY_COUNT_MISMATCH[\s\S]*commit;/u);
  assert.match(apply, /assertInventory\(after, expectedAfter\)/u);
});

test("runtime topology verifier is select-only and proves exact no-effect posture", () => {
  assert.match(verify, /migrationCount !== 49/u);
  assert.match(verify, /governedRpcCount !== 41/u);
  assert.match(verify, /runtimeCount !== 3/u);
  assert.match(verify, /renderSqliteCount !== 1/u);
  assert.match(verify, /supabasePostgresCount !== 2/u);
  assert.match(verify, /unsafeEffectCount !== 0/u);
  assert.match(verify, /serviceRoleCanExecute !== true/u);
  assert.match(verify, /authenticatedCanExecute !== false/u);
  assert.doesNotMatch(verify, /\b(?:insert|update|delete|alter|create|drop|truncate)\s+(?:into|table|function|from)?/iu);
});

test("one Keychain-backed foundation release cannot skip either acceptance chain", () => {
  assert.match(release, /find-generic-password", "-s", "Supabase CLI", "-w"/u);
  for (const step of [
    "readiness-apply", "readiness-verify", "readiness-accept",
    "runtime-topology-apply", "runtime-topology-verify",
  ]) assert.ok(release.includes(step), step);
  assert.match(release, /persistentAcceptanceWrites: false/u);
  assert.match(release, /dataConnectionsEnabled: false/u);
  assert.match(release, /providerAuthorizationEnabled: false/u);
  assert.match(release, /externalWritesEnabled: false/u);
  assert.doesNotMatch(release, /console\.(?:log|error)\([^\n]*(?:accessToken|SUPABASE_ACCESS_TOKEN)/u);
});

test("runtime apply stops without a transient token before network access", () => {
  const result = spawnSync(process.execPath, [fileURLToPath(applyUrl), "--apply"], {
    encoding: "utf8",
    env: { ...process.env, SUPABASE_ACCESS_TOKEN: "" },
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /SUPABASE_ACCESS_TOKEN is vereist/u);
});
