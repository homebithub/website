import {
  callUnaryGrpc,
  concatBytes,
  encodeInt32Field,
  encodeStringField,
  resolveAuthGrpcBaseUrl,
} from '~/utils/grpcRaw.server';

function encodeListApplicationsRequest(params: URLSearchParams) {
  const limit = Number(params.get('limit') || '20');
  const offset = Number(params.get('offset') || '0');
  const listingId = String(params.get('listing_id') || params.get('listingId') || '');
  const applicantProfileId = String(params.get('applicant_profile_id') || params.get('applicantProfileId') || '');
  const statuses = params.getAll('status').concat(params.getAll('statuses')).filter(Boolean);

  return concatBytes([
    encodeStringField(1, listingId),
    encodeStringField(2, applicantProfileId),
    ...statuses.map((status) => encodeStringField(3, status)),
    encodeInt32Field(4, Number.isFinite(limit) ? limit : 20),
    encodeInt32Field(5, Number.isFinite(offset) ? offset : 0),
  ]);
}

function encodeIdRequest(id: string) {
  return concatBytes([
    encodeStringField(1, id),
  ]);
}

function normalizeArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  if (Array.isArray(record.data)) return normalizeArray(record.data);
  if (Array.isArray(record.items)) return normalizeArray(record.items);
  if (Array.isArray(record.applications)) return normalizeArray(record.applications);

  return [];
}

async function getJobListing(baseUrl: string, id: string) {
  if (!id) return {};
  const { body } = await callUnaryGrpc(
    baseUrl,
    '/auth.ListingService/GetJobListing',
    encodeIdRequest(id),
  );
  const payload = body.data ?? body;
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : {};
}

export async function loader({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const baseUrl = resolveAuthGrpcBaseUrl(request);

    const { body } = await callUnaryGrpc(
      baseUrl,
      '/auth.ListingService/ListApplications',
      encodeListApplicationsRequest(url.searchParams),
    );

    const applications = normalizeArray(body.data ?? body);
    const data = await Promise.all(applications.map(async (application) => {
      const listingId = String(application.listing_id || application.listingId || '');
      const listing = await getJobListing(baseUrl, listingId).catch(() => ({}));

      return {
        ...listing,
        application,
        application_id: application.id,
        application_status: application.status,
        id: String((listing as Record<string, unknown>).id || listingId),
        listing_id: listingId,
      };
    }));

    return Response.json({ data });
  } catch (err: unknown) {
    console.warn('Unable to list applications:', err);
    return Response.json({ data: [] });
  }
}
