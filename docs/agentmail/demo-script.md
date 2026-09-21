# AgentMail demonstration script

Prepared 2026-09-21. UI paths were inspected by the coordinator. This script has not yet passed the required two live Nova rehearsals per critical flow.

## Story and opening

Cedar & Finch is a synthetic furniture studio preparing its customer-care inbox for order questions. Existing saved baseline: `easyservice502@agentmail.to`, display name **Cedar & Finch Support**, metadata `team` (String) = `Customer Care`; one unsent handoff reference draft for order CF-1042. Preserve that reference draft.

Start a fresh Nova-launched AgentMail tab on normal Overview, Nova closed. Use the user-authorized Chrome profile with exactly one target tab in the recording window. Open Nova with the launcher. Keep the native side panel, visible Nova action cursor and hidden physical/operator pointers. Current brand direction is neutral black and near-white, pending exact theme sampling.

First request, with a useful saved edit before any question card:

> Rename Cedar & Finch Support to Cedar & Finch Care, please.

Expected work: Inboxes -> the matching row's Inbox actions -> Edit Properties -> change only Display Name -> Update -> reopen and verify the new name on the same address. Preserve `team=Customer Care`. This useful opening is not counted as a substantial flow by itself.

## Flow 1: configure the existing support inbox

Natural underspecified request:

> Now organize this inbox for our furniture order questions.

Nova should collect only the metadata details it genuinely lacks. Proposed card content/answers:

| Detail | Answer |
| --- | --- |
| Team | Customer Care |
| Purpose | Furniture order support |
| Response target | 1 business day |

If offered help choosing the response target, use the card's help control and ask:

> Help me choose a realistic response target for a small care team.

Suggested recommendation: 1 business day as a descriptive service target, with no claim that AgentMail enforces it. Select or enter that value. Nova must retain any already supplied team/purpose answers.

Expected saved outcome: the same inbox address with display name Cedar & Finch Care; String metadata `team=Customer Care`, `purpose=Furniture order support`, `response_target=1 business day`. Existing `team` is reused rather than duplicated. Save using Update and reopen Edit Properties to verify all three fields and their types. Metadata is descriptive; do not call this routing, an automatic responder or an enforced SLA.

Fully specified rehearsal variation:

> In Cedar & Finch Care, keep team as Customer Care and set String metadata purpose to Furniture order support and response_target to 1 business day. Preserve the address and other metadata.

Second-rehearsal targeted variation:

> Change response_target to 2 business days, keeping the team and purpose unchanged.

Verify saved values, then restore only the task-owned metadata fields to the pre-take baseline using authorized browser work outside the recording. Keep the recorded metadata task unfinished.

## Flow 2: prepare and revise an order-update draft

Connected request:

> Prepare an order-update draft in that inbox for our review.

Grouped card answers (merge fields when the actual card groups them):

| Detail | Answer |
| --- | --- |
| Recipient | orders@customer.example |
| Order facts | Order CF-1048: oak desk; revised dispatch date October 2, 2026; tracking shared once dispatched. |
| Tone | Warm and concise |
| Subject | Your oak desk order update |
| Delivery state, only if asked | Save unscheduled for review; do not send. |

Expected body, allowing harmless natural wording variation:

> Hello,
>
> A quick update on your oak desk order CF-1048: dispatch is now planned for October 2, 2026. We’ll share the tracking details once your order has been dispatched.
>
> Thank you for your patience.
>
> Cedar & Finch Care

Nova checks for a matching task-owned draft, selects the same inbox, uses Compose only for a new draft, fills To/Subject/body and Close to autosave. It then opens Drafts -> the saved subject row -> Edit Draft and verifies recipient, subject, body and unscheduled draft state. Never Send or Schedule. The reference CF-1042 handoff remains untouched.

Revision:

> Change the dispatch date to October 5 and keep everything else.

Expected: edit the same CF-1048 draft, preserve recipient and subject, Close, reopen and verify October 5, 2026 replaces October 2, 2026. No duplicate draft and no invented delivery date, tracking link, refund or promise.

Fully specified rehearsal variation:

> Save an unscheduled draft in Cedar & Finch Care to orders@customer.example, subject Your oak desk order update. Say oak desk order CF-1048 dispatches October 2, 2026, and tracking follows dispatch. Use a warm, concise tone and sign Cedar & Finch Care. Do not send it.

## Closing sequence

> What did you set up, and what is still unsent?

Nova summarizes verified name/metadata and draft status from existing evidence. It must not claim that mail has been delivered or an automation has been enabled.

> Open the order-update draft so I can review it.

Expected: exact CF-1048 draft opened with the corrected date visible. End after the final verified useful result and a short readable pause.

## Recording acceptance

Keep Nova execution and page motion at normal speed. Capture raw, silent edit and approved-click-only edit, preserving click receipts for operator and Nova. Preserve genuine clarifications; compress only prolonged operator idle waits and use roughly 1.2x operator typing where necessary. Cover only the complete debugging strip in edited versions; no privacy covers over ordinary product content. Stop on cursor loss/duplication, extra tabs or exposed credentials. Record measured latency independently of edited duration. Final capture and remote backups remain coordinator-owned and pending.
