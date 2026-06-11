import {
  callUnaryGrpc,
  concatBytes,
  encodeInt32Field,
  resolveAuthGrpcBaseUrl,
} from '~/utils/grpcRaw.server';

function asData(body: Record<string, unknown>) {
  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.job_types)) return body.job_types;
  if (Array.isArray(body.features)) return body.features;
  return body.data ?? body;
}

function encodeListJobTypes(activeOnly: boolean) {
  return concatBytes([
    activeOnly ? encodeInt32Field(1, 1) : new Uint8Array(),
  ]);
}

function encodeJobTypeId(id: number) {
  return concatBytes([
    encodeInt32Field(1, id),
  ]);
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const jobTypeId = Number(url.searchParams.get('job_type_id') || 0);

  try {
    if (jobTypeId) {
      const { body } = await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        '/client_profile.ClientProfileService/GetJobTypeFeatureBundles',
        encodeJobTypeId(jobTypeId),
      );

      return Response.json({ data: asData(body) });
    }

    const activeOnly = url.searchParams.get('active_only') !== 'false';
    const { body } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/client_profile.ClientProfileService/ListJobTypes',
      encodeListJobTypes(activeOnly),
    );

    return Response.json({ data: asData(body) });
  } catch (err: any) {
    return Response.json(
      {
        message: err?.message || 'Unable to load job types',
        grpcCode: err?.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
