import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PRODUCT_AGGREGATE_ALLOWLISTS } from "../src/adapters/product-snapshot.js";
import { deriveProductSnapshotEvidence, snapshotEvidenceIdempotencyKey } from "../src/adapters/product-snapshot-evidence.js";
import { SupabaseControlPlaneRepository } from "../src/persistence/supabase-control-plane.js";

const now = Date.parse("2026-08-04T17:00:00.000Z");
const profileId = "40000000-0000-4000-8000-000000000001";
const legalEntityId = "10000000-0000-4000-8000-000000000001";
const gates = ["contract_probe", "privacy_probe", "freshness_probe"];

function snapshot() {
  return {
    contract: "autopilots.product-snapshot.v1", product: "autoplanner", environment: "sandbox",
    observedAt: "2026-08-04T16:55:00.000Z", sourceQuality: "product_aggregate",
    dataClassification: "aggregate_no_pii",
    aggregates: Object.fromEntries(PRODUCT_AGGREGATE_ALLOWLISTS.autoplanner.map((key) => [key,
      key.includes("_by_") || key.endsWith("_health") || key === "usage_totals"
        ? { active: { value: 9, sampleSize: 9, suppressed: false } }
        : { value: 9, sampleSize: 9, suppressed: false }
    ])),
    privacy: {
      minimumGroupSize: 5, smallCellsSuppressed: true, containsPersonalData: false,
      containsRowLevelRecords: false, containsMessageContent: false, containsSecrets: false,
      containsProviderTokens: false, containsPaymentInstrumentData: false
    }, externalWrites: false
  };
}

function recorded(candidate, replayed = false) {
  return {
    contract: "autopilots.product-snapshot-evidence-recorded.v1", brand: candidate.product,
    records: gates.map((gateKey, index) => ({
      contract: "autopilots.product-connection-evidence-recorded.v1",
      evidenceId: `96000000-0000-4000-8000-00000000000${index + 1}`,
      brand: candidate.product, gateKey, result: "passed", riskClass: "R1",
      dataConnectionEnabled: false, providerAuthorizationEnabled: false,
      externalWritesEnabled: false, replayed
    })),
    riskClass: "R1", atomic: true, dataConnectionEnabled: false,
    providerAuthorizationEnabled: false, externalWritesEnabled: false, replayed
  };
}

test("a validated snapshot derives exactly three deterministic domain-separated hashes", () => {
  const first = deriveProductSnapshotEvidence("autoplanner", snapshot(), { now });
  const reordered = snapshot();
  reordered.aggregates = Object.fromEntries(Object.entries(reordered.aggregates).reverse());
  const second = deriveProductSnapshotEvidence("autoplanner", reordered, { now });
  assert.deepEqual(first.evidence.map((item) => item.gateKey), gates);
  assert.deepEqual(first.evidence, second.evidence);
  assert.equal(new Set(first.evidence.map((item) => item.evidenceSha256)).size, 3);
  assert.equal(first.containsRawPayload, false);
  assert.equal(JSON.stringify(first).includes("aggregates"), false);
  assert.equal(first.externalWritesEnabled, false);
});

test("unsafe, stale and changed snapshots cannot reuse the same proof", () => {
  const base = deriveProductSnapshotEvidence("autoplanner", snapshot(), { now });
  const changed = snapshot();
  changed.aggregates.organizations_count.value = 10;
  const changedEvidence = deriveProductSnapshotEvidence("autoplanner", changed, { now });
  assert.notEqual(base.evidence[0].evidenceSha256, changedEvidence.evidence[0].evidenceSha256);
  const unsafe = snapshot();
  unsafe.privacy.containsPersonalData = true;
  assert.throws(() => deriveProductSnapshotEvidence("autoplanner", unsafe, { now }),
    (error) => error.code === "PRIVACY_GUARD_FAILED");
  const stale = snapshot();
  stale.observedAt = "2026-08-04T16:44:59.000Z";
  assert.throws(() => deriveProductSnapshotEvidence("autoplanner", stale, { now }),
    (error) => error.code === "SNAPSHOT_STALE");
});

test("request idempotency becomes a bounded opaque database key", () => {
  const key = snapshotEvidenceIdempotencyKey("ui:verification:request:123");
  assert.match(key, /^snapshot:[0-9a-f]{32}$/);
  assert.equal(key, snapshotEvidenceIdempotencyKey("ui:verification:request:123"));
  assert.notEqual(key, snapshotEvidenceIdempotencyKey("ui:verification:request:124"));
  assert.throws(() => snapshotEvidenceIdempotencyKey("short"),
    (error) => error.code === "IDEMPOTENCY_KEY_INVALID");
});

test("repository sends only three hashes and validates the atomic no-effect response", async () => {
  const candidate = deriveProductSnapshotEvidence("autoplanner", snapshot(), { now });
  let call;
  const repository = new SupabaseControlPlaneRepository({ client: { rpc: async (name, args) => {
    call = { name, args };
    return { data: recorded(candidate), error: null };
  } } });
  const result = await repository.recordProductSnapshotEvidence(
    profileId, legalEntityId, candidate, snapshotEvidenceIdempotencyKey("ui:verification:request:123")
  );
  assert.equal(result.atomic, true);
  assert.equal(call.name, "autopilots_record_product_snapshot_evidence");
  assert.deepEqual(Object.keys(call.args).sort(), [
    "p_brand_slug", "p_contract_sha256", "p_freshness_sha256", "p_idempotency_key",
    "p_legal_entity_id", "p_observed_at", "p_privacy_sha256", "p_profile_id"
  ]);
  assert.equal(JSON.stringify(call.args).includes("aggregates"), false);
  assert.equal(JSON.stringify(call.args).includes("containsPersonalData"), false);
});

test("repository rejects forged candidates and partial or activating responses", async () => {
  const candidate = deriveProductSnapshotEvidence("autoplanner", snapshot(), { now });
  const key = snapshotEvidenceIdempotencyKey("ui:verification:request:123");
  const forged = structuredClone(candidate);
  forged.evidence[0].gateKey = "current_human_approval";
  const unused = new SupabaseControlPlaneRepository({ client: { rpc: async () => { throw new Error("must not call"); } } });
  await assert.rejects(() => unused.recordProductSnapshotEvidence(profileId, legalEntityId, forged, key),
    (error) => error.status === 400);
  for (const mutate of [
    (value) => { value.records.pop(); },
    (value) => { value.externalWritesEnabled = true; },
    (value) => { value.records[0].gateKey = "current_human_approval"; }
  ]) {
    const response = recorded(candidate);
    mutate(response);
    const repository = new SupabaseControlPlaneRepository({ client: { rpc: async () => ({ data: response, error: null }) } });
    await assert.rejects(() => repository.recordProductSnapshotEvidence(profileId, legalEntityId, candidate, key),
      (error) => error.status === 503);
  }
});

test("server verification is managed, MFA-gated, scoped and accepts no browser evidence", async () => {
  const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");
  assert.match(server, /snapshots\/brands\/[\s\S]*endsWith\("\/verify"\)[\s\S]*req\.method === "POST"/);
  assert.match(server, /requireInternal\(session\)[\s\S]*requireManagedMfa\(session\)[\s\S]*requireCompany\(session, slug\)/);
  assert.match(server, /Productsnapshotverificatie accepteert geen browserpayload/);
  assert.match(server, /fetchConfiguredProductSnapshot\(slug\)[\s\S]*deriveProductSnapshotEvidence\(slug, result\.snapshot\)[\s\S]*recordProductSnapshotEvidence/);
  assert.doesNotMatch(server, /deriveProductSnapshotEvidence\(slug, body/);
});

test("database wrapper records contract privacy and freshness atomically", async () => {
  const migration = await readFile(new URL(
    "../supabase/migrations/20260804160000_atomic_product_snapshot_evidence.sql",
    import.meta.url
  ), "utf8");
  assert.match(migration, /^begin;[\s\S]*commit;\s*$/);
  assert.equal((migration.match(/autopilots_record_product_connection_evidence\(/g) || []).length, 3);
  for (const gate of gates) assert.match(migration, new RegExp(`'${gate}', 'passed'`));
  assert.match(migration, /jsonb_build_array\(v_contract, v_privacy, v_freshness\)/);
  assert.match(migration, /'atomic', true/);
  assert.match(migration, /'dataConnectionEnabled', false[\s\S]*'providerAuthorizationEnabled', false[\s\S]*'externalWritesEnabled', false/);
});
