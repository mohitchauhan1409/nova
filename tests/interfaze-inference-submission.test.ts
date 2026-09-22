import { describe, expect, it } from 'vitest';
import { checkAction } from '../BE/src/agent/policy';
import { inferencePlaygrounds } from '../BE/src/sites/action-semantics';
import type { Action, Snapshot } from '../shared/types';

// Labels, tags, submission shape and empty state match a coordinator-observed
// post-run Interfaze snapshot. IDs/revisions are sanitized. Prepared state below
// is an explicit test fixture, not a claim that a live submission was approved.
const observed: Snapshot = {
  id: 'observed', url: 'https://interfaze.ai/dashboard/playground', title: 'Interfaze', text: '',
  viewport: { width: 1200, height: 800 }, theme: { color: '#ffffff', font: 'monospace' }, frames: 0, capturedAt: 0,
  elements: [
    { ref: 'prompt', tag: 'textarea', role: '', type: '', name: 'Type your message...', context: '', disabled: false, sensitive: false, covered: false,
      edit: { revision: 'edit20', empty: true }, state: [], submission: { scope: 'prompt-container', label: '', fields: [{ ref: 'prompt', revision: 'edit20' }] } },
    { ref: 'send', tag: 'button', role: '', type: 'button', name: 'Send', context: '', disabled: false, sensitive: false,
      submission: { scope: 'send-container', label: '', fields: [{ ref: 'prompt', revision: 'edit20' }] } },
    { ref: 'system', tag: 'button', role: '', type: 'button', name: 'System Prompt Define model behavior', context: '', disabled: false, sensitive: false },
    { ref: 'config', tag: 'button', role: '', type: 'button', name: 'Configuration Model parameters', context: '', disabled: false, sensitive: false },
  ],
};
const action: Action = { kind: 'click', ref: 'send', value: null, url: null, x: null, y: null, risk: 'change', summary: 'Run the requested model test' };
const intent = 'Run this prompt: Classify a cracked mug as damage, delivery or other. Reply with one word.';
const prepared = (): Snapshot => ({ ...observed, elements: observed.elements.map(e => e.ref === 'prompt' ? { ...e, edit: { revision: 'edit20', empty: false }, state: ['draft:matches:prompt'] } : e) });
const check = (page = prepared(), request = intent, requested = action) => checkAction(requested, page, observed.url, request);

describe('Interfaze reviewed inference composer', () => {
  it('registers the actual observed markers but does not authorize the observed empty post-run composer', () => {
    expect(inferencePlaygrounds).toHaveLength(1);
    expect(inferencePlaygrounds[0].url).toBe(observed.url);
    expect(check(observed).outcome).toBe('approve');
  });
  it('allows a matching prepared prompt with explicit inference intent, including the scripted follow-up wording', () => {
    expect(check()).toMatchObject({ outcome: 'allow', mayCommit: true });
    expect(check(prepared(), 'Test this prompt: Order CD-105 is nine days late.').outcome).toBe('allow');
  });
  it('preserves review for sensitive risk, revoked intent, human recipients and changed routes', () => {
    expect(check(prepared(), intent, { ...action, risk: 'sensitive' }).outcome).toBe('approve');
    expect(check(prepared(), `${intent}\nWait`).outcome).toBe('approve');
    expect(check({ ...prepared(), url: 'https://interfaze.ai/help' }).outcome).not.toBe('allow');
    expect(check({ ...prepared(), elements: [...prepared().elements, { ref: 'recipient', tag: 'input', role: '', type: 'email', name: 'Recipient email', context: '', disabled: false, sensitive: false }] }).outcome).not.toBe('allow');
  });
});
