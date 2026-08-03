import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("audit page loads bounded organization evidence and no execution controls", () => {
  assert.match(browser, /fetch\('\/api\/v1\/audit\/timeline'\)/);
  assert.match(browser, /auditTimelineData/);
  assert.match(browser, /Payloads, redenen, actor-ID's en evidence-inhoud blijven verborgen/);
  assert.match(browser, /Geen generieke auditactie/);
  assert.doesNotMatch(browser, /data-action="audit-/);
});

test("audit route requires internal organization authority", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/audit\/timeline"[\s\S]*requireInternal\(session\)[\s\S]*auditTimeline\(session\.id, session\.organizationId\)/);
});
