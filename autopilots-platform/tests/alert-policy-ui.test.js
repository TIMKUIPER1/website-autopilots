import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("operations inbox loads durable alert policy together with evidence", () => {
  assert.match(browser, /fetch\('\/api\/v1\/operations\/alert-policy'\)/);
  assert.match(browser, /alertPolicyData/);
  assert.match(browser, /Suppressie en escalatie zonder delivery/);
  assert.match(browser, /notificatie \$\{escapeText\(candidate\.deliveryStatus\)\}/);
  assert.match(browser, /Er zijn geen meldingen verstuurd/);
});

test("alert policy route requires internal organization authority", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/operations\/alert-policy"[\s\S]*requireInternal\(session\)[\s\S]*alertPolicySnapshot\(session\.id, session\.organizationId\)/);
});
