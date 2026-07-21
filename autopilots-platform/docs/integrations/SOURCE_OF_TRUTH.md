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

Rules: one authority per field; store provider IDs and sync cursors; raw provider payloads are evidence, normalized records drive products; reconciliation never silently overwrites financial history; corrections append adjustment records.
