# AgentMail synthetic object manifest

All business content here is synthetic. These objects are real saved console resources, not production customer activity. Their existence and fields were reported by the coordinator on 2026-09-21. Do not send or schedule any draft.

| Object | Identity | Baseline | Intended recording change | Cleanup scope |
| --- | --- | --- | --- | --- |
| Support inbox | `easyservice502@agentmail.to` | Display Name manually reset to Cedar & Finch Support; String team=Customer Care, purpose=General customer questions, response_target=2 business days | Rename Cedar & Finch Care; revise existing purpose and response_target after clarification | Preserve address and unrelated keys; only restore task-owned name/metadata if rehearsals require reset |
| Reference draft | Subject `Care handoff — order CF-1042`, recipient `orders@customer.example`, in the support inbox | Unsent care question/Customer Care review; exact body/ID to be recorded by coordinator if needed | None | Preserve as baseline; do not send, revise or delete |
| Order-update draft | Saved subject `Your oak desk order update`, recipient `orders@customer.example`, order CF-1048 | Created once by Nova; reset body: `Order CF-1048 — oak desk. Dispatch update awaiting review. Cedar & Finch Care.`; unsent/unscheduled | Complete this existing draft with October 2, 2026 dispatch details, then revise to October 5, 2026 | Reuse exact task-owned draft; retain the existing To/Subject and CF-1042 reference. Two saved drafts total; do not create a third |

The reserved `.example` recipient is non-deliverable. The AgentMail-hosted inbox is a real new inbox in the authorized account. No recipient lists, secrets, production webhook endpoints, fake inbox history or fabricated analytics are included. Do not remove unrelated resources based only on similar display names.

Record identity for the final take is the tuple of inbox address, exact subject, reserved recipient and order CF-1048; a draft UUID has not been recorded in this document. Verify that tuple and the two-draft count before editing. Baseline resets are operator preparation, not Nova success. See [live-verification.md](live-verification.md) for rehearsals, failures and evidence limits.
