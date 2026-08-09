import type { PaymentRecord } from '@/types';

/**
 * DEMO payment only.
 *
 * No gateway is integrated. No card, wallet, or bank credential is collected,
 * and no money moves. `simulated: true` is stamped on every record and the UI
 * surfaces it — a payment flow that looks real but is not must say so.
 *
 * The shape here is deliberately what a real integration would return, so
 * swapping in eSewa/Khalti later is a change inside this module rather than a
 * change to every caller.
 */

const AMOUNT_NPR = 5;

function makeTransactionId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `KAWACH-DEMO-${n}`;
}

export async function payDemo(
  method: 'esewa' | 'khalti' | 'demo',
): Promise<PaymentRecord> {
  // Enough delay to read the processing state; not enough to feel stalled.
  await new Promise((resolve) => setTimeout(resolve, 1100));

  return {
    paid: true,
    transactionId: makeTransactionId(),
    method,
    amountNPR: AMOUNT_NPR,
    paidAt: new Date().toISOString(),
    simulated: true,
  };
}
