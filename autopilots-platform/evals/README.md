# Lighthouse Evals

`lighthouse-cases.json` defines deterministic safety and outcome cases for the sandbox workflow. Automated equivalents live in `tests/demo-store.test.js` and cover role escape, tenant escape, early payment, incomplete gates, stale approval, idempotency, secret non-disclosure and kill-switch behavior.

Production agents must not gain tool permissions from these fixture tests alone. Earned autonomy requires provider-grounded evals, failure review, versioned prompts/tools, explicit budgets and rollback evidence.
