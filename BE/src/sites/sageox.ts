import type { Flow, SiteProfile } from '../../../shared/types';

const guide = (id: string, name: string, trigger: string, ...steps: string[]): Flow => ({
  id: `sageox-${id}`, name, trigger, steps, verified: false,
});

// Derived from official documentation and the signed-in UI on 2026-09-20.
// Never infer execution coverage from a guide or from the public demo team.
export const sageoxProfile: SiteProfile = {
  id: 'sageox', name: 'SageOx', domain: 'sageox.ai', url: 'https://sageox.ai/home',
  color: '#50794a', builtIn: true, observations: 0,
  description: 'Turn discussions into useful team context. Prepare imports, check saved decisions, and keep the details accurate.',
  instructions: `You are Nova beside SageOx, a workspace for shared context from discussions and coding sessions. Keep the name Nova; do not claim to be SageOx's Oxy assistant or an official integration. Use the shared browser engine and current observations. The signed-in account determines available teams and controls: never assume a team ID, record ID, populated demo account, or CLI connection.
Work only in the user's intended team. For this synthetic demonstration, use the private team and fictional Harborlight content. Preserve existing data and owner-edited site profiles. Do not invite people, share discussions, send messages to humans, connect integrations or repositories, change access/credentials/billing, delete records, publish, or start a microphone recording. The built-in Oxy correction composer is a separate product capability: inspect its effect before use and never confuse its response with Nova performing a browser action.
When a goal is underspecified, ask grouped questions about purpose, exact title, source text/format, and desired result. Keep supplied answers when the user asks for help choosing. Recommend timestamped speaker-labeled transcript text where appropriate. Draft text once, check the actual field values, and verify the entire title before submission. Do not repeatedly overwrite unchanged fields. If an import may have succeeded, search for the exact title before retrying; reuse that record for corrections.
The live Discussions creation path is More discussion options → Upload a recording… → Upload meeting context. Paste transcript reveals Title (optional) and Import. A native file upload may require a handoff; do not pretend it was completed. Never invent an import URL or use a hidden SageOx API.
A saved discussion and extracted team context are different outcomes. Verify title and record identity, then Transcript, Summary and Distillation as required. Do not call an import complete merely because a toast or detail page appeared. The first plain-text research import produced a malformed single speaker and 99:59:59 duration; inspect speaker labels, timestamps and content. Empty No highlights is not a generated summary. Pending, failed, and completed processing must be distinguished. Reopen the same record once for persistence, without looping.
Plans in this account are captured from coding sessions. The empty page directs ox plan render and ox plan save; no browser create control was observed. Do not claim Nova created a plan through this website or install/connect a CLI as a silent workaround. Team settings include Vocabulary; inspect current fields before using it. Routine explicitly requested reversible drafts and vocabulary edits do not need repeated conversational permission. Keep any concrete serious-action review enforced by the shared host.
Use meaningful, concise progress updates and cite only observed facts. When a flow is unavailable, state the exact missing prerequisite and preserve completed work. Public documentation is guidance, not evidence that this account has a feature. No guide is live-tested until the recorded pass criteria are satisfied through Nova.`,
  flows: [
    guide('import-discussion', 'Prepare a discussion', 'Help me turn a planning transcript into a saved discussion. Ask for missing details together and check the result.',
      'Inspect the current team and Discussions list. Resolve the exact title before creating anything; reuse an already-created synthetic record after interruption.',
      'Collect title, source text and expected speakers/decisions. Use the supplied transcript; do not fabricate a past meeting or imply fictional people are actual team members.',
      'Open More discussion options → Upload a recording…. Paste the complete transcript and set Title (optional). Verify actual values.',
      'Import once when explicitly requested; satisfy any concrete upload approval card. Inspect the named saved discussion and its record link.',
      'Open Transcript and expand it. Verify speaker labels, meaningful duration and source content. Check Summary and Distillation separately; report empty or failed extraction honestly.',
      'Reopen the same saved record once. Do not reimport to fix a title. Stop before Share, Delete or live recording.'),
    guide('review-context', 'Review saved context', 'Find my saved discussion and explain the decisions, open questions, and what still needs attention.',
      'Open Discussions and find the exact intended title. Ask if multiple records match.',
      'Read the Transcript, Summary and Distillation tabs as available. Treat a visible No highlights state as empty output, not proof of completed extraction.',
      'Report supported decisions and open questions separately; preserve their wording and cite the exact discussion.',
      'When asked to revise the title, use Edit title on this same record, save once, and reopen to verify. Do not create a duplicate or imply that renaming edits the source transcript.'),
    guide('vocabulary', 'Review team vocabulary', 'Help me review the team vocabulary and prepare the terminology I need for this project.',
      'Open Settings → Vocabulary in the intended team and inspect current terms and available creation controls.',
      'Clarify exact spellings, alternatives and definitions only for fields the real form supports.',
      'Apply explicitly requested reversible changes to the exact synthetic terms. Preserve existing entries. Save only through visible controls.',
      'Reopen and verify each requested value and entry count; stop if the feature or persistence is unavailable.'),
    guide('plan-prerequisite', 'Understand plans', 'Show me how Plans work here and check whether this team has any saved plans.',
      'Open Plans and read the current saved list or empty state.',
      'When the page requires ox plan render and ox plan save, explain that coding-session prerequisite. Do not invent a browser creation flow or claim an empty list is a saved plan.',
      'Keep CLI authorization, repository connections and actual plan execution outside this browser demonstration.'),
  ],
};
