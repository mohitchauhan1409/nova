import { build } from 'esbuild';
import { cp, mkdir, rm, readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { zipSync } from 'fflate';
import { rename } from 'node:fs/promises';
const root = process.cwd(); const out = path.join(root, 'web/dist-extension');
await rm(out, { recursive: true, force: true }); await mkdir(out, { recursive: true });
await cp(path.join(root, 'web/dist'), out, { recursive: true });
await cp(path.join(root, 'web/extension/manifest.json'), path.join(out, 'manifest.json'));
await build({ entryPoints: { background: 'web/extension/background.ts', content: 'web/extension/content.ts', dashboard: 'web/extension/dashboard.ts', launch: 'web/extension/launch.ts', microphone: 'web/extension/microphone.ts' }, outdir: out, bundle: true, target: 'chrome120', format: 'iife', minify: false });
for (const file of ['launch.html', 'launch.css', 'microphone.html', 'microphone.css', 'INSTALL.md']) await cp(path.join(root, 'web/extension', file), path.join(out, file));
// Extension pages use local system fonts; no third-party connections or remote code.
for (const file of await readdir(path.join(out, 'assets'))) if (file.endsWith('.css')) { const target = path.join(out, 'assets', file); await writeFile(target, (await readFile(target, 'utf8')).replace(/@import\s+(?:url\([^;]+\)|["'][^"']+["']);?/g, '')); }
const files: Record<string, Uint8Array> = {};
async function collect(directory: string) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.endsWith('.map') || entry.isSymbolicLink()) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(absolute);
    else if (entry.isFile()) files[`nova-extension/${path.relative(out, absolute).split(path.sep).join('/')}`] = await readFile(absolute);
  }
}
await collect(out);
const archive = zipSync(files, { level: 6 });
const { version } = JSON.parse(await readFile(path.join(out, 'manifest.json'), 'utf8'));
const release = { available: true, version, bytes: archive.byteLength, sha256: createHash('sha256').update(archive).digest('hex'), builtAt: new Date().toISOString(), downloadUrl: '/downloads/nova-extension.zip' };
const releases = path.join(root, 'web/releases');
await mkdir(releases, { recursive: true });
await writeFile(path.join(releases, 'nova-extension.zip.tmp'), archive);
await writeFile(path.join(releases, 'extension.json.tmp'), JSON.stringify(release, null, 2));
await rename(path.join(releases, 'nova-extension.zip.tmp'), path.join(releases, 'nova-extension.zip'));
await rename(path.join(releases, 'extension.json.tmp'), path.join(releases, 'extension.json'));
console.log(`Nova extension ${version} ready: web/dist-extension and web/releases/nova-extension.zip (${Math.round(archive.byteLength / 1024)} KB)`);
