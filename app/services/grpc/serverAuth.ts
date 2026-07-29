import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import type { JsonObject } from '@protobuf-ts/runtime';
import {
  AuthServiceClient,
  WaitlistServiceClient,
} from '~/proto/auth/auth.client';
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

function createTransport(requestUrl: string) {
  return new GrpcWebFetchTransport({
    baseUrl: resolveGrpcBaseUrl(requestUrl),
    format: 'binary',
  });
}

export async function googleSignInOnServer(
  requestUrl: string,
  input: { code: string; flow: string },
) {
  const client = new AuthServiceClient(createTransport(requestUrl));
  const { response } = await client.googleSignIn(input);
  return response;
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
