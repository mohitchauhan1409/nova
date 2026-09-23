# Private Mastra Studio Local demonstration scenario

Status: verified locally on 2026-09-24.

## Scope

The recording uses the task-owned `nova-mastra-local-demo` fixture at `http://localhost:4111`. It contains two deterministic workflows and local DuckDB/LibSQL observability. It has no agent, model provider, API key, cloud exporter, external request, deployment, billing path, or production data.

## Scene A — successful release review

Nova opens `northstar-release-review`, prepares `synthetic: true`, a unique operator-supplied `releaseId`, and `ownerQueue`, and asks for exact-input confirmation before Run. The workflow runs once. Nova verifies `validate-release`, `compose-summary`, `decision: ready-for-review`, and `externalActions: 0`, then correlates the task-owned local trace and logs.

## Scene B — expected risk failure

In a fresh conversation, Nova opens `northstar-risk-check`, prepares `synthetic: true`, a unique operator-supplied `reviewId`, and `mode: fail`, and asks for confirmation before Run. The workflow runs once and intentionally fails with `SYNTHETIC_RISK_REVIEW_FAILURE:<reviewId>`. Nova verifies `validate-risk`, explains the fixture behavior, and does not retry.

## Acceptance criteria

- Host is exactly `localhost:4111` and both exact workflow names are visible.
- Each unique run is explicitly confirmed and executed once.
- The success output proves both steps and `externalActions: 0`.
- The failure output proves the exact synthetic token and is not retried.
- Local Traces/Logs show only the task-owned synthetic identifiers.
- No model inference, credential, cloud telemetry, repository connection, deployment, external action, production data, or spend occurs.
