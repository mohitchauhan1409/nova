# SageOx live validation

All records in this report are synthetic. Runtime receipts and the object manifest
remain in ignored `BE/data/sageox/`; they include account-specific observations and
must not be committed. Coverage below is restricted to the observed signed-in team.

## Successful vocabulary rehearsals

1. Recovery/create: Nova reused Harborlight / Harbor Light and BaySync / Bay Sink,
   added WorkLedger / Work Ledger, reopened Vocabulary, and verified exactly three
   rows. Independent browser observation confirmed the three saved pairs.
   First visible action: 3.386 s. Final reply: 15.894 s. Four website actions.
2. Targeted revision: Nova edited the same BaySync row from Bay Sink to Bay Sing,
   preserved the correct spelling and the other two records, saved and reopened
   Vocabulary. Independent observation confirmed the same three rows and exact edit.
   First visible action: 2.632 s. Final reply: 15.542 s. Four website actions.

These are backend wall-clock measurements from the user message, not edited video
durations. A first action is distinct from a conversational reply or question card.
The configured provider/model strategy was retained.

## Preserved failures and fixes

- An initial terminology Add stopped for unnecessary approval. The shared policy
  now recognizes a narrowly observed two-field spelling-correction form when the
  user explicitly requests the change. Sensitive/serious gates remain ahead of it.
- A successful first Add reset its inputs, but draft protection blocked the next
  record. The shared runner now retires only verified, cleared inputs in that form.
- A later Add showed a spinner before clearing, so Nova proposed a redundant Enter.
  It was canceled; BaySync was already saved. Shared verification now waits for
  the pending form state to settle before requesting another planned action.
- Opening the upload menu caused an unneeded approval before any data was chosen.
  The shared policy now distinguishes a narrow ellipsis import menu from actual
  submission. Import itself still receives concrete review when classified sensitive.
- SageOx requests microphone permission as its recording menu opens. It was denied
  for this text-only scenario. No audio recording or microphone access was granted.
  One failed research/rehearsal attempt required manual menu dismissal and is not
  counted as a successful Nova-only import.
- A plain-text research import produced a malformed speaker and 99:59:59 duration.
  It is retained in the synthetic manifest as a failure, not presented as success.
  A timestamped VTT fixture is being tested separately.

## Checks completed

The complete customer build and all **208 tests in 20 files passed** after the shared
fixes. Targeted runner, verification and policy checks also passed. Type checking passed. Packaged-browser control
checks passed all 12 scenarios after correcting stale smoke-test expectations.
The panel experience check passed.

The window recorder produced a 3024 × 1776 source preflight with exactly 90 frames
over 3 seconds at 30 fps, no audio, and capture-time privacy masks. The frame editor
was tested with a synthetic moving source: exact output frame count and identical
encoded video streams before/after click-audio muxing. Final footage remains pending.

## Remaining live gates

- Verify VTT duration/source and actual processed summary; repeat import/recovery.
- Rehearse grouped clarification, partial answers, help choosing and correction.
- Rehearse discussion rename/save-for-later, Plans prerequisite and Stop/resume.
- Complete final Nova-only take, frame inspection, privacy review, edited exports,
  checksum verification and private branch/LFS backup.


## Clarification and interruption rehearsal

The opening problem produced a grouped card after 15.275 s (first action 4.158 s).
Supplying SlotBridge and CrewBoard, then Help me choose, retained both names and
produced focused mishearing questions after 6.000 s. Both answers were supplied
through the card. Stop was pressed after the first field was filled. Nova started
no subsequent action until the resume prompt.

On resume, Nova kept the existing SlotBridge field, filled its missing variant,
saved it, then created CrewBoard in the reset form and reopened Vocabulary. Five
exact rows persisted, no duplicates. First resumed action 3.146 s; final reply
27.290 s. This also verifies two successive records through the real asynchronous
form after the shared fixes. The initial navigation had one safe not-sent stale
target result, then recovered by observing and using the current Vocabulary link.

The timestamped transcript import saved and reopened the exact requested record.
Independent inspection confirmed all four turns and timestamps, two speakers and
01:20 duration. First action 3.908 s; concrete import review 19.455 s; final reply
67.477 s including operator review time. Summary was reported honestly as No
highlights, so extraction was still pending at that checkpoint.
