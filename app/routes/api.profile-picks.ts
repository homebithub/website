import {
  callUnaryGrpc,
  concatBytes,
  encodeInt32Field,
  encodeMessageField,
  encodeStringField,
  resolveAuthGrpcBaseUrl,
} from '~/utils/grpcRaw.server';

function encodePick(featurePropertyId: number, weight = 1): Uint8Array {
  return concatBytes([
    encodeInt32Field(1, featurePropertyId),
    encodeInt32Field(2, weight),
  ]);
}

function encodePicksRequest(userProfileId: string, picks: Array<{ feature_property_id: number; weight?: number }>) {
  return concatBytes([
    encodeStringField(1, userProfileId),
    ...picks.map((pick) => encodeMessageField(2, encodePick(Number(pick.feature_property_id), Number(pick.weight || 1)))),
  ]);
}

export async function action({ request }: { request: Request }) {
  if (request.method !== 'POST') {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const body = await request.json();
    const userProfileId = String(body.user_profile_id || '');
    const picks = Array.isArray(body.picks) ? body.picks : [];

    if (!userProfileId) {
      return Response.json({ message: 'user_profile_id is required' }, { status: 400 });
    }

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/profile.UserProfileService/AddPicks',
      encodePicksRequest(userProfileId, picks),
    );

    return Response.json({ data: responseBody.data ?? responseBody });
  } catch (err: unknown) {
    const error = err as { message?: string; grpcCode?: string };
    return Response.json(
      {
        message: error.message || 'Unable to save picks',
        grpcCode: error.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const userProfileId = url.searchParams.get('user_profile_id') || '';

  if (!userProfileId) {
    return Response.json({ message: 'user_profile_id is required' }, { status: 400 });
  }

  try {
    const { body } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/profile.UserProfileService/ListPicks',
      encodeStringField(1, userProfileId),
    );

    return Response.json({ data: body.data ?? body });
  } catch (err: unknown) {
    const error = err as { message?: string; grpcCode?: string };
    return Response.json(
      {
        message: error.message || 'Unable to load picks',
        grpcCode: error.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
