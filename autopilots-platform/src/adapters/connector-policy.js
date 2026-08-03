const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function resolveReadOnlyConnectorBase(baseUrl, { allowedOrigin = "" } = {}) {
  let parsed;
  try {
    parsed = new URL(String(baseUrl));
  } catch {
    throw connectorPolicyError();
  }
  if (!new Set(["http:", "https:"]).has(parsed.protocol)) throw connectorPolicyError();
  if (parsed.username || parsed.password || parsed.search || parsed.hash) throw connectorPolicyError();

  const loopback = LOOPBACK_HOSTS.has(parsed.hostname.toLowerCase());
  if (!loopback && parsed.protocol !== "https:") throw connectorPolicyError();
  if (!loopback) {
    const normalizedAllowedOrigin = normalizeAllowedOrigin(allowedOrigin);
    if (!normalizedAllowedOrigin || parsed.origin !== normalizedAllowedOrigin) throw connectorPolicyError();
  }
  return parsed.toString().replace(/\/+$/, "");
}

export function connectorUrl(baseUrl, path) {
  return `${String(baseUrl).replace(/\/+$/, "")}/${String(path).replace(/^\/+/, "")}`;
}

function normalizeAllowedOrigin(value) {
  if (!value) return "";
  try {
    const parsed = new URL(String(value));
    if (parsed.username || parsed.password || parsed.pathname !== "/" || parsed.search || parsed.hash) return "";
    return parsed.origin;
  } catch {
    return "";
  }
}

function connectorPolicyError() {
  return Object.assign(new Error("Connectorbestemming is niet toegestaan."), { code: "CONNECTOR_DESTINATION_BLOCKED" });
}
