# AgentMail synthetic object manifest

All business content here is synthetic. These objects are real saved console resources, not production customer activity. Their existence and fields were reported by the coordinator on 2026-09-21. Do not send or schedule any draft.

| Object | Identity | Baseline | Intended recording change | Cleanup scope |
| --- | --- | --- | --- | --- |
| Support inbox | `easyservice502@agentmail.to` | Display Name: Cedar & Finch Support; String metadata team=Customer Care | Rename Cedar & Finch Care; add purpose and response_target after clarification | Preserve address and unrelated keys; only restore task-owned name/metadata if rehearsals require reset |
| Reference draft | Subject `Care handoff — order CF-1042`, recipient `orders@customer.example`, in the support inbox | Unsent care question/Customer Care review; exact body/ID to be recorded by coordinator if needed | None | Preserve as baseline; do not send, revise or delete |
| Order-update draft | Planned subject `Your oak desk order update`, recipient `orders@customer.example`, order CF-1048 | Not created by preparation worker | Create unscheduled; revise dispatch October 2, 2026 -> October 5, 2026 | Reuse exact task-owned saved draft across revisions; coordinator records ID after creation and resets only this task object |

The reserved `.example` recipient is non-deliverable. The AgentMail-hosted inbox is a real new inbox in the authorized account. No recipient lists, secrets, production webhook endpoints, fake inbox history or fabricated analytics are included. Do not remove unrelated resources based only on similar display names.
