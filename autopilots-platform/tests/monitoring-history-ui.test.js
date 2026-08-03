import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("portfolio loads durable organization monitoring history", () => {
  assert.match(browser, /path==='\/control-center\/portfolio'[\s\S]*fetch\('\/api\/v1\/monitoring\/history'\)/);
  assert.match(browser, /DUURZAAM MONITORINGBEWIJS/);
  assert.match(browser, /Er worden geen demo- of afgeleide runs getoond/);
  assert.match(browser, /herstelacties, notificaties en externe writes staan uit/);
});

test("monitoring history route requires an internal managed session", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/monitoring\/history"[\s\S]*requireInternal\(session\)[\s\S]*monitoringHistory\(session\.id, session\.organizationId\)/);
});
