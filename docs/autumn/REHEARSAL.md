# Autumn signed-in rehearsal checklist

Run this only in the coordinator's approved browser. Preparation code did not
open or mutate a private account.

## Before mutation

- [ ] Confirm hostname is exactly `app.useautumn.com`.
- [ ] Confirm the path starts with `/sandbox` (including a named sandbox path).
- [ ] Confirm the visible Sandbox banner and selected organization is exactly
      Mohit Chauhan's Org.
- [ ] Confirm Nova shows Autumn styling and only the first two guided suggestions.
- [ ] Open Products and verify the currently visible tab labels and creation
      labels. Record wording differences without forcing the old path.
- [ ] Search exact IDs `workflow_runs`, `nova_sandbox_starter`, and
      `northstar_demo`; reuse the connected baseline rather than creating copies.
- [ ] Confirm no real email, customer, payment method or billing source is needed.

## Catalog rehearsal

- [ ] Start from `/sandbox/products`; verify Plans and Features can be reached.
- [ ] Reopen Workflow Runs and verify ID, Metered + Consumable, and that the
      feature itself has no separate reset setting.
- [ ] Reopen Nova Sandbox Starter and verify Free, Auto-enable on, trial off and
      add-on disabled.
- [ ] Verify the persisted plan display reads 2,500 Workflow Runs per month.
- [ ] If a rehearsal edits the allowance, use modal Save and then page Save,
      reopen the plan and verify the persisted display.
- [ ] Confirm there was no Deploy to Production action, checkout, invoice,
      credential access, usage event or live-route navigation.

## Customer rehearsal

- [ ] Start from `/sandbox/customers` and search the exact synthetic ID first.
- [ ] Reopen Northstar Demo Workspace and verify ID `northstar_demo` and
      `northstar-demo@example.com`.
- [ ] Verify Nova Sandbox Starter is Active and Free without manually attaching
      it; Auto-enable has already applied it.
- [ ] Verify Workflow Runs reads 2,500/2,500 left and resets 23 Oct 2026.
- [ ] Do not attach any plan or open schedule, checkout, invoice, usage or
      billing-control actions.

## Recovery and cleanup

- [ ] One unchanged wait or scroll triggers inspection, not repetition.
- [ ] If the route or banner loses Sandbox identity, stop immediately.
- [ ] If an exact synthetic baseline already exists but differs, record the
      mismatch; do not overwrite until the scenario owner chooses reuse/revision.
- [ ] Keep synthetic records for the final take when authorized. Do not delete
      anything as part of rehearsal or recording.
- [ ] Mark a profile flow verified only after a successful signed-in run with
      exact reopened-state evidence.
