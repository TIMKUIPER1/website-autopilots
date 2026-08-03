# Product → control-plane contract

Every product connector exposes or produces a versioned, read-only snapshot.
The initial contract name is `autopilots.product-snapshot.v1`.

## Required envelope

```json
{
  "contract": "autopilots.product-snapshot.v1",
  "product": "autoplanner",
  "environment": "production",
  "observedAt": "2026-08-03T12:00:00Z",
  "sourceQuality": "provider_verified",
  "health": { "status": "healthy", "lastSuccessAt": null },
  "incidents": [],
  "usage": [],
  "resources": []
}
```

Unknown values are `null`, never invented zeroes. `sourceQuality` must
distinguish demo, cached, aggregate and provider-verified information. The
snapshot contains only portfolio-level aggregates and operational health; raw
customer PII, secrets and product-specific records are rejected.

## Governed product allowlists

The durable catalog is organization and brand scoped. Every contract uses
transport `product_aggregate_api`, classification `aggregate_no_pii`, a maximum
freshness age of 900 seconds and a minimum reportable group size of five.

| Product | Allowed aggregates |
| --- | --- |
| AutoReviews | `organizations_count`, `reviews_requested_count`, `reviews_completed_count`, `average_rating`, `failed_deliveries_count`, `open_incidents_count`, `usage_totals` |
| AutoPlanner | `organizations_count`, `leads_by_status`, `appointments_by_status`, `conversations_by_state`, `job_failures_count`, `integration_health`, `usage_totals` |
| RoofPlanner | `organizations_count`, `trial_accounts_by_state`, `activation_gates_by_state`, `appointments_by_status`, `provider_failures_count`, `entitlement_counts`, `usage_totals` |

Every product contract prohibits `raw_pii`, `row_level_records`,
`message_content`, `secrets`, `provider_tokens` and payment-instrument data.
Direct database access, row-level reads, cross-project credential storage,
provider authorization and external writes are immutable `false` fields.

Current status is deliberately fail-closed: AutoReviews is
`contract_required`; AutoPlanner and RoofPlanner are
`identity_verified_contract_required`. No endpoint is implemented or verified,
so the control plane reports three contracts requiring implementation and zero
active data connections.

Each sync records a correlation ID, cursor, source timestamp and evidence.
Retries are idempotent. Discovery may create proposed resource mappings with
confidence and evidence, but only an authorized human or deterministic rule
may approve them.

Writes are a separate command contract and remain disabled until a connector
has passed authentication, scope, reconciliation, rate-limit, rollback and
incident tests. R3 commands always require a current human approval.
