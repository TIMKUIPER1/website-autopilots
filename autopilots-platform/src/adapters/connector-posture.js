import { resolveReadOnlyConnectorBase } from "./connector-policy.js";

const definitions = Object.freeze({
  autoreviews: {
    baseKey: "AUTOREVIEWS_API_URL",
    allowedOriginKey: "AUTOREVIEWS_ALLOWED_ORIGIN",
    credentialKey: "AUTOREVIEWS_OS_SYNC_SECRET",
    defaultBase: "http://127.0.0.1:43117"
  },
  autoplanner: {
    baseKey: "AUTOPLANNER_API_URL",
    allowedOriginKey: "AUTOPLANNER_ALLOWED_ORIGIN",
    defaultBase: "http://127.0.0.1:3000/api"
  },
  roofplanner: {
    baseKey: "ROOFPLANNER_API_URL",
    allowedOriginKey: "ROOFPLANNER_ALLOWED_ORIGIN",
    defaultBase: "http://127.0.0.1:3001"
  }
});

export function connectorPosture(slugs, env = process.env) {
  const products = [...new Set(Array.isArray(slugs) ? slugs.map(String) : [])]
    .filter((slug) => slug === "autopilots" || definitions[slug]);
  return {
    contract: "autopilots.connector-posture.v1",
    sourceQuality: "runtime_configuration_presence",
    connectors: products.map((slug) => postureFor(slug, env)),
    endpointValuesExposed: false,
    credentialValuesExposed: false,
    providerAuthorizationStarted: false,
    externalWritesEnabled: false,
    generatedAt: new Date().toISOString()
  };
}

function postureFor(slug, env) {
  if (slug === "autopilots") {
    return {
      product: slug,
      configurationSource: "platform_runtime",
      destinationClass: "internal_runtime",
      policyStatus: "transport_ready",
      allowedOriginStatus: "not_required",
      credentialStatus: "not_required",
      externalWritesEnabled: false
    };
  }

  const definition = definitions[slug];
  const configuredBase = clean(env[definition.baseKey]);
  const configuredOrigin = clean(env[definition.allowedOriginKey]);
  const baseUrl = configuredBase || definition.defaultBase;
  const configurationSource = configuredBase ? "environment" : "sandbox_default";
  try {
    const safeBase = resolveReadOnlyConnectorBase(baseUrl, { allowedOrigin: configuredOrigin });
    const parsed = new URL(safeBase);
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]).has(parsed.hostname.toLowerCase());
    return {
      product: slug,
      configurationSource,
      destinationClass: loopback ? "loopback" : "remote_https",
      policyStatus: "transport_ready",
      allowedOriginStatus: loopback ? "not_required" : "configured",
      credentialStatus: definition.credentialKey
        ? (clean(env[definition.credentialKey]) ? "configured" : "not_configured")
        : "not_required",
      externalWritesEnabled: false
    };
  } catch {
    return {
      product: slug,
      configurationSource,
      destinationClass: "blocked",
      policyStatus: "destination_blocked",
      allowedOriginStatus: configuredOrigin ? "invalid_or_mismatched" : "not_configured",
      credentialStatus: definition.credentialKey
        ? (clean(env[definition.credentialKey]) ? "configured" : "not_configured")
        : "not_required",
      externalWritesEnabled: false
    };
  }
}

function clean(value) {
  return String(value || "").trim();
}
