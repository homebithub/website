import { describe, expect, it } from 'vitest';
import {
  fallbackSignupProfileOptions,
  normalizeSignupProfileOptions,
  signupProfileDescriptions,
} from './signupProfiles';

describe('signup profile choices', () => {
  it('replaces legacy occupation-specific catalogue copy with inclusive descriptions', () => {
    const choices = normalizeSignupProfileOptions([
      {
        id: 'household-id',
        name: 'Household',
        slug: 'household',
        type: 'CLT',
        description: 'Client household profile',
      },
      {
        id: 'provider-id',
        name: 'Househelp',
        slug: 'househelp',
        type: 'SVC_PVD',
        description: 'Service provider househelp profile',
      },
    ]);

    expect(choices).toEqual([
      expect.objectContaining({
        id: 'household-id',
        value: 'household',
        label: 'Household',
        description: signupProfileDescriptions.household,
      }),
      expect.objectContaining({
        id: 'provider-id',
        value: 'service_provider',
        label: 'Service provider',
        description: signupProfileDescriptions.service_provider,
      }),
    ]);
    expect(choices.map((choice) => choice.description).join(' ').toLowerCase()).not.toContain('househelp');
  });

  it('uses the same inclusive wording when the catalogue is unavailable', () => {
    expect(normalizeSignupProfileOptions([])).toEqual(fallbackSignupProfileOptions);
  });
});
