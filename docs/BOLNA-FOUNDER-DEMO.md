# Bolna founder demo — brief to agent to workflow to campaign

The recording now centers on **creation**, not four small edits. Three creation guides and four supporting guides use Nova’s normal browser engine, live observations, question cards, action receipts and approvals. No prerecorded executor or hidden Bolna API is used.

**Current status:** creation guides are active. The connected workflow passed live reload verification; campaign form preparation passed live in 33.3 seconds. Agent creation passes isolated tests and awaits its exact live replay. Campaign upload approval is pending. See the readiness table below before recording.

## Setup

1. Keep `npm run dev` running. `npm run demo:bolna` applies the creation preset and backs up the previous profile.
2. In **the signed-in Chrome profile**, open [Nova](http://127.0.0.1:5173/) → Bolna → Open with Nova. Use Nova’s native side panel, Chat mode.
3. Start **New conversation**. The welcome should offer **Build a complete workflow** and **Prepare a campaign**. These backend guide changes do not require another extension installation; the controller remains 0.6.7.
4. Use fictional demo data. Keep the dashboard, agent cursor and final observed result visible; crop unrelated account details. Label any video speed-up. A successful clip must show the actual resulting object, not just Nova saying “done.”
5. Rehearsals reuse an exact matching demo name instead of making duplicates. For a recording that must show fresh creation, choose a genuinely new name and use it consistently in later prompts.

## 1. A business brief becomes a saved voice agent

For the guided-card experience:

> Create a new English voice agent for my workshop. Ask me the missing business details together, then write its welcome and instructions, configure it and save. Do not make a call.

Supply these details in the card (the labels may differ):

- Agent name: **Nova Demo — Consultation Concierge**.
- Business facts: fictional workshop; Monday–Friday, 10 AM–6 PM, Asia/Kolkata; consultations last 20 minutes.
- Purpose: answer opening-hours and consultation questions, clarify uncertainty, never claim to book an appointment.
- Greeting: friendly, concise, include `{first_name}`, ask whether the caller wants hours or consultation information.
- Settings: English, Temperature 0.4, Output tokens 400; retain default voice/model/routing.

Fully specified replay prompt:

> Create and save an English agent named Nova Demo — Consultation Concierge for a fictional workshop. Open Monday to Friday 10 AM to 6 PM Asia/Kolkata, consultations last 20 minutes. Welcome the caller using {first_name}, ask whether they need hours or consultation information. Write a concise Canvas prompt using these facts; clarify uncertain requests and do not claim bookings. Set Temperature 0.4 and Output tokens 400. Retain default voice/model/routing. Do not call anyone.

**Pass:** exactly one named saved agent; requested welcome, business prompt and numeric settings; saved record identity. No unrelated provider/routing edits or call. A “draft saved” toast alone does not pass.

## 2. Create a complete connected workflow

Guided opening:

> Build a complete consultation workflow for me. Ask for the missing name, sequence, agent and input fields together, then create and validate it. Leave it unpublished and do not execute it.

Use this exact fully specified rehearsal to remove ambiguity:

> Create a new workflow named Nova Demo — Consultation Journey. Keep required mobile_number input. Use the literal greeting fallback there for the selected agent’s first_name variable. Build Start → Agent using the existing Nova Demo — Workflow Lab → Wait for 2 minutes → End with success outcome. Name the nodes Workshop conversation, Review pause, and Journey complete. Connect every node, validate and leave unpublished. This is only configuration: do not make calls, publish or execute it.

This creates a draft containing a future call step; configuring it does not place a call. It uses the already-saved lab agent to isolate workflow creation from the previous clip. Use the new Concierge only after its saved identity has been verified.

**Pass:** exact workflow name; required phone schema; selected real agent; requested delay; explicit success ending; actual connecting edges; **No issues found**; unpublished state. If Bolna requires caller configuration or offers additional status branches, Nova must inspect and ask about those prerequisites rather than silently omit them. This straight-line draft is not evidence of retry, branching or live call execution.

Follow-up to demonstrate continuity:

> Change Review pause to 5 minutes, keep all other settings and connections unchanged, and validate again. Do not create another workflow.

**Pass:** same workflow identity, one targeted change and clean validation. No duplicate creation or needless re-entry of the whole flow.

## 3. Prepare a real campaign against a published version

Guided opening:

> Help me prepare a campaign. Ask for the missing campaign name, published workflow/version and contact-file source together. Configure it and stop before launch or scheduling.

Use the separately published **no-contact** lab workflow for a safe campaign preparation clip. The newly created calling workflow above is deliberately unpublished and cannot silently be substituted.

> Prepare a campaign named Nova Demo — Founder Preview using Nova Demo — No-contact Workflow Lab, Version 1 latest. I will select the CSV file myself from my computer when you reach Contacts. Configure its name, workflow and version, then stop and tell me the specific upload step remaining. Do not launch or schedule.

**Pass before upload:** correct campaign name, exact published workflow/version, version-specific Contacts/template controls, truthful file-selection handoff. Report a prepared form if Bolna has not yet created a campaign record. Neither “Saving…” nor clicking New campaign proves creation.

The existing synthetic sample is `artifacts/bolna/nova-demo-campaign.csv`: header `reference_id`, one synthetic row `nova-demo-001`. Compare against Bolna’s actual downloaded version template before using it. The file chooser currently needs the user. Choosing/uploading a file is separate from preparing the form; do not say Nova uploaded it automatically.

After you select the intended file, continue:

> I selected the intended demo CSV. Inspect the actual filename, accepted row count and any errors. Complete only draft preparation if it does not start execution. Show the campaign’s actual saved status and stop before launch or scheduling.

**Pass after upload:** actual accepted filename/row count, no validation errors, observed campaign identity/status. If the UI would immediately start execution, Nova must stop for review. No customer calls belong to this recording.

Dependency test:

> Prepare a campaign using Nova Demo — Consultation Journey. If it has no published version, explain that prerequisite and stop. Do not publish it or substitute another workflow.

**Pass:** Nova identifies the unpublished dependency accurately and performs no publication or dispatch.

## Supporting demonstrations

Keep the existing extraction transcript test, welcome edit, intelligence edit and Wait correction available. Detailed prompts and historical evidence are in [BOLNA-SUPPORTING-DEMO.md](BOLNA-SUPPORTING-DEMO.md). The extraction test is a useful fourth clip because it demonstrates a real measured result after configuration.

## Engineering checks and evidence

- `npm run test:bolna-creation`: real planner/controller, isolated fictional creation UI; agent persistence, connected calling-workflow configuration, campaign version/file handoff, unpublished-version blocker. Assertions inspect saved state, creation counts and zero dispatch/publication.
- `npx tsx scripts/bolna-demo-smoke.ts --current-only`: four supporting flows plus campaign question-card regression.
- `npm test` and `npm run typecheck`: unit/regression checks.
- `npx tsx scripts/capture-bolna-rehearsal.ts <label>`: read-only Nova telemetry after a real panel run.

Creation fixture results: `artifacts/bolna/founder-demo/creation-verified-cases.json` (initial failures retained in `creation-all.json`). Live run evidence is separate. Retain failures and measure real latency; do not present fixture timings as Bolna performance.

### Isolated results for this revision

| Case | Result | Elapsed |
| --- | --- | ---: |
| New agent from complete business brief | Passed; one create, one save, actual stored fields checked | 37.4 s |
| New connected Agent → Wait → End draft | Passed; actual nodes, names, settings and three edges checked | 70.3 s |
| Campaign name/version + file handoff | Passed; one draft, correct version, honest upload handoff | 26.5 s |
| Unpublished campaign dependency | Passed; identified missing version, zero creation/publication/dispatch | 8.9 s |
| Four supporting tasks + campaign card | Passed; campaign card used zero website actions | Separate remount regression report |
| Unit suite | 211/211 passed | — |

These single runs use fictional local interfaces and the real configured planner/controller. The first workflow fixture remounted its entire inspector on blur, invalidating the next target; its node-label update now preserves inspector elements. The initial dependency fixture listed a workflow in a dropdown but omitted it from the workflow list; that inconsistency was corrected. Initial failures remain in `creation-all.json`; the per-case reruns and `creation-verified-cases.json` distinguish the corrected results. They are not evidence of live calling, upload or all Bolna capabilities.

### Live workflow result

Nova created **Nova Demo — Consultation Journey**, ID `780b361b-1e5c-4958-bc26-39b5f3d8c4a7`, in the signed-in Chrome profile. The initial creation run exposed a stale-validation preflight bug (5 min 22 s); that failure is retained and the backend recovery fix is covered by two new tests. A subsequent Nova run reloaded the same draft once and verified it successfully in **128,590 ms**, **22 model calls**, **19 executed actions**, with no field writes, creation, publication or calls. Independent Computer observation confirmed all three edges, the success ending and **No issues found** after reload.

The persisted workflow contains required `mobile_number`, the workshop agent, literal `first_name = there`, a 2-minute Wait and End(success). The literal greeting fallback is now included explicitly in the recording prompt. Published state remains separate. Do not describe the original failed run as a clean uninterrupted success or these timings as “instant.” Evidence: `full-workflow-live.json` and `full-workflow-recovery.json` in the founder-demo artifacts. The recovery prompt was accidentally duplicated by the external test harness during stale native UI handling; Nova still reloaded only once. This was not duplicate text entry by Nova into Bolna.

### Live campaign result and remaining handoff

After the ordinary-filter correction, Nova prepared **Nova Demo — Founder Preview** on live Bolna in **33,319 ms**, **9 model calls**, **8 actions**, **zero errors and zero approval requests**. Independent Computer observation confirmed Campaign name, **Nova Demo — No-contact Workflow Lab**, **Version 1 · latest**, enabled **Column template · v1**, and **Choose file: No file chosen**. Nova correctly called this a prepared campaign form, not a completed upload or running campaign. Evidence: `campaign-preparation-recovery.json`; the initial filter failure remains in `campaign-preparation-live.json`.

Downloaded the selected version's template at 16:09; `~/Downloads/entries-template (1).csv` contains exactly `reference_id\n`, matching `artifacts/bolna/nova-demo-campaign.csv`. The sample contains only `nova-demo-001`. Explicit approval to upload this exact synthetic file to this named Bolna campaign was requested and is still pending. No upload, execution or launch has occurred in this rehearsal. Chrome subsequently switched to another application; that window was left untouched. Return to the signed-in Bolna tab before resuming the upload.

### Current recording readiness

| Journey | Implemented/tested | Still required |
| --- | --- | --- |
| Business brief → new saved agent | Grouped card and complete creation pass on isolated real-model fixture | Final live replay of this exact new-agent prompt |
| Connected calling workflow draft | Created live; recovery fix tested; same draft passed reload verification and live validation | Fresh uninterrupted recording rehearsal if advertising creation speed; live call execution is separate |
| Campaign preparation | Live form preparation passes in 33.3 s; exact version/template verified | Approved file selection/upload, accepted-row validation and campaign lifecycle beyond form |
| Missing details | Workflow and agent cards pass with zero website actions; campaign card also passes | No extra approval is needed for ordinary draft preparation |

The two new grouped-card tests passed in 9.9 s (workflow) and 5.4 s (agent), each with one model call and zero website actions. These are isolated measurements. No claim of complete Bolna coverage, perfect reliability or equivalent live speed follows from them.
