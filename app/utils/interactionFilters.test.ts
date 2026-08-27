import { describe, expect, it } from 'vitest';
import { matchesInteractionFilters } from './interactionFilters';

describe('interaction filters', () => {
  it('shows interacted listings by default', () => {
    expect(matchesInteractionFilters({}, { saved: true, contacted: true, applied: true })).toBe(true);
  });

  it('can hide saved, contacted, and applied listings independently', () => {
    expect(matchesInteractionFilters({ hideSaved: true }, { saved: true })).toBe(false);
    expect(matchesInteractionFilters({ hideContacted: true }, { contacted: true })).toBe(false);
    expect(matchesInteractionFilters({ hideApplied: true }, { applied: true })).toBe(false);
    expect(matchesInteractionFilters({ hideApplied: true }, { contacted: true })).toBe(true);
  });

  it('supports combinations used by named saved filters', () => {
    const filters = { hideSaved: true, hideContacted: true, hideApplied: true };
    expect(matchesInteractionFilters(filters, {})).toBe(true);
    expect(matchesInteractionFilters(filters, { contacted: true })).toBe(false);
    expect(matchesInteractionFilters(filters, { applied: true })).toBe(false);
  });
});
