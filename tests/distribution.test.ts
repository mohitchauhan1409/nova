import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { unzipSync, strFromU8 } from 'fflate';
import { registerDistribution } from '../BE/src/distribution';
import { config } from '../BE/src/config';

const app = Fastify(); const missing = Fastify(); let temporary: string;
beforeAll(async () => {
  temporary = await mkdtemp(path.join(os.tmpdir(), 'nova-release-test-'));
  registerDistribution(app, process.cwd()); registerDistribution(missing, temporary);
});
afterAll(async () => { await app.close(); await missing.close(); await rm(temporary, { recursive: true, force: true }); });
describe('Downloadable browser extension', () => {
  it('explains how to build when the download is missing', async () => {
    const info = await missing.inject('/api/extension-release');
    expect(info.json().available).toBe(false);
    const download = await missing.inject('/downloads/nova-extension.zip');
    expect(download.statusCode).toBe(503); expect(download.json().error).toContain('npm run build');
  });
  it('serves a ZIP attachment matching its advertised size and checksum', async () => {
    const info = (await app.inject('/api/extension-release')).json();
    expect(info.available).toBe(true);
    const result = await app.inject(info.downloadUrl);
    expect(result.statusCode).toBe(200); expect(result.headers['content-type']).toBe('application/zip');
    expect(result.headers['content-disposition']).toBe('attachment; filename="nova-extension.zip"');
    expect(result.headers['cache-control']).toBe('no-store');
    expect(result.rawPayload.byteLength).toBe(info.bytes);
    expect(createHash('sha256').update(result.rawPayload).digest('hex')).toBe(info.sha256);
  });
  it('packages an installable folder with all manifest and HTML assets', async () => {
    const result = await app.inject('/downloads/nova-extension.zip');
    const files = unzipSync(result.rawPayload); const prefix = 'nova-extension/';
    const manifest = JSON.parse(strFromU8(files[`${prefix}manifest.json`]));
    const source = JSON.parse(await readFile('web/extension/manifest.json', 'utf8'));
    expect(manifest.version).toBe(source.version); expect(manifest.manifest_version).toBe(3);
    for (const asset of [manifest.background.service_worker, manifest.side_panel.default_path, ...manifest.content_scripts.flatMap((entry: { js: string[] }) => entry.js), 'content.js', 'launch.html', 'launch.js', 'microphone.html', 'microphone.js', 'microphone.css', 'INSTALL.md', 'pcm-worklet.js']) expect(!!files[prefix + asset]).toBe(true);
    for (const [name, bytes] of Object.entries(files)) {
      if (!name.endsWith('.html')) continue;
      for (const match of strFromU8(bytes).matchAll(/(?:src|href)="\.\/([^"]+)"/g)) expect(!!files[prefix + match[1]]).toBe(true);
    }
  });
  it('excludes secrets, source configuration, and local browser data', async () => {
    const files = unzipSync((await app.inject('/downloads/nova-extension.zip')).rawPayload);
    for (const [name, bytes] of Object.entries(files)) {
      expect(name.startsWith('nova-extension/')).toBe(true);
      expect(/(?:^|\/)(?:\.|BE|node_modules|data)|\.map$|\.ts$/.test(name)).toBe(false);
      const contents = strFromU8(bytes);
      for (const secret of [config.openaiKey, config.sarvamKey, config.token].filter(Boolean)) expect(contents.includes(secret)).toBe(false);
    }
  });
});
