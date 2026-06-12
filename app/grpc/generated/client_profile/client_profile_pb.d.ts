import * as jspb from 'google-protobuf'

import * as shared_shared_pb from '../shared/shared_pb'; // proto import: "shared/shared.proto"


export class CreateJobTypeRequest extends jspb.Message {
  getName(): string;
  setName(value: string): CreateJobTypeRequest;

  getSlug(): string;
  setSlug(value: string): CreateJobTypeRequest;

  getDescription(): string;
  setDescription(value: string): CreateJobTypeRequest;

  getDisplayOrder(): number;
  setDisplayOrder(value: number): CreateJobTypeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateJobTypeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateJobTypeRequest): CreateJobTypeRequest.AsObject;
  static serializeBinaryToWriter(message: CreateJobTypeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateJobTypeRequest;
  static deserializeBinaryFromReader(message: CreateJobTypeRequest, reader: jspb.BinaryReader): CreateJobTypeRequest;
}

export namespace CreateJobTypeRequest {
  export type AsObject = {
    name: string;
    slug: string;
    description: string;
    displayOrder: number;
  };
}

export class JobTypeIdRequest extends jspb.Message {
  getId(): number;
  setId(value: number): JobTypeIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobTypeIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: JobTypeIdRequest): JobTypeIdRequest.AsObject;
  static serializeBinaryToWriter(message: JobTypeIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobTypeIdRequest;
  static deserializeBinaryFromReader(message: JobTypeIdRequest, reader: jspb.BinaryReader): JobTypeIdRequest;
}

export namespace JobTypeIdRequest {
  export type AsObject = {
    id: number;
  };
}

export class ListJobTypesRequest extends jspb.Message {
  getActiveOnly(): boolean;
  setActiveOnly(value: boolean): ListJobTypesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListJobTypesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListJobTypesRequest): ListJobTypesRequest.AsObject;
  static serializeBinaryToWriter(message: ListJobTypesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListJobTypesRequest;
  static deserializeBinaryFromReader(message: ListJobTypesRequest, reader: jspb.BinaryReader): ListJobTypesRequest;
}

export namespace ListJobTypesRequest {
  export type AsObject = {
    activeOnly: boolean;
  };
}

export class AttachJobTypeFeaturesRequest extends jspb.Message {
  getJobTypeId(): number;
  setJobTypeId(value: number): AttachJobTypeFeaturesRequest;

  getFeaturesList(): Array<JobTypeFeatureInput>;
  setFeaturesList(value: Array<JobTypeFeatureInput>): AttachJobTypeFeaturesRequest;
  clearFeaturesList(): AttachJobTypeFeaturesRequest;
  addFeatures(value?: JobTypeFeatureInput, index?: number): JobTypeFeatureInput;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AttachJobTypeFeaturesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AttachJobTypeFeaturesRequest): AttachJobTypeFeaturesRequest.AsObject;
  static serializeBinaryToWriter(message: AttachJobTypeFeaturesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AttachJobTypeFeaturesRequest;
  static deserializeBinaryFromReader(message: AttachJobTypeFeaturesRequest, reader: jspb.BinaryReader): AttachJobTypeFeaturesRequest;
}

export namespace AttachJobTypeFeaturesRequest {
  export type AsObject = {
    jobTypeId: number;
    featuresList: Array<JobTypeFeatureInput.AsObject>;
  };
}

export class JobTypeFeatureInput extends jspb.Message {
  getFeatureId(): number;
  setFeatureId(value: number): JobTypeFeatureInput;

  getIsRequired(): boolean;
  setIsRequired(value: boolean): JobTypeFeatureInput;

  getDisplayOrder(): number;
  setDisplayOrder(value: number): JobTypeFeatureInput;

  getDefaultWeight(): number;
  setDefaultWeight(value: number): JobTypeFeatureInput;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JobTypeFeatureInput.AsObject;
  static toObject(includeInstance: boolean, msg: JobTypeFeatureInput): JobTypeFeatureInput.AsObject;
  static serializeBinaryToWriter(message: JobTypeFeatureInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JobTypeFeatureInput;
  static deserializeBinaryFromReader(message: JobTypeFeatureInput, reader: jspb.BinaryReader): JobTypeFeatureInput;
}

export namespace JobTypeFeatureInput {
  export type AsObject = {
    featureId: number;
    isRequired: boolean;
    displayOrder: number;
    defaultWeight: number;
  };
}

export class DetachJobTypeFeatureRequest extends jspb.Message {
  getJobTypeId(): number;
  setJobTypeId(value: number): DetachJobTypeFeatureRequest;

  getFeatureId(): number;
  setFeatureId(value: number): DetachJobTypeFeatureRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DetachJobTypeFeatureRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DetachJobTypeFeatureRequest): DetachJobTypeFeatureRequest.AsObject;
  static serializeBinaryToWriter(message: DetachJobTypeFeatureRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DetachJobTypeFeatureRequest;
  static deserializeBinaryFromReader(message: DetachJobTypeFeatureRequest, reader: jspb.BinaryReader): DetachJobTypeFeatureRequest;
}

export namespace DetachJobTypeFeatureRequest {
  export type AsObject = {
    jobTypeId: number;
    featureId: number;
  };
}

export class SaveListingFeaturePropertiesRequest extends jspb.Message {
  getListingId(): number;
  setListingId(value: number): SaveListingFeaturePropertiesRequest;

  getFeaturesList(): Array<FeaturePickInput>;
  setFeaturesList(value: Array<FeaturePickInput>): SaveListingFeaturePropertiesRequest;
  clearFeaturesList(): SaveListingFeaturePropertiesRequest;
  addFeatures(value?: FeaturePickInput, index?: number): FeaturePickInput;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SaveListingFeaturePropertiesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SaveListingFeaturePropertiesRequest): SaveListingFeaturePropertiesRequest.AsObject;
  static serializeBinaryToWriter(message: SaveListingFeaturePropertiesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SaveListingFeaturePropertiesRequest;
  static deserializeBinaryFromReader(message: SaveListingFeaturePropertiesRequest, reader: jspb.BinaryReader): SaveListingFeaturePropertiesRequest;
}

export namespace SaveListingFeaturePropertiesRequest {
  export type AsObject = {
    listingId: number;
    featuresList: Array<FeaturePickInput.AsObject>;
  };
}

export class FeaturePickInput extends jspb.Message {
  getFeatureId(): number;
  setFeatureId(value: number): FeaturePickInput;

  getPropertyIdsList(): Array<number>;
  setPropertyIdsList(value: Array<number>): FeaturePickInput;
  clearPropertyIdsList(): FeaturePickInput;
  addPropertyIds(value: number, index?: number): FeaturePickInput;

  getWeight(): number;
  setWeight(value: number): FeaturePickInput;

  getValue(): string;
  setValue(value: string): FeaturePickInput;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FeaturePickInput.AsObject;
  static toObject(includeInstance: boolean, msg: FeaturePickInput): FeaturePickInput.AsObject;
  static serializeBinaryToWriter(message: FeaturePickInput, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FeaturePickInput;
  static deserializeBinaryFromReader(message: FeaturePickInput, reader: jspb.BinaryReader): FeaturePickInput;
}

export namespace FeaturePickInput {
  export type AsObject = {
    featureId: number;
    propertyIdsList: Array<number>;
    weight: number;
    value: string;
  };
}

export class ListingIdRequest extends jspb.Message {
  getListingId(): number;
  setListingId(value: number): ListingIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListingIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListingIdRequest): ListingIdRequest.AsObject;
  static serializeBinaryToWriter(message: ListingIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListingIdRequest;
  static deserializeBinaryFromReader(message: ListingIdRequest, reader: jspb.BinaryReader): ListingIdRequest;
}

export namespace ListingIdRequest {
  export type AsObject = {
    listingId: number;
  };
}

export class ListingFeaturePropertyIdRequest extends jspb.Message {
  getId(): number;
  setId(value: number): ListingFeaturePropertyIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListingFeaturePropertyIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListingFeaturePropertyIdRequest): ListingFeaturePropertyIdRequest.AsObject;
  static serializeBinaryToWriter(message: ListingFeaturePropertyIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListingFeaturePropertyIdRequest;
  static deserializeBinaryFromReader(message: ListingFeaturePropertyIdRequest, reader: jspb.BinaryReader): ListingFeaturePropertyIdRequest;
}

export namespace ListingFeaturePropertyIdRequest {
  export type AsObject = {
    id: number;
  };
}

