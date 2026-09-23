# Autumn synthetic baseline plan

The baseline is disposable Sandbox configuration. It contains no secret answer,
real person, payment method, API credential or production identifier.

## Preferred baseline

Prepare these exact records once, after confirming the Sandbox boundary:

1. Feature `Workflow Runs`, ID `workflow_runs`, representing a metered count.
2. Plan `Nova Sandbox Starter`, ID `nova_sandbox_starter`, type Free, with
   Workflow Runs included at **1,000 per month**.
3. Customer `Nova Rehearsal`, ID `nova-rehearsal-0923`, email
   `nova-rehearsal@example.com`, with no attached plans and zero/empty balances.

The signed-in Sandbox was initially empty. The catalog rehearsal first creates
the feature and coherent Free plan. The final catalog take may ask Nova to revise
only the included Workflow Runs value from 1,000 to 2,500 and verify the saved
object. This produces a meaningful, bounded change without enabling payment or
production. The customer take audits the existing synthetic customer or creates
it if absent. If the dashboard offers a direct, payment-free Sandbox attachment,
the take may explicitly attach only Nova Sandbox Starter and verify the balance.

## Idempotence

- Search exact IDs before creation.
- If all fields match, reuse the record.
- If the Free plan exists with 1,000 included, it is ready for the revision take.
- If it already has 2,500, either record a read-only verification take or create
  a newly suffixed synthetic plan only after the scenario owner approves it.
- Never delete or rename an unknown record to make the baseline fit.
- Never repair a baseline from a live route.

## Baseline receipt

Private run notes should contain timestamp, visible sandbox name, route, exact
record IDs, observed starting values and a statement that production, checkout,
invoices, API keys, real customers and billing sources were untouched. Do not
store cookies, tokens or private organization identifiers in this repository.
