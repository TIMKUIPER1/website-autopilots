# Risk Register

| Risk | Impact | Current control | Owner / next action |
| --- | --- | --- | --- |
| Demo mistaken for production | Critical | Persistent demo labels; no external writes | Product: retain environment badges |
| Cross-tenant access | Critical | Server organization checks plus PostgreSQL RLS in the local foundation | Engineering: execute adversarial RLS tests against a disposable Supabase sandbox |
| Credential leakage | Critical | Raw demo secrets discarded | Security: managed vault and rotation |
| Incorrect financial truth | High | Demo cost quality label; no margin claims | FinOps: provider reconciliation |
| Duplicate/replayed effects | High | Tenant-scoped durable idempotency contract in the local foundation | Platform: validate concurrent requests in sandbox |
| Stale human approval | High | Context version and R3 approval are created transactionally | Platform: add execution-time row locking before enabling commands |
| In-memory data loss | High | Explicit sandbox boundary and durable repository seam | Platform: migrate read paths after sandbox acceptance |
| Provider outage/rate limit | High | No provider calls in core | Integrations: queues, backoff, health |
| Overbroad agent autonomy | High | Server allowlist, risk policy, kill switch | AI Ops: evals and earned autonomy |
| Legal evidence incomplete | High | Version/hash fixture only | Legal: approve documents/retention |
| Operating-brand metrics mistaken for live | Critical | Demo environment, source quality and unavailable values shown explicitly | Data: require successful sync and reconciliation before promotion |
| Brand/customer identifier collision | Critical | Immutable prefixed IDs and server membership checks | Data: preserve IDs in PostgreSQL migration |
| Missing AutoReviews mappings | High | Four external sources fail closed as blocked | Integrations: configure sandbox IDs and reconciliation |
| Control plane becomes a product-data monolith | High | Product-owned data planes and a versioned snapshot contract | Architecture: reject raw operational-table replication |
| AI links the wrong external resource | Critical | AI mappings remain proposals with confidence and evidence | Operator must approve mappings before promotion |
| Migration targets the wrong Supabase project | Critical | Deployment evidence pins project `wurycoodzcybaxcgqxps`, checksum and change ID; runner remains explicit and fail-closed | Operations: enforce project-reference allowlisting in CI before the next migration |
| Legacy `public` tables lack RLS | Critical | New OS schemas are isolated and fully RLS-protected; legacy tables were not changed during foundation deployment | Engineering: inventory all 18 Advisor findings and stage compatible policies before any legacy exposure or cutover |
| Supabase token leaks into application storage or logs | Critical | Access token is exchanged once, refresh token is discarded, and only a hashed opaque session handle is stored server-side | Security: add automated log redaction and durable encrypted session storage before production |
| Owner operates at AAL1 before MFA setup | Critical | The managed callback creates no Autopilots session until TOTP enrollment or challenge returns an AAL2 token | Identity: owner completes enrollment from the delivered login link; add a second recovery factor later |
| Local process restart invalidates sessions | Medium | Explicit sandbox boundary and passwordless re-entry; no provider token is persisted | Platform: select a durable managed session store before deployment |
