import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../scripts/verify-live-legacy-surface.js", import.meta.url), "utf8");

test("legacy live verifier is bounded to the exact Autopilots project and read-only HEAD probes", () => {
  assert.match(source, /const projectRef = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /method: "HEAD"/);
  assert.doesNotMatch(source, /method: "(?:POST|PUT|PATCH|DELETE)"/);
  assert.match(source, /persistentWrites: false/);
  assert.match(source, /externalWrites: false/);
});

test("legacy live verifier derives scope from the reviewed inventory without logging keys", () => {
  assert.match(source, /legacy-public-surface\.json/);
  assert.match(source, /runtimeAccess === "none"/);
  assert.match(source, /UNUSED_LEGACY_TABLE_BROWSER_ACCESSIBLE/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:serviceRoleKey|anonKey|keys)/);
});
