# Interfaze scenario acceptance review

Review scope: scenario/profile/customization against the original brief. No UI operation, run, build or code change. Live outcome/recording acceptance remains pending.

## Concrete changes made

1. Replaced the temperature-only opener with an actual single model test. The first revision (“I'm stuck. Classify CD-104: the mug arrived cracked.”) failed live: Nova asked for categories and escalation policy before any action. The current self-contained opener is “Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word.” It supplies labels and output format and explicitly requests execution, not classifier configuration. It must produce a real useful result and a matching request-log check without an initial question card. Setting temperature alone is technically an action but too thin for the requested founder-facing opening. Temperature zero moves into the larger configuration workflow; it does not guarantee correctness.
2. Strengthened flow two into policy/schema revision plus a boundary audit. Run a nine-day delay and an exactly-seven-day delay; under “over seven days,” expected escalation is true and false respectively. These expectations are fixtures, never claimed outcomes. Inspect both actual request records. This gives the second workflow a meaningful verification objective beyond repeating the first workflow with another prompt.
3. Reduced clarification to real missing business choices: category taxonomy and desired output fields. “Short summary” already answers style, so a separate summary-style question was redundant. No technical JSON schema syntax question is needed. If the user has supplied all choices, proceed without manufacturing a card.
4. Added explicit baseline and raw-media preservation notes to scenario.json. Preserve the eligibility transcript and request IDs; do not reset unrelated chat. Do not prebuild the triage schema and imply Nova created it on camera. Keep the true raw recording unchanged and derive final copies separately.

## Remaining acceptance conditions

- Flow one is actual configuration plus a test: system prompt, two required schema rows, requested numeric setting and independently verified request output. Flow two is a retained-policy/schema change and two-case regression audit. A pair of ordinary chat prompts without these UI changes and saved-log checks would not satisfy two substantial workflows.
- Short JSON must remain readable in Logs (observed truncation near 500 characters). Navigate to each exact observed request ID and inspect actual input/output/status. A success status alone cannot establish the classification or boundary result.
- Playground model tests use synthetic order messages and existing access/quota; no recipients, purchases, account/security changes, API secrets or human-support submissions are involved. If quota blocks the run, report the dependency; do not buy more or substitute fabricated/API-only results.
- The website model's response is evidence of its observed output only. Nova must perform the configuration and normal dashboard navigation itself. No model response can be treated as proof it modified its own settings.
- The current profile supports both revised workflows without code changes. Both guides remain unverified until two successful live passes per critical flow. The final take must include the genuine card interaction, progressive typing, a meaningful scroll, visible themed Nova cursor and hidden physical pointer.
- Raw/silent/click-only media, exact sound/cue alignment, independent decoded QA, build SHA and remotely recovered media checksums remain coordinator-owned gates. No media or remote verification was completed by this review.

Authoritative candidate wording and field values are in scenario.json. Earlier invoice and temperature-opener notes in preparation.md are historical discovery, superseded by this review.
