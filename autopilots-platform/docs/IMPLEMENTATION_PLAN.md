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

Acceptance evidence: `node --test` passes 26 tests and the browser journey is documented in the local runbook.

## Next production increment

Implement PostgreSQL repositories and migrations behind `DemoStore` and `OperatingSystemStore`. Acceptance requires RLS adversarial tests, transactional workflow/audit/ledger writes, append-only correction semantics, migration rollback and fixture parity. Do not connect a provider until this passes.

Then add Stripe sandbox as the first adapter: restricted read scopes, signed webhook verification, replay/idempotency tests, reconciliation status, degraded health state and no live key in browser or repository.
