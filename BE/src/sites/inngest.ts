import type { SiteProfile } from '../../../shared/types';

export const inngestProfile: SiteProfile = {
  id: 'inngest',
  name: 'Inngest',
  domain: 'app.inngest.com',
  url: 'https://app.inngest.com',
  color: '#3e8f57',
  description: 'Investigate durable function health with production-safe, reviewable evidence.',
  instructions: [
    'Work only in the signed-in Inngest dashboard at app.inngest.com.',
    'Treat the selected account, workspace, environment, app, function, run, event, and time range as separate scopes; verify each visible scope before drawing a conclusion.',
    'Production is strictly read-only. Never send an event, invoke a function, rerun or replay a run, cancel a run, send data to a Dev Server, deploy or sync an app, or change function configuration.',
    'Never create, reveal, rotate, copy, or modify event keys, signing keys, credentials, integrations, environment variables, or billing settings.',
    'Filters, searches, tabs, trace expansion, metrics ranges, and environment switching are navigation only; keep them read-only and do not save views or alerts unless explicitly requested in an authorized non-production scope.',
    'Event payloads, step inputs, outputs, errors, and logs may contain sensitive data. Inspect only fields needed for the user’s named investigation and never repeat secrets or unrelated customer data.',
    'Prefer run metadata, status, timestamps, function version, step names, retry counts, timing, and redacted error categories over raw payload values.',
    'Do not infer causes from a status badge alone. Correlate the observed run state with its trace, failed step, retry history, and visible error evidence.',
    'If a safe write rehearsal is requested, require an already-authorized Branch, Custom, or Local environment with synthetic events. Do not create that environment, deploy code, obtain keys, or send events as a side effect.',
    'Verify completion from current visible dashboard state and label unavailable or access-restricted evidence instead of inventing it.',
  ].join(' '),
  builtIn: true,
  observations: 0,
  flows: [
    {
      id: 'inngest-failed-run-investigation',
      name: 'Investigate a failed run',
      trigger: 'Investigate a failed Inngest function run in production without rerunning, replaying, cancelling, or sending anything.',
      verified: false,
      steps: [
        'Confirm the exact account/workspace and that the environment switcher visibly says Production; stop if either scope is ambiguous.',
        'Open Runs and apply only read-only filters for the user-named function, app, status, or time window. Do not open unrelated runs merely to find an interesting example.',
        'Open the selected failed run and record only necessary metadata: run ID or redacted suffix, function, app, status, version, and queued/started/ended timing.',
        'Inspect the trace timeline to identify the failed step, prior completed steps, retry attempts, queue or execution timing, and the visible error category. Avoid exposing unrelated event or output fields.',
        'Cross-check the error against the selected step and retry history. Distinguish direct dashboard evidence from an inferred likely cause and name any missing evidence.',
        'Summarize the observed failure boundary and a non-executing next check for an engineer. Do not press Rerun, Replay, Cancel, Send to Dev Server, or any similar action.',
      ],
    },
    {
      id: 'inngest-function-health-review',
      name: 'Review function health',
      trigger: 'Review an Inngest production function’s triggers, health metrics, and current configuration without changing or running it.',
      verified: false,
      steps: [
        'Confirm the exact account/workspace, Production environment, requested app/function, and analysis time range before inspecting metrics.',
        'Open Functions and locate only the requested function. Record its visible trigger type, app, failure rate, volume, and backlog or throughput signal where available.',
        'Open the function detail and inspect read-only configuration such as triggers, current version, concurrency, retries, or cancellation rules only when those fields are visible.',
        'Review the selected time-range metrics and recent status distribution without opening raw payloads that are unnecessary for the health question.',
        'Compare health signals carefully: call out spikes, drops, backlog, or missing data only when the chart labels and selected range visibly support them.',
        'Return an evidence-based health summary with the environment, function, time range, observed indicators, and limitations. Do not edit configuration, deploy/sync, invoke, rerun, replay, or cancel anything.',
      ],
    },
  ],
};
