# Northstar returns demonstration — captured sequence

Final raw take captured 22 September 2026 (Asia/Kolkata). The recording began at epoch `1790021120776` and the coordinator reported 16,922 frames. This document records the actual eight user events, including the Help me choose control and card answer. The coordinator independently verified all saved business outcomes after capture. Media editing, [local media QA](evidence/final-qa-report.md) and [independent acceptance](evidence/independent-final-acceptance.md) passed. Independent recovery from the private remote passed at `98ed06a`: all three complete file hashes/sizes match local originals and remote LFS pointers; see [remote backup verification](evidence/remote-backup-verification.json).

Loaded runtime: backend `94debcde941dcb30de7e3b89aebf26f963b109d9`, extension `b7e3172` (archive hash prefix `28e115`). Source/documentation checkout at capture was `49368c4`; it is not the already loaded backend identity. Scope: Vector / My first project, existing Northstar Returns Adviser and the existing Northstar dataset.

The unchanged raw is **564.066667 seconds**; both edits are **528 seconds (8:48)** at native 3024×1776/30 fps. The tap export contains **42 receipt-backed cues** (32 Nova, 10 operator). All Nova execution and typing remain at 1×, including the complete 128.001-second case task and its repeated column-menu work. Only four settled operator waits were shortened.

## Exact captured requests

1. **Alias rename.**

   Rename our returns dataset to Northstar Returns Readiness and save it.

2. **Prompt clarification.**

   Now improve our returns prompt for unclear requests. Help me choose how it should ask follow-ups.

3. **Help me choose.**

   Help me choose: explain the remaining questions in plain language. Keep my original task and the details I already provided.

4. **Clarification answer / grouped commit.**

   Details for Choose a follow-up style:
   How should the adviser handle unclear return requests?: Group all needed details

5. **Boundary cases.**

   Add and save two boundary cases: an unused standard jacket delivered exactly 30 days ago with a receipt, and a mug delivered exactly seven days ago and arrived damaged. Tag them window-boundary and damage-review. For damage, ask for the order reference and damage description. Leave Actual Output empty and reuse matching cases.

6. **Leave columns / 100-word revision.**

   Leave the columns as they are. Now keep grouped follow-ups, add order reference and damage description for damage reports, and shorten the prompt limit to 100 words. Commit it.

7. **Coverage and evaluation question.**

   Which policy cases are covered now, and have any evaluations run?

8. **Saved Preview.**

   Show the saved prompt in Preview.

## Observed results and limits

The opener renamed and saved the same six-case dataset. The grouped clarification saved commit `5562c12`; the later prompt revision saved `5fb11cb`, with grouped relevant missing details, an under-100-word instruction, damage order-reference/description questions, preserved 30/7-day policy boundaries and one `{customer_message}`. The coordinator independently reloaded that final prompt.

New Golden creation added the exact 30-day jacket (`cmuboj3st000slo0tslkn8ehq`) and seven-day damaged mug (`cmubojnd9000tlo0tsp634ae1`), bringing the observed total to eight while preserving the original six. Actual Output remained blank in the table. Requested tags were entered as chips before Save, but Nova could not expose the saved tag values in the table. After capture, the coordinator independently reopened both exact goldens and confirmed the requested tags, exact inputs/expected answers and blank Actual Output. Other execution fields were unset or zero defaults. Save was disabled and no postcapture edits were made.

The receipts contain 43/43 verified action steps. The case task's 20 include six column-selector attempts after creation/reload; the later user request visibly redirects Nova to leave columns unchanged. Two visual-target requests during the final prompt task were rejected before dispatch because they lacked a valid current screenshot/point, then Nova recovered. These limits remain part of the captured sequence; the run is not described as error-free or fully autonomous without steering.

No evaluation ran during this workflow. Nova's closing claim cited empty Actual Output and no versions; those observations do not independently audit every possible historical evaluation. The earlier signed-in setup lacked a metric collection/AI connection, and no setup or evaluation action was performed here. No scores, completed refunds or runtime model answers are claimed.

The single clarification card offered one-at-a-time, grouped or adaptive behavior. Help me choose recommended Adaptive, and the user selected Group all needed details. The generated Help description ended mid-sentence after “without promising”; the complete choices remained usable. The take demonstrates help and retained task context, not a multi-question partial-answer test.

See [live-verification.md](live-verification.md) for retained earlier failures and [verification/final-take-receipts.json](verification/final-take-receipts.json) for the small scrubbed request/timing/identity extract, and [verification/synthetic-objects.json](verification/synthetic-objects.json) for the eight task-owned saved objects. Do not replay these creation prompts against the now-populated dataset without first inspecting exact inputs and reusing matches. Existing-golden inline/pencil editing remains excluded because earlier Nova attempts failed.
