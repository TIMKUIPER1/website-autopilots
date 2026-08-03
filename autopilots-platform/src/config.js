const MODES = new Set(["demo", "sandbox", "production"]);

export class ConfigurationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "ConfigurationError";
    this.code = code;
  }
}

export function loadRuntimeConfig(env = process.env) {
  const mode = String(env.AUTOPILOTS_MODE || "demo").toLowerCase();
  if (!MODES.has(mode)) throw new ConfigurationError("INVALID_MODE", `Onbekende AUTOPILOTS_MODE: ${mode}`);

  const port = boundedInteger(env.PORT, 4310, 1, 65535, "PORT");
  const host = String(env.HOST || "127.0.0.1");
  const config = Object.freeze({
    mode,
    isProduction: mode === "production",
    port,
    host,
    databaseUrl: secret(env.DATABASE_URL),
    databasePoolMax: boundedInteger(env.DATABASE_POOL_MAX, 10, 1, 50, "DATABASE_POOL_MAX"),
    sessionSecret: secret(env.SESSION_SECRET),
    authProvider: String(env.AUTH_PROVIDER || "demo").toLowerCase(),
    supabaseUrl: secret(env.SUPABASE_URL),
    supabasePublishableKey: secret(env.SUPABASE_PUBLISHABLE_KEY),
    authRedirectUrl: String(env.AUTH_REDIRECT_URL || `http://${host}:${port}/auth/callback`),
    vaultProvider: String(env.VAULT_PROVIDER || "none"),
    externalWritesEnabled: String(env.EXTERNAL_WRITES_ENABLED || "false") === "true"
  });

  assertSafeConfiguration(config);
  return config;
}

export function assertSafeConfiguration(config) {
  if (!["demo", "supabase"].includes(config.authProvider)) {
    throw new ConfigurationError("INVALID_AUTH_PROVIDER", `Onbekende AUTH_PROVIDER: ${config.authProvider}`);
  }
  if (config.authProvider === "supabase") {
    const authMissing = [];
    if (!config.supabaseUrl) authMissing.push("SUPABASE_URL");
    if (!config.supabasePublishableKey) authMissing.push("SUPABASE_PUBLISHABLE_KEY");
    if (!config.sessionSecret || config.sessionSecret.length < 32) authMissing.push("SESSION_SECRET (minimaal 32 tekens)");
    if (authMissing.length) {
      throw new ConfigurationError("SUPABASE_AUTH_CONFIGURATION_INCOMPLETE", `Supabase Auth-configuratie ontbreekt: ${authMissing.join(", ")}`);
    }
  }
  if (!config.isProduction) {
    if (config.externalWritesEnabled) {
      throw new ConfigurationError("NON_PRODUCTION_WRITES", "Externe writes zijn alleen toegestaan in een expliciete productieomgeving.");
    }
    return;
  }

  const missing = [];
  if (!config.databaseUrl) missing.push("DATABASE_URL");
  if (!config.sessionSecret || config.sessionSecret.length < 32) missing.push("SESSION_SECRET (minimaal 32 tekens)");
  if (config.authProvider !== "supabase") missing.push("AUTH_PROVIDER=supabase");
  if (!config.vaultProvider || config.vaultProvider === "none") missing.push("VAULT_PROVIDER");
  if (missing.length) {
    throw new ConfigurationError("PRODUCTION_CONFIGURATION_INCOMPLETE", `Productieconfiguratie ontbreekt: ${missing.join(", ")}`);
  }
}

function boundedInteger(value, fallback, min, max, name) {
  const parsed = value === undefined || value === "" ? fallback : Number(value);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new ConfigurationError("INVALID_INTEGER", `${name} moet een geheel getal tussen ${min} en ${max} zijn.`);
  }
  return parsed;
}

function secret(value) {
  const normalized = String(value || "").trim();
  return normalized && !normalized.includes("zet-je") ? normalized : "";
}
