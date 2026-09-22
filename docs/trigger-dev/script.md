# Trigger.dev recording script — plan retained alongside actual captured sequence

The final take is now captured. Its actual prompts, card choices, interruptions and recovery are documented in [final-capture.md](final-capture.md). The sequence below is the planning script, not a verbatim claim about what occurred. Independent final-run persistence checks passed; final final media QA is accepted with disclosed limitations; see [delivery.md](delivery.md) for media and backup status.

Use the real Development task `harbor-order-summary` in the verified Nova project. This script supplies user prompts and evidence gates, not fabricated Nova answers. Retain genuine waits, clarification, errors and recovery. Only root/coordinator operates the live browser.

## Opening and failure recovery

1. Start from the dashboard with the intended failed baseline `run_06gce5bc7htr5tju4uqvju4h01` available. Send: **“Open the failed Harbor & Vale run and explain the error.”** This is read-only: Nova opens the actual run and reads its failure. Expected source evidence is HV-104 `quantityOverride: -2`, allowed integer range 1–100, source quantity 2.
2. Send: **“Fix it using the source quantity and verify the new result.”** Nova inspects Development and the task, replays with the corrected quantity, waits for completion, reads the saved payload and output, and reopens the new run. The currently rehearsed route uses compact JSON; do not substitute editor APIs or a precomputed success.
3. Evidence gate: actual new run is Completed, override 2, 5 paid orders, 10 units, INR 19,390. North 8,497; South 3,499; West 7,394. Record the new run ID. If the task or UI fails, keep the failure honest and do not claim completion.

## Sales review and genuine clarification

4. Send: **“Now prepare a sales breakdown for our September review.”** Grouping and cancellation treatment are genuinely unspecified. Let Nova ask its real clarification rather than pre-answering every choice.
5. Use the actual **Help me choose** path, or send **“Help me choose—explain the remaining options in plain language and keep the details I already provided.”** Nova should explain region versus product grouping and paid-only versus including cancellations without dropping the original request.
6. Choose **Product** and **Paid orders only** through the current real question card. Nova submits the actual Development test, waits, inspects the output/logs and reopens the saved run.
7. Evidence gate: 5 orders, 10 units, INR 19,390; Ceramic mug 2,396, Desk lamp 9,996, Linen throw 6,998. Preserve and identify this paid-only run for the later comparison.

## Revision and comparison

8. Send: **“Include canceled orders too, but keep the product grouping.”** Nova changes only that option through the actual test/replay flow, waits and verifies the new saved result. This variation has a successful rehearsal receipt, including a genuine page-changing stop and subsequent verification of the existing run without rerunning it; the final take is captured; use `final-capture.md` for its actual events.
9. Evidence gate (now rehearsed): 6 orders, 13 units, INR 21,187 order value; Ceramic mug 4,193, Desk lamp 9,996, Linen throw 6,998. The output must explicitly include cancellation treatment. Record the distinct run ID and confirm the original paid-only result still exists.
10. Send: **“What changed when we included cancellations?”** Use the two observed saved outputs: verified rehearsal difference is one canceled order, three mug units and INR 1,797 order value. Nova must explain that the revised figure includes canceled demand and is not paid sales. Do not report this comparison until both real results have been inspected.

## Small follow-ups

- **“Show the successful runs for this task.”** Verify the actual list/filter state and identify the observed runs; filtering alone does not prove their outputs.
- **“Open the paid-only product review again.”** Reopen the exact saved ID from step 7 and confirm its original cancellation setting/totals persist.

Before calling the take final, reconcile every claim against the recorded UI and frozen session evidence. `verification.md` lists completed rehearsals and remaining gates; `synthetic-objects.json` separates manual baselines from Nova-created runs. Final raw capture is complete; final final media QA is accepted with disclosed limitations; see [delivery.md](delivery.md) for media and backup status.

Rehearsal checkpoint: both critical flows have two accepted passes; the sales-flow second pass is the fully specified cancellation variation, not a duplicate paid-only run. Radio-question clarification was separately rehearsed live. Preflight media QA is accepted. Preserve real recovery if it occurs in the final take rather than representing every rehearsal as uninterrupted success.
