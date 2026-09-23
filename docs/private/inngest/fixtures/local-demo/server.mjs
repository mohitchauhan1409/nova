import { createServer } from 'node:http';
import { Inngest } from 'inngest';
import { serve } from 'inngest/node';

const inngest = new Inngest({ id: 'nova-inngest-local-demo' });

const releaseReview = inngest.createFunction(
  { id: 'northstar-release-review', retries: 0, triggers: { event: 'nova/release.review.requested' } },
  async ({ event, step }) => {
    const validated = await step.run('validate-release', () => ({
      releaseId: String(event.data.releaseId),
      synthetic: event.data.synthetic === true,
      valid: event.data.synthetic === true,
    }));
    return step.run('compose-summary', () => ({
      outcome: validated.valid ? 'ready-for-private-rehearsal' : 'invalid-fixture',
      releaseId: validated.releaseId,
      externalActions: 0,
    }));
  },
);

const riskCheck = inngest.createFunction(
  { id: 'northstar-risk-check', retries: 1, triggers: { event: 'nova/risk.review.requested' } },
  async ({ event, step }) => {
    await step.run('validate-risk', () => {
      if (event.data.synthetic !== true || event.data.mode !== 'fail') {
        return { reviewId: String(event.data.reviewId), fixture: false };
      }
      throw new Error('SYNTHETIC_RISK_REVIEW_FAILURE');
    });
    return { reviewId: String(event.data.reviewId), unexpectedSuccess: true };
  },
);

const handler = serve({ client: inngest, functions: [releaseReview, riskCheck] });

createServer(handler).listen(3000, '127.0.0.1', () => {
  console.log('Nova Inngest local fixture listening at http://127.0.0.1:3000/api/inngest');
});
