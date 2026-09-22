# Interfaze — actual retained recording script

**Provisional capture — replacement required:** This take passed local technical media QA and was uploaded at checkpoint `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`, but its empty Playground opening fails the required visibly populated baseline. It is not the delivered final or full acceptance. The coordinator is preparing a replacement with a real synthetic baseline conversation. References below to the final take identify this historical candidate at runtime `18a702d`; preserve its exact evidence. Independent remote recovery was underway at this documentation checkpoint.

This is the executed take, reconciled from the saved final session and operator receipts. Earlier candidate scripts are planning records, not a claim that every planned line appeared.

**Source identity:** runtime `18a702d0f167014c46df07bf840223adcd55ed52`; frontend built from `68a0957f390289f017aa57e0903cea56ed4bbc43`, unchanged by later backend/profile changes per coordinator. Session `6608e1ac-cd47-42a1-9bb0-1277db1eeb3f`.

**Original:** `artifacts/interfaze/media/nova-interfaze-original.mov`; recorder reports 23,970 frames at nominal 30 fps (799 seconds), 3024×1776, no audio. First encoded frame epoch: `1790049469029`. These are source/recorder timings, not final edited timings or measured agent latency.

**Opening baseline:** fresh clean Playground, Nova initially closed with launcher visible; local task-only chat empty, System Prompt empty, JSON off, Temperature 0 already retained. Historical genuine synthetic server Logs remained. Do not describe the initial chat as visibly populated or credit Nova with changing a temperature that was already zero.

## Actual dialogue and actions

| Raw submission time | Exact user message or card interaction | Observed outcome |
| --- | --- | --- |
| 20.784 s | Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word. | Fresh one-word test returned damage before any card. |
| 89.833 s | Turn this into JSON triage for Cedar Desk at temperature zero. | Genuine JSON-fields clarification appeared. |
| 113.299 s | Click **Help me choose** | Actual help action sent: “Help me choose: explain the remaining questions in plain language. Keep my original task and the details I already provided.” |
| 142.409 s | Select **Category + summary** | Actual radio choice; alternative choices were Category only and Category + confidence. |
| 155.360 s | Click **Continue** | Card answer `json_fields = Category + summary`; Nova retained known categories and configured both required scalar strings. |
| 258.533 s | Test this prompt: CD-104 arrived with a cracked mug. Check Logs. | JSON damage result; exact request inspected in Logs. |
| 340.493 s | Add required boolean escalate: damage or delays over seven days. Test this prompt: CD-105 is nine days late, no damage. Check Logs. | Policy/schema revision began; field visibility required the follow-up below. |
| 463.052 s | Scroll the settings pane to the new field, then finish this test and check Logs. | Nova scrolled settings, named required boolean escalate, completed the CD-105 test after visible Send confirmation, then verified delivery/true. |
| 596.404 s | Test this prompt: CD-106 is exactly seven days late, no damage. Check Logs. | Boundary result delivery/false; exact request verified after Logs recovery. |
| 713.730 s | Which rule escalated CD-105? Does zero temperature guarantee accuracy? | Nova explained nine days exceeds seven and temperature zero does not guarantee accuracy. |
| 741.609 s | Show the saved output. | Nova quoted the final saved JSON. |
| 779.285 s | Scroll the log dialog down to Output. | Nova actually scrolled the log dialog to Output. |

At **524.339 s**, the operator clicked **Confirm action: submit synthetic CD-105 model test**. This ordinary confirmation remains part of the actual experience; do not describe the whole take as approval-free.

## Exact policies and outcomes

Initial System Prompt: `Classify as damage, delivery, or other. Return category and a short summary.`

Revised System Prompt: `Classify as damage, delivery, or other. Return category, summary, escalate. Escalate damage or delays over 7 days.`

`category` and `summary` were required scalar strings; the revision added required scalar boolean `escalate`. JSON was enabled and Temperature 0 retained. No final 12-word-limit or five-day-threshold revision was performed: those belong to earlier rehearsals.

- CD-104: `{"category":"damage","summary":"CD-104 arrived with a cracked mug."}`; status 200.
- CD-105: `{"category":"delivery","summary":"CD-105 is nine days late, no damage.","escalate":true}`; status 200.
- CD-106: `{"summary":"CD-106 is exactly seven days late, no damage.","category":"delivery","escalate":false}`; status 200; full retained request ID `req-f112ef24-2dff-41ea-b544-8c9e487e25c5`.

Final session retains no full IDs for the earlier three take requests. Do not substitute the different rehearsal request IDs or expand abbreviated AX labels by guessing. The final CD-106 request detail also records the earlier actual prompts and model replies as conversation context.

## Visible recoveries and preservation

The new escalate property was outside the visible settings area; the operator asked Nova to scroll and finish. The operator did not secretly complete the field. Logs failed to load for CD-105; Nova refreshed/revisited and verified the matching record. During CD-106 verification, Nova initially opened the older CD-105 log, closed it, revisited the playground/Logs and then verified the correct CD-106 result. There was one model submission per requested test in the retained action ledger.

Keep these real recovery steps, operator follow-up, ordinary confirmation and all Nova execution/model processing at 1x. Keep authored typing progressive at the actual recorded pace; the final edit applies no post acceleration to typing. Only genuinely prolonged operator idle pauses may be compressed using a measured edit map. Preserve the immutable original MOV. Local edited-media QA is accepted with the documented deviations in [final media QA](../../artifacts/interfaze/qa/media-QA.md) and the [media manifest](../../artifacts/interfaze/qa/media-manifest.json): 799 seconds original, 734 seconds edited, 65 seconds saved solely from six static operator waits. Independent remote LFS recovery remains underway and unverified after upload commit `a5a0c748eebbd54ffe2a47f311045a4aa01e3eb5`.
