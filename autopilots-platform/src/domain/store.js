import crypto from "node:crypto";
import { allowedTransitions, assertTransition } from "./lifecycle.js";

const now = () => new Date().toISOString();
const id = (prefix) => `${prefix}_${crypto.randomUUID()}`;

export class PlatformStore {
  #organizations = new Map();
  #implementations = new Map();
  #tasks = new Map();
  #events = [];
  #commands = new Map();

  constructor(seed = true) {
    if (seed) this.#seed();
  }

  #seed() {
    const organization = {
      id: "org_curacao_auto", name: "Curaçao Auto Center", slug: "curacao-auto-center",
      plan: "Scale", health: "green", createdAt: now()
    };
    this.#organizations.set(organization.id, organization);
    const implementation = {
      id: "impl_automotive_001", organizationId: organization.id,
      name: "AI Servicereceptionist", template: "automotive_service_receptionist",
      state: "integration_setup", progress: 58, targetLiveDate: "2026-08-03",
      owner: "Autopilots Delivery", riskLevel: 1, blockedReason: null,
      completed: ["Consult verwerkt", "Requirements bevestigd", "Demo goedgekeurd", "Contract en betaling"],
      nextAction: "Verbind de agenda om verder te gaan", createdAt: now(), updatedAt: now()
    };
    this.#implementations.set(implementation.id, implementation);
    this.#tasks.set("task_google_calendar", {
      id: "task_google_calendar", organizationId: organization.id,
      implementationId: implementation.id, priority: "P2", title: "Agenda verbinden",
      description: "Geef Autopilots beperkte toegang tot de serviceagenda.", status: "open",
      actorType: "customer", dueAt: "2026-07-23", createdAt: now()
    });
    this.#events.push({ id: id("evt"), organizationId: organization.id, type: "implementation.created", actor: "system", at: now() });
  }

  listOrganizations() { return [...this.#organizations.values()]; }

  getOrganization(organizationId) {
    const item = this.#organizations.get(organizationId);
    if (!item) throw new Error("Organisatie niet gevonden.");
    return structuredClone(item);
  }

  listImplementations(organizationId) {
    return [...this.#implementations.values()].filter((item) => item.organizationId === organizationId).map((item) => ({
      ...structuredClone(item), allowedTransitions: allowedTransitions(item.state)
    }));
  }

  listTasks(organizationId) {
    return [...this.#tasks.values()].filter((item) => item.organizationId === organizationId).map((item) => structuredClone(item));
  }

  listAuditEvents(organizationId) {
    return this.#events.filter((event) => event.organizationId === organizationId).map((event) => structuredClone(event));
  }

  transition({ organizationId, implementationId, to, actor, reason, idempotencyKey }) {
    if (!idempotencyKey) throw new Error("Idempotency key ontbreekt.");
    const prior = this.#commands.get(idempotencyKey);
    if (prior) return structuredClone(prior);
    const implementation = this.#implementations.get(implementationId);
    if (!implementation || implementation.organizationId !== organizationId) throw new Error("Implementatie niet gevonden.");
    assertTransition(implementation.state, to);
    const from = implementation.state;
    implementation.state = to;
    implementation.updatedAt = now();
    if (reason) implementation.lastTransitionReason = reason;
    const event = { id: id("evt"), organizationId, implementationId, type: "implementation.transitioned", actor, from, to, reason: reason || null, at: now() };
    this.#events.push(event);
    const result = { implementation: structuredClone(implementation), event: structuredClone(event) };
    this.#commands.set(idempotencyKey, result);
    return result;
  }

  snapshot(organizationId) {
    return {
      organization: this.getOrganization(organizationId),
      implementations: this.listImplementations(organizationId),
      tasks: this.listTasks(organizationId),
      auditEvents: this.listAuditEvents(organizationId)
    };
  }
}
