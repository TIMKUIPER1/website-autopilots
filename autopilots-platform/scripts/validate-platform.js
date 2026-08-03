import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { APPLIED_MIGRATIONS } from "./migration-manifest.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migrationRoot = path.join(root, "supabase", "migrations");
const failures = [];
const migrationFiles = (await fs.readdir(migrationRoot)).filter((file) => file.endsWith(".sql")).sort();
const manifestFiles = Object.keys(APPLIED_MIGRATIONS).sort();
const rpcAccessMatrix = JSON.parse(await fs.readFile(path.join(root, "config", "rpc-access-matrix.json"), "utf8"));
const migrationSources = [];

if (JSON.stringify(migrationFiles) !== JSON.stringify(manifestFiles)) {
  failures.push("Migrationmanifest en migrationmap verschillen; registreer iedere nieuwe immutable migration expliciet.");
}

for (const file of migrationFiles) {
  if (!/^\d{14}_[a-z0-9_]+\.sql$/.test(file)) failures.push(`Ongeldige migrationnaam: ${file}`);
  const sql = await fs.readFile(path.join(migrationRoot, file), "utf8");
  migrationSources.push(sql);
  const checksum = crypto.createHash("sha256").update(sql).digest("hex");
  if (APPLIED_MIGRATIONS[file] !== checksum) failures.push(`Immutable migration gewijzigd: ${file}`);
  if (!/^\s*begin;[\s\S]*commit;\s*$/i.test(sql)) failures.push(`Migration is niet transactioneel: ${file}`);
}

const allMigrationSql = migrationSources.join("\n");
const discoveredRpcs = [...allMigrationSql.matchAll(/create\s+or\s+replace\s+function\s+public\.(autopilots_[a-z0-9_]+)\s*\(/gi)]
  .map((match) => match[1].toLowerCase());
const uniqueRpcs = [...new Set(discoveredRpcs)].sort();
const governedRpcs = Object.keys(rpcAccessMatrix).sort();
if (JSON.stringify(uniqueRpcs) !== JSON.stringify(governedRpcs)) {
  failures.push("RPC-toegangsmatrix dekt niet exact alle publieke Autopilots-functies.");
}

for (const [rpc, role] of Object.entries(rpcAccessMatrix)) {
  const escaped = rpc.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const revokePattern = role === "authenticated"
    ? new RegExp(`revoke\\s+all\\s+on\\s+function\\s+public\\.${escaped}\\s*\\([^;]*\\)\\s+from\\s+public\\s*,\\s*anon\\s*;`, "i")
    : new RegExp(`revoke\\s+all\\s+on\\s+function\\s+public\\.${escaped}\\s*\\([^;]*\\)\\s+from\\s+public\\s*,\\s*anon\\s*,\\s*authenticated\\s*;`, "i");
  const grantPattern = new RegExp(`grant\\s+execute\\s+on\\s+function\\s+public\\.${escaped}\\s*\\([^;]*\\)\\s+to\\s+${role}\\s*;`, "i");
  if (!revokePattern.test(allMigrationSql)) failures.push(`RPC mist browser-deny: ${rpc}`);
  if (!grantPattern.test(allMigrationSql)) failures.push(`RPC mist expliciete ${role}-grant: ${rpc}`);
}

const tracked = execFileSync("git", ["ls-files", "-z", "--", "autopilots-platform"], {
  cwd: path.resolve(root, ".."),
  encoding: "utf8"
}).split("\0").filter(Boolean);
const secretPatterns = [
  ["Stripe live secret", new RegExp("sk_" + "live_[A-Za-z0-9]{12,}", "g")],
  ["Supabase secret key", new RegExp("sb_" + "secret_[A-Za-z0-9_-]{12,}", "g")],
  ["Private key", new RegExp("-----BEGIN " + "(?:RSA |EC |OPENSSH )?PRIVATE KEY-----", "g")],
  ["Assigned service-role key", new RegExp("SUPABASE_" + "SERVICE_ROLE_KEY[ \\t]*=[ \\t]*[^\\s<][^\\r\\n]*", "g")]
];

for (const trackedPath of tracked) {
  const absolutePath = path.resolve(root, "..", trackedPath);
  let source;
  try {
    source = await fs.readFile(absolutePath, "utf8");
  } catch {
    continue;
  }
  for (const [label, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(source)) failures.push(`${label} aangetroffen in ${trackedPath}`);
  }
}

if (failures.length) {
  console.error(JSON.stringify({ ok: false, failures }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  immutableMigrations: migrationFiles.length,
  governedPublicRpcs: governedRpcs.length,
  trackedFilesScanned: tracked.length,
  externalWrites: false
}, null, 2));
