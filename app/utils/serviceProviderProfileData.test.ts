import { describe, expect, it } from 'vitest';
import { readServiceProviderProfile } from './serviceProviderProfileData';

const profile = {
  id: 'provider-profile',
  user_profile_id: 'provider-profile',
  profile_id: 'service-provider-catalogue',
  user_id: 'provider-user',
  first_name: 'Alex',
  last_name: 'Example',
  user: { id: 'provider-user', first_name: 'Alex' },
  location: { name: 'Example ward' },
  identity_verified: true,
};

describe('service provider profile responses', () => {
  it('retains the complete flat profile when migrated attributes contain empty legacy objects', () => {
    const response = { ...profile, service_provider: {}, househelp: {}, ServiceProvider: {} };
    expect(readServiceProviderProfile(response)).toEqual(response);
  });

  it('also handles the flat profile inside a data envelope', () => {
    expect(readServiceProviderProfile({ data: { ...profile, service_provider: {} } }))
      .toMatchObject(profile);
  });

  it.each(['ServiceProvider', 'service_provider', 'Househelp'])(
    'continues to support a genuine legacy %s envelope and its user', (key) => {
      const { user, ...details } = profile;
      expect(readServiceProviderProfile({ [key]: details, User: user })).toEqual(profile);
      expect(readServiceProviderProfile({ data: { [key]: details, User: user } })).toEqual(profile);
    },
  );

  it('uses the person’s user-profile ID, not the catalogue or account ID', () => {
    expect(readServiceProviderProfile({ ...profile, id: 'account-id' }).id).toBe('provider-profile');
  });

  it.each([null, undefined, {}, [], { service_provider: {} }, { data: {} }, { profile_id: 'catalogue-only' }])(
    'rejects a missing profile instead of displaying empty success: %j', (response) => {
      expect(() => readServiceProviderProfile(response)).toThrow('Please try again');
    },
  );
});
