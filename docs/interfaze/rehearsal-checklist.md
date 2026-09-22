# Interfaze live rehearsal and recording checklist

Prepared against reported customer build `339f12a` / main `10b065e`. All pass boxes below are PENDING until the coordinator records live receipts. This checklist does not establish successful execution. Use only the signed-in `itsmohitchauhan1409` account, real Interfaze controls and synthetic messages.

## Shared evidence rule

After each test, open **Logs**, select the actual new request using its timestamp and exact submitted ticket, then inspect **Input**, **Output** and status. Retain observed request ID, timestamp, concise exact output and screenshot/receipt path. Status 200 alone is insufficient. Reopen the same request once through normal navigation for persistence evidence. Avoid Get help, keys and billing. Logs output truncates near 500 characters; never infer hidden text. Reuse a previously verified matching record rather than repeating unchanged reloads.

After **Send**, observe actual loading/Stop state. Treat it as pending while active; allow a bounded processing window up to 90 seconds using supported spaced waits. Do not resubmit, manufacture wait parameters, or evade repetition guards. If the current engine cannot wait long enough, explicitly report pending and continue by checking the existing response/log when available. A short polling stop is not a product failure or proof of absence. Record actual dispatch-to-visible-result wall time separately from Interfaze's own Time metric.

Known latest failure: session `afd45275-be12-4532-9922-461257a50364` entered the exact prompt and clicked Send after routine approval, then stopped after three short waits (approximately 23 seconds wall time reported by coordinator). Website subsequently returned `damage`, with displayed Time 13.8s. This proves a completed model request, not a successful autonomous opener: the unnecessary approval and premature-stop gates remain unresolved. Do not count this as a successful critical-flow pass. Guide changes alone do not alter the current fixed 600 ms wait or runner repetition limit.

Keep categories `damage`, `delivery`, `other` throughout. They are already supplied by the opener: **do not answer a redundant category question as though it were necessary**. Report that as a rehearsal defect if it blocks action. Escalation is not part of the opener or initial schema.

## Opening gate — separate, concise

Operator to Nova:

> Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word.

Actual website prompt is the text after “Run this prompt:”. No configuration changes or initial card. Expected model result: `damage` (case/terminal punctuation variation is acceptable if unambiguous). Confirm genuine progressive entry, run, response and matching log. This replaces the failed ambiguous CD-104 opener; that earlier attempt counts as zero successful passes.

- [ ] Opener passes without an initial question/confirmation card; request ID: ______

## Critical flow 1 — configure structured triage

### Pass A

1. Operator: **“Turn this into JSON triage for Cedar Desk, at temperature zero.”**
2. After a card answer, resume the unfinished setup immediately; do not repeat the opener’s already-verified Logs check. A genuine card can ask desired output fields; the categories are already known. If choosing fields needs help, operator asks **“Which fields are enough for basic triage?”** Nova should explain briefly while retaining the task/card. Then select the actually rendered **Category + summary** option. Suitable alternatives are Category only and Category + confidence; the latter must be described as uncalibrated model confidence. If those exact labels are absent, use a semantically matching option or custom answer “Category and a short summary”; do not pretend the rendered card had different labels. Do not demand a particular generated card layout or create fake choices.
3. Acceptance configuration: use the concise System Prompt **“Classify as damage, delivery, or other. Return category and a short summary.”**; Temperature `0`; JSON enabled; exactly two requested scalar fields, `category` and `summary`, both `string` and required. Leave Top P, token limit and Reasoning unchanged. Inspect each row once. Do not assert `additionalProperties:false` unless the real editor exposes/verifies it.
4. Operator: **“Test this prompt: Order CD-104 arrived with a cracked mug. Please replace it.”**
5. Expected result: JSON with `category: "damage"` and a faithful short summary. Actual summary wording is not prescribed. Verify the matching request through Logs.

- [ ] Pass A configuration + model result + saved Logs readback; ID: ______

### Pass B — focused revision, not a repeat of the entire video

1. Operator: **“Limit the summary to 12 words. Keep the JSON fields and temperature.”**
2. Verify the actual System Prompt revision and retained required field types/settings.
3. Operator: **“Test this prompt: CD-104's mug arrived broken. I need a replacement.”**
4. Expected: `category: "damage"`; faithful summary of at most 12 whitespace-separated words; both required fields still present. Inspect the new exact request in Logs.

- [ ] Pass B targeted revision + wording variation + saved Logs readback; ID: ______

If a supplied configuration value is already correct, Nova should read it once and preserve it; do not force a redundant edit for theatrical completeness.

## Critical flow 2 — policy/schema revision and boundary audit

### Pass A

1. Operator: **“Add a required escalate boolean: damage or delays over seven days.”**
2. Acceptance: `category` and `summary` remain required strings; new scalar `escalate` is a required boolean, not an array/string. Use concise System Prompt **“Classify as damage, delivery, or other. Return category, summary, escalate. Escalate damage or delays over 7 days.”** No escalation card needed because policy is supplied.
3. Operator: **“Test this prompt: Order CD-105 is nine days late. No damage reported.”**
4. Expected: `category: "delivery"`, `escalate: true`, faithful short summary. Inspect exact Logs record.
5. Operator: **“Test this prompt at the boundary: CD-106 is seven days late, with no damage.”**
6. Expected: `category: "delivery"`, `escalate: false`. Inspect its separate Logs record. “Over seven” excludes exactly seven.

- [ ] Pass A policy/schema change + positive and boundary outcomes; IDs: ______ / ______

### Pass B — targeted policy revision

1. Operator: **“Change the delay threshold to over five days. Keep damage escalation.”**
2. Inspect actual System Prompt; retain all three field types/required states and temperature.
3. Operator: **“Test this prompt: CD-107 is six days late, with no damage.”** Expected `delivery`, `true`.
4. Operator: **“Test this prompt: CD-108 is five days late, with no damage.”** Expected `delivery`, `false`.
5. Independently verify both actual saved Logs records. A wrong model output is a failed test even if settings saved correctly; investigate before capture.

- [ ] Pass B policy revision + changed-threshold outcomes; IDs: ______ / ______

## Restore and freeze before recording

Preserve eligibility text, task-owned rehearsal conversation, request IDs and output receipts. Do not delete unrelated data or erase raw evidence. Through authorized preparation, restore only this demo's settings to the observed baseline: System Prompt initially empty/default as verified, JSON off, Temperature 1; retain observed original Top P/token limit/Reasoning. Clear only task-owned playground chat after preserving it. Earlier genuine synthetic request logs may populate the dashboard; document that they are rehearsal/setup, never imply they were created during the take.

Fresh Nova launch must use the normal verified dashboard route with exactly one target tab, Nova closed and its floating button visible. Freeze the runtime only after relevant tests and actual capture preflight pass. No debugger strip at the raw opening; no system/operator cursor; one themed Nova cursor. Preflight includes progressive multi-word input, website-field edit, meaningful scroll, rendered card selection and export checks.

## Final take — exact operator sequence

1. **Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word.**
2. **Turn this into JSON triage for Cedar Desk, at temperature zero.**
3. If fields card appears: **Which fields are enough for basic triage?** Read answer, then choose **Category + summary** using the actual card/custom answer. Do not add a card if Nova can safely use sufficient prior information.
4. **Test this prompt: Order CD-104 arrived with a cracked mug. Please replace it.**
5. **Open its request log and check the input and JSON result.** Omit only if Nova already performed and displayed this verification in step 4.
6. **Add a required escalate boolean: damage or delays over seven days.**
7. **Test this prompt: Order CD-105 is nine days late. No damage reported.**
8. **Test this prompt at the boundary: CD-106 is seven days late, with no damage.**
9. **Check both results in Logs.** Omit only if both exact records have already been inspected during steps 7–8.
10. **Why was the seven-day ticket not escalated?** Expected answer grounded in strict greater-than-seven policy and observed false result.
11. **Does zero temperature guarantee correct answers?** Expected no; lowers variability but does not establish correctness. End on the last meaningful verified result after a brief readable pause.

Nova performs all website work. Operator only uses Nova chat/cards during the take. Type progressively; retain natural reading pauses and actual selection feedback. A wrong result, missing cursor, focus failure or unresolved loop requires repair and a new valid take; do not conceal failure with fabricated output or edits.

Keep the true original recording immutable. Produce separate silent and exact-approved-click-only exports, each with measured masks/EDL/cues and decoded QA. Those export/remote-backup gates are outside this rehearsal checklist and remain required.


## Reviewed inference submission registration

The customer branch registers only the exact Interfaze playground URL and observed Send/prompt/model-setting control labels. A requested synthetic model inference is `change`; support messaging, external recipients, publishing and account/access changes remain sensitive. Use explicit “Run this prompt:” or “Test this prompt:” wording for a model test so user intent is unambiguous. Registration does not authorize duplicate submissions or bypass missing draft/route/control evidence. The stored post-run snapshot has an empty composer; only a freshly verified Nova-prepared prompt revision can pass the shared ordinary-inference check.
