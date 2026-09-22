# Harbor & Vale order operations

Eligibility update: coordinator inspected native Ask Trigger in the signed-in account. It says its tools are read-only and cannot execute, trigger, retry, cancel or change configuration. Coordinator verified the supplied organization/project/Development scope and project ref `proj_futnuhorkbwfxqmsvsgv`. Keep Trigger.dev. Initial Tasks was empty and the dev server disconnected. This is coordinator-reported live evidence; local worker did not operate Chrome.

## Workload and safety

`examples/trigger-dev` is an isolated pinned Trigger.dev 4.6.3 project. It registers only `harbor-order-summary`. Its six-row ledger is synthetic; Harbor & Vale and all order IDs are invented scenario data. There are no names, email addresses, phone numbers or delivery integrations. Pure arithmetic does not read environment variables, files, network, databases or current time, and cannot send messages or modify source orders. The thin SDK wrapper sends only normal task logs/results to Trigger.dev. No automatic retry, schedules, child tasks or production deployment is configured.

Displayed amounts are INR. Quantity overrides affect HV-104 only and never mutate the source ledger. Include-canceled output explicitly labels the amount as order value rather than recognized sales. A bad override deliberately fails the actual task; the error states the original quantity needed for repair. This is preparation data, not a staged fake success.

## Proposed on-camera sequence — not yet live verified

1. Opening: “Fix Harbor & Vale's failed order summary and verify its totals.” Nova must inspect the failed run, correct its negative quantity override from the actual error/source evidence, replay, await completion, inspect output and reopen the saved run. No initial question or confirmation should be needed once the baseline run is uniquely identifiable.
2. Follow-up: “Now prepare a sales breakdown for our September review.” Missing business choices naturally justify a grouping/cancellation card. Choices: Region / Product; Paid orders only / Include canceled orders. If useful, user asks “Which would you use for a sales review?” Nova explains paid-only, then retains the user's chosen Product + Paid orders only. It creates a new test run, verifies the real payload/output/logs and reopens the saved result.
3. Revision: “Include canceled orders too, but keep the product grouping.” Nova replays with the single changed option; verifies 6 orders, 13 units, INR 21,187 order value and cancellation label. Original sales result remains intact.
4. Closing: “What changed when we included cancellations?” Then “Show the successful runs for this task.” Both rely on observed real results; list filtering is a smaller follow-up, not a critical flow.

Fully specified rehearsal wording: “Run harbor-order-summary for harbor-september, grouped by product, excluding canceled orders, and verify the saved output.” Second wording: “Create the September product sales review using paid orders only.” Rehearsals must use actual Nova, with two successful passes for each critical flow and independent saved-state checks. Local tests do not count.

## Fixtures and expected arithmetic

| File | Intended purpose | Expected result |
| --- | --- | --- |
| `01-failed-regional-close.json` | Baseline task failure, quantityOverride −2 | Failed with actual source-quantity validation error |
| `02-corrected-regional-close.json` | Replay correction | 5 orders, 10 units, INR 19,390; region North 8,497 / South 3,499 / West 7,394 |
| `03-paid-product-review.json` | New task test | Paid product totals Ceramic mug 2,396 / Desk lamp 9,996 / Linen throw 6,998 |
| `04-all-order-product-review.json` | Follow-up replay revision | 6 orders, 13 units, INR 21,187; Ceramic mug increases to 4,193 |

Before opening capture, populate a small real baseline: one completed prior regional result and one uniquely identified failed September run. Keep the failed repair and new product review unfinished for Nova. Record every created run ID/URL/payload/status in `synthetic-objects.json`; no API or code fixture result may be passed off as Nova's live browser work. Retain useful baseline/failed runs rather than deleting unrelated data. If new failed runs accumulate during rehearsal, explicitly identify the intended capture baseline in the live guide using its observed ID.

## Setup and activation (coordinator only)

From `examples/trigger-dev`, use `npm ci --ignore-scripts`, `npm run check`, `npm test`. CLI dependency is pinned, so `npm exec -- trigger --help` does not need an unpinned download. Authenticate the CLI through its normal supported login if no existing valid login exists. Do not print auth files or access tokens. Start `npm run dev` from this subproject only after acquiring live-session ownership; it targets the supplied project and default Development environment. Keep it running through rehearsal/capture. No deployment is required or authorized for this development-only workload. Verify the registered task name and connected worker in the dashboard before triggering anything.

The declarative Nova guide factory is `BE/src/sites/trigger-dev.ts`. Registration/theme wait for the exact observed accent and screenshot evidence. All flows remain `verified: false`. Register with isolated site-store `sites.trigger-dev.json`; build/reload only at coordinator handover, then verify hostname, project, dev scope, profile, theme, cursor, input pacing and pairing in one preflight. Provider model settings are unchanged.

Blockers remaining: CLI login/worker connection; real task test and replay controls; saved run routes; baseline IDs; Nova rehearsals; exact dashboard color evidence; capture preflight. None is solved by the pure computation tests.

## Local validation checkpoint

- Nested project `npm run check` passed; `npm test` passed 4 focused tests for paid regional reconciliation, failed-input correction, cancellation/product revision, and malformed input rejection.
- Root `npm run typecheck` passed; 4 existing focused suites / 11 tests passed (site-store, site-experience, extension-theme, page-theme).
- Pinned CLI 4.6.3 help and `dev start --help` execute successfully. `npm run dev` explicitly disables update checks/CLI telemetry and caps concurrent runs at 1. No worker was started.
- Canonical CLI auth directory `/Users/macbook/Library/Preferences/trigger` was absent at inspection; normal CLI login is an outstanding prerequisite. Only path existence was inspected; no token or credential was read.
- Dependency installation used worktree-local paths and ignored install scripts. No startup extension build or installed runtime change was performed.
