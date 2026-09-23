# Inngest evidence and provenance plan

## Official sources

- `https://www.inngest.com/docs/platform/environments` defines Production, Branch, Custom, and Local environments, isolation, switching, and credential boundaries.
- `https://www.inngest.com/docs/platform/monitor/observability-metrics` documents Functions-list triggers, failure rate, volume, backlog, and event observability.
- `https://www.inngest.com/docs/platform/monitor/inspecting-function-runs` documents Runs filters, run detail, step timelines, retry/error evidence, and the adjacent rerun/Dev Server actions that this rehearsal must avoid.
- `https://www.inngest.com/docs/platform/monitor/traces` documents run info, timings, trace layout, step detail, retries, and input/output visibility.
- `https://www.inngest.com/docs/platform/manage/rerun-function-runs` confirms that reruns create a new run and may repeat side effects; it is provenance for the prohibition, not an instruction to rerun.

These sources establish product vocabulary and risk boundaries. They do not prove the current account’s state or any individual live result.

## Live evidence requirements

1. Address bar shows the exact `app.inngest.com` hostname.
2. Nova displays Inngest identity and both read-only suggestions.
3. Workspace/account and environment switcher are visible, with Production unambiguous.
4. The user-named app/function/run and selected time range are visible.
5. Run metadata, trace timeline, failed step, retry count, and redacted error category are visible without sensitive payload values.
6. Function trigger, failure rate, volume, backlog/throughput, version, and configuration are captured only where the dashboard exposes them.
7. Final frames show no execution or mutation was initiated.

Do not record account identifiers, member lists, event keys, signing keys, environment variables, integrations, billing, raw customer payloads, secrets, tokens, or unrelated run data. Crop, redact, or stop before those values enter the frame.

## Claim discipline

Both flows remain `verified: false` until checked against the live, authorized account. Use current visible labels rather than assumed navigation. Generated summaries must cite visible state and explicitly mark inferred causes. Never use fixture values as live evidence.
