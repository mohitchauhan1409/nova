# AgentMail recorded script

This is the actual successful second take, session `0cd61961-28fb-4947-9139-4ae96d103475`. Build identities, per-turn latency and output links are in [README.md](README.md); historical attempts remain in [live-verification.md](live-verification.md).

Baseline: normal Overview, fresh Nova launch with panel closed; one target tab. Existing inbox `easyservice502@agentmail.to` is Cedar & Finch Support with String metadata team=Customer Care, purpose=General customer questions and response_target=2 business days. Exactly two drafts exist. The CF-1048 draft has To `orders@customer.example`, Subject `Your oak desk order update`, and unfinished body `Order CF-1048 — oak desk. Dispatch update awaiting review. Cedar & Finch Care.` The CF-1042 handoff is the unchanged reference.

1. Open the Nova launcher, then type:

   > Rename Cedar & Finch Support to Cedar & Finch Care, please.

   Nova saved and reopened the same inbox without an opening card, using eight verified steps.

2. Type:

   > Use Furniture order support as the purpose, and help me choose a response target.

   The actual card was **Choose a response target**, offering **4 business hours**, **1 business day**, and **2 business days**, with an explanation that this is descriptive metadata and does not enforce timing. Click **Help me choose**. That control submitted:

   > Help me choose: explain the remaining questions in plain language. Keep my original task and the details I already provided.

   The revised card asked **How quickly should the team aim to respond?**, retained the same choices, explained business hours/days, and recommended 1 business day as a balanced default. Select **1 business day**, then Continue. Nova saved and reopened the supplied purpose and chosen target, preserving team and address.

3. Type:

   > Complete our oak-desk draft with the revised dispatch details.

   Nova opened the existing draft once. The actual **Revised dispatch details** card asked only **What are the revised dispatch details?** Enter exactly:

   > Order CF-1048: oak desk; revised dispatch October 2, 2026; tracking will be shared once dispatched. Warm and concise, signed Cedar & Finch Care. Preserve recipient and subject. Keep unscheduled and unsent.

   Continue. Nova completed, closed to save, and reopened the same draft with recipient and subject preserved.

4. Type:

   > Change dispatch to October 5, 2026. Save and reopen the draft to verify, keeping everything else unchanged.

   Nova saved and reopened October 5 while preserving the other facts and fields.

5. Type:

   > What did you set up, and what is still unsent?

   Nova summarized the saved care inbox, purpose, response target and unsent/unscheduled revised draft.

6. Type:

   > Open the order-update draft so I can review it.

   The exact draft was already open. Nova correctly confirmed that state without another click. End on the visible October 5 draft and a readable pause.

The actual source has no Send, Schedule, new-draft creation or deletion. Every operator typing sequence and Nova execution is preserved at 1×. Card text and exact actual responses are retained in [final-session-timing.json](evidence/final-session-timing.json); future model phrasing may vary. Source motion, final-source mask measurements and receipt-backed effects govern the export, not hypothetical expected UI timings.
