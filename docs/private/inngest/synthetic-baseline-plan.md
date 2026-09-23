# Inngest synthetic baseline plan

## Offline fixtures

- `tests/fixtures/inngest-synthetic-failed-run.json`
- `tests/fixtures/inngest-synthetic-function-health.json`

The fixtures are entirely synthetic, contain no credentials or real customer data, and are intentionally not compatible with an event-send workflow. They are evaluation references for evidence structure, redaction, and cautious interpretation only.

## Failed-run assertions

A useful investigation identifies environment, app, function, status, timing, failed step, attempts, and error category while omitting raw payload and customer identifiers. It correlates the failed step with retries and labels any root-cause statement as direct evidence or inference. It never claims a rerun outcome.

## Function-health assertions

A useful review anchors every metric to the visible environment and time range. It reports the trigger and available health signals without inferring configuration that is not shown. One window is not enough to claim a trend. Missing charts or access restrictions are valid results.

## Live baseline and reset

Production is read-only and therefore needs no reset. Filtering, opening details, expanding trace steps, and changing a local chart range should not create product state; confirm the UI does not offer a “save view” side effect before using it.

Do not create synthetic activity in Production. If a live-safe mutation demo is ever needed, the account owner must first supply an authorized Branch, Custom, or Local environment, deployed synthetic function, and synthetic events. That setup may require deployment, keys, integration configuration, usage, or a paid plan and is outside this preparation.

## Drift handling

Dashboard labels, layouts, plan entitlements, retention windows, and trace fields may change. Locate controls by current accessible labels, preserve the strict prohibited-action list, and verify end state from the current page rather than hardcoded fixture answers.
