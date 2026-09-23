# Autumn provenance plan

## Public sources

Research is limited to first-party Autumn material:

- [Autumn cloud dashboard](https://app.useautumn.com) establishes the production
  cloud hostname.
- [Autumn open-source repository](https://github.com/useautumn/autumn) provides
  current dashboard routes and labels. The public source defines `/sandbox`,
  `/sandbox/:sandboxSlug`, `products`, `customers`, `analytics`, `Create Plan`,
  `Create Feature`, `Create Customer`, the Sandbox banner and Deploy to
  Production control. It also publishes Inter and the sandbox-blue environment
  token. Nova's final palette prioritizes the coordinator's current signed-in
  observation of dark navy/white surfaces with a blue Sandbox accent.
- [Autumn README](https://github.com/useautumn/autumn/blob/dev/README.md) describes
  subscriptions, credit systems, usage/overages, custom plans, and the core
  check/track/attach model.
- [Rebuilding onboarding for agents](https://www.useautumn.com/blog/rebuilding-onboarding-for-agents)
  documents the current plans/features/allowances workflow, sandbox-first setup,
  and the distinction between dashboard patch decisions and full catalog config.
- [Building an API for agents](https://www.useautumn.com/blog/building-an-api-for-agents)
  documents catalog preview/update and why side effects must be surfaced.

Source review date: 2026-09-23. Public source supports product vocabulary and UI
shape, not the state of the coordinator's private account.

## Bounded signed-in observation

On 2026-09-23 the coordinator inspected and populated only the Sandbox in Mohit
Chauhan's Org.
Products exposed Plans, Features and Rewards; Plans and Features began empty.
Create Plan exposed Plan Name, an automatically derived ID, and Free or Paid
choices. The coordinator created and reopened Workflow Runs (`workflow_runs`),
type Metered + Consumable, with no separate reset setting. They created and
reopened Free plan Nova Sandbox Starter (`nova_sandbox_starter`), whose defaults
were Auto-enable on, trial off and add-on disabled. Add Feature to Plan selected
Workflow Runs and configured Included quantity 2500 per month. Persistence
required modal Save followed by page Save; the reopened display read “2,500
Workflow Runs per month.”

The coordinator then created Northstar Demo Workspace (`northstar_demo`) with
`northstar-demo@example.com`. Auto-enable immediately produced Nova Sandbox
Starter, Active, Free, plus Workflow Runs 2,500/2,500 left, resetting 23 Oct
2026. No billing control, invoice, payment, production deployment, key, usage
event or real customer action occurred. This validates the connected records and
dashboard persistence, not Nova panel operation or a Nova-driven rehearsal.
The surface appeared dark navy/white with a blue accent.

## Recording provenance and reset

The reference objects above are not acceptable as the visible result of a
selected video. A selected recording must show Nova creating a new feature/plan
set and then a new customer using one explicit unused rehearsal/final suffix.
Exact-ID absence checks, creation controls, both plan saves and reopened final
states belong in the evidence. Any partial attempt consumes its suffix. Objects
are retained; the next attempt increments the suffix rather than deleting or
silently completing them off camera.

## Evidence classes

1. **Public product evidence** supports routes, labels, concepts and visual tokens.
2. **Local fixture evidence** supports Nova routing, isolation and guardrails only.
3. **Signed-in evidence** must be gathered by the coordinator and may support the
   exact private workspace state and actual form behavior.
4. **Recording evidence** may support only actions and final states visible in the
   final take. It must not be generalized into universal product coverage.

Never commit cookies, workspace identifiers, private customer data, API keys,
screenshots containing secrets, or copied dashboard payloads. Evidence notes may
name synthetic records and visible field labels only.
