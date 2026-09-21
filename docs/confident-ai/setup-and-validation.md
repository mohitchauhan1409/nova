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
3. Supply the repository's existing ignored backend credentials through this worktree's authorized `.env`. Runtime state and pairing remain in this worktree's `BE/data`; `private/confident-ai` contains evidence, not backend state. There is no data-directory override. Never copy credentials into docs or source control. Keep recording controls that hide operator/system pointers while retaining Nova's cursor; rebuild only when extension sources changed.
4. Reload only this worktree's extension build, start only its intended backend, and verify extension/backend pairing and build identity. Launch the exact project URL from the preset; verify Vector / My first project. Do not navigate to another project.
5. Confirm the saved baseline, dark theme, native side panel, launcher hide/show, focus, actual editor input and one real cursor click/scroll through a short capture before rehearsal. Live cursor/recording QA has not been performed here.

## Initial baseline recheck — 22 September 2026

The coordinator verified Vector / My first project. The settled `/prompt-studio` index twice showed **Create your first prompt**, including after returning with Back, while the existing prompt remained intact at [its verified saved URL](https://app.confident-ai.com/project/cmubhm6yf0002o30tjtp072vo/prompt-studio/cmubijzhk0005pb0tn3tnafcn?branch=main). That page opened **Northstar Returns Adviser**, commit `1c40d16`, with the actual baseline content. The dataset list showed **Northstar Returns Coverage** with **2 goldens**, unchanged.

An empty-looking index is not evidence that this prompt was deleted. Use the saved URL through ordinary browser navigation, then verify the visible project and alias before editing. Do not create a replacement prompt. This recheck establishes existing product state; it is not a passed Nova rehearsal or evaluation.

Saved site profiles preserve their instructions when source guides change. At a stopped-task checkpoint, append only the new index-omission rule to the matching saved profile through the local site-update endpoint, preserving its other instructions and fields. Editing the JSON on disk while the backend is running does not update its in-memory guide; use the endpoint or edit only with the backend stopped and restart it. Do not replace owner-edited instructions wholesale.

## Coverage state

Current coordinator runtime: backend `94debcde941dcb30de7e3b89aebf26f963b109d9`, extension `b7e3172` (ZIP hash prefix `28e115`). The backend includes the ordinary editable-focus policy fix; no extension rebuild was required for that change. Earlier saved dataset outcomes were observed on backend `0bd15f1` with the same extension. Source guide commits `4bf9f22`/`8dd383a` were made after the backend was loaded and were not activated by this docs update. The dated task ledger and measured timings are in [live-verification.md](live-verification.md).

Prompt `b217d68` saved grouped follow-ups in 8 verified steps after recovery from a failed `select_text` on the editable. Prompt `ecd3bf0`, **Ask for missing return details one at a time**, then saved on the current backend: 10 verified steps and one unverified Escape close, followed by recovery, commit-history and full-Preview checks. Its single variable and policy were verified. These are saved outcomes with recovery, not clean error-free rehearsals. The one-question-at-a-time content supplies the final grouped-revision baseline.

The explicit request **“Save this dataset as Northstar Returns Readiness.”** completed Save and reload in 2 verified steps. The subsequent new-case task completed 13/13 verified steps: create and save two goldens with tags, then reload. The coordinator independently reopened both tags and blank Actual Output; the dataset now contains four unique goldens, with the original two preserved. The existing-answer edit attempt was canceled after a body-cell approval; approved pencil and inline-cell attempts then failed to open a verified editor. Existing-row editing is excluded from the final. A second creation rehearsal saved distinct 31-day jacket and personalized 6-day damage cases, bringing the verified total to six. It required multiple requests, a stale approval recovery and one approved Save. Nova verified the count after reload, and the coordinator independently reopened both tags, answers and blank Actual Output. The final adds distinct 30-day and 7-day boundary cases (6→8); eight remains pending. Preserve every existing case and tag.

Known limitations remain: the prompt index can omit the saved prompt; visual opening from the dataset index still produced a broad-container approval after the attempted generic target fix; and bare alias rename reached a Save approval that was canceled. The tag-entry guard also treats a bare “after” in the task as conditional; final case wording uses “delivered exactly seven days ago” and a separate explicit tag sentence. Use the trusted saved record routes through ordinary navigation and verify visible project, alias and identity. For the alias use **“Rename our returns dataset to Northstar Returns Readiness and save it.”** Do not weaken approvals or claim bare rename/index opening was fixed.

| Capability | Evidence | Current status |
| --- | --- | --- |
| Project Home and scope | Coordinator signed-in inspection | Inspected |
| Text prompt edit, Commit changes, history | Saved `b217d68` and `ecd3bf0`; full saved text/history checked; intermediate errors retained | Two saved outcomes with recovery; final grouped take pending |
| Golden creation, tags and empty outputs | 13/13 verified actions; reload and independent reopen of both new tags/blank Actual Output | Six unique saved goldens; second creation saved with multi-request/approval recovery; final boundary pair pending |
| Rich input persistence | Saved prompt and new golden contents verified; prompt2 corrected a duplicated variable before commit | Saved outcomes verified with documented recovery |
| Dataset alias rename | Explicit Save continuation, 2 verified steps including reload | Persisted alias verified; bare rename remains a recorded limitation |
| Dataset versioning / prompt branching | Trial/plan gate displayed | Blocked by plan; excluded, no trial/upgrade |
| Evaluation | Needs metric collection and model/AI connection; saved prompt recognized | Not run; excluded |
| Nova critical workflows | Partial rehearsals and failures retained in ledger | No full final-readiness claim; saved outcomes include recovery; profile flow flags remain `verified: false` |
| Recording/exports/remote backup | No final media certified in this ledger | Pending |

## Local validation

Executed on 21 September 2026 against base `b68a7be` plus startup changes:

- `npm run build` passed TypeScript checking, Vite production build and extension packaging. Build outputs stayed under this worktree's ignored `web/dist`, `web/dist-extension` and `web/releases` paths. The extension was not installed or reloaded.
- Focused existing suites `site-store`, `site-experience`, `clarification`, `policy` and `record-edit-policy`: 5 files, 99 tests passed. These cover registration, owner-edit preservation, separate site-store files, clarifications and action boundaries without a browser.
- `git diff --check` passed.
- A direct non-browser assertion confirmed launcher styling applies to the exact app hostname, returns empty CSS for unrelated/lookalike hosts and invalid URLs, and leaves all flow verification flags false.

Dependencies were temporarily linked from the original workspace for local validation; the link is not source-controlled. These checks do not establish successful account workflows or visual fidelity. No live backend, installed extension, Chrome session, recorder or account API was used by this worker. No latency or video-quality claim is made.

## Remaining gates

Verify the alias-only reset and useful saved opener before cards; capture the grouped prompt clarification, two distinct boundary-case creations (eight total) and prompt-limit revision to 100 words; confirm exact one-tab fresh launch, native capture and actual cursor visibility; apply the approved Bolna tap source with cue evidence; complete audiovisual QA, all three media files and independently verified private Git/LFS backup. Record the recording build SHA separately from later documentation commits. Saved outcomes with recovery must not be labeled clean rehearsals.
