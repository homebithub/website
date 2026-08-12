import { describe, expect, it } from 'vitest';
import { allowedPropertyNames, isSingleSelectFeature, propertyAllowed } from './preferenceRules';

describe('preference rules', () => {
  it('treats decision fields as single-select', () => {
    expect(isSingleSelectFeature('WorkArrangement')).toBe(true);
    expect(isSingleSelectFeature('Salary Range')).toBe(true);
    expect(isSingleSelectFeature('Language')).toBe(false);
  });

  it('locks a live-in listing to daily engagement', () => {
    const allowed = allowedPropertyNames('EngagementFrequency', 'Live-in');
    expect(propertyAllowed('Daily', allowed)).toBe(true);
    expect(propertyAllowed('Once a week', allowed)).toBe(false);
  });

  it('prioritizes monthly salary bands for live-in work', () => {
    const allowed = allowedPropertyNames('SalaryRange', 'Live-in');
    expect(propertyAllowed('monthly: 15,000-25,000 KES', allowed)).toBe(true);
    expect(propertyAllowed('daily: 1,500-2,000 KES', allowed)).toBe(false);
  });

  it('keeps daily and weekly rates for day workers', () => {
    const allowed = allowedPropertyNames('SalaryRange', 'Day worker');
    expect(propertyAllowed('daily: Negotiable', allowed)).toBe(true);
    expect(propertyAllowed('weekly: 5,000-7,500 KES', allowed)).toBe(true);
    expect(propertyAllowed('monthly: 25,000+ KES', allowed)).toBe(false);
  });
});
