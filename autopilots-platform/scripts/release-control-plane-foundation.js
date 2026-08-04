import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const PROJECT_ROOT = fileURLToPath(new URL("..", import.meta.url));
if (process.platform !== "darwin") fail("CONTROL_PLANE_KEYCHAIN_UNSUPPORTED");

let accessToken = readKeychainToken();
const releaseEnv = {
  ...process.env,
  SUPABASE_ACCESS_TOKEN: accessToken,
  SUPABASE_PROJECT_REF: PROJECT_REF,
  ALLOW_DATABASE_MIGRATIONS: "true",
  MIGRATION_CHAIN_CONFIRM: `${PROJECT_REF}:45:48`,
  RUNTIME_TOPOLOGY_CONFIRM: `${PROJECT_REF}:48:49`
};

runStep("readiness-apply", "scripts/apply-product-readiness-chain.js", ["--apply"], releaseEnv);
runStep("readiness-verify", "scripts/verify-live-product-readiness.js", [], releaseEnv);
runStep("readiness-accept", "scripts/accept-live-product-readiness.js", [], releaseEnv);
runStep("runtime-topology-apply", "scripts/apply-product-runtime-topology.js", ["--apply"], releaseEnv);
runStep("runtime-topology-verify", "scripts/verify-live-product-runtime-topology.js", [], releaseEnv);

delete releaseEnv.SUPABASE_ACCESS_TOKEN;
accessToken = "";
console.log(JSON.stringify({
  ok: true,
  contract: "autopilots.control-plane-foundation-release.v1",
  projectRef: PROJECT_REF,
  migrationCount: 49,
  governedRpcCount: 41,
  readinessPostureVerified: true,
  readinessBehaviorAcceptedWithRollback: true,
  productRuntimeTopologyVerified: true,
  persistentAcceptanceWrites: false,
  dataConnectionsEnabled: false,
  providerAuthorizationEnabled: false,
  externalWritesEnabled: false
}, null, 2));

function readKeychainToken() {
  const result = spawnSync("security", [
    "find-generic-password", "-s", "Supabase CLI", "-w"
  ], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024
  });
  const value = result.status === 0 ? String(result.stdout || "").trim() : "";
  if (value.length < 20) fail("CONTROL_PLANE_KEYCHAIN_ACCESS_REQUIRED");
  return value;
}

function runStep(step, script, args, env) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: PROJECT_ROOT, env, stdio: "inherit"
  });
  if (result.status !== 0) fail("CONTROL_PLANE_RELEASE_STEP_FAILED", { step });
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
