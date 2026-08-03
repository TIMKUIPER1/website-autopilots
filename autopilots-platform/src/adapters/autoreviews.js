import { connectorUrl, resolveReadOnlyConnectorBase } from "./connector-policy.js";

const defaultBaseUrl = "http://127.0.0.1:43117";

export async function fetchAutoreviewsSnapshot({
  baseUrl = process.env.AUTOREVIEWS_API_URL || defaultBaseUrl,
  allowedOrigin = process.env.AUTOREVIEWS_ALLOWED_ORIGIN || "",
  secret = process.env.AUTOREVIEWS_OS_SYNC_SECRET || "",
  fetchImpl = fetch,
  timeoutMs = 1800
} = {}) {
  const checkedAt = new Date().toISOString();
  try {
    const safeBaseUrl = resolveReadOnlyConnectorBase(baseUrl, { allowedOrigin });
    const headers = { "x-autopilots-os-client": "autopilots-platform" };
    if (secret) headers["x-autopilots-os-secret"] = secret;
    const response = await fetchImpl(connectorUrl(safeBaseUrl, "/api/internal/autopilots-os/snapshot"), {
      headers,
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return result("degraded", `http_${response.status}`, checkedAt, null);
    const text = await response.text();
    if (text.length > 100000) return result("degraded", "response_too_large", checkedAt, null);
    let snapshot;
    try {
      snapshot = JSON.parse(text);
    } catch {
      return result("degraded", "invalid_json", checkedAt, null);
    }
    if (snapshot?.schemaVersion !== "autoreviews.os-snapshot.v1" || snapshot?.dataClassification !== "aggregate_no_pii") {
      return result("degraded", "invalid_contract", checkedAt, null);
    }
    return result("connected", null, checkedAt, snapshot);
  } catch (error) {
    const errorCode = error?.code === "CONNECTOR_DESTINATION_BLOCKED"
      ? "destination_blocked"
      : error?.name === "TimeoutError" ? "timeout" : "unreachable";
    return result("degraded", errorCode, checkedAt, null);
  }
}

function result(status, errorCode, checkedAt, snapshot) {
  return { status, errorCode, checkedAt, source: "configured_readonly_endpoint", snapshot };
}
