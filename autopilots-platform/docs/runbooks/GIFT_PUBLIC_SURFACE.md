# Legacy Gift public surface

## Evidence boundary — 2026-08-03

The exact inventory is `config/gift-public-surface.json`. It contains six
`public.gift_*` tables. All six have RLS enabled, zero policies and broad
`public`/`anon`/`authenticated`/`service_role` table grants. RLS therefore
already denies browser data access, while the grants unnecessarily expose the
objects through GraphQL schema discovery.

The tables contain 20 records in total:

| Table | Rows | Latest observed activity |
| --- | ---: | --- |
| `gift_conversations` | 2 | 2026-06-10 |
| `gift_dealerships` | 2 | 2026-06-12 |
| `gift_knowledge_items` | 5 | 2026-06-22 |
| `gift_messages` | 10 | 2026-06-12 |
| `gift_service_requests` | 1 | 2026-06-12 |
| `gift_vehicle_notes` | 0 | none |

The surface includes high/critical fields such as access codes, webhook URLs,
emails, telephone numbers, license plates, vehicle data, messages and service
requests. No row content was exported during inspection.

## Caller evidence

- no Gift table caller exists in the available local repositories;
- the exact Supabase project has no deployed Edge Function;
- no `gift_*` PostgREST event appeared in the available 2026-07-27 through
  2026-08-03 log window;
- zero policies means a browser role cannot currently perform a successful data
  read or write even though it can discover the objects;
- service-role ownership is preserved because an external legacy server may
  still exist outside the available repositories and log-retention window.

This evidence authorizes only browser-grant removal. It does not authorize data
deletion, schema migration, service-role revocation or a claim that the Gift
application is retired.

## Activated contract — 2026-08-03

Migration `20260804043000_protect_gift_graphql_surface.sql` revokes all table
privileges from `public`, `anon` and `authenticated` on the six inventoried
tables. It does not change RLS, policies, records, schema or service-role grants.

Before activation, the exact revokes ran in a transaction and proved:

- all six tables still have RLS;
- browser privileges are zero inside the transaction;
- `service_role` can count all six tables and the counts stay 2/2/5/10/1/0;
- rollback restores the original grants and leaves no data/configuration
  residue.

After activation, `pnpm security:verify-gift-live` showed HTTP 401 for all six
anonymous probes and unchanged service-role counts of 2/2/5/10/1/0. Supabase
Security Advisor fell from 14 to 2 warnings while staying at 0 errors and 30
information items.

The final two warnings are the intentional signed-in execution grant on
`public.autopilots_session_context_v2()` and the project-level leaked-password
setting. No provider, identity, account, data or external write was part of this
step.
