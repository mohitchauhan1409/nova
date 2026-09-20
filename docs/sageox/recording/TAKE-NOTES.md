# Fresh final take

Source: `artifacts/sageox/media/nova-sageox-original.mov`.
Chrome window 24110; first encoded frame epoch 1789908335678 ms.
3024 × 1776, 30 fps, no microphone or system audio. Freshly launched from Nova,
Home establishing view with panel closed and browser security indicator absent.
Normal direct operator clicks; source transcript pasted as existing notes.
Privacy plans are applied before encoding, with update times retained separately.
The source is preserved byte-for-byte after recording. Editorial timing and the
browser-owned indicator mask affect only the exported copies.


## Inspected edit

Raw: 12,717 frames / 423.900 seconds. Edited: 10,426 frames / 347.533 seconds
(about 5:48). Retained source frames 0–12003 inclusive; the unused tail after the
last result plus ten seconds of reading was trimmed. The frame EDL is contiguous.
Eight prolonged operator pauses were compressed. Eight non-overlapping typing
intervals were accelerated by at most 1.2×; typing during active Nova work stayed
at real speed. All agent execution, clicks, scrolling, meaningful responses and
pending-tab recovery are retained. No successful outcome was fabricated or spliced.

The debugger strip begins its real slide-in at source frame 3846. Its mask follows
observed heights 8, 40, 64, 104, then 112 native pixels over frames 3846–3850, at
x=16, y=174, width=2220. The close icon is inside the measured mask. It conceals
browser chrome in the edited copies only. The untouched raw retains that indicator.

Capture-time account redaction used the measured profiles in privacy-events.json.
Those overlays protect the browser title, URL identifiers, avatar, scope/footer,
Home greeting/activity authors and transient uploader byline. Some whitespace and
nearby metadata are obscured while layouts transition. No task outcome was replaced.
The byline overlay was removed once the saved record visibly showed no personal
uploader, before the final source/summary view. Source and output checkpoint frames
were inspected, including Home, cards, Vocabulary, Import, saved record, bookmark,
Plans, the pending view and the final Summary.

## Audio and integrity

The silent export has no audio stream. The final export adds 21 subtle original
synthesized mouse-click cues for recorded operator interactions, mapped through the
EDL and aligned to their visible responses. Website action narration has no sound;
there is no keyboard sound, microphone, music or ambience. The opening cue was
aligned to source frame 211 after inspecting the native launch response; subsequent
cues retain a five-frame native-dispatch allowance. Cue amplitudes vary slightly.
The source and mapping are in operator-events.json, edit-plan.json and
export-validation.json. These effects do not purport to be recorded live audio.

Both exports retain 3024 × 1776 at 30 fps. Silent/click versions have identical
encoded video-stream hashes, verified after audio muxing with video copy. AAC and
video duration differ by less than one millisecond. Decoded audio peak is −24.3 dBFS;
no clipping. Source SHA-256 is unchanged. Exact file hashes are in checksums.sha256.

## Coverage boundary

The final source request revisited unchanged pending Distillation tabs and was
steered with the recorded clarification. A post-take shared regression guard was
added on main (b770ad9), merged into the customer branch and tested with the full
216-test suite. That later fix is not portrayed as part of the already captured
live behavior. Saved transcript and generated Summary passed; Distillation completion
and browser plan creation are not claimed.
