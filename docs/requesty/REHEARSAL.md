# Rehearsal checklist

## Before opening the account

- [ ] Build the branch and reload its unpacked extension.
- [ ] Confirm local data uses `sites.requesty.json`.
- [ ] Use a fresh Nova conversation and enable no live keys in Nova.
- [ ] Prepare non-secret synthetic names and a designated synthetic request ID; do not fabricate dashboard data.
- [ ] Confirm the operator understands that Save/Create/Apply/Enable and test-run controls are out of scope.
- [ ] Start with a clean screen recording area; hide notifications and unrelated tabs.

## Read-only discovery pass

- [ ] Confirm the hostname exactly and record the visible organization/workspace/environment.
- [ ] Identify actual navigation labels for policies, request logs/analytics, and spend controls.
- [ ] Confirm whether a new-policy form can remain unsaved without creating a server object.
- [ ] Confirm which routing strategies and fields the account actually exposes.
- [ ] Confirm a task-owned synthetic request exists and note safe visible fields.
- [ ] Confirm whether request attempts/fallbacks are explicitly shown; absence means no fallback claim.
- [ ] Confirm spend scope, period, currency/units, alert fields, and whether an unsaved draft is possible.
- [ ] Treat the reported zero balance and zero requests as a stop condition for inference; never manufacture a log entry.
- [ ] Leave every surface unchanged and verify no persistence receipt appears.

## Guided-flow rehearsal

- [ ] Start the fallback prompt and verify Nova does not ask for already visible or supplied facts.
- [ ] Verify Nova avoids existing production policy edits and uses the synthetic prefix.
- [ ] Verify Nova stops before the persistence control and reads back every field.
- [ ] Start the log/budget prompt with the designated request.
- [ ] Verify Nova preserves filters/date range and reports only actual fields.
- [ ] Verify Nova does not expose prompt bodies or secret-looking content.
- [ ] Verify Nova distinguishes final success from proven fallback attempts.
- [ ] Verify Nova stops before applying the budget and states its unsaved status.
- [ ] Verify no inference request, credit use, support action, or credential interaction occurred.

## Abort conditions

Abort the affected flow if the account requires persistence to continue, no safe synthetic request exists, a secret appears, the selected context is ambiguous, the UI routes into billing/credentials, or Nova repeats an unchanged action. Report the limitation instead of broadening scope.

At preparation time there is no evidence of a true sandbox or server-side draft state. An ordinary unsubmitted browser form is acceptable only if read-only discovery proves it creates no object. Otherwise, keep the flow at the written-plan level.
