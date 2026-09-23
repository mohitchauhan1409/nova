# Onyx private rehearsal scenario

## Purpose

Demonstrate that Nova can guide two useful Onyx workflows while keeping the evidence synthetic, the workspace scope narrow, and all outward-facing capabilities off.

## Scenario A — private source-grounded project

Create a private project named `Northstar Launch Review (Synthetic)` and add `tests/fixtures/onyx-synthetic-launch-brief.md` as its only file. In a new project chat, ask Onyx for a readiness summary of the milestone, open risks, owners, and next review. Inspect the visible source evidence, then ask where the next review will take place. A safe answer should distinguish facts present in the brief from the deliberately missing location.

Success means project access is private, the upload visibly completes, the response is grounded in the selected file, the gap is acknowledged, and the chat remains in the private project. The exact generated wording is not a success criterion.

## Scenario B — private support agent

Create a private agent named `Northstar Handbook Guide (Synthetic)` using `tests/fixtures/onyx-synthetic-support-handbook.md`. Its instructions should limit answers to the selected handbook, request visible source references, and require a clear “not in the handbook” response for missing policy. Leave actions, web search, external integrations, sharing, and publishing off.

Test one covered question about demo-workspace reset and one unsupported question about refunds. Success means the agent identity and private/capability state are visible, the covered answer uses handbook evidence, and the unsupported answer does not invent a policy.

## Stop conditions

Stop before proceeding if the account exposes unrelated organization data by default, the target is not `cloud.onyx.app`, a requested fixture is not visibly selected, privacy cannot be verified, an external action or connector is enabled, or a capability/visibility control is ambiguous.
