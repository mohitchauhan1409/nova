# Trigger.dev preparation — 2026-09-22

> Current checkpoint: the worker is connected, real baselines exist, and Nova has completed two recovery rehearsals and two critical sales-flow passes (paid-only product review and cancellation-inclusion variation). The current capture build is `c1db2d1` (shared main `1b2062b`). Cancellation variation and preflight media QA are verified; final raw capture is complete, and all three final-run independent persistence checks passed; final media QA is accepted with disclosed limitations; see [delivery.md](delivery.md) for media and backup status. See [final-capture.md](final-capture.md) for actual take evidence and recovery. See [verification.md](verification.md) for source-specific receipts and [script.md](script.md) for the current draft. Earlier prerequisite/blocker notes below are historical and are superseded by that checkpoint.


Status update: coordinator verified native Ask Trigger reports read-only tools and cannot execute, trigger, retry, cancel or change configuration. Supplied org/project/dev scope and project ref were verified. Trigger.dev retained. Isolated pure task and unverified declarative guide are now prepared; see scenario.md. No live browser, worker/backend activation or Git mutations were performed by this worker. The research below records the original public-source assessment.

## Eligibility assessment

Proceed provisionally for the user's specific criterion: no primary-source evidence found of an in-dashboard general agent that independently operates arbitrary dashboard workflows. This is an inference, not proof of absence. The coordinator must inspect the current Ask Trigger experience before implementation.

Native AI is more capable than a docs-only comparison implies:

- [AI in the dashboard and CLI](https://trigger.dev/changelog/ai-help-dashboard-cli), 2025-04-29: the native Ask AI widget is documented as documentation assistance; CLI error help is separate.
- [AI run filtering](https://trigger.dev/changelog/ai-run-filtering): natural language actually configures task/status/time filters.
- [Query & Dashboards](https://trigger.dev/changelog/query-and-dashboards), 2026-03-05: a native assistant generates and executes TRQL analytics queries. Thus Nova must not claim native AI cannot act at all.
- [Set up with your AI agent](https://trigger.dev/changelog/ai-agent-setup), 2026-09-03, and [MCP introduction](https://trigger.dev/docs/mcp-introduction): external coding agents can initialize projects, inspect tasks, start dev workers, trigger runs, inspect traces, deploy, and query metrics through the official MCP/CLI. These overlap substantially with outcome-level Nova capabilities, but are not a native in-dashboard browser operator. If the user's exclusion is interpreted as any agent integration rather than same dashboard interaction, this is material.
- [Chat agent](https://trigger.dev/changelog/chat-agent): infrastructure for developers' own agents, not evidence of a built-in dashboard operator.

Ask Trigger check for the coordinator: ask whether it can itself open this project's development task, enter a supplied harmless test payload, trigger it, and inspect/replay the saved run. Capture its capability answer and any available tools/actions. Do not accept documentation answers as execution evidence.

## Proposed story and flows (unverified)

Story: a synthetic daily order-summary job for an imaginary shop. Worker code computes deterministic totals from inline fake orders, emits logs, and returns a summary. It performs no network calls, sends no messages, accesses no secrets, and writes no external data.

1. Diagnose a seeded failed development run, inspect its payload and error, replay it with the invalid quantity corrected, then reopen the new run and verify Completed plus the exact calculated output. Short opener: “Fix the failed demo order summary.” Baseline task/run must be uniquely identified in site guide and manifest. This is substantial real diagnosis, editing, execution and persistence.
2. Create a second development test from the same inspected task, ask a genuine question about the summary grouping (region or product) and inclusion of canceled orders, enter a concise JSON payload, execute, inspect logs/output, and return to saved run details. Follow-up: change the requested grouping via replay with edited payload and compare verified totals. Closing useful task: filter the run list to this task's successful runs and reopen the revised result.

[Run tests](https://trigger.dev/docs/run-tests) documents dashboard task tests; [Replaying](https://trigger.dev/docs/replaying) and [Runs](https://trigger.dev/docs/runs) document replay with a changed payload, new runs, and completed output. Exact current controls/routes remain live-verification dependencies.

Safety: only supplied org nova-56d7 / project nova-YcS4 / dev. Inspect actual task code before any invocation, including existing tasks. Prefer one local pure computation task with retry disabled for the deliberate invalid-input case. Preparation code/baseline calls are not Nova browser work. Log exact owned task and run IDs, scope and cleanup eligibility. Never rely on “dev” alone for harmlessness.

Dependencies: correct project reference (dashboard slug is not necessarily SDK project ref), CLI authentication, SDK/build dependencies, a registered dev worker that remains running throughout rehearsals/capture, safe seeded failure and success, observable JSON editor and saved run pages. If worker authentication is blocked, avoid fake runs and find a genuinely supported configuration flow after dashboard inspection.

## Local customization and activation

- Add typed preset in `BE/src/sites/trigger-dev.ts`; register in `BE/src/sites/customizations.ts`; isolated store `sites.trigger-dev.json`.
- Guide enters via `SiteProfile.instructions` and flows. Keep `verified: false` until actual coordinator receipts exist.
- Scope panel CSS to `.np-app[data-site="cloud.trigger.dev"]` in `web/src/panel/customization.css`; launcher CSS belongs in `web/companion/customization.ts`. Theme accent/surface must come from observed live UI. `shared/site-experience.ts` supplies greeting and first two flow suggestions; page-theme detector already supports dark surfaces.
- Worktree-local `BE/data` is automatic; `.env` credentials remain untracked. `PORT` controls backend, default 8787. Do not start a backend or mutate extension pairing until coordinator handover.
- Build: `npm run build`; focused existing customization/theme tests, then required repository checks. Build writes this worktree's `web/dist` and `web/dist-extension` only. Coordinator must activate/reload correct extension, restart correct backend, verify pairing/site-store/hostname/theme and freeze build SHA before capture.

Next handoff: coordinator confirms eligibility, scope, current dashboard theme, tasks/worker status and chosen real controls. Then worker can implement isolated preset/theme/scenario files.

## Batch checkpoint

Live verification is blocked by the Computer-to-Chrome connection returning only window titles and no screenshots. Both macOS permissions were verified enabled. User retry and tool reset did not restore access. No startup implementation, final recording or media backup is complete. Resume the eligibility check first after connection recovery.


## Customization handoff — 2026-09-22

Registered the existing Trigger.dev profile factory in `BE/src/sites/customizations.ts` with native primary purple `#5a24e4` and isolated `sites.trigger-dev.json`. Existing guides and Development scope restrictions remain intact; both flows remain unverified. No task connection or successful run is implied. Current dependency from coordinator: official CLI authorization grant awaits completion; no task connected yet.

Native theme evidence: coordinator screenshot `private/trigger-theme.png`, background approximately `#17161b`, secondary surface `#1b1a1f`, borders `#222126`, primary purple `#5a24e4`. Scoped panel and launcher styles use these surfaces. Readable light text and lavender text accents accompany the purple controls. The action arrow, label and click ring use one solid primary purple. Cursor lifecycle/input remain shared; no overlays or substitute cursor path added. Meaningful success/error colors remain distinguishable.

Validation: TypeScript no-emit check passed; site-experience, page-theme and extension-theme suites passed (7 tests). No build, UI operation, runtime/extension activation or git commit performed. Coordinator must inspect the native dark panel, initial launcher, clarification cards and cursor in actual preflight, then finish the worker/task/run prerequisites and required live rehearsals.

## Runtime checkpoint

2026-09-22: user completed official CLI authorization. `whoami` confirmed requested account and project. Coordinator started Development worker20260922.1 with inspected synthetic-only task. Root recording build passed after main8407291 integration. Task dashboard registration, live baseline and Nova rehearsals still pending; this is setup, not a Nova-completed workflow.
