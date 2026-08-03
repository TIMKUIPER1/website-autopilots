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

Each sync records a correlation ID, cursor, source timestamp and evidence.
Retries are idempotent. Discovery may create proposed resource mappings with
confidence and evidence, but only an authorized human or deterministic rule
may approve them.

Writes are a separate command contract and remain disabled until a connector
has passed authentication, scope, reconciliation, rate-limit, rollback and
incident tests. R3 commands always require a current human approval.
