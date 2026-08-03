import crypto from "node:crypto";

const clone = (value) => structuredClone(value);
const timestamp = () => new Date().toISOString();

const legalEntities = [
  {
    id: "le_autopilots_ai_agency_llc",
    legalName: "Autopilots AI Agency LLC",
    status: "active",
    baseCurrency: "EUR",
    source: "owner_configuration",
    environment: "demo"
  }
];

const brands = [
  ["brand_autopilots", "autopilots", "Autopilots", "AP", "active"],
  ["brand_autoreviews", "autoreviews", "AutoReviews", "AR", "foundation"],
  ["brand_autoplanner", "autoplanner", "AutoPlanner", "PL", "foundation"],
  ["brand_roofplanner", "roofplanner", "RoofPlanner", "RP", "foundation"]
].map(([id, slug, name, code, status]) => ({
  id,
  legalEntityId: "le_autopilots_ai_agency_llc",
  slug,
  name,
  code,
  status,
  source: "owner_configuration",
  environment: "demo"
}));

const customers = [
  {
    id: "customer_curacao_auto_demo",
    legalEntityId: "le_autopilots_ai_agency_llc",
    brandId: "brand_autopilots",
    name: "Curaçao Auto Center",
    lifecycleStage: "implementation",
    source: "demo_fixture",
    environment: "demo",
    demoMode: true
  }
];

const products = [
  {
    id: "product_autoreviews_reviews",
    brandId: "brand_autoreviews",
    name: "AutoReviews",
    status: "configured",
    lifecycleId: "lifecycle_autoreviews_customer_v1",
    source: "owner_configuration",
    environment: "demo"
  }
];

const goals = [
  {
    id: "goal_autoreviews_lighthouse",
    brandId: "brand_autoreviews",
    title: "Maak de volledige klantlevenscyclus meetbaar",
    kpi: "verified_live_customers",
    baseline: null,
    target: null,
    status: "proposed",
    owner: "Owners",
    evidenceRequired: true,
    source: "implementation_prompt",
    environment: "demo"
  }
];

const lifecycleDefinitions = [
  {
    id: "lifecycle_autoreviews_customer_v1",
    brandId: "brand_autoreviews",
    version: 1,
    status: "draft",
    stages: ["lead_or_scan", "meeting", "order_or_subscription", "onboarding", "review_setup", "customer_live", "reviews_collected", "verified_result"],
    externalWrites: false,
    source: "implementation_prompt",
    environment: "demo"
  }
];

const sourceDefinitions = [
  ["stripe", "Payments and subscriptions", "Stripe", "not_connected", "webhook + daily reconciliation", "financial", "7 years"],
  ["ghl", "Leads, opportunities and contacts", "GoHighLevel", "not_connected", "15 minutes", "personal", "contract + 90 days"],
  ["calendar", "Meetings", "Connected calendar", "not_connected", "15 minutes", "personal", "contract + 90 days"],
  ["whatsapp", "Review conversations", "Approved messaging provider", "not_connected", "5 minutes", "personal", "policy required"],
  ["autopilots_os", "Goals, policies, workflows and mappings", "Autopilots OS", "healthy", "direct", "internal", "policy controlled"]
].map(([id, dataClass, authority, status, freshnessExpectation, sensitivity, retention]) => ({
  id: `source_${id}`,
  provider: id,
  dataClass,
  authority,
  status,
  freshnessExpectation,
  lastSuccessfulSyncAt: null,
  reconciliationStatus: status === "healthy" ? "current" : "blocked_missing_connection",
  conflictBehavior: "authority_wins_and_conflict_is_logged",
  sensitivity,
  retention,
  environment: "demo"
}));

const integrationConnections = sourceDefinitions.filter((source) => source.provider !== "autopilots_os").map((source) => ({
  id: `connection_autoreviews_${source.provider}`,
  brandId: "brand_autoreviews",
  provider: source.provider,
  status: source.status,
  health: "unknown",
  externalAccountId: null,
  credentialReference: null,
  lastSuccessfulSyncAt: null,
  reconciliationStatus: source.reconciliationStatus,
  source: "connection_registry",
  environment: "demo"
}));

const externalMappings = [];
const usageLedger = [];
const canonicalEvents = [
  {
    id: "event_autoreviews_foundation",
    legalEntityId: "le_autopilots_ai_agency_llc",
    brandId: "brand_autoreviews",
    customerId: null,
    type: "brand.foundation_initialized",
    actorType: "system",
    actorId: "autopilots_os",
    correlationId: "corr_autoreviews_foundation",
    causationId: null,
    source: "owner_configuration",
    evidence: ["docs:architecture/CURRENT_TARGET.md"],
    occurredAt: "2026-07-21T00:00:00.000Z",
    environment: "demo"
  }
];

const ownerExceptions = [
  {
    id: "exception_autoreviews_sources",
    brandId: "brand_autoreviews",
    severity: "high",
    type: "data_readiness",
    title: "AutoReviews-bronnen zijn nog niet gekoppeld",
    consequence: "Leads, abonnementen, reviews, omzet en marge zijn nog niet betrouwbaar meetbaar.",
    reversibility: "fully_reversible",
    status: "open",
    requiresOwnerDecision: false,
    nextAction: "Configureer sandboxverbindingen en valideer externe IDs.",
    evidence: integrationConnections.map((connection) => connection.id),
    source: "deterministic_control"
  }
];

export class OperatingSystemStore {
  constructor() {
    this.usageEntries = clone(usageLedger);
    this.usageKeys = new Map();
    this.events = clone(canonicalEvents);
  }

  portfolio(context) {
    this.assertInternal(context);
    const allowed = brands.filter((brand) => context.companyIds?.includes(brand.slug));
    return {
      scope: { type: "portfolio", legalEntityId: legalEntities[0].id, environment: "demo" },
      legalEntity: clone(legalEntities[0]),
      brands: allowed.map((brand) => this.brandSummary(brand)),
      ownerExceptions: clone(ownerExceptions),
      dataHealth: this.dataHealth(null),
      sourceOfTruth: clone(sourceDefinitions),
      generatedAt: timestamp(),
      demoMode: true
    };
  }

  brandTwin(context, slug, operations = null) {
    this.assertInternal(context);
    if (!context.companyIds?.includes(slug)) throw this.forbidden("Geen toegang tot deze operating brand");
    const brand = brands.find((candidate) => candidate.slug === slug);
    if (!brand) throw this.notFound("Operating brand niet gevonden");
    const brandCustomers = customers.filter((customer) => customer.brandId === brand.id);
    const brandLedger = this.usageEntries.filter((entry) => entry.brandId === brand.id);
    const scopedIntegrations = this.scopedIntegrations(brand.id, operations);
    const finance = this.financeSnapshot(brand, brandLedger, operations);
    const scopedExceptions = this.scopedExceptions(brand.id, operations, scopedIntegrations);
    return {
      scope: { type: "operating_brand", legalEntityId: brand.legalEntityId, brandId: brand.id, environment: "demo" },
      legalEntity: clone(legalEntities.find((entity) => entity.id === brand.legalEntityId)),
      brand: clone(brand),
      goals: clone(goals.filter((goal) => goal.brandId === brand.id)),
      products: clone(products.filter((product) => product.brandId === brand.id)),
      customers: clone(brandCustomers),
      lifecycles: clone(lifecycleDefinitions.filter((lifecycle) => lifecycle.brandId === brand.id)),
      integrations: scopedIntegrations,
      externalMappings: clone(externalMappings.filter((mapping) => mapping.brandId === brand.id)),
      events: clone(this.events.filter((event) => event.brandId === brand.id)),
      ownerExceptions: scopedExceptions,
      finance,
      dataHealth: this.dataHealth(brand.id, scopedIntegrations),
      operations: clone(operations),
      generatedAt: timestamp(),
      demoMode: true
    };
  }

  recordUsage(context, input) {
    this.assertInternal(context);
    const brand = brands.find((candidate) => candidate.id === input.brandId);
    if (!brand || !context.companyIds?.includes(brand.slug)) throw this.forbidden("Usage valt buiten de toegestane brand scope");
    if (!input.idempotencyKey) throw new Error("Idempotency key ontbreekt");
    if (this.usageKeys.has(input.idempotencyKey)) return clone(this.usageKeys.get(input.idempotencyKey));
    if (!Number.isInteger(input.totalCostCents)) throw new Error("Kosten moeten integer eurocenten zijn");
    if (!['measured', 'reconciled', 'estimated', 'booked'].includes(input.quality)) throw new Error("Ongeldige financiële kwaliteit");
    if (input.adjustsEntryId && !this.usageEntries.some((entry) => entry.id === input.adjustsEntryId)) throw new Error("Correctie verwijst naar een onbekende ledgerregel");
    const entry = {
      id: crypto.randomUUID(),
      legalEntityId: brand.legalEntityId,
      brandId: brand.id,
      customerId: input.customerId || null,
      productId: input.productId || null,
      provider: input.provider,
      metric: input.metric,
      quantity: input.quantity,
      unit: input.unit,
      totalCostCents: input.totalCostCents,
      currency: input.currency || "EUR",
      quality: input.quality,
      sourceReference: input.sourceReference,
      adjustsEntryId: input.adjustsEntryId || null,
      idempotencyKey: input.idempotencyKey,
      createdAt: timestamp()
    };
    this.usageEntries.push(entry);
    this.usageKeys.set(input.idempotencyKey, entry);
    return clone(entry);
  }

  brandSummary(brand) {
    const count = customers.filter((customer) => customer.brandId === brand.id).length;
    const integrations = integrationConnections.filter((connection) => connection.brandId === brand.id);
    return {
      ...clone(brand),
      customerCount: count,
      goalCount: goals.filter((goal) => goal.brandId === brand.id).length,
      openExceptionCount: ownerExceptions.filter((exception) => exception.brandId === brand.id && exception.status === "open").length,
      connectedSourceCount: integrations.filter((connection) => connection.status === "connected").length,
      financialQuality: "unavailable"
    };
  }

  financeSnapshot(brand, entries, operations = null) {
    const measuredCostCents = entries.filter((entry) => ["measured", "reconciled", "booked"].includes(entry.quality)).reduce((total, entry) => total + entry.totalCostCents, 0);
    const finance = {
      brandId: brand.id,
      currency: "EUR",
      revenueCents: null,
      measuredCostCents,
      allocatedCostCents: null,
      marginCents: null,
      quality: entries.length ? "partial" : "unavailable",
      reason: entries.length ? "Revenuebron ontbreekt; alleen kosten zijn gedeeltelijk beschikbaar." : "Geen gekoppelde financiële bron of ledgerregels.",
      entryCount: entries.length
    };
    if (brand.id === "brand_autoreviews" && operations?.status === "connected") {
      return { ...finance, ...clone(operations.snapshot.finance), entryCount: entries.length };
    }
    return finance;
  }

  scopedExceptions(brandId, operations, connections) {
    const exceptions = clone(ownerExceptions.filter((exception) => exception.brandId === brandId));
    if (brandId !== "brand_autoreviews" || operations?.status !== "connected" || !exceptions.length) return exceptions;
    const blocked = connections.filter((connection) => connection.reconciliationStatus.startsWith("blocked")).map((connection) => connection.provider);
    exceptions[0].title = blocked.length ? `${blocked.length} AutoReviews-bronnen blokkeren betrouwbare unit economics` : "AutoReviews-bronnen wachten op eerste reconciliation";
    exceptions[0].consequence = blocked.length ? `${blocked.join(", ")} zijn niet operationeel gekoppeld; omzet, kosten en marge blijven onvolledig.` : "Bronnen zijn geconfigureerd maar nog niet gereconcilieerd tegen de OS-ledger.";
    exceptions[0].nextAction = blocked.length ? "Configureer de ontbrekende sandboxverbindingen en valideer externe IDs." : "Voer de eerste reconciliation uit en leg verschillen append-only vast.";
    return exceptions;
  }

  scopedIntegrations(brandId, operations) {
    const connections = clone(integrationConnections.filter((connection) => connection.brandId === brandId));
    if (brandId !== "brand_autoreviews" || operations?.status !== "connected") return connections;
    const aliases = { stripe: "stripe", ghl: "ghl_calendar", calendar: "ghl_calendar", whatsapp: "whatsapp" };
    for (const connection of connections) {
      const source = operations.snapshot.sources.find((item) => item.provider === aliases[connection.provider]);
      if (!source) continue;
      connection.status = source.configured ? "configured" : "not_connected";
      connection.health = source.configured ? "configured" : "unknown";
      connection.lastSuccessfulSyncAt = operations.snapshot.generatedAt;
      connection.reconciliationStatus = source.configured ? "awaiting_first_reconciliation" : "blocked_missing_connection";
    }
    return connections;
  }

  dataHealth(brandId, scopedConnections = null) {
    const connections = scopedConnections || (brandId ? integrationConnections.filter((connection) => connection.brandId === brandId) : integrationConnections);
    return {
      totalSources: connections.length,
      healthy: connections.filter((connection) => connection.health === "healthy").length,
      stale: connections.filter((connection) => connection.health === "stale").length,
      blocked: connections.filter((connection) => connection.reconciliationStatus.startsWith("blocked")).length,
      conflicts: connections.filter((connection) => connection.reconciliationStatus === "conflict").length,
      quality: connections.length ? "incomplete" : "not_configured"
    };
  }

  assertInternal(context) {
    if (context?.role !== "internal") throw this.forbidden("Alleen interne operators hebben toegang tot de OS control plane");
  }

  forbidden(message) {
    return Object.assign(new Error(message), { status: 403 });
  }

  notFound(message) {
    return Object.assign(new Error(message), { status: 404 });
  }
}

export const osCatalog = Object.freeze({ legalEntities: clone(legalEntities), brands: clone(brands) });
