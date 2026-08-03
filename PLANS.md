# Autopilots OS Execution Plan

Status labels: `verified`, `inferred`, `proposed`, `blocked`.

## Current checkpoint — 2026-07-21

The Phase 0–3 sandbox lighthouse is implemented in `autopilots-platform`: personalized AI employee preview → requirements/legal gates → sandbox payment → Secure Data Room → internal workflow → versioned human approval. Server sessions, role policy, tenant scope, audit, execution evidence, kill switches, idempotency and an append-only demo cost ledger are verified by automated tests.

## Production foundation checkpoint — 2026-08-03

Status: `verified` locally and applied to the authorized existing Supabase
project **Autopilots** (`wurycoodzcybaxcgqxps`) on 2026-08-03. Managed identity
is now active in the local sandbox runtime; production cutover remains
`blocked` until the owner completes MFA enrollment and an authorized
disposable-target restore rehearsal proves recoverability.

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
  syntax, foundation contracts, all 45 immutable migration checksums,
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
- Portfolio now exposes a session-scoped runtime connector posture without
  endpoint or credential values. It distinguishes the internal Autopilots
  runtime, three deliberate local sandbox defaults and future explicit remote
  HTTPS configuration; origin and server-access state are presence-only.
  Current local truth is one internal runtime, three loopback defaults and an
  AutoReviews server credential that is not configured. The UI explicitly
  separates configuration validity from product health and production readiness.
- The managed portfolio is no longer sourced from the local OS fixture. The
  service-role-only `autopilots.portfolio.v2` snapshot reads the current legal
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
  signed-in session context may be called by `authenticated`; 16 current
  governed RPCs require `service_role`, six superseded RPCs are disabled and
  every browser role is explicitly revoked from server-only functions.
- A credential-safe live negative-authorization suite now checks the exact
  Autopilots project for wrong-profile, wrong-organization and anonymous denial
  across portfolio, brand, onboarding, incident and access reads. It makes no
  persistent write; the stronger synthetic two-tenant transaction remains a
  separate pre-cutover acceptance step.
- Four superseded human-authority monitoring lease RPCs are explicitly retired
  from the server-role surface. The functions and their evidence remain intact,
  but only the scoped service-principal v2 scheduler contracts stay callable.
- A rollback-only second-organization probe found that the v1 portfolio
  incident snapshot could combine incidents from two otherwise valid
  memberships. The replacement v2 contract requires the durable session's
  legal-entity ID and filters every incident and brand to that exact scope;
  unscoped v1 execution is retired.
- Advisor inventory found no OS errors, but authenticated table grants made 19
  governed tables discoverable through GraphQL and one governed trigger had a
  mutable search path. Session-context v2 now selects
  one deterministic legal entity, scopes every returned brand to it and is the
  only database RPC available to a signed-in browser; all direct governed table
  reads and legacy session-v1 execution are revoked.
- The post-migration Advisor rerun reduced warnings from 70 to 51 and confirmed
  zero remaining findings in the six governed schemas. The remaining findings
  belong to the legacy `public` compatibility boundary, the intentionally
  exposed bounded session-v2 RPC, or a project-level Auth setting.
- The 18 legacy RLS findings now have a machine-verified compatibility
  inventory. Only four tables are touched by the current `sales-dashboard`
  runtime, exclusively as service-role best-effort write mirrors; fourteen
  tables have no runtime database caller and can form the first rollback-safe
  RLS remediation group.
- That first legacy compatibility group is now active. All fourteen empty
  no-caller tables have RLS enabled and browser grants revoked; the live verifier
  confirms anonymous HTTP 401 denials while service-role access and the four
  active mirror counts remain intact. Advisor errors fell from 18 to 4 and
  warnings from 51 to 23. The active mirrors remain unchanged until their exact
  insert/upsert behavior passes a rollback-only write-contract acceptance.
- The four active mirrors have now passed that exact rollback-only service-role
  contract and are also RLS-protected with browser grants revoked. All 18 legacy
  tables deny anonymous REST access, the active counts remain 17/3/59/59, and a
  fresh Advisor run reports 0 errors, 15 warnings and 30 informational items.
  No production dashboard, provider, account or identity write was performed.
- The remaining legacy mutable-search-path warning is also removed. A
  rollback-only temporary trigger proved `public.set_updated_at()` with fixed
  `pg_catalog, public` resolution while preserving its body and four Gift
  triggers. Advisor now reports 0 errors, 14 warnings and 30 information items;
  Gift GraphQL grants remain unchanged pending their own dependency inventory.
- The Gift dependency inventory found six RLS tables, zero policies, 20 records,
  no local or Edge Function caller, no observed eight-day PostgREST traffic and
  last stored activity on 2026-06-22. Browser grants are now revoked while
  service-role counts remain 2/2/5/10/1/0. Advisor reports 0 errors, 2 warnings
  and 30 information items; the remaining warnings are the intentional bounded
  session bootstrap and the separately governed leaked-password Auth setting.
- Connector onboarding can now stage a durable internal intent without touching
  a provider. An authorized owner/admin action creates one scoped R2/R3 command,
  pending approval, zero-cost usage entry and audit event. Database constraints
  keep OAuth, provider-account connection, discovery, credential storage and
  external writes false. Rollback acceptance left zero residue; the live table
  remains empty and all four brands expose onboarding v2 through service role.
- Owners/admins can now approve or reject that internal intent with locked
  current context. The decision preserves the request risk class, closes the
  original pending command and approval, and creates a separate idempotent
  zero-cost decision command plus audit evidence. All five provider-effect flags
  remain false, and live acceptance left zero request or decision rows.
- Portfolio launch readiness now compares all four scoped software brands from
  the same governed evidence: 24 total steps, 5 completed, 7 requiring attention,
  0 pending connector approvals and 0 brands fully ready. Every brand exposes
  progress, current/next step and error status while provider authorization and
  external writes remain false. This score is onboarding progress, not a
  production-readiness claim.
- Future software brands can now be staged through one bounded portfolio intake
  under the existing Autopilots authority. The R2 request validates name, slug,
  code and risk profile and records command, approval, zero-cost usage and audit
  evidence. Live state remains four brands and zero launch requests; brand,
  sandbox, onboarding, provider authorization, credentials and writes all remain
  uncreated until a separately governed apply step is explicitly authorized.
- Pending software-launch requests can now be approved or rejected with an
  idempotent R2 decision locked to the current context. Approval remains internal
  evidence only: all six no-creation constraints remain false, there is no apply
  function, and live state remains four brands with zero launch requests.
- Managed Approval Center now reads one organization-scoped durable queue across
  all four brands. Live Supabase currently returns one historical approval and
  zero pending approvals. The view omits command payloads, fails closed instead
  of showing demo approvals and exposes no generic decision executor.
- Managed Human Task Inbox now reads one organization-scoped durable operations
  queue instead of demo tasks. Live truth is 0 open tasks, 3 active incidents,
  3 onboarding errors, 0 failed commands and 6 source-specific safe signals.
  Private incident context and command payload/results are omitted; generic task
  actions, provider writes and automatic remediation remain disabled.
- Managed Overview, Implementatie and Agent Control Room can no longer fall
  through to session-demo screens. Overview uses the durable Brand Digital
  Twin, Implementatie uses the governed onboarding projection, and Agent
  Control Room fails closed until a scoped durable agent registry exists. Demo
  lifecycle simulation, agent counts, pause controls and kill switches are not
  presented as live authority.
- Agent Control Room now reads a durable, operating-brand-scoped Supabase
  registry. Live state is intentionally empty: 0 registered agents, 0 observed
  agents and 0 controls. Runtime status requires timestamped source evidence;
  generic controls and external writes are constrained false and no demo agent
  was copied into the registry.
- Managed browser sessions no longer download `/api/v1/demo`, and the server
  rejects that route for managed internal sessions. The demo payload remains
  available only to the separate customer/demo journey, so internal operators
  cannot receive demo agents, demo workflows or process-memory actions even as
  unused browser state or through a manual API call.
- Portfolio now exposes organization-scoped durable monitoring history from
  Supabase instead of relying only on the current runtime snapshot. The latest
  20 runs include safe outcome, counts, timing, error code and lease-recovery
  evidence without holder/profile identifiers. Scheduler execution and product
  signals are separate truths: live acceptance returned 16 technically
  successful runs, 0 execution failures and 16 runs containing degraded or
  unavailable product signals. Automatic remediation, notification delivery
  and external writes remain false.
- Human Task Inbox now matches exact operating-brand/error-code pairs to 16
  versioned, durable first-response runbooks. Every bounded AutoReviews,
  AutoPlanner and RoofPlanner adapter outcome now has named, read-only guidance.
  AutoPlanner transport and contract failures no longer enter the database as
  generic codes. Unknown codes still fail closed to human triage; restarts,
  notifications, configuration changes and provider writes remain impossible.
- Product-health incidents now represent the newest observation per connector.
  A changed error code resolves the superseded incident with evidence instead
  of leaving two contradictory active problems. Live correction normalized the
  prior AutoPlanner `UNREACHABLE` code, preserved history and reduced active
  incidents from four to three: exactly one each for AutoReviews, AutoPlanner
  and RoofPlanner, all with an exact runbook.
- Health ingestion is now transactionally ordered per product connection. A
  database advisory lock serializes scheduler and manual observations, exact
  idempotent replays still succeed, and a late or equal-time observation is
  rejected before it can replace newer incident truth. Live acceptance proved
  first write, exact replay and a denied one-hour-old observation.
- Alert governance now evaluates active incidents against four durable severity
  policies. Repeated observations remain deduplicated in one incident; minimum
  occurrences, age and suppression windows produce only an internal operator
  recommendation. Live truth is 3 candidates and 3 escalation-due advisories,
  with exactly 0 notification attempts, 0 deliveries and no remediation or
  provider authority.
- Security Control now exposes one privacy-limited, organization-scoped session
  posture for owners, admins and auditors. Live truth is 1 active profile and
  0 active sessions because no real owner session was created. Token hashes,
  Auth user IDs and free revocation reasons are excluded; MFA policy and AAL2
  session evidence remain distinct, and generic session revocation is disabled.
  Anonymous access and an unknown profile are denied.
- Audit Trail now exposes the latest 50 append-only events as bounded
  organization evidence. Live acceptance returned 129 events in 24 hours,
  including 0 failed and 0 blocked events. Actor IDs, reasons, before/after
  payloads and evidence contents remain hidden; the page has no replay,
  mutation or provider action.
- Durable session restoration now selects exactly the same deterministic
  primary organization as the authenticated login bootstrap. A rollback-only
  adversarial acceptance attached a second organization and brand to the owner,
  proved that the foreign brand never entered the restored session, verified a
  five-minute activity-touch throttle and left 0 rows of residue. The server
  independently rejects duplicate, malformed or mixed-organization brand scope.

## Multi-project data-plane checkpoint — 2026-08-03

Status: `verified read-only foundation`.

- The existing Autopilots Supabase project `wurycoodzcybaxcgqxps` is now the
  only verified central control-plane registration.
- AutoReviews, AutoPlanner and RoofPlanner are projected as the three product
  data-plane positions under the same organization and login; Autopilots itself
  remains the overkoepelende control plane.
- Read-only schema discovery verified AutoPlanner through 54 schema objects and
  RoofPlanner through 38 schema objects. Their project identities are registered,
  while data authorization and active connections remain disabled.
- `AutoReviews Backups EU` was found in a separate Supabase organization and is
  explicitly `excluded_non_primary`; no primary AutoReviews project is proven.
- The registry stores no credential material, shares no project credentials,
  grants no provider authorization and exposes no generic registration action.
- Live service-role acceptance returned one central control plane, two verified
  product project identities, zero active data connections and one unregistered
  product backend. The AutoReviews backup remains excluded non-primary. Unknown
  profiles were denied with 403 and anonymous access with 401.
- The portfolio now shows this topology fail-closed and rebuilds the Supabase
  dashboard link only from a validated 20-character project reference.
- A durable `autopilots.product-snapshot.v1` catalog now defines the only
  permitted aggregate fields for AutoReviews, AutoPlanner and RoofPlanner.
  Direct database access, row-level records, personal data, message content,
  credentials, provider authorization and external writes are hard-disabled.
  All three contracts still require implementation and verification; no data
  connection is active.
- A transport-independent validator now enforces the exact per-product
  allowlists, complete envelopes, 15-minute freshness, five-record small-cell
  suppression of both value and exact group size, bounded segment names and
  finite non-negative metrics before a future connector payload can be
  accepted. AutoPlanner and AutoReviews now have local producer routes, but no
  live transport, credential or central ingestion is active. AutoReviews
  defaults its environment identity to `sandbox`; production must be explicit.
- A central GET-only transport adapter is also implemented but remains
  configuration-disabled. It validates a strong server secret before network
  use, blocks non-allowlisted destinations before attaching that secret,
  bounds response size and exposes only stable error codes. It is not wired
  into monitoring or persistence.
- RoofPlanner now has a local product-snapshot contract and an internal route
  on its required `agent/control-plane-snapshot` branch. Its runtime deliberately
  composes a disabled gateway because existing tenant RLS must not be bypassed
  for portfolio totals. A dedicated aggregate reader, independent review and
  separate activation authority remain required; nothing is pushed or live.
- AutoReviews now builds the exact seven-field product contract from its local
  SQLite aggregates and exposes it only through a disabled, GET-only,
  strong-secret gate. Its incident count is narrowly defined as dead-letter
  customer events, event jobs and billing usage events. The complete product
  suite passes 142 tests and a synthetic payload is accepted by the central
  validator; no deployment, secret or live catalog state changed.
- Migration inventory is 45 immutable files and the governed RPC surface is 37.
  The full gate passes 309 tests.

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
2. After owner TOTP, repeat the authenticated UI/API flow end to end. The live
   rollback two-tenant matrix, concurrency checks and backup inventory now
   pass; the separately authorized disposable-target restore remains pending.
3. After real owner TOTP enrollment, visually verify the durable Overview,
   Implementatie and portfolio monitoring history plus the fail-closed Agent
   Control Room, incidents, access roster, Security Control and Audit Trail; confirm that the
   current session is AAL2, then execute one intentional human acknowledgement
   end to end. Do not stage a real colleague until their role and scope are approved.
4. Visually verify the new connector staging and decision controls after owner
   TOTP. Do not stage a real connector request until the intended provider,
   brand and scope have been explicitly selected.
5. Visually verify the new-software intake after owner TOTP. Do not stage a real
   launch request until name, slug, code and risk profile are approved.
6. Add a separately authorized apply step for approved access. It must retain
   the no-provider boundary and may create an internal membership only after
   owner acceptance, recovery design and explicit scope review.
7. Add notification suppression and escalation delivery without autonomous
   remediation, after its provider channel is explicitly authorized.
8. After explicit OAuth permission, implement the provider-authorization
   executor for one approved connector request; start with read-only discovery,
   require current context, and keep provider writes disabled.
9. Connect Stripe as the first read-only discovery and reconciliation provider
   through that executor after its exact scopes are approved.
10. Move remaining governed command creation behind the durable repository
   without changing the legacy dashboard; portfolio and operating-brand reads
   are complete.
11. Select one real Autopilots agent identity and its authoritative runtime
   source before registering it. Add read-only observation ingestion first;
   keep pause, kill and external execution in separately approved workflows.
12. For each product-owned Supabase project, obtain explicit read-only discovery
   authority and prove its exact project reference before registration. Never
   copy product service-role keys into the central registry.

## Genuine blockers

- Production credentials and explicit authority for provider reads/writes.
- Selected production hosting and secrets vault.
- Approved legal document contents and production retention policy.
- A designated internal approver and escalation owner.

Rollback: stop `autopilots-platform`; the existing `sales-dashboard` remains untouched as the legacy operational application.
