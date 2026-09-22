import { test } from 'node:test';
import assert from 'node:assert/strict';
import { orders, summarizeOrders } from './order-summary';

const paid = { batch: 'harbor-september', groupBy: 'region', includeCancelled: false };
test('paid regional close reconciles independent ledger totals and excludes canceled order', () => {
  const before = JSON.stringify(orders);
  const result = summarizeOrders(paid);
  assert.equal(result.orderCount, 5);
  assert.equal(result.units, 10);
  assert.equal(result.orderValueCents, 1939000);
  assert.deepEqual(result.excludedOrderIds, ['HV-105']);
  assert.deepEqual(result.groups.map(row => [row.group, row.orderValueCents]), [['North', 849700], ['South', 349900], ['West', 739400]]);
  assert.equal(JSON.stringify(orders), before);
});
test('failed override gives actionable source evidence and correction restores exact totals', () => {
  assert.throws(() => summarizeOrders({ ...paid, quantityOverride: -2 }), /source order quantity is 2/);
  assert.deepEqual(summarizeOrders({ ...paid, quantityOverride: 2 }), summarizeOrders(paid));
});
test('product grouping and cancellation revision change the correct values without calling them sales', () => {
  const result = summarizeOrders({ ...paid, groupBy: 'product', includeCancelled: true });
  assert.equal(result.orderCount, 6); assert.equal(result.units, 13); assert.equal(result.orderValueCents, 2118700);
  assert.deepEqual(result.groups.map(row => [row.group, row.orderValueCents]), [['Ceramic mug', 419300], ['Desk lamp', 999600], ['Linen throw', 699800]]);
  assert.match(result.valueBasis, /not recognized sales/);
  assert.equal(summarizeOrders({ ...paid, groupBy: 'product' }).groups[0].orderValueCents, 239600);
});
test('rejects malformed options instead of silently choosing consequential settings', () => {
  for (const value of [null, [], {}, { ...paid, groupBy: 'customer' }, { ...paid, includeCancelled: 'false' }, { ...paid, quantityOverride: 0 }, { ...paid, quantityOverride: 1.5 }, { ...paid, quantityOverride: 101 }, { ...paid, batch: 'other' }, { ...paid, url: 'https://example.com' }]) assert.throws(() => summarizeOrders(value));
});
