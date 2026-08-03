import assert from "node:assert/strict";
import test from "node:test";
import { ConfigurationError, loadRuntimeConfig } from "../src/config.js";

test("demo is fail-closed voor externe writes", () => {
  assert.throws(
    () => loadRuntimeConfig({ AUTOPILOTS_MODE: "demo", EXTERNAL_WRITES_ENABLED: "true" }),
    (error) => error instanceof ConfigurationError && error.code === "NON_PRODUCTION_WRITES"
  );
});

test("productie vereist database, sterke sessie, managed identity en vault", () => {
  assert.throws(
    () => loadRuntimeConfig({ AUTOPILOTS_MODE: "production" }),
    (error) => error instanceof ConfigurationError && error.code === "PRODUCTION_CONFIGURATION_INCOMPLETE"
  );
});

test("sandbox accepteert duurzame database zonder providerwrites", () => {
  const config = loadRuntimeConfig({
    AUTOPILOTS_MODE: "sandbox",
    DATABASE_URL: "postgres://sandbox.invalid/example",
    DATABASE_POOL_MAX: "4"
  });
  assert.equal(config.mode, "sandbox");
  assert.equal(config.databasePoolMax, 4);
  assert.equal(config.externalWritesEnabled, false);
});

test("Supabase Auth faalt dicht zonder URL en gescheiden public/server keys", () => {
  assert.throws(
    () => loadRuntimeConfig({ AUTOPILOTS_MODE: "sandbox", AUTH_PROVIDER: "supabase" }),
    (error) => error instanceof ConfigurationError && error.code === "SUPABASE_AUTH_CONFIGURATION_INCOMPLETE"
  );
  const config = loadRuntimeConfig({
    AUTOPILOTS_MODE: "sandbox",
    AUTH_PROVIDER: "supabase",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    SUPABASE_SERVICE_ROLE_KEY: "server-only-example"
  });
  assert.equal(config.authProvider, "supabase");
  assert.equal(config.authRedirectUrl, "http://127.0.0.1:4310/auth/callback");
});

test("automatische monitoring is begrensd en vereist expliciete managed authority", () => {
  assert.throws(
    () => loadRuntimeConfig({ AUTOPILOTS_MODE: "sandbox", MONITORING_SCHEDULER_ENABLED: "true" }),
    (error) => error instanceof ConfigurationError && error.code === "MONITORING_REQUIRES_MANAGED_IDENTITY"
  );
  const base = {
    AUTOPILOTS_MODE: "sandbox", AUTH_PROVIDER: "supabase",
    SUPABASE_URL: "https://example.supabase.co", SUPABASE_PUBLISHABLE_KEY: "public",
    SUPABASE_SERVICE_ROLE_KEY: "server"
  };
  assert.throws(
    () => loadRuntimeConfig({ ...base, MONITORING_SCHEDULER_ENABLED: "true" }),
    (error) => error instanceof ConfigurationError && error.code === "MONITORING_AUTHORITY_MISSING"
  );
  const config = loadRuntimeConfig({
    ...base,
    MONITORING_SCHEDULER_ENABLED: "true",
    MONITORING_AUTHORITY_PROFILE_ID: "40000000-0000-4000-8000-000000000001",
    MONITORING_INTERVAL_MS: "60000",
    MONITORING_LEASE_SECONDS: "90",
    MONITORING_STALE_AFTER_SECONDS: "120"
  });
  assert.equal(config.monitoringSchedulerEnabled, true);
  assert.equal(config.monitoringIntervalMs, 60000);
  assert.equal(config.monitoringLeaseSeconds, 90);
  assert.equal(config.monitoringStaleAfterSeconds, 120);
  assert.throws(
    () => loadRuntimeConfig({
      ...base,
      MONITORING_SCHEDULER_ENABLED: "true",
      MONITORING_AUTHORITY_PROFILE_ID: "40000000-0000-4000-8000-000000000001",
      MONITORING_INTERVAL_MS: "120000",
      MONITORING_STALE_AFTER_SECONDS: "60"
    }),
    (error) => error instanceof ConfigurationError && error.code === "MONITORING_FRESHNESS_TOO_SHORT"
  );
});
