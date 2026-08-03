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
