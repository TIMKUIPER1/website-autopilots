# Integration Source of Truth

| Domain | Current authority | Platform state | Write authority | Target |
| --- | --- | --- | --- | --- |
| Customer/workflow demo | `DemoStore` synthetic fixture | Verified demo | Local demo only | PostgreSQL/RLS |
| Stripe invoices/payments | `sales-dashboard` integration | Legacy/inferred | Disabled here | Signed webhooks + reconciliation |
| Wise transactions | CSV/API work in `sales-dashboard` | Legacy/inferred | Disabled here | Read/reconcile adapter first |
| GoHighLevel CRM | `sales-dashboard` integration | Legacy/inferred | Disabled here | Scoped adapter + cursors |
| Documents | Existing mail/GHL/Drive processes | Unverified | Disabled here | Object store + metadata registry |
| Secrets | Environment/manual setup | Unverified | Demo discards raw values | Managed vault references |
| AI/voice/SMS usage | Provider dashboards/legacy app | Unverified | Disabled here | Immutable normalized usage ledger |
| Connector authorization intent | Autopilots OS `integration.connector_requests` | Verified internal staging | No provider authority | Human-approved executor per provider after separate permission |
| Supabase project topology | Autopilots OS `integration.product_data_planes` + `integration.product_data_plane_discoveries` | Central, AutoPlanner and RoofPlanner identities verified; 0 active cross-project data connections; AutoReviews backup excluded | Metadata/fingerprint only; no stored credentials or provider authority | Approve and build separate read-only data connector per verified product |
| Product control-plane snapshots | Autopilots OS `integration.product_snapshot_contracts` | Three privacy-safe contracts registered; 0 implemented/verified and 3 requiring implementation | Aggregate reads only after verification; direct database, row-level, credential, provider and external-write authority disabled | Product-owned `autopilots.product-snapshot.v1` aggregate endpoint per product with scope, freshness, small-cell suppression and reconciliation evidence |

Local implementation evidence does not change live authority: AutoPlanner and
AutoReviews have complete local producer routes and deployment-verification
packages. AutoReviews commit `60ca9db`
also self-validates before serving, declares a value-less Render secret slot and
explicit production identity, and ships a secret-safe GET-only deployment
verifier; all 147 product tests pass and its generated production envelope
passes the central validator. Its code default remains `sandbox`, and
`open_incidents_count` is limited to dead-letter customer events, event jobs
and billing-usage events. AutoPlanner commit `16cb80e` makes its route available
only in explicit production, self-validates the exact contract, returns an
aggregate zero rather than inventing a segment when a grouped query is empty,
and ships an exact-origin verifier that proves denied then authorized GET. Its
full build, 98 tests and database-schema validation pass; both populated and
empty generated production envelopes pass the central validator. RoofPlanner
commit `1497d5b` adds a pending service-role-only aggregate SQL function, exact
Supabase-project binding, staging-only identity, product self-validation and a
secret-safe denied/authorized GET verifier. Its complete workspace gate passes
574 tests with zero failures and two existing service-dependent integration
skips; generated populated and empty staging envelopes pass the central
validator. Its migration is not applied and its repository-required independent
review is pending. None of these routes is hosted or centrally connected; the
live catalog therefore remains 0 verified and 3 requiring implementation.

`docs/runbooks/PRODUCT_CONNECTOR_CUTOVER.md` is the reusable product boundary.
It requires product-side self-validation, exact HTTPS origin binding, dedicated
per-environment secrets, denied-before-authorized GET proof, revocation,
reconciliation and independent review before a separately approved R3
activation. Environment-variable support is local/runtime plumbing only;
production values must be injected from managed vault references.

The local Autopilots runtime now has a parallel, organization-scoped GET reader
for these three product contracts. It makes no request without a dedicated
32-character product snapshot secret, never returns endpoint or credential
values, isolates product failures and forwards only validated fresh aggregates
to the internal portfolio. It performs no persistence, remediation, provider
authorization or external write. Because no endpoint/secret pair is activated,
this capability does not change the live status above.

Rules: one authority per field; store provider IDs and sync cursors; raw provider payloads are evidence, normalized records drive products; reconciliation never silently overwrites financial history; corrections append adjustment records.

## AutoReviews lighthouse matrix

| Data class | Authority | Internal projection | Freshness | Conflict and reconciliation | Sensitivity / retention |
| --- | --- | --- | --- | --- | --- |
| Leads and opportunities | GoHighLevel | Customer/brand lifecycle projection via explicit external mapping | 15 min | GHL wins; conflict event and operator review | Personal / contract + 90 days |
| Meetings | Connected calendar | Meeting projection with provider event ID | 15 min | Calendar wins; cancelled source event supersedes queued work | Personal / contract + 90 days |
| Orders, subscriptions, payments | Stripe | Financial projection and brand/customer dimensions | Webhook + daily | Stripe wins for payment objects; append reconciliation differences | Financial / 7 years |
| Review conversations | Approved messaging provider | Conversation/result projection | 5 min | Provider event wins; cooldown and deduplication required | Personal / approved policy |
| Goals, policies, workflows and mappings | Autopilots OS | Canonical internal records | Direct | Version conflict fails closed | Internal / policy controlled |

Current contract status: the legacy AutoReviews aggregate export and the new
product-owned `autopilots.product-snapshot.v1` producer are implemented locally.
The product-owned producer now has a deployment-verification package, but
neither route is hosted or centrally active. GoHighLevel/calendar configuration
awaits first reconciliation; Stripe and WhatsApp remain
`blocked_missing_connection`. No revenue, cost or margin claim may be shown
until Stripe and the OS ledger reconcile.

The legacy server-side adapter accepts only `autoreviews.os-snapshot.v1` with
classification `aggregate_no_pii`. Remote connector bases require HTTPS plus
an exact separately configured allowed origin; only loopback endpoints may use
HTTP. URLs with credentials, query strings or fragments are rejected before
fetch, responses are size-bounded, and destination/response failures expose
only stable codes. It never consumes the AutoReviews admin API, raw SQLite
rows, contact identities or provider credentials.

The governed successor contract is validated by the shared product-snapshot
adapter. It has the exact seven-field AutoReviews allowlist, 15-minute freshness,
five-record small-cell suppression and the same no-PII boundary. Its local route
is GET-only, returns 503 without a separately configured strong secret and is
available to the local central portfolio reader only after configuration. It is
not wired into monitoring or persistence.

Connection readiness is locally governed by twelve expiring gates and a
server-only organization projection. Its evidence model stores only hashes and
bounded categories, not endpoints, secrets or payloads, and cannot be written by
the runtime role. The migration and API route are locally verified but not live;
the current Supabase project still has no readiness evidence rows, active product
data connections, provider authorization or external writes.
Technical gate evidence can locally be recorded only through a service-role
RPC that requires organization owner/admin/operator scope. It stores a SHA-256,
bounded source category and timestamps, creates an idempotent R1 command, audit
event and zero-cost usage entry, and derives expiry from the gate policy. Raw
payloads, endpoints, credentials and tokens are not accepted. Project identity
and current human approval remain separate authorities. This dependent
migration is also not live.

The pending three-migration chain now also has an independent, project-pinned
live acceptance verifier. It performs one SELECT-only Management API query and
fails closed unless the exact migration/RPC inventory, reviewed change IDs,
checksums, role denials, append-only trigger, no-effect contract flags and zero
operational residue all match. It cannot apply migrations or record evidence
and does not change the current live status.

A separate behavioral acceptance is prepared for the same post-migration
window. It proves valid owner/operator evidence, exact replay, role and scope
denials, source/freshness enforcement, append-only behavior and full batch
rollback inside one uncommitted transaction. The independent clean-posture
verifier runs both before and after; this tool is not a real evidence-ingestion
path and may leave no command, usage, audit or evidence row.

The local managed server can derive `contract_probe`, `privacy_probe` and
`freshness_probe` evidence from a product snapshot only after the shared exact
validator succeeds again. An internal MFA session selects only the scoped
product; the browser cannot submit hashes or evidence content. Domain-separated
SHA-256 values are recorded through one atomic database call, so partial
three-gate evidence cannot result. This route has no UI action, remains disabled
without product endpoint secrets and does not change live authority.
