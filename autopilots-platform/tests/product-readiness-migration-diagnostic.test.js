import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../scripts/diagnose-product-readiness-migrations.js", import.meta.url), "utf8"
);

test("readiness diagnostic validates exact migrations inside rollback-only prefixes", () => {
  assert.match(source, /const PROJECT_REF = "wurycoodzcybaxcgqxps"/);
  assert.match(source, /APPLIED_MIGRATIONS\[migration\] !== checksum/);
  assert.match(source, /const query = `begin;\\n\$\{statements\.slice\(0, index \+ 1\)\.join\("\\n"\)\}\\nrollback;`/);
  assert.match(source, /transactionRolledBack: true/);
  assert.match(source, /persistentWrites: false/);
  assert.match(source, /externalWrites: false/);
});

test("readiness diagnostic returns only bounded error evidence", () => {
  assert.match(source, /messageFingerprintSha256/);
  assert.match(source, /syntaxToken: safeSyntaxToken/);
  assert.match(source, /statementPosition: safeStatementPosition/);
  assert.match(source, /statementLine: safeStatementLine/);
  assert.match(source, /syntaxAtEndOfInput/);
  assert.match(source, /SAFE_IDENTIFIERS\.find/);
  assert.doesNotMatch(source, /console\.(?:log|error)\([^\n]*(?:accessToken|token|query|payload|message)/i);
  assert.doesNotMatch(source, /response\.(?:text|body)/);
});
