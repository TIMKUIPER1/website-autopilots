import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("connector request UI stages intent without presenting provider activation", () => {
  assert.match(browser, /data-action="connector-stage"/);
  assert.match(browser, /connector-requests/);
  assert.match(browser, /Alleen intern voorbereiden/);
  assert.match(browser, /OAuth, discovery, credentials en externe writes blijven geblokkeerd/);
  assert.doesNotMatch(browser, /providerAuthorizationEnabled\s*=\s*true/);
});

test("connector request route requires managed MFA and operating-brand scope", () => {
  assert.match(server, /endsWith\("\/connector-requests"\)[\s\S]*requireInternal\(session\)[\s\S]*requireManagedMfa\(session\)[\s\S]*requireCompany\(session, slug\)/);
  assert.match(server, /stageConnectorRequest\([\s\S]*session\.id, slug, body/);
});
