import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { inngestLocalProfile, inngestProfile } from '../BE/src/sites/inngest';
import { customSiteProfiles, siteStoreFilename } from '../BE/src/sites/customizations';
import { launcherStylesFor } from '../web/companion/customization';

describe('Inngest customer customization', () => {
  it('registers a production-read-only profile with two substantial flows', () => {
    expect(customSiteProfiles).toEqual([inngestProfile, inngestLocalProfile]);
    expect(siteStoreFilename).toBe('sites.inngest.json');
    expect(inngestProfile).toMatchObject({
      id: 'inngest', domain: 'app.inngest.com', url: 'https://app.inngest.com', builtIn: true,
    });
    expect(inngestProfile.flows).toHaveLength(2);
    expect(inngestProfile.flows.every(flow => !flow.verified && flow.steps.length >= 6)).toBe(true);
    for (const prohibited of ['send an event', 'rerun or replay', 'cancel a run', 'deploy or sync', 'billing settings']) {
      expect(inngestProfile.instructions).toContain(prohibited);
    }
  });

  it('registers a localhost-only synthetic action profile', () => {
    expect(inngestLocalProfile).toMatchObject({
      id: 'inngest-local', domain: 'localhost', url: 'http://localhost:8288', builtIn: true,
    });
    expect(inngestLocalProfile.flows).toHaveLength(2);
    expect(inngestLocalProfile.instructions).toContain('Local synthetic event sends');
    expect(inngestLocalProfile.instructions).toContain('Do not rerun, replay, cancel');
    expect(inngestLocalProfile.flows.every(flow => flow.steps.length >= 6)).toBe(true);
  });

  it('scopes launcher styling to the exact Inngest app hostname', () => {
    expect(launcherStylesFor('https://app.inngest.com/env/production/functions')).toContain('.launch');
    expect(launcherStylesFor('http://localhost:8288/functions')).toContain('.launch');
    expect(launcherStylesFor('https://app.inngest.com.evil.example/')).toBe('');
    expect(launcherStylesFor('https://www.inngest.com/docs')).toBe('');
    expect(launcherStylesFor('not a url')).toBe('');
  });

  it('keeps every panel override hostname-scoped', () => {
    const css = readFileSync('web/src/panel/customization.css', 'utf8');
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map(rule => rule.trim()).filter(Boolean);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      const selector = rule.split('{')[0].trim();
      expect(selector, `Unscoped selector: ${selector}`).toContain('.np-app[data-site="app.inngest.com"]');
    }
  });

  it('ships synthetic, non-dispatching run and health fixtures', () => {
    const run = JSON.parse(readFileSync('tests/fixtures/inngest-synthetic-failed-run.json', 'utf8'));
    const health = JSON.parse(readFileSync('tests/fixtures/inngest-synthetic-function-health.json', 'utf8'));
    expect(run.fixture_notice).toContain('never send this as an event');
    expect(run.deliberately_absent).toContain('raw event payload');
    expect(health.fixture_notice).toContain('not a live Inngest export');
    expect(health.interpretation_guardrails.join(' ')).toContain('Do not invoke, rerun, replay, cancel, deploy, sync, or send events.');
  });
});
