import { getAccessTokenFromCookies } from '~/utils/cookie';

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

function encodeBoolField(fieldNo: number, value: boolean): Uint8Array {
  if (!value) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 0), encodeVarint(1)]);
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

  // Location filters. Only the most specific one the caller supplied is sent —
  // the service picks ward over subcounty over county, so passing all three
  // would just be noise on the wire.
  const wardId = Number(params.get('ward_id') || params.get('wardId') || '0');
  const subcountyId = Number(params.get('subcounty_id') || params.get('subcountyId') || '0');
  const countyId = Number(params.get('county_id') || params.get('countyId') || '0');

  const jobTypeId = Number(params.get('job_type_id') || params.get('jobTypeId') || '0');

  // Catalogue property ids the listing must carry — a chore, a salary range.
  // Repeated scalars are emitted unpacked, one field entry each, which proto3
  // parsers accept alongside the packed form.
  const propertyIds = String(params.get('property_ids') || params.get('propertyIds') || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);

  return concatBytes([
    encodeInt32Field(1, Number.isFinite(limit) ? limit : 20),
    encodeInt32Field(2, Number.isFinite(offset) ? offset : 0),
    encodeStringField(3, userProfileId),
    encodeStringField(4, status),
    encodeInt32Field(5, Number.isFinite(countyId) ? countyId : 0),
    encodeInt32Field(6, Number.isFinite(subcountyId) ? subcountyId : 0),
    encodeInt32Field(7, Number.isFinite(wardId) ? wardId : 0),
    encodeInt32Field(8, Number.isFinite(jobTypeId) ? jobTypeId : 0),
    ...propertyIds.map((id) => encodeInt32Field(9, id)),
    // Which side of the market posted it. Empty means both, which is what every
    // caller got before this field existed.
    encodeStringField(10, String(params.get('owner') || '')),
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
    // Where the work is. The service rejects a listing without it, since a job
    // nobody can place is a job the right househelps never find.
    encodeInt32Field(6, Number(body.ward_id || body.wardId || 0)),
  ]);
}

function encodeCreateApplication(body: Record<string, unknown>) {
  return concatBytes([
    encodeStringField(1, String(body.listing_id || body.listingId || body.id || '')),
    encodeStringField(2, String(body.service_provider_id || body.serviceProviderId || '')),
    encodeStringField(3, String(body.message || '')),
  ]);
}

function encodeListApplicationsRequest(params: URLSearchParams) {
  const statuses = String(params.get('statuses') || '')
    .split(',')
    .map((status) => status.trim())
    .filter(Boolean);

  return concatBytes([
    encodeStringField(1, String(params.get('listing_id') || params.get('listingId') || '')),
    encodeStringField(2, String(params.get('applicant_profile_id') || params.get('applicantProfileId') || '')),
    ...statuses.map((status) => encodeStringField(3, status)),
    encodeInt32Field(4, Number(params.get('limit') || '20')),
    encodeInt32Field(5, Number(params.get('offset') || '0')),
    // Every application across the listings this profile owns — the household
    // hiring workspace's query.
    encodeStringField(6, String(params.get('owner_profile_id') || params.get('ownerProfileId') || '')),
  ]);
}

function encodeApplicationAction(body: Record<string, unknown>) {
  return concatBytes([
    encodeInt64Field(1, Number(body.application_id || body.applicationId || body.id || 0)),
    encodeStringField(2, String(body.actor_profile_id || body.actorProfileId || '')),
  ]);
}

function encodeUpdateJobReq(body: Record<string, unknown>) {
  const features = Array.isArray(body.features) ? body.features : [];
  // Sent explicitly rather than inferred from a non-empty list: clearing every
  // feature and not editing features at all both arrive as an empty list, and
  // the service must be able to tell them apart.
  const replaceFeatures = Boolean(body.replace_features ?? body.replaceFeatures);

  return concatBytes([
    encodeStringField(1, String(body.id || '')),
    encodeStringField(2, String(body.title || '')),
    encodeStringField(3, String(body.description || '')),
    // Omitted when zero, which the service reads as "leave the location alone".
    encodeInt32Field(4, Number(body.ward_id || body.wardId || 0)),
    ...features.map((feature) => encodeMessageField(5, encodeFeaturePick(feature as Record<string, unknown>))),
    encodeBoolField(6, replaceFeatures),
  ]);
}

function encodeIdRequest(id: string, userId = '') {
  return concatBytes([
    encodeStringField(1, id),
    // IdRequest carries the caller in field 2. Renewing needs it, since only the
    // household that owns a listing may keep it alive.
    encodeStringField(2, userId),
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

// ─── Relevance ───────────────────────────────────────────────────────────────

// Scores every open listing for one service provider — how much of what they
// asked for each job offers.
// authMetadata forwards the caller's access token to auth as gRPC metadata.
//
// Returns an empty object when there is no token rather than throwing: the
// match calls already degrade to an unranked list, and a signed-out visitor
// browsing listings should still get listings.
function authMetadata(request: Request): Record<string, string> {
  const token = getAccessTokenFromCookies(request.headers.get('cookie'));
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function matchListingsFor(
  baseUrl: string,
  userProfileId: string,
  callUnaryGrpc: any,
  metadata: Record<string, string>,
) {
  const { body } = await callUnaryGrpc(
    baseUrl,
    '/client_profile.ClientProfileService/MatchListings',
    encodeStringField(1, userProfileId),
    metadata,
  );
  return normalizeArray(body.data ?? body);
}

// Scores service providers against one of the household's own listings.
async function matchCandidatesForListing(
  baseUrl: string,
  listingId: number,
  callUnaryGrpc: any,
  metadata: Record<string, string>,
) {
  const { body } = await callUnaryGrpc(
    baseUrl,
    '/client_profile.ClientProfileService/MatchCandidates',
    encodeInt64Field(1, listingId),
    metadata,
  );
  return normalizeArray(body.data ?? body);
}

// The household's own job to rank candidates against — the newest active one.
//
// A household with several open jobs is ranked against its most recent, which
// is the one it is most likely to be filling. Ranking against all of them and
// taking the best score would read better but costs a query per listing on
// every page load, and this can be revisited when anyone has enough jobs for
// the difference to show.
async function newestListingFor(baseUrl: string, userProfileId: string, callUnaryGrpc: any): Promise<number> {
  const params = new URLSearchParams({ limit: '1', offset: '0', user_profile_id: userProfileId, status: 'active' });
  const { body } = await callUnaryGrpc(baseUrl, '/auth.ListingService/ListJobs', encodeListRequest(params));
  const rows = normalizeArray(body.data ?? body);
  return rows.length > 0 ? extractListingId(rows[0]) : 0;
}

/**
 * Annotates listings with how well they match, keyed by whichever id the
 * direction produces.
 *
 * A listing with no score keeps fit_score undefined rather than zero. The two
 * are different: zero is "scored and irrelevant", undefined is "not scored" —
 * which is the normal state early on, when a person has answered little and the
 * catalogue is thin. The caller ranks scored listings first and leaves the rest
 * in their existing order beneath, so a sparse match widens the net instead of
 * emptying the page.
 */
function annotateWithScores(
  listings: Record<string, unknown>[],
  scores: Map<string, { score: number; reasons: string[] }>,
  keyOf: (listing: Record<string, unknown>) => string,
) {
  if (scores.size === 0) return listings;
  return listings.map((listing) => {
    const match = scores.get(keyOf(listing));
    if (!match) return listing;
    return {
      ...listing,
      fit_score: match.score,
      // Why it matched, so the card can say more than a percentage. Feature
      // names arrive as the catalogue stores them and are humanised on render,
      // the same as everywhere else a feature name is shown.
      match_reasons: match.reasons,
    };
  });
}

function scoreMap(rows: Record<string, unknown>[], idKey: string) {
  const scores = new Map<string, { score: number; reasons: string[] }>();
  for (const row of rows) {
    const id = String(row[idKey] ?? '');
    const score = Number(row.match_score ?? 0);
    if (!id || !Number.isFinite(score) || score <= 0) continue;
    const reasons = Array.isArray(row.reasons) ? row.reasons.map(String).filter(Boolean) : [];
    scores.set(id, { score, reasons });
  }
  return scores;
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
    const { callUnaryGrpc, callUnaryGrpcJson, resolveAuthGrpcBaseUrl } = await import('~/utils/grpcRaw.server');
    const url = new URL(request.url);
    const baseUrl = resolveAuthGrpcBaseUrl(request);
    const requestedId = Number(url.searchParams.get('id') || url.searchParams.get('listing_id') || 0);
    const hydrateWithGetListing = url.searchParams.get('hydrate') === 'get';

    if (url.searchParams.get('action') === 'applications') {
      const { body } = await callUnaryGrpc(
        baseUrl,
        '/auth.ListingService/ListApplications',
        encodeListApplicationsRequest(url.searchParams),
      );
      return Response.json({ data: normalizeArray(body.data ?? body) });
    }

    if (requestedId) {
      const listing = await getJobListing(baseUrl, requestedId, callUnaryGrpc);
      const enriched = await enrichListingsWithFeatures(baseUrl, [listing], callUnaryGrpc);
      return Response.json({ data: enriched[0] ?? listing });
    }

    // Which side of the market is being browsed.
    //
    // ListJobs returns every listing regardless of who posted it, because
    // households' job posts and househelps' open-for-work posts share one
    // table. A household browsing with ListJobs was therefore shown job posts —
    // including its own, rendered as though they were people, with the job's
    // title where the househelp's skills belong. ListOpenForWork is the same
    // query joined to the owner's profile and restricted to househelps, which
    // is what "who is available" actually means.
    // owner=househelp has its own endpoint, which carries the poster's name and
    // contact alongside the listing — what a household browsing people needs.
    // owner=household is the same ListJobs query narrowed to the other side,
    // because a jobs board wants the job, not the person.
    //
    // Absent, ListJobs returns both sides, and that is what put "Available for
    // work" on the househelp jobs board with an Apply button under it.
    const owner = String(url.searchParams.get('owner') || '');

    // Two endpoints, two response messages. ListOpenForWork answers with
    // JsonResponse, whose data sits at field 1; ListJobs answers with
    // GenericResponse, whose header is at 1 and body at 2. Decoding the former
    // with the latter's reader finds no body and returns nothing — which is
    // why browsing househelps came back empty rather than erroring.
    const { body: responseBody } = owner === 'househelp'
      ? await callUnaryGrpcJson(
        baseUrl,
        '/auth.OpenForWorkService/ListOpenForWork',
        encodeListRequest(url.searchParams),
      )
      : await callUnaryGrpc(
        baseUrl,
        '/auth.ListingService/ListJobs',
        encodeListRequest(url.searchParams),
      );

    // A null body means the response could not be read, which normalizeArray
    // would render as an empty list — the failure this whole branch exists to
    // stop looking like "nothing matched".
    const payload = responseBody?.data ?? responseBody ?? {};
    const listings = normalizeArray(payload);
    const hydratedListings = hydrateWithGetListing
      ? await Promise.all(listings.map(async (listing) => {
        const listingId = extractListingId(listing);
        if (!listingId) return listing;
        return { ...listing, ...await getJobListing(baseUrl, listingId, callUnaryGrpc).catch(() => ({})) };
      }))
      : listings;
    let enriched = await enrichListingsWithFeatures(baseUrl, hydratedListings, callUnaryGrpc);

    // Who among these people is a paying member.
    //
    // Only when browsing househelps: the other side of the board returns a
    // household's job posts, where the poster is the person hiring and a
    // premium badge on their advert says nothing a househelp needs.
    //
    // One call for the whole page, not one per person — payments answers a list
    // of ids, and a badge is not worth twenty round trips to the service that
    // takes payments. A failure inside leaves the listings untouched, so the
    // page loses the badge rather than the listings.
    if (owner === 'househelp') {
      const { attachPremiumStatus } = await import('~/utils/premium.server');
      enriched = await attachPremiumStatus(
        baseUrl,
        enriched,
        (listing) => {
          const value = listing.househelp_user_id ?? listing.owner_user_id ?? listing.user_id;
          return typeof value === 'string' && value ? value : undefined;
        },
        authMetadata(request),
      );
    }

    // Relevance, when the caller says who is looking.
    //
    // Scored here rather than in the browser so the page makes one request
    // instead of two, and so a match failure degrades to an unranked list
    // rather than an empty one — the engine is an improvement on the ordering,
    // never a precondition for having any.
    const matchFor = String(url.searchParams.get('match_for') || '');
    const matchCandidatesForProfile = String(url.searchParams.get('match_candidates_for_profile') || '');

    // Both match calls name whose results to return, so auth checks that the
    // caller is that person before answering. It reads the caller from this
    // token, not from the id in the request. The browser sends the cookie on
    // its own — in production it is httpOnly, so here is the only place it can
    // be read at all.
    const matchAuth = authMetadata(request);

    let scored = enriched;
    try {
      if (matchFor) {
        // A service provider looking at jobs.
        const rows = await matchListingsFor(baseUrl, matchFor, callUnaryGrpc, matchAuth);
        scored = annotateWithScores(scored, scoreMap(rows, 'listing_id'), (listing) =>
          String(listing.id ?? ''));
      } else if (matchCandidatesForProfile) {
        // A household looking at people, scored against its own job.
        //
        // The listing is resolved here rather than passed in: the browse page
        // has no reason to know which of the household's jobs it is being
        // ranked against, and asking it to fetch one first would make the page
        // wait on a request whose only purpose is to feed another.
        const listingId = await newestListingFor(baseUrl, matchCandidatesForProfile, callUnaryGrpc);
        const rows = listingId
          ? await matchCandidatesForListing(baseUrl, listingId, callUnaryGrpc, matchAuth)
          : [];
        scored = annotateWithScores(scored, scoreMap(rows, 'user_profile_id'), (listing) =>
          String(listing.user_profile_id ?? listing.userProfileId ?? ''));
      }
    } catch (err: unknown) {
      console.warn('Unable to score listings; returning them unranked:', err);
    }

    return Response.json({ data: scored });
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

    if (request.method === 'POST' && (action === 'apply' || action === 'shortlist')) {
      const serviceProviderId = String(body.service_provider_id || body.serviceProviderId || '').trim();
      if (!id || !serviceProviderId) {
        return Response.json(
          { message: 'id and service_provider_id are required' },
          { status: 400 },
        );
      }

      const rpcPath = action === 'shortlist'
        ? '/auth.ListingService/ShortlistListing'
        : '/auth.ListingService/InitiateListing';
      const { body: responseBody } = await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        rpcPath,
        encodeCreateApplication({
          id,
          service_provider_id: serviceProviderId,
          message: body.message,
        }),
      );

      return Response.json({ data: responseBody.data ?? responseBody });
    }

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
        authMetadata(request),
      );

      // The listing is re-read rather than returned from the update, so the
      // caller gets the resolved place names and the feature picks it just
      // saved. UpdateJob answers with the row alone, which would leave an
      // edited card showing the values it held before the edit.
      const listingId = Number(id);
      if (Number.isFinite(listingId) && listingId > 0) {
        const refreshed = await getJobListing(resolveAuthGrpcBaseUrl(request), listingId, callUnaryGrpc)
          .catch(() => null);
        if (refreshed) {
          const enriched = await enrichListingsWithFeatures(
            resolveAuthGrpcBaseUrl(request),
            [refreshed],
            callUnaryGrpc,
          );
          return Response.json({ data: enriched[0] ?? refreshed });
        }
      }

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
        authMetadata(request),
      );

      return Response.json({ data: responseBody.data ?? responseBody });
    }

    // Keeps a listing alive for another cycle. A POST rather than sitting with
    // close and delete, because renewing extends a job rather than ending one.
    if (request.method === 'POST' && action === 'renew') {
      const listingId = String(body.id || body.listing_id || body.listingId || '');
      const actorProfileId = String(body.user_profile_id || body.userProfileId || '');
      if (!listingId || !actorProfileId) {
        return Response.json(
          { message: 'id and user_profile_id are required to renew a listing' },
          { status: 400 },
        );
      }

      const { body: responseBody } = await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        '/auth.ListingService/RenewListing',
        encodeIdRequest(listingId, actorProfileId),
        authMetadata(request),
      );

      return Response.json({ data: responseBody.data ?? responseBody });
    }

    // Application transitions the household drives from its hiring workspace.
    // Each maps to one RPC and carries who acted, which is what
    // application_events records and what the contact-visibility rules read to
    // tell a household advancing a candidate from a candidate applying.
    if (request.method === 'POST' && (action === 'promote' || action === 'approve' || action === 'unshortlist')) {
      const applicationId = Number(body.application_id || body.applicationId || body.id || 0);
      const actorProfileId = String(body.actor_profile_id || body.actorProfileId || '');
      if (!applicationId || !actorProfileId) {
        return Response.json(
          { message: 'application_id and actor_profile_id are required' },
          { status: 400 },
        );
      }

      const actionPath = action === 'promote'
        ? '/auth.ListingService/PromoteToInitiated'
        : action === 'approve'
          ? '/auth.ListingService/ApproveApplication'
          : '/auth.ListingService/UnshortlistListing';

      const { body: responseBody } = await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        actionPath,
        encodeApplicationAction({ application_id: applicationId, actor_profile_id: actorProfileId }),
        authMetadata(request),
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

    const wardId = Number(body.ward_id || body.wardId || 0);
    if (!wardId) {
      // Caught here as well as in the service, so the browser gets a plain
      // message instead of a gRPC status it has to unwrap.
      return Response.json(
        { message: 'a location is required so househelps can find this job' },
        { status: 400 },
      );
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
        ward_id: wardId,
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
