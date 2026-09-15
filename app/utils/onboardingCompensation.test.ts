import { describe, expect, it } from 'vitest';

import {
  formatOnboardingBudgetRange,
  formatOnboardingBudgetRangeWithFrequency,
} from './onboardingCompensation';

describe('onboarding compensation formatting', () => {
  it('does not render a missing range end as a second dash', () => {
    expect(formatOnboardingBudgetRangeWithFrequency(2000, undefined, 'monthly'))
      .toBe('KES 2,000 / monthly');
  });

  it('renders a real range and its frequency once', () => {
    expect(formatOnboardingBudgetRangeWithFrequency(2000, 3000, 'weekly'))
      .toBe('KES 2,000 - 3,000 / weekly');
  });

  it('does not duplicate an amount when both ends are equal', () => {
    expect(formatOnboardingBudgetRangeWithFrequency(2000, 2000, 'monthly'))
      .toBe('KES 2,000 / monthly');
  });

  it('treats placeholder salary values as unspecified', () => {
    expect(formatOnboardingBudgetRangeWithFrequency('--', '--', 'monthly'))
      .toBe('Not specified');
  });

  it('keeps the existing range formatter semantics unchanged', () => {
    expect(formatOnboardingBudgetRange(2000, undefined, 'monthly'))
      .toBe('KES 2,000+');
  });
});
