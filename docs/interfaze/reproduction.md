# Reproduce the recorded Interfaze setup

This documents the actual capture source and product setup. It is not a claim that current third-party UI labels, quota, model output or timing will remain identical.

## Source and activation

Use the private `interfaze-nova` branch. The capture runtime source is `18a702d0f167014c46df07bf840223adcd55ed52`; the installed recording frontend was built from `68a0957f390289f017aa57e0903cea56ed4bbc43`. Coordinator reports subsequent changes through the capture runtime were backend/profile only, with identical frontend source. Later main merges must not be substituted as the recorded build in provenance.

Follow `../SETUP.md` and `../../scripts/video/README.md` using an isolated checkout and the user's own local credentials. Do not copy runtime histories, pairing tokens or secret files into deliverable commits. The customer profile registers `interfaze.ai` and uses `sites.interfaze.json`; retain separate backend data and logs from other startups. Only one runtime may be paired with the shared recording extension.

For a recording frontend build, enable `NOVA_RECORDING_MODE=true` and `NOVA_RECORDING_SHOW_ACTION_CURSOR=true` during the existing build command. Review/install that isolated output using the established extension setup; do not replace an active capture's build. Activate the matching backend/profile at a safe checkpoint and verify pairing, account, hostname, initial theme and cursor. A later backend process restart does not itself update installed frontend assets or persisted site-profile edits.

## Product prerequisites and baseline

Use the authorized Chrome profile and account `itsmohitchauhan1409`, normal Playground URL `https://interfaze.ai/dashboard/playground`, and available quota. The native model is the product being tested; Nova performs its UI configuration and navigation. No external recipients, paid upgrade, API key page, human-support ticket or production data is needed.

Preserve existing task-owned conversations and saved request receipts before any reset. Native New chat erases previous locally stored chat. The final take began with empty task-only local chat, empty System Prompt, JSON off and Temperature 0 already retained. Historical synthetic requests remained in server Logs. Do not delete unrelated chat/logs or present rehearsal records as created during a new take.

Use the exact executed dialogue in `recording-script.md` for faithful reproduction. The genuine choice card offers Category only / Category + summary / Category + confidence. Help me choose explains the options and preserves the original request; select Category + summary and Continue. Confidence is an uncalibrated model self-report, not a verified probability.

## Configuration and observed outcomes

Initial policy:

```text
Classify as damage, delivery, or other. Return category and a short summary.
```

Enable structured JSON; set scalar `category` and `summary` to string and required. Keep Temperature 0; preserve other settings unless the user requests a change. Nova's captured actions verified these controls. The damaged-mug test returned category damage and a matching short summary.

Revised policy:

```text
Classify as damage, delivery, or other. Return category, summary, escalate. Escalate damage or delays over 7 days.
```

Preserve the two strings; add required scalar boolean `escalate`, arrays off. Nine days late/no damage returned delivery/true; exactly seven days late/no damage returned delivery/false. Those are observed examples, not a guarantee for arbitrary inputs. The five-day policy and 12-word summary changes belong to rehearsals, not this final take.

After each model submission, wait while real processing evidence remains visible using the active runtime's supported bounded wait. Never resubmit to recover a delayed response. Open Logs through observed navigation and inspect exact input, output and status in the matching request. A 200 status alone cannot establish semantic correctness. Detail may truncate output near 500 characters, so keep examples concise and do not infer omitted content.

The captured run required a visible instruction to scroll to the new schema row, one routine Send confirmation, and Logs loading/stale-record recovery. Reproduce honestly rather than scripting hidden repairs or claiming every step was uninterrupted. A zero-temperature setting does not guarantee accuracy.

## Retained evidence and media

`capture-evidence.json` records raw frame timing, actual messages, output and source commits. Source receipts reside in the private batch paths named there. Full retained final boundary ID: `req-f112ef24-2dff-41ea-b544-8c9e487e25c5`. Other final full request IDs are unavailable in bounded final snapshots; do not substitute rehearsal IDs.

The original MOV is immutable. All execution, model processing, typing and recovery remain at 1x in planned edits; only permitted prolonged operator idle pauses may be shortened with a documented mapping. Media worker evidence must establish masking, precise approved click cues and decoded audiovisual QA. Private remote recovery with checksums is still required before calling the backup complete. This document does not assert those gates passed.
