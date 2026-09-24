import { describe, expect, it } from 'vitest';
import { subscriptionPeriodEnd, subscriptionStartAfter } from './subscriptionSchedule';
import type { NormalizedSubscription } from './subscriptionData';

describe('prepaid subscription schedule', () => {
  const now = new Date('2026-09-24T09:00:00Z');
  it('preserves current coverage and adds the full purchased period', () => {
    const start = subscriptionStartAfter('2026-10-16T09:00:00Z', [], now);
    expect(start.toISOString()).toBe('2026-10-16T09:00:00.000Z');
    expect(subscriptionPeriodEnd(start, 'quarterly').toISOString()).toBe('2027-01-16T09:00:00.000Z');
  });
  it('appends after already paid packages', () => {
    const queued = [{current_period_end:'2027-01-16T09:00:00Z'}] as NormalizedSubscription[];
    expect(subscriptionStartAfter('2026-10-16T09:00:00Z', queued, now).toISOString()).toBe('2027-01-16T09:00:00.000Z');
  });
  it('starts now when current access has expired', () => {
    expect(subscriptionStartAfter('2026-09-20T00:00:00Z', [], now)).toEqual(now);
    expect(subscriptionStartAfter('', [], now)).toEqual(now);
  });
  it('uses calendar months, including the backend month-end behavior', () => {
    expect(subscriptionPeriodEnd(new Date('2026-01-31T12:00:00Z'), 'monthly').toISOString()).toBe('2026-03-03T12:00:00.000Z');
    expect(subscriptionPeriodEnd(now, 'yearly').toISOString()).toBe('2027-09-24T09:00:00.000Z');
  });
});
