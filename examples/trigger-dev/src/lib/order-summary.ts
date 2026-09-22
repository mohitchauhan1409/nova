// Synthetic, immutable source ledger. No customers, recipients or external systems.
export const orders = [
  { id: 'HV-101', region: 'West', product: 'Desk lamp', quantity: 2, unitPriceCents: 249900, status: 'paid' },
  { id: 'HV-102', region: 'South', product: 'Linen throw', quantity: 1, unitPriceCents: 349900, status: 'paid' },
  { id: 'HV-103', region: 'West', product: 'Ceramic mug', quantity: 4, unitPriceCents: 59900, status: 'paid' },
  { id: 'HV-104', region: 'North', product: 'Desk lamp', quantity: 2, unitPriceCents: 249900, status: 'paid' },
  { id: 'HV-105', region: 'South', product: 'Ceramic mug', quantity: 3, unitPriceCents: 59900, status: 'cancelled' },
  { id: 'HV-106', region: 'North', product: 'Linen throw', quantity: 1, unitPriceCents: 349900, status: 'paid' },
] as const;

type Options = {
  batch: 'harbor-september';
  groupBy: 'region' | 'product';
  includeCancelled: boolean;
  quantityOverride?: number;
};

export function parseOptions(input: unknown): Options {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new Error('Provide an order-summary options object.');
  const value = input as Record<string, unknown>;
  const unknown = Object.keys(value).filter(key => !['batch', 'groupBy', 'includeCancelled', 'quantityOverride'].includes(key));
  if (unknown.length) throw new Error(`Unknown option: ${unknown.join(', ')}.`);
  if (value.batch !== 'harbor-september') throw new Error('Use the available batch harbor-september.');
  if (value.groupBy !== 'region' && value.groupBy !== 'product') throw new Error('Choose groupBy region or product.');
  if (typeof value.includeCancelled !== 'boolean') throw new Error('Set includeCancelled to true or false.');
  if (value.quantityOverride !== undefined && (!Number.isInteger(value.quantityOverride) || Number(value.quantityOverride) < 1 || Number(value.quantityOverride) > 100)) {
    throw new Error('HV-104 quantityOverride must be an integer from 1 to 100. The source order quantity is 2; remove the override to use the source quantity, or set it to 2.');
  }
  return value as Options;
}

export function summarizeOrders(input: unknown) {
  const options = parseOptions(input);
  const included = orders.filter(order => options.includeCancelled || order.status !== 'cancelled');
  const groups = new Map<string, { group: string; orderCount: number; units: number; orderValueCents: number }>();
  for (const order of included) {
    const quantity = order.id === 'HV-104' ? options.quantityOverride ?? order.quantity : order.quantity;
    const key = order[options.groupBy];
    const group = groups.get(key) ?? { group: key, orderCount: 0, units: 0, orderValueCents: 0 };
    group.orderCount += 1;
    group.units += quantity;
    group.orderValueCents += quantity * order.unitPriceCents;
    groups.set(key, group);
  }
  const rows = [...groups.values()].sort((a, b) => a.group.localeCompare(b.group, 'en'));
  const totalCents = rows.reduce((sum, row) => sum + row.orderValueCents, 0);
  return {
    business: 'Harbor & Vale', batch: options.batch, currency: 'INR',
    groupedBy: options.groupBy, includeCancelled: options.includeCancelled,
    includedOrderIds: included.map(order => order.id),
    excludedOrderIds: orders.filter(order => !included.some(item => item.id === order.id)).map(order => order.id),
    orderCount: included.length, units: rows.reduce((sum, row) => sum + row.units, 0),
    orderValueCents: totalCents, orderValue: totalCents / 100,
    valueBasis: options.includeCancelled ? 'Order value including cancellations; not recognized sales' : 'Paid-order value; cancellations excluded',
    quantityCorrection: { orderId: 'HV-104', sourceQuantity: 2, effectiveQuantity: options.quantityOverride ?? 2 },
    groups: rows.map(row => ({ ...row, orderValue: row.orderValueCents / 100 })),
  };
}
