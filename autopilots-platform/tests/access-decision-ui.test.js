import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const source = await fs.readFile(new URL("../public/workspace.js", import.meta.url), "utf8");

test("owner UI sends bounded access decisions with locked context", () => {
  assert.match(source, /dataset\.action=['"]access-decision['"]/);
  assert.match(source, /access\/requests\/\$\{encodeURIComponent\(request\.id\)\}\/decision/);
  assert.match(source, /\{decision,contextVersion:request\.contextVersion\}/);
  assert.match(source, /\['approved','rejected'\]\.includes\(decision\)/);
});

test("owner UI keeps access activation explicitly blocked", () => {
  assert.match(source, /geen account, membership of provideruitnodiging aangemaakt/);
  assert.match(source, /membership niet toegepast/);
  assert.match(source, /activatie blijft geblokkeerd/);
  assert.doesNotMatch(source, /\/api\/v1\/access\/memberships/);
  assert.doesNotMatch(source, /provider-invit/);
});
