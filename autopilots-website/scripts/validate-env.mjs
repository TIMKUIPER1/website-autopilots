const production =
  process.env.CONTEXT === "production" ||
  process.env.AUTOPILOTS_VALIDATE_PRODUCTION === "1";

const requiredBuild = [
  "PUBLIC_SITE_URL",
  "PUBLIC_GHL_CALENDAR_URL",
  "PUBLIC_STRIPE_PUBLISHABLE_KEY",
];
const requiredRuntime = [
  "GHL_PRIVATE_INTEGRATION_TOKEN",
  "GHL_LOCATION_ID",
  "GHL_PIPELINE_ID",
  "GHL_PIPELINE_STAGE_ID",
  "GHL_FUNNEL_CONTEXT_FIELD_KEY",
  "GHL_BOOKING_WEBHOOK_SECRET",
  "STRIPE_WEBHOOK_SECRET",
];
const missing = [...requiredBuild, ...requiredRuntime].filter(
  (key) => !String(process.env[key] ?? "").trim(),
);

if (production && missing.length) {
  console.error(`Productieconfiguratie ontbreekt: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(
  production
    ? "Productieconfiguratie is compleet."
    : "Lokale build: productie-secrets worden pas tijdens Netlify production deploy verplicht.",
);
