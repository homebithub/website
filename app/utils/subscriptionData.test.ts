import { describe, expect, it } from 'vitest';
import { resolvePaymentReference, type NormalizedPayment } from './subscriptionData';

const payment = (overrides: Partial<NormalizedPayment> = {}): NormalizedPayment => ({
  id: 'internal-payment-id', amount: 1000, currency: 'KES', status: 'completed', payment_method: 'mpesa', ...overrides,
});

describe('resolvePaymentReference', () => {
  it('prefers the customer-visible provider reference', () => {
    expect(resolvePaymentReference(payment({ mpesa_receipt_number: 'MPESA123', fingo_transaction_id: 'FINGO123', merchant_transaction_id: 'MERCHANT123' }))).toBe('MPESA123');
  });

  it('falls back through processor, merchant, then internal payment ID', () => {
    expect(resolvePaymentReference(payment({ fingo_transaction_id: 'FINGO123', merchant_transaction_id: 'MERCHANT123' }))).toBe('FINGO123');
    expect(resolvePaymentReference(payment({ merchant_transaction_id: 'MERCHANT123' }))).toBe('MERCHANT123');
    expect(resolvePaymentReference(payment())).toBe('internal-payment-id');
  });
});
