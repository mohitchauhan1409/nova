# AgentMail eligibility and safe scenario assessment

Research date: 2026-09-21. Branch: `agentmail-nova`. Preparation base: `b68a7be` (coordinator supplied). Public-source review only; the coordinator exclusively owns Chrome, the signed-in console, installed extension, Nova runtime and recorder.

## Decision before implementation

**Continue: eligibility accepted by the coordinator after public and signed-in review on 2026-09-21.** Public primary sources do not identify an AgentMail-native conversational assistant that operates its console end to end. They do establish significant agent execution functionality through external clients. This is a bounded negative finding, not proof that a private beta or account-specific assistant does not exist.

The user’s specific exclusion is an existing equivalent agent that controls the dashboard to accomplish user goals. Under that dashboard-specific reading, AgentMail’s documented integrations do not alone meet the exclusion. Under a broader reading of “any agent that can do all these stuffs,” its first-party MCP integration substantially overlaps inbox and draft tasks. The final eligibility decision must explicitly acknowledge that overlap; never claim AgentMail has no agents or that Nova uniquely enables programmatic email actions.

Confidence: **medium-high** that no equivalent native console operator is exposed in the reviewed account and public documentation; **high** that external AI clients can already execute substantial AgentMail resource operations.

Coordinator-observed signed-in evidence on 2026-09-21: the required Chrome profile was verified; the active organization is “Mohit’s organization,” Free Tier, Default Pod. Overview showed 0 active inboxes out of 3 and no mail activity. The dark-theme sidebar exposed Overview, Inboxes, Metrics, Domains, Webhooks, API Keys, Lists, Providers, Settings, Upgrade and Help. No assistant entry was visible on Overview. Help has not been inspected. The coordinator then lost Computer UI/screenshot access and is diagnosing it. This narrows the uncertainty but is not full native-agent verification or flow validation.

Subsequent coordinator evidence: Computer access recovered. Help exposes only Discord, Documentation and Feedback; no native operator was found. The coordinator approved implementation and exercised inbox creation, saved display-name/metadata editing, composer Close autosave, reopening Edit Draft and saved draft revision. Those actions establish product feasibility, not Nova rehearsal success. The selected scenario and current evidence are in [demo-script.md](demo-script.md) and [validation.md](validation.md); the candidate scenarios below retain the research rationale and are superseded where the selected script differs.

## Primary-source evidence

All links below were opened or returned current official content on 2026-09-21. Search engine crawl-age labels were inconsistent; use the page’s explicit dates where supplied.

| Source | Evidence and relevance |
| --- | --- |
| [AgentMail product homepage](https://www.agentmail.to/) | Positions the product as email infrastructure for AI agents, providing inboxes, messages, threads, real-time events, SDKs and MCP. It says other agent stacks use AgentMail. This supports infrastructure positioning, not a native dashboard operator. |
| [Official MCP integration](https://docs.agentmail.to/integrations/mcp) | A hosted first-party server connects to Claude, Cursor and other MCP clients. The documented tools create/update inboxes; search and label messages/threads; create/update/send drafts; and select organizations. OAuth uses console identity. It demonstrates real execution and business-goal overlap, but the chat client is external. No browser-control or embedded console agent is described. |
| [Official documentation index](https://docs.agentmail.to/llms.txt) | Lists API resources, external integrations, agent onboarding, skills and example agents. No console-operating conversational assistant appears in the visible index. An index cannot rule out an unlisted beta. |
| [Official changelog](https://docs.agentmail.to/changelog) | Latest visible entry is September 16, 2026, concerning AgentID authorization. Other visible releases cover API keys, providers, drafts, metrics, webhooks and metadata. None describes an embedded console operator. This is a current release-history cross-check, not a completeness guarantee. |
| [agent.email engineering announcement](https://engineering.agentmail.to/blog/agent-email) | March 12, 2026 announcement describes a landing page and skill enabling external agents to sign up for AgentMail. Agent-friendly onboarding is not evidence of a native console assistant. |
| [Inboxes documentation](https://docs.agentmail.to/inboxes) | Inbox resources support display names, optional username/domain, custom metadata and CRUD operations. Useful capability evidence for candidate setup work; API support does not prove corresponding console forms exist. |
| [Drafts documentation](https://docs.agentmail.to/drafts) | Drafts are saved unsent messages. They can hold recipient, subject, content and attachments and can be updated before sending. Scheduling and sending are separate consequential possibilities that this demo must not use. Browser composer support remains unverified. |
| [Official first-inbox guide](https://docs.agentmail.to/knowledge-base/creating-first-inbox) | Starting point for inbox creation research. Coordinator must verify console navigation and available controls in the actual account. |

The documentation header includes “Ask AI.” Its presence on documentation pages establishes a docs assistant entry point only. No source inspected shows that widget editing authenticated console resources. It must not be confused with the dashboard-equivalent agent being screened for.

## Bounded checks for the live-session owner

1. Confirm the user-authorized Chrome profile and active AgentMail organization. Record operational identifiers privately in the batch manifest, without copying unrelated records or secrets into this report.
2. Inspect overview, sidebar, top bar and help/assistant launchers for an embedded agent, chat, copilot or goal-entry control. If one exists, inspect its explanation and offered actions. Determine whether it gives instructions or actually saves console changes. Do not contact support or enable integrations merely to test this.
3. If a native console operator is present, **stop preparation and skip AgentMail** under the user’s exclusion; save concise evidence of its actual capability and scope. If only docs help or external MCP links exist, report that distinction and continue.
4. Inspect the existing inbox count and remaining plan capacity. Do not upgrade or delete unrelated inboxes to create room. Inspect create/edit forms for display name, address, metadata, pod and other fields actually supported.
5. Open a task-owned inbox or new unsaved form and inspect whether the console supports creating, saving, reopening and editing unscheduled drafts. Record actual labels and persistence behavior. Do not infer UI support from API docs. Do not send mail, schedule delivery or create fake message history.
6. Inspect webhook/routing controls only as a fallback. A persisted disabled/draft setting may be eligible if independently verified. Do not point a webhook at production, activate event delivery, enable autoresponse or change credentials/access.
7. Capture the real theme’s surface/text/border/accent values and view structure for implementation. Public landing-page colors are not a substitute for the signed-in console theme.

## Candidate connected scenario, pending console evidence

Synthetic business: **Cedar & Finch**, a small furniture studio preparing a support inbox and reviewable order-update drafts. This is a proposed narrative, not a claim about real customer records or production activity. Use a task-private object manifest and only reserved non-deliverable recipient addresses, e.g. `orders@customer.example`. A new AgentMail-hosted inbox itself is a real provisioned resource, even though the business scenario is synthetic.

### Flow A — Prepare a dedicated support identity

- Candidate opening, 12 words: “I’m stuck—create a Cedar & Finch support inbox using the default domain.”
- The opener is viable only if the actual form allows a generated address and an unambiguous display name. If it requires a unique local part, revise the prompt with an explicit verified available value before rehearsal.
- Useful result: create and save the inbox, confirm exact address/display name, reopen it and verify its persistence. Avoid any initial card when supplied details genuinely suffice.
- Connected request: “Now organize this inbox for our furniture order questions.” Ask a grouped clarification only for available, meaningful settings: intended support scope and display name; metadata or grouping only if actually exposed.
- Revision: “Use Cedar & Finch Care as the display name, keeping the same address.” Verify the existing object changed rather than a duplicate being created.
- Pass criterion: an inbox with a verified identity plus at least one meaningful additional persisted configuration supported by the actual UI. A one-field create alone does not satisfy the substantial-flow requirement; downgrade or replace this flow if richer configuration is unavailable.

### Flow B — Prepare and revise a saved response without dispatch

- Candidate second substantial request: “Prepare an order-update draft in that inbox, ready for our review.”
- Proposed grouped answers: recipient `orders@customer.example`; subject `Your oak desk order update`; facts: order `CF-1048`, revised dispatch date October 2, 2026, tracking shared once dispatched; tone warm and concise; leave unscheduled.
- “Help me choose” moment: ask whether a short acknowledgement or full update is better. Nova can recommend a concise full update because the revised date is the key information; it must not invent a refund, delivery promise or actual tracking link.
- Save the unscheduled draft in the exact inbox, navigate away, reopen it and verify subject, recipient, text and draft state.
- Targeted revision: “Change the dispatch date to October 5 and keep the rest.” Verify the existing draft is updated once, with the original date removed and no duplicate.
- Pass criterion: a persisted, unsent, unscheduled draft in the selected inbox with the corrected facts; show the actual draft count/details. Drafts visible only through an API do not qualify as browser work.

### Closing requests

“What did you create, and what is still unsent?” followed by “Open the draft so I can review it.” An optional account-usage question may be used only if visible safe metrics are available. Report genuine empty mail/activity states; do not manufacture messages or analytics to populate the dashboard.

### Baseline and fallback rules

If capacity allows, a small existing task-owned identity and one unsent reference draft can make the account coherent; keep the recorded inbox/draft tasks unfinished. Reuse exact task-owned objects in two varied rehearsals per flow and reset only their recorded fields. Store synthetic origin and exact IDs privately. Do not delete unrelated resources by matching similar names.

If the console lacks draft creation or meaningful inbox configuration, the two proposed flows are **not ready**. A fallback could be a supported persisted disabled webhook configuration tied to the new inbox, but only after the owner verifies its disabled semantics and an inert endpoint. Do not replace missing browser functionality with direct API calls during the recording. If no two substantial safe flows exist, record that constraint rather than producing a shallow or misleading demo.

## Implementation handoff after approval

Local inspection initially found empty customer hooks in `BE/src/sites/customizations.ts`, `web/src/panel/customization.css`, and `web/companion/customization.ts`. After eligibility approval, startup-specific guides and hostname-scoped theme were implemented there, with a separate `sites.agentmail.json` store. Builds remain in this worktree; no live runtime, loaded extension, browser, credentials, outbound message, webhook or shared output was changed by this worker.

Status: eligibility passed and UI feasibility inspected by the coordinator. Startup-only customization prepared. Exact theme sampling, installed-Nova rehearsals and recording preflight remain pending. No Nova-completed-flow or recording-readiness claim is made.
