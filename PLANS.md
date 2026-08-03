# Autopilots OS Execution Plan

Status labels: `verified`, `inferred`, `proposed`, `blocked`.

## Current checkpoint — 2026-07-21

The Phase 0–3 sandbox lighthouse is implemented in `autopilots-platform`: personalized AI employee preview → requirements/legal gates → sandbox payment → Secure Data Room → internal workflow → versioned human approval. Server sessions, role policy, tenant scope, audit, execution evidence, kill switches, idempotency and an append-only demo cost ledger are verified by automated tests.

## Production foundation checkpoint — 2026-08-03

Status: `verified` locally and applied to the authorized existing Supabase
project **Autopilots** (`wurycoodzcybaxcgqxps`) on 2026-08-03. Managed identity
is now active in the local sandbox runtime; production cutover remains
`blocked` until the owner completes MFA enrollment and durable-session,
cross-tenant and restore tests pass.

- A transactional PostgreSQL/Supabase migration defines six governed schemas:
  core, IAM, integrations, workflows, ledger and audit.
- Seventeen durable tables cover legal entities, operating brands,
  environments, memberships, connector discovery and health, incidents,
  commands, approvals, tasks, usage and audit evidence.
- Row-level security is enabled for every governed table; authenticated direct
  writes are denied and server-side membership remains authoritative.
- Usage and audit history are append-only. Commands have tenant-scoped
  idempotency, risk classification and transactional R3 approval evidence.
- Credentials are vault references only. External writes and production
  startup remain blocked.
- Autopilots is the central control plane; AutoPlanner, AutoReviews and
  RoofPlanner retain product-owned operational data planes.
- `sales-dashboard` remains untouched as the legacy operational application
  and integration source until a measured migration is complete.
- Live acceptance confirmed 6 schemas, 17 governed tables, RLS on all 17,
  17 read policies, 4 brands, 16 environments, 5 connector definitions, zero
  connections, zero external writes and an exact migration checksum. The 24
  pre-existing `public` tables remained intact.
- `admin@auto-pilots.io` is bootstrapped as MFA-required owner across the four
  governed brands with R3 approval and audit evidence.
- Passwordless Supabase Auth now validates tokens server-side. A
  security-invoker RPC returns only the signed-in profile, IAM role and
  RLS-authorized brands; anonymous execution is revoked.
- The local sandbox at `127.0.0.1:4310` uses managed Auth, an opaque HttpOnly
  application session and a TOTP enroll/challenge/verify callback. No
  application session is created until Supabase confirms `aal2`. Provider
  writes remain disabled.

## Website release safety checkpoint — 2026-07-26

Status: `verified` locally and externally enforced.

- `autopilots-website` is documented as the only source of truth for
  `auto-pilots.io`.
- The website quality workflow lives in the active root GitHub workflow folder.
- Ordinary pushes no longer trigger the legacy GitHub Pages deployment.
- The release contract blocks stale branch bases, protected-file deletion,
  excessive rollback-sized deletions, missing critical routes and artifacts
  without a commit identity.
- Local Netlify production deploys are break-glass only and require a clean
  `main` exactly equal to `origin/main`.
- GitHub protects `main` with a pull-request requirement, a strict required
  `Verify complete website release` status check, and deletion/force-push
  protection without bypass.
- Netlify is linked to `TIMKUIPER1/website-autopilots`, publishes only `main`,
  runs `npm run build && npm run release:verify`, and automatically publishes
  only after a checked pull request reaches protected `main`.
- Codex must finish every requested website publication by verifying that the
  live release identity matches the merged `main` commit.
- The full French visible-language audit remains `blocked`: the existing
  campaign components contain Dutch copy on two French funnel routes. The
  production release gate still enforces route, canonical, hreflang,
  placeholder, public-safety and link integrity checks while that separate
  localization repair is pending.

## Phase gates

- [x] Phase 0: inventory, baseline, risk containment and explicit demo boundary.
- [x] Phase 1: lighthouse, architecture, source truth, risks and decisions documented.
- [x] Phase 2: minimum server-governed platform for the lighthouse.
- [x] Phase 3 sandbox: reusable, measurable vertical slice with human approval.
- [ ] Phase 3 production: durable database, managed identity, real provider verification and deployment.
- [ ] Phase 4: deepen command center only after production foundation passes.
- [ ] Phase 5: add finance/delivery/marketing slices one evaluated workflow at a time.
- [ ] Phase 6: production hardening, SLOs, restore rehearsal and incident readiness.

## Next unblocked actions

1. Complete owner TOTP enrollment from the delivered login link and rotate the
   local in-memory application session into a durable managed session store.
2. Execute authenticated cross-tenant, concurrency, backup and restore tests
   before any runtime cutover.
3. Move portfolio reads and governed command creation behind the durable
   repository without changing the legacy dashboard.
4. Implement Stripe as the first read-only discovery and reconciliation
   connector; keep provider writes disabled.
5. Add CI gates for migration validation, tests, secret scanning and
   architecture fitness checks.
6. Inventory and remediate the 18 pre-existing Supabase Advisor findings in
   the legacy `public` schema with compatibility tests; do not enable blanket
   RLS while `sales-dashboard` still depends on those tables.

## Genuine blockers

- Production credentials and explicit authority for provider reads/writes.
- Selected production hosting, durable session store and secrets vault.
- Approved legal document contents and production retention policy.
- A designated internal approver and escalation owner.

Rollback: stop `autopilots-platform`; the existing `sales-dashboard` remains untouched as the legacy operational application.
