import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const server = fs.readFileSync(new URL("../src/server.js", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../public/workspace.js", import.meta.url), "utf8");

test("product data-plane route is managed, organization scoped and internal only", () => {
  assert.match(server, /url\.pathname === "\/api\/v1\/data-planes"[\s\S]*controlPlaneRepository[\s\S]*requireSession\(req\)[\s\S]*requireInternal\(session\)[\s\S]*dataPlaneRegistry\(session\.id, session\.organizationId\)/);
});

test("portfolio reads data-plane topology and never posts registration actions", () => {
  assert.match(browser, /fetch\('\/api\/v1\/data-planes'\)/);
  assert.match(browser, /function dataPlaneRegistryPanel\(\)/);
  assert.match(browser, /Eén login, gescheiden productdata/);
  assert.match(browser, /projectsleutels worden nooit tussen projecten gedeeld/);
  assert.match(browser, /eerst live autoriteit verifiëren/);
  assert.match(browser, /niet-primaire back-upkandidaat uitgesloten/);
  assert.doesNotMatch(browser, /managedPost\('\/api\/v1\/data-planes/);
});

test("Supabase dashboard link is rebuilt only from a bounded project reference", () => {
  assert.match(browser, /validRef=\/\^\[a-z\]\{20\}\$\//);
  assert.match(browser, /https:\/\/supabase\.com\/dashboard\/project\/\$\{encodeURIComponent\(control\.projectRef\)\}/);
  assert.match(browser, /https:\/\/supabase\.com\/dashboard\/project\/\$\{encodeURIComponent\(discovery\.projectRef\)\}/);
  assert.doesNotMatch(browser, /href="\$\{control\.dashboardUrl\}"/);
});
