# SageOx research and live validation

Research date: 20 September 2026. Nova branch: `sageox-nova`, based directly on `main` at `50f6b62`.

## Product and sources

SageOx captures team discussions and coding sessions and makes derived context available to people and AI coworkers. Official sources inspected: [overview](https://sageox.ai/docs), [getting started](https://sageox.ai/docs/getting-started), [transcript import](https://sageox.ai/docs/context-capture/audio-upload), [discussions](https://sageox.ai/docs/context-capture/discussions), and [video import](https://sageox.ai/docs/context-capture/video-import). Published documentation describes features; it does not establish that this account supports them. Older pages disagree on file size limits, so defer to the current live upload dialog.

## Signed-in dashboard observations

- Navigation: Home, Discussions, Sessions, Plans, Settings.
- Home: CLI and MCP onboarding; no need to authorize either to import a transcript.
- Discussions: initially empty, with List / Cards / Calendar views.
- Creation: top-right **More discussion options → Upload a recording…** opens **Upload meeting context**. Pasted transcript text reveals **Title (optional)** and **Import**. File input lists audio/video and VTT, SRT, TXT, MD, DOCX. Up to 20 files. Pasting avoids an unresolved native file chooser handoff.
- Saved discussion: title, edit-title control, date editor, speakers, attachments, AI views toggle, Summary / Distillation / Visuals / Transcript tabs, Share, Download and Delete controls. Sharing and deletion are excluded.
- Plans: **No plans yet**. The actual page instructs using `ox plan render` and `ox plan save` in a coding session; no browser creation control was exposed. A browser-only plan-creation demonstration is not established.

## Research failure log

1. Chrome fullscreen produced delayed/no-op keyboard interaction and `noWindowsAvailable` for a coordinate action. Leaving fullscreen through the View menu restored window control. Verify full field values, not immediate tool success.
2. First plain-text synthetic import was saved as **Harborlight offline booking decision**, but SageOx parsed one speaker containing the transcript preamble, showed **99:59:59**, and initially showed **No highlights**. This is failed parsing/processing evidence, not a successful context extraction. Created by Computer during research, not by Nova. Exact record identity is retained only in ignored `BE/data/sageox/synthetic-manifest.json`.
3. The discussion menu requested microphone permission. It was dismissed; chat/transcript work does not need live audio.

No Nova live rehearsal or recording has passed yet. All proposed creation flows remain unverified until saved fields and their relevant downstream output are checked after reopening.
