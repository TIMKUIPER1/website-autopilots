import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("owner UI decides connector intent with current context", () => {
  assert.match(browser, /data-action="connector-decision"/);
  assert.match(browser, /connector-requests\/\$\{encodeURIComponent\(request\.id\)\}\/decision/);
  assert.match(browser, /\{decision,contextVersion:request\.contextVersion\}/);
  assert.match(browser, /connector_decision_\$\{crypto\.randomUUID\(\)\}/);
});

test("connector decision UI keeps approval separate from provider activation", () => {
  assert.match(browser, /registreert alleen het interne besluit/);
  assert.match(browser, /providerautorisatie blijft geblokkeerd/);
  assert.doesNotMatch(browser, /\/api\/v1\/oauth/);
  assert.doesNotMatch(browser, /\/api\/v1\/providers\/.*connect/);
});

test("connector decision route requires MFA and brand scope", () => {
  assert.match(server, /includes\("\/connector-requests\/"\)[\s\S]*requireInternal\(session\)[\s\S]*requireManagedMfa\(session\)[\s\S]*requireCompany\(session, slug\)/);
  assert.match(server, /decideConnectorRequest\([\s\S]*session\.id, slug, requestId/);
});
