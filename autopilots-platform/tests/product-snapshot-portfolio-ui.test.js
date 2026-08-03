import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("portfolio renders only explicit live product snapshots and otherwise fails closed", async () => {
  const [workspace, styles] = await Promise.all([
    readFile(new URL("../public/workspace.js", import.meta.url), "utf8"),
    readFile(new URL("../public/workspace.css", import.meta.url), "utf8")
  ]);
  assert.match(workspace, /fetch\('\/api\/v1\/data-planes\/snapshots'\)/);
  assert.match(workspace, /function productSnapshotPortfolioPanel\(\)/);
  assert.match(workspace, /Er worden geen demo-, cache- of geschatte cijfers getoond/);
  assert.match(workspace, /Drie bedrijven, één privacy-veilig beeld/);
  assert.match(workspace, /item\.status==='connected'&&item\.aggregates/);
  assert.match(workspace, /Deze weergave kan niets wijzigen/);
  assert.doesNotMatch(workspace, /data-action="(?:refresh-snapshot|connect-snapshot|activate-snapshot)"/);
  assert.match(styles, /#workspaceApp \.snapshot-grid/);
  assert.match(styles, /grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
  assert.match(styles, /@media\(max-width:1050px\)\{#workspaceApp \.snapshot-grid\{grid-template-columns:1fr\}\}/);
});
