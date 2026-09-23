# Local synthetic baseline

## Runtime

- Studio: `http://localhost:4111`
- Fixture: `fixtures/local-demo`
- Persistence: task-local LibSQL plus DuckDB observability files, all gitignored
- Providers/agents/keys/cloud exporters: none
- External actions and hosted execution: none

## Flow A — release review

- Input: `synthetic: true`, unique `releaseId`, operator-supplied `ownerQueue`
- Steps: `validate-release` then `compose-summary`
- Output: matching `releaseId`, `decision: ready-for-review`, matching `ownerQueue`, `externalActions: 0`
- Terminal state: success

## Flow B — risk check

- Input: `synthetic: true`, unique `reviewId`, `mode: fail`
- Step: `validate-risk`
- Error: `SYNTHETIC_RISK_REVIEW_FAILURE:<reviewId>`
- Terminal state: expected failure; no retry

## Cleanup

The fixture creates only local gitignored run/observability data. The recording does not delete runs or alter unrelated user data. Stopping the two localhost dev servers ends execution.
