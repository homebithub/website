import structPb from 'google-protobuf/google/protobuf/struct_pb.js';

const { Struct } = structPb as any;

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

function encodeGrpcWebFrame(messageBytes: Uint8Array): Uint8Array {
  const frame = new Uint8Array(5 + messageBytes.length);
  const view = new DataView(frame.buffer);
  view.setUint8(0, 0);
  view.setUint32(1, messageBytes.length, false);
  frame.set(messageBytes, 5);
  return frame;
}

function readVarint(bytes: Uint8Array, offset: number): { value: number; offset: number } {
  let value = 0;
  let shift = 0;
  let next = offset;

  while (next < bytes.length) {
    const byte = bytes[next++];
    value |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) {
      return { value, offset: next };
    }
    shift += 7;
  }

  throw new Error('Malformed protobuf varint');
}

function skipField(bytes: Uint8Array, offset: number, wireType: number): number {
  if (wireType === 0) return readVarint(bytes, offset).offset;
  if (wireType === 1) return offset + 8;
  if (wireType === 2) {
    const length = readVarint(bytes, offset);
    return length.offset + length.value;
  }
  if (wireType === 5) return offset + 4;
  throw new Error(`Unsupported protobuf wire type ${wireType}`);
}

function decodeGenericHeader(bytes: Uint8Array) {
  let offset = 0;
  const header: Record<string, unknown> = {};
  const decoder = new TextDecoder();

  while (offset < bytes.length) {
    const tag = readVarint(bytes, offset);
    offset = tag.offset;
    const fieldNo = tag.value >> 3;
    const wireType = tag.value & 7;

    if (wireType === 2) {
      const length = readVarint(bytes, offset);
      offset = length.offset;
      const value = decoder.decode(bytes.subarray(offset, offset + length.value));
      offset += length.value;
      if (fieldNo === 1) header.request_id = value;
      if (fieldNo === 3) header.res_message = value;
      if (fieldNo === 4) header.display_message = value;
      continue;
    }

    if (wireType === 0) {
      const value = readVarint(bytes, offset);
      offset = value.offset;
      if (fieldNo === 2) header.res_code = value.value;
      continue;
    }

    offset = skipField(bytes, offset, wireType);
  }

  return header;
}

function decodeGenericResponse(payload: Uint8Array): { header: Record<string, any>; body: Record<string, any> } {
  let offset = 0;
  let header: Record<string, unknown> = {};
  let body: Record<string, unknown> | null = null;

  while (offset < payload.length) {
    const tag = readVarint(payload, offset);
    offset = tag.offset;
    const fieldNo = tag.value >> 3;
    const wireType = tag.value & 7;

    if (wireType !== 2) {
      offset = skipField(payload, offset, wireType);
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

  return { header: header as Record<string, any>, body: (body || {}) as Record<string, any> };
}

function parseGrpcWebFrames(bytes: Uint8Array) {
  let offset = 0;
  const messages: Uint8Array[] = [];
  let trailerText = '';
  const decoder = new TextDecoder();

  while (offset + 5 <= bytes.length) {
    const flags = bytes[offset];
    const view = new DataView(bytes.buffer, bytes.byteOffset + offset + 1, 4);
    const length = view.getUint32(0, false);
    const start = offset + 5;
    const end = start + length;
    if (end > bytes.length) break;

    const frame = bytes.subarray(start, end);
    if ((flags & 0x80) === 0x80) {
      trailerText += decoder.decode(frame);
    } else {
      messages.push(frame);
    }

    offset = end;
  }

  return { messages, trailers: parseTrailers(trailerText) };
}

function parseTrailers(text: string): Record<string, string> {
  const trailers: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index <= 0) continue;
    trailers[line.slice(0, index).trim().toLowerCase()] = line.slice(index + 1).trim();
  }
  return trailers;
}

function decodeGrpcMessage(message: string): string {
  try {
    return decodeURIComponent(message);
  } catch {
    return message;
  }
}

export async function callGenericGrpcWeb(
  baseUrl: string,
  path: string,
  requestBytes: Uint8Array,
  metadata?: Record<string, string | undefined>,
): Promise<{ header: Record<string, any>; body: Record<string, any> }> {
  const frame = encodeGrpcWebFrame(requestBytes);
  const requestBody = new Blob([frame as BlobPart]);
  const response = await fetch(`${baseUrl.replace(/\/+$/, '')}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/grpc-web+proto',
      'X-Grpc-Web': '1',
      'X-User-Agent': 'grpc-web-javascript/0.1',
      ...Object.fromEntries(Object.entries(metadata || {}).filter(([, value]) => Boolean(value))),
    },
    body: requestBody,
  });

  const bytes = new Uint8Array(await response.arrayBuffer());
  const { messages, trailers } = parseGrpcWebFrames(bytes);
  const grpcStatus = response.headers.get('grpc-status') || trailers['grpc-status'] || (response.ok ? '0' : '2');
  const grpcMessage = decodeGrpcMessage(response.headers.get('grpc-message') || trailers['grpc-message'] || '');

  if (grpcStatus !== '0') {
    throw Object.assign(new Error(grpcMessage || `Request failed with gRPC status ${grpcStatus}`), {
      grpcCode: GRPC_CODE_NAMES[grpcStatus] || grpcStatus,
    });
  }

  if (!messages.length) {
    throw Object.assign(new Error('Empty gRPC response'), { grpcCode: 'UNKNOWN' });
  }

  return decodeGenericResponse(messages[0]);
}
