# Private Requesty demonstration scenario

## Goal

Show Nova helping a user who is lost in a large gateway catalog create two connected, reversible synthetic objects without spending credits or running inference.

## Flow A — resilient synthetic route

Nova inspects Custom Routing Policies, starts a new policy, and helps choose exact visible model rows for a synthetic support-triage workload. The user may accept or revise the recommendation. After a concrete creation confirmation, Nova saves a uniquely named `nova-demo-` Fallback policy, reopens it, and verifies the ordered primary and fallback routes plus provider and attempt settings.

## Flow B — reusable triage prompt

In the same account, Nova creates a uniquely named `nova-demo-` Prompt with a synthetic-only system message that returns a small JSON triage schema and prohibits external action. If the new policy is available in the optional Model search, Nova selects it; otherwise it leaves Model optional and states the limitation. After confirmation, Nova saves and reopens the prompt to verify the persisted name, message role/content, optional route, tags, and default parameters.

## Hard boundaries

- No inference, Playground run, API key, BYOK credential, billing, top-up, auto top-up, invitation, support message, or external communication.
- No edits or deletion of unrelated records.
- Every persistent change uses a task-owned synthetic name and a concrete action confirmation.
- A configured fallback is never described as observed failover traffic.

## Acceptance evidence

- Hostname is `app.requesty.ai` and Nova uses the Requesty theme.
- Custom Routing Policies renders and the saved policy is reopened from Custom.
- Exact provider rows and route order are visible; no similarly named flex, Azure, or regional variant is substituted.
- The saved Prompt is reopened and its message is visible.
- Overview remains at zero requests and zero tokens after both flows.
