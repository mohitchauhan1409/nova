# Trigger.dev live verification checkpoint — 2026-09-22

Final recording is now captured; see [final-capture.md](final-capture.md) for the frozen take, actual prompts, three new run IDs and genuine recovery disclosures. Independent persistence checks passed for all three final-take runs; export QA, backup and delivery remain pending. The rehearsal/preflight evidence below remains distinct from final-take evidence. The coordinator owns all browser actions and independent reload checks. This documentation worker inspected the saved preflight session and otherwise uses the explicitly identified coordinator reports below.

## Scope and provenance

- Organization `nova-56d7`, project `nova-YcS4`, Development only; project ref `proj_futnuhorkbwfxqmsvsgv`.
- Task `harbor-order-summary`, batch `harbor-september`; synthetic Harbor & Vale ledger. No production jobs or customer orders are involved.
- Native Ask Trigger capability was checked by the coordinator: its tools reported read-only operation and no execute, trigger, retry, cancel or configuration changes. This does not negate Trigger.dev's separate query/filter and external agent integrations; see `preparation.md`.
- Current capture build: Trigger branch `c1db2d16de27cd42b0b5f3490288ea70417edccf`, shared main checkpoint `1b2062b`. Build identity comes from the coordinator's activation handoff. Do not apply later changes during a take.
- Earlier rehearsal build `ccccd2e` is separate provenance. Its success followed an unsuccessful multiline editor attempt; it is not evidence of a clean first attempt or a final take.

## Observed saved runs

| Purpose | Run ID | Result and verification | Provenance |
| --- | --- | --- | --- |
| Prepared successful regional baseline | `run_06gce57r68q6pm0hd9u7qe7s01` | Completed; 5 orders, 10 units, INR 19,390 | Manual UI preparation; not Nova's work |
| Prepared failed regional baseline | `run_06gce5bc7htr5tju4uqvju4h01` | Failed; HV-104 override −2 invalid, source quantity 2 | Manual real replay; coordinator independently reloaded failure |
| Recovery pass 1 | `run_06gcesb4g3gu9g6kuov17hi401` | Nova replay completed; 5 orders, 10 units, INR 19,390; regions North 8,497 / South 3,499 / West 7,394. Nova reopened; coordinator independently reloaded and checked totals. | Coordinator report; build `ccccd2e`; compact JSON recovery after failed multiline attempt |
| Recovery pass 2 | `run_06gcetu0404pp12smnc4ugdf01` | Clean direct compact replacement; saved override 2; same regional totals. Nova reopened; coordinator independently reloaded and checked totals. | Build `c1db2d1`; saved session `1f044a46-7301-4549-99d2-e62563b498b9`; direct saved-snapshot inspection plus coordinator reload report |
| Paid product review pass 1 | `run_06gcet28504v9bs4dlagi96r01` | Completed; INR 19,390; Ceramic mug 2,396 / Desk lamp 9,996 / Linen throw 6,998. Coordinator independently reloaded and verified. | Coordinator report; exact originating build/session not supplied in this handoff |
| Cancellation-inclusion product revision / critical sales-flow pass 2 | `run_06gceuhcrj4n4j9v43l05c0i01` | Completed; 6 orders, 13 units, INR 21,187 order demand; Ceramic mug 4,193 / Desk lamp 9,996 / Linen throw 6,998; HV-105 included. INR 1,797 above paid-only 19,390. | Build `c1db2d1` / main `1b2062b`; saved session `1f044a46-7301-4549-99d2-e62563b498b9`; Nova reopened existing result after page-changing stop, without rerun; coordinator independently reloaded and verified. |

Full Development run URLs and explicit evidence sources are in `synthetic-objects.json`. Runs are distinct saved objects. No failed editor entry is recorded as a successful task invocation.

## Saved preflight evidence

`/Users/macbook/Desktop/Nova-batch-20260922/private/trigger-preflight-sessions.json` contains session `1f044a46-7301-4549-99d2-e62563b498b9`, ready after 9 steps. Its messages show the read-only opener, diagnosis of override −2/source 2, the requested repair, a Development replay, and the corrected result. Its saved snapshot exposes Completed, override 2, all five included order IDs, 10 units, INR 19,390 and the three regional groups. This file independently supports the second Nova recovery receipt; the coordinator's separate native reload is additionally reported, not reconstructed by this worker.

Earlier session `76c9082d…` belongs to earlier rehearsals. The rolling `private/trigger-dev-sessions-current.json` is overwritten and must not be cited as a frozen receipt for those earlier states. Preserve separate snapshots before final capture if they are needed as durable evidence.

The preserved `/Users/macbook/Desktop/Nova-batch-20260922/private/trigger-successful-rehearsals-current.json` contains the full successful rehearsal session, including the cancellation variation. Direct inspection confirms the fully specified user request (“Now summarize by product including cancellations. Label it order demand and compare with the paid-only total.”), a real replay, a page-changing verification stop, and the visible follow-up “The run is completed. Reopen this saved result and verify the demand totals; do not rerun it.” Nova then verified the existing saved result without another run. This was a genuine recovery, not an uninterrupted first-attempt success. The saved snapshot contains the new run ID, Completed, all six orders including HV-105, 13 units, total 21,187 and all product groups. The coordinator additionally independently reloaded and verified payload `includeCancelled: true` and output.

Preflight raw capture: `/Users/macbook/Desktop/Nova-batch-20260922/private/trigger-preflight.mov`; 4,258 frames / 141.933 seconds; first frame timestamp `1790052811461`. These are coordinator-reported capture counters. The media worker accepted preflight QA at `/Users/macbook/Desktop/Nova-batch-20260922/private/media-checks/trigger-preflight-qa`, including the 141.933-second capture and a 67-second focused export. Character input, cursor, scrolling and approval behavior passed, per the coordinator’s QA handoff. This is preflight acceptance only; no final recording/export/backup claim is made here.

## Rehearsal status and remaining gates

- Two recovery passes are verified. Pass 1 recovered from the failed multiline attempt; pass 2 used clean compact replacement.
- Two critical sales-flow passes are now verified: the paid-only product review and the fully specified product/cancellation variation. The variation counts as the second pass; a duplicate paid-only run is not required. It included the visible page-changing recovery described above.
- The radio-question clarification was already rehearsed live, per coordinator report. Do not imply that the fully specified cancellation command itself displayed a clarification card.
- Preflight media QA is accepted. The final raw take is captured on unchanged build `c1db2d1`; independent final-run persistence checks have passed, and final media QA is still pending.
- Final render/export, natural click audio, whole-video QA, final hashes, backup and delivery remain pending. Raw capture is complete; details and limitations are in `final-capture.md`.

Including cancellations is now verified in a real saved run: 6 orders, 13 units and INR 21,187 order demand, with Ceramic mug 4,193 and other product groups unchanged. Compared with the verified paid total, this adds one canceled order, three mug units and INR 1,797. It must not be called paid sales or recognized revenue.
