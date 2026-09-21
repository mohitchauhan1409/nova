import type { SiteProfile } from '../../../shared/types';

// Guides describe observed product forms. The shared agent still observes and
// reasons over the live page; these are not executable macros or API shortcuts.
export const confidentAiProfile: SiteProfile = {
  id: 'confident-ai',
  name: 'Confident AI',
  domain: 'app.confident-ai.com',
  url: 'https://app.confident-ai.com/project/cmubhm6yf0002o30tjtp072vo',
  color: '#f8f8f8',
  description: 'Refine your prompts and build thoughtful evaluation datasets.',
  builtIn: true,
  observations: 0,
  instructions: [
    'Work only in the supplied project cmubhm6yf0002o30tjtp072vo. The observed workspace is Vector and project is My first project. Verify the visible project context before changes; do not switch or create a project to work around a limit. Use the normal project Home for a fresh launch.',
    'Use current page observations and the shared browser actions for every website change. Guides describe known form behavior, not fixed coordinates. All flows remain unverified through Nova until successful live rehearsals are recorded.',
    'The task-owned synthetic scenario is Northstar returns support. Existing prompt: Northstar Returns Adviser (Text). Existing dataset: Northstar Returns Coverage (Single-turn), or Northstar Returns Readiness after the explicitly requested rename. Read existing contents before editing and reuse matching records; do not create duplicates on retries.',
    'For the named Northstar dataset, use its verified saved record URL through normal browser navigation: https://app.confident-ai.com/project/cmubhm6yf0002o30tjtp072vo/datasets/cmubimef70007qs0tgjd1c7sq?pageNumber=1&pageSize=50 . The index row has ambiguous visual targeting; open this known record directly instead of clicking its broad table container. Verify the actual project, alias and contents before editing or renaming; this route identifies the existing record and does not prove any saved outcome.',
    'The prompt index has shown Create your first prompt even while the saved Northstar Returns Adviser remains accessible. Do not infer absence or create a duplicate from that index. If omitted, open the verified saved URL through normal browser navigation: https://app.confident-ai.com/project/cmubhm6yf0002o30tjtp072vo/prompt-studio/cmubijzhk0005pb0tn3tnafcn?branch=main . Verify the visible project and prompt alias before editing; if they do not match, stop and inspect rather than creating a replacement.',
    'Policy: unused standard items with a receipt are eligible within 30 days of delivery. Personalized items are excluded from change-of-mind returns. Damage reported within 7 days needs review, without a refund promise. Ask for missing delivery timing, item status or receipt details only when needed. Never invent orders, fees, refunds, completed actions or exceptions. Keep customer answers warm and under 120 words. Preserve the {customer_message} variable.',
    'An explicit reversible rename, prompt edit, content commit or golden save is already authorized; act without another confirmation. Ask grouped clarification questions only when missing policy details prevent a useful next step. Keep partial answers and requested corrections. Confirmation cards are for consequential actions, not ordinary form saves. Do not contact recipients, execute refunds, enable automation, reveal keys, change billing/access, start a trial or upgrade.',
    'Rich prompt and golden editors require real input events. Read the actual editor value already present in the observation; select_text is for non-editable page text, not a way to read a form field. Focus the observed editable and use supported fill/type keyboard actions. Direct DOM text/value assignment is not evidence of editor state. Read the actual value, blur when appropriate, save, then reopen the record to verify persistence. If text appears but save is disabled or reverted, re-observe and change input strategy once; do not loop or repeatedly append the whole text.',
    'Prompt content commits are available: edit the exact prompt, choose Commit changes, provide a descriptive commit message and submit. Verify the saved text and new commit in Commit History. Prompt branching and dataset/metric versioning are paid-gated in this project; do not use Branch, Create new version, New version, trial or plan upgrade as required outcomes. A prompt content commit is not a new branch or a dataset snapshot.',
    'Dataset grid cells enter edit mode on click; Return saves and Shift+Return inserts a newline. New Golden exposes Input, Expected Output, Tags, Context, Comments, Actual Output and other fields. Use Input and Expected Output plus genuine policy context/tags where requested. Leave Actual Output, Retrieval Context, Tools Called, token usage and metrics empty unless authentic run evidence exists. Expected Output is a target answer, not an observed model answer or score.',
    'Evaluation execution is currently blocked by missing metric collection and AI connection/provider setup. The evaluation dialog can recognize the saved prompt, but that is not a completed evaluation. Do not fabricate passing scores, production traces, test runs or analytics. Explain this limit and continue supported prompt/dataset work. Connect MCP is an external-agent integration; do not claim this product has no agent capabilities.',
    'Success requires exact persisted contents, object identity and relationships. Independently reopen meaningful saved outcomes, verify row counts and tags, and report only observed changes. Retain ordinary account content; keep actual secrets outside the recording. Stop/cancel must remain effective.',
  ].join('\n\n'),
  flows: [
    {
      id: 'confident-refine-prompt',
      name: 'Refine a support prompt',
      trigger: 'Improve Northstar Returns Adviser to handle missing details without promising refunds.',
      verified: false,
      steps: [
        'Verify the project, open Prompt and locate Northstar Returns Adviser; read its current Text content and existing commits.',
        'Clarify only policy details not already established; retain the 30-day unused standard return, personalized exclusion and 7-day damage-review rules.',
        'Use the actual rich editor and native fill/type input to make one coherent revision, preserving {customer_message} and the warm under-120-word response rule.',
        'Inspect the actual editor value for unintended duplicate text or lost variables before saving.',
        'Choose Commit changes, enter a concise meaningful commit message, then submit Commit changes once.',
        'Read Commit History and reopen the saved content to verify the new commit and requested policy. Do not use paid branching or start a trial.',
      ],
    },
    {
      id: 'confident-curate-goldens',
      name: 'Extend policy coverage',
      trigger: 'Add damage-review and missing-delivery-date cases to our Northstar returns dataset.',
      verified: false,
      steps: [
        'Verify the current project and open the existing Northstar Returns Coverage dataset, or its saved renamed alias Northstar Returns Readiness.',
        'Inspect the Single-turn dataset and existing inputs, expected answers and tags; identify matching cases before adding rows.',
        'Clarify unresolved edge-case expectations together. Expected Output must reflect policy, never an invented model run or completed refund.',
        'For each missing case, open New Golden; fill Input, Expected Output and requested Tags/Context through genuine edit controls. Keep Actual Output and execution fields empty.',
        'Save once, then inspect the exact new row and field contents. For grid edits, press Return to save; use Shift+Return only for an intentional newline.',
        'Apply a requested correction to the existing matching golden instead of adding another one.',
        'Reopen the dataset and verify the exact row count, unique inputs, expected outputs and tags. Report saved coverage only, without claiming scores, evaluations or immutable versions.',
      ],
    },
    {
      id: 'confident-rename-dataset',
      name: 'Rename the dataset',
      trigger: 'Rename Northstar Returns Coverage to Northstar Returns Readiness so I can find it.',
      verified: false,
      steps: [
        'Open Dataset in the supplied project and identify the exact current alias. If the requested new alias already exists, inspect it before changing anything.',
        'Use the observed alias pencil/edit control, inspect the current textfield value, replace it with the requested alias, and choose Save once; Cancel abandons the edit.',
        'Reopen the dataset list and exact dataset to verify the alias changed while its contents remained associated. The coordinator exercised this Save form; live Nova validation and reload persistence must still pass before recording.',
      ],
    },
    {
      id: 'confident-review-coverage',
      name: 'Review saved coverage',
      trigger: 'Summarize which return-policy cases we covered and what has not been evaluated.',
      verified: false,
      steps: [
        'Read saved prompt content, its commit history, and the exact dataset rows in the current project.',
        'Compare inputs/expected outputs to the policy and distinguish normal returns, personalized exclusions, damage review and missing information.',
        'Identify gaps from actual saved contents; distinguish expected answers from observed Actual Output.',
        'State the evaluation and paid-versioning limits accurately. Do not trigger evaluation, create provider credentials, branch or upgrade to fill the gap.',
      ],
    },
  ],
};
