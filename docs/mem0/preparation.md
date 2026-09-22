# Mem0 preparation — 2026-09-22

Status: research/preparation only. Eligibility, UI capabilities, account/project and all flows await coordinator verification. No browser access, API mutation, runtime change or implementation performed by this worker.

## Eligibility evidence

Public primary sources describe Mem0 as a memory layer, with APIs and external agent integrations. No indexed primary source found in searches for native Mem0 Copilot or Ask Mem0 establishing an embedded dashboard-control agent. Absence from search is not proof of absence; native Copilot must be inspected once by the coordinator before implementation.

- https://docs.mem0.ai/platform/mem0-mcp — a hosted server exposes add, search, get, update, delete, entities and event tools to external AI clients. Agents can decide when to call them. This is genuine agentic memory management, but does not establish an embedded dashboard-control agent.
- https://mem0.ai/blog/mem0-claude-connector-persistent-memory-across-every-chat — dated July 14, 2026, updated September 3. Claude's official Mem0 connector performs server-side memory operations in plain English. Any demonstration must avoid the blanket claim that Mem0 has no agent capable of memory work.
- https://docs.mem0.ai/core-concepts/memory-operations/update — documents updates through SDK/API and viewing the result in the dashboard. Does not establish that dashboard UI itself exposes editing.
- https://docs.mem0.ai/platform/quickstart — SDK add/search path, dashboard API key prerequisite, and an MCP option. API setup is not Nova browser-action evidence.
- https://mem0.ai/blog/mem0-joins-vercel-marketplace — September 16, 2026. Current product positioning is a durable scoped memory layer for user-built agents.

Bounded live eligibility request: ask native Copilot whether it can create and revise a saved memory in the current project rather than explain API code; if it claims execution, request a synthetic disposable memory and independently inspect persistence. If it actually provides equivalent dashboard task execution, skip per user instruction. Otherwise record observed limitation and proceed. Avoid opening key pages during capture.

## Proposed scenario and workflows (unverified)

Scenario: an AI companion called Lumen remembers a synthetic learner's routines and preferences. Stable user scope `nova-demo-mira`; agent scope `lumen-demo` only if UI supports it. Nothing is an actual person's data.

Baseline candidates (created only after scope/UI verification): Mira studies Spanish, prefers ten-minute sessions, likes concise encouragement, and initially studies at 7 pm on weekdays. Keep exact memory IDs/URLs and created object ownership in a manifest. Extraction may split one input into multiple records; record actual results rather than assuming counts.

1. Build and inspect a scoped companion profile. Opening request: “Show Mira’s evening routine.” Nova navigates from Home, locates the synthetic user and relevant saved memory, and verifies content without a question card. Connected request: “Help Lumen remember her new study routine.” A useful clarification may ask which days/time and response style only if missing. Through the real Add Memory UI, save the chosen concise facts under the correct user (and agent if supported), then leave/reopen and inspect persistence and scope.
2. Correct and audit an outdated preference. Request: “Move her weekday study time to 8 pm and keep the ten-minute sessions.” Locate exact old record through supported UI search/filter, edit its stored content, save, reopen and verify the revised text. Query again to check whether obsolete conflicting content still exists. Do not delete unrelated facts; if revision UI is missing, do not claim a scripted API update was browser work. End with useful questions grounded in the actual records, e.g. “What should Lumen remember before suggesting tomorrow’s session?”

Each substantial flow needs two successful live passes, including wording variation or targeted revision, with independent saved-state inspection. Candidate fallback if edit is unsupported: scoped addition of a second companion preference set plus filtered inspection across two synthetic users; use only if the observed UI makes this substantial and convincing. A missing edit and add UI is an essential blocker, not a reason to fake browser execution.

## Dependencies and local customization hooks

- Coordinator: verified signed-in account, current organization/project, normal Home route, native Copilot result, Add/Search/Edit controls and observed record routes. Need screenshot/theme evidence and safe saved object IDs before final guide/script.
- `BE/src/sites/customizations.ts`: intended isolated preset hook (`customSiteProfiles`) and site store filename. Proposed id `mem0`, domain `app.mem0.ai`, separate `sites.mem0.json`. Do not change shared engine or hardcode opaque controls.
- `shared/site-experience.ts`: greeting, up to two suggestion flows and validated accent derive from SiteProfile. Accent must be measured from live dashboard; no invented branding color yet.
- `shared/page-theme.ts`: existing passive light/dark detection. Preserve theme lifecycle; coordinator verifies launcher/panel/cards/action cursor together.
- `BE/src/sites/store.ts`: saved profile can override defaults; isolated runtime data dir plus filename are needed. Fresh customer preset is inserted if absent; changing source preset does not overwrite existing same-site edits automatically.
- Keep flows `verified: false` until coordinator supplies actual successful live receipts. Site guides are hints, not assertions of tested universality.

## Acceptance handoff

Supply native Copilot response, dashboard Home URL, scope, exact UI labels, memory form fields, one saved/reopened object, observed colors and any plan restrictions. Worker can then implement only the Mem0 preset and concise scenario/docs. Live browser, active extension/backend, recording and git ref/push ownership remain with coordinator.

## Coordinator live evidence — eligibility reassessment

The coordinator verified the requested Chrome profile, organization `mohit319-default-org`, and project `default-project`. Native Copilot's introduction explicitly offers to apply changes after review. In a capability-only exchange, it reported the following native tools:

- `update_project_config`: custom instructions, custom categories, memory depth and multilingual settings.
- `update_user_profile_config`.
- `add_test_memory`: reportedly writes real memories.
- `get_all_memories`, `search_memories`, `list_entities`.

It reported no delete, team, key or plan capabilities. Conversation: https://app.mem0.ai/dashboard/copilot/72846dee-c69d-4d82-8d8d-7d853b06a114

Evidence status: introduction and self-reported capabilities observed by coordinator; no execution or persistence verified. These native claims supersede the earlier public-search uncertainty. Exact parity with Nova is not established, particularly individual-memory revisions, broad UI navigation and arbitrary dashboard tasks.

Recommendation: treat Mem0 as provisionally meeting the user's exclusion criterion. The criterion concerns an existing native agent that carries out requested dashboard work; it should not be interpreted as requiring literally every possible dashboard operation. Native creation, retrieval and configuration changes materially overlap the proposed Nova demonstration. Do not build Nova for Mem0 pending confirmation. A single reversible synthetic `add_test_memory` action followed by an independent dashboard read/reopen would turn native capability claims into execution evidence. If that succeeds, skip Mem0 and state the demonstrated overlap and known limits. If Computer access remains unavailable, report native execution as unverified; do not claim a successful action or universal parity. The observed native introduction plus tool claims can support a cautious exclusion decision, but cannot support a claim that execution was tested.

Current external constraint reported by coordinator: Computer lost accessibility/screenshot access during troubleshooting. No new UI interactions were performed by this worker.

## Batch checkpoint

Live verification is blocked by the Computer-to-Chrome connection returning only window titles and no screenshots. Both macOS permissions were verified enabled. User retry and tool reset did not restore access. No startup implementation, final recording or media backup is complete. Resume the eligibility check first after connection recovery.
