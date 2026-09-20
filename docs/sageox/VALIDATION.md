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

The complete customer build and all **216 tests in 20 files passed** after the shared
fixes. Targeted runner, verification and policy checks also passed. Type checking passed. Packaged-browser control
checks passed all 12 scenarios after correcting stale smoke-test expectations.
The panel experience check passed.

The window recorder produced a 3024 × 1776 source preflight with exactly 90 frames
over 3 seconds at 30 fps, no audio, and capture-time privacy masks. The frame editor
was tested with a synthetic moving source: exact output frame count and identical
encoded video streams before/after click-audio muxing. Final footage remains pending.

## Delivery gates

The live rehearsal gates below are complete. Final-take inspection, frame edits,
checksums and independent private LFS recovery are recorded in `recording/`.

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

## Combined-flow regression (recording candidate, rejected)

The natural combined prompt and Help me choose answers followed a different intent
path from the earlier individually rehearsed flows. A clarification label obscured
the original terminology instruction, requesting unnecessary Add review. After that
review, the verified form reset did not retire its prepared input records because
the cleanup was limited to automatically allowed actions. FleetDesk was saved once;
QueuePilot was not yet saved. The take stopped rather than implying completion.

Main now preserves the original explicit terminology request across non-instruction
answer lines, with later negations/review requirements retaining priority. Verified,
cleared ordinary creation fields can be reused after an approved Add too. Regression
coverage exercises synchronous and delayed forms with and without approval. Full
build and 214 tests in 20 files pass. A complete live combined rehearsal is required
before another final take.

Additional discarded opening attempts covered Home responsive privacy masks, an
interrupted operator input, and a keyboard-focus cursor workaround the user rejected.
Final operator input uses ordinary direct clicks; no footer/keyboard focus trick.


## Complete frozen-sequence rehearsal

The exact combined opening, partial answer and Help me choose sequence passed with
RouteDesk / Route Desk and DepotPilot / Depot Pilot. The same run imported one
Harborlight handover review, verified two speakers and 01:20 full VTT, reopened the
nine-row vocabulary list and observed its generated summary. An intermediate stale
row target was safely rejected with no input and recovered from a fresh observation.
There was no repeat import or unnecessary vocabulary approval.

The final pending-save fix (main f5519a4) waits for actual committed changes while
an unchanged populated draft remains visible, including a disabled Import control;
dismissing an auxiliary file input no longer counts as a saved result. The failed
preceding import remained a single record; a proposed retry was canceled.

After the combined import, same-record rename to Harborlight handover notes and
Save for later passed; Plans correctly disclosed the coding-session prerequisite;
returning to source and summary confirmed per-user cache encryption remains open.
Independent UI inspection confirmed nine exact vocabulary rows and one matching
saved discussion, with its new title and saved-for-later toggle enabled.

Wall-clock timings: opening card 7.102 s; Help card 8.730 s; combined first action
2.733 s, import review 46.405 s, final 197.629 s including operator review time and
SageOx processing; rename/save 2.907 s / 24.446 s; Plans 4.606 s / 12.569 s;
source/summary return 2.029 s / 23.243 s (first action / final reply).
Application and site-guide code were frozen after this pass. Subsequent capture
privacy layout adjustments do not change Nova's reasoning or website actions.


## Recorded outcome and later regression guard

The continuous final take added DockBoard / Dock Board and ShiftPilot / Shift Pilot
(11 vocabulary rows total), imported exactly one new discussion (five total),
renamed that same record to Harborlight decisions and enabled Save for later.
The visible source reports two speakers and 01:20; its processed Summary matches
the read-only seven-day scope, server-confirmed bookings and internal review.
Plans has no browser creation control. No sharing, messaging, CLI installation,
access change or production deployment occurred.

Opening and help cards took 6.705 s and 6.711 s. Combined first website action was
3.549 s; import review arrived at 45.165 s; final reply at 104.622 s including
operator approval and processing. Rename/save: 3.093 s first action, 29.547 s
completion. Plans: 3.027 s first action, 7.227 s completion. The last source request
was steered after 58.883 s of repeated pending-tab inspection; the clarifying
request completed in 6.779 s. Detailed wall-clock receipts are in
`recording/measured-timings.json`; these are not edited video durations.

The recording preserves the real safe stale-target recovery, denied visual
inspection of incidental private text, and later pending-tab repetition. It is
not presented as a flawless run. A post-take shared guard (main b770ad9) detects
repeated tab inspection from unchanged content and semantic controls even when
refs change. It requests a different source/strategy before another repeated
click and stops safely if that is ignored. Updated content and field state remain
eligible. The alternating-view regression passed, followed by the complete build
and **216 tests in 20 files**. This final guard is regression-tested; it was added
after the recorded live take and is not claimed as live-rehearsed in this video.

Remaining product limit: SageOx Distillation was still processing in the take.
The imported source and Summary were available and verified. Broader integrations,
file-chooser uploads, sharing, live recording and browser plan creation are not
claimed as tested working journeys.

## Private-video revision after owner feedback

The owner requested removal of all account/tab covers except the browser debugging
row and reuse of the Bolna click sound for both operator and Nova taps. Since the
original account covers were baked during capture, a new source was required.

The local backend was restarted. A read-only live Nova preflight reopened
Harborlight decisions, verified two speakers and 01:20, used the transcript for
the encryption question and left Summary open without tab cycling. The tab was
closed and a new SageOx tab was launched through Nova, starting at Home with Nova
closed. An operator accessibility-index mismatch stopped an initial new attempt
before any website writes. The next continuous take completed successfully.

Live outcomes: BayBoard and CrewLedger saved as two additional vocabulary pairs;
one Harborlight field review import saved and its complete two-speaker 01:20
transcript checked; same record renamed Harborlight field decisions and bookmarked;
Plans inspected after a natural clarification; processed Summary left visible with
the correct unresolved encryption question. One stale row target was rejected
before input dispatch and recovered through observation. No duplicate record or
external communication was created. All recovery is retained in the delivered take.

The existing 216-test application/build validation remains applicable; no runtime
code changed in this revision. Main received only the reusable click-only renderer
and documentation (05fd218), verified by a real stream-copy render, duration/frame
checks and exact AST comparison with Bolna's synthesis functions. Media, fixtures,
EDL, individual cue decisions and live timing evidence remain on sageox-nova.

The final export check found a one-frame cover gap caused by decimal time
rounding in drawbox enable expressions. Shared editor fix 6b37b43 uses integer
output-frame boundaries. A real 30 fps render with adjacent one-frame covers
verified both covered frames and unchanged neighboring frames; the full export
was regenerated and its slide-in frames rechecked. No runtime/agent code changed.
