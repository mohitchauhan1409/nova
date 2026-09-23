# Nova Mastra local demo

This fixture exposes two deterministic workflows in Mastra Studio at `http://localhost:4111`:

- `northstar-release-review` validates a synthetic payload and returns a local review summary.
- `northstar-risk-check` intentionally fails with `SYNTHETIC_RISK_REVIEW_FAILURE`.

It has no agents, model provider, credentials, external requests, cloud exporter, deployment, billing path, or production data. Run only with synthetic IDs supplied for the current rehearsal or final take.
