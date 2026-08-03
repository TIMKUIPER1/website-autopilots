# Autopilots OS Execution Plan

Status labels: `verified`, `inferred`, `proposed`, `blocked`.

## Current checkpoint — 2026-07-21

The Phase 0–3 sandbox lighthouse is implemented in `autopilots-platform`: personalized AI employee preview → requirements/legal gates → sandbox payment → Secure Data Room → internal workflow → versioned human approval. Server sessions, role policy, tenant scope, audit, execution evidence, kill switches, idempotency and an append-only demo cost ledger are verified by automated tests.

## Production foundation checkpoint — 2026-08-03

Status: `verified` locally and applied to the authorized existing Supabase
project **Autopilots** (`wurycoodzcybaxcgqxps`) on 2026-08-03. Managed identity
is now active in the local sandbox runtime; production cutover remains
`blocked` until the owner completes MFA enrollment and cross-tenant, backup
and restore tests pass.

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
- Application sessions are durable and revocable in `iam.app_sessions`. Only
  a SHA-256 token hash is stored, service-role RPCs are the sole interface, and
  each resolve rechecks active profile, MFA and memberships. A verified restart
  test returned 200 before and after a new process, then 401 after logout.
- A reusable product-onboarding registry now stores six governed steps per
  brand: foundation, website, Supabase, product API, Stripe and monitoring.
  The service-role read RPC rechecks profile and brand membership; anonymous
  and authenticated direct execution is blocked.
- Live read-only product probes return stable, non-sensitive error codes.
  Autopilots is healthy, AutoPlanner is degraded because database and queue are
  missing, and the current AutoReviews and RoofPlanner endpoints are
  unavailable. All four probes confirm `externalWrites=false`.
- Governed health observations now carry an idempotent observation key and
  active incidents deduplicate by brand, connection and error code. Human
  acknowledgement is an R1 command with current context version, audit evidence
  and a zero-cost usage entry. The complete lifecycle passed as `service_role`
  inside a rolled-back live acceptance transaction.
- The authenticated runtime now exposes scoped incident reads, explicit
  idempotent health capture and MFA-gated acknowledgement. Four honest initial
  observations produced three active incidents and four audit events, with no
  acknowledgement command, acknowledgement usage or external write. Parallel
  AutoPlanner captures kept one incident and advanced only its context version.
- A retry-sensitive PostgreSQL `40001` stale-context signal was replaced with a
  non-retryable application conflict after HTTP acceptance exposed the delay;
  stale acknowledgement now returns HTTP 409 in about half a second.
- A bounded scheduler now runs read-only probes every 15 minutes in the active
  local sandbox. A durable Supabase lease elects exactly one runtime per time
  bucket; heartbeat, bounded expired-lease recovery, deterministic observation
  keys and R0 completion evidence provide independent controls. A concurrent
  two-instance acceptance elected one winner and one safe skip. Freshness is
  reported separately for every brand. No acknowledgement or external write
  was created.
- Automated monitoring no longer borrows the owner profile. The dedicated
  `autopilots:health-monitor` service principal has exactly three allowlisted
  portfolio scopes, has no Auth user or human profile, cannot log in, cannot
  enable external writes and is the recorded machine actor for new health and
  run evidence. The legacy human-authority lease RPC is revoked.
- Central access management now has a server-authoritative organization roster
  and a staged request flow. Only legal-entity-wide owners, admins and auditors
  can read the roster; only owners and admins can stage changes. Every request
  becomes an idempotent R2 command, pending approval, zero-cost usage entry and
  audit event. Owner grants, provider invitations, Auth-user creation and
  external writes are deliberately excluded.
- Live rollback-safe acceptance verified first-write, replay and divergent-key
  behavior and left zero synthetic access requests, commands, approvals, usage
  or audit rows. Browser roles have no table or RPC access. The two immutable
  IAM migrations and their registered checksums match production.
- R2 access approval and rejection are now server-governed and require the
  current locked request context. The decision closes the pending approval and
  original command, creates its own idempotent command, usage and audit
  evidence, and still applies no identity, membership, provider invitation or
  external write. Live rollback-safe acceptance left no synthetic records.
- The owner access screen now exposes those bounded approve/reject decisions,
  sends the current context version with a fresh idempotency key and refreshes
  the authoritative roster. Its confirmation and result copy explicitly keep
  accounts, memberships, provider invitations and external activation blocked;
  real-owner visual acceptance remains pending TOTP enrollment.
- A credential-free Autopilots OS release gate now verifies server and browser
  syntax, foundation contracts, all 14 immutable migration checksums,
  transaction wrappers, tracked-file secret patterns and the complete test
  suite on every platform pull request and protected-main push. It performs no
  migration or provider call.
- The migration runner now resolves the Supabase project reference from either
  a direct database host or pooler username and accepts only the existing
  Autopilots project `wurycoodzcybaxcgqxps`. Wrong, ambiguous and non-Postgres
  targets fail before opening a connection and errors never echo credentials.
- All current product adapters now enforce a shared read-only destination
  policy: remote endpoints require HTTPS and an exact separately configured
  origin, rejected destinations are never fetched, AutoReviews secrets are
  never attached to them, and oversized or malformed responses fail with
  stable non-sensitive codes.
- The managed portfolio is no longer sourced from the local OS fixture. A new
  service-role-only `autopilots.portfolio.v1` snapshot reads the current legal
  entity, membership-scoped brands, connector status and active incidents from
  Supabase. It reports no synthetic customers, goals or financial quality;
  live acceptance returned four scoped brands, four product sources, three
  blocked sources, `demoMode=false` and `externalWrites=false`.
- Every managed operating-brand detail view now uses the service-role-only
  `autopilots.brand-twin.v1` Supabase aggregate. Connector health, incidents
  and qualifying ledger costs are membership scoped; unsupported customer,
  goal, lifecycle, revenue and margin projections remain empty or null. Live
  acceptance passed for all four brands, while anonymous and unknown-profile
  access failed closed.
- Supabase mode now rejects the generic in-memory `/api/v1/demo/command` route
  with `MANAGED_COMMAND_ROUTE_REQUIRED`, and the browser preflights the same
  boundary. Only dedicated durable actions—monitoring probes, incident
  acknowledgement and access governance—may report managed success.
- Backup inventory is now machine-verifiable without database credentials.
  The live management plane lists seven completed daily physical backups in
  `eu-central-1`, with WAL-G active and PITR disabled. The contract deliberately
  remains `restoreRehearsed=false` and `productionReady=false` until an
  explicitly authorized disposable-target restore proves RPO and RTO.
- The platform release gate now discovers every public `autopilots_*` database
  API and compares it with an explicit caller matrix. Only the RLS-scoped
  signed-in session context may be called by `authenticated`; all other 20
  governed RPCs require `service_role` and explicitly revoke browser roles.
- A credential-safe live negative-authorization suite now checks the exact
  Autopilots project for wrong-profile, wrong-organization and anonymous denial
  across portfolio, brand, onboarding, incident and access reads. It makes no
  persistent write; the stronger synthetic two-tenant transaction remains a
  separate pre-cutover acceptance step.
- Four superseded human-authority monitoring lease RPCs are explicitly retired
  from the server-role surface. The functions and their evidence remain intact,
  but only the scoped service-principal v2 scheduler contracts stay callable.

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

1. Complete owner TOTP enrollment from the delivered login link and verify the
   real owner session end to end.
2. Execute authenticated cross-tenant, concurrency, backup and restore tests
   before any runtime cutover.
3. After real owner TOTP enrollment, visually verify incidents and the new
   access roster, then execute one intentional human acknowledgement end to
   end. Do not stage a real colleague until their role and scope are approved.
4. Add a separately authorized apply step for approved access. It must retain
   the no-provider boundary and may create an internal membership only after
   owner acceptance, recovery design and explicit scope review.
5. Add notification suppression and escalation delivery without autonomous
   remediation, after its provider channel is explicitly authorized.
6. Connect Stripe as the first OAuth-based read-only discovery and
   reconciliation connector after explicit OAuth permission; keep provider
   writes disabled.
7. Move remaining governed command creation behind the durable repository
   without changing the legacy dashboard; portfolio and operating-brand reads
   are complete.
8. Inventory and remediate the 18 pre-existing Supabase Advisor findings in
   the legacy `public` schema with compatibility tests; do not enable blanket
   RLS while `sales-dashboard` still depends on those tables.

## Genuine blockers

- Production credentials and explicit authority for provider reads/writes.
- Selected production hosting and secrets vault.
- Approved legal document contents and production retention policy.
- A designated internal approver and escalation owner.

Rollback: stop `autopilots-platform`; the existing `sales-dashboard` remains untouched as the legacy operational application.
