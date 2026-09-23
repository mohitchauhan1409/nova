import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { autumnProfile } from '../BE/src/sites/autumn';
import { customSiteProfiles, siteStoreFilename } from '../BE/src/sites/customizations';
import { launcherStylesFor } from '../web/companion/customization';

const root = path.resolve(import.meta.dirname, '..');

describe('Autumn customer customization', () => {
  it('registers an isolated cloud-dashboard profile and store', () => {
    expect(customSiteProfiles).toEqual([autumnProfile]);
    expect(autumnProfile.url).toBe('https://app.useautumn.com/sandbox/products');
    expect(siteStoreFilename).toBe('sites.autumn.json');
    expect(autumnProfile.flows).toHaveLength(3);
    expect(autumnProfile.flows.filter(flow => flow.steps.length >= 4)).toHaveLength(3);
    expect(autumnProfile.flows.every(flow => flow.verified === false)).toBe(true);
  });

  it('keeps every guided mutation in Sandbox and states hard exclusions', () => {
    const guide = [autumnProfile.instructions, ...autumnProfile.flows.flatMap(flow => flow.steps)].join('\n');
    for (const phrase of ['Sandbox route', 'Deploy to Production', 'API keys', 'checkout', 'send an invoice', 'example.com']) {
      expect(guide).toContain(phrase);
    }
    expect(autumnProfile.instructions).toContain('Never use Deploy to Production');
    expect(autumnProfile.instructions).toContain('Do not delete pre-existing records');
    expect(autumnProfile.instructions).toContain('Metered + Consumable');
    expect(autumnProfile.instructions).toContain('modal Save and page Save');
    expect(autumnProfile.instructions).toContain('Auto-enable on');
    expect(autumnProfile.instructions).toContain('2,500/2,500 left');
    expect(autumnProfile.instructions).toContain('rehearsal-01 or final-01');
    expect(autumnProfile.instructions).toContain('If any exists, stop and request the next suffix');
    expect(autumnProfile.flows[0].trigger).toContain('create');
    expect(autumnProfile.flows[0].steps.join('\n')).toContain('Create Workflow Runs <Suffix>');
    expect(autumnProfile.flows[0].steps.join('\n')).toContain('search all three exact IDs');
    expect(autumnProfile.flows[1].trigger).toContain('create');
    expect(autumnProfile.flows[1].steps.join('\n')).toContain('Create Northstar Demo <Suffix>');
  });

  it('scopes launcher styling to app.useautumn.com only', () => {
    expect(launcherStylesFor('https://app.useautumn.com/sandbox/products')).toContain('#0f9bff');
    expect(launcherStylesFor('https://www.useautumn.com/')).toBe('');
    expect(launcherStylesFor('https://useautumn.com/')).toBe('');
    expect(launcherStylesFor('not a url')).toBe('');
  });

  it('scopes every panel selector and provides light and dark dashboard tokens', () => {
    const css = readFileSync(path.join(root, 'web/src/panel/customization.css'), 'utf8');
    expect(css).toContain('.np-app[data-site="app.useautumn.com"]');
    expect(css).toContain('[data-color-scheme="dark"]');
    expect(css).toContain('--site-accent: #0f9bff');
    const selectors = css.replace(/\/\*[\s\S]*?\*\//g, '').split('{').slice(0, -1).map(part => part.slice(part.lastIndexOf('}') + 1).trim()).filter(Boolean);
    for (const selector of selectors) expect(selector).toContain('.np-app[data-site="app.useautumn.com"]');
  });

  it('ships a deterministic sandbox fixture with guarded production affordance', () => {
    const fixture = readFileSync(path.join(root, 'tests/fixtures/autumn-dashboard.html'), 'utf8');
    expect(fixture).toContain('data-environment="sandbox"');
    expect(fixture).toContain('/sandbox/products');
    expect(fixture).toContain('Deploy to Production');
    expect(fixture).toContain('northstar-demo@example.com');
    expect(fixture).toContain('data-feature-id="workflow_runs"');
    expect(fixture).toContain('data-plan-id="nova_sandbox_starter"');
    expect(fixture).toContain('2,500/2,500 left');
    expect(fixture).toContain('data-next-rehearsal-suffix="rehearsal-01"');
    expect(fixture).toContain('data-next-final-suffix="final-01"');
  });
});
