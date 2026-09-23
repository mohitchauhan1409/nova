import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { demoLogger } from '../logger';

const riskInput = z.object({
  synthetic: z.literal(true),
  reviewId: z.string().min(1),
  mode: z.literal('fail'),
});

const riskOutput = z.object({
  reviewId: z.string(),
  status: z.string(),
});

const validateRisk = createStep({
  id: 'validate-risk',
  description: 'Fail deliberately with a recognizable synthetic error token.',
  inputSchema: riskInput,
  outputSchema: riskOutput,
  execute: async ({ inputData }) => {
    demoLogger.warn('Emitting expected local synthetic risk failure', {
      reviewId: inputData.reviewId,
      externalActions: 0,
    });
    throw new Error(`SYNTHETIC_RISK_REVIEW_FAILURE:${inputData.reviewId}`);
  },
});

export const northstarRiskCheck = createWorkflow({
  id: 'northstar-risk-check',
  description: 'Local-only synthetic risk check with an intentional failure.',
  inputSchema: riskInput,
  outputSchema: riskOutput,
})
  .then(validateRisk)
  .commit();
