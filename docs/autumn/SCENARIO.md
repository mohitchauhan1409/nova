# Autumn Nova scenario

Status: preparation only. No signed-in Autumn account was opened while authoring
this branch, and no workflow is marked live-verified.

## Story

Nova helps a founder translate a simple usage-pricing idea into visible Autumn
Sandbox configuration, then verifies the exact object rather than treating a
toast as success. A second journey creates a clearly synthetic sandbox customer
and audits its empty starting state. The demonstration is useful because it
connects plans, feature allowances and customer state while keeping payments,
production, credentials and real identities out of scope.

The canonical synthetic catalog is:

| Object | Value |
| --- | --- |
| Feature | `Workflow Runs` (`workflow_runs`) |
| Semantics | Metered quantity, 2,500 included per month |
| Plan | `Nova Sandbox Starter` (`nova_sandbox_starter`) |
| Plan type | Free |
| Customer | `Nova Rehearsal` (`nova-rehearsal-0923`) |
| Email | `nova-rehearsal@example.com` |

These values are demonstration inputs, not hidden expected answers. Signed-in
research found the approved Sandbox empty, with Plans, Features and Rewards
tabs. If the
signed-in sandbox already contains an exact ID, reuse it and verify its fields;
do not create a duplicate or delete unrelated data.

## Hard boundary

Every modifying action requires both an `app.useautumn.com/sandbox/...` URL and
the visible Sandbox banner. Do not click Deploy to Production, enter or reveal
an API key, connect a billing source, attach a paid plan, generate checkout,
send an invoice, create a schedule, track usage, change billing controls or use
real customer information. No production action is part of a successful take.

## Completion evidence

The catalog flow is complete only after the exact saved plan is reopened and the
plan ID, price, interval, linked feature, included quantity and reset are visible.
The customer flow is complete only after the exact customer detail is reopened
and identity plus current plans/balances are visible. If the UI safely supports
direct attachment of the synthetic Free plan without checkout, invoice or any
payment path, the requested rehearsal may attach it and verify the resulting
feature balance. A toast, URL change or list count alone is insufficient.
