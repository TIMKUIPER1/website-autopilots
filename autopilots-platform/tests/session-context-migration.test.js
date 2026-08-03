import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const migration = fs.readFileSync(path.join(
  root,
  "supabase/migrations/20260803174500_authenticated_session_context.sql"
), "utf8");

test("legacy session context originally used authenticated RLS before v2 retirement", () => {
  assert.match(migration, /security invoker/i);
  assert.match(migration, /where p\.auth_user_id = auth\.uid\(\)/i);
  assert.match(migration, /m\.status = 'active'/i);
  assert.match(migration, /m\.brand_id is null or m\.brand_id = b\.id/i);
  assert.match(migration, /revoke all on function public\.autopilots_session_context\(\) from public, anon/i);
  assert.match(migration, /grant execute on function public\.autopilots_session_context\(\) to authenticated/i);
});

test("session context carries MFA assurance and no credentials", () => {
  assert.match(migration, /auth\.jwt\(\) ->> 'aal'/i);
  assert.match(migration, /'mfaRequired', p\.mfa_required/i);
  assert.doesNotMatch(migration, /access_token|refresh_token|service_role|credential_reference/i);
});
