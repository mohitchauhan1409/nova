# Interfaze final2 capture checkpoint

Final2 is captured and supersedes prior failed/provisional takes as the current capture candidate. All shown tasks passed without recovery; all three structured-result requests passed independent coordinator persistence checks after fresh reload. Local decoded media QA has passed; independent selected-frame review passed; remote backup verification remains pending.

- Raw: `/Users/macbook/Desktop/Nova-batch-20260922/private/interfaze-final2-original.mov`.
- Recorder: 14,355 frames, 3024×1776, 30 fps, no audio; nominal 478.5 seconds from frames/30. First frame `1790054964125`. Native probe and decoded export QA passed; see ../../artifacts/interfaze/qa/media-QA.md.
- Backend `bd98d25`; recording frontend `1f7c875`; shared main `dad9db1`.
- Session `afbb051f-28e4-496d-a4e1-dc228e111c1a`, ready, 45 steps; immutable `private/interfaze-final2-sessions.json` and `private/interfaze-final2-operator.json`; recorder log `private/interfaze-final2-recorder.log`.
- Populated CD-300 setup conversation in one target tab; six authored prompts plus real Help me choose / Category + summary / Continue interactions.
- No separate CD-304 test: the first configured workflow already ran “A cracked mug.” and verified its actual log.

| Final2 result | Exact request | Actual result | Independent fresh-reload check |
| --- | --- | --- | --- |
| JSON setup | `req-895b371e-8ab2-4f15-a1f2-d23759ef9608` | 200; damage; summary “A cracked mug.” | Passed, coordinator |
| CD-305, nine days | `req-e9fe089d-60ff-42a1-b769-c50dd271ee4a` | 200; delivery; escalate true | Passed, coordinator |
| CD-306, exactly seven days | `req-fe082e31-4460-4468-a82e-90ab9c613ff4` | 200; delivery; escalate false | Passed, coordinator |

The final boundary ID is retained in the bounded session. The first two full IDs and their fresh-reload checks are coordinator-native readbacks; do not claim the last snapshot independently contains every prior request's full ID. The final boundary Input history contains earlier messages but is not used as standalone proof of those earlier saved request outputs.

The actual closing explanation and Nova scroll to Output passed. Retained action steps show no failed/unverified steps, and no approval traces or approval clicks appear in the retained session/operator records. The coordinator confirms no recovery was required. Local source/export review verified presentation, sampled cursor/input, frame mapping, measured masking and decoded click audio; its sampled scope and label-overlap limitation are documented in the QA report.

Preserve earlier raw/candidate evidence and its distinct metadata. The old primary media's technical QA/upload is separate from final2 evidence. Current actual script: `recording-script.md`; detailed metadata: `capture-evidence.json`; rehearsals and eligibility: `verification.md` and `preparation.md`.
