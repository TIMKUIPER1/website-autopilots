import { fetchProductSnapshot } from "./product-snapshot.js";

const CONTRACT = "autopilots.product-snapshot-portfolio.v1";
const PRODUCTS = Object.freeze(["autoreviews", "autoplanner", "roofplanner"]);
const DEFINITIONS = Object.freeze({
  autoreviews: Object.freeze({
    snapshotBaseKey: "AUTOREVIEWS_CONTROL_PLANE_SNAPSHOT_URL",
    baseKey: "AUTOREVIEWS_API_URL",
    originKey: "AUTOREVIEWS_ALLOWED_ORIGIN",
    secretKey: "AUTOREVIEWS_CONTROL_PLANE_SNAPSHOT_SECRET",
    defaultBase: "http://127.0.0.1:43117"
  }),
  autoplanner: Object.freeze({
    snapshotBaseKey: "AUTOPLANNER_CONTROL_PLANE_SNAPSHOT_URL",
    baseKey: "AUTOPLANNER_API_URL",
    originKey: "AUTOPLANNER_ALLOWED_ORIGIN",
    secretKey: "AUTOPLANNER_CONTROL_PLANE_SNAPSHOT_SECRET",
    defaultBase: "http://127.0.0.1:3000"
  }),
  roofplanner: Object.freeze({
    snapshotBaseKey: "ROOFPLANNER_CONTROL_PLANE_SNAPSHOT_URL",
    baseKey: "ROOFPLANNER_API_URL",
    originKey: "ROOFPLANNER_ALLOWED_ORIGIN",
    secretKey: "ROOFPLANNER_CONTROL_PLANE_SNAPSHOT_SECRET",
    defaultBase: "http://127.0.0.1:3001"
  })
});

export async function fetchProductSnapshotPortfolio(slugs, {
  env = process.env,
  fetchImpl = fetch,
  now = Date.now(),
  timeoutMs = 1800,
  maximumAgeSeconds = 900
} = {}) {
  const allowed = new Set(Array.isArray(slugs) ? slugs.map(String) : []);
  const selected = PRODUCTS.filter((product) => allowed.has(product));
  const products = await Promise.all(selected.map(async (product) => {
    const result = await fetchConfiguredProductSnapshot(product, {
      env, fetchImpl, now, timeoutMs, maximumAgeSeconds
    });
    if (result.status !== "connected") {
      return {
        product,
        status: "unavailable",
        errorCode: result.errorCode,
        observedAt: null,
        environment: null,
        sourceQuality: null,
        aggregates: null,
        externalWrites: false
      };
    }
    return {
      product,
      status: "connected",
      errorCode: null,
      observedAt: result.snapshot.observedAt,
      environment: result.snapshot.environment,
      sourceQuality: result.snapshot.sourceQuality,
      aggregates: result.snapshot.aggregates,
      externalWrites: false
    };
  }));
  const connected = products.filter((product) => product.status === "connected").length;
  return {
    contract: CONTRACT,
    sourceQuality: "live_product_aggregate_or_fail_closed",
    products,
    summary: { products: products.length, connected, unavailable: products.length - connected },
    containsPersonalData: false,
    endpointValuesExposed: false,
    credentialValuesExposed: false,
    providerAuthorizationEnabled: false,
    externalWritesEnabled: false,
    generatedAt: new Date(now).toISOString()
  };
}

export async function fetchConfiguredProductSnapshot(product, {
  env = process.env,
  fetchImpl = fetch,
  now = Date.now(),
  timeoutMs = 1800,
  maximumAgeSeconds = 900
} = {}) {
  const definition = DEFINITIONS[product];
  if (!definition) return { status: "unavailable", errorCode: "PRODUCT_NOT_SUPPORTED", snapshot: null, externalWrites: false };
  return fetchProductSnapshot(product, {
    baseUrl: clean(env[definition.snapshotBaseKey]) || clean(env[definition.baseKey]) || definition.defaultBase,
    allowedOrigin: clean(env[definition.originKey]),
    secret: clean(env[definition.secretKey]),
    fetchImpl,
    now,
    timeoutMs,
    maximumAgeSeconds
  });
}

function clean(value) {
  return String(value || "").trim();
}
