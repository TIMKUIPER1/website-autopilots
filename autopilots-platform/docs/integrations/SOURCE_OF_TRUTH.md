# Integration Source of Truth

| Domain | Current authority | Platform state | Write authority | Target |
| --- | --- | --- | --- | --- |
| Customer/workflow demo | `DemoStore` synthetic fixture | Verified demo | Local demo only | PostgreSQL/RLS |
| Stripe invoices/payments | `sales-dashboard` integration | Legacy/inferred | Disabled here | Signed webhooks + reconciliation |
| Wise transactions | CSV/API work in `sales-dashboard` | Legacy/inferred | Disabled here | Read/reconcile adapter first |
| GoHighLevel CRM | `sales-dashboard` integration | Legacy/inferred | Disabled here | Scoped adapter + cursors |
| Documents | Existing mail/GHL/Drive processes | Unverified | Disabled here | Object store + metadata registry |
| Secrets | Environment/manual setup | Unverified | Demo discards raw values | Managed vault references |
| AI/voice/SMS usage | Provider dashboards/legacy app | Unverified | Disabled here | Immutable normalized usage ledger |
| Connector authorization intent | Autopilots OS `integration.connector_requests` | Verified internal staging | No provider authority | Human-approved executor per provider after separate permission |
| Supabase project topology | Autopilots OS `integration.product_data_planes` | Central project verified; product projects unregistered | Metadata read only; no credentials or provider authority | Approved read-only discovery per product-owned project |

Rules: one authority per field; store provider IDs and sync cursors; raw provider payloads are evidence, normalized records drive products; reconciliation never silently overwrites financial history; corrections append adjustment records.

## AutoReviews lighthouse matrix

| Data class | Authority | Internal projection | Freshness | Conflict and reconciliation | Sensitivity / retention |
| --- | --- | --- | --- | --- | --- |
| Leads and opportunities | GoHighLevel | Customer/brand lifecycle projection via explicit external mapping | 15 min | GHL wins; conflict event and operator review | Personal / contract + 90 days |
| Meetings | Connected calendar | Meeting projection with provider event ID | 15 min | Calendar wins; cancelled source event supersedes queued work | Personal / contract + 90 days |
| Orders, subscriptions, payments | Stripe | Financial projection and brand/customer dimensions | Webhook + daily | Stripe wins for payment objects; append reconciliation differences | Financial / 7 years |
| Review conversations | Approved messaging provider | Conversation/result projection | 5 min | Provider event wins; cooldown and deduplication required | Personal / approved policy |
| Goals, policies, workflows and mappings | Autopilots OS | Canonical internal records | Direct | Version conflict fails closed | Internal / policy controlled |

Current contract status: the AutoReviews aggregate export is implemented, but
the latest local live probe is unavailable. GoHighLevel/calendar configuration
awaits first reconciliation; Stripe and WhatsApp remain
`blocked_missing_connection`. No revenue, cost or margin claim may be shown
until Stripe and the OS ledger reconcile.

The server-side adapter accepts only `autoreviews.os-snapshot.v1` with
classification `aggregate_no_pii`. Remote connector bases require HTTPS plus
an exact separately configured allowed origin; only loopback endpoints may use
HTTP. URLs with credentials, query strings or fragments are rejected before
fetch, responses are size-bounded, and destination/response failures expose
only stable codes. It never consumes the AutoReviews admin API, raw SQLite
rows, contact identities or provider credentials.
