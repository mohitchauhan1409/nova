import { logger, task } from '@trigger.dev/sdk';
import { summarizeOrders } from '../lib/order-summary';

export const harborOrderSummary = task({
  id: 'harbor-order-summary',
  maxDuration: 30,
  retry: { maxAttempts: 1 },
  run: async (payload: unknown) => {
    logger.info('Preparing Harbor & Vale order summary', { batch: 'harbor-september', sourceOrders: 6 });
    const summary = summarizeOrders(payload);
    logger.info('Order selection checked', {
      includedOrderIds: summary.includedOrderIds,
      excludedOrderIds: summary.excludedOrderIds,
      quantityCorrection: summary.quantityCorrection,
    });
    logger.info('Order summary ready', {
      groupedBy: summary.groupedBy, orderCount: summary.orderCount,
      units: summary.units, orderValue: summary.orderValue, currency: summary.currency,
      valueBasis: summary.valueBasis,
    });
    return summary;
  },
});
