import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const source = await fs.readFile(new URL("../scripts/start-managed-sandbox.js", import.meta.url), "utf8");

test("managed sandbox launcher is pinned, secret-safe and write-disabled", () => {
  assert.match(source, /projectRef = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /EXTERNAL_WRITES_ENABLED: "false"/);
  assert.match(source, /SESSION_SECRET: crypto\.randomBytes\(48\)/);
  assert.match(source, /stdio: \["ignore", "pipe", "pipe"\]/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:publishableKey|serviceRoleKey|keys)/);
});
