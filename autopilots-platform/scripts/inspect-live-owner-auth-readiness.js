import { spawnSync } from "node:child_process";

const PROJECT_REF = "wurycoodzcybaxcgqxps";
const OWNER_PROFILE_ID = "40000000-0000-4000-8000-000000000001";
const LEGAL_ENTITY_ID = "10000000-0000-4000-8000-000000000001";
if (process.platform !== "darwin") fail("OWNER_AUTH_INSPECTION_KEYCHAIN_UNSUPPORTED");

let accessToken = readKeychainToken();
const rows = await databaseQuery(`
select jsonb_build_object(
  'ownerProfileActive', exists (
    select 1 from iam.profiles p
    where p.id = '${OWNER_PROFILE_ID}'::uuid and p.status = 'active'
      and p.mfa_required = true
  ),
  'ownerMembershipActive', exists (
    select 1 from iam.memberships m
    where m.profile_id = '${OWNER_PROFILE_ID}'::uuid
      and m.legal_entity_id = '${LEGAL_ENTITY_ID}'::uuid
      and m.brand_id is null and m.role = 'owner' and m.status = 'active'
  ),
  'authUserLinked', exists (
    select 1 from iam.profiles p join auth.users u on u.id = p.auth_user_id
    where p.id = '${OWNER_PROFILE_ID}'::uuid and u.deleted_at is null
  ),
  'verifiedTotpFactors', (
    select count(*)::int from auth.mfa_factors f
    join iam.profiles p on p.auth_user_id = f.user_id
    where p.id = '${OWNER_PROFILE_ID}'::uuid
      and f.factor_type::text = 'totp' and f.status::text = 'verified'
  ),
  'activeAal2Sessions', (
    select count(*)::int from iam.app_sessions s
    where s.profile_id = '${OWNER_PROFILE_ID}'::uuid
      and s.revoked_at is null and s.assurance_level = 'aal2'
      and s.expires_at > now()
  )
) as evidence` , accessToken);
accessToken = "";

if (!Array.isArray(rows) || rows.length !== 1 || !rows[0]?.evidence) {
  fail("OWNER_AUTH_INSPECTION_RESPONSE_INVALID");
}
const evidence = rows[0].evidence;
if (typeof evidence.ownerProfileActive !== "boolean"
  || typeof evidence.ownerMembershipActive !== "boolean"
  || typeof evidence.authUserLinked !== "boolean"
  || !Number.isInteger(evidence.verifiedTotpFactors) || evidence.verifiedTotpFactors < 0
  || !Number.isInteger(evidence.activeAal2Sessions) || evidence.activeAal2Sessions < 0) {
  fail("OWNER_AUTH_INSPECTION_CONTRACT_INVALID");
}

console.log(JSON.stringify({
  ok: true,
  contract: "autopilots.owner-auth-readiness.v1",
  projectRef: PROJECT_REF,
  ownerProfileActive: evidence.ownerProfileActive,
  ownerMembershipActive: evidence.ownerMembershipActive,
  authUserLinked: evidence.authUserLinked,
  verifiedTotpFactors: evidence.verifiedTotpFactors,
  activeAal2Sessions: evidence.activeAal2Sessions,
  readyForOwnerAcceptance: evidence.ownerProfileActive
    && evidence.ownerMembershipActive && evidence.authUserLinked
    && evidence.verifiedTotpFactors > 0 && evidence.activeAal2Sessions > 0,
  databaseWrites: false,
  externalWrites: false
}, null, 2));

function readKeychainToken() {
  const result = spawnSync("security", ["find-generic-password", "-s", "Supabase CLI", "-w"], {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 64 * 1024
  });
  const value = result.status === 0 ? String(result.stdout || "").trim() : "";
  if (value.length < 20) fail("OWNER_AUTH_INSPECTION_KEYCHAIN_ACCESS_REQUIRED");
  return value;
}

async function databaseQuery(query, token) {
  let response;
  try {
    response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query }), signal: AbortSignal.timeout(30000)
    });
  } catch {
    fail("OWNER_AUTH_INSPECTION_API_UNREACHABLE");
  }
  if (!response.ok) fail("OWNER_AUTH_INSPECTION_API_REJECTED", { status: response.status });
  try {
    const payload = await response.json();
    if (!Array.isArray(payload)) fail("OWNER_AUTH_INSPECTION_RESPONSE_INVALID");
    return payload;
  } catch {
    fail("OWNER_AUTH_INSPECTION_RESPONSE_INVALID");
  }
}

function fail(code, details = {}) {
  console.error(JSON.stringify({ ok: false, code, ...details }));
  process.exit(1);
}
