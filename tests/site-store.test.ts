import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SiteStore } from '../BE/src/sites/store';
import { customSiteProfiles, siteStoreFilename } from '../BE/src/sites/customizations';
import { workflowProfile } from './fixtures/profiles';

const dirs: string[] = [];
const tempFile = () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'nova-sites-'));
  dirs.push(dir);
  return path.join(dir, 'sites.json');
};
afterEach(() => dirs.splice(0).forEach(dir => rmSync(dir, { recursive: true, force: true })));

describe('Reusable site storage and customer registration', () => {
  it('seeds general websites and registered customer presets in a fresh workspace', () => {
    const store = new SiteStore(tempFile());
    for (const id of ['amazon', 'youtube', 'google']) expect(store.get(id)).toBeDefined();
    for (const profile of customSiteProfiles) expect(store.forUrl(profile.url)).toEqual(profile);
    expect(siteStoreFilename).toMatch(/^sites(?:\.[a-z0-9-]+)?\.json$/);
  });

  it('preserves existing profiles and adds missing customer presets once', () => {
    const file = tempFile();
    const own = structuredClone(workflowProfile);
    writeFileSync(file, JSON.stringify([own]));
    const store = new SiteStore(file);
    expect(store.get(own.id)).toEqual(own);
    for (const profile of customSiteProfiles) expect(store.forUrl(profile.url)).toEqual(profile);
    store.save();
    expect(new SiteStore(file).list()).toEqual(store.list());
    expect(JSON.parse(readFileSync(file, 'utf8'))).toHaveLength(1 + customSiteProfiles.length);
  });

  it('keeps owner instructions and flows instead of replacing them with presets', () => {
    const file = tempFile();
    const profiles = customSiteProfiles.map(profile => ({ ...structuredClone(profile), builtIn: false, instructions: 'Keep my instructions', flows: [] }));
    writeFileSync(file, JSON.stringify(profiles));
    expect(new SiteStore(file).list()).toEqual(profiles);
  });

  it('isolates profile edits across branch-specific files', () => {
    const coreFile = tempFile();
    const customerFile = path.join(path.dirname(coreFile), 'sites.customer.json');
    const core = new SiteStore(coreFile);
    const customer = new SiteStore(customerFile);
    core.add({url: 'https://core-only.example', name: 'Core only'});
    customer.add({url: 'https://customer-only.example', name: 'Customer only'});
    expect(new SiteStore(coreFile).forUrl('https://customer-only.example')).toBeUndefined();
    expect(new SiteStore(customerFile).forUrl('https://core-only.example')).toBeUndefined();
  });
});
