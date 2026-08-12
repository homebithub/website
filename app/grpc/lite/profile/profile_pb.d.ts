import * as jspb from 'google-protobuf'

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

export class SearchRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SearchRequest;

  getProfileType(): string;
  setProfileType(value: string): SearchRequest;

  getFilters(): google_protobuf_struct_pb.Struct | undefined;
  setFilters(value?: google_protobuf_struct_pb.Struct): SearchRequest;
  hasFilters(): boolean;
  clearFilters(): SearchRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SearchRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SearchRequest): SearchRequest.AsObject;
  static serializeBinaryToWriter(message: SearchRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SearchRequest;
  static deserializeBinaryFromReader(message: SearchRequest, reader: jspb.BinaryReader): SearchRequest;
}

export namespace SearchRequest {
  export type AsObject = {
    userId: string;
    profileType: string;
    filters?: google_protobuf_struct_pb.Struct.AsObject;
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

