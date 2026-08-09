import { getAccessTokenFromCookies } from '~/utils/cookie';

/**
 * Saved filters, through the same hand-rolled gRPC path the listing routes use.
 *
 * The encoders are written by hand here because this BFF speaks raw gRPC rather
 * than through a generated stub. Field numbers must match
 * client_profile.proto — a mismatch does not fail loudly, it parses into the
 * wrong field and saves someone's filters under a name they never chose.
 */

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

function encodeStringField(fieldNo: number, value: string): Uint8Array {
  if (!value) return new Uint8Array();
  const encoded = new TextEncoder().encode(value);
  return concatBytes([encodeVarint((fieldNo << 3) | 2), encodeVarint(encoded.length), encoded]);
}

function encodeBoolField(fieldNo: number, value: boolean): Uint8Array {
  if (!value) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 0), encodeVarint(1)]);
}

// SaveFilterRequest: user_profile_id = 1, name = 2, filters = 3, notify = 4
function encodeSaveFilter(
  userProfileId: string,
  name: string,
  filters: string,
  notify: boolean,
): Uint8Array {
  return concatBytes([
    encodeStringField(1, userProfileId),
    encodeStringField(2, name),
    encodeStringField(3, filters),
    encodeBoolField(4, notify),
  ]);
}

// SavedFilterRequest: user_profile_id = 1, name = 2
function encodeSavedFilterRequest(userProfileId: string, name = ''): Uint8Array {
  return concatBytes([encodeStringField(1, userProfileId), encodeStringField(2, name)]);
}

/**
 * Auth travels with every call: the handlers refuse a profile that is not the
 * caller's. Omitting it is the mistake this file's neighbours made twice.
 */
function authMetadata(request: Request): Record<string, string> {
  const token = getAccessTokenFromCookies(request.headers.get('cookie'));
  return token ? { authorization: `Bearer ${token}` } : {};
}

export async function loader({ request }: { request: Request }) {
  try {
    const { callUnaryGrpc, resolveAuthGrpcBaseUrl } = await import('~/utils/grpcRaw.server');
    const url = new URL(request.url);
    const userProfileId = String(url.searchParams.get('user_profile_id') || '');
    if (!userProfileId) return Response.json({ active: {}, saved: [] });

    const { body } = await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/client_profile.ClientProfileService/ListSavedFilters',
      encodeSavedFilterRequest(userProfileId),
      authMetadata(request),
    );

    const data = (body?.data ?? body ?? {}) as Record<string, unknown>;
    return Response.json({
      active: data.active ?? {},
      saved: Array.isArray(data.saved) ? data.saved : [],
    });
  } catch (error: unknown) {
    // Filters are a convenience. A page that cannot read them should render
    // with none rather than fail — the listings underneath are the point.
    console.warn('Unable to read saved filters:', error);
    return Response.json({ active: {}, saved: [] });
  }
}

export async function action({ request }: { request: Request }) {
  const { callUnaryGrpc, resolveAuthGrpcBaseUrl } = await import('~/utils/grpcRaw.server');
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const userProfileId = String(body.user_profile_id || body.userProfileId || '');
  const name = String(body.name || '');

  if (!userProfileId) {
    return Response.json({ error: 'user_profile_id is required' }, { status: 400 });
  }

  try {
    if (request.method === 'DELETE') {
      await callUnaryGrpc(
        resolveAuthGrpcBaseUrl(request),
        '/client_profile.ClientProfileService/DeleteSavedFilter',
        encodeSavedFilterRequest(userProfileId, name),
        authMetadata(request),
      );
      return Response.json({ ok: true });
    }

    const filters = JSON.stringify(body.filters ?? {});
    await callUnaryGrpc(
      resolveAuthGrpcBaseUrl(request),
      '/client_profile.ClientProfileService/SaveFilter',
      encodeSaveFilter(userProfileId, name, filters, Boolean(body.notify)),
      authMetadata(request),
    );
    return Response.json({ ok: true });
  } catch (error: unknown) {
    // Reported rather than swallowed: saving is something the person asked for
    // and a silent failure would have them believe a filter was kept.
    const message = error instanceof Error ? error.message : 'Could not save that filter';
    return Response.json({ error: message }, { status: 500 });
  }
}
