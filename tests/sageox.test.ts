import { describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { sageoxProfile } from '../BE/src/sites/sageox';
import { SiteStore } from '../BE/src/sites/store';
import { siteStoreFilename } from '../BE/src/sites/customizations';
import { launcherStylesFor } from '../web/companion/customization';

describe('SageOx customization isolation', () => {
  it('keeps owner edits and a separate runtime store', () => {
    expect(siteStoreFilename).toBe('sites.sageox.json');
    const dir = mkdtempSync(path.join(tmpdir(), 'nova-sageox-'));
    try {
      const file = path.join(dir, 'sites.json');
      const edited = { ...sageoxProfile, instructions: 'Owner instructions', color: '#123456', flows: [] };
      writeFileSync(file, JSON.stringify([edited]));
      const store = new SiteStore(file);
      expect(store.forUrl('https://sageox.ai/home')).toEqual(edited);
      expect(store.list()).toHaveLength(1);
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  it('does not claim live verification from research', () => {
    expect(sageoxProfile.flows.every(flow => !flow.verified)).toBe(true);
    expect(sageoxProfile.instructions).toContain('99:59:59');
    expect(sageoxProfile.instructions).toContain('no browser create control');
  });
  it('confines the launcher to the exact target hostname', () => {
    expect(launcherStylesFor('https://sageox.ai/home')).toContain('#50794a');
    for (const url of ['https://example.org', 'https://sageox.ai.evil.example', 'https://other.sageox.ai', 'invalid']) {
      expect(launcherStylesFor(url)).toBe('');
    }
  });
  it('scopes every panel selector to SageOx', () => {
    const css = readFileSync('web/src/panel/customization.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const rule of css.split('}').filter(rule => rule.includes('{'))) {
      const selectors = rule.split('{')[0].split(',');
      for (const selector of selectors) expect(selector.trim().startsWith('.np-app[data-site="sageox.ai"]')).toBe(true);
    }
  });
});
