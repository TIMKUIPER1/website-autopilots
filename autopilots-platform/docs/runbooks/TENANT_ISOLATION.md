# Live tenant-isolation acceptance

## Safe negative acceptance

Run `pnpm security:verify-live` from an authenticated Supabase CLI session. The
script retrieves only the existing legacy `anon` and `service_role` API keys in
memory, never prints them, and sends read-only RPC calls to the exact Autopilots
project `wurycoodzcybaxcgqxps`.

The check requires PostgreSQL `42501` for an owner requesting an unrelated
portfolio scope and for an unknown profile requesting the real portfolio,
brand twin, onboarding or incident scope. The access roster validates legal
entity existence first and therefore requires `P0002` for the synthetic unknown
identifier. It also requires anonymous denial on representative portfolio,
brand and access APIs. It performs no persistent or external write.

Passing this negative suite proves fail-closed behavior for invalid authority
and organization identifiers. It does **not** replace the stronger two-tenant
test below.

## Strong two-tenant acceptance

Before production cutover, use one database transaction to create a synthetic
second legal entity and brand without creating an Auth user. With the existing
owner profile, verify denial for every scoped read. Temporarily grant only a
brand-specific membership, verify that the second portfolio returns exactly
that one brand and cannot see Autopilots, then roll back the entire transaction.

After rollback, verify the original owner has one active legal-entity-wide
membership, no brand-specific memberships, and that no synthetic legal entity,
brand, environment, connection, incident or audit row remains. Never run this
against production concurrently with a schema or membership change.
