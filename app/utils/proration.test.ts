import { describe, expect, it } from 'vitest';
import pb from '../grpc/generated/payments/payments_pb';
import { normalizeProration } from './proration';

describe('plan change preview', () => {
  it('decodes actual generated responses without crashing the billing date', () => {
    const details = new (pb as any).ProrationDetails();
    details.setDaysRemaining(12);
    details.setNetAmount(-100);
    const response = new (pb as any).PreviewProrationResponse();
    response.setProration(details);
    const result = normalizeProration(response);
    expect(result.days_remaining).toBe(12);
    expect(result.net_amount).toBe(-100);
    expect(() => new Date(Date.now() + result.days_remaining * 86400000).toISOString()).not.toThrow();
    expect(normalizeProration(response.toObject())).toEqual(result);
  });
  it('refuses incomplete and invalid previews instead of enabling confirmation', () => {
    expect(() => normalizeProration({})).toThrow();
    expect(() => normalizeProration({ daysRemaining: NaN })).toThrow();
  });
});
