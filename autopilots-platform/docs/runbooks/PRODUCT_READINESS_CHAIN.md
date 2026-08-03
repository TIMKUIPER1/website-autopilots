# Product readiness migration chain

## Purpose

Apply the three reviewed, dependent product-readiness migrations to the exact
Autopilots Supabase project without manual SQL, copied database passwords or a
partially applied chain.

Target project: `wurycoodzcybaxcgqxps`.

The chain preserves separate registry change IDs:

1. `AP-INT-20260803-010` — readiness policy and evidence model;
2. `AP-INT-20260803-011` — governed evidence recording;
3. `AP-INT-20260803-012` — atomic three-proof snapshot recording.

## Default preflight

`pnpm run db:preflight:product-readiness` is read-only. It requires a temporary
Supabase access token but no apply flags. It accepts only:

- the exact ordered 45-migration live inventory, meaning ready to apply; or
- the exact ordered 48-migration inventory, meaning already applied.

Any filename, checksum, count, project or response-contract difference stops.
The program never prints the token, SQL or Management API response body.

## Apply gate

Apply is blocked unless all of the following are present in the same controlled
process:

- a temporary `SUPABASE_ACCESS_TOKEN`;
- `SUPABASE_PROJECT_REF=wurycoodzcybaxcgqxps` (or the pinned default);
- `ALLOW_DATABASE_MIGRATIONS=true`;
- `MIGRATION_CHAIN_CONFIRM=wurycoodzcybaxcgqxps:45:48`;
- the explicit `pnpm run db:apply:product-readiness` command.

The access token must be supplied transiently by the approved system credential
flow and must not be pasted into source, `.env`, terminal output, chat or a
runbook. A no-token apply attempt is expected to fail before any network call.

## Transaction behavior

Immediately before executing migration SQL, the database transaction itself
rechecks all 45 expected filenames and checksums. Any mismatch aborts. The three
migration bodies and three registry rows then execute inside the same
transaction; any statement failure rolls back the full chain.

After commit, the runner reloads the inventory and requires the exact ordered
48-file checksum set before reporting success. Its success response explicitly
keeps data connection, provider authorization and external writes false.

## Post-apply acceptance

Follow the acceptance sections in `AP-INT-20260803-010`, `011` and `012`, then:

1. verify 48 live migrations and 40 governed RPCs;
2. verify zero real evidence rows and zero active product data connections;
3. verify anonymous/authenticated browser denial and auditor/cross-org denial;
4. rerun Security Advisor and backup inventory;
5. update `PLANS.md`, source-of-truth and all three deployment runbooks with
   exact live evidence.

Do not configure product endpoint secrets or run real snapshot verification as
part of the migration chain.
