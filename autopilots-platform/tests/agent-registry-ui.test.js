import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("managed agent room loads its durable brand registry", () => {
  assert.match(browser, /path==='\/control-center\/agents'[\s\S]*fetch\(`\/api\/v1\/agents\/brands\/\$\{encodeURIComponent\(selectedCompanyId\)\}`\)/);
  assert.match(browser, /Supabase-registry/);
  assert.match(browser, /De duurzame registry is actief, maar bevat nog geen agentrecords/);
});

test("managed agent room exposes no generic controls", () => {
  assert.match(browser, /Bediening en externe writes blijven uit/);
  assert.match(browser, /Bediening geblokkeerd/);
  assert.doesNotMatch(browser, /managedPost\(`?\/api\/v1\/agents/);
});

test("agent registry route requires an internal managed session", () => {
  assert.match(server, /url\.pathname\.startsWith\("\/api\/v1\/agents\/brands\/"\)[\s\S]*requireInternal\(session\)[\s\S]*agentRegistry\(session\.id, slug\)/);
});
