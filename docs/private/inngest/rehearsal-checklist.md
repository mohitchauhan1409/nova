# Inngest rehearsal checklist

## Before account access

- [ ] Build and test the Inngest branch; restart its local backend/frontend and reload its extension build.
- [ ] Confirm recording captures only the intended browser window and Nova panel.
- [ ] Hide bookmarks, notifications, unrelated tabs, account identifiers, and sidebar content outside scope.
- [ ] Obtain the exact authorized workspace, environment, app/function, run or time window from the owner.
- [ ] Confirm the task is read-only and no production action is requested.

## Scope and identity

- [ ] Address bar hostname is exactly `app.inngest.com`.
- [ ] Nova shows Inngest identity and the two expected read-only suggestions.
- [ ] Workspace/account is correct without recording its sensitive identifier.
- [ ] Environment switcher visibly shows Production.
- [ ] Named function/run belongs to the requested app and scope.

## Failed-run flow

- [ ] Runs filters are read-only and match the named status/function/app/time scope.
- [ ] Selected run metadata and timestamps are visible.
- [ ] Trace identifies the failed step and earlier completed steps.
- [ ] Retry count/timing and redacted error category are visible.
- [ ] Unnecessary event, input, output, and customer fields stay closed or redacted.
- [ ] Summary separates observed evidence from inferred cause.
- [ ] Rerun, Replay, Cancel, and Send to Dev Server are not pressed.

## Function-health flow

- [ ] Functions page is still in Production.
- [ ] Requested function’s trigger, app, failure rate, and volume are visible where available.
- [ ] Time range is visible and included in the summary.
- [ ] Backlog/throughput and recent status distribution are read only.
- [ ] Version and configuration are reported only when visible.
- [ ] No edit, deploy, sync, invoke, event-send, key, integration, or billing control is used.

## After recording

- [ ] Review all frames for payload data, secrets, account identifiers, and unrelated runs.
- [ ] Verify no new run, event, cancellation, deployment, key, integration, or saved configuration resulted.
- [ ] Note unavailable fields and UI-label drift without converting assumptions into evidence.
- [ ] Keep screenshots, recordings, keys, raw payloads, and account-specific notes out of Git.
