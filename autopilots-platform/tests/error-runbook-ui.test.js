import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("operations inbox loads and matches durable exact-code runbooks", () => {
  assert.match(browser, /fetch\('\/api\/v1\/operations\/runbooks'\)/);
  assert.match(browser, /new Map\(\(errorRunbookData\?\.runbooks/);
  assert.match(browser, /Runbooks geven diagnose en escalatie, geen uitvoeractie/);
  assert.match(browser, /geen automatische actie/);
});

test("runbook route requires internal organization authority", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/operations\/runbooks"[\s\S]*requireInternal\(session\)[\s\S]*errorRunbooks\(session\.id, session\.organizationId\)/);
});
