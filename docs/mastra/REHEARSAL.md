# Rehearsal evidence

Completed 2026-09-24 in Mastra Studio `1.69.0` at `localhost:4111`.

## Independent passes

- Release pass 1: `mastra-release-r1` completed both steps with `externalActions: 0`.
- Release pass 2 through Nova: `mastra-release-r2` completed both steps after explicit confirmation.
- Risk pass 1: `mastra-risk-r1` produced the exact intentional failure token and was not retried.
- Risk pass 2 through Nova: `mastra-risk-r2` produced the exact intentional failure token after explicit confirmation and was not retried.

## Script-order pass

- `mastra-release-script1` succeeded with `validate-release`, `compose-summary`, and `externalActions: 0`.
- `mastra-risk-script1` failed intentionally in `validate-risk` with `SYNTHETIC_RISK_REVIEW_FAILURE:mastra-risk-script1` and was not retried.

## Observability preflight

- `mastra-release-observe2` succeeded and appeared in local Traces as `OK`.
- Local Logs showed both task-owned messages, the matching release identifier, decision, and `externalActions: 0`.
- A fixture logger-injection mismatch found by `mastra-release-observe1` was corrected before recording; the following build and successful run verified the fix.

All critical flows therefore passed twice plus one combined script-order rehearsal. No provider, agent, key, cloud exporter, deployment, external request, production data, or spend was used.
