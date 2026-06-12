import * as jspb from 'google-protobuf'

import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class UserProfileIdRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UserProfileIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserProfileIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UserProfileIdRequest): UserProfileIdRequest.AsObject;
  static serializeBinaryToWriter(message: UserProfileIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserProfileIdRequest;
  static deserializeBinaryFromReader(message: UserProfileIdRequest, reader: jspb.BinaryReader): UserProfileIdRequest;
}

export namespace UserProfileIdRequest {
  export type AsObject = {
    id: string;
  };
}

export class PickInput extends jspb.Message {
  getFeaturePropertyId(): number;
  setFeaturePropertyId(value: number): PickInput;

  getWeight(): number;
  setWeight(value: number): PickInput;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PickInput.AsObject;
  static toObject(includeInstance: boolean, msg: PickInput): PickInput.AsObject;
  static serializeBinaryToWriter(message: PickInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PickInput;
  static deserializeBinaryFromReader(message: PickInput, reader: jspb.BinaryReader): PickInput;
}

export namespace PickInput {
  export type AsObject = {
    featurePropertyId: number;
    weight: number;
  };
}

export class PicksRequest extends jspb.Message {
  getUserProfileId(): string;
  setUserProfileId(value: string): PicksRequest;

  getPicksList(): Array<PickInput>;
  setPicksList(value: Array<PickInput>): PicksRequest;
  clearPicksList(): PicksRequest;
  addPicks(value?: PickInput, index?: number): PickInput;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PicksRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PicksRequest): PicksRequest.AsObject;
  static serializeBinaryToWriter(message: PicksRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PicksRequest;
  static deserializeBinaryFromReader(message: PicksRequest, reader: jspb.BinaryReader): PicksRequest;
}

export namespace PicksRequest {
  export type AsObject = {
    userProfileId: string;
    picksList: Array<PickInput.AsObject>;
  };
}

export class RemovePickRequest extends jspb.Message {
  getUserProfileId(): string;
  setUserProfileId(value: string): RemovePickRequest;

  getFeaturePropertyId(): number;
  setFeaturePropertyId(value: number): RemovePickRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePickRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePickRequest): RemovePickRequest.AsObject;
  static serializeBinaryToWriter(message: RemovePickRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePickRequest;
  static deserializeBinaryFromReader(message: RemovePickRequest, reader: jspb.BinaryReader): RemovePickRequest;
}

export namespace RemovePickRequest {
  export type AsObject = {
    userProfileId: string;
    featurePropertyId: number;
  };
}

