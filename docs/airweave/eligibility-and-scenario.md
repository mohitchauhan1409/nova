# Airweave eligibility and candidate demonstration

Research date: 2026-09-21. Status: public research complete; initial signed-in evidence received from coordinator; deeper workflow checks pending. No Nova implementation, dashboard mutation, connection, or browser operation was performed by this worker.

## Decision

**Provisional CONTINUE, subject to the coordinator's signed-in check before building.** Airweave has real agentic capabilities, but the reviewed official material does not establish an embedded assistant that accepts general user goals and executes configuration across its own dashboard. Its documented agentic search retrieves information from a collection. Official setup skills let an external coding agent configure Airweave using developer interfaces. These are relevant adjacent capabilities, so the demo must not claim Airweave has no agents or no natural-language search.

Confidence: high that the documented search agent is narrower than a dashboard operator; moderate that no equivalent dashboard operator exists in the currently accessible product. Public documentation and source cannot exclude an unannounced, plan-specific, feature-flagged, or newly deployed assistant. If the signed-in product exposes an agent that actually creates/configures collections, connects permitted sources, manages sync and retrieval from user goals, apply the user's skip rule and stop Airweave customization.

Coordinator's initial signed-in evidence received 2026-09-21: the dashboard contains no collections; Create collection lists third-party sources from Airtable through Zoom; navigation includes API keys, Auth Providers, Webhooks and Connect playground; no assistant is visible. The Chrome profile was verified. This supports continuing eligibility research, but it does not establish safe source access or two executable flows. The operator subsequently reported loss of the Computer UI/screenshot connection and is diagnosing it; this worker has not independently reproduced that condition.

## Primary evidence

All pages were retrieved on 2026-09-21. The documentation pages do not state publication dates; retrieval date is not a product release date.

| Source | What the evidence establishes | Relevance to skip rule |
| --- | --- | --- |
| [Official welcome](https://docs.airweave.ai/welcome) | Airweave presents itself as infrastructure for unified retrieval over synchronized applications, databases and documents. Agents consume its search interface. | Describes a context layer, not a dashboard-operating assistant. |
| [Official product site](https://airweave.ai/) | The principal sequence is collection creation, source connection, then retrieval by the user's agent. | Confirms the surrounding product workflow a Nova operator could help execute. |
| [Search documentation](https://docs.airweave.ai/search#agentic-search) | Agentic Search iteratively searches, reads complete documents and traverses entity relationships to assemble relevant results. It is a genuine tool-using agent. | Do not mistake entity navigation for control of dashboard settings or forms. |
| [Agentic Search API](https://docs.airweave.ai/api-reference/collections/agentic) | The request is collection-scoped; the documented response is relevance-ordered search results. | Supports the bounded retrieval interpretation. |
| [MCP Server](https://docs.airweave.ai/mcp-server) | Documented tools are `search-{collection}` and `get-config`. Search supports instant, classic and agentic modes. | This MCP server does not document collection/source creation or dashboard manipulation tools. |
| [Agent Skills](https://docs.airweave.ai/skills) | `airweave-setup` guides external assistants through SDK installation, collection/source setup, MCP configuration and initial queries; `airweave-search` teaches retrieval. | Strong adjacent functionality. It can automate setup through another agent, but is not evidence of a native dashboard controller. |
| [Official CLI](https://docs.airweave.ai/cli) | Collections, sources, search and sync can be managed through a terminal interface designed for developers and agents. | An external agent can configure the system without operating the dashboard. The video must acknowledge this distinction honestly. |
| [Official Slack knowledge assistant repository](https://github.com/airweave-ai/slack-knowledge-assistant) | An example Slack bot searches connected sources and returns cited answers, with conversational context. | A knowledge assistant in Slack, not general Airweave dashboard execution. |
| [Airweave Connect](https://docs.airweave.ai/connect#try-it-in-the-playground) | Dashboard playground configures a collection-scoped connection widget, integration choices, themes and code snippets. | This is a potential configuration workflow; it is not described as a conversational agent. |

Additional public source check: GitHub's main tree resolved to `1ebe1af2dbfb90f3334410721e69997e4f02b320` at retrieval. The frontend page inventory contained Dashboard, CollectionsView, CollectionDetailView, ConnectPlayground, profile/settings, webhooks and admin views. Searching relevant paths/names and inspecting the three dashboard/collection pages found no chat/copilot/assistant workflow. This is bounded negative evidence, not a full code audit or proof of the deployed version.

- [Dashboard source at inspected commit](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/frontend/src/pages/Dashboard.tsx)
- [Collection detail source at inspected commit](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/frontend/src/pages/CollectionDetailView.tsx)
- [Connect state source at inspected commit](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/frontend/src/pages/ConnectPlayground/hooks/usePlaygroundState.ts)

## Bounded signed-in check requested from the coordinator

1. Verify the authorized Chrome profile and Airweave organization/account. Keep identity details in the private batch manifest.
2. Inspect Home, navigation, collection detail, settings/help and any assistant/chat button. Distinguish documentation Q&A, collection search and a product-operation assistant.
3. If a product assistant exists, read its stated capabilities. If needed, use one authorized reversible request on a specifically task-owned object, such as renaming a synthetic collection, and independently verify the saved change. Do not connect real data or change permissions to test it.
4. Report the entry point, exact ability/limitation observed, and continue/skip conclusion. If it can execute the equivalent multi-step dashboard jobs, skip. Otherwise record the scope it actually supports.
5. Before accepting candidate flows, inspect source options, account limits, collection creation/edit forms, sync controls, search modes/filters and availability of safe synthetic data. Native file upload was **not verified** by public research. Do not plan a PDF/CSV upload on assumption.

## Candidate business story

Synthetic company: **Harborline Support**. It is preparing an internal knowledge collection for its support team before an autumn product rollout. Knowledge covers onboarding, return policy and escalation ownership. Keep synthetic provenance in the private object manifest; normal on-screen names should be realistic.

Candidate knowledge documents, only after an authorized isolated source path is established:

- `Harborline Support Handbook` — support hours, priority definitions and team ownership.
- `Autumn Rollout Guide` — rollout dates, supported tiers and reversible onboarding steps.
- `Returns and Escalations` — synthetic policy rules, exceptions and escalation decision tree.

Use no real contacts, credentials, customer data, outbound destinations or activity statistics. Do not infer source isolation merely because OAuth succeeds. The [GitHub connector documentation](https://docs.airweave.ai/docs/connectors/github) discusses read-only credentials and repository scope, but also contains inconsistent configuration wording; actual UI and selected scope must decide readiness. A [Google Drive connector](https://docs.airweave.ai/docs/connectors/google-drive) exists, but folder scoping was not established from the reviewed page. Neither is preapproved for ingestion of existing private content.

## Candidate substantial flow 1: prepare a searchable support collection

Status: **proposed, not live-tested**.

Prerequisites: a confirmed permitted synthetic source, actual UI support for exact source selection, ingestion allowance, and an operator-established baseline. The collection name must be unique or explicitly reusable to avoid duplicates. The creation modal may require a source from the first step, according to the current public frontend; do not promise empty collection creation without checking the deployment.

Suggested opening after a baseline synthetic collection exists: **“Rename Harborline Support to Harborline Support Operations so it's easier to find.”** This is a 14-word useful saved action without missing inputs. Confirm rename support and target uniqueness before adopting it. A rename is only the opener, not one of the substantial workflows.

Follow-up: **“Now prepare this collection for our support team's autumn rollout.”** Clarify only missing scope: which prepared sources to include, how fresh results need to be, and whether the job is initial setup or updating an existing connection. “Help me choose” can compare suitable existing permitted sources or search modes without inventing integrations.

Browser outcome: locate the exact collection; add/configure the designated source through product forms; choose only its synthetic scope; save; observe sync completion or accurate failure; inspect entity count and one distinctive source fact; reopen collection and source settings to verify persistence. No hidden API should complete the on-camera task.

Pass evidence: saved collection/source relationship, selected scope, terminal sync status and retrieval of a known fact. A toast, source row or changed URL alone is insufficient. Authentication or scope-selection obstacles are dependencies, not successful outcomes.

## Candidate substantial flow 2: diagnose and validate knowledge retrieval

Status: **proposed, not live-tested**.

Uses flow 1's collection. Request: **“Check whether our rollout and returns guidance is complete enough for support.”** Nova should choose and execute appropriate product search settings, make multiple focused queries, inspect actual source results, compare coverage and identify any missing knowledge. Use Agentic Search transparently if chosen: Nova operates Airweave's existing feature rather than claiming to supply the retrieval capability itself.

For a meaningful saved outcome, where supported, include a verified connection update (for example the task-owned source's display name or sync configuration) and a refresh of its synthetic content, then repeat the formerly missing query. Do not invent a persistent saved-search feature. Any refresh frequency change must remain limited to this disposable source; prefer manual sync if scheduling is unnecessary.

Correction: **“Use the rollout guide only for that last check.”** Apply a real supported source filter or narrow the query and verify the source attribution. Final short requests: **“Which sources are connected?”**, **“Show the latest sync outcome.”**, and **“What remains missing?”** Answers must cite visible product evidence rather than scenario intentions.

Pass evidence: a known answer from each source, appropriate result attribution, a real revised configuration/ingestion outcome when available, and honest missing-result handling. A sequence of searches without saved configuration is useful but may not satisfy the brief's two substantial outcomes; the coordinator must judge this after inspection.

Alternative second workflow if available: configure the Connect Playground for this collection, choose only permitted integrations, customize the widget and preview/export the generated integration configuration. Public docs support these controls; persistence is unverified. Do not count a transient preview as a saved result, expose tokens, or authorize a new real source in the preview.

## Implementation boundary and handoff

No implementation until signed-in eligibility passes and two safe substantial workflows are established. The strongest dependency is a synthetic source that can actually be connected without broad access changes. If unavailable, report it precisely and continue independent batch work; do not replace real browser work with a mockup or terminal-only demonstration.

The local Nova checkout is the clean main-based branch specified by the coordinator. `docs/CUSTOMIZATION.md` identifies `BE/src/sites/customizations.ts`, hostname-scoped panel CSS and `web/companion/customization.ts` as startup hooks. Any later profile must use `app.airweave.ai` and its own `sites.airweave.json`; current hooks remain unchanged. Theme values require signed-in visual evidence.

## Feasibility addendum: source access (2026-09-21)

**Eligibility passed via the coordinator's signed-in inspection, under the embedded dashboard-operator interpretation. Execution remains dependent on an authorized synthetic source.** The live wizard is ordinary forms: Create collection → name → Next → source → GitHub → source name → Create → PAT, repository, optional branch and sync-PR setting. The wizard was closed without saving; the dashboard still has no collections.

The public connector catalog/source declarations were inspected at the same `1ebe1af2dbfb90f3334410721e69997e4f02b320` revision. No supported anonymous text, local-file upload, public-URL crawler or zero-credential synthetic source was found. Ordinary connectors declare direct credential, OAuth or auth-provider methods. CTTI's public research data still requires a database username/password. The superficially promising Stub, File Stub, Snapshot and Enron sources are marked internal; the source registry excludes them unless server configuration enables internal sources. They are not legitimate cloud-UI alternatives, and Enron is not the required synthetic business corpus.

- [Source catalog](https://github.com/airweave-ai/airweave/tree/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/platform/sources)
- [Internal-source gate, lines 78–81](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/domains/sources/registry.py#L78-L81)
- [File Stub declaration](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/platform/sources/file_stub.py)
- [Create Source Connection authentication modes](https://docs.airweave.ai/api-reference/source-connections/create-source-connections-post)

**Exact first candidate:** an already configured GitHub Auth Provider connected to an already authorized read-only account, with `repo_name` set to a dedicated repository containing only the Harborline synthetic documents, explicit `branch`, and `sync_pull_requests=false`. This avoids issuing a new token only if such a provider/account and repository already exist. GitHub is a better-bounded option than a workspace-wide connector: the [config schema](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/platform/configs/config.py#L178-L202) requires one repository. A public repository alone does not bypass authentication; the [connector request path](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/platform/sources/github.py#L125-L137) supplies a token for every request. Do not use Nova's mixed-content repository as the corpus or extract a CLI/session token.

**Bounded alternative if an existing Drive provider is available:** the public code supports nonempty `include_patterns`, e.g. `Harborline Support Knowledge/*`. The [schema](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/platform/configs/config.py#L332-L350) says an empty list includes all files; [include mode](https://github.com/airweave-ai/airweave/blob/1ebe1af2dbfb90f3334410721e69997e4f02b320/backend/airweave/platform/sources/google_drive.py#L1087-L1118) traverses matched subtrees. This is a candidate only if the actual cloud form exposes the field before first sync, the connected account was already authorized for this use, and the folder is synthetic-only with a unique path. It still enumerates drive/folder metadata and requires authentication; it is not a zero-permission or zero-access path. The current source declaration also marks Google Drive as requiring BYOC for new OAuth setup, so a fresh OAuth flow is not an assumed quick alternative.

Auth Providers are credential brokers, not a credential-free ingestion source. [Composio's official guide](https://docs.airweave.ai/auth-providers/composio) requires an existing connected source account plus provider connection identifiers (`auth_config_id`, `account_id`). The coordinator may inspect provider names/status and whether a source wizard offers an existing authorized connection, without revealing any secret. An existing provider name does not establish scope or permission to ingest its account.

**Concrete prerequisite if neither existing scoped connection exists:** an owner-provided/owner-authorized source connection to a dedicated synthetic corpus—for the verified GitHub wizard, a read-only credential limited to a designated synthetic-only repository (Contents read access), its exact `owner/repo` and branch. Provisioning new credentials or granting new access requires authorization beyond the brief's restriction on credential/access changes. Do not request a token in chat or attempt to derive one from another app. No safe zero-new-permission route was established by public research, and no account API/UI calls were made by this worker.

## Confirmed external blocker and resume condition

Coordinator update, 21 September 2026: **Airweave remains eligible, but implementation and the demonstration are blocked on authorized source access.** This is not a skip for an equivalent embedded agent and not a finished video.

| Account/UI evidence reported by coordinator | Concrete implication |
| --- | --- |
| The signed-in dashboard has no collections. | There is no prepared searchable knowledge baseline to reuse. |
| The GitHub source wizard requires a Personal Access Token and `owner/repo`; optional fields include branch and a PR-sync toggle. | Collection setup cannot complete this path using synthetic files alone. No source credential has been supplied or located through an authorized source connection. |
| No connected Auth Providers are available in the account. | The earlier conditional existing-provider route is unavailable in the observed account. |
| Composio setup requests a Composio API key. | Configuring Composio would introduce another credential prerequisite; it does not bypass GitHub/source authentication. No provider key was supplied or inspected. |
| The GitHub wizard was closed without saving, and the dashboard still showed no collections. | No ingestion or persisted collection was claimed; the failed prerequisite did not become a staged fake success. |

The minimum resume requirement is an owner-authorized read-only source connection to a **dedicated synthetic-only corpus**. For the exercised GitHub path this means a credential with Contents read access limited to the designated repository, its exact `owner/repo`, and the chosen branch; keep PR sync off. The corpus must contain only the prepared Harborline documents, not Nova code, another customer's branch or unrelated private files. A genuinely existing, scoped provider connection would also satisfy the authentication prerequisite after its selected account and source scope are verified, but none was present during this check.

No credential value should be sent in conversation or committed. The owner can establish the connection through the product's intended secure flow, or explicitly authorize the needed credential/access provisioning. The current brief permits synthetic uploads and reversible dashboard work but excludes credential/access changes; that is the source of this unresolved authorization boundary. Public source-code evidence above offers no supported anonymous-upload alternative. Do not mine another application, browser session or Git CLI for tokens.

Resume only when the source is connected with known synthetic scope. Then verify actual ingestion/retrieval, select two substantial supported workflows, build the startup hooks and complete the normal rehearsal/recording gates. Until then, finish independent batch work and report Airweave's media as missing with this specific prerequisite.
