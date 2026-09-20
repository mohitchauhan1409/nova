> Current implementation note (16 September 2026, version 0.6.0): the browser
> extension uses trusted Chrome input and a native side panel with Chat first.
> Sol is the default and Terra the lower-cost option. Site identity is separate
> from the general browser engine, with viewport-first discovery and visual target
> inspection. The research below includes earlier design decisions; use
> [GENERAL-AGENT.md](GENERAL-AGENT.md), [MODELS.md](MODELS.md) and
> [VALIDATION.md](VALIDATION.md) for the current implementation and evidence.

# Nova: engineering research and product direction

Research date: 16 September 2026. Primary vendor documentation and research papers were consulted. Vendor performance statements are not independent benchmark results. Live measurements from this workspace are reported separately in `VALIDATION.md`.

## Product thesis

Nova should be a website-aware, conversational action companion. The defensible product is a combination of familiar in-page presentation, knowledge of the selected website, predictable permission boundaries, and short time to a verified outcome. Universal autonomy and perfect reliability are not achievable release criteria: websites change, sessions differ, controls can be inaccessible, and access checks deliberately require a person.

“Add a URL” means registering a website and opening an execution surface. It cannot grant access to an unrelated browser tab by itself. Browser origin boundaries still apply. Nova therefore has two surfaces: a browser extension for an existing signed-in tab, and an isolated browser for independent work. The target website needs no source-code integration. Chrome content scripts provide the extension's DOM access; `activeTab` ties that access to a user invocation. Cross-origin navigation may require invoking Nova again. [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts), [activeTab tutorial](https://developer.chrome.com/docs/extensions/get-started/tutorial/scripts-activetab).

“All flows” should become an explicit coverage matrix, not a promise to exhaustively crawl every possible account state. Start with a few high-value workflows per site, record outcomes, and expand by measured demand. Automatically visiting every link could log out, delete data, purchase something, or expose private information. This implementation observes a page, suggests simple unverified guides, and allows the owner to author site instructions and steps.

## Recommended architecture

Use this loop: user intent → current observation → one typed decision → deterministic action policy → execution → fresh observation → outcome check. Conversation and browser execution share events but have separate responsibilities. Voice cannot directly execute arbitrary browser commands.

The observation contains bounded visible text, labeled interactive elements, current URL, viewport size, and optional screenshots. Passwords, payment fields, hidden controls, input values, and Nova's own UI are excluded from normal text extraction. Element references belong to actual observed nodes and become unusable when those nodes disappear. A controlled-browser isolated JavaScript world prevents a website from replacing Nova's observation functions.

The executor supports navigation, links, search, text entry, selection, supported keys, scrolling, and visual inspection. Typed tools keep model output within a small contract. It does not execute model-written arbitrary JavaScript. OpenAI's current computer-use guidance recommends code execution for Astra and also supports structured computer actions; Nova deliberately uses a smaller typed action surface because an agent in a signed-in consumer tab benefits from enforceable action boundaries. This is an engineering tradeoff, not a claim that typed tools have higher benchmark performance. [OpenAI computer use](https://developers.openai.com/api/docs/guides/tools-computer-use).

For native input in the controlled browser, Playwright handles actual keyboard and pointer events. DOM actions are used where appropriate for values and selection. The extension uses DOM events and therefore cannot guarantee compatibility with widgets requiring trusted operating-system input. Playwright's documented actionability checks explain why stable, visible, enabled, unobscured targets matter; Nova checks these properties before native clicks. [Playwright actionability](https://playwright.dev/docs/actionability), [locators](https://playwright.dev/docs/locators).

The conversation surface is now a voice-first floating companion directly on the target website in both execution modes. The dashboard handles launching and configuration. The extension keeps its connection in the service worker, while the dedicated browser binds the companion to one backend runner through an isolated CDP world. Provider credentials and the pairing token are never injected into a target website.

The UI uses constructed style sheets and DOM node creation, avoiding HTML sinks and site-specific Trusted Types policy exceptions. A live YouTube failure motivated this change; a fixture now runs under a Trusted Types enforcement header. A page reload still destroys that document's microphone: after prior consent, the companion attempts to reacquire it on the same origin. This is recovery with a possible gap, not uninterrupted media across documents. The side panel now serves setup only. [Chrome isolated content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts).


The dashboard now opens websites through its own browser extension using the originating tab’s window ID. The extension creates a new tab in that window, requests access to the chosen website from a direct user gesture when needed, and attaches Nova after navigation. Pairing data stays out of website URLs and target-page messages. The bridge accepts only the top-level local dashboard. Browser families that cannot load this extension require separate integrations. [Chrome tabs API](https://developer.chrome.com/docs/extensions/reference/api/tabs), [optional website permissions](https://developer.chrome.com/docs/extensions/reference/api/permissions).

## Intelligence and voice

The default browser model is **GPT-6 Astra**, with low reasoning effort and the Responses API. Official guidance identifies it as the strongest current general model for the relevant browsing/computer-use workloads. Availability was independently verified with the supplied API account and an actual response. Low reasoning effort reduces unnecessary work on common UI steps; more difficult planning needs its own measured escalation policy. `OPENAI_MODEL` and `OPENAI_REASONING_EFFORT` are environment settings. [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model).

The optional fast lane initially uses **GPT-5.4 mini**, which the account can access. GPT-5.6 Luna is another current candidate worth a paired benchmark. “Newest,” “smallest,” and “fastest to finish a task” are different claims. A faster token stream that makes more mistakes may have worse total task latency. Do not switch defaults based only on vendor positioning or one short completion. Benchmark the same workflows, network, observations, and reasoning budget before changing the lane. [GPT-5.6 Luna](https://developers.openai.com/api/docs/models/gpt-5.6-luna).

For Sarvam, the implemented stack is **Saaras v3 realtime** for incoming English audio, **Bulbul v3** for outgoing speech, and **Sarvam-105B Conversations** for brief conversational acknowledgements. English is configured as `en-IN`; the default voice is `shubh`, which is configurable. Bulbul voices are a subjective product choice: a listening study should choose the final voice, rather than asserting one speaker is objectively best. The latest general model listing recommends these model families and documents the available voices. [Sarvam model catalog](https://docs.sarvam.ai/api/getting-started/models), [Bulbul REST reference](https://docs.sarvam.ai/api-reference/text-to-speech/convert).

The input path streams mono, 16 kHz PCM in approximately 100 ms chunks over the backend. The realtime STT protocol provides partial transcripts, final transcripts, and speech-start events. `stream_type=fast` supports early feedback; server VAD uses a 500 ms silence threshold. These are starting values requiring noisy-room and accent testing. Saaras v4 uses the same documented realtime protocol and is a future A/B candidate; the currently implemented v3 realtime connection was tested. [Sarvam realtime STT](https://docs.sarvam.ai/api/api-guides-tutorials/speech-to-text/realtime-streaming).

The output path streams Bulbul linear PCM to a scheduled Web Audio player. Playback is interrupted immediately on incoming speech events. Nova also pauses further browser actions when the user begins speaking. TTS is closed on interruption so old audio cannot leak into the next utterance. A browser action already dispatched cannot always be undone. [Sarvam streaming TTS](https://docs.sarvam.ai/api/api-guides-tutorials/text-to-speech/streaming-api/web-socket).

Sarvam's conversation model runs with reasoning disabled for a short acknowledgement in parallel with the OpenAI browser task. It does not rewrite product facts, authorize an action, or select browser tools. The browser's actual answer is spoken directly, preserving prices and other details. This separation adds natural conversation without placing two LLM decisions serially before every browser action. [Sarvam chat guide](https://docs.sarvam.ai/api/api-guides-tutorials/chat-completion/overview).

## Libraries and infrastructure

| Component | Choice in this repository | Rationale and limitations |
|---|---|---|
| API and local transport | Fastify, `ws` | Small TypeScript service with authenticated, bidirectional browser and voice events. Local single-user deployment only. |
| Browser control | Playwright + CDP | Native input and a dedicated isolated execution world; disposable browser contexts. |
| Existing browser access | Chrome Manifest V3 extension | Uses the selected tab's existing session without copying cookies to the backend. |
| Action contract | Zod, OpenAI structured outputs | Validates action shape; policy separately validates consequences. Schema compliance is not proof of correctness. |
| Dashboard and panel | React, Vite, Lucide | Shared UI with site accents, conversation, approvals, and activity. |
| Browser runtime packaging | esbuild | Bundles the same observation logic into the controlled browser and content script. |
| Domain comparison | tldts | Public-suffix-aware same-site comparison; avoids naive hostname-suffix matching. |
| Validation | Vitest + isolated Chromium fixtures | Deterministic policy tests plus actual DOM/browser behavior. |
| Voice | Web Audio AudioWorklet + Sarvam WebSockets | Low-overhead local audio path and explicit interruption handling. |

For a hosted product, evaluate **LiveKit Agents** or **Pipecat** before building a complete realtime media infrastructure. LiveKit has turn-detection and interruption-handling abstractions and a Sarvam integration. Those become useful for WebRTC transport, device switching, network recovery, and large concurrent session counts. The direct WebSocket implementation is simpler for the current local product, but does not provide adaptive semantic turn detection or production media operations. [LiveKit turns](https://docs.livekit.io/agents/logic/turns/), [LiveKit Sarvam STT](https://docs.livekit.io/agents/models/stt/sarvam/).

**Stagehand** is a strong candidate for the dedicated-browser execution lane: `observe`, `act`, and `extract` separate discovery from deterministic replay. Its caching approach is especially relevant to repeated business flows. Recent Browserbase documentation describes configurable cache thresholds. Nova has not integrated or benchmarked Stagehand, and does not claim those cache speedups. Before adoption, evaluate DOM extraction quality, guardrail hooks, model support, cloud dependence, and cache invalidation under changed prices or destinations. [Stagehand observe](https://docs.stagehand.dev/v3/basics/observe), [Browserbase caching](https://www.browserbase.com/changelog/caching-configurable).

**Browser Use** supplies an established browser-agent ecosystem and a cloud task API. It can shorten infrastructure work for unattended sessions. Its cloud quickstart is useful for evaluating remote execution, while Nova's main consumer differentiator depends on continuity with a user's local tab. Compare success rate, session recovery, latency, isolation, and total cost before paying for a second browser provider. [Browser Use quickstart](https://docs.browser-use.com/cloud/quickstart).

**WebMCP** is worth supporting as an optional capability when a website exposes suitable tools. Structured site-provided tools can reduce ambiguous UI interactions. It does not replace Nova's generic execution path: it requires website participation and evolving browser support. A site-provided tool description is still untrusted and cannot grant user permission. This repository does not yet invoke WebMCP. [Chrome WebMCP workflow guidance](https://developer.chrome.com/docs/ai/webmcp/build-tools).

Avoid adding a vector database, a multi-agent framework, a workflow cluster, and several browser vendors to the first local release. Site profiles and a bounded conversation fit a small store. Introduce PostgreSQL for hosted accounts and audits, Redis for coordination/rate limits, and a durable workflow engine only when actual deployment and failure requirements justify them.

## Competitor lessons and potential differentiation

| Reference | Documented strength | What Nova should learn | Nova opportunity to validate |
|---|---|---|---|
| Stagehand / Browserbase | Structured browser operations and cacheable observations | Spend intelligence on discovery; replay only with fresh preconditions | Site-specific verified fast paths in the user's own browser |
| Browser Use | Agent/browser task infrastructure | Invest in browser lifecycle and diagnostics | Voice and a consumer-facing website companion rather than only task APIs |
| Skyvern | A screenshot/DOM/reason/execute/check loop and reusable workflows | Treat execution, verification, and workflow reuse as separate concerns | Low-friction personal use with explicit transaction boundaries |
| Comet inline assistant | Contextual reading/writing tools on selected page content | Meet the user where they are already browsing | Voice-directed multistep actions with visible site-specific knowledge |

Skyvern's documentation explicitly describes its step loop and workflow model. This is a reference architecture, not evidence of a particular reliability or speed advantage. [Skyvern introduction](https://www.skyvern.com/docs/developers/getting-started/introduction), [Skyvern core concepts](https://www.skyvern.com/docs/developers/getting-started/core-concepts).

Comet's documented inline assistant offers contextual actions for selected text. Its presence reinforces that an embedded-looking UI alone is insufficient differentiation; Nova needs dependable actions, site knowledge, interruption quality, and repeat-task performance. [Comet inline assistant](https://www.perplexity.ai/help-center/comet/fr/articles/13533742-inline-assistant).

Proposed USPs are hypotheses, not verified market-leading claims: familiar styling for each site; teachable site guides; rapid voice interruption; transaction previews tied to exact page state; and an honest action history. The long-term asset should be a consented, versioned library of successfully verified workflows and recovery examples.

## Speed strategy

Measure the time from speech end to first useful acknowledgement, first browser action, and verified completion separately. Optimize overall completion and error recovery before optimizing decorative “thinking” indicators.

Implemented optimizations include a deterministic path for explicit scroll/zoom commands, skipped conversational acknowledgements on that path, a compact structured action, bounded observation/history, DOM-first reasoning, screenshots only on demand, a combined search operation, reuse of the just-verified snapshot, native browser input, and streaming audio. Waiting uses bounded settling rather than a global network-idle condition, which can hang on analytics and media pages.

Proposed performance gates, not current guarantees: median speech acknowledgement below 1.2 seconds; P95 interruption below 300 ms after VAD detection; routine search within one planning turn plus navigation; and zero repeated mutations after ambiguous transport failures. Track cold and warm runs separately and include regional network latency.

Next optimizations should be measured: semantic flow cache keyed by origin, workflow version and DOM preconditions; response prefix caching diagnostics; confidence-based model routing; useful-page readiness signals to avoid model calls on a blank loading state; and streamed short acknowledgements. Never cache a product price, cart total, recipient, or permission as timeless truth. Do not batch unknown mutations to save round trips. Reducing avoidable requests follows the general latency principle of completing simple work locally; the quality tradeoff still needs measurements. [OpenAI latency guidance](https://developers.openai.com/api/docs/guides/latency-optimization).

## Safety and reliability requirements

The backend owns action classification and approvals. The model cannot mark a cart action read-only to skip confirmation. Approvals expire, authorize one exact action, and are invalidated when observed product text or the target changes. Unknown controls are conservative by default. The runner stops after repeated failures or its time/step budget and avoids retrying possibly committed actions after a transport failure.

This is defense in depth, not proof against every prompt injection. A website controls its text, labels, layout, and behavior. Keyword-based consequence detection can have both false positives and false negatives; production needs adversarial evaluation, site-specific protected-action contracts, and ultimately server-side transaction integration where possible.

Secrets remain in a local backend environment file. A generated local pairing token connects the extension. The server binds to loopback, checks hosts and origins, authenticates messages, bounds payloads, and does not expose provider keys through the frontend. Browser URL filtering rejects private addresses, except the explicitly bundled demo. Application-level DNS checks are not a substitute for a network-enforced egress sandbox: hosted execution must isolate workers and block private/metadata IPs at the network layer, including DNS rebinding and redirect cases.

Session messages and observations are held in memory; site guides and the pairing token are stored locally. Raw microphone audio is not written to disk by the app. Provider services still receive the data required for their operations; deployments must explain that data flow and confirm provider retention settings. `store:false` is set on OpenAI Responses requests, but it should not be described as a universal zero-retention guarantee.

## Evaluation and staged release

Do not evaluate only with a language model's statement that it succeeded. Use independent postconditions: the requested video is open, the search query appears, the cart has the exact item and quantity, the selected option changed, or the form remains unsubmitted after denial.

Test plan: semantic controls; React-controlled inputs; shadow DOM; navigation and popups; dynamic results; changed prices; stale references; lost extension connection; concurrent steering; stop during planning; stop during approval; ambiguous committed actions; CAPTCHA; malformed provider events; prompt injection in text and controls; microphone denial; silence; false interruptions; and audio playback teardown.

Use public-site read-only smoke tests alongside stable local fixtures. Public failures need classification—agent defect, website protection, network, auth, unsupported control—not one misleading aggregate. WAREX reports that introducing realistic disruptions reduces browser-agent success rates on existing benchmarks; it supports testing beyond ideal happy paths. [WAREX](https://arxiv.org/abs/2510.03285).

WebVoyager is a useful reference for real-site tasks and independent outcome evaluation. Its historical reported score is not a comparison to the current Nova build. Current claims of “best” would require a reproducible, adequately sized, paired comparison against current competitors. [WebVoyager paper](https://arxiv.org/abs/2401.13919).

Release sequence: local engineering preview → selected-site private pilot → repeated workflow reliability and latency evaluation → hosted identity/isolation/observability → reviewed browser-store distribution → mobile feasibility work. The `app` folder reserves the mobile phase. Native mobile control requires platform-specific permissions and integration; a website URL does not give an app control over other mobile apps.

The current repository is a functioning local implementation with live integration tests. It is not a claim of complete coverage for all websites, all accounts, all transaction types, or arbitrary mobile apps.
