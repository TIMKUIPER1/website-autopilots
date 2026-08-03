import { fetchAutoreviewsSnapshot } from "./autoreviews.js";
import { connectorUrl, resolveReadOnlyConnectorBase } from "./connector-policy.js";

const defaults = Object.freeze({
  autoplanner: "http://127.0.0.1:3000/api",
  roofplanner: "http://127.0.0.1:3001"
});

export async function fetchProductHealth(slug, options = {}) {
  const observedAt = new Date().toISOString();
  if (slug === "autopilots") return envelope(slug, "healthy", null, observedAt, {
    service: "autopilots-platform",
    checks: { application: "ok", durableSessions: "ok", externalWrites: "disabled" }
  });
  if (slug === "autoreviews") {
    const result = await fetchAutoreviewsSnapshot(options.autoreviews || {});
    return envelope(slug, result.status === "connected" ? "healthy" : "unavailable",
      result.errorCode ? normalizeCode("AUTOREVIEWS", result.errorCode) : null,
      observedAt,
      { contract: result.snapshot?.schemaVersion || "autoreviews.os-snapshot.v1", dataClassification: result.snapshot?.dataClassification || "aggregate_no_pii" }
    );
  }
  if (slug === "autoplanner") return probeAutoplanner({ ...options, observedAt });
  if (slug === "roofplanner") return probeRoofplanner({ ...options, observedAt });
  const error = new Error("Operating brand niet gevonden");
  error.status = 404;
  throw error;
}

export async function fetchPortfolioHealth(slugs, options = {}) {
  const allowed = [...new Set(Array.isArray(slugs) ? slugs.map(String) : [])];
  const probe = options.probe || ((slug) => fetchProductHealth(slug, options));
  const products = await Promise.all(allowed.map((slug) => probe(slug)));
  const counts = products.reduce((summary, product) => {
    summary[product.status] = (summary[product.status] || 0) + 1;
    return summary;
  }, { healthy: 0, degraded: 0, unavailable: 0 });
  return {
    contract: "autopilots.portfolio-health.v1",
    observedAt: new Date().toISOString(),
    sourceQuality: "live_readonly_probe",
    status: counts.degraded || counts.unavailable ? "attention_required" : "healthy",
    counts,
    products,
    externalWrites: false
  };
}

async function probeAutoplanner({
  baseUrl = process.env.AUTOPLANNER_API_URL || defaults.autoplanner,
  allowedOrigin = process.env.AUTOPLANNER_ALLOWED_ORIGIN || "",
  fetchImpl = fetch,
  timeoutMs = 1800,
  observedAt
} = {}) {
  let safeBaseUrl;
  try {
    safeBaseUrl = resolveReadOnlyConnectorBase(baseUrl, { allowedOrigin });
  } catch {
    return envelope("autoplanner", "unavailable", "AUTOPLANNER_DESTINATION_BLOCKED", observedAt, {});
  }
  const [health, readiness] = await Promise.all([
    safeJson(connectorUrl(safeBaseUrl, "/health"), fetchImpl, timeoutMs),
    safeJson(connectorUrl(safeBaseUrl, "/health/ready"), fetchImpl, timeoutMs)
  ]);
  if (!health.ok) {
    return envelope("autoplanner", "unavailable", autoplannerFailureCode("health", health), observedAt, {
      healthHttpStatus: health.status
    });
  }
  if (!readiness.ok) {
    return envelope("autoplanner", "degraded", autoplannerFailureCode("readiness", readiness), observedAt, {
      health: health.data,
      readyHttpStatus: readiness.status
    });
  }
  const checks = readiness.data?.checks || health.data?.checks || {};
  const missing = Object.entries(checks).filter(([, value]) => value?.status === "missing").map(([key]) => key);
  if (readiness.data?.ready !== true || missing.length) {
    return envelope("autoplanner", "degraded", "AUTOPLANNER_DEPENDENCIES_MISSING", observedAt, {
      environment: readiness.data?.environment || health.data?.environment || null,
      checks,
      missingDependencies: missing
    });
  }
  return envelope("autoplanner", "healthy", null, observedAt, { environment: readiness.data.environment, checks });
}

async function probeRoofplanner({
  baseUrl = process.env.ROOFPLANNER_API_URL || defaults.roofplanner,
  allowedOrigin = process.env.ROOFPLANNER_ALLOWED_ORIGIN || "",
  fetchImpl = fetch,
  timeoutMs = 1800,
  observedAt
} = {}) {
  let safeBaseUrl;
  try {
    safeBaseUrl = resolveReadOnlyConnectorBase(baseUrl, { allowedOrigin });
  } catch {
    return envelope("roofplanner", "unavailable", "ROOFPLANNER_DESTINATION_BLOCKED", observedAt, {});
  }
  const [health, readiness] = await Promise.all([
    safeJson(connectorUrl(safeBaseUrl, "/health"), fetchImpl, timeoutMs),
    safeJson(connectorUrl(safeBaseUrl, "/ready"), fetchImpl, timeoutMs)
  ]);
  if (!health.ok) return envelope("roofplanner", "unavailable", "ROOFPLANNER_API_UNREACHABLE", observedAt, { healthHttpStatus: health.status });
  if (!readiness.ok || readiness.data?.ready === false) {
    return envelope("roofplanner", "degraded", "ROOFPLANNER_DEPENDENCIES_NOT_READY", observedAt, { health: health.data, readiness: readiness.data || null });
  }
  return envelope("roofplanner", "healthy", null, observedAt, { health: health.data, readiness: readiness.data });
}

async function safeJson(url, fetchImpl, timeoutMs) {
  try {
    const response = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs), headers: { "x-autopilots-os-client": "autopilots-platform" } });
    if (!response.ok) return { ok: false, status: response.status, errorCode: `HTTP_${response.status}` };
    const text = await response.text();
    if (text.length > 100000) return { ok: false, status: response.status, errorCode: "RESPONSE_TOO_LARGE" };
    try {
      return { ok: true, status: response.status, data: JSON.parse(text) };
    } catch {
      return { ok: false, status: response.status, errorCode: "INVALID_JSON" };
    }
  } catch (error) {
    return { ok: false, status: null, errorCode: error?.name === "TimeoutError" ? "TIMEOUT" : "UNREACHABLE" };
  }
}

function envelope(product, status, errorCode, observedAt, details) {
  return {
    contract: "autopilots.product-health.v1",
    product,
    environment: "sandbox",
    observedAt,
    sourceQuality: "live_readonly_probe",
    status,
    errorCode,
    details,
    externalWrites: false
  };
}

function normalizeCode(prefix, code) {
  return `${prefix}_${String(code).replace(/[^a-z0-9]+/gi, "_").toUpperCase()}`;
}

function autoplannerFailureCode(endpoint, result) {
  if (result.status === 401 || result.status === 403) return "AUTOPLANNER_API_ACCESS_DENIED";
  if (["INVALID_JSON", "RESPONSE_TOO_LARGE"].includes(result.errorCode)) {
    return endpoint === "health"
      ? "AUTOPLANNER_HEALTH_CONTRACT_INVALID"
      : "AUTOPLANNER_READINESS_CONTRACT_INVALID";
  }
  return endpoint === "health"
    ? "AUTOPLANNER_API_UNREACHABLE"
    : "AUTOPLANNER_READINESS_UNAVAILABLE";
}
