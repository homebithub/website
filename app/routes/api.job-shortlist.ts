import {
  callUnaryGrpc,
  concatBytes,
  encodeStringField,
  resolveAuthGrpcBaseUrl,
} from '~/utils/grpcRaw.server';

function encodeCreateApplication(body: Record<string, unknown>) {
  return concatBytes([
    encodeStringField(1, String(body.listing_id || body.listingId || '')),
    encodeStringField(2, String(body.service_provider_id || body.serviceProviderId || '')),
    encodeStringField(3, String(body.message || '')),
  ]);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const listingId = String(body.listing_id || body.listingId || '').trim();
    const serviceProviderId = String(body.service_provider_id || body.serviceProviderId || '').trim();

    if (!listingId) {
      return Response.json({ message: 'listing_id is required' }, { status: 400 });
    }

    if (!serviceProviderId) {
      return Response.json({ message: 'service_provider_id is required' }, { status: 400 });
    }

    const baseUrl = resolveAuthGrpcBaseUrl(request);
    const requestBytes = encodeCreateApplication({
      listing_id: listingId,
      service_provider_id: serviceProviderId,
      message: body.message || '',
    });

    const { body: responseBody } = await callUnaryGrpc(
      baseUrl,
      '/auth.ListingService/ShortlistListing',
      requestBytes,
    );

    return Response.json({ data: responseBody.data ?? responseBody });
  } catch (err: unknown) {
    const error = err as { message?: string; grpcCode?: string };
    return Response.json(
      {
        message: error.message || 'Unable to shortlist listing',
        grpcCode: error.grpcCode || 'UNKNOWN',
      },
      { status: 500 },
    );
  }
}
