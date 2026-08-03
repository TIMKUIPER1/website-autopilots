import assert from "node:assert/strict";
import test from "node:test";
import { connectorPosture } from "../src/adapters/connector-posture.js";

test("sandbox defaults are explicit without exposing endpoint values", () => {
  const result = connectorPosture(["autopilots", "autoreviews", "autoplanner", "roofplanner"], {});
  assert.equal(result.contract, "autopilots.connector-posture.v1");
  assert.equal(result.connectors.length, 4);
  assert.equal(result.connectors.find((item) => item.product === "autoplanner").configurationSource, "sandbox_default");
  assert.equal(result.connectors.find((item) => item.product === "autoplanner").destinationClass, "loopback");
  assert.equal(result.endpointValuesExposed, false);
  assert.equal(result.credentialValuesExposed, false);
  assert.equal(result.providerAuthorizationStarted, false);
  assert.equal(result.externalWritesEnabled, false);
  assert.equal(JSON.stringify(result).includes("127.0.0.1"), false);
});

test("remote configuration reports only safe presence and policy state", () => {
  const result = connectorPosture(["autoreviews"], {
    AUTOREVIEWS_API_URL: "https://api.autoreviews.example/v1",
    AUTOREVIEWS_ALLOWED_ORIGIN: "https://api.autoreviews.example",
    AUTOREVIEWS_OS_SYNC_SECRET: "never-expose-this"
  });
  assert.deepEqual(result.connectors[0], {
    product: "autoreviews",
    configurationSource: "environment",
    destinationClass: "remote_https",
    policyStatus: "transport_ready",
    allowedOriginStatus: "configured",
    credentialStatus: "configured",
    externalWritesEnabled: false
  });
  assert.equal(JSON.stringify(result).includes("api.autoreviews.example"), false);
  assert.equal(JSON.stringify(result).includes("never-expose-this"), false);
});

test("unsafe remote destinations fail closed before revealing the destination", () => {
  const result = connectorPosture(["autoplanner"], {
    AUTOPLANNER_API_URL: "http://metadata.internal/private"
  });
  assert.equal(result.connectors[0].destinationClass, "blocked");
  assert.equal(result.connectors[0].policyStatus, "destination_blocked");
  assert.equal(result.connectors[0].allowedOriginStatus, "not_configured");
  assert.equal(JSON.stringify(result).includes("metadata.internal"), false);
});

test("posture includes only authorized known product slugs", () => {
  const result = connectorPosture(["autopilots", "unknown", "autopilots"], {});
  assert.deepEqual(result.connectors.map((item) => item.product), ["autopilots"]);
});
