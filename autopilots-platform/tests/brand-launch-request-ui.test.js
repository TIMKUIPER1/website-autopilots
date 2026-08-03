import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");

test("portfolio can stage a bounded new software intent", () => {
  assert.match(browser, /id="brandLaunchForm"/);
  assert.match(browser, /Nieuw softwarebedrijf veilig voorbereiden/);
  assert.match(browser, /Autopilots blijft de overkoepelende autoriteit/);
  assert.match(browser, /managedPost\('\/api\/v1\/brand-launch\/requests'/);
  assert.match(browser, /brand_launch_\$\{crypto\.randomUUID\(\)\}/);
});

test("new software UI states that no resources are created", () => {
  assert.match(browser, /geen brand, sandbox, onboardingrun, provideraccount of credential aangemaakt/);
  assert.match(browser, /er is nog niets aangemaakt of gekoppeld/);
  assert.doesNotMatch(browser, /\/api\/v1\/brands\/create/);
  assert.doesNotMatch(browser, /providerAuthorizationEnabled\s*=\s*true/);
});

test("brand launch routes require internal authority and MFA for staging", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/brand-launch\/requests" && req\.method === "GET"[\s\S]*requireInternal\(session\)/);
  assert.match(server, /url\.pathname === "\/api\/v1\/brand-launch\/requests" && req\.method === "POST"[\s\S]*requireInternal\(session\)[\s\S]*requireManagedMfa\(session\)/);
  assert.match(server, /stageBrandLaunchRequest\([\s\S]*session\.id, session\.organizationId/);
});
