import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("managed approval center loads durable organization approvals", () => {
  assert.match(browser, /path==='\/control-center\/approvals'[\s\S]*fetch\('\/api\/v1\/approvals'\)/);
  assert.match(browser, /Alle menselijke besluiten uit <em>één duurzame wachtrij/);
  assert.match(browser, /De managed omgeving toont nooit demo-approvals als live waarheid/);
});

test("managed approval center does not expose a generic decision executor", () => {
  assert.match(browser, /Generieke approval-uitvoering is uitgeschakeld/);
  assert.doesNotMatch(browser, /managedPost\('\/api\/v1\/approvals/);
});

test("approval queue route requires internal managed authority", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/approvals"[\s\S]*requireInternal\(session\)[\s\S]*approvalQueue\(session\.id, session\.organizationId\)/);
});
