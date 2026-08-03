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

## Recommended controlled release

On the authorized macOS workstation, run
`pnpm run db:release:product-readiness`. The release helper asks Keychain for
the existing `Supabase CLI` credential and keeps it only in process memory. Do
not paste a token into a shell, file, chat or runbook. After the one-time macOS
**Allow** action, the helper runs the exact apply gate, independent read-only
posture verification and rollback-only behavioral acceptance in that order.
It stops at the first failure and never skips forward.

The lower-level commands below remain documented for diagnosis, but a normal
release should use the single controlled command so no acceptance step is
forgotten.

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

First run `pnpm run db:verify:product-readiness` with the same transient access
token. This verifier is pinned to the Autopilots project and executes one
SELECT-only query. It accepts only the exact 48 migrations, 40 governed RPCs,
three change IDs and checksums, expected grants, append-only trigger, twelve
policies, three snapshot contracts and zero evidence/command/audit/usage
residue. It prints only a bounded no-effect summary and never prints the token,
query or response body.

Then follow the acceptance sections in `AP-INT-20260803-010`, `011` and `012`:

1. run `pnpm run db:accept:product-readiness`; it first proves the clean
   read-only posture, executes the complete behavioral matrix inside one
   transaction, rolls it back and then independently proves the clean posture
   again;
2. verify zero real evidence rows and zero active product data connections;
3. verify the behavioral result covers owner/operator success, exact replay,
   divergent replay, wrong profile/organization, auditor, derived-gate, stale,
   wrong-source, mutation and partial-batch denial;
4. rerun Security Advisor and backup inventory;
5. update `PLANS.md`, source-of-truth and all three deployment runbooks with
   exact live evidence.

The behavioral runner changes the owner's membership role only inside its
uncommitted transaction. Other database sessions never observe that temporary
state. Any failed assertion aborts, and the final posture verifier must still
prove zero evidence, command, usage and audit residue.

Do not configure product endpoint secrets or run real snapshot verification as
part of the migration chain.
