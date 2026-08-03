import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
const repository = await readFile(new URL("../src/persistence/supabase-control-plane.js", import.meta.url), "utf8");

test("portfolio shows durable launch readiness for every operating brand", () => {
  assert.match(browser, /osData\.launchReadiness/);
  assert.match(browser, /Launchstappen/);
  assert.match(browser, /Menselijke aandacht/);
  assert.match(browser, /Connector approvals/);
  assert.match(browser, /brand\.onboarding/);
  assert.match(browser, /Volgende:/);
});

test("portfolio copy distinguishes internal approval from provider activation", () => {
  assert.match(browser, /Approved betekent alleen intern akkoord/);
  assert.match(browser, /providerautorisatie en externe writes blijven geblokkeerd/i);
});

test("repository fails closed unless portfolio v2 carries no-effect readiness", () => {
  assert.match(repository, /autopilots\.portfolio\.v2/);
  assert.match(repository, /launchReadiness\.providerAuthorizationEnabled !== false/);
  assert.match(repository, /launchReadiness\.externalWritesEnabled !== false/);
});
