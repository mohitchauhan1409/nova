import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { requestyProfile } from '../BE/src/sites/requesty';
import { customSiteProfiles, siteStoreFilename } from '../BE/src/sites/customizations';
import { launcherStylesFor } from '../web/companion/customization';
import { requestyLogSnapshot, requestyPolicyDraftSnapshot } from './fixtures/requesty';

describe('Requesty customer customization', () => {
  it('registers an isolated, unverified profile with substantial safe flows', () => {
    expect(customSiteProfiles).toEqual([requestyProfile]);
    expect(siteStoreFilename).toBe('sites.requesty.json');
    expect(requestyProfile).toMatchObject({domain:'app.requesty.ai',builtIn:true,observations:0});
    expect(requestyProfile.flows).toHaveLength(2);
    expect(requestyProfile.flows.every(flow=>!flow.verified && flow.steps.length >= 4)).toBe(true);
    expect(requestyProfile.instructions).toContain('stop before persistence');
    expect(requestyProfile.instructions).toContain('Never invent request IDs');
  });

  it('keeps launcher and panel styling hostname-scoped', () => {
    expect(launcherStylesFor('https://app.requesty.ai/requests')).toContain('#34d399');
    expect(launcherStylesFor('https://requesty.ai/')).toBe('');
    expect(launcherStylesFor('not a url')).toBe('');
    const css=readFileSync(new URL('../web/src/panel/customization.css',import.meta.url),'utf8');
    expect(css).toContain('.np-app[data-site="app.requesty.ai"]');
    expect(css.match(/\.np-app\[data-site="app\.requesty\.ai"\]/g)?.length).toBe(css.match(/{/g)?.length);
  });

  it('provides synthetic fixtures without live keys or real spend', () => {
    expect(requestyPolicyDraftSnapshot.elements.find(element=>element.name==='Save policy')).toBeTruthy();
    expect(requestyLogSnapshot.text).toContain('req_synthetic');
    expect(JSON.stringify([requestyPolicyDraftSnapshot,requestyLogSnapshot])).not.toMatch(/sk-[A-Za-z0-9]{8,}/);
  });
});
