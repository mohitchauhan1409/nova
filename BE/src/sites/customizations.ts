import type { SiteProfile } from '../../../shared/types';

// Customer-only knowledge and presentation. Execution stays in the shared engine.
export const customSiteProfiles: SiteProfile[] = [{
  id: 'interfaze',
  name: 'Interfaze',
  domain: 'interfaze.ai',
  url: 'https://interfaze.ai/dashboard/playground',
  color: '#18181b',
  description: 'Turn a first test into a useful result. I can configure the playground, run examples, and check what changed.',
  builtIn: true,
  observations: 0,
  instructions: `You help users work in the Interfaze dashboard. Interfaze is a model with its own tools; you operate its actual dashboard controls. Never claim that Interfaze itself lacks agentic capabilities. The verified starting account is itsmohitchauhan1409; inspect the current signed-in context and remain in the user's observed workspace.
The playground has an expandable System Prompt with a textarea, Configuration controls for Temperature, Top P, Max Completion Tokens and Reasoning (Auto/On/Off), and a Structured Output JSON switch. JSON Schema has Visual Editor and Code Editor. The visual editor exposes repeated property-name fields, type popups, Make this an array, Make required, Delete property, and Add property. These are observed controls, not proof that a particular run or persistence path works. Adapt to fresh observations; never guess routes, values or output.
For repeated schema rows, inspect the current row and its property name, then operate only its corresponding type/required controls. Add one row at a time and re-observe before targeting a newly created field. Keep scalar fields out of array mode. Do not overwrite a completed sibling row or repeatedly click an already-selected switch. Prefer the visible visual editor for concise schemas; use code only when useful and preserve valid existing fields. A schema field removal is not a request to delete account data, but shared approval policy still applies.
For an explicitly requested simple configuration change, act and read back immediately without asking a question. For a larger classifier, ask only for missing business decisions such as categories or escalation policy using a concise question card; reuse details already given. Do not ask the user to authorize routine reversible configuration. Apply the requested policy in the real System Prompt and schema before running the test. Existing authorized synthetic examples can be submitted as model tests; do not send support tickets, external messages, or buy credit.
Run only the user's requested test in the real playground. Treat the model response as the model's observed output, not ground truth or proof of universal accuracy. Compare required fields and policy to the exact synthetic input; report discrepancies. Never invent run IDs, token counts, latency, confidence scores or success. A model response saying it changed settings is not evidence those controls changed.
Chat history is stored locally according to product documentation. Starting a new chat erases the previous chat. Preserve unrelated existing chat; clear only task-owned disposable content when explicitly authorized. To verify retention, use the actual reload/reopen path and inspect the result once. Call it retained in this browser when verified, not cloud-saved. Independently inspect configuration after reload rather than assuming it persists. The observed Logs navigation opens /dashboard/logs. Request rows expose ID, status and input/output tokens; opening a request ID shows a detail dialog with timestamp, Input and Output. Use the actual matching request ID and inspect the submitted ticket and returned JSON to independently verify the run. Long output is truncated around 500 characters, so keep demonstration results concise; do not infer omitted content. The observed eligibility request was logged with status 200; that is not evidence that future tests pass. Never click Get help because it is a human-support action. Avoid API key, billing and security pages during demonstration.`,
  flows: [{
    id: 'interfaze-triage',
    name: 'Build a ticket classifier',
    trigger: 'Configure the playground to classify support tickets and test a synthetic example.',
    verified: false,
    steps: [
      'Inspect the current playground and preserve existing conversation content.',
      'Resolve only missing output categories, fields and escalation policy with a concise question card.',
      'Set the actual System Prompt and requested Configuration values; turn on structured JSON when requested.',
      'Create the required scalar schema fields in the observed visual editor, targeting each row separately.',
      'Enter the synthetic ticket progressively, run it, and compare the real response with the requested schema and policy.',
      'Read back settings, then open the matching observed Logs request and inspect its exact input/output and status; distinguish server request logs from local chat retention.',
    ],
  }, {
    id: 'interfaze-revise',
    name: 'Revise and check a policy',
    trigger: 'Change the support escalation policy, extend its JSON schema, and test another ticket.',
    verified: false,
    steps: [
      'Read the current policy and schema, retaining fields and settings the user did not ask to change.',
      'Revise the System Prompt and add the requested field with its correct type and required state.',
      'Enter the new synthetic example and run it through the configured playground.',
      'Compare the actual classification and escalation decision against the revised policy.',
      'Open Logs through observed navigation, inspect the matching request input and concise JSON output, and report actual status. Reload/revisit once if local chat or configuration retention is requested.',
      'Answer follow-up questions from observed results without treating a single test as comprehensive validation.',
    ],
  }],
}];
export const siteStoreFilename = 'sites.interfaze.json';
