# Inngest Local synthetic scenario

## Purpose

Demonstrate two substantial Nova-controlled workflows in an isolated Inngest Local Dev Server. All functions, events, IDs, and failures are synthetic and stay on `localhost`; Production remains untouched.

## Scenario A — successful release review

Nova opens Events and prepares exactly:

```json
{"name":"nova/release.review.requested","data":{"synthetic":true,"releaseId":"final-release-01"}}
```

After the operator reviews and confirms the concrete event send, Nova sends it once, opens only the resulting `northstar-release-review` run, and verifies the completed `validate-release` and `compose-summary` steps. It does not rerun the function.

## Scenario B — intentional risk failure

In a fresh conversation, Nova prepares exactly:

```json
{"name":"nova/risk.review.requested","data":{"synthetic":true,"mode":"fail","reviewId":"final-risk-01"}}
```

After confirmation, Nova sends it once, waits for `northstar-risk-check`, and verifies the expected failed `validate-risk` step, its one retry, and `SYNTHETIC_RISK_REVIEW_FAILURE`. It diagnoses the result as an intentional fixture outcome and does not rerun it.

## Safety boundary

The fixture binds to `127.0.0.1`, contains no credentials or customer data, and performs no outbound work. Nova never opens Production, creates keys, deploys, changes billing, uses integrations, reruns a function, or sends a non-synthetic event.
