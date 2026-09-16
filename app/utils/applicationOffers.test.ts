import { describe, expect, it } from 'vitest';
import { isIncomingApplicationOffer, splitProviderApplications } from './applicationOffers';

describe('incoming application offers', () => {
  it('identifies the initiated application a household sent to a provider', () => {
    expect(isIncomingApplicationOffer({
      status: 'initiated',
      initiated_by_applicant: false,
    })).toBe(true);
  });

  it('keeps a provider application out of the incoming-offer queue', () => {
    expect(isIncomingApplicationOffer({
      status: 'initiated',
      initiated_by_applicant: true,
    })).toBe(false);
  });

  it('does not turn legacy records with no initiator into actionable offers', () => {
    expect(isIncomingApplicationOffer({ status: 'initiated' })).toBe(false);
  });

  it('splits offers from the provider application history without losing any rows', () => {
    const rows = [
      { id: 'offer', status: 'initiated', initiated_by_applicant: false },
      { id: 'application', status: 'initiated', initiated_by_applicant: true },
      { id: 'accepted', status: 'accepted', initiated_by_applicant: false },
    ];

    expect(splitProviderApplications(rows)).toEqual({
      offers: [rows[0]],
      applications: [rows[1], rows[2]],
    });
  });
});
