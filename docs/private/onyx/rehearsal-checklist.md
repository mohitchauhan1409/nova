# Onyx no-model rehearsal checklist

## Before account access

- [ ] Build/test the Onyx branch; restart its services and reload its extension build.
- [ ] Confirm `onyx-synthetic-launch-brief.md` is the sole approved upload.
- [ ] Prepare a clean recording window with unrelated account content hidden.
- [ ] Confirm baseline Agent `agentId=1` and Project `projectId=1` will not be edited or deleted.
- [ ] Choose the exact unused rehearsal/final suffix from the baseline plan.

## Account boundary

- [ ] Hostname is exactly `cloud.onyx.app`.
- [ ] Nova shows the updated Project and capability-disabled Agent suggestions.
- [ ] Onboarding Step 2 shows no connected model and chat is unavailable.
- [ ] No provider connection or credential form is opened.

## Project flow

- [ ] New Project name contains the exact take-specific suffix.
- [ ] Instructions restrict scope to the synthetic brief and prohibit external knowledge/actions.
- [ ] Access is visibly private before creation.
- [ ] Name, instructions, and privacy are reviewed at the approval boundary.
- [ ] Exactly `onyx-synthetic-launch-brief.md` is uploaded.
- [ ] Processing visibly reaches completed state within the bounded wait.
- [ ] Newly assigned Project ID, suffix, privacy, instructions, filename, and completion persist after reopening from Projects.
- [ ] Chat, model setup, sharing, actions, and deletion remain untouched.

## Agent flow

- [ ] New Agent name contains the exact take-specific suffix.
- [ ] Approved synthetic description, instructions, and conversation starter are entered.
- [ ] Knowledge remains empty; no connector or document set is selected.
- [ ] Actions, web access, integrations, sharing, and featuring are visibly off.
- [ ] All fields and disabled capabilities are reviewed at the approval boundary.
- [ ] Newly assigned Agent ID, suffix, fields, empty Knowledge, privacy, and disabled capabilities persist after reopening from the Agent list.
- [ ] Chat/starter testing, model setup, sharing/featuring, and deletion remain untouched.

## After recording

- [ ] Review every frame for credentials, account identifiers, and unrelated content.
- [ ] Confirm no provider, model, connector, action, share, feature, or chat was activated.
- [ ] Make no grounded-answer, citation, or chat-quality claim.
- [ ] Keep raw recordings and account-specific secrets out of Git.
