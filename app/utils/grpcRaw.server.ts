import http2 from 'node:http2';
import structPb from 'google-protobuf/google/protobuf/struct_pb.js';

const { Struct } = structPb;

const GRPC_CODE_NAMES: Record<string, string> = {
  '0': 'OK',
  '1': 'CANCELLED',
  '2': 'UNKNOWN',
  '3': 'INVALID_ARGUMENT',
  '4': 'DEADLINE_EXCEEDED',
  '5': 'NOT_FOUND',
  '6': 'ALREADY_EXISTS',
  '7': 'PERMISSION_DENIED',
  '8': 'RESOURCE_EXHAUSTED',
  '9': 'FAILED_PRECONDITION',
  '10': 'ABORTED',
  '11': 'OUT_OF_RANGE',
  '12': 'UNIMPLEMENTED',
  '13': 'INTERNAL',
  '14': 'UNAVAILABLE',
  '15': 'DATA_LOSS',
  '16': 'UNAUTHENTICATED',
};

export function resolveAuthGrpcBaseUrl(request: Request): string {
  if (process.env.AUTH_API_BASE_URL) {
    return process.env.AUTH_API_BASE_URL.replace(/\/+$/, '');
  }

  const url = new URL(request.url);
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host === '127.0.0.1') {
    return `${url.protocol}//${url.hostname}:5004`;
  }

  return 'https://api.homebit.co.ke';
}

export function encodeStringField(fieldNo: number, value: string): Uint8Array {
  if (!value) return new Uint8Array();
  const encoded = new TextEncoder().encode(value);
  return concatBytes([encodeVarint((fieldNo << 3) | 2), encodeVarint(encoded.length), encoded]);
}

export function encodeInt32Field(fieldNo: number, value: number): Uint8Array {
  if (!Number.isFinite(value) || value === 0) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 0), encodeVarint(value)]);
}

export function encodeInt64Field(fieldNo: number, value: number): Uint8Array {
  if (!Number.isFinite(value) || value === 0) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 0), encodeVarint(value)]);
}

export function encodeMessageField(fieldNo: number, value: Uint8Array): Uint8Array {
  if (!value.length) return new Uint8Array();
  return concatBytes([encodeVarint((fieldNo << 3) | 2), encodeVarint(value.length), value]);
}

export function concatBytes(parts: Uint8Array[]): Uint8Array {
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

function readVarint(buffer: Buffer, offset: number): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let next = offset;

  while (next < buffer.length) {
    const byte = buffer[next++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) {
      return { value, offset: next };
    }
    shift += 7;
  }

  throw new Error('Malformed protobuf varint');
}

function createGrpcFrame(messageBytes: Uint8Array): Buffer {
  const frame = Buffer.alloc(5 + messageBytes.length);
  frame.writeUInt8(0, 0);
  frame.writeUInt32BE(messageBytes.length, 1);
  frame.set(messageBytes, 5);
  return frame;
}

function readGrpcFrame(buffer: Buffer): Buffer {
  if (buffer.length < 5) {
    return Buffer.alloc(0);
  }

  const compressed = buffer.readUInt8(0);
  if (compressed !== 0) {
    throw new Error('Compressed gRPC responses are not supported');
  }

  const length = buffer.readUInt32BE(1);
  const end = 5 + length;
  if (buffer.length < end) {
    throw new Error('Incomplete gRPC response');
  }

  return buffer.subarray(5, end);
}

function decodeGrpcMessage(message?: string | string[]): string {
  const raw = Array.isArray(message) ? message[0] : message;
  if (!raw) return '';

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function decodeGenericResponse(payload: Buffer) {
  let offset = 0;
  let header: Record<string, unknown> = {};
  let body: Record<string, unknown> | null = null;

  while (offset < payload.length) {
    const tag = readVarint(payload, offset);
    offset = tag.offset;
    const fieldNo = tag.value >> 3;
    const wireType = tag.value & 7;

    if (wireType !== 2) {
      const skipped = skipField(payload, offset, wireType);
      offset = skipped;
      continue;
    }

    const length = readVarint(payload, offset);
    offset = length.offset;
    const bytes = payload.subarray(offset, offset + length.value);
    offset += length.value;

    if (fieldNo === 1) {
      header = decodeGenericHeader(bytes);
    } else if (fieldNo === 2) {
      body = Struct.deserializeBinary(bytes).toJavaScript() as Record<string, unknown>;
    }
  }

  return { header, body: body || {} };
}

function decodeGenericHeader(payload: Buffer) {
  let offset = 0;
  const header: Record<string, unknown> = {};

  while (offset < payload.length) {
    const tag = readVarint(payload, offset);
    offset = tag.offset;
    const fieldNo = tag.value >> 3;
    const wireType = tag.value & 7;

    if (wireType === 2) {
      const length = readVarint(payload, offset);
      offset = length.offset;
      const value = payload.subarray(offset, offset + length.value).toString('utf8');
      offset += length.value;
      if (fieldNo === 1) header.request_id = value;
      if (fieldNo === 3) header.res_message = value;
      if (fieldNo === 4) header.display_message = value;
      continue;
    }

    if (wireType === 0) {
      const value = readVarint(payload, offset);
      offset = value.offset;
      if (fieldNo === 2) header.res_code = value.value;
      continue;
    }

    offset = skipField(payload, offset, wireType);
  }

  return header;
}

function skipField(payload: Buffer, offset: number, wireType: number): number {
  if (wireType === 0) return readVarint(payload, offset).offset;
  if (wireType === 1) return offset + 8;
  if (wireType === 2) {
    const length = readVarint(payload, offset);
    return length.offset + length.value;
  }
  if (wireType === 5) return offset + 4;
  throw new Error(`Unsupported protobuf wire type ${wireType}`);
}

export async function callUnaryGrpc(
  baseUrl: string,
  path: string,
  requestBytes: Uint8Array,
  metadata?: Record<string, string | undefined>,
) {
  const message = await callUnaryGrpcMessage(baseUrl, path, requestBytes, metadata);
  return decodeGenericResponse(message);
}

export async function callUnaryGrpcMessage(
  baseUrl: string,
  path: string,
  requestBytes: Uint8Array,
  metadata?: Record<string, string | undefined>,
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const client = http2.connect(baseUrl);
    const chunks: Buffer[] = [];
    let grpcStatus = '0';
    let grpcMessage = '';

    const headers: http2.OutgoingHttpHeaders = {
      ':method': 'POST',
      ':path': path,
      'content-type': 'application/grpc',
      te: 'trailers',
    };

    for (const [key, value] of Object.entries(metadata || {})) {
      if (value) headers[key] = value;
    }

    const stream = client.request(headers);

    const cleanup = () => {
      stream.close();
      client.close();
    };

    const readStatus = (headers: http2.IncomingHttpHeaders) => {
      const status = headers['grpc-status'];
      const message = headers['grpc-message'];
      if (status) grpcStatus = Array.isArray(status) ? status[0] : String(status);
      if (message) grpcMessage = decodeGrpcMessage(message as string | string[]);
    };

    stream.on('response', readStatus);
    stream.on('trailers', readStatus);

    stream.on('data', (chunk) => {
      chunks.push(Buffer.from(chunk));
    });

    stream.on('error', (err) => {
      cleanup();
      reject(Object.assign(err, { grpcCode: 'UNAVAILABLE' }));
    });

    stream.on('end', () => {
      try {
        cleanup();

        if (grpcStatus !== '0') {
          reject(Object.assign(new Error(grpcMessage || 'Request failed'), {
            grpcCode: GRPC_CODE_NAMES[grpcStatus] || grpcStatus,
          }));
          return;
        }

        resolve(readGrpcFrame(Buffer.concat(chunks)));
      } catch (err) {
        reject(err);
      }
    });

    stream.end(createGrpcFrame(requestBytes));
  });
}
