# Inngest read-only recording script draft

## Opening (5–8 seconds)

Show the exact `app.inngest.com` host and open Nova. Hold on the Inngest-specific identity and both read-only suggestions. Frame or redact the account control so its identifier is not recorded.

## Take 1 — failed-run investigation (60–90 seconds)

1. Choose **Investigate a failed run** in Nova.
2. Show the authorized workspace context and Production environment.
3. Open Runs and apply only the named read-only filters.
4. Open the named failed run; frame status, function/app, version, and timing without raw payload values.
5. Expand the trace and failed step to show prior completed steps, retry attempts, and a redacted error category.
6. Hold on Nova’s evidence summary, including any explicit inference or missing evidence.
7. End with the same run detail visible and no action in progress. Keep Rerun, Replay, Cancel, and Send to Dev Server untouched.

Suggested narration: “Nova stays inside the named production run, correlates the failed step with its retry history, and reports evidence without replaying work or exposing payload data.”

## Take 2 — function-health review (45–75 seconds)

1. Choose **Review function health** in Nova.
2. Reconfirm Production, then open Functions and the named function.
3. Frame the trigger, app, failure rate, volume, and selected time range.
4. Show backlog/throughput, status distribution, version, or read-only configuration only where available.
5. Hold on Nova’s health summary and limitations.
6. End on the function detail with no edit, deploy, sync, invocation, event send, or run action initiated.

Suggested narration: “Nova anchors every health observation to the selected environment and time range, and stops at evidence—no production execution or configuration change.”

## Empty-state alternative

If the authorized account has no functions or runs, record the scoped empty state and Nova’s honest blocked summary. Do not create an app, environment, event, deployment, or run to fill the demo.

## Editing notes

Prefer cuts over showing raw payload panels. Blur sensitive identifiers and remove any take where an execution/mutation control was activated. Do not claim live workflow verification until the rehearsal checklist is complete.
