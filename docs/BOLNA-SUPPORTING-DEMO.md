# Supporting Bolna edit rehearsals (historical evidence)

These remain supporting tests. The current recording plan is in BOLNA-FOUNDER-DEMO.md; the old four-flow restriction has been removed.

Use this as a focused demonstration of an agent that understands a brief, operates real controls, saves changes and checks results. It is not evidence that every Bolna feature is supported. Do not speed up a recording without labelling it, hide a failed run as an uninterrupted success, or say these four tasks certify the whole dashboard.

## Setup

1. Run `npm run dev` from the Nova folder. Both API and dashboard must remain running.
2. `npm run demo:bolna` enables the four-flow recording preset. It backs up the previous profile under `artifacts/bolna/profile-before-demo-*.json`; the full 19-flow reference remains in `BE/src/sites/bolna.ts`.
3. In **the signed-in Chrome profile**, open [Nova](http://127.0.0.1:5173/), then **Bolna → Open with Nova**. Open the native Nova side panel. Use Chat and the default intelligence setting.
4. Extension **0.6.7** is installed in the existing unpacked folder and was visually confirmed on the Chrome extensions page. A fresh ZIP is available from [Download Nova](http://127.0.0.1:5173/downloads/nova-extension.zip). Reload Bolna after an extension update.
5. Use a **New conversation** for each clip so old instructions cannot affect it. Use only the named demo agent/workflow; do not create duplicates.
6. For the recording, frame the relevant page and Nova panel together. Crop the account email/avatar and other unrelated personal information. Keep the action cursor and final result visible.

## 1. A brief becomes a saved welcome

**Start:** Agent Studio → **Nova Demo — Workflow Lab** → Agent.

Copy this into Nova:

> Help me improve the welcome message on Nova Demo — Workflow Lab. Ask me the tone and what it should ask first, then write a concise English greeting using {first_name} and save it.

Answer the card:

- Tone: **Calm and reassuring** (a custom answer is supported).
- First question: **Would you like our opening hours or information about a consultation?**

Click **Continue** once. Nova should retain the agent, English language and placeholder from the original request; write one greeting; save once; and report the actual greeting. It must not edit the Canvas prompt, languages or providers.

**Success check:** the welcome input contains one complete greeting with the literal `{first_name}` and the requested question; Save succeeds. For rehearsal only, refresh manually and reopen the same agent to confirm persistence. Do not count an unchanged placeholder as a failed save.

**Retest variation:**

> On Nova Demo — Workflow Lab, set the welcome to exactly: Hello {first_name}, welcome to Nova Demo Workshop. Would you like opening hours or consultation details? Save it, and leave every other setting unchanged.

**What this demonstrates:** collecting only missing details and turning them into a precise saved edit.

## 2. Two settings, one save

**Start:** same demo agent, Agent or Intelligence tab.

> On Nova Demo — Workflow Lab, set Temperature to 0.4 and Output tokens to 400, then save. Keep every other setting unchanged and do not make a call.

**Success check:** Temperature = 0.4; Output tokens = 400; saved result. Provider, Model and knowledge-base selections stay unchanged. Nova should not ask permission for the requested routine save or refill a matching value.

**Retest/reset variation:**

> On Nova Demo — Workflow Lab, set Temperature to 0.3 and Output tokens to 350, then save. Leave every other setting unchanged.

Run the variation before the main recording if the fields already match 0.4/400 and you want the video to show real changes. Disclose that the recording uses a prepared demo agent.

**What this demonstrates:** translating a request into multiple precise changes and saving them together.

## 3. Prove the extraction against a transcript

**Start:** same demo agent → Agent or Extractions tab. Existing category: **Nova Demo Outcome**; extraction: **demo_request_type**.

> On Nova Demo — Workflow Lab, test demo_request_type with: Caller: How long does a consultation last? Agent: A consultation lasts twenty minutes. Run once and report the actual objective and confidence. Do not change its configuration.

**Success check:** Nova opens the existing extraction test, enters the transcript once, runs once and reads Bolna's new result. The expected objective for this transcript is **consultation**; actual confidence may vary and must be reported as observed.

**Retest variation:**

> Test the same extraction with: Caller: What time do you open on weekdays? Agent: We open at 10 AM and close at 6 PM, Monday to Friday. Report whether the actual objective matches the transcript. Run only once.

Expected objective: **hours**. Do not present an expected answer as the actual result if Bolna disagrees. No webhook, phone call or extraction-schema edit belongs to this flow.

**What this demonstrates:** testing an existing configuration and interpreting real structured output.

## 4. Refine the existing visual workflow

**Start:** Workflows → **Nova Demo — Guided Workflow**. It already contains Start → Demo pause → Demo complete; no new workflow is required.

> On Nova Demo — Guided Workflow, change Demo pause to 2 minutes and validate it. Keep its name, fields, connections and success ending unchanged. Leave it unpublished.

**Success check:** Wait = 2, Unit = minutes, both existing connections remain, and Validate returns **No issues found**. Nova should close an inspector if it covers Validate. It should not tour every node or reload unless asked.

**Retest/reset variation:**

> Change Demo pause back to 1 minute and validate the draft. Keep everything else unchanged and leave it unpublished.

**What this demonstrates:** a targeted visual-workflow edit with actual validation and no duplicate object creation.

## Evidence and limits

| Check | Result |
| --- | --- |
| Four-flow preset and opt-in setup | Implemented and applied to the current Bolna profile |
| Real-model local comparison | Both Sol and Terra passed all four flows plus a campaign out-of-scope check; not live-account evidence |
| Initial live welcome card | Two questions, zero website actions, 19.658 seconds |
| Initial live welcome save | One fill and one Save; Nova then falsely treated the placeholder as the saved value and reported failure |
| Independent live welcome readback before refresh | The actual field contained the intended complete greeting; confirms the false-failure diagnosis, not persistence after refresh |
| 0.6.7 correction | Read-only exact comparison against Nova's own prepared text after a field remount/reload; no arbitrary field contents exposed |
| Current-model final remount regression | Passed all four flows and scope boundary after the fix; report: `artifacts/bolna/founder-demo/remount-regression.json` |
| Unit suite | 209 tests passed |
| Packaged 0.6.7 browser controller | Passed, including the new post-remount comparison through the real extension snapshot transport |
| Current final four-flow live rehearsal | Pending: Computer connection returns blank Chrome content after refresh. Do not mark it passed |
| Earlier live extraction/workflow evidence | Recorded separately in BOLNA-WORKFLOW-LAB.md; it does not replace replaying these exact four final prompts |

Isolated single-run timings before the readback fix (milliseconds):

| Phase | Sol | Terra |
| --- | ---: | ---: |
| Welcome question card | 6,458 | 5,583 |
| Welcome edit + save after answers | 12,975 | 11,704 |
| Intelligence edit + save | 18,582 | 17,265 |
| Extraction test | 23,750 | 26,484 |
| Workflow edit + validation | 19,047 | 14,750 |

These are measurements on a fictional local fixture, not promises for Bolna or a statistical benchmark. Keep the current model for now: both passed, and latency advantages were mixed. The official [Terra model reference](https://developers.openai.com/api/docs/models/gpt-5.6-terra) describes its cost/intelligence tradeoff; that does not establish equivalent quality or latency for our tasks.

## Engineering replay

- `npm test`
- `npm run build`
- `NOVA_TEST_HEADLESS=1 npm run test:control`
- `npx tsx scripts/bolna-demo-smoke.ts` — compare both configured models on the isolated four-flow fixture.
- `npx tsx scripts/bolna-demo-smoke.ts --current-only` — current model with field-remount regression.
- `npx tsx scripts/capture-bolna-rehearsal.ts <label> [session-id]` — capture Nova's own telemetry after a real panel run; issues no browser action.

Before recording sign-off, replay all four exact prompts live on 0.6.7, independently verify saved results, record each elapsed time/action count, and repeat the listed variations. If any flow fails, fix and rerun it before presenting it as supported.
