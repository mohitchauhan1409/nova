# Polar research and current coverage

Status: signed-in research, live rehearsals and the final recording are complete.
See VALIDATION.md for measured coverage and practical limits.

Target: the existing signed-in Vector workspace at
https://polar.sh/dashboard/vectoros. Polar is the startup; Vector is the account.
The requested Chrome profile was verified through its profile menu. Its private
identifier is intentionally not embedded in source or documentation.

## Direct observations

Home exposed Products, Customers, Analytics, Sales, Finance and Settings. It
showed unfinished setup (1 of 7 required steps), no events, no payouts and zero
revenue, MRR, active subscriptions and orders for the displayed period. This is
not a sandbox assertion. Onboarding and account activation were not changed.

The dashboard uses white cards, a pale neutral sidebar and black primary pills.
The captured light surface's dominant pixels are #ffffff and approximately
#f5f4f7 (the capture is H.264, so exact source CSS cannot be inferred from pixels).
Nova uses #17171f for primary controls and a consistent pointer/label/ring. Its
launcher character is grayscale. Light/dark rendering has isolated fixture
verification. The final light-mode capture verifies the live cursor at action
targets. Dark-mode behavior on the actual signed-in site was not recorded.

## Product sources and candidate jobs

Polar positions usage measurement, subscriptions, seats and credits as its core
billing jobs. Preparing a connected usage configuration is therefore a stronger
candidate than a tour of navigation. Source:
[Polar](https://polar.sh/).

| Candidate | Business value and reasoning | Visible result to verify | Current limit |
| --- | --- | --- | --- |
| Usage meter | Translate event semantics into filters and an aggregation | Exact filter logic, numeric property and display unit reopened | Count baseline saved by operator; Sum creation and revision live-verified through Nova |
| Product and benefits | Connect pricing to the resources that define customer value | Saved price, interval, trial and exact relationships | Observed Public/Private purchasable save, no draft button; excluded from demo |
| Credits benefit | Connect an allowance to a meter | Saved units and exact referenced meter | Creation, linked meter and targeted revisions live-verified; no products or grants |
| Targeted offer | Scope a launch incentive without changing other plans | Exact product restriction, amount, duration and cap | Editor not inspected live |
| Home/account summary | Explain actual configuration versus business activity | Read current period and genuine values | Home inspected and opened by Nova in the final take |

Meter documentation describes selecting qualifying events and aggregating them.
Display units do not themselves change raw billing arithmetic. This makes unit
clarification a useful reasoning moment. Sources:
[Usage billing](https://polar.sh/docs/features/usage-based-billing/introduction),
[Meters](https://polar.sh/docs/features/usage-based-billing/meters).

Products can relate to reusable benefits, making an exact relationship check
essential. Descriptive plan copy alone is not an entitlement or an integration.
Sources: [Products](https://polar.sh/docs/features/products),
[Benefits](https://polar.sh/docs/features/benefits/introduction),
[License keys](https://polar.sh/docs/features/benefits/license-keys),
[Feature flags](https://polar.sh/docs/features/benefits/feature-flags).

Discounts have scope and duration decisions that must be checked independently of
their names. Source: [Discounts](https://polar.sh/docs/features/discounts).

## Observed forms and selected journeys

Products expands Catalogue, Checkout Links, Discounts, Benefits and Meters.
The product editor offers one-time or recurring pricing, multiple currencies,
base/seat/unit/metered prices, benefits, metadata and customer-portal visibility.
Public is the default; Private still permits purchase by direct checkout link.
No draft save was observed, so the demonstration avoids creating a purchasable
product. No onboarding, checkout, finance or customer-access action was submitted.

Meter creation combines Name/event, Timestamp or Metadata filters. Conditions
inside one group are ORed; separate groups are ANDed. A custom event can be
typed and selected even without ingested events. Count needs no property; Sum
reveals the numeric property field. Unit defaults to Scalar. A saved meter opens
its own detail page and can be reopened through Edit Meter.

Benefits are reusable configurations. Create Benefit offers Feature Flag,
Custom, File Downloads, License Keys, Meter Credits and external-access types.
Meter Credits requires a saved meter and number of units. Hidden is the default;
rollover is optional. The saved detail explicitly distinguishes no attached
products and no benefit grants. Update retains identity and closes the drawer.
A newly opened drawer can first display basic fields and hydrate meter controls
later; wait and inspect before treating expected controls as unavailable.

Selected: a short rollover revision as the opening, a filtered Sum meter, a
connected hidden credit allowance, a targeted allowance revision, and brief
saved-state/Home questions. These combine meaningful form reasoning, missing
data, a real dependency and conversational memory without enabling billing.

The baseline contains Workflow Executions (Count of successful
vector.workflow.completed) and Workflow Starter Credits (1,000 units linked to
that meter, Hidden, no rollover). Exact IDs and mutations are in the synthetic
manifest. The final take enables starter rollover; the manifest records its
current saved state. Zero revenue, usage and customer grants remain honest.

Grouped questions and partial-answer retention through Help me choose were
exercised through Nova. Initial runs exposed excessive form-control approvals
and staged drawer loading; those failures are preserved in validation. Multiple
successful critical-flow rehearsals and the capture preflight preceded the final
recording. The final trace contains no approval events.

### Benefits split view recovery

The Benefits route can automatically select the first saved resource and navigate
to its detail URL. This is still the Benefits split view: the left list and its
round plus button remain available beside the detail. Do not repeatedly follow
Benefits expecting an empty overview. The plus button next to the Benefits
heading opens Create Benefit. Search text can remain while navigation restores
the list, so a stale visible result is not evidence that it matches the query.
Use loaded exact record names; if the plus icon has no useful accessible name,
Nova can screenshot and inspect the visible button, then use its grounded ref.

### Longer meter editor verification

Three AND groups make the editor scroll. Repeated downward scrolling at its
lower bound added no information during recovery. The relevant controls were
already observed. After one scroll produces no change, use one screenshot of
the open editor (and a targeted scroll-to only if a requested section is outside
the view). Do not repeat equivalent scrolling. Visual verification confirmed the
exact saved property values without rewriting them. The recording uses the
shorter, business-relevant event/status configuration; the third environment
group is rehearsal variation only.
