# AgentMail validation record

Date: 2026-09-21. Preparation worker owns only its worktree. The coordinator exclusively owns the signed-in Chrome session, active extension/backend and recorder.

## Observed product evidence

| Capability | Evidence supplied by coordinator | Coverage |
| --- | --- | --- |
| Eligibility | No assistant on Overview; Help has Discord, Documentation, Feedback only. Public MCP overlap disclosed. | Eligibility accepted; no native equivalent found in inspected account |
| Inbox creation | Create Inbox accepts optional Username, default agentmail.to, Display Name and typed metadata; save opens inbox | Inspected and saved with task-owned data through operator |
| Inbox properties | List row -> Inbox actions -> Edit Properties; Display Name and metadata persist after Update/reopen | Inspected through operator; Nova rehearsal pending |
| Draft creation | Inbox -> Compose -> To/Subject/message -> Close; subject appears in Drafts | Inspected through operator; Nova rehearsal pending |
| Draft revision | Drafts -> subject -> Edit Draft exposes saved values; Close saves revisions | Inspected through operator; Nova rehearsal pending |
| Theme | Dark neutral, black surfaces, white primary controls, gray borders | Approximate styling prepared; exact source samples and visual preflight pending |

## Preparation checks

- `NOVA_RECORDING_MODE=true NOVA_RECORDING_SHOW_ACTION_CURSOR=true npm run build` passed on 2026-09-21. This includes TypeScript checking, Vite production build and extension packaging. Build release: 0.7.1, 203874 bytes, SHA-256 `8a981db3f7889a6541f697757dc52acd3957c95f6b7c15ce4e06ef2d600dc354`, built at `2026-09-21T17:26:09.846Z`. This identifies the preparation ZIP, not a final recording build; coordinator will rebuild after merging main.
- Selected existing non-browser suites passed: `site-store`, `site-experience`, `clarification`, `policy`, `record-edit-policy`; 5 files, 99 tests, 526 ms. They cover preset registration, owner-edit preservation, store isolation, identity, clarification semantics and ordinary/critical action boundaries.
- Source-only checks parsed all AgentMail CSS selectors for target-host scoping, checked launcher URL isolation (including invalid URL and lookalike hostname), and confirmed flows remain unverified. No visual rendering claim follows from these checks.
- `git diff --check` passed.

No browser automation tests, active runtime requests or extension reloads were performed by this worker. Local checks do not substitute for signed-in rehearsal.

## Shared issue reported, not patched on this startup branch

A pure-policy reconstruction of the inspected Edit Properties form exposed an unnecessary approval for the exact opening “Rename Cedar & Finch Support to Cedar & Finch Care, please.” The same `Update` action was allowed for “Update Cedar & Finch Support’s display name to Cedar & Finch Care.” The reconstructed target has `type=submit`, `form=true`, context `Display Name Metadata Add field Update`, with an `Edit Properties` h2 plus Display Name/Key/Value text inputs. It is not an exact Nova snapshot and does not prove the live runner will behave identically. The cause is that the shared `requestedRecordEdit` intent matcher does not include rename; the issue and reproduction were handed to the coordinator’s shared-core owner. No core code was edited here. Rehearse the original opener after the main fix; if still affected, the explicit Update wording is a natural short alternative.

The underspecified “Now organize this inbox for our furniture order questions” also receives approval in that reconstruction. Missing business details should first produce clarification. After card answers, confirm the actual runner carries sufficient explicit update intent and does not add an unnecessary approval. Do not bypass the policy from a site guide.

## Live gates still required

1. Opening rename produces a useful persisted result without a card, keeps the same inbox address and preserves metadata.
2. Metadata configuration passes twice through Nova, with partial answers/help choosing and a variation; no duplicate keys, false automation claim or unnecessary approval.
3. Draft creation/revision passes twice through Nova, with exact existing-record recovery, no duplicate draft, reserved recipient, changed date and saved unscheduled state.
4. Interruption/resume, correction, UI obstruction and duplicate prevention are checked as relevant; failures and recovery evidence retained.
5. Fresh Nova launch, single target tab, authorized Chrome profile, panel initially closed, clean initial browser chrome, autonomous focus, accurate single-color Nova cursor and absent system/operator pointers pass a short actual capture.
6. Freeze build for recording; capture unmodified raw, silent edit and approved-click-only edit; verify every tap against click evidence in decoded exports and preserve execution speed.
7. Coordinator commits/pushes private startup branch and shared fixes correctly; remote refs and all three intended media files independently recover and match recorded checksums.

Remaining limitation: this preparation does not establish Nova end-to-end performance, measured latency, final rendering, final recordings or remote backup success.
