# Onyx synthetic baseline plan

## Approved input

The sole upload fixture is `tests/fixtures/onyx-synthetic-launch-brief.md`. It is entirely synthetic and contains no credentials, production URLs, customers, or real company data. The removed support-handbook fixture is not part of the Agent flow because the live Agent form has no direct upload control and Knowledge must remain off.

## Existing baselines

- Project `Northstar Launch Review (Synthetic)`, `projectId=1`; the approved launch brief was uploaded and observed processing.
- Agent `Northstar Handbook Guide (Synthetic)`, `agentId=1`.

Preserve both. They are not Nova rehearsal evidence, must not be renamed or deleted, and must not be silently reused for final recording.

## Take-specific names

- Rehearsal Project: `Northstar Launch Review (Synthetic) [Nova Rehearsal 01]`
- Final Project: `Northstar Launch Review (Synthetic) [Nova Final 01]`
- Rehearsal Agent: `Northstar Rehearsal Guide (Synthetic) [Nova Rehearsal 01]`
- Final Agent: `Northstar Rehearsal Guide (Synthetic) [Nova Final 01]`

Increment the numeric suffix if an exact name already exists. Never clean up duplicates during recording; deletion is a separate consequential action.

## Assertions

Project success is limited to persisted object evidence: new assigned ID, exact name, private state, narrow instructions, sole approved filename, and visible completed processing after reopen.

Agent success is limited to persisted configuration evidence: new assigned ID, exact name, description, instructions, conversation starter, empty Knowledge, private state, and all external capabilities off after reopen.

No connected model means there is no answer baseline. Do not send chat, test the conversation starter, evaluate grounding, expect citations, or connect a provider. Processing completion is not an answer-quality result.
