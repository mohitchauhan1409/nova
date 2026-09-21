# AgentMail activation and reproduction

This startup branch uses the shared Nova engine. Startup files are `BE/src/sites/agentmail.ts`, its registration in `BE/src/sites/customizations.ts`, hostname-scoped panel CSS and hostname-checked launcher CSS. Guides contain observed controls, not action coordinates or APIs. All flows remain `verified: false` until live Nova verification.

`BE/data/sites.agentmail.json` is the isolated local site store. Existing owner-edited profiles take precedence; changing source does not overwrite an already saved profile. Inspect the local profile through the approved setup path if guide changes are needed, preserving owner edits. Do not publish `BE/data`, credentials or pairing tokens.

Only the coordinator may activate this build. Before activation, finish/disconnect the prior live agent and stop the prior backend, preserve other task data, and record the resource handover. Run from this worktree with its own ignored credentials and data. Do not point two live runtimes at the same installed extension. A Git commit or checkout alone does not update the loaded extension.

Build locally with:

```sh
NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build
```

Build outputs stay under this worktree's ignored `web/dist`, `web/dist-extension` and `web/releases`; no output is copied into another checkout. The show-action-cursor recording flag is mandatory. System/operator-pointer suppression belongs to the approved recorder/tool controls, separately from Nova’s in-page cursor. This branch does not change those shared controls.

After the coordinator loads the correct unpacked `web/dist-extension`, starts/pairs the correct backend and launches AgentMail through Nova, verify the profile, organization/pod, target hostname, build identity, dark theme and cursor with a short real-action capture. Start each rehearsal/recording in a fresh task-owned target tab on Overview. Preserve unrelated tabs in another same-profile window; the recording window contains one tab.

Theme evidence so far is visual: black/near-black application surfaces, near-white primary controls and gray borders. The implemented values `#000`, `#080808`, `#f5f5f5` and `#303030` are provisional approximations. Sample exact values from the actual approved capture before theme acceptance. Green in the AgentID promotion is not the base product accent. Nova’s cursor uses fixed `#f5f5f5`, a dark outline and a matching single-color ring, even when shared palette code derives a darker ink color. Panel/launcher support observed light mode through scoped scheme variables; final demonstration uses the inspected dark mode.

Use [demo-script.md](demo-script.md) and [synthetic-objects.md](synthetic-objects.md) for the baseline and prompts. Rehearse each critical flow twice with a variation, independently verify persistence, retain failure evidence and update [validation.md](validation.md). Only the exact task-owned fields may be reset. No Send, Schedule, API-key changes, access/billing changes or production webhooks are permitted by this scenario.

Store raw, silent and click-only media under `artifacts/agentmail/media/` with required names. Record the capture build SHA, actual theme samples, measured timing, source-to-edit map, click evidence, export QA and independently recovered remote media hashes before delivery. No recordings or remote backup are claimed by this preparation handoff.
