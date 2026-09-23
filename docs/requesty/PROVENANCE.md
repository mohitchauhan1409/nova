# Provenance and evidence plan

## Product claims allowed before rehearsal

Only Requesty-controlled public sources support the initial vocabulary:

- [Requesty routing](https://www.requesty.ai/product/routing) describes named policies, ordered failover, weighted load balancing, latency routing, scoping, and regional gateways.
- [Requesty gateway](https://www.requesty.ai/gateway) describes real-time observability, usage governance, and automatic failover.
- [Requesty spend management](https://www.requesty.ai/product/spend-management) describes budgets, alerts, attribution, and scoped ceilings.
- [Requesty pricing](https://www.requesty.ai/pricing) lists routing policies, fallbacks, spend limits, budget caps, and advanced observability among product capabilities.

These sources do not prove the controls, routes, entitlements, or data present in the recording account. Copy exact UI labels only after observing them.

## Account evidence handed off for preparation

On 2026-09-23 the separate live-session owner reported a signed-in Overview with a zero balance and zero requests. The observed navigation was Overview, Analytics, Leaderboard, Logs, Model Library, Model Analytics, MCP Gateway, Playground, Prompts, API Keys, Routing Policies, BYOK, and Settings. No native Requesty assistant was present. This handoff is enough to avoid proposing an assistant-chat workflow, but it is not independent evidence that an unsaved policy or budget draft exists. Re-observe all volatile values and controls before recording; do not create a paid request merely to populate Logs.

## Live evidence ledger to collect

Record a timestamped, secret-free note for each item:

| Evidence | Required observation | Permitted conclusion |
| --- | --- | --- |
| Account context | Visible organization/workspace/environment | Nova operated in the named visible context |
| Routing surface | Visible navigation and policy form labels | Those controls existed in this account at rehearsal time |
| Draft state | Populated values and untouched persistence control | A complete unsaved proposal was prepared |
| Request record | ID, filters/date range, visible detail fields | Those exact fields were observed for the designated synthetic request |
| Attempt evidence | Provider/attempt trail, if present | Fallback occurred only if the trail directly shows it |
| Spend scope | Visible hierarchy, period, units, current limit | The proposal was framed against the observed scope |
| Budget draft | Populated values and untouched persistence control | A complete unsaved budget proposal was prepared |

## Capture hygiene

- Crop or blur account email, keys, authorization headers, prompt bodies, and unrelated request content.
- Do not record API key or provider credential pages.
- Use the date range visible in the shot; do not normalize or reinterpret currency.
- Keep original capture, edit manifest, and final render hashes separate from source control if they contain account data.
- Every voiceover claim must map to a frame range or an official source above. Product marketing claims should not be recited as measured account results.
