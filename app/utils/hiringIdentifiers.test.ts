import { describe, expect, it } from 'vitest';

import { buildApplicationContractMap, buildListingHousehelpContractMap, collapseApplicationContracts, getHousehelpCandidateIds } from './hiringIdentifiers';

describe('application contract relationships', () => {
  it('prefers the signed legacy row linked to the application draft', () => {
    const rows = [
      { id: 'signed-copy', hire_contract_id: 'draft', status: 'signed_by_both' },
      { id: 'draft', application_id: '42', status: 'draft' },
    ];

    expect(buildApplicationContractMap(rows)['application:42']?.id).toBe('signed-copy');
    expect(collapseApplicationContracts(rows).map((row) => row.id)).toEqual(['signed-copy']);
  });

  it('keeps unrelated contracts while collapsing only application duplicates', () => {
    const rows = [
      { id: 'active', application_id: '7', status: 'active' },
      { id: 'draft', application_id: '7', status: 'draft' },
      { id: 'standalone', status: 'active' },
    ];

    expect(collapseApplicationContracts(rows).map((row) => row.id)).toEqual(['active', 'standalone']);
  });
});

it('links a legacy contract by listing and househelp when application_id is absent', () => {
  const rows = [{ id: 'contract', listing_id: 'listing', househelp_user_id: 'person', storage_status: 'active' }];
  expect(buildListingHousehelpContractMap(rows)['listing-househelp:listing:person']?.id).toBe('contract');
});

describe('househelp identifiers', () => {
  it.each([
    [{ applicant_profile_id: 'profile-snake' }, 'profile-snake'],
    [{ applicantProfileId: 'profile-camel' }, 'profile-camel'],
    [{ service_provider_id: 'provider-snake' }, 'provider-snake'],
    [{ serviceProviderId: 'provider-camel' }, 'provider-camel'],
    [{ applicant: { profile_id: 'nested-profile' } }, 'nested-profile'],
    [{ househelp: { user: { id: 'nested-user' } } }, 'nested-user'],
  ])('recognises every application/profile response shape', (record, expected) => {
    expect(getHousehelpCandidateIds(record)[0]).toBe(expected);
  });

  it('normalises numeric identifiers returned by Struct-backed APIs', () => {
    expect(getHousehelpCandidateIds({ service_provider_id: 42 })).toEqual(['42']);
  });
});
