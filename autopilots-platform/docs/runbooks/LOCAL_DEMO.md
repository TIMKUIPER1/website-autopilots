# Local Demo Runbook

For the managed Autopilots sandbox, use `pnpm start:managed-sandbox`. It reads
the existing project's publishable and service-role keys into process memory
from the authenticated Supabase CLI, generates a fresh application-session
secret, enables the scoped monitoring principal and keeps external writes
disabled. It never prints or writes credentials.

## Start and verify

```bash
cd autopilots-platform
node --test tests/*.test.js
node src/server.js
```

Open `http://127.0.0.1:4310/login`.

Customer: `demo@curacao-auto.example` / `autopilots-demo`.

Internal: `operator@autopilots.example` / `autopilots-internal`.

Override codes only through `DEMO_CUSTOMER_CODE` and `DEMO_INTERNAL_CODE`. Never use these credentials outside local/sandbox environments.

## Lighthouse exercise

1. Customer confirms all requirements and accepts the three required legal versions.
2. Customer completes the explicitly simulated checkout.
3. Customer fills all Secure Data Room fields, selects a permitted demo filename and stores a demo secret; only metadata and a masked vault reference remain.
4. Internal operator advances the implementation through build and test.
5. The third transition creates an R3 approval only when every gate is complete.
6. Operator reviews evidence and approves with the displayed context version.
7. State becomes `ready_for_authorized_activation`; external activation remains blocked.

Recovery: use the internal **Reset veilige demo** action. Stop the process to clear all sessions and in-memory data.
