# Requesty provenance and evidence plan

## Product sources

- Requesty's routing documentation defines named policies, ordered failover, load balancing, latency routing, and provider routes.
- The signed-in Custom surface verifies the current Create policy form, exact model catalog rows, provider/region/context/price fields, ordered route cards, attempts, and persistence control.
- The signed-in Prompts surface verifies the current New Prompt form, message roles/editors, tags, optional model search, parameters, response format, and persistence control.

Public documentation supplies vocabulary only. Current account state and saved results must be observed in the dashboard.

## Live evidence ledger

| Evidence | Required observation |
| --- | --- |
| Account boundary | Overview balance, requests, tokens, and hostname |
| Name isolation | Custom/Prompts lists checked before each unique name |
| Model identity | Exact selected row plus provider, region, context, and displayed price |
| Policy persistence | Reopened Custom policy with saved strategy and order |
| Prompt persistence | Reopened Prompt with saved name, role, message, optional route, and defaults |
| No execution | Closing Overview still shows zero requests and zero tokens |

## Observed rehearsal evidence — 2026-09-24

- Exact OpenAI Global `gpt-5.6-luna` row: 1.1M context, `$0.200/M` input, `$1.20/M` output.
- Exact OpenAI Global `gpt-5.4-mini` row: 400K context, `$0.750/M` input, `$4.50/M` output.
- Two fallback-policy passes and two prompt passes were created under unique `nova-demo-` names and independently reopened.
- The complete script-order run persisted `nova-demo-triage-fallback-script1` and `nova-demo-triage-prompt-script1`; the latter contains the revised `owner_queue` schema, Model unset, and model defaults.
- Closing Overview visibly reported zero requests and zero tokens for the month, with `$0.00` spend and `$0.00` balance.

## Accepted final evidence — 2026-09-24

- `nova-demo-triage-fallback-final-01` persisted the exact OpenAI Global order `gpt-5.6-luna` then `gpt-5.4-mini`, one attempt each.
- `nova-demo-triage-prompt-final-01` persisted the revised `owner_queue` SYSTEM message; the optional Model search did not expose the new policy, so Model remained unset rather than being inferred.
- The final Overview again showed zero requests, zero tokens, `$0.00` spend, and `$0.00` balance.
- Source capture anchor: first encoded frame epoch `1790194193125`; the authenticated session retained 36 successful click receipts (10 operator, 26 Nova), mapped to source frames and visually checked before audio rendering.
- The original capture is immutable. The one-segment EDL keeps every source frame at real speed, and the silent/click exports share encoded video-stream SHA-256 `d5694c30f9f8bd47bbffae02cb21fb3f0eef3ee2e42e3db852c891c8c8308c26`.

## Capture hygiene

Do not open API Keys, BYOK, billing portals, referral links, raw request bodies, or unrelated objects. Ordinary account label and product content may remain in this private recording. Every saved-state claim must map to a reopened dashboard object; every click sound must map to a recorded action receipt or inspected frame transition.
