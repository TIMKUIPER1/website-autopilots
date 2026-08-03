import assert from "node:assert/strict";
import test from "node:test";
import { assertIdempotentReplay, normalizeCommandRequest, PersistenceError } from "../src/persistence/contracts.js";
import { authorizeCommandActor, FoundationRepository } from "../src/persistence/postgres.js";

const base = {
  brandId: "20000000-0000-4000-8000-000000000001",
  environmentId: "30000000-0000-4000-8000-000000000001",
  actorProfileId: "40000000-0000-4000-8000-000000000001",
  commandType: "integration.stripe.discover",
  riskClass: "R1",
  idempotencyKey: "discover-stripe-001",
  contextVersion: 1,
  payload: { mode: "read_only", nested: { b: 2, a: 1 } },
  reason: "Stripe resources veilig inventariseren",
  evidence: ["connection:stripe"],
  source: "autopilots_os"
};

test("command fingerprint is deterministisch ongeacht objectvolgorde", () => {
  const first = normalizeCommandRequest(base);
  const second = normalizeCommandRequest({ ...base, payload: { nested: { a: 1, b: 2 }, mode: "read_only" } });
  assert.equal(first.fingerprint, second.fingerprint);
});

test("idempotency key kan niet met andere payload worden hergebruikt", () => {
  const first = normalizeCommandRequest(base);
  const changed = normalizeCommandRequest({ ...base, payload: { mode: "write" } });
  assert.throws(
    () => assertIdempotentReplay(first, changed),
    (error) => error instanceof PersistenceError && error.code === "IDEMPOTENCY_CONFLICT" && error.status === 409
  );
});

test("repository weigert een niet-transactionele databaseclient", () => {
  assert.throws(
    () => new FoundationRepository(() => []),
    (error) => error instanceof PersistenceError && error.code === "INVALID_DATABASE_CLIENT"
  );
});

test("commandrollen worden op de server per risicoklasse afgedwongen", () => {
  assert.equal(authorizeCommandActor([{ profile_id: base.actorProfileId, role: "admin" }], "R3").profile_id, base.actorProfileId);
  assert.throws(
    () => authorizeCommandActor([{ profile_id: base.actorProfileId, role: "viewer" }], "R0"),
    (error) => error instanceof PersistenceError && error.code === "COMMAND_FORBIDDEN" && error.status === 403
  );
  assert.throws(
    () => authorizeCommandActor([{ profile_id: base.actorProfileId, role: "operator" }], "R3"),
    (error) => error instanceof PersistenceError && error.code === "COMMAND_FORBIDDEN"
  );
});
