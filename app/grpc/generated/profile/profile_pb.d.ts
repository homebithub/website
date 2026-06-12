import * as jspb from 'google-protobuf'

import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class CreateProfileRequest extends jspb.Message {
  getName(): string;
  setName(value: string): CreateProfileRequest;

  getSlug(): string;
  setSlug(value: string): CreateProfileRequest;

  getType(): string;
  setType(value: string): CreateProfileRequest;

  getDescription(): string;
  setDescription(value: string): CreateProfileRequest;

  getDisplayOrder(): string;
  setDisplayOrder(value: string): CreateProfileRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateProfileRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateProfileRequest): CreateProfileRequest.AsObject;
  static serializeBinaryToWriter(message: CreateProfileRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateProfileRequest;
  static deserializeBinaryFromReader(message: CreateProfileRequest, reader: jspb.BinaryReader): CreateProfileRequest;
}

export namespace CreateProfileRequest {
  export type AsObject = {
    name: string;
    slug: string;
    type: string;
    description: string;
    displayOrder: string;
  };
}

export class LinkProfileFeature extends jspb.Message {
  getProfileId(): string;
  setProfileId(value: string): LinkProfileFeature;

  getFeaturesList(): Array<number>;
  setFeaturesList(value: Array<number>): LinkProfileFeature;
  clearFeaturesList(): LinkProfileFeature;
  addFeatures(value: number, index?: number): LinkProfileFeature;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LinkProfileFeature.AsObject;
  static toObject(includeInstance: boolean, msg: LinkProfileFeature): LinkProfileFeature.AsObject;
  static serializeBinaryToWriter(message: LinkProfileFeature, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LinkProfileFeature;
  static deserializeBinaryFromReader(message: LinkProfileFeature, reader: jspb.BinaryReader): LinkProfileFeature;
}

export namespace LinkProfileFeature {
  export type AsObject = {
    profileId: string;
    featuresList: Array<number>;
  };
}

export class GetProfileFeature extends jspb.Message {
  getProfileId(): string;
  setProfileId(value: string): GetProfileFeature;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProfileFeature.AsObject;
  static toObject(includeInstance: boolean, msg: GetProfileFeature): GetProfileFeature.AsObject;
  static serializeBinaryToWriter(message: GetProfileFeature, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProfileFeature;
  static deserializeBinaryFromReader(message: GetProfileFeature, reader: jspb.BinaryReader): GetProfileFeature;
}

export namespace GetProfileFeature {
  export type AsObject = {
    profileId: string;
  };
}

