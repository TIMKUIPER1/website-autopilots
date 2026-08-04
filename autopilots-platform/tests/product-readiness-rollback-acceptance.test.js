import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const source = await readFile(new URL(
  "../scripts/accept-live-product-readiness.js", import.meta.url
), "utf8");

test("acceptance is exact-target, transactionally rolled back and independently postchecked", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /const ROLLBACK_ACCEPTANCE_SQL = `begin;/);
  assert.match(source, /rollback;`;/);
  assert.doesNotMatch(source, /commit;/i);
  assert.equal((source.match(/runReadOnlyVerifier\(/g) || []).length, 3);
  assert.ok(source.indexOf("const ROLLBACK_ACCEPTANCE_SQL")
    < source.indexOf("runReadOnlyVerifier(\"PRODUCT_READINESS_BASELINE_FAILED\")"));
  assert.match(source, /persistentWrites: false/);
  assert.match(source, /externalWritesEnabled: false/);
});

test("acceptance covers success, replay, authority, validity, immutability and atomicity", () => {
  for (const evidence of [
    "ACCEPTANCE_VALID_BATCH_CONTRACT_FAILED",
    "ACCEPTANCE_VALID_BATCH_EVIDENCE_INCOMPLETE",
    "ACCEPTANCE_EXACT_REPLAY_FAILED",
    "ACCEPTANCE_DIVERGENT_REPLAY_ALLOWED",
    "ACCEPTANCE_WRONG_PROFILE_ALLOWED",
    "ACCEPTANCE_WRONG_ORGANIZATION_ALLOWED",
    "ACCEPTANCE_OPERATOR_CONTRACT_FAILED",
    "ACCEPTANCE_AUDITOR_ALLOWED",
    "ACCEPTANCE_DERIVED_GATE_ALLOWED",
    "ACCEPTANCE_STALE_EVIDENCE_ALLOWED",
    "ACCEPTANCE_WRONG_SOURCE_ALLOWED",
    "ACCEPTANCE_EVIDENCE_MUTATION_ALLOWED",
    "ACCEPTANCE_PARTIAL_BATCH_RESIDUE",
    "ACCEPTANCE_EVIDENCE_ACTIVATED_PRODUCT"
  ]) assert.ok(source.includes(evidence), evidence);
});

test("acceptance exposes no token, SQL or management response", () => {
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:token|query|payload|response)/i);
  assert.match(source, /stdio: \["ignore", "ignore", "ignore"\]/);
  assert.match(source, /PRODUCT_READINESS_TOKEN_REQUIRED/);
  assert.match(source, /PRODUCT_READINESS_ACCEPTANCE_REJECTED/);
});

test("acceptance stops without a transient token before any verifier or network step", () => {
  const env = { ...process.env };
  delete env.SUPABASE_ACCESS_TOKEN;
  delete env.SUPABASE_PROJECT_REF;
  const result = spawnSync(process.execPath, [fileURLToPath(new URL(
    "../scripts/accept-live-product-readiness.js", import.meta.url
  ))], { cwd: fileURLToPath(new URL("..", import.meta.url)), env, encoding: "utf8" });
  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /"code":"PRODUCT_READINESS_TOKEN_REQUIRED"/);
  assert.doesNotMatch(result.stderr, /https:|supabase\.com|select |begin;/i);
  assert.ok(source.indexOf("PRODUCT_READINESS_TOKEN_REQUIRED")
    < source.indexOf("runReadOnlyVerifier(\"PRODUCT_READINESS_BASELINE_FAILED\")"));
});
