import { execFileSync, spawn } from "node:child_process";
import crypto from "node:crypto";

const projectRef = "wurycoodzcybaxcgqxps";
let keys;
try {
  keys = JSON.parse(execFileSync("supabase", [
    "projects", "api-keys", "--project-ref", projectRef, "--reveal", "-o", "json"
  ], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }));
} catch {
  console.error(JSON.stringify({ ok: false, code: "MANAGED_SANDBOX_KEYS_UNAVAILABLE" }));
  process.exit(1);
}

const publishableKey = keys.find((key) => key.name === "default" && key.type === "publishable")?.api_key
  || keys.find((key) => key.name === "anon" && key.type === "legacy")?.api_key;
const serviceRoleKey = keys.find((key) => key.name === "service_role" && key.type === "legacy")?.api_key;
if (!publishableKey || !serviceRoleKey) {
  console.error(JSON.stringify({ ok: false, code: "MANAGED_SANDBOX_KEYS_UNAVAILABLE" }));
  process.exit(1);
}

const child = spawn(process.execPath, ["src/server.js"], {
  cwd: new URL("..", import.meta.url),
  stdio: "inherit",
  env: {
    ...process.env,
    AUTOPILOTS_MODE: "sandbox",
    HOST: "127.0.0.1",
    PORT: "4310",
    AUTH_PROVIDER: "supabase",
    AUTH_REDIRECT_URL: "http://127.0.0.1:4310/auth/callback",
    SUPABASE_URL: `https://${projectRef}.supabase.co`,
    SUPABASE_PUBLISHABLE_KEY: publishableKey,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey,
    SESSION_SECRET: crypto.randomBytes(48).toString("base64url"),
    MONITORING_SCHEDULER_ENABLED: "true",
    MONITORING_INTERVAL_MS: "900000",
    MONITORING_LEASE_SECONDS: "120",
    MONITORING_STALE_AFTER_SECONDS: "1800",
    MONITORING_AUTHORITY_PRINCIPAL_ID: "41000000-0000-4000-8000-000000000001",
    MONITORING_RUN_IMMEDIATELY: "true",
    EXTERNAL_WRITES_ENABLED: "false"
  }
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
