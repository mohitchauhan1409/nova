import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { onyxProfile } from '../BE/src/sites/onyx';
import { customSiteProfiles, siteStoreFilename } from '../BE/src/sites/customizations';
import { launcherStylesFor } from '../web/companion/customization';

describe('Onyx customer customization', () => {
  it('registers an isolated, review-first Onyx profile with two safe flows', () => {
    expect(customSiteProfiles).toEqual([onyxProfile]);
    expect(siteStoreFilename).toBe('sites.onyx.json');
    expect(onyxProfile).toMatchObject({
      id: 'onyx',
      domain: 'cloud.onyx.app',
      url: 'https://cloud.onyx.app',
      builtIn: true,
    });
    expect(onyxProfile.flows).toHaveLength(2);
    expect(onyxProfile.flows.every(flow => !flow.verified && flow.steps.length >= 6)).toBe(true);
    expect(onyxProfile.instructions).toContain('Never enter credentials');
    expect(onyxProfile.instructions).toContain('Never connect a model provider');
    expect(onyxProfile.instructions).toContain('claim that a chat or grounded answer was tested');
    expect(onyxProfile.instructions).toContain('Agent knowledge, web access, actions, integrations, sharing, and featuring disabled');
    expect(onyxProfile.flows.map(flow => flow.id)).toEqual(['onyx-private-project', 'onyx-private-agent']);
    const [project, agent] = onyxProfile.flows;
    expect(project.trigger).not.toMatch(/answer|chat|citation/i);
    expect(project.steps.join(' ')).toContain('visible processing state to report completion');
    expect(agent.trigger).not.toMatch(/answer|chat|knowledge/i);
    expect(agent.steps.join(' ')).toContain('Keep Knowledge empty');
    expect(agent.steps.join(' ')).toContain('without starting chat');
  });

  it('scopes launcher styling to the exact Onyx cloud hostname', () => {
    expect(launcherStylesFor('https://cloud.onyx.app/chat')).toContain('.launch');
    expect(launcherStylesFor('https://cloud.onyx.app.evil.example/chat')).toBe('');
    expect(launcherStylesFor('https://docs.onyx.app/')).toBe('');
    expect(launcherStylesFor('not a url')).toBe('');
  });

  it('keeps every panel customization selector hostname-scoped', () => {
    const css = readFileSync('web/src/panel/customization.css', 'utf8');
    const rules = css.replace(/\/\*[\s\S]*?\*\//g, '').split('}').map(rule => rule.trim()).filter(Boolean);
    expect(rules.length).toBeGreaterThan(0);
    for (const rule of rules) {
      const selector = rule.split('{')[0].trim();
      expect(selector, `Unscoped selector: ${selector}`).toContain('.np-app[data-site="cloud.onyx.app"]');
    }
  });

  it('ships only the approved synthetic project upload fixture', () => {
    const brief = readFileSync('tests/fixtures/onyx-synthetic-launch-brief.md', 'utf8');
    expect(brief).toContain('entirely synthetic');
    expect(brief).toContain('does not name a meeting room or video link');
  });
});
