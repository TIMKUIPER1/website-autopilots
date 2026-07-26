const production =
  process.env.CONTEXT === "production" ||
  process.env.AUTOPILOTS_VALIDATE_PRODUCTION === "1";

const requiredRuntime = [
  "GHL_PRIVATE_INTEGRATION_TOKEN",
  "GHL_LOCATION_ID",
  "GHL_META_PIPELINE_ID",
  "GHL_META_NEW_LEAD_STAGE_ID",
];
const missing = requiredRuntime.filter(
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
