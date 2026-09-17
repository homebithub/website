import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ call: vi.fn(), json: vi.fn() }));
vi.mock('~/utils/grpcRaw.server', () => ({ callUnaryGrpc: mocks.call, callUnaryGrpcJson: mocks.json, resolveAuthGrpcBaseUrl: () => 'auth', authMetadata: () => ({ authorization: 'Bearer test' }) }));
vi.mock('~/utils/premium.server', () => ({ attachPremiumStatus: async (_base: string, rows: unknown[]) => rows }));
import { loader } from '../routes/api.job-listings';

describe('Saved uses discovery enrichment', () => {
  beforeEach(() => {
    mocks.call.mockReset(); mocks.json.mockReset();
    mocks.call.mockImplementation(async (_base, method) => {
      if (method.endsWith('/GetJobListing')) return { body: { data: { id: 25, title: 'Saved job', applicant_count: 2, max_applicants: 15 } } };
      if (method.endsWith('/MatchListings')) return { body: { data: [{ listing_id: 25, match_score: 60, reasons: ['same_ward'] }] } };
      return { body: { data: [] } };
    });
  });
  it('returns requested jobs with counts and the same match data as discovery', async () => {
    const res = await loader({ request: new Request('http://localhost/api/job-listings?ids=25&owner=household&match_for=provider') });
    expect(res.status).toBe(200);
    expect((await res.json()).data[0]).toMatchObject({ id: 25, applicant_count: 2, max_applicants: 15, fit_score: 60 });
    expect(mocks.call.mock.calls.some((call) => call[1].endsWith('/ListJobs'))).toBe(false);
  });
  it('uses the provider detail endpoint for saved providers', async () => {
    mocks.json.mockResolvedValue({ body: { data: { id: 25, first_name: 'Provider' } } });
    const res = await loader({ request: new Request('http://localhost/api/job-listings?ids=25&owner=service_provider') });
    expect((await res.json()).data[0]).toMatchObject({ id: 25, first_name: 'Provider' });
    expect(mocks.json.mock.calls[0][1]).toBe('/auth.OpenForWorkService/GetOpenForWork');
  });
  it('omits deleted bookmarks but does not disguise service failures as an empty Saved page', async () => {
    mocks.call.mockRejectedValueOnce({ grpcCode: 'NOT_FOUND' });
    const deleted = await loader({ request: new Request('http://localhost/api/job-listings?ids=25') });
    expect((await deleted.json()).data).toEqual([]);
    mocks.call.mockRejectedValueOnce({ grpcCode: 'UNAVAILABLE' });
    const outage = await loader({ request: new Request('http://localhost/api/job-listings?ids=25') });
    expect(outage.status).toBe(503);
  });
  it('rejects invalid or oversized pages before fetching listings', async () => {
    for (const ids of ['invalid', Array.from({ length: 21 }, (_, i) => i + 1).join(',')]) {
      expect((await loader({ request: new Request('http://localhost/api/job-listings?ids=' + ids) })).status).toBe(400);
    }
    expect(mocks.call).not.toHaveBeenCalled();
  });
});
