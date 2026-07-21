import test from "node:test";
import assert from "node:assert/strict";
import { PlatformStore } from "../src/domain/store.js";

test("tenant kan alleen eigen implementaties lezen", () => {
  const store = new PlatformStore(true);
  assert.equal(store.listImplementations("org_curacao_auto").length, 1);
  assert.equal(store.listImplementations("org_other").length, 0);
});

test("transition schrijft een audit event en is idempotent", () => {
  const store = new PlatformStore(true);
  const command = { organizationId: "org_curacao_auto", implementationId: "impl_automotive_001", to: "ready_to_build", actor: "tester", idempotencyKey: "test-command-1" };
  const first = store.transition(command);
  const second = store.transition(command);
  assert.equal(first.event.id, second.event.id);
  assert.equal(store.listAuditEvents("org_curacao_auto").filter((event) => event.type === "implementation.transitioned").length, 1);
});

test("cross-tenant transition wordt geweigerd", () => {
  const store = new PlatformStore(true);
  assert.throws(() => store.transition({ organizationId: "org_other", implementationId: "impl_automotive_001", to: "ready_to_build", actor: "attacker", idempotencyKey: "attack-1" }), /niet gevonden/);
});
