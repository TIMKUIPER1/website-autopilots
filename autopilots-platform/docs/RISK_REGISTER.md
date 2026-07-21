# Risk Register

| Risk | Impact | Current control | Owner / next action |
| --- | --- | --- | --- |
| Demo mistaken for production | Critical | Persistent demo labels; no external writes | Product: retain environment badges |
| Cross-tenant access | Critical | Server organization checks and adversarial tests | Engineering: add PostgreSQL RLS |
| Credential leakage | Critical | Raw demo secrets discarded | Security: managed vault and rotation |
| Incorrect financial truth | High | Demo cost quality label; no margin claims | FinOps: provider reconciliation |
| Duplicate/replayed effects | High | Tenant-scoped idempotency | Platform: durable replay store |
| Stale human approval | High | Context-version check | Platform: DB transaction/locking |
| In-memory data loss | High | Explicit sandbox boundary | Platform: durable repository |
| Provider outage/rate limit | High | No provider calls in core | Integrations: queues, backoff, health |
| Overbroad agent autonomy | High | Server allowlist, risk policy, kill switch | AI Ops: evals and earned autonomy |
| Legal evidence incomplete | High | Version/hash fixture only | Legal: approve documents/retention |
