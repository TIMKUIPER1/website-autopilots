# Autopilots OS Foundation Audit

Status date: 2026-07-21. Labels: **verified**, **inferred**, **proposed**, **blocked**, **pre-existing**.

## Baseline

- **Verified:** dependency-free Node modular sandbox, server-side sessions, role routes, scoped commands, idempotency, audit records, approval context versions and kill controls.
- **Verified:** all provider writes are disabled and all operational customer records are labeled demo data.
- **Verified:** current persistence is process memory; restart loses sessions and mutable state.
- **Pre-existing:** `sales-dashboard` remains the legacy integration application; it is not migrated or modified by this increment.
- **Blocked:** production identity, PostgreSQL/RLS, vault, object storage, queues, provider sandbox credentials and approved real AutoReviews mappings are absent.

## Terminology freeze

| Concept | Canonical meaning | Example |
| --- | --- | --- |
| Legal Entity | Contracting, accounting and legal owner | `le_autopilots_ai_agency_llc` |
| Operating Brand | Commercial operating unit with own goals and management P&L | `brand_autoreviews` |
| Customer Account | Buyer of one or more products | `customer_*` |
| Product Workspace | Entitled product context inside a customer account | `workspace_*` |
| Environment | Explicit execution/data boundary | `demo`, later `sandbox` or `production` |

UI selection never grants access. Membership and brand scope are checked on the server.

## Target modular monolith

1. Identity & Tenancy owns legal entities, brands, customers, memberships and scopes.
2. Catalog owns products, packages, entitlements and product workspaces.
3. Governance owns goals, policies, budgets, approvals and escalation.
4. Work Engine owns versioned workflows, executions, leases, retries and cancellation.
5. Integration Registry owns provider connections, external mappings, freshness and reconciliation.
6. FinOps owns append-only usage/cost entries and versioned allocations.
7. Events & Audit owns canonical events, evidence, correlation and causation.
8. Digital Twin projections compose read-only portfolio, brand and customer views.

Provider adapters may call external SDKs; domain modules may not.

## Immediate risks

| Priority | Condition | Treatment |
| --- | --- | --- |
| P0 | In-memory state is not production durable | Keep demo boundary; next migration is PostgreSQL repositories with RLS |
| P0 | No verified AutoReviews source mappings | Show unavailable/blocked states; never infer names or claim live metrics |
| P0 | Demo credentials are unsuitable for production | Managed identity, MFA, secure cookies and CSRF controls before production |
| P1 | Financial values can be mistaken for booked truth | Store quality per entry; null means unknown; corrections are linked adjustments |
| P1 | Existing demo organization field conflates customer and tenant | New OS API uses explicit legalEntityId, brandId and customerId |

## Migration path

The existing customer demo remains operational. `OperatingSystemStore` introduces the canonical read-only OS model beside it. Repository interfaces can later replace its memory collections with PostgreSQL transactions without changing API semantics. Provider connections remain blocked until mapping, webhook, idempotency and reconciliation tests pass.
