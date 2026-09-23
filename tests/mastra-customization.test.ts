import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mastraLocalProfile, mastraProfile } from '../BE/src/sites/mastra';
import { customSiteProfiles, siteStoreFilename } from '../BE/src/sites/customizations';
import { launcherStylesFor } from '../web/companion/customization';
import { mastraEmptyProjectsSnapshot, mastraTraceSnapshot } from './fixtures/mastra';

describe('Mastra Platform customer customization',()=>{
  it('registers an isolated profile with blocked-safe, unverified flows',()=>{
    expect(customSiteProfiles).toEqual([mastraProfile,mastraLocalProfile]);
    expect(siteStoreFilename).toBe('sites.mastra.json');
    expect(mastraProfile).toMatchObject({domain:'projects.mastra.ai',builtIn:true,observations:0});
    expect(mastraProfile.flows).toHaveLength(2);
    expect(mastraProfile.flows.every(flow=>!flow.verified&&flow.steps.length>=5)).toBe(true);
    expect(mastraProfile.instructions).toContain('zero credits');
    expect(mastraProfile.instructions).toContain('prerequisite blocker');
    expect(mastraLocalProfile).toMatchObject({domain:'localhost',url:'http://localhost:4111',builtIn:true,observations:0});
    expect(mastraLocalProfile.flows).toHaveLength(2);
    expect(mastraLocalProfile.flows.every(flow=>flow.verified&&flow.steps.length>=6)).toBe(true);
    expect(mastraLocalProfile.instructions).toContain('SYNTHETIC_RISK_REVIEW_FAILURE');
  });

  it('scopes launcher and every panel rule to the exact hostname',()=>{
    expect(launcherStylesFor('https://projects.mastra.ai/organizations/fixture')).toContain('#fa7b6a');
    expect(launcherStylesFor('http://localhost:4111/workflows')).toContain('#fa7b6a');
    expect(launcherStylesFor('https://mastra.ai/')).toBe('');
    expect(launcherStylesFor('not a url')).toBe('');
    const css=readFileSync(new URL('../web/src/panel/customization.css',import.meta.url),'utf8');
    expect(css.match(/\.np-app\[data-site="projects\.mastra\.ai"\]/g)?.length).toBe(css.match(/{/g)?.length);
  });

  it('keeps fixtures synthetic and models the zero-credit blocker',()=>{
    expect(mastraEmptyProjectsSnapshot.text).toContain('Credits $0');
    expect(mastraTraceSnapshot.text).toContain('trace_synthetic');
    expect(JSON.stringify([mastraEmptyProjectsSnapshot,mastraTraceSnapshot])).not.toMatch(/(?:sk-|ghp_)[A-Za-z0-9]{8,}/);
  });
});
