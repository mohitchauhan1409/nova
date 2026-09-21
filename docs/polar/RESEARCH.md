# Polar research and current coverage

Status: preliminary research and local implementation. Live workflow selection is
blocked by the Computer connection; no Polar creation flow is marked verified.

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
launcher character is grayscale. Light-mode rendering has isolated verification;
actual dark-mode behavior and live cursor behavior remain unverified.

## Product sources and candidate jobs

Polar positions usage measurement, subscriptions, seats and credits as its core
billing jobs. Preparing a connected usage configuration is therefore a stronger
candidate than a tour of navigation. Source:
[Polar](https://polar.sh/).

| Candidate | Business value and reasoning | Visible result to verify | Current limit |
| --- | --- | --- | --- |
| Usage meter | Translate event semantics into filters and an aggregation | Exact filter logic, numeric property and display unit reopened | Editor not inspected live |
| Product and benefits | Connect pricing to the resources that define customer value | Saved price, interval, trial and exact relationships | Save/publication boundary not inspected |
| Credits benefit | Connect an allowance to a meter | Saved units and exact referenced meter | Editor and creation boundary not inspected |
| Targeted offer | Scope a launch incentive without changing other plans | Exact product restriction, amount, duration and cap | Editor not inspected live |
| Home/account summary | Explain actual configuration versus business activity | Read current period and genuine values | Home inspected; Nova execution pending |

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

## Required next research

Restore Computer access, then inspect the actual creation forms, dependencies,
validation and save boundaries. Do not decide a final script from documentation
alone. Exercise two safe connected flows end to end and reopen their results.
Prefer unattached resources and reversible configurations; do not turn on
payments, ingest events, create transactions or publish to an audience.

Before recording, populate a small coherent baseline using only verified safe
flows, then run each selected critical flow twice through Nova. The candidate
script is deliberately not a claim that those flows work today.
