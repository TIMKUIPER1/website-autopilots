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

The remaining warnings are outside the governed and legacy sales surfaces: the
legacy `public.set_updated_at` search path, legacy Gift GraphQL exposure, the
intentional bounded signed-in session RPC and the project leaked-password
setting. Each requires its own owner and compatibility decision; zero errors is
not the same as production readiness.
