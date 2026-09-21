# Confident AI setup and validation

Worktree: `confident-ai-nova`. Startup changes are declarative guides and hostname-scoped appearance; browser execution, native panel, approvals, recording controls and cursor positioning remain shared code.

## Local files and state

- Profile: `BE/src/sites/confident-ai.ts`, registered in `BE/src/sites/customizations.ts`.
- Runtime site-store filename: `BE/data/sites.confident-ai.json` in this worktree, resolved by the shared config/store. This base does not expose a data-directory environment override; do not assume one exists. The runtime JSON is intentionally ignored; no state file or credential is committed. Existing owner-edited profiles remain preserved by the shared store.
- Panel: `web/src/panel/customization.css`, all rules scoped to `.np-app[data-site="app.confident-ai.com"]`.
- Launcher: `web/companion/customization.ts`, exact hostname match. Action cursor is always `#f8f8f8` with `#141414` stroke; its label and click ring use that same accent. Recording pointer suppression remains independent.
- Dark target colors reported by coordinator: background `#141414`, surface `#1d1d1d`, neutral borders and near-white controls. Light appearance gets neutral counterparts when the observed site reports light mode. Live screenshot/capture comparison is still required.

## Activation, by the live-session owner only

1. Stop/disconnect any preceding startup session, finish its recorder and flush logs before replacing the active build. Keep each startup's state independent.
2. At a safe coordinator checkpoint, merge tested shared main changes into this startup branch. Recheck the affected build; do not merge or reload during a take.
3. Supply the repository's existing ignored backend credentials through the authorized local runtime configuration. Use a private Confident AI data directory; never copy credentials into docs or source control. Build from this worktree with recording controls that hide operator/system pointers while retaining Nova's cursor.
4. Reload only this worktree's extension build, start only its intended backend, and verify extension/backend pairing and build identity. Launch the exact project URL from the preset; verify Vector / My first project. Do not navigate to another project.
5. Confirm the saved baseline, dark theme, native side panel, launcher hide/show, focus, actual editor input and one real cursor click/scroll through a short capture before rehearsal. Live cursor/recording QA has not been performed here.

## Coverage state

| Capability | Evidence | Current status |
| --- | --- | --- |
| Project Home and scope | Coordinator signed-in inspection | Inspected |
| Text prompt edit, Commit changes, history | Coordinator saved initial commit `1c40d16`; UI later showed two commits | Product workflow exercised; Nova rehearsal pending |
| Single-turn dataset golden save/edit | Coordinator reopened two synthetic goldens; grid Enter saves | Product workflow exercised; Nova rehearsal pending |
| Rich input persistence | DOM-only setValue did not update prompt state; trusted typing did | Native input required; shared agent live validation pending |
| Dataset alias rename | Coordinator used pencil → textfield → Save for Coverage → Readiness, then restored Coverage; saved alias and success toast observed | Product form exercised; independent reload and Nova rehearsal pending |
| Dataset versioning / prompt branching | Trial/plan gate displayed | Blocked by plan; excluded, no trial/upgrade |
| Evaluation | Needs metric collection and model/AI connection; saved prompt recognized | Not run; excluded |
| Nova critical workflows | No live runs by preparing worker | All profile flows `verified: false` |
| Recording/exports/remote backup | No media produced by preparing worker | Pending |

## Local validation

Executed on 21 September 2026 against base `b68a7be` plus startup changes:

- `npm run build` passed TypeScript checking, Vite production build and extension packaging. Build outputs stayed under this worktree's ignored `web/dist`, `web/dist-extension` and `web/releases` paths. The extension was not installed or reloaded.
- Focused existing suites `site-store`, `site-experience`, `clarification`, `policy` and `record-edit-policy`: 5 files, 99 tests passed. These cover registration, owner-edit preservation, separate site-store files, clarifications and action boundaries without a browser.
- `git diff --check` passed.
- A direct non-browser assertion confirmed launcher styling applies to the exact app hostname, returns empty CSS for unrelated/lookalike hosts and invalid URLs, and leaves all flow verification flags false.

Dependencies were temporarily linked from the original workspace for local validation; the link is not source-controlled. These checks do not establish successful account workflows or visual fidelity. No live backend, installed extension, Chrome session, recorder or account API was used by this worker. No latency or video-quality claim is made.

## Remaining gates

Two successful Nova rehearsals per critical flow; real persisted golden contents and tags; prompt commit text/history; opening outcome before cards; clarification/help/correction/duplicate recovery; exact one-tab fresh launch; native capture and actual cursor visibility; approved Bolna tap source and cue evidence; full audiovisual QA; three media files and independently verified private Git/LFS backup. Record the recording build SHA separately from later documentation commits.
