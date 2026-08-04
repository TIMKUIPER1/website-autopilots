import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { APPLIED_MIGRATIONS, LIVE_MIGRATION_VERSION_ALIASES, liveMigrationInventory }
  from "../scripts/migration-manifest.js";

const source = await readFile(new URL("../scripts/inspect-live-migration-inventory.js", import.meta.url), "utf8");

test("migration inventory inspection is project pinned and SELECT-only", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /select version, checksum, change_id[\s\S]*order by version/);
  assert.doesNotMatch(source, /\b(?:insert|update|delete|alter|create|drop|truncate)\s+(?:into|table|function|from)?/iu);
  assert.match(source, /databaseWrites: false/);
  assert.match(source, /externalWrites: false/);
});

test("migration inventory inspection never prints credentials or response bodies", () => {
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:accessToken|token|payload|query)/i);
  assert.doesNotMatch(source, /response\.(?:text|body)/);
  assert.match(source, /accessToken = ""/);
});

test("legacy live versions are exact aliases with immutable checksums", () => {
  assert.equal(Object.keys(LIVE_MIGRATION_VERSION_ALIASES).length, 9);
  assert.equal(new Set(Object.values(LIVE_MIGRATION_VERSION_ALIASES)).size, 9);
  for (const [file, liveVersion] of Object.entries(LIVE_MIGRATION_VERSION_ALIASES)) {
    assert.ok(APPLIED_MIGRATIONS[file]);
    assert.match(liveVersion, /^\d{14}(?:_[a-z0-9_]+)?$/);
  }
  const inventory = liveMigrationInventory();
  assert.equal(inventory.length, Object.keys(APPLIED_MIGRATIONS).length);
  assert.equal(new Set(inventory.map(([version]) => version)).size, inventory.length);
});
