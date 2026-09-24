import type { NormalizedSubscription } from './subscriptionData';

export function subscriptionStartAfter(currentExpiry: string, queued: NormalizedSubscription[], now = new Date()): Date {
  return new Date(Math.max(now.getTime(), ...[currentExpiry, ...queued.map(s => s.current_period_end)].map(value => Date.parse(value)).filter(Number.isFinite)));
}

// Match the backend's calendar-month billing, including month-end overflow.
export function subscriptionPeriodEnd(start: Date, cycle: string): Date {
  const end = new Date(start);
  const months = ({quarterly: 3, 'semi-annual': 6, semi_annual: 6, semiannual: 6, yearly: 12, annual: 12} as Record<string, number>)[cycle] || 1;
  end.setUTCMonth(end.getUTCMonth() + months);
  return end;
}
