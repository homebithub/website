import {
  callUnaryGrpc,
  encodeStringField,
  resolveAuthGrpcBaseUrl,
} from '~/utils/grpcRaw.server';

function asData(body: Record<string, unknown>) {
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.features)) return body.features;
  return body.data ?? body;
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const profileId = url.searchParams.get('profile_id') || '';

  if (!profileId) {
    return Response.json({ message: 'profile_id is required' }, { status: 400 });
  }

  try {
    const { body } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/profile.ProfileService/GetProfileFeatures',
      encodeStringField(1, profileId),
    );

    return Response.json({ data: asData(body) });
  } catch (err: any) {
    return Response.json(
      {
        message: err?.message || 'Unable to load profile features',
        grpcCode: err?.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
