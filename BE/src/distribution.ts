import { open, readFile } from 'node:fs/promises';
import path from 'node:path';
import type { FastifyInstance } from 'fastify';
import type { ExtensionRelease } from '../../shared/distribution';

// Only these two public build artifacts are served. Never expose the build
// directory, project files, local data, or provider configuration as a listing.
export function registerDistribution(app: FastifyInstance, root: string) {
  const directory = path.join(root, 'web/releases');
  const unavailable = { available: false, message: 'The extension download is not built yet. Run npm run build in the Nova project folder, then check again.' } as const;
  app.get('/api/extension-release', async (): Promise<ExtensionRelease> => {
    try {
      const release = JSON.parse(await readFile(path.join(directory, 'extension.json'), 'utf8')) as ExtensionRelease;
      const file = await open(path.join(directory, 'nova-extension.zip'), 'r');
      try { if (!release.available || (await file.stat()).size !== release.bytes) return unavailable; }
      finally { await file.close(); }
      return release;
    } catch { return unavailable; }
  });
  app.get('/downloads/nova-extension.zip', async (_request, reply) => {
    try {
      const file = await open(path.join(directory, 'nova-extension.zip'), 'r');
      const size = (await file.stat()).size;
      return reply.header('Cache-Control', 'no-store')
        .header('Content-Disposition', 'attachment; filename="nova-extension.zip"')
        .header('Content-Length', size).type('application/zip').send(file.createReadStream());
    } catch { return reply.code(503).send({ error: unavailable.message }); }
  });
}
