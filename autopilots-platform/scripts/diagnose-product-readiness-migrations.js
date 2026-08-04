import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APPLIED_MIGRATIONS } from "./migration-manifest.js";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const MIGRATIONS = Object.freeze([
  "20260804150000_product_connection_readiness.sql",
  "20260804153000_product_connection_evidence_recording.sql",
  "20260804160000_atomic_product_snapshot_evidence.sql"
]);
const SAFE_IDENTIFIERS = Object.freeze([
  "product_snapshot_contracts_id_brand_entity_uq",
  "product_connection_gate_policies",
  "product_connection_gate_evidence",
  "product_connection_gate_evidence_append_only",
  "autopilots_product_connection_readiness",
  "autopilots_record_product_connection_evidence",
  "autopilots_record_product_snapshot_evidence"
]);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
if (process.platform !== "darwin") fail("READINESS_DIAGNOSTIC_KEYCHAIN_UNSUPPORTED");

const statements = [];
for (const migration of MIGRATIONS) {
  const body = await fs.readFile(path.join(root, "supabase", "migrations", migration), "utf8");
  const checksum = crypto.createHash("sha256").update(body).digest("hex");
  if (APPLIED_MIGRATIONS[migration] !== checksum) fail("READINESS_DIAGNOSTIC_CHECKSUM_MISMATCH", { migration });
  statements.push(body.trim().replace(/^begin;\s*/i, "").replace(/\s*commit;$/i, ""));
}

let accessToken = readKeychainToken();
let completedStages = 0;
for (let index = 0; index < statements.length; index += 1) {
  const query = `begin;\n${statements.slice(0, index + 1).join("\n")}\nrollback;`;
  const result = await databaseQuery(query, accessToken);
  if (!result.ok) {
    accessToken = "";
    console.log(JSON.stringify({
      ok: false,
      contract: "autopilots.product-readiness-migration-diagnostic.v1",
      projectRef: PROJECT_REF,
      failedMigration: MIGRATIONS[index],
      completedStages,
      databaseErrorCode: result.code,
      category: classify(result.message),
      syntaxToken: safeSyntaxToken(result.message),
      statementPosition: safeStatementPosition(result.message),
      statementLine: safeStatementLine(result.message),
      syntaxAtEndOfInput: /syntax error at end of input/i.test(result.message),
      safeIdentifier: SAFE_IDENTIFIERS.find((value) => result.message.includes(value)) || null,
      messageFingerprintSha256: crypto.createHash("sha256").update(result.message).digest("hex"),
      transactionRolledBack: true,
      persistentWrites: false,
      externalWrites: false
    }, null, 2));
    process.exit(2);
  }
  completedStages += 1;
}
accessToken = "";
console.log(JSON.stringify({
  ok: true,
  contract: "autopilots.product-readiness-migration-diagnostic.v1",
  projectRef: PROJECT_REF,
  completedStages,
  transactionRolledBack: true,
  persistentWrites: false,
  externalWrites: false
}, null, 2));

function readKeychainToken() {
  const result = spawnSync("security", ["find-generic-password", "-s", "Supabase CLI", "-w"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024
  });
  const value = result.status === 0 ? String(result.stdout || "").trim() : "";
  if (value.length < 20) fail("READINESS_DIAGNOSTIC_KEYCHAIN_ACCESS_REQUIRED");
  return value;
}

async function databaseQuery(query, token) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: AbortSignal.timeout(30000)
    });
  } catch {
    fail("READINESS_DIAGNOSTIC_API_UNREACHABLE");
  }
  if (response.ok) return { ok: true };
  let payload = {};
  try { payload = await response.json(); } catch {}
  const nested = payload && typeof payload.error === "object" ? payload.error : {};
  const message = String(payload?.message || nested?.message || payload?.error || "unknown").slice(0, 1000);
  const code = safeCode(payload?.code || nested?.code);
  return { ok: false, code, message };
}

function classify(message) {
  const value = message.toLowerCase();
  if (value.includes("already exists") || value.includes("duplicate")) return "OBJECT_ALREADY_EXISTS";
  if (value.includes("no unique constraint")) return "FOREIGN_KEY_TARGET_NOT_UNIQUE";
  if (value.includes("does not exist")) return "DEPENDENCY_MISSING";
  if (value.includes("permission denied") || value.includes("must be owner")) return "AUTHORITY_DENIED";
  if (value.includes("syntax error")) return "SQL_SYNTAX_INVALID";
  if (value.includes("violates") || value.includes("invalid")) return "DATA_OR_CONSTRAINT_INVALID";
  return "UNCLASSIFIED_DATABASE_REJECTION";
}

function safeCode(value) {
  return /^[A-Z0-9_]{2,20}$/.test(String(value || "")) ? String(value) : "UNKNOWN";
}

function safeSyntaxToken(message) {
  const match = String(message).match(/syntax error at or near ["']([^"']{1,32})["']/i);
  return match && /^[A-Za-z0-9_(),.:=-]+$/.test(match[1]) ? match[1] : null;
}

function safeStatementPosition(message) {
  const match = String(message).match(/(?:position|character)\s*:?\s*(\d{1,6})/i);
  return match ? Number(match[1]) : null;
}

function safeStatementLine(message) {
  const match = String(message).match(/line\s+(\d{1,6})\s*:/i);
  return match ? Number(match[1]) : null;
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
