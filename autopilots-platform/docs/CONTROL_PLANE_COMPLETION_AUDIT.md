# Autopilots control-plane completion audit

Audit date: 2026-08-03. Target: the existing Autopilots Supabase project
`wurycoodzcybaxcgqxps`. This matrix separates implemented code, live authority
and remaining acceptance; local tests never substitute for live evidence.

| Objective requirement | Authoritative current evidence | Status | Required proof before completion |
| --- | --- | --- | --- |
| One safe login | Passwordless Supabase Auth, server-owned HttpOnly sessions, durable hashed session handles, one organization resolver and AAL2-only session creation are implemented; owner profile is MFA-required | Partially verified | Owner completes TOTP and a real AAL2 login/logout/restart/revocation journey passes visually and through the managed API |
| Organization and role management | Legal entity, brand, membership, roster, staged R2 access request and current-context approve/reject contracts are live and server scoped | Partially verified | Separately authorize and accept the identity/membership apply workflow; owner transfer and provider invitations remain out of scope |
| Central control plane with product-owned backends | Autopilots is registered as control plane; AutoPlanner and RoofPlanner identities are verified; AutoReviews remains honestly unregistered; direct cross-project database and credential sharing are disabled | Verified foundation | Prove AutoReviews' primary backend identity and retain one vault boundary per product |
| Read-only product connectors | Three exact aggregate contracts, central validators and non-deployed product producers now exist. AutoReviews and AutoPlanner have self-validating production packages; RoofPlanner has a self-validating protected-staging package with an unapplied aggregate migration. Generated populated and empty envelopes from all three pass the central contract; active data connections remain zero | Partially implemented | Independently review RoofPlanner, validate its migration on a disposable target, then deploy each producer under separate authority, configure scoped vault references and pass freshness, privacy, reconciliation, rate-limit, revocation and failure-mode gates |
| Central monitoring and error visibility | Durable health observations, stable error codes, incidents, runbooks, 15-minute elected scheduler, monitoring history and alert eligibility are implemented without remediation or delivery | Verified read-only foundation | Authorize a notification channel before adding delivery; continue to keep remediation separately governed |
| Safe operator actions | Incident acknowledgement and typed governance decisions carry scope, current context, idempotency, risk, audit and usage evidence | Partially verified | Complete owner AAL2 UI acceptance; add each future action only as a typed workflow, never a generic executor |
| World-class database verification | 45 live migrations and 37 governed RPCs are currently accepted; 48/40 readiness target has exact apply, read-only posture and rollback-only behavioral verifiers | Pending live acceptance | Release macOS Keychain access, apply the three-migration transaction, run both verifiers, rerun Advisor and record exact evidence |
| Recoverability | Seven daily physical backups and WAL-G are visible; PITR is off | Not proven | Separately authorize a disposable-target restore rehearsal and prove RPO/RTO before production cutover |
| Provider and external effects | Provider authorization, credential material in control-plane rows, direct database reads, notification delivery, autonomous remediation and external writes remain disabled | Safely blocked | Separate named authorization and risk-matched acceptance are required per provider/effect |

## Current conclusion

The central governance and read-only operating foundation is substantial, but
the full objective is not complete. The critical path is: live readiness-chain
acceptance, owner AAL2 acceptance, one independently reviewed hosted product
aggregate connector, then repeat the same gated pattern per product. Production
readiness additionally requires the disposable restore rehearsal.
