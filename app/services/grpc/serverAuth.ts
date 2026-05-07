import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import type { JsonObject } from '@protobuf-ts/runtime';
import { HouseholdMemberServiceClient, ProfileSetupServiceClient, WaitlistServiceClient } from '~/proto/auth/auth.client';
import { Struct } from '~/proto/google/protobuf/struct';
import { API_BASE_URL, normalizeGatewayBaseUrl } from '~/config/api';

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined);
  }

  if (isJsonObject(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, nested]) => nested !== undefined)
        .map(([key, nested]) => [key, stripUndefined(nested)]),
    );
  }

  return value;
}

function resolveGrpcBaseUrl(requestUrl: string): string {
  const url = new URL(requestUrl);
  const host = url.hostname.toLowerCase();

  if (host === 'localhost' || host === '127.0.0.1') {
    return `${url.protocol}//${url.hostname}:3005`;
  }

  return normalizeGatewayBaseUrl(process.env.GATEWAY_API_BASE_URL || API_BASE_URL);
}

function resolveRestBaseUrl(requestUrl: string): string {
  return resolveGrpcBaseUrl(requestUrl);
}

function createTransport(requestUrl: string) {
  return new GrpcWebFetchTransport({
    baseUrl: resolveGrpcBaseUrl(requestUrl),
    format: 'binary',
  });
}

function buildMetadata(token: string, profileType?: string) {
  const metadata: Record<string, string> = {
    authorization: `Bearer ${token}`,
  };

  if (profileType) {
    metadata['x-profile-type'] = profileType;
  }

  return metadata;
}

function structToJson(data?: Parameters<typeof Struct.toJson>[0]) {
  return data ? (Struct.toJson(data) as JsonObject) : null;
}

export async function googleSignInOnServer(
  requestUrl: string,
  input: { code: string; flow: string },
) {
  const response = await fetch(`${resolveRestBaseUrl(requestUrl)}/api/v1/auth/google/signin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(body || `google_signin_failed:${response.status}`);
  }

  return response.json();
}

export async function createWaitlistOnServer(
  requestUrl: string,
  data: Record<string, unknown>,
) {
  const client = new WaitlistServiceClient(createTransport(requestUrl));
  const payload = {
    userId: '',
    profileType: '',
    data: Struct.fromJson(stripUndefined(data) as JsonObject),
  };
  const { response } = await client.createWaitlist(payload);
  return response;
}

export async function getProfileSetupProgressOnServer(
  requestUrl: string,
  token: string,
  userId: string,
  profileType: string,
) {
  const client = new ProfileSetupServiceClient(createTransport(requestUrl));
  const { response } = await client.getProgress(
    { userId, profileType },
    { meta: buildMetadata(token, profileType) },
  );
  return structToJson(response.data);
}

export async function getJoinRequestStatusOnServer(
  requestUrl: string,
  token: string,
  userId: string,
  profileType?: string,
) {
  const client = new HouseholdMemberServiceClient(createTransport(requestUrl));
  const { response } = await client.getJoinRequestStatus(
    { userId, profileType: profileType || '' },
    { meta: buildMetadata(token, profileType) },
  );
  return structToJson(response.data);
}
