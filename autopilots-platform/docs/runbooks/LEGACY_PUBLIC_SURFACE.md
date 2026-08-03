# Legacy public Supabase surface

## Purpose

This is the compatibility gate between governed `autopilots-platform` and the
legacy `sales-dashboard`. It covers the 18 `public.*` tables reported by
Supabase Security Advisor with RLS disabled. Inventory is read-only; it does not
authorize a grant, policy, table or runtime change.

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

## Safe remediation sequence

1. Revoke `anon` and `authenticated` access and enable RLS first on the fourteen
   no-caller tables in one rollback-capable migration. Add denial checks for
   both browser roles and verify the service-role probe remains unchanged.
2. Treat the four active mirror tables separately. Preserve their existing
   service-role insert/upsert shapes, unique-conflict behavior and best-effort
   failure semantics. Add a rolled-back write contract before changing RLS.
3. Rerun Security Advisor and export the result after each group. Never infer
   safety from warning counts alone; run the sales-dashboard tests and a bounded
   Supabase mirror acceptance.
4. Do not migrate these records into governed OS tables until ownership,
   retention, tenant keys, PII classification and source-of-truth decisions are
   explicit.

No production dashboard deploy, provider write, account change or destructive
database operation belongs to this sequence.
