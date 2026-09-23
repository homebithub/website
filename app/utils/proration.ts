import type { ProrationDetails } from '~/types/payments';

export function normalizeProration(response: any): ProrationDetails {
  const raw = response?.getProration?.()?.toObject?.()
    ?? response?.toObject?.()?.proration ?? response?.proration ?? response;
  const number = (snake: string, camel: string) => {
    const value = raw?.[snake] ?? raw?.[camel];
    if (value === undefined || value === null || value === '' || !Number.isFinite(Number(value))) {
      throw new Error('Unable to calculate this plan change. Please retry.');
    }
    return Number(value);
  };
  const result = {
    unused_credit: number('unused_credit', 'unusedCredit'),
    prorated_charge: number('prorated_charge', 'proratedCharge'),
    net_amount: number('net_amount', 'netAmount'),
    days_used: number('days_used', 'daysUsed'),
    days_remaining: number('days_remaining', 'daysRemaining'),
    total_days: number('total_days', 'totalDays'),
    description: String(raw?.description || ''),
  };
  if (result.days_remaining < 0 || result.days_remaining > 36600 || result.total_days < 0) {
    throw new Error('The billing period is invalid. Please retry.');
  }
  return result;
}
