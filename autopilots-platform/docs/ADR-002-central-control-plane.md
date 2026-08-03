# ADR-002 — Central control plane, product-owned data planes

Status: accepted — 2026-08-03

## Decision

Autopilots owns one central control plane for portfolio identity, access,
connectors, health, incidents, governed commands, approvals, audit evidence and
usage/cost. AutoPlanner, AutoReviews and RoofPlanner keep ownership of their own
operational data and product-specific rules.

The control plane reads a small, versioned product snapshot and records where
the source data came from. It does not copy every product table. Cross-product
actions use explicit commands with organization scope, risk class,
idempotency, audit evidence and, for R3, current human approval.

## Why

This gives operators one login and one consistent command center while keeping
product releases and schemas independent. A product outage cannot silently
rewrite portfolio truth, and a central schema change does not require all
products to migrate together.

## Security boundary

- Membership and role policy are enforced by the server and PostgreSQL RLS.
- Provider credentials live in a managed vault; the database stores only a
  `vault://` reference.
- New integrations start with discovery and read-only synchronization.
- AI may propose resource mappings, never approve its own mapping or activate
  an external R3 action.
- Demo, cached, sandbox and production observations are visibly distinct.

## Rejected alternatives

- One shared operational schema for every product: too much coupling and too
  large a breach and migration surface.
- A separate management backend and login per company: duplicated governance,
  fragmented audit evidence and no reliable portfolio view.
