import * as jspb from 'google-protobuf'

import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb'; // proto import: "google/protobuf/struct.proto"


export class IdRequest extends jspb.Message {
  getId(): string;
  setId(value: string): IdRequest;

  getUserId(): string;
  setUserId(value: string): IdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: IdRequest): IdRequest.AsObject;
  static serializeBinaryToWriter(message: IdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IdRequest;
  static deserializeBinaryFromReader(message: IdRequest, reader: jspb.BinaryReader): IdRequest;
}

export namespace IdRequest {
  export type AsObject = {
    id: string;
    userId: string;
  };
}

export class UserIdRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UserIdRequest;

  getProfileType(): string;
  setProfileType(value: string): UserIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UserIdRequest): UserIdRequest.AsObject;
  static serializeBinaryToWriter(message: UserIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserIdRequest;
  static deserializeBinaryFromReader(message: UserIdRequest, reader: jspb.BinaryReader): UserIdRequest;
}

export namespace UserIdRequest {
  export type AsObject = {
    userId: string;
    profileType: string;
  };
}

export class CountResponse extends jspb.Message {
  getCount(): number;
  setCount(value: number): CountResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CountResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CountResponse): CountResponse.AsObject;
  static serializeBinaryToWriter(message: CountResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CountResponse;
  static deserializeBinaryFromReader(message: CountResponse, reader: jspb.BinaryReader): CountResponse;
}

export namespace CountResponse {
  export type AsObject = {
    count: number;
  };
}

export class JsonResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): JsonResponse;
  hasData(): boolean;
  clearData(): JsonResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonResponse.AsObject;
  static toObject(includeInstance: boolean, msg: JsonResponse): JsonResponse.AsObject;
  static serializeBinaryToWriter(message: JsonResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonResponse;
  static deserializeBinaryFromReader(message: JsonResponse, reader: jspb.BinaryReader): JsonResponse;
}

export namespace JsonResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateShortlistReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateShortlistReq;

  getProfileType(): string;
  setProfileType(value: string): CreateShortlistReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateShortlistReq;
  hasData(): boolean;
  clearData(): CreateShortlistReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateShortlistReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateShortlistReq): CreateShortlistReq.AsObject;
  static serializeBinaryToWriter(message: CreateShortlistReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateShortlistReq;
  static deserializeBinaryFromReader(message: CreateShortlistReq, reader: jspb.BinaryReader): CreateShortlistReq;
}

export namespace CreateShortlistReq {
  export type AsObject = {
    userId: string;
    profileType: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ListHireRequestsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListHireRequestsReq;

  getProfileType(): string;
  setProfileType(value: string): ListHireRequestsReq;

  getStatus(): string;
  setStatus(value: string): ListHireRequestsReq;

  getLimit(): number;
  setLimit(value: number): ListHireRequestsReq;

  getOffset(): number;
  setOffset(value: number): ListHireRequestsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListHireRequestsReq.AsObject;
  static toObject(includeInstance: boolean, msg: ListHireRequestsReq): ListHireRequestsReq.AsObject;
  static serializeBinaryToWriter(message: ListHireRequestsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListHireRequestsReq;
  static deserializeBinaryFromReader(message: ListHireRequestsReq, reader: jspb.BinaryReader): ListHireRequestsReq;
}

export namespace ListHireRequestsReq {
  export type AsObject = {
    userId: string;
    profileType: string;
    status: string;
    limit: number;
    offset: number;
  };
}

