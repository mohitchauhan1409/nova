# Autumn Nova scenario

Status: the coordinator created and reopened a connected reference baseline in
the signed-in Sandbox. Nova rehearsals remain unverified. Selected videos must
create distinct take-specific objects rather than merely reading baseline.

## Story

In flow one, Nova turns an explicit take suffix into a new Metered + Consumable
feature and a new Free auto-enabled plan, connects them with 2,500 included per
month, completes both saves and reopens the plan. In flow two, Nova uses the same
suffix to create a new example.com customer; Auto-enable supplies the new Free
plan, and Nova reopens the customer to verify the entitlement and balance.

The connected reference records remain prerequisites and form evidence only:

| Object | Reference value |
| --- | --- |
| Feature | `Workflow Runs` (`workflow_runs`), Metered + Consumable |
| Plan | `Nova Sandbox Starter` (`nova_sandbox_starter`), Free |
| Plan behavior | Auto-enable on; trial off; add-on disabled |
| Allowance | `2,500 Workflow Runs per month` |
| Customer | `Northstar Demo Workspace` (`northstar_demo`) |
| Customer state | Starter Active Free; 2,500/2,500 left; reset 23 Oct 2026 |

## Take-specific naming contract

Choose one unused suffix before each flow pair. Rehearsals use `rehearsal-01`,
`rehearsal-02`, and so on. Finals use `final-01`, `final-02`, and so on. For
`final-01`, the explicit objects are Workflow Runs Final 01
(`workflow_runs_final_01`), Nova Sandbox Starter Final 01
(`nova_sandbox_starter_final_01`), and Northstar Demo Final 01
(`northstar_demo_final_01`, `northstar-demo-final-01@example.com`).

Search all exact IDs before mutation. If any is present, the suffix is consumed:
stop and reserve the next number. Never reuse, overwrite, rename or delete a
prior take. These inputs are explicit recording data, not hidden answers.

## Hard boundary and completion

Every mutation requires `app.useautumn.com`, a `/sandbox` route, visible Sandbox
banner and Mohit Chauhan's Org. Never deploy, handle keys, connect billing,
checkout, invoice, schedule, track usage, change billing controls or use real
customer data.

Flow one ends after the take-specific plan is reopened and shows its ID, Free,
Auto-enable on, trial off, add-on disabled and 2,500 of its matching feature per
month. The feature is Metered + Consumable with no separate reset. Adding it
requires modal Save then page Save. Flow two ends after the take-specific
customer is reopened and shows the matching plan Active Free and matching
feature 2,500/2,500 left with a visible reset date. Do not attach manually.
