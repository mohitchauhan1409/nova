# Onyx synthetic baseline plan

## Inputs

The committed fixtures are the sole baseline inputs:

- `tests/fixtures/onyx-synthetic-launch-brief.md`
- `tests/fixtures/onyx-synthetic-support-handbook.md`

Both describe the fictional Northstar rehearsal. They contain no real people, customers, credentials, production URLs, or company data.

## Baseline assertions

For the launch brief, evaluate whether the response identifies the document’s milestone category, open-risk structure, named ownership, and next-review concept. Do not compare exact prose. The location follow-up must be treated as unsupported because the fixture intentionally omits it.

For the support handbook, evaluate whether the covered response uses the stated reset path, synthetic-data boundary, and approval requirement. The refund question must be treated as unsupported because the fixture intentionally excludes refund policy.

The baseline requires no connector credentials, action credentials, external data source, or organization content. If the current Agent form cannot accept a direct file upload or private knowledge resource, stop and record that UI prerequisite; do not substitute a connector or browse existing workspace data.

## Reset strategy

Start the first take in a new private project and project chat. For project or agent takes, use a visibly synthetic, take-specific suffix only if the product does not permit clean reuse. Do not delete prior objects merely to make the recording tidy; deletion is a separate consequential action. If duplicate projects or agents would create account clutter, stop and ask the account owner to choose reuse or cleanup.

## Drift handling

UI labels, layouts, model outputs, and indexing durations may change. Rehearsal checks should locate controls by their current accessible names and verify visible end state. Never update the fixtures to match a hallucinated answer, and never hardcode future generated text as test evidence.
