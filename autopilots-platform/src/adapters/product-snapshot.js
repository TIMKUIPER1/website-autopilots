import { connectorUrl, resolveReadOnlyConnectorBase } from "./connector-policy.js";

const CONTRACT = "autopilots.product-snapshot.v1";
const CLASSIFICATION = "aggregate_no_pii";
const MINIMUM_GROUP_SIZE = 5;
const MAX_SEGMENTS_PER_AGGREGATE = 100;

export const PRODUCT_AGGREGATE_ALLOWLISTS = Object.freeze({
  autoreviews: Object.freeze([
    "organizations_count", "reviews_requested_count", "reviews_completed_count",
    "average_rating", "failed_deliveries_count", "open_incidents_count", "usage_totals"
  ]),
  autoplanner: Object.freeze([
    "organizations_count", "leads_by_status", "appointments_by_status",
    "conversations_by_state", "job_failures_count", "integration_health", "usage_totals"
  ]),
  roofplanner: Object.freeze([
    "organizations_count", "trial_accounts_by_state", "activation_gates_by_state",
    "appointments_by_status", "provider_failures_count", "entitlement_counts", "usage_totals"
  ])
});

const TOP_LEVEL_KEYS = new Set([
  "contract", "product", "environment", "observedAt", "sourceQuality",
  "dataClassification", "aggregates", "privacy", "externalWrites"
]);
const PRIVACY_KEYS = new Set([
  "minimumGroupSize", "smallCellsSuppressed", "containsPersonalData",
  "containsRowLevelRecords", "containsMessageContent", "containsSecrets",
  "containsProviderTokens", "containsPaymentInstrumentData"
]);
const CELL_KEYS = new Set(["value", "sampleSize", "suppressed"]);
const SOURCE_QUALITIES = new Set(["product_aggregate", "provider_verified_aggregate"]);
const ENVIRONMENTS = new Set(["production", "staging", "sandbox"]);
const SEGMENT_KEY = /^[a-z0-9][a-z0-9_-]{0,63}$/;

export async function fetchProductSnapshot(product, {
  baseUrl = "",
  allowedOrigin = "",
  secret = "",
  fetchImpl = fetch,
  timeoutMs = 1800,
  now = Date.now(),
  maximumAgeSeconds = 900
} = {}) {
  if (!PRODUCT_AGGREGATE_ALLOWLISTS[product]) return transportFailure("PRODUCT_NOT_SUPPORTED");
  if (typeof secret !== "string" || secret.length < 32) return transportFailure("CONNECTOR_NOT_CONFIGURED");

  let safeBaseUrl;
  try {
    safeBaseUrl = resolveReadOnlyConnectorBase(baseUrl, { allowedOrigin });
  } catch {
    return transportFailure("DESTINATION_BLOCKED");
  }

  try {
    const response = await fetchImpl(connectorUrl(safeBaseUrl, "/api/internal/autopilots-os/snapshot"), {
      method: "GET",
      headers: {
        "x-autopilots-os-client": "autopilots-platform",
        "x-autopilots-os-secret": secret
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return transportFailure(response.status === 401 || response.status === 403
      ? "ACCESS_DENIED" : `HTTP_${response.status}`);
    const text = await response.text();
    if (text.length > 100000) return transportFailure("RESPONSE_TOO_LARGE");
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return transportFailure("INVALID_JSON");
    }
    const validation = validateProductSnapshot(payload, { expectedProduct: product, now, maximumAgeSeconds });
    if (!validation.ok) return transportFailure(validation.errorCode);
    return { status: "connected", errorCode: null, snapshot: validation.snapshot, externalWrites: false };
  } catch (error) {
    return transportFailure(error?.name === "TimeoutError" ? "TIMEOUT" : "UNREACHABLE");
  }
}

export function validateProductSnapshot(payload, {
  expectedProduct,
  now = Date.now(),
  maximumAgeSeconds = 900
} = {}) {
  if (!isRecord(payload) || !exactKeys(payload, TOP_LEVEL_KEYS)) return invalid("INVALID_ENVELOPE");
  const product = String(expectedProduct || payload.product || "");
  const allowlist = PRODUCT_AGGREGATE_ALLOWLISTS[product];
  if (!allowlist || payload.product !== product) return invalid("PRODUCT_MISMATCH");
  if (payload.contract !== CONTRACT || payload.dataClassification !== CLASSIFICATION) {
    return invalid("INVALID_CONTRACT");
  }
  if (!ENVIRONMENTS.has(payload.environment) || !SOURCE_QUALITIES.has(payload.sourceQuality)) {
    return invalid("INVALID_SOURCE");
  }
  if (payload.externalWrites !== false || !validPrivacy(payload.privacy)) {
    return invalid("PRIVACY_GUARD_FAILED");
  }
  if (!validObservedAt(payload.observedAt, now, maximumAgeSeconds)) return invalid("SNAPSHOT_STALE");
  if (!isRecord(payload.aggregates)) return invalid("INVALID_AGGREGATES");

  const aggregateKeys = Object.keys(payload.aggregates);
  if (aggregateKeys.length !== allowlist.length
    || aggregateKeys.some((key) => !allowlist.includes(key))) {
    return invalid("AGGREGATE_NOT_ALLOWED");
  }
  if (aggregateKeys.some((key) => !validAggregate(payload.aggregates[key]))) {
    return invalid("INVALID_AGGREGATE_CELL");
  }

  return { ok: true, errorCode: null, snapshot: structuredClone(payload) };
}

function validPrivacy(value) {
  if (!isRecord(value) || !exactKeys(value, PRIVACY_KEYS)) return false;
  return value.minimumGroupSize === MINIMUM_GROUP_SIZE
    && value.smallCellsSuppressed === true
    && value.containsPersonalData === false
    && value.containsRowLevelRecords === false
    && value.containsMessageContent === false
    && value.containsSecrets === false
    && value.containsProviderTokens === false
    && value.containsPaymentInstrumentData === false;
}

function validObservedAt(value, now, maximumAgeSeconds) {
  if (typeof value !== "string" || !Number.isFinite(now)
    || !Number.isInteger(maximumAgeSeconds) || maximumAgeSeconds < 60 || maximumAgeSeconds > 86400) return false;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return false;
  const ageMs = now - timestamp;
  return ageMs >= -60000 && ageMs <= maximumAgeSeconds * 1000;
}

function validAggregate(value) {
  if (validCell(value)) return true;
  if (!isRecord(value)) return false;
  const segments = Object.entries(value);
  return segments.length > 0
    && segments.length <= MAX_SEGMENTS_PER_AGGREGATE
    && segments.every(([key, cell]) => SEGMENT_KEY.test(key) && validCell(cell));
}

function validCell(value) {
  if (!isRecord(value) || !exactKeys(value, CELL_KEYS)) return false;
  if (typeof value.suppressed !== "boolean") return false;
  if (value.suppressed) return value.value === null && value.sampleSize === null;
  if (!Number.isInteger(value.sampleSize) || value.sampleSize < 0 || value.sampleSize > 1000000000) return false;
  if (value.sampleSize > 0 && value.sampleSize < MINIMUM_GROUP_SIZE) return false;
  if (typeof value.value !== "number" || !Number.isFinite(value.value) || value.value < 0) return false;
  return value.sampleSize !== 0 || value.value === 0;
}

function exactKeys(value, allowed) {
  const keys = Object.keys(value);
  return keys.length === allowed.size && keys.every((key) => allowed.has(key));
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function invalid(errorCode) {
  return { ok: false, errorCode, snapshot: null };
}

function transportFailure(errorCode) {
  return { status: "unavailable", errorCode, snapshot: null, externalWrites: false };
}
