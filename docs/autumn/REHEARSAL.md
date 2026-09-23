# Autumn Nova rehearsal checklist

## Preflight

- [ ] Confirm `app.useautumn.com`, `/sandbox`, Sandbox banner and Mohit Chauhan's Org.
- [ ] Confirm only authorized synthetic customers exist before another
      auto-enabled plan. Stop for any real or ambiguous customer.
- [ ] Reserve `rehearsal-01`, then increment for later attempts.
- [ ] Search all three derived IDs. All must be absent. Any match consumes the
      suffix; increment rather than reusing or deleting it.
- [ ] Confirm Nova shows Autumn styling and two creation suggestions.

## Flow one: create catalog

- [ ] Nova creates Workflow Runs <Suffix> with its exact ID as Metered +
      Consumable. There is no separate feature reset.
- [ ] Nova reopens and verifies the exact feature.
- [ ] Nova creates Nova Sandbox Starter <Suffix>, Free, Auto-enable on, trial off
      and add-on disabled.
- [ ] Nova adds only the matching feature with Included quantity 2500 per month.
- [ ] Observe modal Save then page Save.
- [ ] Nova reopens the plan and verifies exact ID, settings and persisted allowance.

## Flow two: create customer

- [ ] Use the same suffix only after flow one succeeds.
- [ ] Nova creates Northstar Demo <Suffix>, derived ID and matching
      `northstar-demo-<suffix>@example.com` email.
- [ ] Nova reopens the exact customer, not merely the toast.
- [ ] Verify matching plan Active Free via Auto-enable; no manual attachment.
- [ ] Verify matching feature 2,500/2,500 left and record visible reset date.

## Failure and retention

- [ ] A partial/failed run consumes its suffix. Advance for the next attempt.
- [ ] Never delete earlier objects to recycle a suffix.
- [ ] Confirm no deploy, checkout, invoice, key, schedule, usage event, billing
      control, payment or real-customer action occurred.
- [ ] Keep both flows `verified:false` until successful Nova rehearsals reopen
      and verify every final object.
