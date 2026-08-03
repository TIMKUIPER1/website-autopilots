import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("security page loads privacy-limited organization session posture", () => {
  assert.match(browser, /fetch\('\/api\/v1\/security\/posture'\)/);
  assert.match(browser, /securityPostureData/);
  assert.match(browser, /Sessietokens, auth-identiteiten en vrije intrekredenen worden nooit getoond/);
  assert.match(browser, /Generiek sessies intrekken/);
  assert.doesNotMatch(browser, /data-action="session-revoke"/);
});

test("security posture route requires internal organization authority and current session context", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/security\/posture"[\s\S]*requireInternal\(session\)[\s\S]*securityPosture\([\s\S]*session\.id, session\.organizationId, session\.sessionId \|\| null/);
});
