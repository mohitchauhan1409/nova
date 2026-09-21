# Creem recording script and pass criteria

Scenario: Vector-Os is preparing subscription plans for an AI workspace in Creem Test mode. Existing sandbox products, offers and one simulated paid subscription make Home useful. No production launch, billing configuration, real message or entitlement integration is part of this demonstration.

## Final take

1. Fresh launch from Nova dashboard, normal Creem Home, Nova closed, no debugging bar. Open the floating Ask Nova button.
2. User: “I’m a little lost setting up our next team plan. Can you help me?”
3. Grouped answers: product **Vector Teams**; description **An AI workspace for growing teams. Includes 15 seats, unlimited projects, 35,000 monthly AI credits, and priority support.**; price **99**; currency **USD**. Leave interval and trial unanswered and choose **Help me choose**.
4. Nova must retain those four answers, explain monthly/yearly and trial choices, and ask only remaining decisions. Choose **Monthly** and **14-day free trial**, then Continue.
5. Pass: exactly one saved Vector Teams, USD99/month, free14-day trial, supplied description, recovery emails and automatic affiliate enrollment off. Reopen exact record.
6. User: “Actually, give teams 21 days to try it. Keep everything else the same.” Pass: edit the same product ID to21 days, retain price and description.
7. User: “Now create a launch offer for that plan only: 20% off once, code TEAMSTART20, name Teams Welcome, 50 uses, no expiry.” Pass: saved discount, exact product link,20% once,0/50, no expiry; no duplicate or external dispatch.
8. User: “What will the first paid invoice be before tax?” Expected: $79.20 after the21-day free trial, then regular99/month; note tax separately. This is arithmetic from the configured offer, not a live invoice.
9. User: “Does that change Starter or Pro?” Expected: no, discount targets only Teams; ordinary plans unchanged.
10. User: “Show me Home and summarize the current activity.” Expected: read actual current period and sandbox totals, distinguish Test mode. End after the complete answer with a short readable hold.

Type progressively at roughly8 characters/second (one character per CUA input call plus90ms pacing), with no additional typing acceleration. Chat and grouped cards only. Let Nova perform all website work. Keep normal execution speed. Only prolonged operator idle gaps may be compressed.

Latest user direction supersedes the original cursor-free brief: show only Nova’s
lavender action cursor (arrow, label and ring); hide the system/operator pointer.
Build with both NOVA_RECORDING_MODE=true and NOVA_RECORDING_SHOW_ACTION_CURSOR=true.
Close every other browser tab before the final capture begins.

## Rehearsals

First underspecified prompt: “I’m a little lost setting up our team plan. Can you help me create a new subscription in Test mode?” Partial card: Vector Business, full20-seat description,129/USD; Help me choose; Monthly;14-day free trial. Targeted revision21 days. Connected Team Launch / TEAMS20,20% once,50 cap,no expiry. Saved IDs are in the synthetic manifest.

Second full brief: “Create a monthly subscription in Test mode called Vector Studio: $79 USD, a 7-day free trial, and this description: A shared AI workspace for small teams. Includes 10 seats, unlimited projects, 25,000 monthly AI credits, and priority support.” Saved/reopened. Revision: “Check Vector Studio, change its free trial to 14 days, and keep the $79 monthly price and description.” Connected offer: “Create STUDIO15 for that plan only: 15% off once, internal name Studio Launch, 25 uses, no expiry.” Reopened exact product relationship. Read-only Home report interrupted with Stop and resumed with “Continue.”

Do not restart creation if an exact record exists. Inspect and reuse it. Do not delete or recreate an immutable discount. Any failed save or ambiguous identity blocks a completion claim. Safe confirmation during early rehearsal was recorded honestly; final guidance distinguishes catalog records from purchases while preserving sensitive-action boundaries.
