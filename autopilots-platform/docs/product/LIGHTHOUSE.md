# Lighthouse Selection

## Selection score

Scores are 1–5; higher is better. Risk is scored inversely: 5 means controllable.

| Candidate | Revenue impact | Frequency | Reuse | Data readiness | Controllable risk | Total |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Preview to governed activation | 5 | 4 | 5 | 4 | 4 | 22 |
| Invoice reconciliation | 5 | 4 | 4 | 2 | 2 | 17 |
| Social content production | 3 | 5 | 3 | 2 | 3 | 16 |
| Team productivity scoring | 2 | 4 | 2 | 1 | 1 | 10 |

Decision: build **preview to governed activation** first. It proves customer/internal separation, commercial gates, secure onboarding, approvals, workflow evidence and costs without requiring authority over real money or customer systems.

## Outcome contract

Trigger: an authorized customer opens a personalized sandbox preview.

Verified outcome: requirements and legal versions are accepted, sandbox payment is verified, required onboarding artifacts are represented by scanned demo documents and vault references, the internal workflow reaches review, and a current-context human decision is recorded.

Safety: no external writes; payment is explicitly simulated; uploaded contents are not persisted; raw secrets are never returned; approval cannot bypass exit gates.

Metrics: verified activations, human attention required, total measured demo cost, execution count and duration. Each metric identifies formula, source, freshness and owner in `DemoStore.metricRegistry`.

## Recovery

- Duplicate commands return their first result through tenant-scoped idempotency.
- Stale approval versions fail closed.
- Kill switch permanently stops a demo agent pending manual recovery.
- Demo reset is internal-only and returns the isolated fixture to its baseline.
