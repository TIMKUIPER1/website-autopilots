# Website Autopilots Project Instructions

Before changing copy, design, UI, landing pages, components, or website structure, read and follow:

- `Autopilots Style Stack Kennisbank.md`

This file is the source of truth for the Autopilots brand style, visual system, tone, layout rules, conversion patterns, and creative direction.

## Autopilots OS

- Treat `autopilots-platform` as the governed OS core and `sales-dashboard` as the legacy operational application and integration source until a documented migration is complete.
- Never present demo, sandbox, inferred, or cached data as live. Provider writes remain disabled unless production authority is explicitly documented.
- Enforce organization scope and role policy on the server. Client-side hiding is not authorization.
- Every workflow command needs an idempotency key, audit evidence, risk classification, and usage/cost entry.
- R3 actions require a human approval with a current context version. Keep external activation blocked in the local demo.
- Run platform checks with `node --test tests/*.test.js` from `autopilots-platform`.
- Continue from `PLANS.md`; update decisions, risks, source truth, and runbooks when boundaries change.
