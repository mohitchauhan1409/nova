# Inngest Local rehearsal checklist

## Environment

- [x] Fixture binds only to `127.0.0.1:3000` and Inngest Dev Server is local at `localhost:8288`.
- [x] Fresh in-memory Dev Server starts with no events or runs.
- [x] Fixture app `nova-inngest-local-demo` registers both synthetic functions.
- [x] Recording captures one Chrome tab and Nova panel with the system pointer hidden.
- [x] Production, credentials, integrations, deployment, and billing remain untouched.

## Release review

- [x] Exact event name, `synthetic: true`, and `final-release-01` are visible before confirmation.
- [x] Only one event is sent.
- [x] Exact `northstar-release-review` run opens in the attached tab.
- [x] Completed status, `validate-release`, and `compose-summary` are visible.
- [x] No rerun is performed.

## Risk review

- [x] Fresh conversation uses exact event name, `synthetic: true`, `mode: fail`, and `final-risk-01`.
- [x] Only one event is sent.
- [x] Exact `northstar-risk-check` run reaches Failed.
- [x] `validate-risk`, one retry, and `SYNTHETIC_RISK_REVIEW_FAILURE` are visible.
- [x] Nova labels the result intentional and does not rerun it.

## Delivery

- [x] Original inspected through contact sheets and final-frame checks.
- [x] Edited silent and click-only videos retain identical video streams.
- [x] Decoded click audio is silent outside cue windows and matches the established renderer.
- [x] Full test suite, typecheck, and recording-mode build pass.
