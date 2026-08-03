import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createPostgresConnection } from "../src/persistence/postgres.js";
import { assertAutopilotsMigrationTarget } from "./migration-target.js";

const allow = process.env.ALLOW_DATABASE_MIGRATIONS === "true";
const databaseUrl = String(process.env.DATABASE_URL || "").trim();
const changeId = String(process.env.MIGRATION_CHANGE_ID || "").trim();
if (!allow) fail("Databasewijzigingen zijn geblokkeerd. Zet ALLOW_DATABASE_MIGRATIONS=true na review en back-up.");
if (!databaseUrl) fail("DATABASE_URL ontbreekt.");
if (!changeId || !/^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*-[0-9]+$/.test(changeId)) fail("Een traceerbare MIGRATION_CHANGE_ID zoals OS-101 is verplicht.");
try {
  assertAutopilotsMigrationTarget(databaseUrl);
} catch (error) {
  fail(error.message);
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const directory = path.join(root, "supabase", "migrations");
const files = (await fs.readdir(directory)).filter((name) => name.endsWith(".sql")).sort();
const sql = await createPostgresConnection({ databaseUrl, max: 1 });

try {
  await sql`
    create table if not exists public.autopilots_schema_migrations (
      version text primary key,
      checksum text not null,
      change_id text not null,
      applied_at timestamptz not null default now()
    )
  `;
  await sql`alter table public.autopilots_schema_migrations enable row level security`;
  await sql`revoke all on public.autopilots_schema_migrations from anon, authenticated`;
  await sql`grant select, insert on public.autopilots_schema_migrations to service_role`;
  const crypto = await import("node:crypto");
  for (const file of files) {
    const body = await fs.readFile(path.join(directory, file), "utf8");
    const checksum = crypto.createHash("sha256").update(body).digest("hex");
    const existing = await sql`select checksum from public.autopilots_schema_migrations where version = ${file}`;
    if (existing.length) {
      if (existing[0].checksum !== checksum) throw new Error(`Checksum mismatch voor reeds toegepaste migration ${file}.`);
      continue;
    }
    const transactionalBody = body.trim().replace(/^begin;\s*/i, "").replace(/\s*commit;$/i, "");
    await sql.begin(async (tx) => {
      await tx.unsafe(transactionalBody);
      await tx`
        insert into public.autopilots_schema_migrations (version, checksum, change_id)
        values (${file}, ${checksum}, ${changeId})
      `;
    });
    console.log(`Toegepast: ${file}`);
  }
} finally {
  await sql.end({ timeout: 5 });
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
