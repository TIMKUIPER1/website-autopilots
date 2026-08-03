# Supabase Advisor inventory and ownership boundary

## Read-only baseline — 2026-08-03

The Supabase dashboard export for project `wurycoodzcybaxcgqxps` contained:

| Level | Count | Classification |
| --- | ---: | --- |
| Error | 18 | All legacy `public.*` tables without RLS |
| Warning | 70 | 49 `public` findings, 20 governed OS findings, 1 Auth setting |
| Info | 12 | 5 governed server-only deny-all tables, 7 legacy Gift tables |

The two mutable-search-path warnings were `public.set_updated_at` (legacy) and
`audit.reject_mutation` (governed OS). The OS function is fixed by the minimal
authenticated-surface migration. The legacy function is unchanged pending
compatibility review.

## Eighteen legacy security errors

All errors are `RLS Disabled in Public`:

- core sales data: `companies`, `customer_domains`, `contacts`,
  `sales_team_members`, `sales_login_sessions`, `sales_calls`,
  `sales_call_transcripts`, `sales_ai_scores`;
- integration data: `integration_accounts`, `sync_runs`,
  `integration_health`, `ghl_opportunity_events`, `raw_imports`;
- business records: `documents`, `invoices_sales`, `invoices_purchase`,
  `review_items`, `audit_log`.

These tables predate the Autopilots OS schemas and belong to the legacy
`sales-dashboard` compatibility boundary. Do not enable blanket RLS or revoke
legacy grants without first tracing every client, server route, webhook and
scheduled job that depends on them.

## Governed OS response

The browser needs only a bounded identity and membership bootstrap. Migration
`20260804023000_minimal_authenticated_surface.sql` therefore:

- replaces session context v1 with a legal-entity-consistent v2 contract;
- revokes authenticated direct reads on all six governed schemas;
- leaves exactly one authenticated public RPC;
- keeps service-role control-plane reads and writes unchanged;
- fixes the governed append-only trigger search path.

After application, rerun the Advisor. Expected: no governed-table GraphQL
warnings and no `audit.reject_mutation` warning. Legacy warnings and errors may
remain until their compatibility matrix is complete.

## Verified result — 2026-08-03

The Advisor was rerun after the migration and its warning export was inspected:

| Level | Before | After | Result |
| --- | ---: | ---: | --- |
| Error | 18 | 18 | all remain legacy `public.*` RLS findings |
| Warning | 70 | 51 | no finding remains in `audit`, `core`, `iam`, `integration`, `ledger` or `workflow` |
| Info | 12 | 12 | unchanged; five governed entries are intentional server-only deny-all tables |

The 51 remaining warnings are: one legacy mutable-search-path function, 24
anonymous and 24 authenticated legacy `public` GraphQL exposures, one
intentional authenticated execution warning for the bounded
`public.autopilots_session_context_v2()` bootstrap, and the project-level
leaked-password-protection setting. The session RPC is intentionally the only
signed-in database entrypoint; its fixed search path, exact result contract,
legal-entity scoping and revoked direct table access are independently tested.
The account setting is not changed under Work Permission A because owner MFA
enrollment and the passwordless login acceptance are still pending.

## Legacy remediation gate

For each public table, document current callers, anonymous/authenticated grants,
tenant key, expected policies, migration rollback and an end-to-end regression
test. Remediate in small groups; begin with the most sensitive exposed tables
(`sales_login_sessions`, transcripts, invoices, documents and audit records).
## First legacy compatibility group — verified 2026-08-03

After tracing the live call graph, fourteen legacy tables had no runtime caller
and zero rows. Migration `20260804030000_protect_unused_legacy_tables.sql`
enabled RLS and revoked browser-role privileges on exactly that group. A
rollback-only preflight and a post-activation service-role/anonymous probe both
passed.

| Level | Before group | After group | Result |
| --- | ---: | ---: | --- |
| Error | 18 | 4 | only `audit_log`, `integration_health`, `invoices_sales` and `raw_imports` remain |
| Warning | 51 | 23 | 28 legacy GraphQL exposures removed |
| Info | 12 | 26 | fourteen intentionally policy-free protected tables added |

The four remaining errors belong to active service-role best-effort mirrors.
They require a separate rolled-back write-contract acceptance before their
grants or RLS state may change. Advisor counts are evidence, not authorization
for that second group.

## Active legacy mirror group — verified 2026-08-03

The separate write-contract acceptance passed for all four active mirrors under
the real `service_role`, including their exact unique-conflict upsert keys, and
rolled back with zero residue. Migration
`20260804033000_protect_active_legacy_mirrors.sql` then enabled RLS and revoked
browser privileges without changing service-role grants or records.

| Level | Before group | After group | Result |
| --- | ---: | ---: | --- |
| Error | 4 | 0 | no table remains with RLS disabled in an exposed schema |
| Warning | 23 | 15 | all eight active-mirror GraphQL exposures removed |
| Info | 26 | 30 | four intentionally policy-free protected tables added |

The remaining warnings are outside the governed and legacy sales surfaces:
legacy Gift GraphQL exposure, the intentional bounded signed-in session RPC and
the project leaked-password setting. Each requires its own owner and
compatibility decision; zero errors is not the same as production readiness.

## Legacy trigger search path — verified 2026-08-03

`public.set_updated_at()` is a security-invoker trigger that only assigns
`new.updated_at = now()`. Four Gift tables depend on it. A rollback-only
temporary-table trigger proved identical behavior with search path
`pg_catalog, public` and left no table or function-config residue. Migration
`20260804040000_fix_legacy_updated_at_search_path.sql` then set only that
configuration; the body and four triggers were preserved.

The fresh Advisor result was 0 errors, 14 warnings and 30 information items. The
mutable-search-path warning was gone. The subsequent Gift inventory and grant
remediation are recorded below.

## Gift GraphQL surface — verified 2026-08-03

Six RLS-enabled Gift tables had zero policies but retained full browser grants,
which exposed their schema without permitting browser data access. The separate
inventory found 20 rows, no local caller, no deployed Edge Function, no Gift
PostgREST event in the available eight-day window and latest stored activity on
2026-06-22. Sensitive fields include access codes, webhook URLs, contact data,
license plates, messages and service requests.

Migration `20260804043000_protect_gift_graphql_surface.sql` revoked only
`public`, `anon` and `authenticated` table privileges. A rollback-only preflight
proved all six RLS states and service-role counts, then restored all grants.
Live acceptance now reports HTTP 401 for every browser probe and unchanged
service-role counts of 2/2/5/10/1/0.

| Level | Before Gift group | After Gift group | Result |
| --- | ---: | ---: | --- |
| Error | 0 | 0 | unchanged |
| Warning | 14 | 2 | all twelve Gift GraphQL exposures removed |
| Info | 30 | 30 | unchanged |

The two remaining warnings are exact and understood: authenticated execution of
the bounded `public.autopilots_session_context_v2()` login bootstrap is
intentional, while leaked-password protection requires an identity-policy
decision and real-owner login acceptance beyond this migration.

## Connector request staging — verified 2026-08-03

Migration `20260804050000_connector_request_staging.sql` adds one RLS-protected,
service-role-only internal intent table and no browser policy. The fresh Advisor
result is 0 errors, 2 warnings and 31 information items. The extra information
item is the intentional policy-free server-only connector request table; the two
known warnings are unchanged.

The rollback-only acceptance proved first request, exact replay, divergent-key
rejection, R3 pending approval, zero-cost usage and audit evidence with zero
residue. Live acceptance found zero connector requests. OAuth, provider account
connection, discovery, credential storage and external writes are all constrained
to `false` in the database.
