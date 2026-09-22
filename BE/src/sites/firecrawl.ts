import type { SiteProfile } from '../../../shared/types';

// Dashboard controls and persisted outcomes still require live rehearsal.
// Orange sampled from the live dashboard; accessible shades use sitePalette.
export const firecrawlProfile: SiteProfile = {
  id: 'firecrawl',
  name: 'Firecrawl',
  domain: 'firecrawl.dev',
  url: 'https://firecrawl.dev/app/t/jMrRDaLBFKK',
  color: '#ee5829',
  description: 'Turn a web-data task into a configured run and an inspectable result.',
  builtIn: true,
  observations: 0,
  instructions: [
    'Operate Firecrawl through the observed dashboard controls. Stay in Personal Team, team jMrRDaLBFKK, on firecrawl.dev; verify the team before running jobs. Do not infer account scope from the URL alone.',
    'Firecrawl already has Agent and Interact products that research and act on target websites, and a support agent that diagnoses requests. Nova operates the Firecrawl dashboard. Do not describe Firecrawl as lacking execution agents or delegate the demonstration to its Agent or Support Agent.',
    'Observed navigation includes Scrape, Search, Interact, Crawl, Parse, Monitoring, Agent, Logs, Usage and Settings. Follow current visible navigation and labels; do not invent detail routes or assume documented API parameters have matching UI controls.',
    'Treat every source URL, crawl seed, output field and scope as user input. Never obtain task inputs from this profile or a prepared example. If the source, structured fields or crawl scope are missing, ask one concise grouped question or show the structured clarification card before configuration. Never ask again for information already supplied.',
    'When the requested source and output are clear, begin the authorized bounded job without an opening question. Read actual returned content; never populate, replace or assert outputs from expected data.',
    'The observed Scrape route is /app/t/jMrRDaLBFKK/playground?endpoint=scrape. Its source textbox is preceded by a separate https:// prefix and takes the hostname/path without that scheme; its placeholder rotates. Locate it by current context and inspect the displayed complete source. Navigate through visible controls where available; do not construct configuration query strings as an execution shortcut.',
    'The observed Format: Markdown button opens a multiselect. Selecting JSON adds it alongside Markdown and opens JSON options; it does not automatically replace Markdown. Preserve or deselect formats according to the request and inspect the resulting selection.',
    'JSON options contains a Prompt textarea, a Schema section with Schema and JSON buttons, and Save options. The visual schema initially has company_name and company_description fields with String type controls. Replace irrelevant defaults with only the user-requested fields and types; do not leave the company schema active. Identify repeated rows by their current field value and local context, not the repeated Field name label alone.',
    'Use the visual schema: its field rename and Number selection were exercised during preparation. Code-editor input was unreliable; do not use it for this demonstration. Build the extraction prompt and schema from exactly the fields the user supplied, without adding example or inferred fields. Enter short field values progressively, save options, then reopen once to verify prompt, fields and formats. Configuration may appear in the URL, but use semantic UI edits rather than replaying a full encoded query.',
    'For a bounded crawl, use only the user-supplied seed, format, page limit and discovery depth. Enter the source without the separate https:// prefix. Open the actual settings controls and verify the limit and depth before Start crawling. Keep external links, subdomains and entireWebsite disabled unless the user explicitly requests them. A limit is a maximum, not a guarantee of that many successful pages.',
    'Use existing credits for bounded authorized runs only. Do not enable recurring monitoring, auto-recharge, paid upgrades, webhooks, invitations, API-key changes or access changes as part of the example. Do not open or copy secrets.',
    'Wait for a terminal job outcome. Distinguish request success from each source page status. Check actual returned URLs, requested fields and available page status; report partial, missing or failed results honestly.',
    'Logs exposes request status, type, time and credits; its observed row action menu offers downloads, not a result detail page. Use Recent Runs in the playground to reopen saved results through the exact observed run link. Preparation confirmed a persisted scrape route under /app/t/jMrRDaLBFKK/playground/<run-id>; never invent its ID or reuse the preparation run as evidence of a new Nova action. Correlate the new run with its Logs entry and verify requested fields in its independently reopened result. A result shown before navigation alone does not prove persistence.',
    'On a saved Scrape result, the upper JSON and Markdown buttons with download icons download files and do not change the visible result. Do not click them to inspect output. Use the lower result tabs labelled Markdown and JSON; select the lower JSON tab and read the rendered structured object. If the lower JSON tab is already selected and the fields are visible, read them without clicking again.',
    'A revision may create a new immutable request; do not claim the old log was edited. Run only the requested revision and compare both actual job records. Stop repeated attempts after two failures or roughly five minutes and reassess the route.',
    'End with concise observed results and exact limitations. Do not mark a flow verified until live execution and independent reopening have succeeded.'
  ].join('\n'),
  flows: [
    {
      id: 'firecrawl-scrape', name: 'Configure a scrape',
      trigger: 'Scrape a page and inspect its saved result', verified: false,
      steps: [
        'Verify the active team, then open the observed Scrape playground.',
        'Set the exact public source in the contextual URL textbox and inspect its scheme; open Format: Markdown and select only the requested formats.',
        'If fields are unspecified, collect only the missing extraction requirements. In JSON options, edit Prompt and replace the default company schema using observed controls.',
        'Click Save options, then reopen once to check prompt, schema and selected formats before starting.',
        'Run once and inspect the actual completed output and source-page status.',
        'Reopen the exact new result through its observed Recent Runs link, and correlate status/time/credits with Logs. Revisions create separately identifiable runs.'
      ]
    },
    {
      id: 'firecrawl-crawl', name: 'Run a bounded crawl',
      trigger: 'Collect a small website sample and check every result', verified: false,
      steps: [
        'Open the observed Crawl playground in the same team.',
        'Set the user-supplied source, page limit and maximum discovery depth, leaving entireWebsite off unless it was explicitly requested.',
        'Inspect the saved limit, depth and Markdown selection before Start crawling; do not start an unbounded crawl.',
        'Wait for completion and inspect actual page URLs, count, content and any per-page failures.',
        'Reopen the exact new crawl through its observed Recent Runs link and verify its result count and page content independently; correlate its Logs entry.'
      ]
    }
  ]
};
