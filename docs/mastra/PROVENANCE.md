# Provenance and evidence

## Product surface

The demonstration uses the official Mastra Studio served by `mastra dev` from the repository-owned fixture. Studio visibly exposes Workflows, Traces, and Logs. The fixture dependencies are pinned in `fixtures/local-demo/package-lock.json`.

## Task-owned implementation

- `src/mastra/workflows/release-review.ts` defines a deterministic two-step success path.
- `src/mastra/workflows/risk-check.ts` defines a deliberate single-step failure path.
- `src/mastra/index.ts` registers local LibSQL/DuckDB storage, logging, and the default local observability exporter.
- `.gitignore` excludes generated build and local database artifacts.

## Evidence rules

- Match the exact unique synthetic identifier before attributing a run, trace, or log.
- Treat the risk error as fixture behavior, not a Mastra service incident.
- Preserve displayed status, step names, durations, and output exactly.
- Do not open or add credentials, providers, integrations, cloud exporters, repositories, billing, or deploy controls.
- Never inspect unrelated records or copy production data into the fixture.
