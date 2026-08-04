import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("../scripts/inspect-live-advisors.js", import.meta.url), "utf8");

test("advisor inspection is exact-project GET-only and tolerates endpoint retirement", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /const ADVISORS = Object\.freeze\(\["security", "performance"\]\)/);
  assert.match(source, /method: "GET"/);
  assert.match(source, /response\.status === 404/);
  assert.doesNotMatch(source, /method: "(?:POST|PUT|PATCH|DELETE)"/);
  assert.match(source, /databaseWrites: false/);
  assert.match(source, /externalWrites: false/);
});

test("advisor inspection exposes only bounded names levels and counts", () => {
  assert.match(source, /safeName\(lint\?\.name\)/);
  assert.match(source, /safeLevel\(lint\?\.level\)/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:accessToken|token|payload|response)/i);
  assert.doesNotMatch(source, /lint\?\.(?:description|detail|remediation|metadata|cache_key)/);
});
