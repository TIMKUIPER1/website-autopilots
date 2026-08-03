import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const browser = await readFile(new URL("../public/workspace.js", import.meta.url), "utf8");

function functionBody(name, nextName) {
  const start = browser.indexOf(`function ${name}(`);
  const end = browser.indexOf(`function ${nextName}(`, start + 1);
  assert.notEqual(start, -1, `${name} should exist`);
  assert.notEqual(end, -1, `${nextName} should follow ${name}`);
  return browser.slice(start, end);
}

test("managed internal routes cannot fall through to session demo screens", () => {
  assert.match(browser, /if\(internal&&path==='\/control-center'\)return companyTwin\(\)/);
  assert.match(browser, /if\(internal&&path==='\/control-center\/agents'\)return managedAgents\(\)/);
  assert.match(browser, /if\(internal&&path\.startsWith\('\/control-center\/implementaties\/'\)\)return managedImplementation\(\)/);

  const managedOverview = browser.indexOf("if(internal&&path==='/control-center')return companyTwin()");
  const demoOverview = browser.indexOf("if(path==='/control-center')return control()");
  assert.ok(managedOverview < demoOverview, "managed overview must be selected before the demo fallback");
});

test("managed implementation reports durable onboarding truth without simulation", () => {
  const body = functionBody("managedImplementation", "tasks");
  assert.match(body, /duurzame onboardingprojectie/);
  assert.match(body, /Oude demosessies en gesimuleerde lifecycle-acties tellen niet mee/);
  assert.match(body, /Providerautorisatie[\s\S]*UIT/);
  assert.match(body, /Externe writes[\s\S]*UIT/);
  assert.doesNotMatch(body, /data\.implementation|data\.workflow|data\.executions|data-action=/);
});

test("managed agent room fails closed until a durable registry exists", () => {
  const body = functionBody("managedAgents", "accessManagement");
  assert.match(body, /agentRegistryData/);
  assert.match(body, /De duurzame agentregistry kon niet veilig worden geladen/);
  assert.match(body, /De duurzame registry is actief, maar bevat nog geen agentrecords/);
  assert.match(body, /Agentbediening[\s\S]*UIT/);
  assert.doesNotMatch(body, /data\.agents|data-action=|Kill switch|Pauzeren|Hervatten/);
});

test("managed supporting panels stay relevant to their route", () => {
  const body = functionBody("renderManagedPanels", "command");
  assert.match(body, /path==='\/control-center'\|\|implementationView/);
  assert.match(body, /implementationView\|\|path==='\/control-center\/agents'/);
  assert.doesNotMatch(body, /control-center\/tasks|control-center\/approvals|control-center\/access/);
});
