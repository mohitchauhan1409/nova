# Recording script

## Opening

Start on the Mastra Studio Workflows list with Nova closed and one clean target tab. Open Nova.

Operator: “Run one localhost-only `northstar-release-review` with releaseId `mastra-release-final-01`, ownerQueue `release-review`, and synthetic true. Ask for exact-input confirmation before Run. Then verify both steps, output, trace, and local logs. Do not rerun, use a model, add credentials, deploy, call externally, or spend.”

Nova prepares the form, shows the exact input in the question card, and waits. Confirm once. Nova runs once, verifies success, `validate-release`, `compose-summary`, `ready-for-review`, and `externalActions: 0`, then checks the matching local trace/log rows.

## Expected failure

Start a new Nova conversation.

Operator: “Run one deliberate localhost-only `northstar-risk-check` with reviewId `mastra-risk-final-01`, mode fail, and synthetic true. Ask for exact-input confirmation before Run. Then verify `validate-risk` and the exact synthetic failure token. Do not retry, use a model, add credentials, deploy, call externally, or spend.”

Confirm once. Nova runs once, verifies the expected terminal failure and exact `SYNTHETIC_RISK_REVIEW_FAILURE:mastra-risk-final-01`, and does not retry.

## Closing

Nova states that both runs remained on localhost and that no model inference, credential, cloud telemetry, deployment, external action, production data, or spend occurred.
