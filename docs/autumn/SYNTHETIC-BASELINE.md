# Autumn synthetic baseline and take reset plan

All records are disposable Sandbox data. No deletion cleanup is authorized.

## Connected reference baseline

The coordinator created Workflow Runs (`workflow_runs`), Metered + Consumable;
Nova Sandbox Starter (`nova_sandbox_starter`), Free, Auto-enable on, trial off,
add-on disabled and 2,500 included monthly; and Northstar Demo Workspace
(`northstar_demo`, `northstar-demo@example.com`). The customer immediately showed
the plan Active Free and 2,500/2,500 left, resetting 23 Oct 2026. This validates
dashboard shape, not work Nova performed on camera.

## Per-take object set

Each rehearsal/final pair creates a unique set. `rehearsal-01` maps to
`workflow_runs_rehearsal_01`, `nova_sandbox_starter_rehearsal_01`,
`northstar_demo_rehearsal_01` and `northstar-demo-rehearsal-01@example.com`.
`final-01` uses the equivalent `final_01` IDs and
`northstar-demo-final-01@example.com`. Display names title-case the suffix.
Every plan includes 2,500 of its matching feature per month and stays Free with
Auto-enable on, trial off and add-on disabled.

## Reset strategy

Reset means advance the suffix, not delete or modify old objects.

1. Search feature, plan and customer exact IDs before a run.
2. If all are absent, reserve the suffix in private notes.
3. If any exists, mark the suffix consumed and increment its two-digit number.
4. A partial failure consumes its suffix; never finish it later and imply one run.
5. Flow two uses the same suffix whose feature/plan flow succeeded.
6. Record the visible reset date; it is time-dependent.

Auto-enabled take plans may appear on earlier synthetic customers. Before plan
creation, confirm every visible customer is authorized synthetic data. Stop if a
real or ambiguous customer exists.
