# Autumn synthetic baseline plan

The baseline is disposable Sandbox configuration. It contains no secret answer,
real person, payment method, API credential or production identifier.

## Preferred baseline

These exact records are now prepared in the approved Sandbox:

1. Feature `Workflow Runs`, ID `workflow_runs`, Metered + Consumable. There is no
   separate reset setting on the feature.
2. Plan `Nova Sandbox Starter`, ID `nova_sandbox_starter`, type Free,
   Auto-enable on, trial off, add-on disabled, with **2,500 Workflow Runs per
   month**. The relationship was persisted with modal Save and then page Save.
3. Customer `Northstar Demo Workspace`, ID `northstar_demo`, email
   `northstar-demo@example.com`. Auto-enable immediately applied Nova Sandbox
   Starter as Active and Free, with Workflow Runs 2,500/2,500 left and a visible
   reset date of 23 Oct 2026.

The signed-in Sandbox began empty and the coordinator created and reopened the
connected baseline. A Nova rehearsal should now audit these exact objects instead
of creating duplicates. A future scenario owner may authorize one targeted
allowance revision, but it must account for the plan's auto-enable relationship
to the synthetic customer, complete both saves, and verify both plan and customer
state. The default recording draft is read-only.

## Idempotence

- Search exact IDs before creation.
- If all fields match, reuse the record.
- Treat 2,500 per month as the connected baseline and prefer read-only verification.
- Do not create a suffixed plan or customer merely to manufacture a mutation.
- Auto-enable means a newly created Sandbox customer may receive the Free plan
  immediately; explain and verify that side effect before creating any new one.
- Never delete or rename an unknown record to make the baseline fit.
- Never repair a baseline from a live route.

## Baseline receipt

Private run notes should contain timestamp, visible sandbox name, route, exact
record IDs, observed starting values and a statement that production, checkout,
invoices, API keys, real customers and billing sources were untouched. Do not
store cookies, tokens or private organization identifiers in this repository.
