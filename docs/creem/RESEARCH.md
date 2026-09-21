# Creem research and demonstration scope

2026-09-21. Sources: signed-in Creem 2.0 dashboard and official documentation:
- https://www.creem.io/
- https://docs.creem.io/getting-started/test-mode
- https://docs.creem.io/features/discounts
- https://docs.creem.io/features/trials
- https://docs.creem.io/features/usage-based-billing

Creem is a merchant-of-record platform for software and digital products. This signed-in store is empty in live mode and has incomplete business onboarding. All task work uses the isolated Test mode. The actual UI has charcoal surfaces, subtle gray borders, lavender primary controls and a peach test-environment banner.

## Candidate journeys

| Journey | Value and dependencies | Status |
| --- | --- | --- |
| Complete subscription configuration | Commercial pricing, interval and trial decisions; saved product feeds the second flow | Selected; operator baseline and first Nova creation verified |
| Product-specific discount | Requires exact saved product; amount, duration, cap and expiry decisions | Selected; operator WELCOME15 saved; Nova verification pending |
| Trial revision | Proves context retention and changing the same saved object | Selected; in rehearsal |
| Home / catalog questions | Natural closing tasks; must reflect actual sandbox values | Inspected |
| Sandbox checkout activity | Required to populate real customer, payment and MRR widgets | Attempt stalled at Processing; no payment/customer claimed |
| Metered billing | Potential richer catalog dependency; requires usage unit and pricing knowledge | Documentation only; dashboard inspection pending |
| Customer creation/import | Dashboard has no create/import control; test customers originate from checkouts | Inspected |
| Affiliates, revenue splits, business verification | External recipients or consequential account changes | Excluded |

## UI findings

Product creation has editable name, Markdown description, payment type, USD price, billing interval and optional free/paid trial. A private delivery note is another Description/Note pair. Save returns to the catalog, whose data loads asynchronously. Product details show exact ID, price and trial; Edit handles targeted revisions. Do not repeat New product while routing is in progress.

Discount creation is a modal with percentage/fixed options, name, uppercase alphanumeric code (14 characters maximum), required product selection, optional expiry and redemption cap, and optional recurring behavior. Once saved, discount codes cannot be edited. The UI explicitly says delete and recreate, so the demonstration's revision belongs on the product instead. No silent deletion/recreation.

Customer list explains that test customers appear after test checkout. The opened checkout explicitly states no real payment is taken and no card is charged. A synthetic reserved-domain email was used; the checkout remained at Processing after Continue to payment. No actual card was entered.

## Coverage discipline

`verified:false` remains on built-in guides until the selected Nova rehearsals succeed. Operator setup is not Nova execution evidence. Fixture rendering proves layout only. No production orders, real customers, fabricated metrics, or historical revenue will be represented as genuine.
