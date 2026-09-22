import { defineConfig } from '@trigger.dev/sdk';

export default defineConfig({
  project: 'proj_futnuhorkbwfxqmsvsgv',
  runtime: 'node',
  dirs: ['./src/trigger'],
  maxDuration: 30,
  retries: { enabledInDev: false, default: { maxAttempts: 1 } },
});
