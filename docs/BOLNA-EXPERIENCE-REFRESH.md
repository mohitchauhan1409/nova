# Nova on Bolna — September 19 refresh

Nova now uses a white and blue workspace design, a redesigned floating launcher, and the name **Nova** in both the panel and Chrome's extension header. The interface has no “Powered by” attribution. It remains an AI assistant; it does not claim to be a human or an official employee.

Chat is the default. The optional conversation tab is named **Live talk**. The redundant site name/page-title block has been removed. The floating launcher hides while the native panel is visible, stays hidden through page reloads, and returns when the panel closes; the action cursor remains available. User questions, structured intake cards, action receipts and final answers remain in the same conversation. Action receipts belong to the user turn that started them, distinguish in-progress/checking/failed/stopped states, and retain observed verification details. Earlier steps can be expanded. Rejected or stopped inputs never receive a successful receipt.

The agent uses brief contextual language while acting. Progress narration reuses grounded planner output instead of making a separate acknowledgement-model call. Serious-action approvals and page-based completion checks remain in place. A live rehearsal found and fixed an unrelated generic policy bug: “I'd like to start from scratch” was mistakenly classified as a social Like control.

## Chrome constraints

Chrome's [sidePanel API](https://developer.chrome.com/docs/extensions/reference/api/sidePanel) exposes panel path, tab and enabled state, not a per-site native title. Nova's manifest name is now simply Nova.

The debugging notice is Chrome-owned. [Chromium's debugger implementation](https://raw.githubusercontent.com/chromium/chromium/main/chrome/browser/extensions/api/debugger/debugger_api.cc) creates it when the debugger attaches. No Chrome protection or warning-suppression flag was changed. Reliable trusted input continues to use the debugger permission already installed.

## Validation and recording scope

- Production build and typecheck passed.
- Full suite after the live policy and covered-input fixes: **220 tests passed** in 19 files.
- Packaged extension integration test passed for launcher open/close/reopen/reload state, Live talk label and removed page-title block, using a disposable Chromium profile.
- Isolated panel test: chat default, identity, changing step states, failed-action treatment and 320–480px width checks passed. Screenshots and report are in artifacts/bolna/experience-refresh.
- These isolated checks do not prove live Bolna creation. Live rehearsal and recording results are recorded separately.
- The requested recording is chat-only, unedited and made on actual Bolna. Synthetic business facts and contacts are used. No outbound calls, campaigns or real-user interactions are to be triggered.

## Live Bolna result

Recorded September 19 in the the signed-in Chrome profile profile, chat only. Nova completed the existing Cedar & Sage — Design Concierge setup (business prompt, temperature 0.4, 400 output tokens) in five actions and 23.4 seconds. The saved agent ID is 1126e9a8-b8c1-41e9-aa7c-472e001dbae6.

The 237.63-second unedited recording starts with the sidebar closed, then opens Nova with the floating launcher. It includes structured intake, complete workflow creation, a business clarification, a revision and a final canvas review. Nova created the unpublished workflow a1328b92-5eb2-42c4-81e1-f6a3d9a02ddd (Cedar & Sage — Consultation Journey): required mobile_number → Design consultation (Cedar & Sage concierge) → Team review pause (15 minutes after revision) → Consultation request collected (Success). Bolna validation showed No issues found. Creation/validation took 92.6 seconds after submitting the intake card; revisions took 27.5 seconds. One covered-control preflight was rejected and recovered without committing the rejected action. No calls, publishing or campaign launch occurred.

After recording, a page reload retained the exact workflow, all three connections, named nodes and the 15-minute wait with its next node set to Consultation request collected. This is configuration/persistence and structural validation, not a live-call execution test.

Video: artifacts/bolna/chat-recording/nova-bolna-consultation-raw.mp4 (also original .mov), 3024×1964, 30 fps, silent. MP4 is a lossless remux of the recording; no cuts, speed changes, overlays, audio or motion graphics were added. The Chrome control banner remains visible. Frames were checked throughout the recording, including the launcher opening and final connected canvas. Session evidence: consultation-recording-final.json.
