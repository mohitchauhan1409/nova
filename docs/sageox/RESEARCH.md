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

At this early research checkpoint no Nova live rehearsal had passed. Current results are tracked in VALIDATION.md; recording remains pending.


## Follow-up observations and shared repairs

The first import eventually produced a substantive Summary with the expected read-only cache, seven-day retention, owners, review date and deferred encryption decision. Speaker parsing remained malformed, so use a timestamped source in the next import and inspect both source and output.

Nova inspected **Settings → Vocabulary** live in 19.269 seconds, with its first browser action at 2.739 seconds. It found **Term (correct spelling)**, **Heard as (mishearing)**, **Add**, and **No terms yet**. The page labels this feature Preview and explicitly says changes persist.

The first creation attempt filled Harborlight / Harbor Light but paused at an unnecessary generic form approval. It was cancelled before saving. Core now allows only explicitly requested spelling corrections in an observed two-field terminology form; messaging, upload, sensitive settings and ambiguous forms retain their boundaries. The fix has negative policy tests and belongs to main. The browser smoke test also referenced a removed site-title section and expected a thrown error where the driver now returns a safe not-sent result; both test expectations were repaired without weakening the underlying sensitive-input check.


The repaired approval flow saved the first term, then hit a second core bug: draft de-duplication incorrectly blocked reusing inputs after the form cleared itself. The saved Harborlight row was independently visible. Core now retires only the drafts reset by a verified ordinary Add/Create/Save form action, keeping unrelated editors and message-composer protections. A regression creates two separate persisted records through the same fields; existing draft-preservation tests remain passing. This interrupted run is not a successful three-term rehearsal.


## Accepted VTT and saved vocabulary

Two Nova vocabulary rehearsals have now passed independent inspection: three exact saved pairs, then a same-row BaySync mishearing revision with unchanged count. The asynchronous Add spinner required an additional shared verification fix before the successful recovery.

Nova imported the timestamped VTT through the paste field, saved the exact title **Harborlight pilot readiness review**, and reopened it. Independent UI inspection confirmed Maya Chen and Eli Brooks, **2 speakers / 01:20**, and all four complete turns at 00:00, 00:20, 00:40 and 01:00. Summary initially remains **No highlights**; processed output has not yet passed. No file chooser handoff was used. Microphone permission was explicitly denied after the menu requested it; text import continued.
