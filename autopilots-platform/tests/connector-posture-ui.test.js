import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const server = fs.readFileSync(new URL("../src/server.js", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../public/workspace.js", import.meta.url), "utf8");

test("connector posture route requires an internal session and returns no provider action", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/operations\/connector-posture"[\s\S]*requireSession\(req\)[\s\S]*requireInternal\(session\)[\s\S]*connectorPosture\(session\.companyIds\)/);
});

test("portfolio loads and renders safe connector configuration provenance", () => {
  assert.match(browser, /fetch\('\/api\/v1\/operations\/connector-posture'\)/);
  assert.match(browser, /connectorPosturePanel\(\)/);
  assert.match(browser, /Endpoint- en credentialwaarden worden nooit getoond/);
  assert.doesNotMatch(browser, /managedPost\('\/api\/v1\/operations\/connector-posture/);
});
