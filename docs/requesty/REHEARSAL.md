# Requesty rehearsal checklist

## Environment

- [x] Build the Requesty branch and reload the frozen recording-mode extension.
- [x] Start the Requesty backend/frontend and confirm local data uses `sites.requesty.json`.
- [x] Open one Requesty tab in the intended profile; close unrelated recording-window tabs.
- [x] Confirm the Overview still shows zero credits, requests, and tokens.
- [x] Confirm Custom Routing Policies and Prompts both render after a fresh navigation.

## Fallback policy

- [x] Inspect Custom for the intended task-owned name before creating.
- [x] Nova explains a recommendation only from exact visible provider/region/context/price facts.
- [x] Changed-choice rehearsal proves the model selection comes from the user or delegated visible evidence, not hidden script knowledge.
- [x] Exact catalog rows are added in primary-then-fallback order.
- [x] Concrete creation confirmation shows unique name, Fallback, ordered routes, providers, and attempts.
- [x] Saved policy is reopened and independently verified.
- [x] No Playground or inference action is used.

## Synthetic prompt

- [x] Inspect Prompts for the intended task-owned name.
- [x] User supplies or delegates the system-message intent; Nova does not retrieve a future answer from the guide.
- [x] Name and system message enter progressively in the real fields.
- [x] New policy is selected only if its exact entry appears in Model search; otherwise Model remains optional.
- [x] Default parameters remain unchanged unless the user requests a revision.
- [x] Concrete creation confirmation precedes Create.
- [x] Saved prompt is reopened and verified without Playground execution.

## Recording gate

- [x] Two successful passes per flow.
- [x] One complete script-order rehearsal including recommendation, user choice, revision, save, reopen, and closing zero-traffic check.
- [x] Combined preflight verifies operator character pacing, fast progressive Nova entry, purposeful scrolling/navigation, Nova cursor, hidden system pointer, and click receipts; the creation question-card path was already verified in both policy rehearsals.
- [x] One clean target tab, Nova closed at the opening, and no pre-existing debugging strip.

## Verified live runs — 2026-09-24

- Policy pass 1: `nova-demo-triage-fallback-r1`, exact OpenAI Global `gpt-5.6-luna` then `gpt-5.4-mini`, one attempt each.
- Policy pass 2 changed choice: `nova-demo-triage-fallback-r2`, exact OpenAI Global `gpt-5.4-mini` then `gpt-5.6-luna`, one attempt each.
- Prompt passes: `nova-demo-triage-prompt-r1` and `nova-demo-triage-prompt-r2`, saved and reopened with Model unset after the exact policy search returned no match.
- Script-order run: `nova-demo-triage-fallback-script1` and `nova-demo-triage-prompt-script1`; Nova recommended from the exact visible rows, the user chose, revised `next_action` to `owner_queue`, confirmed both creations, and reopened both objects.
- Closing Overview: balance `$0.00`, Requests (this month) `0`, Tokens (this month) `0`, Spend (this month) `$0.00`.
- Recording preflights: 46.533333 s navigation take (1,396 frames) and 77.166667 s progressive-entry take (2,315 frames), both H.264 3024×1776 at CFR 30 fps with no audio. Frame inspection verified paced operator entry, real Nova character entry, themed Nova action cursor, and hidden system pointer.

## Accepted final take

- Policy: `nova-demo-triage-fallback-final-01`, exact OpenAI Global `gpt-5.6-luna` primary then `gpt-5.4-mini` fallback, one attempt each; saved, reopened, and verified.
- Prompt: `nova-demo-triage-prompt-final-01`, SYSTEM message with `severity`, `summary`, and revised `owner_queue`; Model remained unset after the optional search returned no exact policy match; saved, reopened, and verified.
- Closing Overview: balance `$0.00`, Requests `0`, Tokens `0`, Spend `$0.00`.
- [x] Original, silent, and click-only exports decoded and inspected.
- [x] Silent/click exports contain 14,074 frames at 3024×1776 CFR 30 fps and share an identical encoded video stream.
- [x] All 36 click cues map to recorded session receipts and decoded source frames; final AAC verification passed with no sound outside cue windows.
