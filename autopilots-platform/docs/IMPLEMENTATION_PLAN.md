# Implementation Plan

## Completed sandbox slice

- Server session login/logout, role-aware routing and scoped snapshots.
- Explicit command policy with R0–R3 risk and reversibility.
- Entitlement and versioned workflow fixture.
- Idempotent commands, audit evidence, execution records and usage costs.
- Secure onboarding gates, masked vault references and quarantined demo upload metadata.
- Human task inbox, approval center, stale-context protection and agent kill switches.
- Customer-safe and internal views with live-derived demo metrics.
- Canonical legal entity, operating brand and customer account identifiers.
- Read-only portfolio and Brand Digital Twin API with server-enforced brand membership.
- AutoReviews goals, lifecycle definition, integration registry, source health and Owner Exception projection.
- Append-only, idempotent cost ledger foundation with linked correction entries and quality labels.
- Read-only AutoReviews backend adapter for aggregate acquisition, customer-platform, delivery and integration signals.

Historical acceptance evidence at the end of this slice was 26 tests. The
current governed production-foundation evidence is maintained in `PLANS.md`,
`CONTROL_PLANE_COMPLETION_AUDIT.md` and the deployment runbooks; this historical
number must not be used as a current release claim.

## Next production increment

1. Apply and accept the exact 48/40 product-readiness chain on the pinned
   Autopilots Supabase project. Both the independent SELECT-only posture check
   and the rollback-only behavioral matrix must pass with zero residue.
2. Complete the real owner AAL2 journey. No managed application session may be
   created before Supabase confirms MFA.
3. Host and independently review one product-owned aggregate endpoint, starting
   with AutoPlanner or AutoReviews. Configure only a scoped vault reference;
   keep direct database access, provider authorization and writes disabled.
4. Pass all twelve readiness gates except the deliberately current human
   approval gate, then request R3 activation as a separate action.
5. Repeat per product. Add Stripe read-only discovery only after its OAuth
   scopes, reconciliation, revocation and rate-limit behavior are separately
   authorized.
