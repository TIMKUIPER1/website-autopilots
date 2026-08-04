import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const html = fs.readFileSync(new URL("../public/workspace.html", import.meta.url), "utf8");
const script = fs.readFileSync(new URL("../public/workspace.js", import.meta.url), "utf8");

test("managed login and control-center routes identify as Autopilots OS", () => {
  assert.match(html, /<title>Autopilots<\/title>/u);
  assert.match(script, /path\.startsWith\('\/control-center'\).*document\.title='Autopilots OS'/u);
  assert.match(script, /authCapabilities\.provider==='supabase'\?'Autopilots OS':'Autopilots Demo'/u);
});
