# Firecrawl — bookstore ingestion QA

Status: **prepared, not rehearsed or recording-ready**. All registered flows remain `verified: false`. No job has been run by this worker. Coordinator owns Chrome, live Nova, builds and recording.

## Eligibility and scope

Coordinator reports that the live Support Agent explicitly said it cannot control the browser, click dashboard links or open pages. Keep this candidate under the user's criterion of operating the startup's own dashboard. Firecrawl's native Agent and Interact remain real execution agents for target websites; the demonstration must acknowledge this distinction. The earlier research hold in `preparation.md` is superseded by this coordinator decision, not by a claim that Firecrawl only has a docs bot.

Coordinator verified hostname `firecrawl.dev`, Personal Team `jMrRDaLBFKK`, the requested Chrome profile and an initial 1,025 credits. Scrape, bounded Crawl and their saved results below are observed through manual preparation. The scoped theme now uses the sampled live palette. Home opening, rendered theme/cursor preflight and Nova rehearsals remain pending.

## Observed Scrape controls

Coordinator live evidence: `/app/t/jMrRDaLBFKK/playground?endpoint=scrape` has a source textbox preceded by a separate `https://` prefix. Enter `books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html` in the textbox, without that prefix. Its placeholder changes, so it is not a stable locator.

`Format: Markdown` opens a multiselect. Selecting `JSON` adds it alongside Markdown and opens JSON options. The modal exposes a `Prompt` textarea, a `Schema` section with `Schema` and `JSON` controls, and `Save options`. Default visual rows are `company_name` and `company_description`, both String. Renaming them to `title` and `price_gbp` and selecting Number for the latter worked in live preparation. Use this visual route; code-editor paste was unreliable. Adding a third row still needs rehearsal.

Implementation consequence: selecting JSON or typing an extraction prompt alone is insufficient. Replace the default company schema through the visual fields. Inspect repeated rows by current field value and local context. Save, reopen once and verify the settings. The app encodes schema/formats in its URL; never substitute a full encoded query macro for visible configuration. During capture all authored values remain progressively entered.

## Manual preparation receipt — not a Nova rehearsal

The prompt `Extract the book title, GBP price and available stock.` with `title` String and `price_gbp` Number returned `A Light in the Attic` and `51.77`; accompanying Markdown showed 22 available. Recent Runs reopens the persisted result at [the preparation run](https://firecrawl.dev/app/t/jMrRDaLBFKK/playground/Xwlb98Sew9EPPgLbPjZA3). Logs showed `/SCRAPE`, COMPLETED, 5 credits, September 22 at 08:19. Its action menu offered downloads; use Recent Runs for result reopening. This receipt must not be portrayed as Nova execution, and that run must not substitute for a newly requested run in the video.

Coordinator also verified a crawl of root `books.toscrape.com`, page limit **2**, maximum discovery depth **1**, **entireWebsite off**, Markdown. It returned Success and two results, `All products` and `Political Suicide`, persisted at [the preparation crawl](https://firecrawl.dev/app/t/jMrRDaLBFKK/playground/01a0c708-09b3-72c8-a2fc-a5991ef3ad60). An earlier poetry-category crawl returned one page because of its subtree scope; use the catalog root without enabling entireWebsite. Future runs may return different discovered pages, so verify actual URLs/content and never require this exact second title.

## Observed theme

The coordinator supplied an actual screenshot at the private batch path `private/firecrawl-theme.png`. Pixel sampling found the dominant app canvas `#f9f9f9`, white cards, neutral `#efefef` surfaces, `#262626` text and dominant button-region orange `#ee5829` within its gradient. The screenshot visually shows a system sans-serif UI; no exact font-family claim is made.

Panel CSS is scoped to `.np-app[data-site="firecrawl.dev"]`. The launcher applies only to the exact observed hostname, uses neutral surfaces/orange character shading and establishes the orange palette before backend readiness. Shared `sitePalette` derives a darker accessible orange for text, selected cards and the single-color Nova action cursor. Nova's launch control sits 104px from the right edge to avoid the existing native Support Agent bubble. This is a presentation change only; cursor behavior and action lifecycle remain shared. The coordinator still needs to inspect the rendered panel, launcher, selected card and real action cursor in preflight.

## Business story and source

A fictional bookstore data team needs a small ingestion sample before building a larger catalog pipeline. Nova configures and runs the dashboard jobs, checks their saved evidence and revises extraction requirements. Books to Scrape is explicitly a scraping sandbox, so its randomly assigned prices are not represented as commercial information.

Source: [A Light in the Attic](https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html). The source currently exposes the title, price £51.77 and stock count 22. These are comparison expectations only; actual Firecrawl outputs must come from the live service. Do not inject these values or encode them in an extraction prompt.

## Candidate script

Exact wording may change after the first live pass. Every authored field must be entered progressively during capture.

1. Opening from Home, Nova closed: **“Scrape A Light in the Attic from Books to Scrape as Markdown.”** Nova has the exact source in the profile and should act immediately, show the content and reopen the new saved run. This is a useful first result without a clarification card.
2. **“Now make it a structured catalog record.”** This genuinely leaves the desired fields unspecified. Suggested concise card: “Which fields should the catalog record contain?” Options: “Title and GBP price”; “Title and description”; custom answer. Select the first. The card is generated by Nova from missing information, not fabricated or forced when the fields were already supplied.
3. Nova opens the Format multiselect, selects JSON, enters **“Extract the book title, GBP price and available stock.”** in Prompt and renames the two company fields to `title` (String) and `price_gbp` (Number). Keep accompanying Markdown for source comparison. Save options, reopen once to inspect, run and reopen the saved result through Recent Runs. The reference schema file documents the two fields; it is not a code-editor input instruction. Available stock in Markdown does not mean that field exists in structured output yet.
4. Connected flow: **“Crawl a two-page Markdown sample of this bookstore and check the saved results.”** Nova uses root `books.toscrape.com`, limit 2, discovery depth 1 and entireWebsite off. It inspects these settings before Start crawling, checks completion and reopens the new Recent Runs result. It then inspects actual source URLs/content and correlates Logs. The seed may count as one page, as in preparation.
5. Revision: **“Add stock count to the structured record and run it again.”** Nova adds `stock_count` Number through the actual add-row control, runs once, reopens the distinct new saved result and checks the new field. This creates a new request rather than editing old history.
6. Useful closing task: **“Open the revised scrape from Recent Runs.”** Then **“Which job was the two-page crawl?”** Nova answers from observed records, distinguishing request count from successful page count.

Keep authored text short: every planned prompt, URL and schema field is far below the 1,000-character paced-entry cap. Do not enter a serialized schema or configuration URL. If the third schema row is blocked, revise the second field from `price_gbp` to `stock_count` through the already observed two-row route and describe the resulting two-field schema accurately. If Crawl has no usable cap, do not run its default. A Parse replacement needs separate observed upload controls and a prepared synthetic document; it is not assumed available.

## Live receipts required before recording

The coordinator should collect just these bounded observations:

- Normal Home URL and populated opening; rendered panel, launcher, selected card and action-cursor review using the now implemented sampled theme.
- Scrape add-row behavior for the stock revision and Nova's saved-options reopening. Source, multiselect, Prompt, visual rename/type controls, successful extraction and saved result route are already observed; do not repeat unchanged discovery.
- Nova control of Crawl settings: root source, page limit 2, discovery depth 1, entireWebsite off and Markdown. These settings and successful saved output were manually verified; each Nova pass must verify its own configuration and result.
- Independently reopen each new Nova run using its observed Recent Runs link and correlate it with Logs; the Logs action menu only exposed downloads.

For each critical flow, record two successful Nova passes, including alternate wording or the stock revision. After each, navigate away and reopen the exact saved run independently. A successful request toast does not satisfy persistence. Record actual IDs, URLs, request settings, output checks, credits shown and timestamps in the private synthetic-object manifest. Do not delete unrelated logs or infer ownership from similar URLs.

The initial run plan is three single-page requests (Markdown, JSON and JSON revision) plus one crawl capped at 2 pages per full take. Rehearsals should reuse the same source and settings and avoid full-script duplication. Exact credit consumption is a live receipt, not an asserted fixed total.

## Public support, not UI verification

[Scrape docs](https://docs.firecrawl.dev/features/scrape) document Markdown and JSON, with prompt or schema configuration; request success and source-page HTTP status are distinct. [Crawl docs](https://docs.firecrawl.dev/features/crawl) document explicit limits and domain/path controls, and describe retained history/results in Activity Logs. [Dashboard docs](https://docs.firecrawl.dev/dashboard) identify the playground and request history. These capabilities still require verification in the current dashboard.

## Handoff

Local files: `BE/src/sites/firecrawl.ts`, registry, scoped panel/launcher presentation, this scenario and fixtures. No engine changes, build, extension reload, active backend or recorder operation. The coordinator must verify Home, run Nova rehearsals with independent saved-result checks, freeze the build, pass the combined capture/export preflight including the theme and only then record. The existing shared video pipeline remains the delivery path.
