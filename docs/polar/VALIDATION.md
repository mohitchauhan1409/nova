# Polar validation checkpoint

The end-to-end demonstration is incomplete. No final recording exists.

- The specified Chrome profile identity and original Vector Home were observed.
- The GitHub repository was verified private; `polar-nova` started at remote main
  `2ddbe3cd8a68707985506745101728a0f6ca188c`, not another customer branch.
- Existing untracked `docs/roark/` work was preserved and is outside this task.
- Production build and TypeScript check passed with
  `NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true`.
- Existing regression suite: 20 files, 233 tests passed.
- Isolated panel rendering passed: Chat default, grouped cards, timeline,
  320/400/480px without horizontal overflow, and other hostnames unchanged.
- Isolated cursor rendering passed normal, hidden-capture and visible-capture
  modes. Pointer fill, label and ring all use rgb(23, 23, 31), independent of the
  incoming page accent. This is not a real Polar action-cursor preflight.
- A short diagnostic native capture verified that the original window can be
  recorded at 3024×1714, 30fps, without the system cursor or audio. It does not
  establish live Nova interaction or final-take readiness.
- The current tap renderer's `band_noise` and `click_sound` functions are
  AST-identical to the Bolna renderer. Approved Bolna edit-v4 LFS reference:
  `c656ad78874030216801528e0d6e38481bea73cd0b0c6e73c7e98c4154dc5347`.
  Decoded reference and final-export audio verification are still required.

## External blocker

Computer initially read Chrome successfully, then returned an empty accessibility
tree and “Screenshot unavailable.” Rebinding and resetting the Computer session
did not restore it. The Browser inventory exposed only the in-app browser, which
is not the authorized signed-in Chrome profile. A direct cursor navigation test
failed with `Computer Use server error -10005: noWindowsAvailable`.

The original Vector page was restored and confirmed in a native diagnostic
capture after the user asked to check again. Computer still could not click it.
The user was asked to check macOS Accessibility/Screen Recording permissions and
reconnect Computer. No further blind clicking, alternate-account setup or hidden
website APIs are appropriate.

OpenAI's [Computer Use guidance](https://learn.chatgpt.com/docs/computer-use)
separates app approval from macOS Accessibility and Screen Recording permissions.
The exact cause here is not confirmed; the observed failure is unavailable window
control, not a proven missing permission.

## Unfinished checks

Signed-in form research, baseline population, safe save-boundary verification,
two successful Nova rehearsals per critical flow, actual latency measurement,
fresh-launch capture preflight, installed extension reload, final raw/silent/
click-only recordings, decoded click alignment and independent media recovery
remain pending. Dark-mode matching has not been implemented or verified. All
Polar guide `verified` flags remain false. Fixture success does not replace these
checks and this checkpoint must not be presented as a completed demo.
