# Trigger.dev final captured take

The final take and its silent/click exports are accepted with the genuine limitations below. Media QA and fresh receipt/audio/hash checks passed; [delivery.md](delivery.md) records artifact and backup status. Independent persistence verification passed for all three final-take runs: the coordinator reloaded the actual demand result and independently navigated to the observed paid-product and recovery runs, confirming their saved payloads, Completed status and outputs. This is a coordinator CUA verification report, separate from the Nova session and earlier rehearsal checks.

## Frozen capture provenance

- Raw: `artifacts/trigger-dev/media/nova-trigger-dev-original.mov` in this Trigger worktree. Preserved unchanged; final media-worker and independent selected-frame acceptance are in the tracked QA reports.
- Coordinator capture counters: 17,480 frames, 582.6667 seconds, first frame timestamp `1790053236706`. Full elapsed take is approximately 9:42.667.
- Source and frontend build: `c1db2d16de27cd42b0b5f3490288ea70417edccf`; shared main checkpoint `1b2062b`.
- Frozen session: `/Users/macbook/Desktop/Nova-batch-20260922/private/trigger-final-sessions.json`, session `09b9d208-c1cf-468f-8397-e64797f31e62`, ready after 22 steps.
- Operator ledger: `/Users/macbook/Desktop/Nova-batch-20260922/private/trigger-final-operator.json`. It records eight typed prompts, actual clarification choices/approvals, pointer clicks and operator scrolling. “Help me choose” and card-answer messages are additionally visible in the frozen session.
- Capture interactions are genuine and retained at 1×. Only a static 20-second operator wait is shortened to 5 seconds. Final EDL, decoded audio, frame comparison and hash evidence are archived under `artifacts/trigger-dev/qa/`.

## Actual typed prompts

Offsets below are submitted timestamps minus the first-frame timestamp, rounded down to seconds. These are navigation aids, not edit instructions.

| Raw offset | User prompt |
| --- | --- |
| 00:22 | Open the failed Harbor & Vale run and explain the error. |
| 00:53 | Fix it using the source quantity and verify the new result. |
| 02:30 | Prepare a September sales review for Harbor & Vale. |
| 05:59 | The new run is already created. Close this replay form and verify that saved run; do not run it again. |
| 06:56 | Include cancellations in a new product report. Label it order demand and compare the totals. |
| 08:17 | Which figure belongs in the sales review? Did this change the source orders? |
| 08:48 | Scroll the run details down to the output totals. |
| 09:26 | Read the visible product totals and confirm the demand total. |

Between the sales-review request and verification follow-up, the native Nova question card asked for grouping and cancellation treatment. The operator clicked **Help me choose**, then selected **Product** and **Paid orders only** on the resulting actual card and continued. The session preserves both the superseded original card and the answered replacement card with those exact choices. No substitute question/answer state is implied.

## Final-take saved runs

| Purpose | Run ID | Nova's captured verification | Independent post-capture reload |
| --- | --- | --- | --- |
| Correct source quantity and replay | `run_06gcevgt220c3vb87n2s8sqr01` | Completed; override 2; 5 paid orders, 10 units, INR 19,390; North 8,497 / South 3,499 / West 7,394 | Passed — coordinator independently reopened/reloaded saved native result |
| Product paid-only sales review | `run_06gcf0amvcjg3f93pc9bbsfn01` | Completed; 5 orders, 10 units, INR 19,390; Ceramic mug 2,396 / Desk lamp 9,996 / Linen throw 6,998 | Passed — coordinator independently reopened/reloaded saved native result |
| Product order-demand revision | `run_06gcf0slngvrbr94jmh5dl4m01` | Completed; 6 orders, 13 units, INR 21,187; Ceramic mug 4,193 / Desk lamp 9,996 / Linen throw 6,998. Difference +1 order, +3 units, +INR 1,797. | Passed — coordinator independently reopened/reloaded saved native result |

These are final-take objects, distinct from the rehearsal IDs. Full URLs and evidence status are in `synthetic-objects.json`. The last frozen snapshot and final answer concern the demand revision; do not treat that last snapshot as a standalone snapshot of all earlier runs.

## Genuine interruptions and recovery retained

- After creating the paid-only product report, Nova proposed another Replay. The operator canceled that redundant proposal at approximately **05:40**, then visibly instructed Nova to close the form and verify the existing saved run without running it again. Nova then verified `run_06gcf0amvcjg3f93pc9bbsfn01`. The extra proposed Replay was declined. The coordinator confirmed only the three listed final-session run identities and no extra invocation after Cancel; do not portray the proposal as executed or the sequence as uninterrupted.
- The captured trace includes the generic warning **“Review this purchase, communication, deletion, agreement, or sensitive account change.”** during the synthetic paid-product workflow and later revision. The wording was broader than the routine synthetic task. Real operator approvals and the declined redundant proposal remain part of the take; this is not a no-approval-card demonstration.
- A genuine dashboard fetch error and reload of the new demand run remain in the take. Nova recovered by opening the saved result, without another submission.
- The final **Scroll the run details down to the output totals** action moved the pane correctly according to the coordinator's direct observation, but Nova's completion check returned a false negative. The operator's visible **Read the visible product totals and confirm the demand total** follow-up produced the correct 4,193 / 9,996 / 6,998 and total 21,187 answer. Retain both messages; do not describe the scroll as a verified one-shot completion.
- Nova explained that 19,390 is the paid-only sales-review figure and 21,187 is order demand including cancellations. The synthetic source ledger remains unchanged; the flows create separate result runs rather than editing source orders.

## Delivery checkpoint

Independent post-capture checks are complete: demand `includeCancelled: true`, total 21,187, groups 4,193/9,996/6,998 and HV-105 included; paid product `includeCancelled: false`, total 19,390 and groups 2,396/9,996/6,998; recovery `groupBy: region`, override 2, total 19,390 and groups 8,497/3,499/7,394. The coordinator stopped the Trigger backend only after the session was ready and checks had passed. This does not change the frozen capture build.

Final media QA accepts the 582.666667-second original and two 567.666667-second exports, with 34 actual-dispatch tap cues and identical silent/click video streams. The media worker inspected all 34 dispatch/response states and focused typing/scrolling ranges; the independent reviewer inspected selected decoded states. Neither claims every-frame pointer review. Exact hashes and remote recovery status are in [delivery.md](delivery.md).
