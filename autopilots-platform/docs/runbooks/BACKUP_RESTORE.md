# Autopilots Supabase backup and restore runbook

## Current evidence boundary

Run `pnpm backup:verify` to query the Supabase management plane read-only for
project `wurycoodzcybaxcgqxps`. The verifier requires at least one completed
physical backup, WAL-G backup storage, region `eu-central-1` and a latest backup
age of at most 36 hours.

Passing this check proves only that a recent backup is listed. It always emits
`restoreRehearsed=false` and `productionReady=false`. PITR is currently not
enabled. Never describe a listed backup as restorable until the rehearsal below
has passed.

## Restore rehearsal gate

A restore is destructive and is not authorized by Werktoestemming A. Before a
rehearsal, obtain explicit approval for all of the following:

1. a disposable Supabase project owned by Autopilots, never the live project;
2. the exact backup/timestamp and maximum acceptable data loss;
3. the deletion/retention plan for the restored copy;
4. who may inspect restored personal or financial data;
5. a maintenance window and named incident owner.

After authorization, restore only to that disposable target and verify:

- all 28 immutable migration filenames and checksums;
- required schemas, RLS, function grants and append-only triggers;
- owner profile/MFA requirement without using the owner's live session;
- four operating brands and their environment write locks;
- cross-tenant and anonymous denial;
- portfolio, brand twin, monitoring, incident and IAM read contracts;
- audit/usage row counts and referential integrity;
- explicit destruction of the disposable copy after evidence retention.

Record actual RPO, RTO, backup identifier, target project, verifier results and
destruction evidence in a new deployment runbook. Never restore into
`wurycoodzcybaxcgqxps` as a test.
