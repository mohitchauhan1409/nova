# Interfaze final2 — actual captured sequence

Raw capture is complete. This is the executed dialogue from immutable session `afbb051f-28e4-496d-a4e1-dc228e111c1a` and `private/interfaze-final2-operator.json`, not the earlier plan. Backend `bd98d25`, frontend `1f7c875`, shared main `dad9db1`. All shown tasks passed without recovery according to the coordinator; the retained session is ready after 45 steps with no failed/unverified actions and no approval traces. Independent fresh-reload checks of the three structured-result requests passed. Local decoded export QA passed; independent selected-frame review passed; backup verification remains pending.

The single target tab opened with a real populated CD-300 synthetic baseline. Nova's conversation was fresh. Baseline content is preparation, not a task performed during this take.

## Six authored prompts

Offsets use each prompt's actual submitted timestamp relative to first frame `1790054964125`, rounded down to seconds.

| Raw offset | Exact operator prompt |
| --- | --- |
| 00:21 | Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word. |
| 01:09 | Turn this into JSON triage for Cedar Desk at temperature zero. |
| 04:13 | Add required boolean escalate: damage or delays over seven days. Test this prompt: CD-305 is nine days late, no damage. Check Logs. |
| 05:59 | Test this prompt: CD-306 is exactly seven days late, no damage. Check Logs. |
| 07:15 | Which rule escalated CD-305? Does zero temperature guarantee accuracy? |
| 07:41 | Scroll the log dialog down to Output. |

## Actual card and execution

After the second prompt, Nova asked which JSON fields to use. The operator clicked **Help me choose**. Nova explained Category only, Category + summary, and Category + confidence, including that model-reported confidence is not calibrated or verified. It retained Cedar Desk, the categories and requested temperature. The operator selected the actual **Category + summary** radio and clicked Continue; the immutable session records the answered card.

Nova configured JSON triage and itself ran **“A cracked mug.”**, then verified category damage, summary “A cracked mug.” and status 200 in the matching log. The separately planned CD-304 prompt was therefore not authored or run; do not add it to the transcript or count it as another result.

The third authored prompt combined the required boolean/policy revision and CD-305 nine-day test. Nova added the field/policy, then verified delivery / escalate true in Logs. The fourth prompt tested exactly seven days; actual output was delivery / escalate false. The fifth answer explained the strict over-seven rule and correctly stated that temperature zero does not guarantee accuracy. The sixth prompt caused a real Nova scroll to Output and a successful readback of the CD-306 result.

No recovery prompt or routine approval interaction occurred in final2 per coordinator report and the retained operator/session records. Earlier stale-log Refresh, focus retyping, offscreen-field recovery and approval events belong to previous rehearsals/candidates and must not be attributed to this take.

Exact IDs and independent persistence receipts are in [verification.md](verification.md) and [capture-evidence.json](capture-evidence.json). The previous candidate's actual sequence remains in [historical-provisional-recording-script.md](historical-provisional-recording-script.md). Current local media checks are in ../../artifacts/interfaze/qa/media-QA.md; remote recovery is documented separately.
