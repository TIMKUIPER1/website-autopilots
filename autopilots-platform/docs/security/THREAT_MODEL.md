# Threat Model

## Assets and trust boundaries

Assets: customer identity, organization data, legal evidence, payment references, documents, provider credentials, workflow decisions, audit history and economic records. Boundaries exist between browser/server, customer/internal roles, tenants, platform/providers, agent/tools and demo/production environments.

## Contained in the sandbox

- Unauthenticated API access: opaque server sessions are required.
- Horizontal tenant access: organization scope is checked before reads and commands.
- Privilege escalation: server command and route policies separate roles.
- Duplicate effects: commands require tenant-scoped idempotency keys.
- Stale authorization: R3 approval requires the current context version.
- Secret exposure: only a masked vault reference is retained; raw input is discarded.
- Clickjacking and broad browser capabilities: CSP, frame denial and Permissions-Policy are set.
- Brute-force demo login: IP-window rate limiting is active.

## Production blockers

- In-memory sessions and data are not durable, distributed or revocable across instances.
- Demo credentials are not production authentication; use managed identity and internal MFA.
- SameSite cookies reduce CSRF exposure, but production mutations need explicit CSRF/origin controls and Secure cookies.
- No real encryption, malware scanning, object storage, vault, immutable audit sink or RLS database exists.
- No webhook signature verification, replay store, queue, dead-letter flow, restore test or SLO alert exists.
- CSP permits Google Fonts; self-host fonts before processing sensitive production data.

Production release remains blocked until these controls are implemented, tested and owned.
