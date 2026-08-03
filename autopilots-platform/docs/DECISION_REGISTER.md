# Decision Register

| Date | Decision | Reason | Status |
| --- | --- | --- | --- |
| 2026-07-21 | Use `autopilots-platform` as governed OS core | Existing small shell already models the intended preview journey | Accepted |
| 2026-07-21 | Keep `sales-dashboard` as legacy integration source | Avoid a risky rewrite and preserve existing work | Accepted |
| 2026-07-21 | Select preview-to-activation as lighthouse | Highest reusable value without live provider authority | Accepted |
| 2026-07-21 | Server policy is authoritative | UI hiding cannot enforce tenancy or roles | Accepted |
| 2026-07-21 | Keep external writes off | No production credentials or authority were provided for this core | Accepted |
| 2026-07-21 | Use append-only usage entries | Historical economics must remain reconstructable | Accepted |
| 2026-07-21 | Require versioned human approval for activation | Prevent stale or autonomous R3 decisions | Accepted |
| 2026-07-21 | Separate legal entity, operating brand and customer account IDs | A generic company filter cannot enforce financial or operational scope | Accepted |
| 2026-07-21 | Build AutoReviews read-only before provider writes | Data quality and mappings must be proven before autonomy | Accepted |
| 2026-07-21 | Unknown finance values remain null, never synthetic zero | Prevent false margin and revenue confidence | Accepted |
| 2026-08-03 | Use one central Autopilots control plane with product-owned data planes | One login and one governance layer without coupling every product's operational schema | Accepted |
| 2026-08-03 | Store credentials in a managed vault, never in control-plane rows | Limit breach impact and make rotation independently auditable | Accepted |
| 2026-08-03 | Introduce new product connections as read-only discovery first | Prove scope, identity mapping and source quality before commands or provider writes | Accepted |
| 2026-08-03 | Use passwordless Supabase Auth plus a server-owned HttpOnly session | One login without shared passwords or browser-persisted provider tokens | Accepted |
| 2026-08-03 | Create no managed application session before AAL2 | The control plane remains inaccessible until the required second factor is verified | Accepted |
| 2026-08-03 | Keep the existing Supabase Site URL and add the control-plane callback to the allowlist | Avoid breaking an existing localhost consumer while enabling the governed OS login | Accepted |
| 2026-08-03 | Persist only SHA-256 application-session handles in governed IAM | Sessions survive process restarts without storing reusable provider tokens; live role changes and revocation remain authoritative | Accepted |
| 2026-08-03 | Standardize every software launch as six governed onboarding steps | A new company can be added predictably without embedding provider-specific setup in the UI | Accepted |
| 2026-08-03 | Separate registered source health from an on-demand read-only probe | Stored evidence stays auditable while operators can see the current reachability without enabling writes | Accepted |
| 2026-08-03 | Deduplicate active incidents by brand, connector and stable error code | Repeated polling increases context version without creating alert noise | Accepted |
| 2026-08-03 | Treat incident acknowledgement as a governed R1 command | Human ownership remains idempotent, attributable, cost-recorded and protected from stale context | Accepted |
| 2026-08-03 | Keep health GET routes side-effect free and require an explicit POST to persist evidence | Viewing current status must never create hidden database writes | Accepted |
| 2026-08-03 | Use a non-retryable application SQLSTATE for stale acknowledgement context | A business conflict must return promptly and must not trigger database serialization retries | Accepted |
| 2026-08-03 | Run local automatic monitoring in bounded deterministic time buckets | Periodic evidence becomes idempotent and overlapping runs cannot amplify incident noise | Accepted |
| 2026-08-03 | Separate monitoring authority from audit actor | Membership grants scope, while audit truth remains the system monitor rather than impersonating the owner | Accepted |
| 2026-08-03 | Elect one scheduled monitor through a durable Supabase lease | Multi-instance runtimes must not multiply probes, incidents or cost; expired work can be recovered without deleting evidence | Accepted |
| 2026-08-03 | Treat freshness as explicit governed evidence | A reachable product and a recently persisted observation are different truths and must be shown separately | Accepted |
| 2026-08-03 | Give automated monitoring a dedicated non-login service principal | Scheduled evidence must not depend on or impersonate a human owner account | Accepted |
| 2026-08-03 | Scope machine permissions by legal entity, optional brand and an allowlisted capability | Future organizations and workloads must remain isolated even when they share the central control plane | Accepted |
| 2026-08-03 | Stage access changes as R2 commands before creating identities or memberships | Central administration needs durable intent, idempotency, audit and human approval without silently granting access | Accepted |
| 2026-08-03 | Exclude owner grants and provider invitations from the initial access workflow | Owner transfer and external delivery require stronger, separately authorized controls than ordinary role staging | Accepted |
| 2026-08-03 | Correct deployed IAM contracts with an immutable follow-up migration | Registered migration checksums remain trustworthy and production history is never rewritten after activation | Accepted |
| 2026-08-03 | Separate access decision from access application | Human approval must be auditable without silently creating an identity, membership or provider invitation | Accepted |
| 2026-08-03 | Treat `approved` as an explicit audit result | Approval is distinct from successful application and must not be mislabeled as an executed external effect | Accepted |
| 2026-08-03 | Pin every applied migration by filename and SHA-256 in the release gate | Deployed database history must remain immutable; corrections are always new migrations | Accepted |
| 2026-08-03 | Run one credential-free OS quality gate for every platform change | Syntax, migration integrity, secret patterns, architecture contracts and tests must fail before merge without production access | Accepted |
| 2026-08-03 | Hard-allowlist the existing Autopilots Supabase project in the migration runner | A valid credential or operator typo must never make another organization or project a migration target | Accepted |
| 2026-08-03 | Require exact HTTPS origin allowlisting for every remote product probe | Read-only must also prevent SSRF and credential disclosure caused by endpoint misconfiguration | Accepted |
| 2026-08-03 | Replace the managed portfolio fixture with a membership-scoped Supabase aggregate | One central view must derive organization, brands, connectors and incidents from durable authority without inventing customer or financial truth | Accepted |
| 2026-08-03 | Make every managed Operating Brand Digital Twin a durable scoped aggregate | Company detail must derive connector health, incidents and ledger truth from Supabase while missing business projections remain empty or null | Accepted |
| 2026-08-03 | Reject the generic in-memory demo command route in managed mode | A managed operator action must use a specific durable, scoped and auditable contract rather than appear successful only inside one process | Accepted |
| 2026-08-03 | Separate backup inventory evidence from restore evidence | A completed backup listing does not prove RPO, RTO or recoverability; restore remains unproven until a disposable-target rehearsal | Accepted |
| 2026-08-03 | Govern every public Autopilots RPC through one deny-by-default access matrix | A new or renamed database API must fail the release gate until its only allowed caller role is explicitly reviewed | Accepted |
| 2026-08-03 | Revoke service-role execution from superseded human-authority monitoring lease RPCs | The scheduler uses scoped service-principal v2 contracts; retaining callable v1 endpoints unnecessarily widens the trusted server API | Accepted |
| 2026-08-03 | Require legal-entity scope on every incident portfolio read | A profile can belong to multiple organizations; profile-only portfolio reads can mix otherwise valid memberships across tenants | Accepted |
| 2026-08-03 | Reduce the authenticated database surface to one bounded session-context v2 RPC | RLS prevented cross-row reads but still exposed governed tables through GraphQL; the browser needs identity and scope only, while all control-plane data reads are server-side | Accepted |
| 2026-08-03 | Protect unused legacy tables before changing active mirror contracts | Fourteen empty tables have no runtime caller and can be denied to browser roles independently; four service-role mirrors retain compatibility until rollback-only write acceptance exists | Accepted |
| 2026-08-03 | Keep legacy mirrors server-only behind service-role RLS bypass | Exact insert/upsert contracts pass after RLS and browser revocation; the legacy dashboard needs no direct browser database access | Accepted |
| 2026-08-03 | Fix legacy trigger search paths without replacing function bodies | Configuration-only correction removes mutable name resolution risk while preserving every existing trigger and data contract | Accepted |
| 2026-08-03 | Remove Gift browser grants while preserving service-role ownership | RLS with zero policies already blocks browser data access; revoking grants removes schema discovery without claiming the external legacy Gift service is retired | Accepted |
| 2026-08-03 | Separate connector intent from provider authorization | An owner may stage a scoped, idempotent R2/R3 request with approval, audit and zero-cost evidence, but OAuth, discovery, credentials, provider accounts and external writes remain impossible until separately authorized executors exist | Accepted |
| 2026-08-03 | Separate connector approval from provider execution | Human approval or rejection closes the internal request with current-context evidence but cannot start OAuth, connect an account, discover resources, store credentials or write externally | Accepted |
