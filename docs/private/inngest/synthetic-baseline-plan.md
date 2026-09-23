# Inngest Local synthetic baseline

## Fixture

`fixtures/local-demo/server.mjs` exposes an Inngest-compatible endpoint with two deterministic functions:

- `northstar-release-review` handles `nova/release.review.requested` through `validate-release` and `compose-summary`.
- `northstar-risk-check` handles `nova/risk.review.requested`; `mode: fail` deliberately throws `SYNTHETIC_RISK_REVIEW_FAILURE` inside `validate-risk` and allows exactly one retry.

The fixture contains no credentials, customer data, external calls, production targets, or persistent business records.

## Baseline and reset

Start a fresh in-memory Dev Server, start the fixture on `127.0.0.1:3000`, and register it once through the Local Apps surface before recording. Reset by stopping the two local processes and starting a fresh in-memory Dev Server; no Production cleanup is involved.

## Final identifiers

- Release: `final-release-01`
- Risk: `final-risk-01`

These identifiers are unique to the accepted take and are asserted in the visible event payloads and Nova summaries.

## Guardrails

Never open Production, use event/signing keys, deploy, connect integrations, create billing usage, rerun, or represent local fixture evidence as live customer telemetry.
