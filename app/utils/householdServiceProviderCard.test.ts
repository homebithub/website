import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ServiceProviderCardDetails } from '~/components/listing/ServiceProviderCardDetails';

describe('household service-provider cards', () => {
  it('uses the available description and labels desktop details', () => {
    const markup = renderToStaticMarkup(React.createElement(ServiceProviderCardDetails, {
      description: 'Experienced nanny and cook',
      workTypes: ['live in', 'part time'],
      availability: 'Sep 1, 2026',
      schedule: 'Mon, Wed, Fri',
      experience: '4 yrs',
      salary: 'KES 12,000 / monthly',
      worksWith: ['children', 'pets'],
    }));

    expect(markup).toContain('Experienced nanny and cook');
    expect(markup).toContain('Preferred work');
    expect(markup).toContain('Available from');
    expect(markup).toContain('Expected pay');
    expect(markup).toContain('Can work with');
    expect(markup).toContain('hidden min-w-0 lg:block');
  });

  it('provides useful fallbacks when optional values are absent', () => {
    const markup = renderToStaticMarkup(React.createElement(ServiceProviderCardDetails, {
      workTypes: [],
      availability: 'Flexible',
      experience: 'Not specified',
      salary: 'Not specified',
    }));

    expect(markup).toContain('Flexible role');
    expect(markup).toContain('Schedule');
    expect(markup).toContain('Flexible');
    expect(markup).not.toContain('>About<');
  });

  it('uses the shared detail layout and hides inactive saved listings', () => {
    const home = readFileSync('app/components/HouseholdJobsHome.tsx', 'utf8');
    const saved = readFileSync('app/routes/household.shortlist.tsx', 'utf8');

    expect(home).toContain('<ServiceProviderCardDetails');
    expect(saved).toContain('<ServiceProviderCardDetails');
    expect(saved).toContain('visibleSavedServiceProviders');
    expect(saved).toContain('isOpenForWorkListingActive(listing)');
    expect(home).not.toContain('{formatListingStatus(listing.status)}');
  });

  it('shows interactions by default and makes hiding them an explicit filter', () => {
    const home = readFileSync('app/components/HouseholdJobsHome.tsx', 'utf8');
    const discoveryFilter = home.slice(
      home.indexOf('const filteredListings = useMemo'),
      home.indexOf('const filteredListings = useMemo') + 1_200,
    );

    expect(discoveryFilter).toContain('matchesInteractionFilters(filters');
    expect(discoveryFilter).toContain('shortlistedListingIds.has(String(listing.id))');
    expect(discoveryFilter).toContain('contactedListingIds.has(String(listing.id))');
    expect(home).toContain('contactedLabel="Messaged or invited"');
  });
});
