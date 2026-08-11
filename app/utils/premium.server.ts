import {
  callUnaryGrpcMessage,
  concatBytes,
  encodeStringField,
} from "~/utils/grpcRaw.server";

/**
 * Who on this page is a paying member.
 *
 * Subscriptions live in the payments service, in its own database — so unlike
 * identity_verified, which the listing query joins straight from the kycs
 * table, this has to be asked for across a service boundary.
 *
 * It is one call for the whole page. GetSubscriptionStatuses was added to
 * payments for exactly this: the alternative was CheckSubscriptionAccess per
 * person, which turns a page of twenty househelps into twenty round trips to
 * the service that takes payments, to decorate twenty cards.
 *
 * The response carries only whether each person has access and whether a trial
 * grants it. No subscription id, no expiry, no amounts — the badge does not
 * need them, and this runs on a page where the viewer is a stranger.
 */

const MAX_LOOKUPS = 100;

/**
 * Where payments is, which is not where auth is.
 *
 * This is the bug that made the badge quietly never appear. Every other
 * server-side call here goes to AUTH_GRPC_BASE_URL, which in the cluster is
 * auth's own service — http://preprod-auth-srv-headless:5004 — not the gateway.
 * Sending a payments method there reaches auth, which does not implement it,
 * answers UNIMPLEMENTED, and gets swallowed by the catch below. The listings
 * came back fine and the badge was simply absent, with nothing in the gateway
 * log because the request never went near the gateway.
 *
 * Resolution order:
 *
 *   PAYMENTS_GRPC_BASE_URL, when someone sets it. Always right, never guessed.
 *
 *   Otherwise derived from the auth address, because the services are named and
 *   numbered alike (…-auth-srv-headless:5004 / …-payments-srv-headless:5002) and
 *   deriving keeps the environment prefix without a second variable to forget in
 *   one environment. Only used when the substitution actually changes the host,
 *   so a differently-named auth address falls through rather than producing an
 *   address that resolves to nothing.
 *
 *   Otherwise the public gateway, which works but needs the viewer's token.
 *
 * Reached directly, payments sees no authorization header and treats the caller
 * as internal, which is what lets it answer about the people on the page rather
 * than about the viewer. Through the gateway a token is required and a signed-out
 * visitor gets no badges.
 */
function paymentsBaseUrl(authBaseUrl: string): string {
  const configured = process.env.PAYMENTS_GRPC_BASE_URL;
  if (configured) return configured.replace(/\/+$/, "");

  const derived = authBaseUrl
    .replace("auth-srv-headless", "payments-srv-headless")
    .replace("auth-srv", "payments-srv")
    .replace(":5004", ":5002");
  if (derived !== authBaseUrl) return derived.replace(/\/+$/, "");

  return (process.env.GATEWAY_API_BASE_URL || "https://preprod-api.homebit.co.ke").replace(/\/+$/, "");
}

export type PremiumStatus = { premium: boolean; isTrial: boolean };

/** A repeated string field is the same tag written once per value. */
function encodeRepeatedString(fieldNo: number, values: string[]): Uint8Array {
  return concatBytes(values.map((value) => encodeStringField(fieldNo, value)));
}

function readVarint(buffer: Buffer, start: number): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let offset = start;
  while (offset < buffer.length) {
    const byte = buffer[offset++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return { value, offset };
}

/** SubscriptionStatusEntry: user_id = 1, has_access = 2, is_trial = 3. */
function decodeEntry(payload: Buffer): { userId: string; status: PremiumStatus } {
  let offset = 0;
  let userId = "";
  let hasAccess = false;
  let isTrial = false;

  while (offset < payload.length) {
    const tag = readVarint(payload, offset);
    offset = tag.offset;
    const fieldNo = tag.value >> 3;
    const wireType = tag.value & 7;

    if (wireType === 2) {
      const length = readVarint(payload, offset);
      offset = length.offset;
      if (fieldNo === 1) userId = payload.subarray(offset, offset + length.value).toString("utf8");
      offset += length.value;
    } else if (wireType === 0) {
      const value = readVarint(payload, offset);
      offset = value.offset;
      if (fieldNo === 2) hasAccess = value.value !== 0;
      if (fieldNo === 3) isTrial = value.value !== 0;
    } else if (wireType === 1) {
      offset += 8;
    } else if (wireType === 5) {
      offset += 4;
    } else {
      break;
    }
  }

  return { userId, status: { premium: hasAccess, isTrial } };
}

/** GetSubscriptionStatusesResponse: repeated SubscriptionStatusEntry statuses = 1. */
function decodeStatuses(payload: Buffer): Map<string, PremiumStatus> {
  const statuses = new Map<string, PremiumStatus>();
  let offset = 0;

  while (offset < payload.length) {
    const tag = readVarint(payload, offset);
    offset = tag.offset;
    const fieldNo = tag.value >> 3;
    const wireType = tag.value & 7;

    if (wireType === 2) {
      const length = readVarint(payload, offset);
      offset = length.offset;
      if (fieldNo === 1) {
        const { userId, status } = decodeEntry(payload.subarray(offset, offset + length.value));
        if (userId) statuses.set(userId, status);
      }
      offset += length.value;
    } else if (wireType === 0) {
      offset = readVarint(payload, offset).offset;
    } else if (wireType === 1) {
      offset += 8;
    } else if (wireType === 5) {
      offset += 4;
    } else {
      break;
    }
  }

  return statuses;
}

/**
 * Attach `premium` to listings, given a way to find each listing's owner.
 *
 * Returns the listings untouched when nothing can be identified or the lookup
 * fails, so a caller never has to special-case either.
 */
export async function attachPremiumStatus(
  baseUrl: string,
  listings: Record<string, unknown>[],
  ownerIdOf: (listing: Record<string, unknown>) => string | undefined,
  metadata?: Record<string, string | undefined>,
): Promise<Record<string, unknown>[]> {
  // Deduped because one person can hold several listings, and capped so an
  // unbounded listing response cannot become an unbounded request.
  const ids = Array.from(
    new Set(
      listings
        .map((listing) => ownerIdOf(listing))
        .filter((id): id is string => Boolean(id)),
    ),
  ).slice(0, MAX_LOOKUPS);

  if (ids.length === 0) return listings;

  let statuses: Map<string, PremiumStatus>;
  try {
    const payload = await callUnaryGrpcMessage(
      paymentsBaseUrl(baseUrl),
      "/payments.PaymentsService/GetSubscriptionStatuses",
      encodeRepeatedString(1, ids),
      metadata,
    );
    statuses = decodeStatuses(payload);
  } catch {
    // Payments being unreachable must not empty the browse page. No badge is
    // the honest fallback: it understates rather than claiming a subscription
    // that may not exist.
    return listings;
  }

  return listings.map((listing) => {
    const ownerId = ownerIdOf(listing);
    const status = ownerId ? statuses.get(ownerId) : undefined;
    // Absent from the response means no active subscription — the service only
    // returns people who have one.
    if (!status) return listing;
    return { ...listing, premium: status.premium, premium_is_trial: status.isTrial };
  });
}
