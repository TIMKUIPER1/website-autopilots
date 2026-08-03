import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("managed task inbox loads one durable operations queue", () => {
  assert.match(browser, /path==='\/control-center\/tasks'[\s\S]*fetch\('\/api\/v1\/operations\/queue'\)/);
  assert.match(browser, /Menselijke taken en foutcodes <em>centraal zichtbaar/);
  assert.match(browser, /De managed omgeving toont nooit demotaken als live waarheid/);
});

test("managed task inbox presents bounded errors without generic execution", () => {
  assert.match(browser, /ERROR INTELLIGENCE/);
  assert.match(browser, /geen private context, commandpayloads of autonome remediation/);
  assert.match(browser, /Actie via specifieke workflow/);
  assert.doesNotMatch(browser, /managedPost\('\/api\/v1\/operations/);
});

test("operations queue route requires internal managed authority", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/operations\/queue"[\s\S]*requireInternal\(session\)[\s\S]*operationsQueue\(session\.id, session\.organizationId\)/);
});
