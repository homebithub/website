import { GrpcWebFetchTransport } from '@protobuf-ts/grpcweb-transport';
import type { JsonObject } from '@protobuf-ts/runtime';
import { AuthService, WaitlistService } from '~/proto/auth/auth';
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
  // The generated service-client module is also used by several browser-only
  // screens. Rollup elides its constructors from the SSR bundle, which left
  // this callback attempting `new undefined(...)` after Google redirected a
  // person back. Invoke the generated service descriptor directly instead.
  const transport = createTransport(requestUrl);
  const { response } = await transport.unary(
    AuthService.methods[8],
    input,
    transport.mergeOptions({}),
  );
  return response;
}

export async function createWaitlistOnServer(
  requestUrl: string,
  data: Record<string, unknown>,
) {
  const transport = createTransport(requestUrl);
  const payload = {
    userId: '',
    profileType: '',
    data: Struct.fromJson(stripUndefined(data) as JsonObject),
  };
  const { response } = await transport.unary(
    WaitlistService.methods[0],
    payload,
    transport.mergeOptions({}),
  );
  return response;
}
