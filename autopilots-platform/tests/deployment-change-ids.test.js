import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const directory = new URL("../docs/runbooks/deployments/", import.meta.url);
const files = (await readdir(directory)).filter((file) => file.endsWith(".md"));

test("singular deployment change IDs are unique and match their runbook filename", async () => {
  const owners = new Map();
  for (const file of files) {
    const markdown = await readFile(new URL(file, directory), "utf8");
    const match = markdown.match(/^- Change ID: `([A-Z]+-[A-Z]+-\d{8}-\d{3})`$/m);
    if (!match) continue;
    const changeId = match[1];
    assert.equal(file, `${changeId}.md`, `${changeId} must be documented by its matching runbook filename`);
    assert.equal(owners.has(changeId), false, `${changeId} is duplicated in ${owners.get(changeId)} and ${file}`);
    owners.set(changeId, file);
  }
  assert.ok(owners.size >= 20, "expected the governed deployment runbook set");
});
