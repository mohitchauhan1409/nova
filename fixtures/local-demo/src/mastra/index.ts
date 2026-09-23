import { Mastra } from '@mastra/core/mastra';
import { MastraCompositeStore } from '@mastra/core/storage';
import { DuckDBStore } from '@mastra/duckdb';
import { LibSQLStore } from '@mastra/libsql';
import { DefaultExporter, Observability } from '@mastra/observability';
import { demoLogger } from './logger';
import { northstarReleaseReview } from './workflows/release-review';
import { northstarRiskCheck } from './workflows/risk-check';

export const mastra = new Mastra({
  logger: demoLogger,
  storage: new MastraCompositeStore({
    id: 'nova-mastra-local-storage',
    default: new LibSQLStore({ id: 'nova-mastra-local-libsql', url: 'file:./mastra.db' }),
    domains: {
      observability: new DuckDBStore().observability,
    },
  }),
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'nova-mastra-local-demo',
        logging: { enabled: true, level: 'info' },
        exporters: [new DefaultExporter()],
      },
    },
  }),
  workflows: {
    northstarReleaseReview,
    northstarRiskCheck,
  },
});
