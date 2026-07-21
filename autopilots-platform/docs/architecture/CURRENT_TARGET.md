# Current and Target Architecture

## Verified current state

- `autopilots-platform` is a local, synthetic sandbox with a Node HTTP server and in-memory `DemoStore`.
- Authentication is enforced with server-side opaque sessions and HttpOnly, SameSite=Strict cookies.
- Server policy separates `customer` and `internal` commands and routes.
- Every record and command is scoped to `organizationId`; cross-tenant requests are rejected.
- Commands are idempotent per tenant and append audit, execution and measured demo-cost evidence.
- No external calls, provider writes, real payments or real secret storage occur.
- `sales-dashboard` remains the legacy operational application and current integration source.

## Target layers

1. Experience: customer workspace and internal operator OS.
2. API/policy: identity, memberships, tenant scope, entitlements and risk rules.
3. Workflow: versioned definitions, checkpoints, executions, approvals and recovery.
4. Domain: customer, commercial, delivery, finance and AI employee modules.
5. Integration: typed provider adapters, mappings, sync cursor, health and reconciliation.
6. Data: PostgreSQL with RLS, immutable audit/usage ledgers, object storage and vault references.
7. Operations: queues, observability, SLOs, alerts, backup/restore and incident tooling.

## Configuration precedence

Platform defaults → product version → company plan → organization overrides → workflow run snapshot. The resolved snapshot is stored with every execution so later changes cannot rewrite historical decisions.

## Migration rule

Do not rewrite `sales-dashboard`. Extract one provider capability at a time behind an adapter, reconcile results, then switch its source-of-truth entry. A rollback keeps the legacy read path available until parity is proven.
