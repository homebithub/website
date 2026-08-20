type SalaryFrequency = string | undefined | null;

function scaledThresholdForFrequency(frequency: SalaryFrequency): number {
  switch ((frequency || '').toLowerCase()) {
    case 'daily':
      return 50000;
    case 'weekly':
      return 200000;
    case 'monthly':
      return 500000;
    default:
      return Number.POSITIVE_INFINITY;
  }
}

export function normalizeOnboardingAmountFromStorage(value?: string | number | null, frequency?: SalaryFrequency): number {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  const threshold = scaledThresholdForFrequency(frequency);
  if (Number.isFinite(threshold) && amount >= threshold) {
    return amount / 100;
  }

  return amount;
}

export function formatOnboardingAmount(value?: string | number | null, frequency?: SalaryFrequency): string {
  const normalized = normalizeOnboardingAmountFromStorage(value, frequency);
  if (!normalized) {
    return '';
  }

  return `KES ${normalized.toLocaleString()}`;
}

export function formatOnboardingAmountWithFrequency(
  value?: string | number | null,
  frequency?: SalaryFrequency,
  emptyLabel = 'Salary not yet specified'
): string {
  const normalized = normalizeOnboardingAmountFromStorage(value, frequency);
  if (!normalized) {
    return emptyLabel;
  }

  const frequencyLabel = frequency
    ? frequency === 'daily'
      ? 'per day'
      : frequency === 'weekly'
        ? 'per week'
        : frequency === 'monthly'
          ? 'per month'
          : `per ${frequency}`
    : '';

  return `${formatOnboardingAmount(normalized, frequency)}${frequencyLabel ? ` ${frequencyLabel}` : ''}`;
}

export function formatOnboardingBudgetRange(
  min?: string | number | null,
  max?: string | number | null,
  frequency?: SalaryFrequency
): string {
  const normalizedMin = normalizeOnboardingAmountFromStorage(min, frequency);
  const normalizedMax = normalizeOnboardingAmountFromStorage(max, frequency);

  if (normalizedMin > 0 && normalizedMax > 0) {
    return `KES ${normalizedMin.toLocaleString()} - ${normalizedMax.toLocaleString()}`;
  }

  if (normalizedMin > 0) {
    return `KES ${normalizedMin.toLocaleString()}+`;
  }

  if (normalizedMax > 0) {
    return `Up to KES ${normalizedMax.toLocaleString()}`;
  }

  return 'Negotiable';
}

/**
 * Formats a salary range together with its pay period without rendering a
 * placeholder for a missing end of the range. A listing often stores a single
 * expected amount in `salary_min` and leaves `salary_max` empty; interpolating
 * both fields directly turns that valid value into output such as
 * `KES 2,000 – — monthly`.
 */
export function formatOnboardingBudgetRangeWithFrequency(
  min?: string | number | null,
  max?: string | number | null,
  frequency?: SalaryFrequency,
  emptyLabel = 'Not specified',
): string {
  const normalizedMin = normalizeOnboardingAmountFromStorage(min, frequency);
  const normalizedMax = normalizeOnboardingAmountFromStorage(max, frequency);
  if (!normalizedMin && !normalizedMax) return emptyLabel;

  const amount = normalizedMin && normalizedMax && normalizedMin !== normalizedMax
    ? `KES ${normalizedMin.toLocaleString()} - ${normalizedMax.toLocaleString()}`
    : `KES ${(normalizedMin || normalizedMax).toLocaleString()}`;
  const frequencyLabel = typeof frequency === 'string' ? frequency.trim() : '';
  return `${amount}${frequencyLabel ? ` / ${frequencyLabel}` : ''}`;
}
