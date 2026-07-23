# Decision Register

| Date | Decision | Reason | Status |
| --- | --- | --- | --- |
| 2026-07-21 | Use `autopilots-platform` as governed OS core | Existing small shell already models the intended preview journey | Accepted |
| 2026-07-21 | Keep `sales-dashboard` as legacy integration source | Avoid a risky rewrite and preserve existing work | Accepted |
| 2026-07-21 | Select preview-to-activation as lighthouse | Highest reusable value without live provider authority | Accepted |
| 2026-07-21 | Server policy is authoritative | UI hiding cannot enforce tenancy or roles | Accepted |
| 2026-07-21 | Keep external writes off | No production credentials or authority were provided for this core | Accepted |
| 2026-07-21 | Use append-only usage entries | Historical economics must remain reconstructable | Accepted |
| 2026-07-21 | Require versioned human approval for activation | Prevent stale or autonomous R3 decisions | Accepted |
| 2026-07-21 | Separate legal entity, operating brand and customer account IDs | A generic company filter cannot enforce financial or operational scope | Accepted |
| 2026-07-21 | Build AutoReviews read-only before provider writes | Data quality and mappings must be proven before autonomy | Accepted |
| 2026-07-21 | Unknown finance values remain null, never synthetic zero | Prevent false margin and revenue confidence | Accepted |
