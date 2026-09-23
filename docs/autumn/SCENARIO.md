# Autumn Nova scenario

Status: connected synthetic baseline created and reopened by the coordinator in
the signed-in Sandbox. Nova panel operation and rehearsals remain unverified, so
no profile workflow is marked verified.

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
| Semantics | Metered + Consumable; no separate feature reset setting |
| Plan | `Nova Sandbox Starter` (`nova_sandbox_starter`) |
| Plan type | Free |
| Plan behavior | Auto-enable on; trial off; add-on disabled |
| Allowance | `2,500 Workflow Runs per month` |
| Customer | `Northstar Demo Workspace` (`northstar_demo`) |
| Email | `northstar-demo@example.com` |
| Customer state | Starter Active Free; 2,500/2,500 left; resets 23 Oct 2026 |

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

The catalog flow is complete only after the exact saved plan is reopened and its
ID, Free type, behavior toggles and linked feature allowance are visible. Adding
the relationship requires Add Feature to Plan, Included quantity 2500 per month,
modal Save and then page Save. The customer flow is complete only after the exact
detail is reopened and identity, Active Free plan, balance and reset date are
visible. Auto-enable supplied the plan immediately; do not manually attach it.
A toast, URL change or list count alone is insufficient.
