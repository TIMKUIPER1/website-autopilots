# Autopilots control-plane completion audit

Audit date: 2026-08-03. Target: the existing Autopilots Supabase project
`wurycoodzcybaxcgqxps`. This matrix separates implemented code, live authority
and remaining acceptance; local tests never substitute for live evidence.

| Objective requirement | Authoritative current evidence | Status | Required proof before completion |
| --- | --- | --- | --- |
| One safe login | Passwordless Supabase Auth, server-owned HttpOnly sessions, durable hashed session handles, one organization resolver and AAL2-only session creation are implemented. Exact live inspection proves the owner profile, owner membership and Auth link are active; verified TOTP factors and active AAL2 sessions are both zero. Unauthenticated browser acceptance exposes only the Autopilots OS login | Backend complete; user acceptance pending | Owner completes the documented TOTP and real AAL2 login/logout/restart journey |
| Organization and role management | Legal entity, brand, membership, roster, staged R2 access request and current-context approve/reject contracts are live and server scoped | Partially verified | Separately authorize and accept the identity/membership apply workflow; owner transfer and provider invitations remain out of scope |
| Central control plane with product-owned backends | Autopilots is registered as control plane; the live provider-neutral runtime registry has AutoReviews on Render/SQLite and AutoPlanner plus RoofPlanner on Supabase/PostgreSQL. The separate Supabase topology still excludes the AutoReviews encrypted backup. Exact role and no-effect verification passed for all three identities | Verified live foundation | Retain one vault and cutover boundary per product; never treat the AutoReviews backup project as an operational source |
| Read-only product connectors | Three exact aggregate contracts, central validators and non-deployed product producers now exist. The central live checklist shows all 12 gates per product with responsible discipline, next proof step and evidence expiry. AutoReviews and AutoPlanner have self-validating production packages; RoofPlanner has a self-validating protected-staging package with an unapplied aggregate migration. Active data connections remain zero | Partially implemented | Independently review RoofPlanner, validate its migration on a disposable target, then deploy each producer under separate authority, configure scoped vault references and pass freshness, privacy, reconciliation, rate-limit, revocation and failure-mode gates |
| Central monitoring and error visibility | Durable health observations, stable error codes, incidents, runbooks, 15-minute elected scheduler, monitoring history and alert eligibility are implemented without remediation or delivery | Verified read-only foundation | Authorize a notification channel before adding delivery; continue to keep remediation separately governed |
| Safe operator actions | Incident acknowledgement and typed governance decisions carry scope, current context, idempotency, risk, audit and usage evidence | Partially verified | Complete owner AAL2 UI acceptance; add each future action only as a typed workflow, never a generic executor |
| World-class database verification | Exact 49 live migrations and 41 governed RPCs are accepted. The 48/40 readiness posture, rollback-only behavior and 49/41 runtime topology all passed with zero residue/effects. Fresh Advisors report 0 security/performance errors | Verified live foundation | Keep exact forward-only manifests and repeat posture/behavior/Advisor verification for every database change |
| Recoverability | Seven daily physical backups and WAL-G are visible; PITR is off | Not proven | Separately authorize a disposable-target restore rehearsal and prove RPO/RTO before production cutover |
| Provider and external effects | Provider authorization, credential material in control-plane rows, direct database reads, notification delivery, autonomous remediation and external writes remain disabled | Safely blocked | Separate named authorization and risk-matched acceptance are required per provider/effect |

## Current conclusion

The backend is configured as far as Work Authorization A permits and its live
foundation is independently accepted. The remaining critical path requires new
human or external authority: owner AAL2 acceptance, one independently reviewed hosted product
aggregate connector, then repeat the same gated pattern per product. Production
readiness additionally requires the disposable restore rehearsal.
