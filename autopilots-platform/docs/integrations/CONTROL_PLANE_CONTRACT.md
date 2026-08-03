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
  "sourceQuality": "product_aggregate",
  "dataClassification": "aggregate_no_pii",
  "aggregates": {
    "organizations_count": { "value": 12, "sampleSize": 12, "suppressed": false },
    "leads_by_status": {
      "active": { "value": 28, "sampleSize": 28, "suppressed": false },
      "lost": { "value": null, "sampleSize": null, "suppressed": true }
    },
    "appointments_by_status": { "planned": { "value": 9, "sampleSize": 9, "suppressed": false } },
    "conversations_by_state": { "open": { "value": 7, "sampleSize": 7, "suppressed": false } },
    "job_failures_count": { "value": 0, "sampleSize": 0, "suppressed": false },
    "integration_health": { "healthy": { "value": 6, "sampleSize": 6, "suppressed": false } },
    "usage_totals": { "requests": { "value": 120, "sampleSize": 120, "suppressed": false } }
  },
  "privacy": {
    "minimumGroupSize": 5,
    "smallCellsSuppressed": true,
    "containsPersonalData": false,
    "containsRowLevelRecords": false,
    "containsMessageContent": false,
    "containsSecrets": false,
    "containsProviderTokens": false,
    "containsPaymentInstrumentData": false
  },
  "externalWrites": false
}
```

Every allowlisted aggregate must be present. Each aggregate is either one
numeric cell or a bounded map of safe segment names to numeric cells. Unknown
or suppressed values are `null`, never invented zeroes. A non-zero group below
five must be `suppressed=true` with both `value=null` and `sampleSize=null`, so
even its exact size is not disclosed. `sourceQuality` is either
`product_aggregate` or `provider_verified_aggregate`; the second value requires
separate provider evidence. The snapshot contains only portfolio-level
aggregates; raw customer PII, secrets and product-specific records are rejected.

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

Current live status is deliberately fail-closed: AutoReviews is
`contract_required`; AutoPlanner and RoofPlanner are
`identity_verified_contract_required`. The live control plane reports three
contracts requiring implementation and zero active data connections. Local
implementation evidence exists for AutoReviews and AutoPlanner; RoofPlanner has
a disabled contract route pending a separate aggregate reader and independent
review. None is hosted or verified in the live catalog.

The local validator additionally rejects missing or extra envelope fields,
missing or extra aggregates, cross-product payloads, unsafe segment names,
nested objects, negative/non-finite values, timestamps older than the contract
freshness window and timestamps more than 60 seconds in the future. Validation
does not activate transport or establish data authority.

## Transport gate

The central reader is GET-only and disabled until a server-side secret of at
least 32 characters is supplied. It validates the destination before attaching
that secret: remote URLs require HTTPS and an exact configured origin; only
loopback development may use HTTP. Responses are limited to 100 kB and pass the
full product validator before acceptance. Authentication, timeout, reachability,
size, JSON and contract failures become bounded codes without echoing endpoints,
payloads or secrets.

The adapter is connected to an internal, organization-scoped portfolio GET
reader. The reader starts authorized products in parallel, preserves one bounded
result per product and accepts only validator-approved live aggregates. It
returns explicit unavailable states instead of demo, cached or estimated data,
and never returns configured endpoints or credentials. It is not connected to
monitoring or persistence. The AutoPlanner and AutoReviews producers exist
locally, but no hosted endpoint, credential or central data connection is active
under Werktoestemming A.
AutoReviews defaults to `sandbox`; a verified live service must explicitly set
`production` before production evidence could be accepted.

Each sync records a correlation ID, cursor, source timestamp and evidence.
Retries are idempotent. Discovery may create proposed resource mappings with
confidence and evidence, but only an authorized human or deterministic rule
may approve them.

Writes are a separate command contract and remain disabled until a connector
has passed authentication, scope, reconciliation, rate-limit, rollback and
incident tests. R3 commands always require a current human approval.

## Activation readiness policy

Local implementation is not activation readiness. The deterministic
`autopilots.product-connection-readiness.v1` policy requires twelve current
pieces of evidence: verified project identity, an owned HTTPS endpoint, a vault
secret reference, successful contract/privacy/freshness probes, reconciliation,
revocation, rate-limit and failure-mode tests, independent review and an R3
human approval matching the current context version. Every item expires; the
approval expires after 15 minutes. Missing, malformed, future, stale or
overlong evidence fails closed with a stable blocker code.

Even a fully green evaluation does not activate anything. The evaluator always
returns data connection, provider authorization and external writes as disabled;
activation remains a separate governed workflow outside Werktoestemming A.

Technical evidence for ten non-derived gates may be stored only through
`autopilots_record_product_connection_evidence`. The server-only R1 command
accepts a lowercase SHA-256, exact source category and fresh observation time;
expiry is derived from the gate policy. It writes immutable evidence plus audit
and zero-cost usage records and is idempotent per product environment. It cannot
record `project_identity` or `current_human_approval`, and it never enables a
connection, provider authorization or external writes. This migration remains
local until the readiness schema is applied first and separately accepted.
