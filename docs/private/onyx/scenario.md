# Onyx no-model rehearsal scenario

## Current live boundary

Onboarding Step 2 shows no connected LLM provider and chat remains disabled. Connecting a model would require choosing a provider and supplying credentials, so it is outside this rehearsal. No chat, grounded-answer, citation, or conversation-starter result may be claimed.

Two baseline objects already exist and must be preserved: Agent `Northstar Handbook Guide (Synthetic)` (`agentId=1`) and Project `Northstar Launch Review (Synthetic)` (`projectId=1`). The Project’s synthetic launch brief was observed processing. Rehearsal and final recordings create distinct objects; they never delete, overwrite, or silently reuse these baselines.

## Scenario A — saved private Project

Create `Northstar Launch Review (Synthetic) [Nova Rehearsal 01]` for rehearsal or `Northstar Launch Review (Synthetic) [Nova Final 01]` for the final take. Keep it private and set instructions to use only the approved synthetic launch brief, with external knowledge, web access, actions, and unrelated workspace data prohibited.

After reviewing the final create boundary, upload exactly `tests/fixtures/onyx-synthetic-launch-brief.md`. Wait for visible completed processing. Return to Projects, reopen the new item, and verify its assigned ID, exact suffixed name, private state, instructions, filename, and completed processing state. Do not open chat.

## Scenario B — saved capability-disabled Agent

Create `Northstar Rehearsal Guide (Synthetic) [Nova Rehearsal 01]` for rehearsal or `Northstar Rehearsal Guide (Synthetic) [Nova Final 01]` for the final take.

Use this synthetic metadata:

- Description: `Private guide shell for the fictional Northstar rehearsal.`
- Instructions: `Stay within fictional Northstar rehearsal topics. Do not use external knowledge, browse the web, invoke actions, or claim access to facts that are not configured.`
- Conversation starter: `Review a fictional Northstar rehearsal question without external actions.`

Keep Knowledge empty because the live Agent form offers no direct file upload. Keep actions, web access, integrations, sharing, and featuring off. After review and save, return to the Agent list, reopen the new item, and verify its assigned ID, exact suffix, text fields, empty knowledge, privacy, and disabled capabilities. Do not start chat or test the starter.

## Stop conditions

Stop if the hostname is not exactly `cloud.onyx.app`, privacy is unclear, a suffix already exists, the approved file is not visibly selected, processing fails or never completes within the bounded wait, any capability cannot be confirmed off, or the next step would open model-provider setup, request credentials, connect knowledge, send chat, share/feature an object, or delete an earlier object.
