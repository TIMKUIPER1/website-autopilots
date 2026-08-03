import assert from "node:assert/strict";
import test from "node:test";
import { assertAutopilotsMigrationTarget, AUTOPILOTS_SUPABASE_PROJECT_REF } from "../scripts/migration-target.js";

test("direct Supabase target resolves only the existing Autopilots project", () => {
  const result = assertAutopilotsMigrationTarget(
    `postgresql://postgres:secret@db.${AUTOPILOTS_SUPABASE_PROJECT_REF}.supabase.co:5432/postgres`
  );
  assert.equal(result.projectRef, AUTOPILOTS_SUPABASE_PROJECT_REF);
});

test("Supabase pooler target resolves project ref from its scoped username", () => {
  const result = assertAutopilotsMigrationTarget(
    `postgres://postgres.${AUTOPILOTS_SUPABASE_PROJECT_REF}:secret@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
  );
  assert.equal(result.projectRef, AUTOPILOTS_SUPABASE_PROJECT_REF);
});

test("different, ambiguous and non-PostgreSQL targets fail before connection", () => {
  assert.throws(
    () => assertAutopilotsMigrationTarget("postgresql://postgres:secret@db.aaaaaaaaaaaaaaaaaaaa.supabase.co/postgres"),
    /alleen toegestaan voor Autopilots-project/
  );
  assert.throws(
    () => assertAutopilotsMigrationTarget(`postgresql://postgres.bbbbbbbbbbbbbbbbbbbb:secret@db.${AUTOPILOTS_SUPABASE_PROJECT_REF}.supabase.co/postgres`),
    /niet eenduidig/
  );
  assert.throws(() => assertAutopilotsMigrationTarget("https://example.com/database"), /PostgreSQL-protocol/);
});

test("target errors never echo database credentials", () => {
  const credential = "never-print-this-secret";
  assert.throws(
    () => assertAutopilotsMigrationTarget(`postgresql://postgres:${credential}@localhost/postgres`),
    (error) => !error.message.includes(credential)
  );
});
