import assert from "node:assert/strict";
import test from "node:test";
import { OperatingSystemStore } from "../src/os-store.js";

const internal = {
  id: "usr_owner",
  role: "internal",
  companyIds: ["autopilots", "autoreviews", "autoplanner", "autowebsites", "autosupport"]
};

test("OS model scheidt legal entity, operating brand en customer account", () => {
  const store = new OperatingSystemStore();
  const twin = store.brandTwin(internal, "autoreviews");
  assert.equal(twin.scope.type, "operating_brand");
  assert.equal(twin.legalEntity.id, "le_autopilots_ai_agency_llc");
  assert.equal(twin.brand.id, "brand_autoreviews");
  assert.deepEqual(twin.customers, []);
  assert.equal(twin.finance.revenueCents, null);
  assert.equal(twin.finance.quality, "unavailable");
  assert.equal(twin.integrations.every((connection) => connection.reconciliationStatus === "blocked_missing_connection"), true);
});

test("brand scope wordt server-side afgedwongen", () => {
  const store = new OperatingSystemStore();
  assert.throws(
    () => store.brandTwin({ ...internal, companyIds: ["autopilots"] }, "autoreviews"),
    (error) => error.status === 403
  );
  assert.throws(
    () => store.portfolio({ role: "customer", companyIds: ["autopilots"] }),
    (error) => error.status === 403
  );
});

test("usage ledger is idempotent en correcties blijven gekoppeld", () => {
  const store = new OperatingSystemStore();
  const input = {
    brandId: "brand_autoreviews",
    provider: "elevenlabs",
    metric: "voice_minutes",
    quantity: 10,
    unit: "minute",
    totalCostCents: 120,
    quality: "measured",
    sourceReference: "usage_demo_1",
    idempotencyKey: "usage-key-1"
  };
  const first = store.recordUsage(internal, input);
  const replay = store.recordUsage(internal, input);
  assert.equal(first.id, replay.id);

  const adjustment = store.recordUsage(internal, {
    ...input,
    totalCostCents: -20,
    sourceReference: "adjustment_demo_1",
    idempotencyKey: "usage-key-2",
    adjustsEntryId: first.id
  });
  assert.equal(adjustment.adjustsEntryId, first.id);
  assert.equal(store.brandTwin(internal, "autoreviews").finance.measuredCostCents, 100);
});

test("AutoReviews runtime snapshot verrijkt de twin zonder financiële schijnzekerheid", () => {
  const store = new OperatingSystemStore();
  const operations = {
    status: "connected",
    snapshot: {
      customerPlatform: { organizations: 3 },
      sources: [
        { provider: "stripe", configured: false },
        { provider: "ghl_calendar", configured: true },
        { provider: "whatsapp", configured: false }
      ],
      generatedAt: "2026-07-21T12:00:00.000Z",
      finance: { revenueCents: null, measuredCostCents: null, marginCents: null, quality: "unavailable", reason: "Reconciliation ontbreekt" }
    }
  };
  const twin = store.brandTwin(internal, "autoreviews", operations);
  assert.equal(twin.operations.status, "connected");
  assert.equal(twin.finance.measuredCostCents, null);
  assert.equal(twin.integrations.find((item) => item.provider === "ghl").reconciliationStatus, "awaiting_first_reconciliation");
  assert.match(twin.ownerExceptions[0].title, /2 AutoReviews-bronnen/);
});
