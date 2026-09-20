# Bolna workflow lab — 18 September 2026

This is a live execution log, separate from the navigation map in BOLNA.md. An observed editor, a saved configuration and a successfully executed feature are different results. No untested path below should be advertised as verified.

## Coverage and limits

Completed configuration paths: voice-agent creation and multilingual persistence; structured extraction creation and three classifications; public URL ingestion and persisted knowledge attachment; connected workflow validation/publication; graph creation, intent edge, voice prerequisites and text answers. Nova itself passed the extraction and graph-validation paths through its installed Chrome extension.

Pending: campaign upload/creation/execution, batch upload/scheduling, real phone-call/audio tests, webhook/API/WhatsApp dispatch, additional graph branching and version recovery, phone/SIP/account integrations, and reports with authorized real call records. These require specific inputs, recipients, credentials or consequential-action review. This lab is not exhaustive certification of every Bolna feature.

## Created resources

| Resource | Identifier | Observed evidence | Execution status |
| --- | --- | --- | --- |
| Nova Demo — Workflow Lab | `f4ada16c-14dc-49b5-bf8e-73d9c4f458ae` | Named agent row with Agent options, Updated timestamp, and agent-specific Call history link | Configuration saved; no call placed |
| Nova Demo — Graph Lab | `4020e306-0c9a-4b81-b2a0-c4df7e218bbb` | Saved graph URL, persisted edge/prompt, clean validation and text replies | Hours, consultation and LLM closing replies observed; static closing issue documented |
| Public documentation knowledge | `fd635612-0259-4454-9656-11a578b3b8dd` | Exact URL, processed status, agent attachment retained after reload | Ingestion/attachment verified; retrieval answer quality untested |
| Nova Demo Outcome | Extraction category inside the demo agent | Category remained visible after a full reload; model GPT 4.1 Mini | Created |
| demo_request_type | Extraction inside Nova Demo Outcome | Saved extraction row; live Test Extractions result | Three live tests returned expected objectives: `hours`, `consultation`, `other` |
| Nova Demo — No-contact Workflow Lab | `034712c1-9c52-49a5-849a-6ae122ce2dda` | Start → Demo pause (1 minute) → Demo complete (success); No issues found; Version 1 Current | Published; not executed |

## Completed editor sequence: create and save a multilingual agent

1. Open Agent Studio. Start from New Agent and check that the editor is a draft before entering demo content.
2. Set the name to **Nova Demo — Workflow Lab**. Bolna displayed **Draft has been saved successfully** after the edit. This toast alone does not demonstrate that a usable agent has been created.
3. Set the welcome message to **Hello! This is the Nova demo workshop assistant. How can I help you today?**
4. Replace the current language's Canvas prompt with fictional workshop instructions. The fixture describes weekday 10 AM–6 PM Asia/Kolkata opening hours and a 20-minute consultation. It explicitly forbids claiming actual bookings, payments, transfers or messages.
5. Open **Add Language**, search **English**, and choose the result. A new English prompt editor appeared with a generic default prompt: adding a language does not copy the previously edited language's prompt.
6. Click **Save agent**. Verify the new named row with **Agent options**, the **Updated** timestamp, and a **Call history** URL containing the agent ID above. The row no longer says New Agent draft.
7. Use **Set English as default language**. English becomes **English(Default)**, its removal control becomes disabled/explanatory, and Hindi gains **Set Hindi as default language** and **Remove Hindi** controls.
8. Select English, replace its generic prompt with the English workshop instructions, and verify the text visible in that language's Canvas.
9. Click **Save agent** for the update. An Updated timestamp changed to a few seconds ago. A full reload in a second Chrome tab then confirmed the saved welcome message, English(Default), the exact English prompt and the separate Hindi prompt.

Computer-control caveat: several actions returned a stale accessibility tree or an input error before the actual change appeared. Inputs were re-observed before treating the change as complete. A timeout is not proof the input was discarded.

## Completed sequence: category → structured extraction → real test

1. Select the saved agent, then **Extractions → New Category**.
2. Fill **Name** with **Nova Demo Outcome**; keep the observed **GPT 4.1 Mini** model. The modal states that extractions in this category share one LLM pass.
3. Click **Create Category** once. During the request, Create Category and Cancel became disabled. Reopening the dashboard confirmed the new category with a count of 0, Rename, model selection, Add Extraction and Delete controls. This is stronger evidence than the disabled button.
4. Click the category's **Add Extraction**. Fill Name `demo_request_type` and a prompt asking for the caller's main request without personal details.
5. Select **Pre-defined** instead of Free Text. This exposes **Possible Answers** and **Add Answer**. Save Extraction was enabled before answer rows existed, so button enablement alone is not sufficient validation of the schema.
6. Add three answers. Each row has **Answer Value**, **Condition**, **Sub-option** and removal/reordering controls. Configure `hours` for opening days/hours, `consultation` for consultation duration/information, and `other` for neither or insufficient information. Nested sub-options were visible but were not created in this test.
7. Click **Save Extraction** once. Verify the named extraction row and prompt preview under the category.
8. Click the main **Test** button. The Test Extractions dialog offers Sales Call, Support Call and Appointment sample buttons, Paste/Import tabs, transcript input and an optional model override.
9. Paste a fictional transcript asking “What time do you open on weekdays?” Keep the category's model by leaving override off. Verify the transcript and enabled Run Test button.
10. Click **Run Test** once and wait for Extraction Results. The observed result showed `objective: hours`, `confidence: 1`, and confidence label **High**; subjective/validation values were null. No phone call was made.
11. Changing the transcript and running another test clears the earlier results while Running Test is displayed. Do not report the preceding result as the new test's outcome.

12. Replace the transcript with a consultation-duration question. Run once; the new result returned `consultation`, label High.
13. Replace it with a goodbye-only transcript. Run once; the new result returned `other`. Only the objective was captured for this last test, so no confidence value is asserted.

## Completed sequence: connected workflow → validation → published version

1. Reused the existing workflow ID above rather than creating a duplicate. Clicked the breadcrumb name, filled **Nova Demo — No-contact Workflow Lab**, pressed Return and verified the new name.
2. Selected Start. Its inspector showed a default required `mobile_number` phone field, Add field, reorder/remove and Batch template Download.
3. Changed this isolated demo schema to required `reference_id`. Its type resolved to text and became disabled. No actual phone number was entered.
4. Used Start's **Add node after**, verified **Adding after Start**, then chose **Wait**. Both the new node and **Edge from start to wait_1** appeared.
5. Renamed the node **Demo pause**. Its ID and edge label changed accordingly. Selected Fixed delay and entered 1 minute. An initial native setValue operation read back 0; keyboard replacement plus blur read back 1. Input attempts alone are not proof of accepted values.
6. Used **Add node after** on Wait. Condition was disabled, with a tooltip explaining that it folds into predecessor cases and requires a branching predecessor such as Agent or API request. This restriction was absent from the original shallow guide.
7. Chose **End** and verified the second edge. Renamed it **Demo complete**. End requires Outcome (success/failure/neutral); chose success and read it back.
8. Clicked Validate. The Validation result displayed **No issues found**.
9. Published the isolated test workflow. Observed **Published version 1 · 18/09/2026, 13:47:03**. Version history showed **Version 1 Current**. Its menu offered View, Restore and Save as new workflow; restoration/copy was not executed.
10. No Agent, API request or WhatsApp node exists in this version. Publishing did not place calls or execute entries.

## Campaign preparation against the real version

1. Opened Campaigns → New campaign. Entered **Nova Demo — No-contact Campaign Lab**.
2. Selected the existing named workflow, then **Version 1 · latest**. A transient Saving… state appeared, then upload became enabled. This transient state is not counted as a completed campaign.
3. Downloaded **Column template · v1**. The actual downloaded CSV contained exactly `reference_id`, matching the published Start schema.
4. Prepared `artifacts/bolna/nova-demo-campaign.csv`: header `reference_id`, one synthetic row `nova-demo-001`. Specific upload confirmation requested; upload and campaign completion pending. No phone/contact data is present.

## Knowledge-base URL ingestion

- Opened Knowledge Base → Add Knowledge Base → Add URL.
- Submitted the public source `https://www.bolna.ai/docs/knowledge-base` with English (Default). No private file or credential was transmitted.
- The dialog showed Uploading…; after it closed, the table showed RAG ID `fd635612-0259-4454-9656-11a578b3b8dd`, the exact URL, type Url, and status processing. Revisiting the table about five minutes later showed **processed** for the same RAG ID and source. Selected the saved Workflow Lab agent → Intelligence → Add knowledge base (Multi-select), checked the matching URL, verified its label, then Save agent. A full reload retained that source on the same agent. Retrieval answer quality was not tested.

## Graph agent: real configuration and validation warning

- Created Blank graph agent and named it **Nova Demo — Graph Lab**. The initial greeting node was LLM, marked START, with zero transitions.
- Replaced its prompt with fictional workshop facts. Add node opened an explicit type chooser: LLM, Static Audio or Router; selected Static Audio and Create Node.
- Renamed the new node `demo_goodbye`; configured Hindi and later English spoken messages. A node with zero outgoing transitions is displayed CLOSING.
- On greeting, Transition opened destination plus Intent / Rule / Always. Selected demo_goodbye and Intent, filled a goodbye/finish intent and Create transition. Verified the edge, intent text and greeting count of 1 transition.
- Edge inspector includes From, To, optional Label, Condition type (LLM default), Condition, optional Priority and Advanced. No priority/rules were changed.
- Added English in Agent setup → Languages and Voice, set English as default, selected Deepgram (auto-filled nova-3), ElevenLabs (auto-filled Eleven Multilingual v2), then Tripti - Calm and Clear. Adding the language initially left providers unconfigured; a language chip alone is not sufficient voice setup.
- Validate reported **0 errors · 1 warning**, claiming demo_goodbye has no spoken message despite visible saved text in both languages. The warning persisted after Save. Do not call this a clean validation or infer successful audio playback.
- Save created ID `4020e306-0c9a-4b81-b2a0-c4df7e218bbb` and its distinct URL, showed **Graph agent saved / A new graph agent has been created**, retained the edge and English closing text. Version history appeared only after save.
- Test agent exposes **Get call from agent** and **Chat with agent**. In text-only testing, the graph answered the hours question with Monday–Friday, 10 AM–6 PM Asia/Kolkata, and the follow-up with a 20-minute duration. Goodbye cleared Agent is typing but produced no visible reply; the static closing path is not verified.
- Recovery: changed `demo_goodbye` to LLM, entered an explicit concise closing prompt, saved, then Validate reported **No configuration issues found / All checks passed**. A full reload confirmed the new closing prompt and edge persisted. A fresh text session with “That is all. Goodbye.” returned **Thank you for trying the Nova demo. Have a good day.** This verifies the observed text outcome; node-internal routing telemetry/audio were not inspected.

## Nova extension end-to-end execution

After updating the live backend profile, refreshed Nova's dashboard (19 flows), used **Open with Nova** in the signed-in the signed-in Chrome profile profile, and opened its native side panel.

Command: “On Nova Demo — Workflow Lab, open Extractions and test demo_request_type with this exact fictional transcript: Caller: How long does a consultation last? Agent: A demo consultation lasts twenty minutes. Run the text extraction test once and tell me the actual objective result. Do not call anyone or change the extraction configuration.”

Nova itself navigated to Extractions, opened Test, filled the 91-character transcript and ran it. The actual Bolna dialog returned `objective: consultation`, confidence `1`, label High. Nova's final reply matched those values. The UI contained one transcript, not repeated copies. This is a real signed-in extension/controller/planner test, separate from the local fixture and direct Computer experiments above.

### Real obstruction found and fixed

A second command asked Nova to navigate to the saved graph and Validate. It reached the correct graph, but Bolna's inspector covered Validate at the narrower side-panel width. The old driver rejected preparation before input, while the runner gave an ambiguous-action stop message.

0.6.3 adds an explicit pointer `not-sent` receipt for that preparation failure. The runner may now re-observe and resolve the obstruction; ambiguous transport failures and post-input errors still stop. Chrome confirmed 0.6.3 installed from the same unpacked folder with unchanged permissions. The live replay reached the same obstruction and logged **No input was sent** rather than stopping; the replay then closed the inspector, clicked Validate and returned the exact live result **No configuration issues found. All checks passed. This graph agent is set up correctly.** The completed run is recorded in `artifacts/bolna/nova-graph-regression.json`. No edit, save, chat or call occurred during that regression.

## Next execution gates

- Test actual knowledge retrieval against intended business content; public URL ingestion/attachment has been completed.
- Exercise additional graph Rule/Always/Router paths and version restore separately; the saved LLM graph and text answers above are complete.
- Create a campaign against a known published test workflow, inspect contact validation and lifecycle. Stop before contact dispatch.
- Use the newly saved agent to exercise batch creation and inspect scheduling prerequisites. Do not call unapproved numbers.
- Exercise reporting against actual test execution records only when an authorized test call exists.
- Phone purchases, billing, live routing, new credentials and real outbound communications remain separate consequential operations.

## 0.6.4 live question-card rehearsal

Activated 0.6.4 in the existing the signed-in Chrome profile profile and launched a fresh Bolna tab from Nova's dashboard. In the actual native side panel, “Build a workflow for me” produced one card asking for name, purpose/sequence and optional input fields, with **zero browser actions**. Entered `Nova Demo — Guided Workflow` and selected **Help me choose**. Nova retained the supplied name and produced two remaining questions with explanations, again without website actions. Supplied Start → fixed one-minute Wait → End(success), node names Demo pause/Demo complete, required text reference_id replacing the default phone field, draft+validation only. Continue converted the card into an Answered receipt and sent the details once. Execution and persistence results follow separately.

Nova created exactly one draft at `https://platform.bolna.ai/workflows/e81d5d9c-f2cd-42b5-b285-f30fe5182ef1`, entered the supplied name once, then incorrectly requested confirmation for Enter in `Rename Untitled workflow`. Captured this run in `artifacts/bolna/nova-live-question-cards.json`. The native Computer connection then stopped returning Chrome controls/screenshots, including after a fresh dashboard tab and connection reset. The user confirmed the Mac was unlocked. This interruption is not counted as a finished workflow, and no new replacement draft should be created on resumption.

Fixed the generic inline-title rule: Enter in an explicitly labelled Rename/Edit name/Edit title editable field can commit without a second confirmation, after the existing consequential/sensitive gates and only outside message-submission scopes. Message composers, generic submissions and sensitive settings keep their safeguards. All 200 tests pass. A local trusted-browser reproduction verified one fill + one Enter, no approval, and the actual saved heading/status (`artifacts/bolna/inline-rename-regression.json`). Resume the existing draft above and verify Start schema, Wait delay, End outcome, edges, validation and persistence in the live account before claiming completion.

## 0.6.6 completed live workflow verification

Resumed the same Guided Workflow draft in **the signed-in Chrome profile**, without creating another object. Recovered native Computer access and corrected the prior Wait default in 0.6.5. That replay still looped on Unit/Escape: 29 model calls, 19 executed actions, 232.7 seconds, then stopped. The loop is preserved in `artifacts/bolna/nova-loop-reproduction.json`.

After the generic 0.6.6 observation, Escape, run-progress and guide-retrieval fixes, Nova's actual native side panel completed the requested verification in **109,431 ms**, **18 model calls**, **16 executed actions**, **155,804 input tokens**. It inspected the existing settings, validated, reloaded once and inspected their persisted values. There were **zero field writes, zero approval requests, zero new workflows, zero publishes and zero communications**. An End-node click was safely rejected before input because the inspector covered it; Nova closed the inspector and continued. It also needed two read-only waits and a short inspector-dismissal recovery after reload. This is a successful measured replay, not a claim of instant execution or a statistical latency benchmark.

Independent Computer verification after Nova's completion confirmed:
- Same workflow ID `e81d5d9c-f2cd-42b5-b285-f30fe5182ef1`, same title, both expected edges.
- Start: `Field 1 name = reference_id`, `Field 1 type = text`, `Field 1 required = 1`.
- Demo pause: fixed delay, `Wait = 1`, `Unit = minutes`, Next node = `end · Demo complete`.
- Demo complete: `Outcome = success`.
- A fresh Validate displayed **No issues found.**
- Version history displayed **Draft / Unpublished changes / No published versions yet. Publish to create one.**

Live result: `artifacts/bolna/nova-workflow-066-live.json`. This closes the earlier incomplete Guided Workflow rehearsal. The other execution gates above remain separate and must not be described as tested.

## Creation demo expansion — 18 September, later rehearsal

The four-small-edit preset has been replaced with three creation journeys plus the existing four supporting tasks. The running profile now permits explicitly requested new voice agents, connected workflows and campaign preparation, with grouped missing-detail cards and duplicate-name recovery. The guides still use general browser controls.

A new workflow **Nova Demo — Consultation Journey**, ID `780b361b-1e5c-4958-bc26-39b5f3d8c4a7`, was created through Nova's own side panel. Record this ID when resuming; never create a replacement after an interrupted run.

Additional UI observations during creation:

- The canvas may have no exposed node button while loading or outside view. **Search nodes** exposes a **Start Start** result that selects Start and its inspector; this is a useful semantic route before trying a screenshot.
- Agent inspector has **Agent**, **Phone number** (default **Platform picks a number**) and **Recipient source** (default **Default — entry.mobile_number**).
- Agent nodes expose a no-match fallback which is not necessarily drawn on the canvas. Its displayed default was **end · Unhandled**. A visible straight-line diagram does not prove all call outcomes have the intended routing.
- The Wait inspector explicitly states that **Not connected** prevents parsing/validation/publishing even though the draft saves. A saved draft is therefore not enough evidence.
- Independent native UI readback observed **Review pause**, Wait **2**, Unit **minutes** while Nova was still adding its successor. Final validation evidence is recorded separately after completion.

### Consultation Journey recovered and verified

The first creation run filled the missing Agent variable `first_name` with literal `there`, revalidated, then attempted an obsolete validation-issue row. Its confirmed no-input rejection incorrectly invalidated the prior verified effect, causing a false-failure response. Fixed in the generic runner, with positive/negative current-evidence tests; 211 tests pass.

Nova then reloaded and verified the same saved draft: required `mobile_number`, Agent **Nova Demo — Workflow Lab**, literal `first_name = there`, **Review pause = 2 minutes**, **Journey complete = success**, and all three connecting edges. It reported **No issues found**. Independent native Computer observation after reload showed `Edge from start to workshop_conversation`, `Edge from workshop_conversation to review_pause`, `Edge from review_pause to journey_complete`, success Outcome and the same validation message. No configuration changes or calls occurred in this verification run; it remained unpublished. Recovery telemetry: `artifacts/bolna/founder-demo/full-workflow-recovery.json`, 128,590 ms, 22 model calls, 19 actions. The external harness duplicated its verification prompt while dealing with stale native UI; the actual run still reloaded once.

### Live campaign preparation after filter recovery

The campaign list exposes an ordinary input named **Filter this page by name or id**. The first Nova attempt incorrectly chose the combined `search` action, which includes Enter and is restricted to search-labelled inputs; it repeated the rejected action and stopped. The general planner and policy-rejection guidance now direct ordinary filters to `fill`, preserving the submission safeguard. The same field shape passed an isolated real-model test.

The live replay then completed in **33,319 ms** with 9 model calls and 8 actions, zero errors and approvals. Independent Computer observation confirmed **Nova Demo — Founder Preview**, **Nova Demo — No-contact Workflow Lab**, **Version 1 · latest**, enabled template and file controls, and **No file chosen**. Downloading this actual version's template produced `entries-template (1).csv` containing exactly `reference_id\n`. The prepared synthetic file has the same header and one `nova-demo-001` row. Specific upload approval is pending; no contact upload or launch occurred. The browser then changed to a Figma window, which was not operated.
