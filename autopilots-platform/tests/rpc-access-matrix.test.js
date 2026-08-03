import assert from "node:assert/strict";
import fs from "node:fs/promises";
import test from "node:test";

const matrix = JSON.parse(await fs.readFile(new URL("../config/rpc-access-matrix.json", import.meta.url), "utf8"));

test("only the signed-in context RPC is browser callable", () => {
  const browserRpcs = Object.entries(matrix).filter(([, role]) => role === "authenticated");
  assert.deepEqual(browserRpcs, [["autopilots_session_context", "authenticated"]]);
});

test("every other governed public RPC is server-role only", () => {
  assert.ok(Object.keys(matrix).length >= 21);
  for (const [rpc, role] of Object.entries(matrix)) {
    assert.match(rpc, /^autopilots_[a-z0-9_]+$/);
    assert.ok(new Set(["authenticated", "service_role"]).has(role));
    if (rpc !== "autopilots_session_context") assert.equal(role, "service_role");
  }
});
