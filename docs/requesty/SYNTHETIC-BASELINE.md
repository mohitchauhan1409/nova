# Synthetic baseline plan

This plan defines placeholders, not future dashboard answers. Replace bracketed values only with operator-supplied choices or visible account options during rehearsal.

## Flow A: routing draft

- Task-owned policy name: `nova-demo-ticket-fallback-[short-date]`
- Workload: synthetic ticket triage
- Strategy: ordered failover, if the account visibly offers it
- Primary: `[operator-selected visible model]`
- Fallback: `[different operator-selected visible model]`
- Scope: `[visible non-production or demonstration scope]`
- Region/provider constraint: `[explicit operator choice or none]`
- Persistence: never; stop before Save/Create/Enable
- Execution: never; do not issue a model request

Baseline assertions:

- Name does not collide with an existing task-owned policy.
- Primary and fallback are not silently chosen by Nova.
- Order is visible and read back exactly.
- Any region restriction is reported as configuration, not verified inference residency.

## Flow B: request review and budget proposal

- Request: `[existing task-owned synthetic request ID]`
- Time range: preserve `[visible selected range]`
- Expected safe fields: only those visible, potentially status, model/policy, provider, latency, tokens, cost, and attempts
- Spend scope: `[visible synthetic/non-production scope]`
- Period: `[visible account option]`
- Proposed cap: `[operator-supplied amount and visible currency/unit]`
- Alert: `[operator-supplied threshold and observed behavior]`
- Persistence: never; stop before Save/Apply

Eligibility note: the 2026-09-23 account handoff reported zero requests and a zero balance. Flow B must not be rehearsed against a fabricated or newly paid request. It becomes eligible only if the operator later supplies a pre-existing task-owned synthetic request; otherwise record the honest empty Logs state and omit request-detail assertions.

Baseline assertions:

- The request body is synthetic or remains redacted.
- A status code or final success does not become a fallback claim.
- Missing cost, attempt, or token fields are reported as unavailable.
- The proposed cap is not described as active.

## Cleanup expectation

The baseline creates no server-side object, so cleanup should be unnecessary. If discovery reveals that opening a form creates a draft automatically, stop and revise the scenario before recording; do not delete anything without separate authorization and verified ownership.
