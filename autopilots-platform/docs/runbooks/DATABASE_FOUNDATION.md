# Database foundation runbook

The migration is not a live deployment instruction. It must first run against
a disposable Supabase sandbox owned by Autopilots.

## Before applying

1. Confirm the target project ID and environment out of band.
2. Take a restorable backup and record its location and retention.
3. Confirm provider writes are disabled.
4. Run `pnpm check` and review the migration diff.
5. Set a change ID such as `AP-DB-20260803-001`.

## Apply to the approved sandbox

```bash
ALLOW_DATABASE_MIGRATIONS=true \
MIGRATION_CHANGE_ID=AP-DB-20260803-001 \
DATABASE_URL='postgresql://…' \
pnpm db:migrate
```

The runner records a checksum and refuses duplicate or changed migrations.
Do not put the database URL in source control, screenshots or tickets.

## Acceptance gate

- An authenticated user cannot read another legal entity or brand.
- `anon` cannot read or write governed schemas.
- Authenticated clients cannot write directly to governed tables.
- Audit and usage entries cannot be updated or deleted.
- A duplicate idempotency key returns the original command; a changed payload
  with the same key is rejected.
- R3 command creation and approval evidence are atomic.
- The legacy `sales-dashboard` mirror remains unchanged.
- Backup restore is rehearsed before production promotion.

## Rollback

Keep application reads on the in-memory sandbox until every acceptance check
passes. If the sandbox migration fails, destroy only that disposable sandbox
or repair it with a reviewed forward migration. Never rewrite migration
history or point the production application at a partially migrated database.
