import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL(
  "../scripts/release-product-readiness.js", import.meta.url
), "utf8");

test("release is pinned to one project and requires the exact migration gates", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /ALLOW_DATABASE_MIGRATIONS: "true"/);
  assert.match(source, /MIGRATION_CHAIN_CONFIRM: `\$\{PROJECT_REF\}:45:48`/);
  assert.match(source, /process\.platform !== "darwin"/);
});

test("release obtains the existing token privately and never prints credential material", () => {
  assert.match(source, /find-generic-password", "-s", "Supabase CLI", "-w"/);
  assert.match(source, /stdio: \["ignore", "pipe", "ignore"\]/);
  assert.match(source, /delete releaseEnv\.SUPABASE_ACCESS_TOKEN/);
  assert.match(source, /accessToken = ""/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:accessToken|SUPABASE_ACCESS_TOKEN|stdout)/);
});

test("release cannot skip apply, independent posture verification or rollback acceptance", () => {
  const apply = source.indexOf('runStep("apply"');
  const verify = source.indexOf('runStep("verify"');
  const accept = source.indexOf('runStep("accept"');
  assert.ok(apply > 0 && apply < verify && verify < accept);
  assert.match(source, /persistentAcceptanceWrites: false/);
  assert.match(source, /providerAuthorizationEnabled: false/);
  assert.match(source, /externalWritesEnabled: false/);
});
