# Legacy public Supabase surface

## Purpose

This is the compatibility gate between governed `autopilots-platform` and the
legacy `sales-dashboard`. It covers the 18 `public.*` tables reported by
Supabase Security Advisor with RLS disabled. Work Permission A authorized the
first non-destructive compatibility group after the runtime inventory and a
rollback-only acceptance had passed.

The machine-readable source is `config/legacy-public-surface.json`. Tests compare
it with the actual `sales-dashboard` server calls and its Supabase probe.

## Runtime dependency result — 2026-08-03

Only four tables have a current runtime caller:

| Table | Operation | Caller | Runtime authority | Failure behavior |
| --- | --- | --- | --- | --- |
| `audit_log` | insert | `mirrorAuditLogToSupabase` | service role | local audit remains; mirror warns |
| `integration_health` | upsert | `mirrorIntegrationHealthToSupabase` | service role | local health remains; mirror warns |
| `raw_imports` | bulk upsert | `mirrorStripeSyncToSupabase` | service role | local Stripe sync remains; mirror marks partial |
| `invoices_sales` | bulk upsert | `mirrorStripeSyncToSupabase` | service role | local Stripe sync remains; mirror marks partial |

All four are also read with `limit=1` by `scripts/check-supabase.js`, again with
the service role. The browser does not call Supabase directly. The dashboard's
live business path uses local JSON/file state plus provider APIs; the Supabase
writes are asynchronous best-effort mirrors.

The other fourteen tables have no runtime database call in the current source:

- identity/sales: `sales_team_members`, `sales_login_sessions`, `sales_calls`,
  `sales_call_transcripts`, `sales_ai_scores`, `ghl_opportunity_events`;
- customer model: `companies`, `customer_domains`, `contacts`, `documents`;
- integration/finance workflow: `integration_accounts`, `sync_runs`,
  `invoices_purchase`, `review_items`.

The word `contacts` in dashboard payloads refers to data fetched from
GoHighLevel and is not a read from `public.contacts`.

A live service-role count probe against the exact Autopilots project confirmed
that all fourteen no-caller tables contain zero rows. The four active mirrors
contained 17 audit rows, 3 health rows, 59 sales-invoice rows and 59 raw import
rows at the observation time. The probe performed no write and returned no row
content.

## First compatibility group activated — 2026-08-03

Migration `20260804030000_protect_unused_legacy_tables.sql` enabled RLS and
revoked `public`, `anon` and `authenticated` privileges on exactly the fourteen
no-caller tables. It did not add policies, alter data, touch the four active
mirrors or change service-role authority.

Before activation, the exact migration ran inside a transaction with assertions
and rolled back. After activation, `pnpm security:verify-legacy-live` proved:

- all fourteen protected tables remain empty and service-role-readable;
- every anonymous probe is denied with HTTP 401;
- active mirror counts remain 17, 3, 59 and 59;
- the migration registry contains the exact immutable checksum;
- no persistent probe write or external provider write occurred.

The Supabase Advisor rerun reduced errors from 18 to 4 and warnings from 51 to
23. The four errors are exactly the active mirror tables. The 26 information
items include the fourteen protected tables with RLS intentionally enabled and
no browser policy.

## Active mirror group activated — 2026-08-03

Migration `20260804033000_protect_active_legacy_mirrors.sql` applies the same
browser denial to `audit_log`, `integration_health`, `invoices_sales` and
`raw_imports` while preserving the service role. Before activation, a
rollback-only transaction executed the exact runtime shapes under
`service_role`: one audit insert, a health upsert, a two-row raw-import bulk
upsert and a sales-invoice upsert. Every conflict update was asserted and all
synthetic records plus the temporary RLS state rolled back to zero.

After activation, the live verifier confirmed all 18 legacy tables return HTTP
401 to the anonymous browser role. The active service-role counts remain 17, 3,
59 and 59 and all fourteen no-caller tables remain empty. A fresh Advisor run
reports 0 errors, 15 warnings and 30 information items.

## Safe remediation sequence

1. The fourteen-table no-caller group is complete and continuously verified by
   `pnpm security:verify-legacy-live`.
2. The four active mirrors are complete: their service-role write contracts
   passed inside a rolled-back transaction before RLS activation.
3. Rerun Security Advisor after each group. Never infer
   safety from warning counts alone; run the sales-dashboard tests and a bounded
   Supabase mirror acceptance.
4. Do not migrate these records into governed OS tables until ownership,
   retention, tenant keys, PII classification and source-of-truth decisions are
   explicit.

No production dashboard deploy, provider write, account change or destructive
database operation was part of this sequence.
