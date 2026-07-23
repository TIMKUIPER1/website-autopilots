const defaultBaseUrl = "http://127.0.0.1:43117";

export async function fetchAutoreviewsSnapshot({
  baseUrl = process.env.AUTOREVIEWS_API_URL || defaultBaseUrl,
  secret = process.env.AUTOREVIEWS_OS_SYNC_SECRET || "",
  fetchImpl = fetch,
  timeoutMs = 1800
} = {}) {
  const checkedAt = new Date().toISOString();
  try {
    const headers = { "x-autopilots-os-client": "autopilots-platform" };
    if (secret) headers["x-autopilots-os-secret"] = secret;
    const response = await fetchImpl(`${String(baseUrl).replace(/\/$/, "")}/api/internal/autopilots-os/snapshot`, {
      headers,
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response.ok) return { status: "degraded", errorCode: `http_${response.status}`, checkedAt, source: baseUrl, snapshot: null };
    const snapshot = await response.json();
    if (snapshot?.schemaVersion !== "autoreviews.os-snapshot.v1" || snapshot?.dataClassification !== "aggregate_no_pii") {
      return { status: "degraded", errorCode: "invalid_contract", checkedAt, source: baseUrl, snapshot: null };
    }
    return { status: "connected", errorCode: null, checkedAt, source: baseUrl, snapshot };
  } catch (error) {
    const errorCode = error?.name === "TimeoutError" ? "timeout" : "unreachable";
    return { status: "degraded", errorCode, checkedAt, source: baseUrl, snapshot: null };
  }
}
