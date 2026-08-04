import { spawnSync } from "node:child_process";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const ADVISORS = Object.freeze(["security", "performance"]);
if (process.platform !== "darwin") fail("ADVISOR_INSPECTION_KEYCHAIN_UNSUPPORTED");

let accessToken = readKeychainToken();
const reports = [];
for (const advisor of ADVISORS) reports.push(await fetchAdvisor(advisor, accessToken));
accessToken = "";

const available = reports.filter((report) => report.available);
const lints = available.flatMap((report) => report.lints.map((lint) => ({
  advisor: report.advisor,
  name: safeName(lint?.name),
  level: safeLevel(lint?.level)
})));
const counts = { error: 0, warn: 0, info: 0, other: 0 };
for (const lint of lints) counts[lint.level] += 1;
const grouped = new Map();
for (const lint of lints) {
  const key = `${lint.advisor}:${lint.name}:${lint.level}`;
  grouped.set(key, { ...lint, count: (grouped.get(key)?.count || 0) + 1 });
}

console.log(JSON.stringify({
  ok: available.length === ADVISORS.length,
  contract: "autopilots.supabase-advisor-inspection.v1",
  projectRef: PROJECT_REF,
  advisors: reports.map((report) => ({
    advisor: report.advisor,
    available: report.available,
    status: report.status,
    lintCount: report.lints.length
  })),
  counts,
  findingSummary: [...grouped.values()],
  databaseWrites: false,
  externalWrites: false
}, null, 2));

function readKeychainToken() {
  const result = spawnSync("security", ["find-generic-password", "-s", "Supabase CLI", "-w"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024
  });
  const value = result.status === 0 ? String(result.stdout || "").trim() : "";
  if (value.length < 20) fail("ADVISOR_INSPECTION_KEYCHAIN_ACCESS_REQUIRED");
  return value;
}

async function fetchAdvisor(advisor, token) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/advisors/${advisor}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: AbortSignal.timeout(30000)
    });
  } catch {
    fail("ADVISOR_INSPECTION_API_UNREACHABLE", { advisor });
  }
  if (response.status === 404) return { advisor, available: false, status: 404, lints: [] };
  if (!response.ok) fail("ADVISOR_INSPECTION_API_REJECTED", { advisor, status: response.status });
  try {
    const payload = await response.json();
    if (!Array.isArray(payload?.lints)) fail("ADVISOR_INSPECTION_RESPONSE_INVALID", { advisor });
    return { advisor, available: true, status: response.status, lints: payload.lints };
  } catch {
    fail("ADVISOR_INSPECTION_RESPONSE_INVALID", { advisor });
  }
}

function safeName(value) {
  return /^[a-z0-9_]{2,100}$/.test(String(value || "")) ? String(value) : "unknown_finding";
}

function safeLevel(value) {
  const level = String(value || "").toLowerCase();
  if (level === "error") return "error";
  if (level === "warn" || level === "warning") return "warn";
  if (level === "info" || level === "information") return "info";
  return "other";
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
