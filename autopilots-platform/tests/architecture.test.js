import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const requiredArtifacts = [
  "../PLANS.md",
  "docs/architecture/CURRENT_TARGET.md",
  "docs/product/LIGHTHOUSE.md",
  "docs/security/THREAT_MODEL.md",
  "docs/integrations/SOURCE_OF_TRUTH.md",
  "docs/runbooks/LOCAL_DEMO.md",
  "docs/runbooks/BACKUP_RESTORE.md",
  "docs/DECISION_REGISTER.md",
  "docs/RISK_REGISTER.md",
  "evals/lighthouse-cases.json"
];

test("durable OS artifacts blijven aanwezig", async () => {
  for (const file of requiredArtifacts) {
    const stat = await fs.stat(new URL(file, new URL("../", import.meta.url)));
    assert.equal(stat.isFile(), true, file);
  }
});

test("eval registry bevat unieke, expliciete uitkomsten", async () => {
  const cases = JSON.parse(await fs.readFile(new URL("../evals/lighthouse-cases.json", import.meta.url), "utf8"));
  assert.equal(new Set(cases.map((item) => item.id)).size, cases.length);
  assert.equal(cases.every((item) => item.expected && /^R[0-3]$/.test(item.risk)), true);
});

test("browsercode bevat geen live provider secrets", async () => {
  const source = await fs.readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
  assert.equal(/sk_live_|pit-[a-f0-9-]{20,}/i.test(source), false);
  assert.equal(source.includes("externalWrites:true"), false);
});

test("managed portfolio reads durable Supabase authority instead of the fixture", async () => {
  const source = await fs.readFile(new URL("../src/server.js", import.meta.url), "utf8");
  assert.match(source, /controlPlaneRepository\s*\?\s*await controlPlaneRepository\.portfolio\(session\.id, session\.organizationId\)/);
  assert.match(source, /:\s*osStore\.portfolio\(session\)/);
});

test("managed brand twin reads durable Supabase authority instead of the fixture", async () => {
  const source = await fs.readFile(new URL("../src/server.js", import.meta.url), "utf8");
  assert.match(source, /controlPlaneRepository\.brandTwin\(session\.id, slug\)/);
  assert.match(source, /return json\(res, 200, \{ \.\.\.twin, operations \}\)/);
  assert.match(source, /return json\(res, 200, osStore\.brandTwin\(session, slug, operations\)\)/);
});

test("managed control plane cannot report in-memory demo commands as durable success", async () => {
  const server = await fs.readFile(new URL("../src/server.js", import.meta.url), "utf8");
  const browser = await fs.readFile(new URL("../public/workspace.js", import.meta.url), "utf8");
  assert.match(server, /if \(controlPlaneRepository\) \{[\s\S]*MANAGED_COMMAND_ROUTE_REQUIRED[\s\S]*\}[\s\S]*store\.command/);
  assert.match(server, /controlPlaneMode: controlPlaneRepository \? "managed" : "demo"/);
  assert.match(browser, /data\.controlPlaneMode==='managed'[\s\S]*specifieke duurzame beheeractie/);
});
