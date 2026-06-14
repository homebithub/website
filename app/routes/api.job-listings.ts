function encodeStringField(fieldNo: number, value: string): Uint8Array {
  if (!value) return new Uint8Array();
  const encoded = new TextEncoder().encode(value);
  return concatBytes([encodeVarint((fieldNo << 3) | 2), encodeVarint(encoded.length), encoded]);
}

function encodeInt32Field(fieldNo: number, value: number): Uint8Array {
  if (!Number.isFinite(value) || value === 0) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 0), encodeVarint(value)]);
}

function encodeInt64Field(fieldNo: number, value: number): Uint8Array {
  if (!Number.isFinite(value) || value === 0) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 0), encodeVarint(value)]);
}

function encodeMessageField(fieldNo: number, value: Uint8Array): Uint8Array {
  if (!value.length) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 2), encodeVarint(value.length), value]);
}

function concatBytes(parts: Uint8Array[]): Uint8Array {
  const length = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function encodeVarint(value: number): Uint8Array {
  const out: number[] = [];
  let next = value >>> 0;
  while (next > 127) {
    out.push((next & 0x7f) | 0x80);
    next >>>= 7;
  }
  out.push(next);
  return Uint8Array.from(out);
}

function encodeListRequest(params: URLSearchParams) {
  const limit = Number(params.get('limit') || '20');
  const offset = Number(params.get('offset') || '0');
  const userProfileId = String(params.get('user_profile_id') || params.get('userProfileId') || '');
  const status = String(params.get('status') || '');

  return concatBytes([
    encodeInt32Field(1, Number.isFinite(limit) ? limit : 20),
    encodeInt32Field(2, Number.isFinite(offset) ? offset : 0),
    encodeStringField(3, userProfileId),
    encodeStringField(4, status),
  ]);
}

function encodeCreateListingReq(body: Record<string, unknown>) {
  const features = Array.isArray(body.features) ? body.features : [];
  return concatBytes([
    encodeStringField(1, String(body.user_profile_id || body.userProfileId || '')),
    encodeStringField(2, String(body.title || '')),
    encodeStringField(3, String(body.description || '')),
    encodeInt32Field(4, Number(body.job_type_id || body.jobTypeId || 0)),
    ...features.map((feature) => encodeMessageField(5, encodeFeaturePick(feature as Record<string, unknown>))),
  ]);
}

function encodeUpdateJobReq(body: Record<string, unknown>) {
  return concatBytes([
    encodeStringField(1, String(body.id || '')),
    encodeStringField(2, String(body.title || '')),
    encodeStringField(3, String(body.description || '')),
  ]);
}

function encodeIdRequest(id: string) {
  return concatBytes([
    encodeStringField(1, id),
  ]);
}

function encodeListingIdRequest(id: number) {
  return concatBytes([
    encodeInt64Field(1, id),
  ]);
}

function encodeFeaturePick(feature: Record<string, unknown>) {
  const propertyIds = Array.isArray(feature.property_ids)
    ? feature.property_ids
    : Array.isArray(feature.propertyIds)
      ? feature.propertyIds
      : [];

  return concatBytes([
    encodeInt32Field(1, Number(feature.feature_id || feature.featureId || 0)),
    ...propertyIds.map((id) => encodeInt32Field(2, Number(id))),
    encodeInt32Field(3, Number(feature.weight || 1)),
    encodeStringField(4, String(feature.value || '')),
  ]);
}

function extractListingId(value: unknown): number {
  if (!value || typeof value !== 'object') return 0;
  const record = value as Record<string, unknown>;
  const nested = record.data && typeof record.data === 'object' ? record.data as Record<string, unknown> : {};
  return Number(record.id || record.listing_id || record.listingId || nested.id || nested.listing_id || nested.listingId || 0);
}

function normalizeArray(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) return value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object');
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  if (Array.isArray(record.data)) return normalizeArray(record.data);
  if (Array.isArray(record.items)) return normalizeArray(record.items);
  if (Array.isArray(record.features)) return normalizeArray(record.features);
  if (Array.isArray(record.listings)) return normalizeArray(record.listings);

  return [];
}

function featureID(value: Record<string, unknown>): number {
  const feature = value.feature && typeof value.feature === 'object' ? value.feature as Record<string, unknown> : {};
  return Number(value.feature_id || value.featureId || feature.id || 0);
}

function propertyID(value: Record<string, unknown>): number {
  const property = value.property && typeof value.property === 'object' ? value.property as Record<string, unknown> : {};
  return Number(value.feature_property_id || value.featurePropertyId || value.property_id || value.propertyId || property.id || 0);
}

function displayName(value: unknown, fallback: string): string {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, unknown>;
  return String(record.name || record.title || record.description || fallback);
}

function buildFeatureLookup(bundles: Record<string, unknown>[]) {
  const features = new Map<number, string>();
  const properties = new Map<number, string>();

  for (const bundle of bundles) {
    const id = featureID(bundle);
    if (id) {
      features.set(id, displayName(bundle.feature, displayName(bundle, `Feature #${id}`)));
    }

    for (const property of normalizeArray(bundle.properties || bundle.feature_properties || bundle.options)) {
      const pid = propertyID(property);
      if (pid) properties.set(pid, displayName(property, `Property #${pid}`));
    }
  }

  return { features, properties };
}

function groupListingFeatures(rows: Record<string, unknown>[], bundles: Record<string, unknown>[]) {
  const lookup = buildFeatureLookup(bundles);
  const groups = new Map<number, { feature_id: number; feature_name: string; properties: string[] }>();

  for (const row of rows) {
    const fid = featureID(row);
    const pid = propertyID(row);
    if (!fid && !pid && !row.value) continue;

    const rowFeature = row.feature && typeof row.feature === 'object' ? row.feature as Record<string, unknown> : null;
    const rowProperty = row.property && typeof row.property === 'object' ? row.property as Record<string, unknown> : null;
    const featureName = lookup.features.get(fid) || displayName(rowFeature, fid ? `Feature #${fid}` : 'Feature');
    const propertyName = String(
      row.value ||
      lookup.properties.get(pid) ||
      displayName(rowProperty, pid ? `Property #${pid}` : 'Value'),
    );

    const group = groups.get(fid) || { feature_id: fid, feature_name: featureName, properties: [] };
    if (propertyName && !group.properties.includes(propertyName)) {
      group.properties.push(propertyName);
    }
    groups.set(fid, group);
  }

  return Array.from(groups.values()).filter((group) => group.properties.length > 0);
}

async function getListingFeatureRows(baseUrl: string, listingId: number, callUnaryGrpc: any) {
  const { body } = await callUnaryGrpc(
    baseUrl,
    '/client_profile.ClientProfileService/GetListingFeatureProperties',
    encodeListingIdRequest(listingId),
  );
  return normalizeArray(body.data ?? body);
}

async function getJobTypeBundles(baseUrl: string, jobTypeId: number, callUnaryGrpc: any) {
  if (!jobTypeId) return [];
  const { body } = await callUnaryGrpc(
    baseUrl,
    '/client_profile.ClientProfileService/GetJobTypeFeatureBundles',
    encodeInt32Field(1, jobTypeId),
  );
  return normalizeArray(body.data ?? body);
}

async function getJobListing(baseUrl: string, id: number, callUnaryGrpc: any) {
  const { body } = await callUnaryGrpc(
    baseUrl,
    '/auth.ListingService/GetJobListing',
    encodeIdRequest(String(id)),
  );
  const payload = body.data ?? body;
  return payload && typeof payload === 'object' && !Array.isArray(payload)
    ? payload as Record<string, unknown>
    : {};
}

async function enrichListingsWithFeatures(baseUrl: string, listings: Record<string, unknown>[], callUnaryGrpc: any) {
  return Promise.all(listings.map(async (listing) => {
    const listingId = extractListingId(listing);
    if (!listingId) return listing;

    try {
      const rows = await getListingFeatureRows(baseUrl, listingId, callUnaryGrpc);
      const jobTypeID = Number(listing.job_type_id || listing.jobTypeId || 0);
      const bundles = await getJobTypeBundles(baseUrl, jobTypeID, callUnaryGrpc).catch(() => []);

      return {
        ...listing,
        listing_features: rows,
        listing_feature_groups: groupListingFeatures(rows, bundles),
      };
    } catch {
      return {
        ...listing,
        listing_features: [],
        listing_feature_groups: [],
      };
    }
  }));
}

export async function loader({ request }: { request: Request }) {
  try {
    const { callUnaryGrpc, resolveAuthGrpcBaseUrl } = await import('~/utils/grpcRaw.server');
    const url = new URL(request.url);
    const baseUrl = resolveAuthGrpcBaseUrl(request);
    const requestedId = Number(url.searchParams.get('id') || url.searchParams.get('listing_id') || 0);
    const hydrateWithGetListing = url.searchParams.get('hydrate') === 'get';

    if (requestedId) {
      const listing = await getJobListing(baseUrl, requestedId, callUnaryGrpc);
      const enriched = await enrichListingsWithFeatures(baseUrl, [listing], callUnaryGrpc);
      return Response.json({ data: enriched[0] ?? listing });
    }

    const { body: responseBody } = await callUnaryGrpc(
      baseUrl,
      '/auth.ListingService/ListJobs',
      encodeListRequest(url.searchParams),
    );

    const payload = responseBody.data ?? responseBody;
    const listings = normalizeArray(payload);
    const hydratedListings = hydrateWithGetListing
      ? await Promise.all(listings.map(async (listing) => {
        const listingId = extractListingId(listing);
        if (!listingId) return listing;
        return { ...listing, ...await getJobListing(baseUrl, listingId, callUnaryGrpc).catch(() => ({})) };
      }))
      : listings;
    const enriched = await enrichListingsWithFeatures(baseUrl, hydratedListings, callUnaryGrpc);

    return Response.json({ data: enriched });
  } catch (err: unknown) {
    console.warn('Unable to list job listings:', err);
    return Response.json({ data: [] });
  }
}

export async function action({ request }: { request: Request }) {
  if (!['POST', 'PATCH', 'DELETE'].includes(request.method)) {
    return Response.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    const { callUnaryGrpc, resolveAuthGrpcBaseUrl } = await import('~/utils/grpcRaw.server');
    const body = await request.json();
    const action = String(body.action || '').trim();
    const id = String(body.id || '').trim();

    if (request.method === 'PATCH') {
      const title = String(body.title || '').trim();
      const description = String(body.description || '').trim();

      if (!id) {
        return Response.json({ message: 'id is required' }, { status: 400 });
      }

      if (!title || !description) {
        return Response.json({ message: 'title and description are required' }, { status: 400 });
      }

      const { body: responseBody } = await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        '/auth.ListingService/UpdateJob',
        encodeUpdateJobReq({ ...body, id, title, description }),
      );

      return Response.json({ data: responseBody.data ?? responseBody });
    }

    if (request.method === 'DELETE') {
      if (!id) {
        return Response.json({ message: 'id is required' }, { status: 400 });
      }

      const rpcPath = action === 'close'
        ? '/auth.ListingService/CloseListing'
        : action === 'reopen'
          ? '/auth.ListingService/ReopenListing'
          : '/auth.ListingService/DeleteJob';

      const { body: responseBody } = await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        rpcPath,
        encodeIdRequest(id),
      );

      return Response.json({ data: responseBody.data ?? responseBody });
    }

    const userProfileId = String(body.user_profile_id || body.userProfileId || '');
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();

    if (!userProfileId) {
      return Response.json({ message: 'user_profile_id is required' }, { status: 400 });
    }

    if (!title || !description) {
      return Response.json({ message: 'title and description are required' }, { status: 400 });
    }

    const { body: responseBody } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/auth.ListingService/CreateListing',
      encodeCreateListingReq({
        user_profile_id: userProfileId,
        title,
        description,
        job_type_id: body.job_type_id || body.jobTypeId,
        features: Array.isArray(body.features) ? body.features : [],
      }),
    );

    const listing = responseBody.data ?? responseBody;
    return Response.json({ data: listing });
  } catch (err: unknown) {
    const error = err as { message?: string; grpcCode?: string };
    return Response.json(
      {
        message: error.message || 'Unable to create listing',
        grpcCode: error.grpcCode || 'UNKNOWN',
      },
      { status: 400 },
    );
  }
}
