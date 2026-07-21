import test from "node:test";
import assert from "node:assert/strict";
import { DemoStore } from "../src/demo-store.js";

const customer = {
  id: "usr_customer_demo",
  email: "demo@curacao-auto.example",
  name: "Curaçao Auto Center",
  role: "customer",
  organizationId: "org_curacao_auto"
};
const internal = {
  id: "usr_internal_demo",
  email: "operator@autopilots.example",
  name: "Autopilots Operator",
  role: "internal",
  organizationId: "org_curacao_auto"
};
const command = (store, context, action, payload = {}, key = crypto.randomUUID()) =>
  store.command(key, action, payload, context);
const customerCommand = (store, action, payload = {}, key) => command(store, customer, action, payload, key);
const internalCommand = (store, action, payload = {}, key) => command(store, internal, action, payload, key);

function activate(store) {
  for (const type of ["terms", "privacy", "dpa"]) customerCommand(store, "legal.accept", { type });
  customerCommand(store, "payment.complete");
}

function completeLighthouseInput(store) {
  for (const item of store.snapshot().requirements.filter((requirement) => requirement.status !== "confirmed")) {
    customerCommand(store, "requirement.confirm", { id: item.id });
  }
  activate(store);
  for (const field of store.snapshot().dataRoom.fields) {
    customerCommand(store, "dataroom.field", { id: field.id, value: `Bevestigd: ${field.label}` });
  }
  customerCommand(store, "dataroom.document", { name: "implementatie.pdf" });
  customerCommand(store, "dataroom.secret", { label: "CRM sandbox", value: "demo-secret" });
}

test("demo-store bevat uitsluitend gelabelde demodata", () => {
  const data = new DemoStore().snapshot();
  assert.equal(data.organization.demoMode, true);
  assert.equal(data.integrations.every((item) => item.environment === "test"), true);
  assert.equal(data.preview.externalWrites, false);
});

test("customer snapshot verbergt interne control-plane data", () => {
  const data = new DemoStore().snapshotFor(customer);
  for (const key of ["tasks", "agents", "approvals", "executions", "usageLedger", "metricRegistry"]) {
    assert.equal(key in data, false, key);
  }
});

test("tenant escape wordt geweigerd", () => {
  assert.throws(
    () => new DemoStore().snapshotFor({ ...customer, organizationId: "org_other" }),
    /buiten deze tenant/
  );
});

test("rollen kunnen elkaars commands niet uitvoeren", () => {
  const store = new DemoStore();
  assert.throws(() => customerCommand(store, "agent.kill", { id: "agent_1" }), /niet toegestaan/);
  assert.throws(() => internalCommand(store, "payment.complete"), /niet toegestaan/);
});

test("commands zijn per tenant idempotent en schrijven één ledgerregel", () => {
  const store = new DemoStore();
  const before = store.snapshot().usageLedger.length;
  const first = customerCommand(store, "onboarding.toggle", { id: "onb_6" }, "same");
  const second = customerCommand(store, "onboarding.toggle", { id: "onb_6" }, "same");
  assert.deepEqual(first, second);
  assert.equal(store.snapshot().onboarding.find((item) => item.id === "onb_6").status, "done");
  assert.equal(store.snapshot().usageLedger.length, before + 1);
});

test("iedere geslaagde actie schrijft audit en execution evidence", () => {
  const store = new DemoStore();
  const before = store.snapshot().audit.length;
  const result = customerCommand(store, "integration.test", { id: "int_google" });
  assert.equal(store.snapshot().audit.length, before + 1);
  assert.match(result.execution.evidence[0], /^audit:/);
});

test("betaling is geblokkeerd zonder verplichte acceptaties", () => {
  assert.throws(() => customerCommand(new DemoStore(), "payment.complete"), /accepteer eerst/);
});

test("betaling activeert alleen de sandboxworkflow en data room", () => {
  const store = new DemoStore();
  activate(store);
  const data = store.snapshot();
  assert.equal(data.commercial.status, "implementation_activated");
  assert.equal(data.dataRoom.status, "open");
  assert.equal(data.preview.externalWrites, false);
});

test("secure data room blijft dicht vóór betaling", () => {
  assert.throws(
    () => customerCommand(new DemoStore(), "dataroom.field", { id: "field_contact", value: "Tim" }),
    /pas na betaling/
  );
});

test("vault geeft de secret nooit terug", () => {
  const store = new DemoStore();
  activate(store);
  const response = customerCommand(store, "dataroom.secret", { label: "CRM", value: "super-secret" });
  assert.equal(JSON.stringify({ response, data: store.snapshot() }).includes("super-secret"), false);
  assert.equal(store.snapshot().dataRoom.secrets[0].readableByAgents, false);
});

test("ongeldige uploads en lege secrets worden geweigerd", () => {
  const store = new DemoStore();
  activate(store);
  assert.throws(() => customerCommand(store, "dataroom.document", { name: "malware.exe" }), /geldig/);
  assert.throws(() => customerCommand(store, "dataroom.secret", { label: "CRM", value: "" }), /geldige secret/);
});

test("productmatch accepteert alleen primaire AI Medewerkers", () => {
  const store = new DemoStore();
  customerCommand(store, "product.select", { id: "inbox" });
  assert.equal(store.snapshot().products.filter((item) => item.selected).length, 1);
  assert.throws(() => customerCommand(store, "product.select", { id: "crm" }), /niet als primaire/);
});

test("kill switch stopt een agent en blokkeert automatische hervatting", () => {
  const store = new DemoStore();
  internalCommand(store, "agent.kill", { id: "agent_1" });
  assert.equal(store.snapshot().agents[0].status, "stopped");
  assert.throws(() => internalCommand(store, "agent.toggle", { id: "agent_1" }), /menselijke heractivatie/);
});

test("approval kan niet worden aangevraagd met ontbrekende klantgates", () => {
  const store = new DemoStore();
  internalCommand(store, "lifecycle.advance");
  internalCommand(store, "lifecycle.advance");
  assert.throws(() => internalCommand(store, "lifecycle.advance"), /requirements/);
  assert.equal(store.snapshot().approvals[0].status, "not_ready");
});

test("complete lighthouse-route eindigt bij menselijke approval", () => {
  const store = new DemoStore();
  completeLighthouseInput(store);
  internalCommand(store, "lifecycle.advance");
  internalCommand(store, "lifecycle.advance");
  internalCommand(store, "lifecycle.advance");
  const pending = store.snapshot().approvals[0];
  assert.equal(pending.status, "pending");
  internalCommand(store, "approval.decide", {
    id: pending.id,
    decision: "approved",
    contextVersion: pending.contextVersion
  });
  const data = store.snapshot();
  assert.equal(data.workflow.state, "ready_for_authorized_activation");
  assert.equal(data.metrics.verifiedActivations, 1);
  assert.equal(data.workflow.externalWrites, false);
});

test("stale approvalcontext wordt geweigerd", () => {
  const store = new DemoStore();
  completeLighthouseInput(store);
  internalCommand(store, "lifecycle.advance");
  internalCommand(store, "lifecycle.advance");
  internalCommand(store, "lifecycle.advance");
  const pending = store.snapshot().approvals[0];
  assert.throws(
    () => internalCommand(store, "approval.decide", { id: pending.id, decision: "approved", contextVersion: 1 }),
    /context is gewijzigd/
  );
});

test("reset is uitsluitend intern en herstelt de basisstaat", () => {
  const store = new DemoStore();
  activate(store);
  assert.throws(() => customerCommand(store, "demo.reset"), /niet toegestaan/);
  internalCommand(store, "demo.reset");
  assert.equal(store.snapshot().commercial.status, "preview_ready");
});
