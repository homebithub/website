import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"


export class SubscriptionPlan extends jspb.Message {
  getId(): string;
  setId(value: string): SubscriptionPlan;

  getName(): string;
  setName(value: string): SubscriptionPlan;

  getDescription(): string;
  setDescription(value: string): SubscriptionPlan;

  getPriceAmount(): number;
  setPriceAmount(value: number): SubscriptionPlan;

  getBillingCycle(): string;
  setBillingCycle(value: string): SubscriptionPlan;

  getProfileType(): string;
  setProfileType(value: string): SubscriptionPlan;

  getTrialDays(): number;
  setTrialDays(value: number): SubscriptionPlan;

  getDisplayOrder(): number;
  setDisplayOrder(value: number): SubscriptionPlan;

  getIsActive(): boolean;
  setIsActive(value: boolean): SubscriptionPlan;

  getMaxProfiles(): number;
  setMaxProfiles(value: number): SubscriptionPlan;

  getMaxApplications(): number;
  setMaxApplications(value: number): SubscriptionPlan;

  getMaxHires(): number;
  setMaxHires(value: number): SubscriptionPlan;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionPlan;
  hasCreatedAt(): boolean;
  clearCreatedAt(): SubscriptionPlan;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionPlan;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): SubscriptionPlan;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionPlan.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionPlan): SubscriptionPlan.AsObject;
  static serializeBinaryToWriter(message: SubscriptionPlan, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionPlan;
  static deserializeBinaryFromReader(message: SubscriptionPlan, reader: jspb.BinaryReader): SubscriptionPlan;
}

export namespace SubscriptionPlan {
  export type AsObject = {
    id: string;
    name: string;
    description: string;
    priceAmount: number;
    billingCycle: string;
    profileType: string;
    trialDays: number;
    displayOrder: number;
    isActive: boolean;
    maxProfiles: number;
    maxApplications: number;
    maxHires: number;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class Subscription extends jspb.Message {
  getId(): string;
  setId(value: string): Subscription;

  getUserId(): string;
  setUserId(value: string): Subscription;

  getProfileId(): string;
  setProfileId(value: string): Subscription;

  getProfileType(): string;
  setProfileType(value: string): Subscription;

  getPlanId(): string;
  setPlanId(value: string): Subscription;

  getStatus(): string;
  setStatus(value: string): Subscription;

  getCurrentPeriodStart(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCurrentPeriodStart(value?: google_protobuf_timestamp_pb.Timestamp): Subscription;
  hasCurrentPeriodStart(): boolean;
  clearCurrentPeriodStart(): Subscription;

  getCurrentPeriodEnd(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCurrentPeriodEnd(value?: google_protobuf_timestamp_pb.Timestamp): Subscription;
  hasCurrentPeriodEnd(): boolean;
  clearCurrentPeriodEnd(): Subscription;

  getTrialEnd(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTrialEnd(value?: google_protobuf_timestamp_pb.Timestamp): Subscription;
  hasTrialEnd(): boolean;
  clearTrialEnd(): Subscription;

  getCancelAtPeriodEnd(): boolean;
  setCancelAtPeriodEnd(value: boolean): Subscription;

  getCancelledAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCancelledAt(value?: google_protobuf_timestamp_pb.Timestamp): Subscription;
  hasCancelledAt(): boolean;
  clearCancelledAt(): Subscription;

  getPlan(): SubscriptionPlan | undefined;
  setPlan(value?: SubscriptionPlan): Subscription;
  hasPlan(): boolean;
  clearPlan(): Subscription;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Subscription;
  hasCreatedAt(): boolean;
  clearCreatedAt(): Subscription;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Subscription;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): Subscription;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Subscription.AsObject;
  static toObject(includeInstance: boolean, msg: Subscription): Subscription.AsObject;
  static serializeBinaryToWriter(message: Subscription, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Subscription;
  static deserializeBinaryFromReader(message: Subscription, reader: jspb.BinaryReader): Subscription;
}

export namespace Subscription {
  export type AsObject = {
    id: string;
    userId: string;
    profileId: string;
    profileType: string;
    planId: string;
    status: string;
    currentPeriodStart?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    currentPeriodEnd?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    trialEnd?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    cancelAtPeriodEnd: boolean;
    cancelledAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    plan?: SubscriptionPlan.AsObject;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class GetMySubscriptionRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetMySubscriptionRequest;

  getProfileId(): string;
  setProfileId(value: string): GetMySubscriptionRequest;

  getProfileType(): string;
  setProfileType(value: string): GetMySubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMySubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetMySubscriptionRequest): GetMySubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: GetMySubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMySubscriptionRequest;
  static deserializeBinaryFromReader(message: GetMySubscriptionRequest, reader: jspb.BinaryReader): GetMySubscriptionRequest;
}

export namespace GetMySubscriptionRequest {
  export type AsObject = {
    userId: string;
    profileId: string;
    profileType: string;
  };
}

export class GetMySubscriptionResponse extends jspb.Message {
  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): GetMySubscriptionResponse;
  hasSubscription(): boolean;
  clearSubscription(): GetMySubscriptionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMySubscriptionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetMySubscriptionResponse): GetMySubscriptionResponse.AsObject;
  static serializeBinaryToWriter(message: GetMySubscriptionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMySubscriptionResponse;
  static deserializeBinaryFromReader(message: GetMySubscriptionResponse, reader: jspb.BinaryReader): GetMySubscriptionResponse;
}

export namespace GetMySubscriptionResponse {
  export type AsObject = {
    subscription?: Subscription.AsObject;
  };
}

export class CheckSubscriptionAccessRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CheckSubscriptionAccessRequest;

  getProfileId(): string;
  setProfileId(value: string): CheckSubscriptionAccessRequest;

  getProfileType(): string;
  setProfileType(value: string): CheckSubscriptionAccessRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckSubscriptionAccessRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CheckSubscriptionAccessRequest): CheckSubscriptionAccessRequest.AsObject;
  static serializeBinaryToWriter(message: CheckSubscriptionAccessRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckSubscriptionAccessRequest;
  static deserializeBinaryFromReader(message: CheckSubscriptionAccessRequest, reader: jspb.BinaryReader): CheckSubscriptionAccessRequest;
}

export namespace CheckSubscriptionAccessRequest {
  export type AsObject = {
    userId: string;
    profileId: string;
    profileType: string;
  };
}

export class CheckSubscriptionAccessResponse extends jspb.Message {
  getHasAccess(): boolean;
  setHasAccess(value: boolean): CheckSubscriptionAccessResponse;

  getStatus(): string;
  setStatus(value: string): CheckSubscriptionAccessResponse;

  getSubscriptionId(): string;
  setSubscriptionId(value: string): CheckSubscriptionAccessResponse;

  getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): CheckSubscriptionAccessResponse;
  hasExpiresAt(): boolean;
  clearExpiresAt(): CheckSubscriptionAccessResponse;

  getIsTrial(): boolean;
  setIsTrial(value: boolean): CheckSubscriptionAccessResponse;

  getIsEarlyAdopter(): boolean;
  setIsEarlyAdopter(value: boolean): CheckSubscriptionAccessResponse;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): CheckSubscriptionAccessResponse;

  getMessage(): string;
  setMessage(value: string): CheckSubscriptionAccessResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckSubscriptionAccessResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CheckSubscriptionAccessResponse): CheckSubscriptionAccessResponse.AsObject;
  static serializeBinaryToWriter(message: CheckSubscriptionAccessResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckSubscriptionAccessResponse;
  static deserializeBinaryFromReader(message: CheckSubscriptionAccessResponse, reader: jspb.BinaryReader): CheckSubscriptionAccessResponse;
}

export namespace CheckSubscriptionAccessResponse {
  export type AsObject = {
    hasAccess: boolean;
    status: string;
    subscriptionId: string;
    expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    isTrial: boolean;
    isEarlyAdopter: boolean;
    daysRemaining: number;
    message: string;
  };
}

