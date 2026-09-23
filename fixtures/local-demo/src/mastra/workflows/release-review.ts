import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { demoLogger } from '../logger';

const releaseInput = z.object({
  synthetic: z.literal(true),
  releaseId: z.string().min(1),
  ownerQueue: z.string().min(1),
});

const validatedRelease = releaseInput.extend({
  validation: z.literal('passed'),
});

const releaseOutput = z.object({
  releaseId: z.string(),
  decision: z.literal('ready-for-review'),
  ownerQueue: z.string(),
  externalActions: z.literal(0),
});

const validateRelease = createStep({
  id: 'validate-release',
  description: 'Validate a synthetic release-review payload without external calls.',
  inputSchema: releaseInput,
  outputSchema: validatedRelease,
  execute: async ({ inputData }) => {
    demoLogger.info('Validated local synthetic release payload', {
      releaseId: inputData.releaseId,
      externalActions: 0,
    });
    return { ...inputData, validation: 'passed' as const };
  },
});

const composeSummary = createStep({
  id: 'compose-summary',
  description: 'Produce a deterministic local review summary.',
  inputSchema: validatedRelease,
  outputSchema: releaseOutput,
  execute: async ({ inputData }) => {
    demoLogger.info('Composed local synthetic release summary', {
      releaseId: inputData.releaseId,
      decision: 'ready-for-review',
      externalActions: 0,
    });
    return {
      releaseId: inputData.releaseId,
      decision: 'ready-for-review' as const,
      ownerQueue: inputData.ownerQueue,
      externalActions: 0 as const,
    };
  },
});

export const northstarReleaseReview = createWorkflow({
  id: 'northstar-release-review',
  description: 'Local-only two-step synthetic release review.',
  inputSchema: releaseInput,
  outputSchema: releaseOutput,
})
  .then(validateRelease)
  .then(composeSummary)
  .commit();
