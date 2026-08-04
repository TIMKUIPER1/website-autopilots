# Product aggregate connector cutover

This is the reusable standard for AutoReviews, AutoPlanner, RoofPlanner and each
future Autopilots software brand. It connects one product-owned aggregate API
to the central control plane without sharing databases, product service-role
keys, raw rows or provider credentials.

## Boundary

- Contract: `autopilots.product-snapshot.v1` over GET only.
- Classification: `aggregate_no_pii`; minimum group size five.
- Product owns calculation and suppression; Autopilots independently validates.
- One dedicated random transport secret per product and environment.
- The hosting vault and central runtime receive the same secret through separate
  scoped references. It never enters a control-plane row, Git, chat or browser.
- Product provider authorization, direct database access and external writes
  remain false. Connection activation is a separate current-context R3 action.

## Required product deployment package

1. Build only the exact allowlisted aggregates from the product's authoritative
   store. Reject unknown fields, unsafe segments, stale timestamps and privacy
   flag drift before responding.
2. Expose one fixed internal HTTPS path. Return 503 when the dedicated secret is
   unconfigured, 401 when it is absent/wrong and `Cache-Control: no-store` on
   every response.
3. Ship a product-local verifier that binds an exact separately configured
   HTTPS origin, sends only GET, proves denied-without-secret before the valid
   read and emits no URL, credential, row, group size or aggregate value.
4. Declare secret slots without values in infrastructure configuration. Product
   environment identity must be explicit; no production service may label a
   sandbox snapshot as production.
5. Pass product syntax, unit, tenant/privacy and deployment-verifier tests. A
   local test is implementation evidence, not hosted or live evidence.

## Controlled cutover

1. Obtain separate deployment and secret-manager authority for the exact
   product/environment. Deploy an immutable product revision; do not configure
   the central reader yet.
2. Run health/readiness, then the product-local aggregate verifier. Record only
   bounded results and revision identity. Rotate/remove the secret and prove 503
   or 401 revocation, then install a new dedicated secret and verify again.
3. Inject the exact endpoint, allowed origin and secret into the central runtime
   from its managed vault. Never use a product database credential.
4. Run the central GET reader and exact validator. Reconcile selected aggregate
   totals against a product-owned report without copying raw records centrally.
5. Record expiring evidence for endpoint ownership, vault reference, contract,
   privacy, freshness, reconciliation, revocation, rate limit, failure mode and
   independent review. Project identity remains separately derived.
6. Keep `current_human_approval` blocked until an owner reviews the current
   context. Only a separate R3 activation may change connection status.

## Failure and rollback

Any verification failure leaves the product unavailable and the central
connection inactive. Remove the central runtime reference first, rotate/remove
the dedicated product secret and confirm denied access. Preserve audit and gate
history; correct contracts forward. Never fall back to direct database access,
cached/demo values, another product's credential or an unreviewed endpoint.

## Current implementation evidence

- AutoReviews commit `60ca9db` contains self-validation, a Render secret slot
  with no value, explicit production identity and a secret-safe GET-only
  deployment verifier. Its 147 tests pass and a generated production envelope
  is accepted by the central validator. It is not deployed or connected.
- AutoPlanner commit `16cb80e` contains production-only route gating,
  self-validation, truthful zero handling for empty grouped queries and a
  secret-safe exact-origin GET-only deployment verifier. Its full build, all 98
  tests and database-schema validation pass; generated populated and empty
  production envelopes are accepted by the central validator. It is not
  deployed or connected.
- RoofPlanner remains deliberately disabled pending an aggregate reader and the
  independent review required by its repository contract.
