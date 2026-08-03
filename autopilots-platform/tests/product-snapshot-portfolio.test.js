import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { PRODUCT_AGGREGATE_ALLOWLISTS } from "../src/adapters/product-snapshot.js";
import { fetchProductSnapshotPortfolio } from "../src/adapters/product-snapshot-portfolio.js";

const now = Date.parse("2026-08-04T15:00:00.000Z");

function snapshot(product) {
  return {
    contract: "autopilots.product-snapshot.v1", product, environment: "sandbox",
    observedAt: "2026-08-04T14:55:00.000Z", sourceQuality: "product_aggregate",
    dataClassification: "aggregate_no_pii",
    aggregates: Object.fromEntries(PRODUCT_AGGREGATE_ALLOWLISTS[product].map((key) => [key,
      key.includes("_by_") || key.endsWith("_health") || key === "usage_totals"
        ? { active: { value: 8, sampleSize: 8, suppressed: false } }
        : { value: 8, sampleSize: 8, suppressed: false }
    ])),
    privacy: {
      minimumGroupSize: 5, smallCellsSuppressed: true, containsPersonalData: false,
      containsRowLevelRecords: false, containsMessageContent: false, containsSecrets: false,
      containsProviderTokens: false, containsPaymentInstrumentData: false
    },
    externalWrites: false
  };
}

test("portfolio stays fail-closed and makes no requests without dedicated secrets", async () => {
  let calls = 0;
  const result = await fetchProductSnapshotPortfolio(
    ["autopilots", "autoreviews", "autoplanner", "roofplanner", "unknown"],
    { env: {}, now, fetchImpl: async () => { calls += 1; } }
  );
  assert.equal(calls, 0);
  assert.deepEqual(result.summary, { products: 3, connected: 0, unavailable: 3 });
  assert.deepEqual(result.products.map((item) => item.errorCode), [
    "CONNECTOR_NOT_CONFIGURED", "CONNECTOR_NOT_CONFIGURED", "CONNECTOR_NOT_CONFIGURED"
  ]);
  assert.equal(result.endpointValuesExposed, false);
  assert.equal(result.credentialValuesExposed, false);
  assert.equal(result.externalWritesEnabled, false);
});

test("portfolio reads all authorized products concurrently with exact GET-only contracts", async () => {
  const requests = [];
  let release;
  const barrier = new Promise((resolve) => { release = resolve; });
  const env = {};
  for (const product of ["AUTOREVIEWS", "AUTOPLANNER", "ROOFPLANNER"]) {
    env[`${product}_CONTROL_PLANE_SNAPSHOT_URL`] = `https://${product.toLowerCase()}.example`;
    env[`${product}_ALLOWED_ORIGIN`] = `https://${product.toLowerCase()}.example`;
    env[`${product}_CONTROL_PLANE_SNAPSHOT_SECRET`] = product.toLowerCase().padEnd(32, "s");
  }
  const promise = fetchProductSnapshotPortfolio(["roofplanner", "autoplanner", "autoreviews"], {
    env, now, fetchImpl: async (url, options) => {
      requests.push({ url, options });
      await barrier;
      const product = new URL(url).hostname.split(".")[0];
      return { ok: true, status: 200, text: async () => JSON.stringify(snapshot(product)) };
    }
  });
  await new Promise((resolve) => setImmediate(resolve));
  assert.equal(requests.length, 3, "all product reads start before any response completes");
  release();
  const result = await promise;
  assert.deepEqual(result.products.map((item) => item.product), ["autoreviews", "autoplanner", "roofplanner"]);
  assert.equal(result.summary.connected, 3);
  assert.ok(requests.every((request) => request.options.method === "GET"));
  assert.ok(requests.every((request) => request.url.endsWith("/api/internal/autopilots-os/snapshot")));
  for (const secret of Object.values(env).filter((value) => value.length >= 32)) {
    assert.equal(JSON.stringify(result).includes(secret), false);
  }
});

test("one invalid product is isolated without hiding a valid product", async () => {
  const secret = "s".repeat(32);
  const env = {
    AUTOREVIEWS_CONTROL_PLANE_SNAPSHOT_SECRET: secret,
    AUTOPLANNER_CONTROL_PLANE_SNAPSHOT_SECRET: secret
  };
  const result = await fetchProductSnapshotPortfolio(["autoreviews", "autoplanner"], {
    env, now, fetchImpl: async (url) => {
      const product = url.includes("43117") ? "autoreviews" : "autoplanner";
      const payload = snapshot(product);
      if (product === "autoreviews") payload.aggregates.customer_email = { value: 8, sampleSize: 8, suppressed: false };
      return { ok: true, status: 200, text: async () => JSON.stringify(payload) };
    }
  });
  assert.deepEqual(result.summary, { products: 2, connected: 1, unavailable: 1 });
  assert.equal(result.products[0].errorCode, "AGGREGATE_NOT_ALLOWED");
  assert.equal(result.products[1].status, "connected");
});

test("snapshot portfolio route is internal and read-only", async () => {
  const server = await readFile(new URL("../src/server.js", import.meta.url), "utf8");
  assert.match(server, /url\.pathname === "\/api\/v1\/data-planes\/snapshots" && req\.method === "GET"[\s\S]*requireSession\(req\)[\s\S]*requireInternal\(session\)[\s\S]*fetchProductSnapshotPortfolio\(session\.companyIds\)/);
  assert.doesNotMatch(server, /url\.pathname === "\/api\/v1\/data-planes\/snapshots" && req\.method === "POST"/);
});
