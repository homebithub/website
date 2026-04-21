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

export class Payment extends jspb.Message {
  getId(): string;
  setId(value: string): Payment;

  getUserId(): string;
  setUserId(value: string): Payment;

  getProfileId(): string;
  setProfileId(value: string): Payment;

  getProfileType(): string;
  setProfileType(value: string): Payment;

  getSubscriptionId(): string;
  setSubscriptionId(value: string): Payment;

  getAmount(): number;
  setAmount(value: number): Payment;

  getCurrency(): string;
  setCurrency(value: string): Payment;

  getStatus(): string;
  setStatus(value: string): Payment;

  getPaymentMethod(): string;
  setPaymentMethod(value: string): Payment;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): Payment;

  getMerchantTransactionId(): string;
  setMerchantTransactionId(value: string): Payment;

  getFingoTransactionId(): string;
  setFingoTransactionId(value: string): Payment;

  getMpesaReceiptNumber(): string;
  setMpesaReceiptNumber(value: string): Payment;

  getFailureReason(): string;
  setFailureReason(value: string): Payment;

  getRetryCount(): number;
  setRetryCount(value: number): Payment;

  getPaidAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setPaidAt(value?: google_protobuf_timestamp_pb.Timestamp): Payment;
  hasPaidAt(): boolean;
  clearPaidAt(): Payment;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Payment;
  hasCreatedAt(): boolean;
  clearCreatedAt(): Payment;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Payment;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): Payment;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Payment.AsObject;
  static toObject(includeInstance: boolean, msg: Payment): Payment.AsObject;
  static serializeBinaryToWriter(message: Payment, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Payment;
  static deserializeBinaryFromReader(message: Payment, reader: jspb.BinaryReader): Payment;
}

export namespace Payment {
  export type AsObject = {
    id: string;
    userId: string;
    profileId: string;
    profileType: string;
    subscriptionId: string;
    amount: number;
    currency: string;
    status: string;
    paymentMethod: string;
    phoneNumber: string;
    merchantTransactionId: string;
    fingoTransactionId: string;
    mpesaReceiptNumber: string;
    failureReason: string;
    retryCount: number;
    paidAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class GetPlansRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPlansRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPlansRequest): GetPlansRequest.AsObject;
  static serializeBinaryToWriter(message: GetPlansRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPlansRequest;
  static deserializeBinaryFromReader(message: GetPlansRequest, reader: jspb.BinaryReader): GetPlansRequest;
}

export namespace GetPlansRequest {
  export type AsObject = {
  };
}

export class GetPlansResponse extends jspb.Message {
  getPlansList(): Array<SubscriptionPlan>;
  setPlansList(value: Array<SubscriptionPlan>): GetPlansResponse;
  clearPlansList(): GetPlansResponse;
  addPlans(value?: SubscriptionPlan, index?: number): SubscriptionPlan;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPlansResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPlansResponse): GetPlansResponse.AsObject;
  static serializeBinaryToWriter(message: GetPlansResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPlansResponse;
  static deserializeBinaryFromReader(message: GetPlansResponse, reader: jspb.BinaryReader): GetPlansResponse;
}

export namespace GetPlansResponse {
  export type AsObject = {
    plansList: Array<SubscriptionPlan.AsObject>;
  };
}

export class GetPlanRequest extends jspb.Message {
  getPlanId(): string;
  setPlanId(value: string): GetPlanRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPlanRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPlanRequest): GetPlanRequest.AsObject;
  static serializeBinaryToWriter(message: GetPlanRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPlanRequest;
  static deserializeBinaryFromReader(message: GetPlanRequest, reader: jspb.BinaryReader): GetPlanRequest;
}

export namespace GetPlanRequest {
  export type AsObject = {
    planId: string;
  };
}

export class GetPlanResponse extends jspb.Message {
  getPlan(): SubscriptionPlan | undefined;
  setPlan(value?: SubscriptionPlan): GetPlanResponse;
  hasPlan(): boolean;
  clearPlan(): GetPlanResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPlanResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPlanResponse): GetPlanResponse.AsObject;
  static serializeBinaryToWriter(message: GetPlanResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPlanResponse;
  static deserializeBinaryFromReader(message: GetPlanResponse, reader: jspb.BinaryReader): GetPlanResponse;
}

export namespace GetPlanResponse {
  export type AsObject = {
    plan?: SubscriptionPlan.AsObject;
  };
}

export class CreateSubscriptionRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateSubscriptionRequest;

  getPlanId(): string;
  setPlanId(value: string): CreateSubscriptionRequest;

  getProfileId(): string;
  setProfileId(value: string): CreateSubscriptionRequest;

  getProfileType(): string;
  setProfileType(value: string): CreateSubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateSubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateSubscriptionRequest): CreateSubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: CreateSubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateSubscriptionRequest;
  static deserializeBinaryFromReader(message: CreateSubscriptionRequest, reader: jspb.BinaryReader): CreateSubscriptionRequest;
}

export namespace CreateSubscriptionRequest {
  export type AsObject = {
    userId: string;
    planId: string;
    profileId: string;
    profileType: string;
  };
}

export class CreateSubscriptionResponse extends jspb.Message {
  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): CreateSubscriptionResponse;
  hasSubscription(): boolean;
  clearSubscription(): CreateSubscriptionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateSubscriptionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateSubscriptionResponse): CreateSubscriptionResponse.AsObject;
  static serializeBinaryToWriter(message: CreateSubscriptionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateSubscriptionResponse;
  static deserializeBinaryFromReader(message: CreateSubscriptionResponse, reader: jspb.BinaryReader): CreateSubscriptionResponse;
}

export namespace CreateSubscriptionResponse {
  export type AsObject = {
    subscription?: Subscription.AsObject;
  };
}

export class GetSubscriptionRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): GetSubscriptionRequest;

  getUserId(): string;
  setUserId(value: string): GetSubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetSubscriptionRequest): GetSubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: GetSubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetSubscriptionRequest;
  static deserializeBinaryFromReader(message: GetSubscriptionRequest, reader: jspb.BinaryReader): GetSubscriptionRequest;
}

export namespace GetSubscriptionRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
  };
}

export class GetSubscriptionResponse extends jspb.Message {
  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): GetSubscriptionResponse;
  hasSubscription(): boolean;
  clearSubscription(): GetSubscriptionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetSubscriptionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetSubscriptionResponse): GetSubscriptionResponse.AsObject;
  static serializeBinaryToWriter(message: GetSubscriptionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetSubscriptionResponse;
  static deserializeBinaryFromReader(message: GetSubscriptionResponse, reader: jspb.BinaryReader): GetSubscriptionResponse;
}

export namespace GetSubscriptionResponse {
  export type AsObject = {
    subscription?: Subscription.AsObject;
  };
}

export class GetMySubscriptionRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetMySubscriptionRequest;

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

export class ListMySubscriptionsRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListMySubscriptionsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMySubscriptionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListMySubscriptionsRequest): ListMySubscriptionsRequest.AsObject;
  static serializeBinaryToWriter(message: ListMySubscriptionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMySubscriptionsRequest;
  static deserializeBinaryFromReader(message: ListMySubscriptionsRequest, reader: jspb.BinaryReader): ListMySubscriptionsRequest;
}

export namespace ListMySubscriptionsRequest {
  export type AsObject = {
    userId: string;
  };
}

export class ListMySubscriptionsResponse extends jspb.Message {
  getSubscriptionsList(): Array<Subscription>;
  setSubscriptionsList(value: Array<Subscription>): ListMySubscriptionsResponse;
  clearSubscriptionsList(): ListMySubscriptionsResponse;
  addSubscriptions(value?: Subscription, index?: number): Subscription;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMySubscriptionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListMySubscriptionsResponse): ListMySubscriptionsResponse.AsObject;
  static serializeBinaryToWriter(message: ListMySubscriptionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMySubscriptionsResponse;
  static deserializeBinaryFromReader(message: ListMySubscriptionsResponse, reader: jspb.BinaryReader): ListMySubscriptionsResponse;
}

export namespace ListMySubscriptionsResponse {
  export type AsObject = {
    subscriptionsList: Array<Subscription.AsObject>;
  };
}

export class CancelSubscriptionRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): CancelSubscriptionRequest;

  getUserId(): string;
  setUserId(value: string): CancelSubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelSubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CancelSubscriptionRequest): CancelSubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: CancelSubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelSubscriptionRequest;
  static deserializeBinaryFromReader(message: CancelSubscriptionRequest, reader: jspb.BinaryReader): CancelSubscriptionRequest;
}

export namespace CancelSubscriptionRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
  };
}

export class CancelSubscriptionResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): CancelSubscriptionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancelSubscriptionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CancelSubscriptionResponse): CancelSubscriptionResponse.AsObject;
  static serializeBinaryToWriter(message: CancelSubscriptionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancelSubscriptionResponse;
  static deserializeBinaryFromReader(message: CancelSubscriptionResponse, reader: jspb.BinaryReader): CancelSubscriptionResponse;
}

export namespace CancelSubscriptionResponse {
  export type AsObject = {
    message: string;
  };
}

export class CheckSubscriptionAccessRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CheckSubscriptionAccessRequest;

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

export class CreateSubscriptionCheckoutRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateSubscriptionCheckoutRequest;

  getPlanId(): string;
  setPlanId(value: string): CreateSubscriptionCheckoutRequest;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): CreateSubscriptionCheckoutRequest;

  getProfileId(): string;
  setProfileId(value: string): CreateSubscriptionCheckoutRequest;

  getProfileType(): string;
  setProfileType(value: string): CreateSubscriptionCheckoutRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateSubscriptionCheckoutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateSubscriptionCheckoutRequest): CreateSubscriptionCheckoutRequest.AsObject;
  static serializeBinaryToWriter(message: CreateSubscriptionCheckoutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateSubscriptionCheckoutRequest;
  static deserializeBinaryFromReader(message: CreateSubscriptionCheckoutRequest, reader: jspb.BinaryReader): CreateSubscriptionCheckoutRequest;
}

export namespace CreateSubscriptionCheckoutRequest {
  export type AsObject = {
    userId: string;
    planId: string;
    phoneNumber: string;
    profileId: string;
    profileType: string;
  };
}

export class CreateSubscriptionCheckoutResponse extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): CreateSubscriptionCheckoutResponse;

  getPaymentId(): string;
  setPaymentId(value: string): CreateSubscriptionCheckoutResponse;

  getTransactionId(): string;
  setTransactionId(value: string): CreateSubscriptionCheckoutResponse;

  getStatus(): string;
  setStatus(value: string): CreateSubscriptionCheckoutResponse;

  getMessage(): string;
  setMessage(value: string): CreateSubscriptionCheckoutResponse;

  getAmount(): number;
  setAmount(value: number): CreateSubscriptionCheckoutResponse;

  getPlan(): SubscriptionPlan | undefined;
  setPlan(value?: SubscriptionPlan): CreateSubscriptionCheckoutResponse;
  hasPlan(): boolean;
  clearPlan(): CreateSubscriptionCheckoutResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateSubscriptionCheckoutResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CreateSubscriptionCheckoutResponse): CreateSubscriptionCheckoutResponse.AsObject;
  static serializeBinaryToWriter(message: CreateSubscriptionCheckoutResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateSubscriptionCheckoutResponse;
  static deserializeBinaryFromReader(message: CreateSubscriptionCheckoutResponse, reader: jspb.BinaryReader): CreateSubscriptionCheckoutResponse;
}

export namespace CreateSubscriptionCheckoutResponse {
  export type AsObject = {
    subscriptionId: string;
    paymentId: string;
    transactionId: string;
    status: string;
    message: string;
    amount: number;
    plan?: SubscriptionPlan.AsObject;
  };
}

export class InitiatePaymentRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): InitiatePaymentRequest;

  getSubscriptionId(): string;
  setSubscriptionId(value: string): InitiatePaymentRequest;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): InitiatePaymentRequest;

  getAmount(): number;
  setAmount(value: number): InitiatePaymentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitiatePaymentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InitiatePaymentRequest): InitiatePaymentRequest.AsObject;
  static serializeBinaryToWriter(message: InitiatePaymentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitiatePaymentRequest;
  static deserializeBinaryFromReader(message: InitiatePaymentRequest, reader: jspb.BinaryReader): InitiatePaymentRequest;
}

export namespace InitiatePaymentRequest {
  export type AsObject = {
    userId: string;
    subscriptionId: string;
    phoneNumber: string;
    amount: number;
  };
}

export class InitiatePaymentResponse extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): InitiatePaymentResponse;

  getTransactionId(): string;
  setTransactionId(value: string): InitiatePaymentResponse;

  getStatus(): string;
  setStatus(value: string): InitiatePaymentResponse;

  getMessage(): string;
  setMessage(value: string): InitiatePaymentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitiatePaymentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InitiatePaymentResponse): InitiatePaymentResponse.AsObject;
  static serializeBinaryToWriter(message: InitiatePaymentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitiatePaymentResponse;
  static deserializeBinaryFromReader(message: InitiatePaymentResponse, reader: jspb.BinaryReader): InitiatePaymentResponse;
}

export namespace InitiatePaymentResponse {
  export type AsObject = {
    paymentId: string;
    transactionId: string;
    status: string;
    message: string;
  };
}

export class GetPaymentRequest extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): GetPaymentRequest;

  getUserId(): string;
  setUserId(value: string): GetPaymentRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentRequest): GetPaymentRequest.AsObject;
  static serializeBinaryToWriter(message: GetPaymentRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentRequest;
  static deserializeBinaryFromReader(message: GetPaymentRequest, reader: jspb.BinaryReader): GetPaymentRequest;
}

export namespace GetPaymentRequest {
  export type AsObject = {
    paymentId: string;
    userId: string;
  };
}

export class GetPaymentResponse extends jspb.Message {
  getPayment(): Payment | undefined;
  setPayment(value?: Payment): GetPaymentResponse;
  hasPayment(): boolean;
  clearPayment(): GetPaymentResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentResponse): GetPaymentResponse.AsObject;
  static serializeBinaryToWriter(message: GetPaymentResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentResponse;
  static deserializeBinaryFromReader(message: GetPaymentResponse, reader: jspb.BinaryReader): GetPaymentResponse;
}

export namespace GetPaymentResponse {
  export type AsObject = {
    payment?: Payment.AsObject;
  };
}

export class ListMyPaymentsRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListMyPaymentsRequest;

  getOffset(): number;
  setOffset(value: number): ListMyPaymentsRequest;

  getLimit(): number;
  setLimit(value: number): ListMyPaymentsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMyPaymentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListMyPaymentsRequest): ListMyPaymentsRequest.AsObject;
  static serializeBinaryToWriter(message: ListMyPaymentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMyPaymentsRequest;
  static deserializeBinaryFromReader(message: ListMyPaymentsRequest, reader: jspb.BinaryReader): ListMyPaymentsRequest;
}

export namespace ListMyPaymentsRequest {
  export type AsObject = {
    userId: string;
    offset: number;
    limit: number;
  };
}

export class ListMyPaymentsResponse extends jspb.Message {
  getPaymentsList(): Array<Payment>;
  setPaymentsList(value: Array<Payment>): ListMyPaymentsResponse;
  clearPaymentsList(): ListMyPaymentsResponse;
  addPayments(value?: Payment, index?: number): Payment;

  getOffset(): number;
  setOffset(value: number): ListMyPaymentsResponse;

  getLimit(): number;
  setLimit(value: number): ListMyPaymentsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListMyPaymentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListMyPaymentsResponse): ListMyPaymentsResponse.AsObject;
  static serializeBinaryToWriter(message: ListMyPaymentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListMyPaymentsResponse;
  static deserializeBinaryFromReader(message: ListMyPaymentsResponse, reader: jspb.BinaryReader): ListMyPaymentsResponse;
}

export namespace ListMyPaymentsResponse {
  export type AsObject = {
    paymentsList: Array<Payment.AsObject>;
    offset: number;
    limit: number;
  };
}

export class CheckPaymentStatusRequest extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): CheckPaymentStatusRequest;

  getUserId(): string;
  setUserId(value: string): CheckPaymentStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckPaymentStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CheckPaymentStatusRequest): CheckPaymentStatusRequest.AsObject;
  static serializeBinaryToWriter(message: CheckPaymentStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckPaymentStatusRequest;
  static deserializeBinaryFromReader(message: CheckPaymentStatusRequest, reader: jspb.BinaryReader): CheckPaymentStatusRequest;
}

export namespace CheckPaymentStatusRequest {
  export type AsObject = {
    paymentId: string;
    userId: string;
  };
}

export class CheckPaymentStatusResponse extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): CheckPaymentStatusResponse;

  getStatus(): string;
  setStatus(value: string): CheckPaymentStatusResponse;

  getAmount(): number;
  setAmount(value: number): CheckPaymentStatusResponse;

  getMpesaReceiptNumber(): string;
  setMpesaReceiptNumber(value: string): CheckPaymentStatusResponse;

  getPaidAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setPaidAt(value?: google_protobuf_timestamp_pb.Timestamp): CheckPaymentStatusResponse;
  hasPaidAt(): boolean;
  clearPaidAt(): CheckPaymentStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckPaymentStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CheckPaymentStatusResponse): CheckPaymentStatusResponse.AsObject;
  static serializeBinaryToWriter(message: CheckPaymentStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckPaymentStatusResponse;
  static deserializeBinaryFromReader(message: CheckPaymentStatusResponse, reader: jspb.BinaryReader): CheckPaymentStatusResponse;
}

export namespace CheckPaymentStatusResponse {
  export type AsObject = {
    paymentId: string;
    status: string;
    amount: number;
    mpesaReceiptNumber: string;
    paidAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class DownloadReceiptRequest extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): DownloadReceiptRequest;

  getUserId(): string;
  setUserId(value: string): DownloadReceiptRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DownloadReceiptRequest.AsObject;
  static toObject(includeInstance: boolean, msg: DownloadReceiptRequest): DownloadReceiptRequest.AsObject;
  static serializeBinaryToWriter(message: DownloadReceiptRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DownloadReceiptRequest;
  static deserializeBinaryFromReader(message: DownloadReceiptRequest, reader: jspb.BinaryReader): DownloadReceiptRequest;
}

export namespace DownloadReceiptRequest {
  export type AsObject = {
    paymentId: string;
    userId: string;
  };
}

export class DownloadReceiptResponse extends jspb.Message {
  getPdfData(): Uint8Array | string;
  getPdfData_asU8(): Uint8Array;
  getPdfData_asB64(): string;
  setPdfData(value: Uint8Array | string): DownloadReceiptResponse;

  getFilename(): string;
  setFilename(value: string): DownloadReceiptResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DownloadReceiptResponse.AsObject;
  static toObject(includeInstance: boolean, msg: DownloadReceiptResponse): DownloadReceiptResponse.AsObject;
  static serializeBinaryToWriter(message: DownloadReceiptResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DownloadReceiptResponse;
  static deserializeBinaryFromReader(message: DownloadReceiptResponse, reader: jspb.BinaryReader): DownloadReceiptResponse;
}

export namespace DownloadReceiptResponse {
  export type AsObject = {
    pdfData: Uint8Array | string;
    filename: string;
  };
}

export class EmailReceiptRequest extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): EmailReceiptRequest;

  getUserId(): string;
  setUserId(value: string): EmailReceiptRequest;

  getEmail(): string;
  setEmail(value: string): EmailReceiptRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmailReceiptRequest.AsObject;
  static toObject(includeInstance: boolean, msg: EmailReceiptRequest): EmailReceiptRequest.AsObject;
  static serializeBinaryToWriter(message: EmailReceiptRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmailReceiptRequest;
  static deserializeBinaryFromReader(message: EmailReceiptRequest, reader: jspb.BinaryReader): EmailReceiptRequest;
}

export namespace EmailReceiptRequest {
  export type AsObject = {
    paymentId: string;
    userId: string;
    email: string;
  };
}

export class EmailReceiptResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): EmailReceiptResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmailReceiptResponse.AsObject;
  static toObject(includeInstance: boolean, msg: EmailReceiptResponse): EmailReceiptResponse.AsObject;
  static serializeBinaryToWriter(message: EmailReceiptResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmailReceiptResponse;
  static deserializeBinaryFromReader(message: EmailReceiptResponse, reader: jspb.BinaryReader): EmailReceiptResponse;
}

export namespace EmailReceiptResponse {
  export type AsObject = {
    message: string;
  };
}

export class PreviewProrationRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): PreviewProrationRequest;

  getNewPlanId(): string;
  setNewPlanId(value: string): PreviewProrationRequest;

  getUserId(): string;
  setUserId(value: string): PreviewProrationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PreviewProrationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PreviewProrationRequest): PreviewProrationRequest.AsObject;
  static serializeBinaryToWriter(message: PreviewProrationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PreviewProrationRequest;
  static deserializeBinaryFromReader(message: PreviewProrationRequest, reader: jspb.BinaryReader): PreviewProrationRequest;
}

export namespace PreviewProrationRequest {
  export type AsObject = {
    subscriptionId: string;
    newPlanId: string;
    userId: string;
  };
}

export class PreviewProrationResponse extends jspb.Message {
  getOldPlan(): PlanSummary | undefined;
  setOldPlan(value?: PlanSummary): PreviewProrationResponse;
  hasOldPlan(): boolean;
  clearOldPlan(): PreviewProrationResponse;

  getNewPlan(): PlanSummary | undefined;
  setNewPlan(value?: PlanSummary): PreviewProrationResponse;
  hasNewPlan(): boolean;
  clearNewPlan(): PreviewProrationResponse;

  getProration(): ProrationDetails | undefined;
  setProration(value?: ProrationDetails): PreviewProrationResponse;
  hasProration(): boolean;
  clearProration(): PreviewProrationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PreviewProrationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PreviewProrationResponse): PreviewProrationResponse.AsObject;
  static serializeBinaryToWriter(message: PreviewProrationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PreviewProrationResponse;
  static deserializeBinaryFromReader(message: PreviewProrationResponse, reader: jspb.BinaryReader): PreviewProrationResponse;
}

export namespace PreviewProrationResponse {
  export type AsObject = {
    oldPlan?: PlanSummary.AsObject;
    newPlan?: PlanSummary.AsObject;
    proration?: ProrationDetails.AsObject;
  };
}

export class ChangePlanRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): ChangePlanRequest;

  getNewPlanId(): string;
  setNewPlanId(value: string): ChangePlanRequest;

  getUserId(): string;
  setUserId(value: string): ChangePlanRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChangePlanRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChangePlanRequest): ChangePlanRequest.AsObject;
  static serializeBinaryToWriter(message: ChangePlanRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChangePlanRequest;
  static deserializeBinaryFromReader(message: ChangePlanRequest, reader: jspb.BinaryReader): ChangePlanRequest;
}

export namespace ChangePlanRequest {
  export type AsObject = {
    subscriptionId: string;
    newPlanId: string;
    userId: string;
  };
}

export class ChangePlanResponse extends jspb.Message {
  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): ChangePlanResponse;
  hasSubscription(): boolean;
  clearSubscription(): ChangePlanResponse;

  getProrationCredit(): ProrationCredit | undefined;
  setProrationCredit(value?: ProrationCredit): ChangePlanResponse;
  hasProrationCredit(): boolean;
  clearProrationCredit(): ChangePlanResponse;

  getPayment(): Payment | undefined;
  setPayment(value?: Payment): ChangePlanResponse;
  hasPayment(): boolean;
  clearPayment(): ChangePlanResponse;

  getMessage(): string;
  setMessage(value: string): ChangePlanResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChangePlanResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ChangePlanResponse): ChangePlanResponse.AsObject;
  static serializeBinaryToWriter(message: ChangePlanResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChangePlanResponse;
  static deserializeBinaryFromReader(message: ChangePlanResponse, reader: jspb.BinaryReader): ChangePlanResponse;
}

export namespace ChangePlanResponse {
  export type AsObject = {
    subscription?: Subscription.AsObject;
    prorationCredit?: ProrationCredit.AsObject;
    payment?: Payment.AsObject;
    message: string;
  };
}

export class GetProrationHistoryRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): GetProrationHistoryRequest;

  getUserId(): string;
  setUserId(value: string): GetProrationHistoryRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProrationHistoryRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProrationHistoryRequest): GetProrationHistoryRequest.AsObject;
  static serializeBinaryToWriter(message: GetProrationHistoryRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProrationHistoryRequest;
  static deserializeBinaryFromReader(message: GetProrationHistoryRequest, reader: jspb.BinaryReader): GetProrationHistoryRequest;
}

export namespace GetProrationHistoryRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
  };
}

export class GetProrationHistoryResponse extends jspb.Message {
  getProrationCreditsList(): Array<ProrationCredit>;
  setProrationCreditsList(value: Array<ProrationCredit>): GetProrationHistoryResponse;
  clearProrationCreditsList(): GetProrationHistoryResponse;
  addProrationCredits(value?: ProrationCredit, index?: number): ProrationCredit;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProrationHistoryResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetProrationHistoryResponse): GetProrationHistoryResponse.AsObject;
  static serializeBinaryToWriter(message: GetProrationHistoryResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProrationHistoryResponse;
  static deserializeBinaryFromReader(message: GetProrationHistoryResponse, reader: jspb.BinaryReader): GetProrationHistoryResponse;
}

export namespace GetProrationHistoryResponse {
  export type AsObject = {
    prorationCreditsList: Array<ProrationCredit.AsObject>;
  };
}

export class GetCreditBalanceRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetCreditBalanceRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCreditBalanceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetCreditBalanceRequest): GetCreditBalanceRequest.AsObject;
  static serializeBinaryToWriter(message: GetCreditBalanceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCreditBalanceRequest;
  static deserializeBinaryFromReader(message: GetCreditBalanceRequest, reader: jspb.BinaryReader): GetCreditBalanceRequest;
}

export namespace GetCreditBalanceRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetCreditBalanceResponse extends jspb.Message {
  getCreditBalance(): number;
  setCreditBalance(value: number): GetCreditBalanceResponse;

  getFormatted(): string;
  setFormatted(value: string): GetCreditBalanceResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCreditBalanceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetCreditBalanceResponse): GetCreditBalanceResponse.AsObject;
  static serializeBinaryToWriter(message: GetCreditBalanceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCreditBalanceResponse;
  static deserializeBinaryFromReader(message: GetCreditBalanceResponse, reader: jspb.BinaryReader): GetCreditBalanceResponse;
}

export namespace GetCreditBalanceResponse {
  export type AsObject = {
    creditBalance: number;
    formatted: string;
  };
}

export class PlanSummary extends jspb.Message {
  getId(): string;
  setId(value: string): PlanSummary;

  getName(): string;
  setName(value: string): PlanSummary;

  getPrice(): number;
  setPrice(value: number): PlanSummary;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlanSummary.AsObject;
  static toObject(includeInstance: boolean, msg: PlanSummary): PlanSummary.AsObject;
  static serializeBinaryToWriter(message: PlanSummary, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlanSummary;
  static deserializeBinaryFromReader(message: PlanSummary, reader: jspb.BinaryReader): PlanSummary;
}

export namespace PlanSummary {
  export type AsObject = {
    id: string;
    name: string;
    price: number;
  };
}

export class ProrationDetails extends jspb.Message {
  getUnusedCredit(): number;
  setUnusedCredit(value: number): ProrationDetails;

  getProratedCharge(): number;
  setProratedCharge(value: number): ProrationDetails;

  getNetAmount(): number;
  setNetAmount(value: number): ProrationDetails;

  getDaysUsed(): number;
  setDaysUsed(value: number): ProrationDetails;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): ProrationDetails;

  getTotalDays(): number;
  setTotalDays(value: number): ProrationDetails;

  getDescription(): string;
  setDescription(value: string): ProrationDetails;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProrationDetails.AsObject;
  static toObject(includeInstance: boolean, msg: ProrationDetails): ProrationDetails.AsObject;
  static serializeBinaryToWriter(message: ProrationDetails, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProrationDetails;
  static deserializeBinaryFromReader(message: ProrationDetails, reader: jspb.BinaryReader): ProrationDetails;
}

export namespace ProrationDetails {
  export type AsObject = {
    unusedCredit: number;
    proratedCharge: number;
    netAmount: number;
    daysUsed: number;
    daysRemaining: number;
    totalDays: number;
    description: string;
  };
}

export class ProrationCredit extends jspb.Message {
  getId(): string;
  setId(value: string): ProrationCredit;

  getOldPlanId(): string;
  setOldPlanId(value: string): ProrationCredit;

  getNewPlanId(): string;
  setNewPlanId(value: string): ProrationCredit;

  getOldPlanName(): string;
  setOldPlanName(value: string): ProrationCredit;

  getNewPlanName(): string;
  setNewPlanName(value: string): ProrationCredit;

  getUnusedCredit(): number;
  setUnusedCredit(value: number): ProrationCredit;

  getProratedCharge(): number;
  setProratedCharge(value: number): ProrationCredit;

  getNetAmount(): number;
  setNetAmount(value: number): ProrationCredit;

  getDaysUsed(): number;
  setDaysUsed(value: number): ProrationCredit;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): ProrationCredit;

  getStatus(): string;
  setStatus(value: string): ProrationCredit;

  getChangeDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setChangeDate(value?: google_protobuf_timestamp_pb.Timestamp): ProrationCredit;
  hasChangeDate(): boolean;
  clearChangeDate(): ProrationCredit;

  getAppliedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setAppliedAt(value?: google_protobuf_timestamp_pb.Timestamp): ProrationCredit;
  hasAppliedAt(): boolean;
  clearAppliedAt(): ProrationCredit;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProrationCredit.AsObject;
  static toObject(includeInstance: boolean, msg: ProrationCredit): ProrationCredit.AsObject;
  static serializeBinaryToWriter(message: ProrationCredit, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProrationCredit;
  static deserializeBinaryFromReader(message: ProrationCredit, reader: jspb.BinaryReader): ProrationCredit;
}

export namespace ProrationCredit {
  export type AsObject = {
    id: string;
    oldPlanId: string;
    newPlanId: string;
    oldPlanName: string;
    newPlanName: string;
    unusedCredit: number;
    proratedCharge: number;
    netAmount: number;
    daysUsed: number;
    daysRemaining: number;
    status: string;
    changeDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    appliedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class GetFraudStatsRequest extends jspb.Message {
  getStartDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setStartDate(value?: google_protobuf_timestamp_pb.Timestamp): GetFraudStatsRequest;
  hasStartDate(): boolean;
  clearStartDate(): GetFraudStatsRequest;

  getEndDate(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setEndDate(value?: google_protobuf_timestamp_pb.Timestamp): GetFraudStatsRequest;
  hasEndDate(): boolean;
  clearEndDate(): GetFraudStatsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFraudStatsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetFraudStatsRequest): GetFraudStatsRequest.AsObject;
  static serializeBinaryToWriter(message: GetFraudStatsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFraudStatsRequest;
  static deserializeBinaryFromReader(message: GetFraudStatsRequest, reader: jspb.BinaryReader): GetFraudStatsRequest;
}

export namespace GetFraudStatsRequest {
  export type AsObject = {
    startDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    endDate?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class GetFraudStatsResponse extends jspb.Message {
  getTotalPayments(): number;
  setTotalPayments(value: number): GetFraudStatsResponse;

  getFlaggedPayments(): number;
  setFlaggedPayments(value: number): GetFraudStatsResponse;

  getBlockedPayments(): number;
  setBlockedPayments(value: number): GetFraudStatsResponse;

  getFraudRate(): number;
  setFraudRate(value: number): GetFraudStatsResponse;

  getBlacklistedPhones(): number;
  setBlacklistedPhones(value: number): GetFraudStatsResponse;

  getBlacklistedIps(): number;
  setBlacklistedIps(value: number): GetFraudStatsResponse;

  getHighRiskUsers(): number;
  setHighRiskUsers(value: number): GetFraudStatsResponse;

  getRiskLevelDistributionMap(): jspb.Map<string, number>;
  clearRiskLevelDistributionMap(): GetFraudStatsResponse;

  getFraudReasonsMap(): jspb.Map<string, number>;
  clearFraudReasonsMap(): GetFraudStatsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFraudStatsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetFraudStatsResponse): GetFraudStatsResponse.AsObject;
  static serializeBinaryToWriter(message: GetFraudStatsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFraudStatsResponse;
  static deserializeBinaryFromReader(message: GetFraudStatsResponse, reader: jspb.BinaryReader): GetFraudStatsResponse;
}

export namespace GetFraudStatsResponse {
  export type AsObject = {
    totalPayments: number;
    flaggedPayments: number;
    blockedPayments: number;
    fraudRate: number;
    blacklistedPhones: number;
    blacklistedIps: number;
    highRiskUsers: number;
    riskLevelDistributionMap: Array<[string, number]>;
    fraudReasonsMap: Array<[string, number]>;
  };
}

export class GetFlaggedUsersRequest extends jspb.Message {
  getRiskLevel(): string;
  setRiskLevel(value: string): GetFlaggedUsersRequest;

  getPage(): number;
  setPage(value: number): GetFlaggedUsersRequest;

  getPageSize(): number;
  setPageSize(value: number): GetFlaggedUsersRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFlaggedUsersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetFlaggedUsersRequest): GetFlaggedUsersRequest.AsObject;
  static serializeBinaryToWriter(message: GetFlaggedUsersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFlaggedUsersRequest;
  static deserializeBinaryFromReader(message: GetFlaggedUsersRequest, reader: jspb.BinaryReader): GetFlaggedUsersRequest;
}

export namespace GetFlaggedUsersRequest {
  export type AsObject = {
    riskLevel: string;
    page: number;
    pageSize: number;
  };
}

export class GetFlaggedUsersResponse extends jspb.Message {
  getUsersList(): Array<FlaggedUser>;
  setUsersList(value: Array<FlaggedUser>): GetFlaggedUsersResponse;
  clearUsersList(): GetFlaggedUsersResponse;
  addUsers(value?: FlaggedUser, index?: number): FlaggedUser;

  getTotalCount(): number;
  setTotalCount(value: number): GetFlaggedUsersResponse;

  getPage(): number;
  setPage(value: number): GetFlaggedUsersResponse;

  getPageSize(): number;
  setPageSize(value: number): GetFlaggedUsersResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFlaggedUsersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetFlaggedUsersResponse): GetFlaggedUsersResponse.AsObject;
  static serializeBinaryToWriter(message: GetFlaggedUsersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFlaggedUsersResponse;
  static deserializeBinaryFromReader(message: GetFlaggedUsersResponse, reader: jspb.BinaryReader): GetFlaggedUsersResponse;
}

export namespace GetFlaggedUsersResponse {
  export type AsObject = {
    usersList: Array<FlaggedUser.AsObject>;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export class FlaggedUser extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): FlaggedUser;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): FlaggedUser;

  getRiskLevel(): string;
  setRiskLevel(value: string): FlaggedUser;

  getRiskScore(): number;
  setRiskScore(value: number): FlaggedUser;

  getFraudIndicatorsList(): Array<string>;
  setFraudIndicatorsList(value: Array<string>): FlaggedUser;
  clearFraudIndicatorsList(): FlaggedUser;
  addFraudIndicators(value: string, index?: number): FlaggedUser;

  getPaymentAttempts24h(): number;
  setPaymentAttempts24h(value: number): FlaggedUser;

  getFailedPayments(): number;
  setFailedPayments(value: number): FlaggedUser;

  getLastFlaggedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setLastFlaggedAt(value?: google_protobuf_timestamp_pb.Timestamp): FlaggedUser;
  hasLastFlaggedAt(): boolean;
  clearLastFlaggedAt(): FlaggedUser;

  getIsBlacklisted(): boolean;
  setIsBlacklisted(value: boolean): FlaggedUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FlaggedUser.AsObject;
  static toObject(includeInstance: boolean, msg: FlaggedUser): FlaggedUser.AsObject;
  static serializeBinaryToWriter(message: FlaggedUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FlaggedUser;
  static deserializeBinaryFromReader(message: FlaggedUser, reader: jspb.BinaryReader): FlaggedUser;
}

export namespace FlaggedUser {
  export type AsObject = {
    userId: string;
    phoneNumber: string;
    riskLevel: string;
    riskScore: number;
    fraudIndicatorsList: Array<string>;
    paymentAttempts24h: number;
    failedPayments: number;
    lastFlaggedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    isBlacklisted: boolean;
  };
}

export class GetBlacklistedPhonesRequest extends jspb.Message {
  getPage(): number;
  setPage(value: number): GetBlacklistedPhonesRequest;

  getPageSize(): number;
  setPageSize(value: number): GetBlacklistedPhonesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlacklistedPhonesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlacklistedPhonesRequest): GetBlacklistedPhonesRequest.AsObject;
  static serializeBinaryToWriter(message: GetBlacklistedPhonesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlacklistedPhonesRequest;
  static deserializeBinaryFromReader(message: GetBlacklistedPhonesRequest, reader: jspb.BinaryReader): GetBlacklistedPhonesRequest;
}

export namespace GetBlacklistedPhonesRequest {
  export type AsObject = {
    page: number;
    pageSize: number;
  };
}

export class GetBlacklistedPhonesResponse extends jspb.Message {
  getPhonesList(): Array<BlacklistedPhone>;
  setPhonesList(value: Array<BlacklistedPhone>): GetBlacklistedPhonesResponse;
  clearPhonesList(): GetBlacklistedPhonesResponse;
  addPhones(value?: BlacklistedPhone, index?: number): BlacklistedPhone;

  getTotalCount(): number;
  setTotalCount(value: number): GetBlacklistedPhonesResponse;

  getPage(): number;
  setPage(value: number): GetBlacklistedPhonesResponse;

  getPageSize(): number;
  setPageSize(value: number): GetBlacklistedPhonesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlacklistedPhonesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlacklistedPhonesResponse): GetBlacklistedPhonesResponse.AsObject;
  static serializeBinaryToWriter(message: GetBlacklistedPhonesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlacklistedPhonesResponse;
  static deserializeBinaryFromReader(message: GetBlacklistedPhonesResponse, reader: jspb.BinaryReader): GetBlacklistedPhonesResponse;
}

export namespace GetBlacklistedPhonesResponse {
  export type AsObject = {
    phonesList: Array<BlacklistedPhone.AsObject>;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export class BlacklistedPhone extends jspb.Message {
  getId(): string;
  setId(value: string): BlacklistedPhone;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): BlacklistedPhone;

  getReason(): string;
  setReason(value: string): BlacklistedPhone;

  getAddedBy(): string;
  setAddedBy(value: string): BlacklistedPhone;

  getBlacklistedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setBlacklistedAt(value?: google_protobuf_timestamp_pb.Timestamp): BlacklistedPhone;
  hasBlacklistedAt(): boolean;
  clearBlacklistedAt(): BlacklistedPhone;

  getBlockedAttempts(): number;
  setBlockedAttempts(value: number): BlacklistedPhone;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlacklistedPhone.AsObject;
  static toObject(includeInstance: boolean, msg: BlacklistedPhone): BlacklistedPhone.AsObject;
  static serializeBinaryToWriter(message: BlacklistedPhone, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlacklistedPhone;
  static deserializeBinaryFromReader(message: BlacklistedPhone, reader: jspb.BinaryReader): BlacklistedPhone;
}

export namespace BlacklistedPhone {
  export type AsObject = {
    id: string;
    phoneNumber: string;
    reason: string;
    addedBy: string;
    blacklistedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    blockedAttempts: number;
  };
}

export class GetBlacklistedIPsRequest extends jspb.Message {
  getPage(): number;
  setPage(value: number): GetBlacklistedIPsRequest;

  getPageSize(): number;
  setPageSize(value: number): GetBlacklistedIPsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlacklistedIPsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlacklistedIPsRequest): GetBlacklistedIPsRequest.AsObject;
  static serializeBinaryToWriter(message: GetBlacklistedIPsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlacklistedIPsRequest;
  static deserializeBinaryFromReader(message: GetBlacklistedIPsRequest, reader: jspb.BinaryReader): GetBlacklistedIPsRequest;
}

export namespace GetBlacklistedIPsRequest {
  export type AsObject = {
    page: number;
    pageSize: number;
  };
}

export class GetBlacklistedIPsResponse extends jspb.Message {
  getIpsList(): Array<BlacklistedIP>;
  setIpsList(value: Array<BlacklistedIP>): GetBlacklistedIPsResponse;
  clearIpsList(): GetBlacklistedIPsResponse;
  addIps(value?: BlacklistedIP, index?: number): BlacklistedIP;

  getTotalCount(): number;
  setTotalCount(value: number): GetBlacklistedIPsResponse;

  getPage(): number;
  setPage(value: number): GetBlacklistedIPsResponse;

  getPageSize(): number;
  setPageSize(value: number): GetBlacklistedIPsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetBlacklistedIPsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetBlacklistedIPsResponse): GetBlacklistedIPsResponse.AsObject;
  static serializeBinaryToWriter(message: GetBlacklistedIPsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetBlacklistedIPsResponse;
  static deserializeBinaryFromReader(message: GetBlacklistedIPsResponse, reader: jspb.BinaryReader): GetBlacklistedIPsResponse;
}

export namespace GetBlacklistedIPsResponse {
  export type AsObject = {
    ipsList: Array<BlacklistedIP.AsObject>;
    totalCount: number;
    page: number;
    pageSize: number;
  };
}

export class BlacklistedIP extends jspb.Message {
  getId(): string;
  setId(value: string): BlacklistedIP;

  getIpAddress(): string;
  setIpAddress(value: string): BlacklistedIP;

  getReason(): string;
  setReason(value: string): BlacklistedIP;

  getAddedBy(): string;
  setAddedBy(value: string): BlacklistedIP;

  getBlacklistedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setBlacklistedAt(value?: google_protobuf_timestamp_pb.Timestamp): BlacklistedIP;
  hasBlacklistedAt(): boolean;
  clearBlacklistedAt(): BlacklistedIP;

  getBlockedAttempts(): number;
  setBlockedAttempts(value: number): BlacklistedIP;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlacklistedIP.AsObject;
  static toObject(includeInstance: boolean, msg: BlacklistedIP): BlacklistedIP.AsObject;
  static serializeBinaryToWriter(message: BlacklistedIP, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlacklistedIP;
  static deserializeBinaryFromReader(message: BlacklistedIP, reader: jspb.BinaryReader): BlacklistedIP;
}

export namespace BlacklistedIP {
  export type AsObject = {
    id: string;
    ipAddress: string;
    reason: string;
    addedBy: string;
    blacklistedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    blockedAttempts: number;
  };
}

export class BlacklistPhoneRequest extends jspb.Message {
  getPhoneNumber(): string;
  setPhoneNumber(value: string): BlacklistPhoneRequest;

  getReason(): string;
  setReason(value: string): BlacklistPhoneRequest;

  getAdminUserId(): string;
  setAdminUserId(value: string): BlacklistPhoneRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlacklistPhoneRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlacklistPhoneRequest): BlacklistPhoneRequest.AsObject;
  static serializeBinaryToWriter(message: BlacklistPhoneRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlacklistPhoneRequest;
  static deserializeBinaryFromReader(message: BlacklistPhoneRequest, reader: jspb.BinaryReader): BlacklistPhoneRequest;
}

export namespace BlacklistPhoneRequest {
  export type AsObject = {
    phoneNumber: string;
    reason: string;
    adminUserId: string;
  };
}

export class BlacklistPhoneResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): BlacklistPhoneResponse;

  getMessage(): string;
  setMessage(value: string): BlacklistPhoneResponse;

  getPhone(): BlacklistedPhone | undefined;
  setPhone(value?: BlacklistedPhone): BlacklistPhoneResponse;
  hasPhone(): boolean;
  clearPhone(): BlacklistPhoneResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlacklistPhoneResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BlacklistPhoneResponse): BlacklistPhoneResponse.AsObject;
  static serializeBinaryToWriter(message: BlacklistPhoneResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlacklistPhoneResponse;
  static deserializeBinaryFromReader(message: BlacklistPhoneResponse, reader: jspb.BinaryReader): BlacklistPhoneResponse;
}

export namespace BlacklistPhoneResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    phone?: BlacklistedPhone.AsObject;
  };
}

export class BlacklistIPRequest extends jspb.Message {
  getIpAddress(): string;
  setIpAddress(value: string): BlacklistIPRequest;

  getReason(): string;
  setReason(value: string): BlacklistIPRequest;

  getAdminUserId(): string;
  setAdminUserId(value: string): BlacklistIPRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlacklistIPRequest.AsObject;
  static toObject(includeInstance: boolean, msg: BlacklistIPRequest): BlacklistIPRequest.AsObject;
  static serializeBinaryToWriter(message: BlacklistIPRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlacklistIPRequest;
  static deserializeBinaryFromReader(message: BlacklistIPRequest, reader: jspb.BinaryReader): BlacklistIPRequest;
}

export namespace BlacklistIPRequest {
  export type AsObject = {
    ipAddress: string;
    reason: string;
    adminUserId: string;
  };
}

export class BlacklistIPResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): BlacklistIPResponse;

  getMessage(): string;
  setMessage(value: string): BlacklistIPResponse;

  getIp(): BlacklistedIP | undefined;
  setIp(value?: BlacklistedIP): BlacklistIPResponse;
  hasIp(): boolean;
  clearIp(): BlacklistIPResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlacklistIPResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BlacklistIPResponse): BlacklistIPResponse.AsObject;
  static serializeBinaryToWriter(message: BlacklistIPResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlacklistIPResponse;
  static deserializeBinaryFromReader(message: BlacklistIPResponse, reader: jspb.BinaryReader): BlacklistIPResponse;
}

export namespace BlacklistIPResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    ip?: BlacklistedIP.AsObject;
  };
}

export class RemovePhoneFromBlacklistRequest extends jspb.Message {
  getPhoneNumber(): string;
  setPhoneNumber(value: string): RemovePhoneFromBlacklistRequest;

  getAdminUserId(): string;
  setAdminUserId(value: string): RemovePhoneFromBlacklistRequest;

  getReason(): string;
  setReason(value: string): RemovePhoneFromBlacklistRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePhoneFromBlacklistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePhoneFromBlacklistRequest): RemovePhoneFromBlacklistRequest.AsObject;
  static serializeBinaryToWriter(message: RemovePhoneFromBlacklistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePhoneFromBlacklistRequest;
  static deserializeBinaryFromReader(message: RemovePhoneFromBlacklistRequest, reader: jspb.BinaryReader): RemovePhoneFromBlacklistRequest;
}

export namespace RemovePhoneFromBlacklistRequest {
  export type AsObject = {
    phoneNumber: string;
    adminUserId: string;
    reason: string;
  };
}

export class RemovePhoneFromBlacklistResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): RemovePhoneFromBlacklistResponse;

  getMessage(): string;
  setMessage(value: string): RemovePhoneFromBlacklistResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePhoneFromBlacklistResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePhoneFromBlacklistResponse): RemovePhoneFromBlacklistResponse.AsObject;
  static serializeBinaryToWriter(message: RemovePhoneFromBlacklistResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePhoneFromBlacklistResponse;
  static deserializeBinaryFromReader(message: RemovePhoneFromBlacklistResponse, reader: jspb.BinaryReader): RemovePhoneFromBlacklistResponse;
}

export namespace RemovePhoneFromBlacklistResponse {
  export type AsObject = {
    success: boolean;
    message: string;
  };
}

export class RemoveIPFromBlacklistRequest extends jspb.Message {
  getIpAddress(): string;
  setIpAddress(value: string): RemoveIPFromBlacklistRequest;

  getAdminUserId(): string;
  setAdminUserId(value: string): RemoveIPFromBlacklistRequest;

  getReason(): string;
  setReason(value: string): RemoveIPFromBlacklistRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveIPFromBlacklistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveIPFromBlacklistRequest): RemoveIPFromBlacklistRequest.AsObject;
  static serializeBinaryToWriter(message: RemoveIPFromBlacklistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveIPFromBlacklistRequest;
  static deserializeBinaryFromReader(message: RemoveIPFromBlacklistRequest, reader: jspb.BinaryReader): RemoveIPFromBlacklistRequest;
}

export namespace RemoveIPFromBlacklistRequest {
  export type AsObject = {
    ipAddress: string;
    adminUserId: string;
    reason: string;
  };
}

export class RemoveIPFromBlacklistResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): RemoveIPFromBlacklistResponse;

  getMessage(): string;
  setMessage(value: string): RemoveIPFromBlacklistResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveIPFromBlacklistResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveIPFromBlacklistResponse): RemoveIPFromBlacklistResponse.AsObject;
  static serializeBinaryToWriter(message: RemoveIPFromBlacklistResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveIPFromBlacklistResponse;
  static deserializeBinaryFromReader(message: RemoveIPFromBlacklistResponse, reader: jspb.BinaryReader): RemoveIPFromBlacklistResponse;
}

export namespace RemoveIPFromBlacklistResponse {
  export type AsObject = {
    success: boolean;
    message: string;
  };
}

export class GetFraudRulesRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFraudRulesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetFraudRulesRequest): GetFraudRulesRequest.AsObject;
  static serializeBinaryToWriter(message: GetFraudRulesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFraudRulesRequest;
  static deserializeBinaryFromReader(message: GetFraudRulesRequest, reader: jspb.BinaryReader): GetFraudRulesRequest;
}

export namespace GetFraudRulesRequest {
  export type AsObject = {
  };
}

export class GetFraudRulesResponse extends jspb.Message {
  getRulesList(): Array<FraudRule>;
  setRulesList(value: Array<FraudRule>): GetFraudRulesResponse;
  clearRulesList(): GetFraudRulesResponse;
  addRules(value?: FraudRule, index?: number): FraudRule;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetFraudRulesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetFraudRulesResponse): GetFraudRulesResponse.AsObject;
  static serializeBinaryToWriter(message: GetFraudRulesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetFraudRulesResponse;
  static deserializeBinaryFromReader(message: GetFraudRulesResponse, reader: jspb.BinaryReader): GetFraudRulesResponse;
}

export namespace GetFraudRulesResponse {
  export type AsObject = {
    rulesList: Array<FraudRule.AsObject>;
  };
}

export class FraudRule extends jspb.Message {
  getId(): string;
  setId(value: string): FraudRule;

  getName(): string;
  setName(value: string): FraudRule;

  getDescription(): string;
  setDescription(value: string): FraudRule;

  getRuleType(): string;
  setRuleType(value: string): FraudRule;

  getParametersMap(): jspb.Map<string, string>;
  clearParametersMap(): FraudRule;

  getIsActive(): boolean;
  setIsActive(value: boolean): FraudRule;

  getPriority(): number;
  setPriority(value: number): FraudRule;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): FraudRule;
  hasCreatedAt(): boolean;
  clearCreatedAt(): FraudRule;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): FraudRule;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): FraudRule;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FraudRule.AsObject;
  static toObject(includeInstance: boolean, msg: FraudRule): FraudRule.AsObject;
  static serializeBinaryToWriter(message: FraudRule, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FraudRule;
  static deserializeBinaryFromReader(message: FraudRule, reader: jspb.BinaryReader): FraudRule;
}

export namespace FraudRule {
  export type AsObject = {
    id: string;
    name: string;
    description: string;
    ruleType: string;
    parametersMap: Array<[string, string]>;
    isActive: boolean;
    priority: number;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class UpdateFraudRuleRequest extends jspb.Message {
  getRuleId(): string;
  setRuleId(value: string): UpdateFraudRuleRequest;

  getParametersMap(): jspb.Map<string, string>;
  clearParametersMap(): UpdateFraudRuleRequest;

  getIsActive(): boolean;
  setIsActive(value: boolean): UpdateFraudRuleRequest;

  getAdminUserId(): string;
  setAdminUserId(value: string): UpdateFraudRuleRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateFraudRuleRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateFraudRuleRequest): UpdateFraudRuleRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateFraudRuleRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateFraudRuleRequest;
  static deserializeBinaryFromReader(message: UpdateFraudRuleRequest, reader: jspb.BinaryReader): UpdateFraudRuleRequest;
}

export namespace UpdateFraudRuleRequest {
  export type AsObject = {
    ruleId: string;
    parametersMap: Array<[string, string]>;
    isActive: boolean;
    adminUserId: string;
  };
}

export class UpdateFraudRuleResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): UpdateFraudRuleResponse;

  getMessage(): string;
  setMessage(value: string): UpdateFraudRuleResponse;

  getRule(): FraudRule | undefined;
  setRule(value?: FraudRule): UpdateFraudRuleResponse;
  hasRule(): boolean;
  clearRule(): UpdateFraudRuleResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateFraudRuleResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateFraudRuleResponse): UpdateFraudRuleResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateFraudRuleResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateFraudRuleResponse;
  static deserializeBinaryFromReader(message: UpdateFraudRuleResponse, reader: jspb.BinaryReader): UpdateFraudRuleResponse;
}

export namespace UpdateFraudRuleResponse {
  export type AsObject = {
    success: boolean;
    message: string;
    rule?: FraudRule.AsObject;
  };
}

export class PauseSubscriptionRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): PauseSubscriptionRequest;

  getUserId(): string;
  setUserId(value: string): PauseSubscriptionRequest;

  getReason(): string;
  setReason(value: string): PauseSubscriptionRequest;

  getDurationDays(): number;
  setDurationDays(value: number): PauseSubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PauseSubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PauseSubscriptionRequest): PauseSubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: PauseSubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PauseSubscriptionRequest;
  static deserializeBinaryFromReader(message: PauseSubscriptionRequest, reader: jspb.BinaryReader): PauseSubscriptionRequest;
}

export namespace PauseSubscriptionRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    reason: string;
    durationDays: number;
  };
}

export class PauseSubscriptionResponse extends jspb.Message {
  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): PauseSubscriptionResponse;
  hasSubscription(): boolean;
  clearSubscription(): PauseSubscriptionResponse;

  getPauseHistory(): PauseHistory | undefined;
  setPauseHistory(value?: PauseHistory): PauseSubscriptionResponse;
  hasPauseHistory(): boolean;
  clearPauseHistory(): PauseSubscriptionResponse;

  getMessage(): string;
  setMessage(value: string): PauseSubscriptionResponse;

  getResumeDate(): string;
  setResumeDate(value: string): PauseSubscriptionResponse;

  getAccessUntil(): string;
  setAccessUntil(value: string): PauseSubscriptionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PauseSubscriptionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PauseSubscriptionResponse): PauseSubscriptionResponse.AsObject;
  static serializeBinaryToWriter(message: PauseSubscriptionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PauseSubscriptionResponse;
  static deserializeBinaryFromReader(message: PauseSubscriptionResponse, reader: jspb.BinaryReader): PauseSubscriptionResponse;
}

export namespace PauseSubscriptionResponse {
  export type AsObject = {
    subscription?: Subscription.AsObject;
    pauseHistory?: PauseHistory.AsObject;
    message: string;
    resumeDate: string;
    accessUntil: string;
  };
}

export class ResumeSubscriptionRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): ResumeSubscriptionRequest;

  getUserId(): string;
  setUserId(value: string): ResumeSubscriptionRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResumeSubscriptionRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ResumeSubscriptionRequest): ResumeSubscriptionRequest.AsObject;
  static serializeBinaryToWriter(message: ResumeSubscriptionRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResumeSubscriptionRequest;
  static deserializeBinaryFromReader(message: ResumeSubscriptionRequest, reader: jspb.BinaryReader): ResumeSubscriptionRequest;
}

export namespace ResumeSubscriptionRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
  };
}

export class ResumeSubscriptionResponse extends jspb.Message {
  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): ResumeSubscriptionResponse;
  hasSubscription(): boolean;
  clearSubscription(): ResumeSubscriptionResponse;

  getPauseHistory(): PauseHistory | undefined;
  setPauseHistory(value?: PauseHistory): ResumeSubscriptionResponse;
  hasPauseHistory(): boolean;
  clearPauseHistory(): ResumeSubscriptionResponse;

  getMessage(): string;
  setMessage(value: string): ResumeSubscriptionResponse;

  getNextBillingDate(): string;
  setNextBillingDate(value: string): ResumeSubscriptionResponse;

  getNextBillingAmount(): number;
  setNextBillingAmount(value: number): ResumeSubscriptionResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResumeSubscriptionResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ResumeSubscriptionResponse): ResumeSubscriptionResponse.AsObject;
  static serializeBinaryToWriter(message: ResumeSubscriptionResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResumeSubscriptionResponse;
  static deserializeBinaryFromReader(message: ResumeSubscriptionResponse, reader: jspb.BinaryReader): ResumeSubscriptionResponse;
}

export namespace ResumeSubscriptionResponse {
  export type AsObject = {
    subscription?: Subscription.AsObject;
    pauseHistory?: PauseHistory.AsObject;
    message: string;
    nextBillingDate: string;
    nextBillingAmount: number;
  };
}

export class GetPauseStatusRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): GetPauseStatusRequest;

  getUserId(): string;
  setUserId(value: string): GetPauseStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPauseStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPauseStatusRequest): GetPauseStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetPauseStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPauseStatusRequest;
  static deserializeBinaryFromReader(message: GetPauseStatusRequest, reader: jspb.BinaryReader): GetPauseStatusRequest;
}

export namespace GetPauseStatusRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
  };
}

export class GetPauseStatusResponse extends jspb.Message {
  getIsPaused(): boolean;
  setIsPaused(value: boolean): GetPauseStatusResponse;

  getPausedAt(): string;
  setPausedAt(value: string): GetPauseStatusResponse;

  getResumeAt(): string;
  setResumeAt(value: string): GetPauseStatusResponse;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): GetPauseStatusResponse;

  getCanPause(): boolean;
  setCanPause(value: boolean): GetPauseStatusResponse;

  getCannotPauseReason(): string;
  setCannotPauseReason(value: string): GetPauseStatusResponse;

  getHistoryList(): Array<PauseHistory>;
  setHistoryList(value: Array<PauseHistory>): GetPauseStatusResponse;
  clearHistoryList(): GetPauseStatusResponse;
  addHistory(value?: PauseHistory, index?: number): PauseHistory;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPauseStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPauseStatusResponse): GetPauseStatusResponse.AsObject;
  static serializeBinaryToWriter(message: GetPauseStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPauseStatusResponse;
  static deserializeBinaryFromReader(message: GetPauseStatusResponse, reader: jspb.BinaryReader): GetPauseStatusResponse;
}

export namespace GetPauseStatusResponse {
  export type AsObject = {
    isPaused: boolean;
    pausedAt: string;
    resumeAt: string;
    daysRemaining: number;
    canPause: boolean;
    cannotPauseReason: string;
    historyList: Array<PauseHistory.AsObject>;
  };
}

export class PauseHistory extends jspb.Message {
  getId(): string;
  setId(value: string): PauseHistory;

  getSubscriptionId(): string;
  setSubscriptionId(value: string): PauseHistory;

  getUserId(): string;
  setUserId(value: string): PauseHistory;

  getPausedAt(): string;
  setPausedAt(value: string): PauseHistory;

  getResumeAt(): string;
  setResumeAt(value: string): PauseHistory;

  getResumedAt(): string;
  setResumedAt(value: string): PauseHistory;

  getPauseReason(): string;
  setPauseReason(value: string): PauseHistory;

  getStatus(): string;
  setStatus(value: string): PauseHistory;

  getDurationDays(): number;
  setDurationDays(value: number): PauseHistory;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): PauseHistory;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PauseHistory.AsObject;
  static toObject(includeInstance: boolean, msg: PauseHistory): PauseHistory.AsObject;
  static serializeBinaryToWriter(message: PauseHistory, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PauseHistory;
  static deserializeBinaryFromReader(message: PauseHistory, reader: jspb.BinaryReader): PauseHistory;
}

export namespace PauseHistory {
  export type AsObject = {
    id: string;
    subscriptionId: string;
    userId: string;
    pausedAt: string;
    resumeAt: string;
    resumedAt: string;
    pauseReason: string;
    status: string;
    durationDays: number;
    daysRemaining: number;
  };
}

export class InitiateCancellationRequest extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): InitiateCancellationRequest;

  getUserId(): string;
  setUserId(value: string): InitiateCancellationRequest;

  getReasonCategory(): string;
  setReasonCategory(value: string): InitiateCancellationRequest;

  getReasonText(): string;
  setReasonText(value: string): InitiateCancellationRequest;

  getFeedback(): string;
  setFeedback(value: string): InitiateCancellationRequest;

  getUserAgent(): string;
  setUserAgent(value: string): InitiateCancellationRequest;

  getIpAddress(): string;
  setIpAddress(value: string): InitiateCancellationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitiateCancellationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: InitiateCancellationRequest): InitiateCancellationRequest.AsObject;
  static serializeBinaryToWriter(message: InitiateCancellationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitiateCancellationRequest;
  static deserializeBinaryFromReader(message: InitiateCancellationRequest, reader: jspb.BinaryReader): InitiateCancellationRequest;
}

export namespace InitiateCancellationRequest {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    reasonCategory: string;
    reasonText: string;
    feedback: string;
    userAgent: string;
    ipAddress: string;
  };
}

export class InitiateCancellationResponse extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): InitiateCancellationResponse;

  getStatus(): string;
  setStatus(value: string): InitiateCancellationResponse;

  getEffectiveDate(): string;
  setEffectiveDate(value: string): InitiateCancellationResponse;

  getAccessUntil(): string;
  setAccessUntil(value: string): InitiateCancellationResponse;

  getRetentionOffersList(): Array<RetentionOffer>;
  setRetentionOffersList(value: Array<RetentionOffer>): InitiateCancellationResponse;
  clearRetentionOffersList(): InitiateCancellationResponse;
  addRetentionOffers(value?: RetentionOffer, index?: number): RetentionOffer;

  getMessage(): string;
  setMessage(value: string): InitiateCancellationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InitiateCancellationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InitiateCancellationResponse): InitiateCancellationResponse.AsObject;
  static serializeBinaryToWriter(message: InitiateCancellationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InitiateCancellationResponse;
  static deserializeBinaryFromReader(message: InitiateCancellationResponse, reader: jspb.BinaryReader): InitiateCancellationResponse;
}

export namespace InitiateCancellationResponse {
  export type AsObject = {
    cancellationRequestId: string;
    status: string;
    effectiveDate: string;
    accessUntil: string;
    retentionOffersList: Array<RetentionOffer.AsObject>;
    message: string;
  };
}

export class RetentionOffer extends jspb.Message {
  getType(): string;
  setType(value: string): RetentionOffer;

  getTitle(): string;
  setTitle(value: string): RetentionOffer;

  getDescription(): string;
  setDescription(value: string): RetentionOffer;

  getCurrentPrice(): string;
  setCurrentPrice(value: string): RetentionOffer;

  getNewPrice(): string;
  setNewPrice(value: string): RetentionOffer;

  getDiscountPercent(): number;
  setDiscountPercent(value: number): RetentionOffer;

  getDurationMonths(): number;
  setDurationMonths(value: number): RetentionOffer;

  getAction(): string;
  setAction(value: string): RetentionOffer;

  getSavings(): number;
  setSavings(value: number): RetentionOffer;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RetentionOffer.AsObject;
  static toObject(includeInstance: boolean, msg: RetentionOffer): RetentionOffer.AsObject;
  static serializeBinaryToWriter(message: RetentionOffer, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RetentionOffer;
  static deserializeBinaryFromReader(message: RetentionOffer, reader: jspb.BinaryReader): RetentionOffer;
}

export namespace RetentionOffer {
  export type AsObject = {
    type: string;
    title: string;
    description: string;
    currentPrice: string;
    newPrice: string;
    discountPercent: number;
    durationMonths: number;
    action: string;
    savings: number;
  };
}

export class AcceptRetentionOfferRequest extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): AcceptRetentionOfferRequest;

  getUserId(): string;
  setUserId(value: string): AcceptRetentionOfferRequest;

  getOfferType(): string;
  setOfferType(value: string): AcceptRetentionOfferRequest;

  getOfferDetailsMap(): jspb.Map<string, string>;
  clearOfferDetailsMap(): AcceptRetentionOfferRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AcceptRetentionOfferRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AcceptRetentionOfferRequest): AcceptRetentionOfferRequest.AsObject;
  static serializeBinaryToWriter(message: AcceptRetentionOfferRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AcceptRetentionOfferRequest;
  static deserializeBinaryFromReader(message: AcceptRetentionOfferRequest, reader: jspb.BinaryReader): AcceptRetentionOfferRequest;
}

export namespace AcceptRetentionOfferRequest {
  export type AsObject = {
    cancellationRequestId: string;
    userId: string;
    offerType: string;
    offerDetailsMap: Array<[string, string]>;
  };
}

export class AcceptRetentionOfferResponse extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): AcceptRetentionOfferResponse;

  getMessage(): string;
  setMessage(value: string): AcceptRetentionOfferResponse;

  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): AcceptRetentionOfferResponse;
  hasSubscription(): boolean;
  clearSubscription(): AcceptRetentionOfferResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AcceptRetentionOfferResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AcceptRetentionOfferResponse): AcceptRetentionOfferResponse.AsObject;
  static serializeBinaryToWriter(message: AcceptRetentionOfferResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AcceptRetentionOfferResponse;
  static deserializeBinaryFromReader(message: AcceptRetentionOfferResponse, reader: jspb.BinaryReader): AcceptRetentionOfferResponse;
}

export namespace AcceptRetentionOfferResponse {
  export type AsObject = {
    status: string;
    message: string;
    subscription?: Subscription.AsObject;
  };
}

export class ConfirmCancellationRequest extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): ConfirmCancellationRequest;

  getUserId(): string;
  setUserId(value: string): ConfirmCancellationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmCancellationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmCancellationRequest): ConfirmCancellationRequest.AsObject;
  static serializeBinaryToWriter(message: ConfirmCancellationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmCancellationRequest;
  static deserializeBinaryFromReader(message: ConfirmCancellationRequest, reader: jspb.BinaryReader): ConfirmCancellationRequest;
}

export namespace ConfirmCancellationRequest {
  export type AsObject = {
    cancellationRequestId: string;
    userId: string;
  };
}

export class ConfirmCancellationResponse extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): ConfirmCancellationResponse;

  getStatus(): string;
  setStatus(value: string): ConfirmCancellationResponse;

  getEffectiveDate(): string;
  setEffectiveDate(value: string): ConfirmCancellationResponse;

  getAccessUntil(): string;
  setAccessUntil(value: string): ConfirmCancellationResponse;

  getCanUndo(): boolean;
  setCanUndo(value: boolean): ConfirmCancellationResponse;

  getUndoDeadline(): string;
  setUndoDeadline(value: string): ConfirmCancellationResponse;

  getMessage(): string;
  setMessage(value: string): ConfirmCancellationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmCancellationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmCancellationResponse): ConfirmCancellationResponse.AsObject;
  static serializeBinaryToWriter(message: ConfirmCancellationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmCancellationResponse;
  static deserializeBinaryFromReader(message: ConfirmCancellationResponse, reader: jspb.BinaryReader): ConfirmCancellationResponse;
}

export namespace ConfirmCancellationResponse {
  export type AsObject = {
    cancellationRequestId: string;
    status: string;
    effectiveDate: string;
    accessUntil: string;
    canUndo: boolean;
    undoDeadline: string;
    message: string;
  };
}

export class UndoCancellationRequest extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): UndoCancellationRequest;

  getUserId(): string;
  setUserId(value: string): UndoCancellationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UndoCancellationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UndoCancellationRequest): UndoCancellationRequest.AsObject;
  static serializeBinaryToWriter(message: UndoCancellationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UndoCancellationRequest;
  static deserializeBinaryFromReader(message: UndoCancellationRequest, reader: jspb.BinaryReader): UndoCancellationRequest;
}

export namespace UndoCancellationRequest {
  export type AsObject = {
    cancellationRequestId: string;
    userId: string;
  };
}

export class UndoCancellationResponse extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): UndoCancellationResponse;

  getStatus(): string;
  setStatus(value: string): UndoCancellationResponse;

  getMessage(): string;
  setMessage(value: string): UndoCancellationResponse;

  getSubscription(): Subscription | undefined;
  setSubscription(value?: Subscription): UndoCancellationResponse;
  hasSubscription(): boolean;
  clearSubscription(): UndoCancellationResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UndoCancellationResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UndoCancellationResponse): UndoCancellationResponse.AsObject;
  static serializeBinaryToWriter(message: UndoCancellationResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UndoCancellationResponse;
  static deserializeBinaryFromReader(message: UndoCancellationResponse, reader: jspb.BinaryReader): UndoCancellationResponse;
}

export namespace UndoCancellationResponse {
  export type AsObject = {
    cancellationRequestId: string;
    status: string;
    message: string;
    subscription?: Subscription.AsObject;
  };
}

export class GetCancellationStatusRequest extends jspb.Message {
  getCancellationRequestId(): string;
  setCancellationRequestId(value: string): GetCancellationStatusRequest;

  getUserId(): string;
  setUserId(value: string): GetCancellationStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCancellationStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetCancellationStatusRequest): GetCancellationStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetCancellationStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCancellationStatusRequest;
  static deserializeBinaryFromReader(message: GetCancellationStatusRequest, reader: jspb.BinaryReader): GetCancellationStatusRequest;
}

export namespace GetCancellationStatusRequest {
  export type AsObject = {
    cancellationRequestId: string;
    userId: string;
  };
}

export class GetCancellationStatusResponse extends jspb.Message {
  getCancellationRequest(): CancellationRequest | undefined;
  setCancellationRequest(value?: CancellationRequest): GetCancellationStatusResponse;
  hasCancellationRequest(): boolean;
  clearCancellationRequest(): GetCancellationStatusResponse;

  getCanUndo(): boolean;
  setCanUndo(value: boolean): GetCancellationStatusResponse;

  getDaysUntilEffective(): number;
  setDaysUntilEffective(value: number): GetCancellationStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCancellationStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetCancellationStatusResponse): GetCancellationStatusResponse.AsObject;
  static serializeBinaryToWriter(message: GetCancellationStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCancellationStatusResponse;
  static deserializeBinaryFromReader(message: GetCancellationStatusResponse, reader: jspb.BinaryReader): GetCancellationStatusResponse;
}

export namespace GetCancellationStatusResponse {
  export type AsObject = {
    cancellationRequest?: CancellationRequest.AsObject;
    canUndo: boolean;
    daysUntilEffective: number;
  };
}

export class CancellationRequest extends jspb.Message {
  getId(): string;
  setId(value: string): CancellationRequest;

  getSubscriptionId(): string;
  setSubscriptionId(value: string): CancellationRequest;

  getUserId(): string;
  setUserId(value: string): CancellationRequest;

  getReasonCategory(): string;
  setReasonCategory(value: string): CancellationRequest;

  getReasonText(): string;
  setReasonText(value: string): CancellationRequest;

  getFeedback(): string;
  setFeedback(value: string): CancellationRequest;

  getRequestedAt(): string;
  setRequestedAt(value: string): CancellationRequest;

  getRetentionOfferShown(): boolean;
  setRetentionOfferShown(value: boolean): CancellationRequest;

  getRetentionOfferType(): string;
  setRetentionOfferType(value: string): CancellationRequest;

  getRetentionOfferAccepted(): boolean;
  setRetentionOfferAccepted(value: boolean): CancellationRequest;

  getStatus(): string;
  setStatus(value: string): CancellationRequest;

  getEffectiveDate(): string;
  setEffectiveDate(value: string): CancellationRequest;

  getCompletedAt(): string;
  setCompletedAt(value: string): CancellationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CancellationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CancellationRequest): CancellationRequest.AsObject;
  static serializeBinaryToWriter(message: CancellationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CancellationRequest;
  static deserializeBinaryFromReader(message: CancellationRequest, reader: jspb.BinaryReader): CancellationRequest;
}

export namespace CancellationRequest {
  export type AsObject = {
    id: string;
    subscriptionId: string;
    userId: string;
    reasonCategory: string;
    reasonText: string;
    feedback: string;
    requestedAt: string;
    retentionOfferShown: boolean;
    retentionOfferType: string;
    retentionOfferAccepted: boolean;
    status: string;
    effectiveDate: string;
    completedAt: string;
  };
}

export class GetAnalyticsRequest extends jspb.Message {
  getStartDate(): string;
  setStartDate(value: string): GetAnalyticsRequest;

  getEndDate(): string;
  setEndDate(value: string): GetAnalyticsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAnalyticsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetAnalyticsRequest): GetAnalyticsRequest.AsObject;
  static serializeBinaryToWriter(message: GetAnalyticsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAnalyticsRequest;
  static deserializeBinaryFromReader(message: GetAnalyticsRequest, reader: jspb.BinaryReader): GetAnalyticsRequest;
}

export namespace GetAnalyticsRequest {
  export type AsObject = {
    startDate: string;
    endDate: string;
  };
}

export class GetAnalyticsResponse extends jspb.Message {
  getMetrics(): AnalyticsMetrics | undefined;
  setMetrics(value?: AnalyticsMetrics): GetAnalyticsResponse;
  hasMetrics(): boolean;
  clearMetrics(): GetAnalyticsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAnalyticsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetAnalyticsResponse): GetAnalyticsResponse.AsObject;
  static serializeBinaryToWriter(message: GetAnalyticsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAnalyticsResponse;
  static deserializeBinaryFromReader(message: GetAnalyticsResponse, reader: jspb.BinaryReader): GetAnalyticsResponse;
}

export namespace GetAnalyticsResponse {
  export type AsObject = {
    metrics?: AnalyticsMetrics.AsObject;
  };
}

export class GetMRRMetricsRequest extends jspb.Message {
  getAsOfDate(): string;
  setAsOfDate(value: string): GetMRRMetricsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMRRMetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetMRRMetricsRequest): GetMRRMetricsRequest.AsObject;
  static serializeBinaryToWriter(message: GetMRRMetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMRRMetricsRequest;
  static deserializeBinaryFromReader(message: GetMRRMetricsRequest, reader: jspb.BinaryReader): GetMRRMetricsRequest;
}

export namespace GetMRRMetricsRequest {
  export type AsObject = {
    asOfDate: string;
  };
}

export class GetMRRMetricsResponse extends jspb.Message {
  getMrr(): number;
  setMrr(value: number): GetMRRMetricsResponse;

  getArr(): number;
  setArr(value: number): GetMRRMetricsResponse;

  getMrrGrowth(): number;
  setMrrGrowth(value: number): GetMRRMetricsResponse;

  getMrrByPlanMap(): jspb.Map<string, number>;
  clearMrrByPlanMap(): GetMRRMetricsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMRRMetricsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetMRRMetricsResponse): GetMRRMetricsResponse.AsObject;
  static serializeBinaryToWriter(message: GetMRRMetricsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMRRMetricsResponse;
  static deserializeBinaryFromReader(message: GetMRRMetricsResponse, reader: jspb.BinaryReader): GetMRRMetricsResponse;
}

export namespace GetMRRMetricsResponse {
  export type AsObject = {
    mrr: number;
    arr: number;
    mrrGrowth: number;
    mrrByPlanMap: Array<[string, number]>;
  };
}

export class GetChurnMetricsRequest extends jspb.Message {
  getMonth(): string;
  setMonth(value: string): GetChurnMetricsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetChurnMetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetChurnMetricsRequest): GetChurnMetricsRequest.AsObject;
  static serializeBinaryToWriter(message: GetChurnMetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetChurnMetricsRequest;
  static deserializeBinaryFromReader(message: GetChurnMetricsRequest, reader: jspb.BinaryReader): GetChurnMetricsRequest;
}

export namespace GetChurnMetricsRequest {
  export type AsObject = {
    month: string;
  };
}

export class GetChurnMetricsResponse extends jspb.Message {
  getChurnRate(): number;
  setChurnRate(value: number): GetChurnMetricsResponse;

  getChurnedCount(): number;
  setChurnedCount(value: number): GetChurnMetricsResponse;

  getChurnReasonsMap(): jspb.Map<string, number>;
  clearChurnReasonsMap(): GetChurnMetricsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetChurnMetricsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetChurnMetricsResponse): GetChurnMetricsResponse.AsObject;
  static serializeBinaryToWriter(message: GetChurnMetricsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetChurnMetricsResponse;
  static deserializeBinaryFromReader(message: GetChurnMetricsResponse, reader: jspb.BinaryReader): GetChurnMetricsResponse;
}

export namespace GetChurnMetricsResponse {
  export type AsObject = {
    churnRate: number;
    churnedCount: number;
    churnReasonsMap: Array<[string, number]>;
  };
}

export class GetRevenueMetricsRequest extends jspb.Message {
  getStartDate(): string;
  setStartDate(value: string): GetRevenueMetricsRequest;

  getEndDate(): string;
  setEndDate(value: string): GetRevenueMetricsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRevenueMetricsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetRevenueMetricsRequest): GetRevenueMetricsRequest.AsObject;
  static serializeBinaryToWriter(message: GetRevenueMetricsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRevenueMetricsRequest;
  static deserializeBinaryFromReader(message: GetRevenueMetricsRequest, reader: jspb.BinaryReader): GetRevenueMetricsRequest;
}

export namespace GetRevenueMetricsRequest {
  export type AsObject = {
    startDate: string;
    endDate: string;
  };
}

export class GetRevenueMetricsResponse extends jspb.Message {
  getRevenue(): number;
  setRevenue(value: number): GetRevenueMetricsResponse;

  getRevenueGrowth(): number;
  setRevenueGrowth(value: number): GetRevenueMetricsResponse;

  getRevenueByPlanMap(): jspb.Map<string, number>;
  clearRevenueByPlanMap(): GetRevenueMetricsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetRevenueMetricsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetRevenueMetricsResponse): GetRevenueMetricsResponse.AsObject;
  static serializeBinaryToWriter(message: GetRevenueMetricsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetRevenueMetricsResponse;
  static deserializeBinaryFromReader(message: GetRevenueMetricsResponse, reader: jspb.BinaryReader): GetRevenueMetricsResponse;
}

export namespace GetRevenueMetricsResponse {
  export type AsObject = {
    revenue: number;
    revenueGrowth: number;
    revenueByPlanMap: Array<[string, number]>;
  };
}

export class GetCohortAnalysisRequest extends jspb.Message {
  getCohortMonth(): string;
  setCohortMonth(value: string): GetCohortAnalysisRequest;

  getMonthsToTrack(): number;
  setMonthsToTrack(value: number): GetCohortAnalysisRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCohortAnalysisRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetCohortAnalysisRequest): GetCohortAnalysisRequest.AsObject;
  static serializeBinaryToWriter(message: GetCohortAnalysisRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCohortAnalysisRequest;
  static deserializeBinaryFromReader(message: GetCohortAnalysisRequest, reader: jspb.BinaryReader): GetCohortAnalysisRequest;
}

export namespace GetCohortAnalysisRequest {
  export type AsObject = {
    cohortMonth: string;
    monthsToTrack: number;
  };
}

export class GetCohortAnalysisResponse extends jspb.Message {
  getCohort(): CohortAnalysis | undefined;
  setCohort(value?: CohortAnalysis): GetCohortAnalysisResponse;
  hasCohort(): boolean;
  clearCohort(): GetCohortAnalysisResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCohortAnalysisResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetCohortAnalysisResponse): GetCohortAnalysisResponse.AsObject;
  static serializeBinaryToWriter(message: GetCohortAnalysisResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCohortAnalysisResponse;
  static deserializeBinaryFromReader(message: GetCohortAnalysisResponse, reader: jspb.BinaryReader): GetCohortAnalysisResponse;
}

export namespace GetCohortAnalysisResponse {
  export type AsObject = {
    cohort?: CohortAnalysis.AsObject;
  };
}

export class ForecastRevenueRequest extends jspb.Message {
  getMonthsAhead(): number;
  setMonthsAhead(value: number): ForecastRevenueRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForecastRevenueRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ForecastRevenueRequest): ForecastRevenueRequest.AsObject;
  static serializeBinaryToWriter(message: ForecastRevenueRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForecastRevenueRequest;
  static deserializeBinaryFromReader(message: ForecastRevenueRequest, reader: jspb.BinaryReader): ForecastRevenueRequest;
}

export namespace ForecastRevenueRequest {
  export type AsObject = {
    monthsAhead: number;
  };
}

export class ForecastRevenueResponse extends jspb.Message {
  getForecastsList(): Array<RevenueForecast>;
  setForecastsList(value: Array<RevenueForecast>): ForecastRevenueResponse;
  clearForecastsList(): ForecastRevenueResponse;
  addForecasts(value?: RevenueForecast, index?: number): RevenueForecast;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForecastRevenueResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ForecastRevenueResponse): ForecastRevenueResponse.AsObject;
  static serializeBinaryToWriter(message: ForecastRevenueResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForecastRevenueResponse;
  static deserializeBinaryFromReader(message: ForecastRevenueResponse, reader: jspb.BinaryReader): ForecastRevenueResponse;
}

export namespace ForecastRevenueResponse {
  export type AsObject = {
    forecastsList: Array<RevenueForecast.AsObject>;
  };
}

export class GetUserAnalyticsRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetUserAnalyticsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserAnalyticsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserAnalyticsRequest): GetUserAnalyticsRequest.AsObject;
  static serializeBinaryToWriter(message: GetUserAnalyticsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserAnalyticsRequest;
  static deserializeBinaryFromReader(message: GetUserAnalyticsRequest, reader: jspb.BinaryReader): GetUserAnalyticsRequest;
}

export namespace GetUserAnalyticsRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetUserAnalyticsResponse extends jspb.Message {
  getAnalytics(): UserAnalytics | undefined;
  setAnalytics(value?: UserAnalytics): GetUserAnalyticsResponse;
  hasAnalytics(): boolean;
  clearAnalytics(): GetUserAnalyticsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserAnalyticsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserAnalyticsResponse): GetUserAnalyticsResponse.AsObject;
  static serializeBinaryToWriter(message: GetUserAnalyticsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserAnalyticsResponse;
  static deserializeBinaryFromReader(message: GetUserAnalyticsResponse, reader: jspb.BinaryReader): GetUserAnalyticsResponse;
}

export namespace GetUserAnalyticsResponse {
  export type AsObject = {
    analytics?: UserAnalytics.AsObject;
  };
}

export class AnalyticsMetrics extends jspb.Message {
  getMrr(): number;
  setMrr(value: number): AnalyticsMetrics;

  getArr(): number;
  setArr(value: number): AnalyticsMetrics;

  getMrrGrowth(): number;
  setMrrGrowth(value: number): AnalyticsMetrics;

  getMrrByPlanMap(): jspb.Map<string, number>;
  clearMrrByPlanMap(): AnalyticsMetrics;

  getActiveSubscriptions(): number;
  setActiveSubscriptions(value: number): AnalyticsMetrics;

  getTrialSubscriptions(): number;
  setTrialSubscriptions(value: number): AnalyticsMetrics;

  getPausedSubscriptions(): number;
  setPausedSubscriptions(value: number): AnalyticsMetrics;

  getCancelledSubscriptions(): number;
  setCancelledSubscriptions(value: number): AnalyticsMetrics;

  getChurnRate(): number;
  setChurnRate(value: number): AnalyticsMetrics;

  getChurnedCount(): number;
  setChurnedCount(value: number): AnalyticsMetrics;

  getChurnReasonsMap(): jspb.Map<string, number>;
  clearChurnReasonsMap(): AnalyticsMetrics;

  getRevenue(): number;
  setRevenue(value: number): AnalyticsMetrics;

  getRevenueGrowth(): number;
  setRevenueGrowth(value: number): AnalyticsMetrics;

  getRevenueByPlanMap(): jspb.Map<string, number>;
  clearRevenueByPlanMap(): AnalyticsMetrics;

  getPaymentSuccessRate(): number;
  setPaymentSuccessRate(value: number): AnalyticsMetrics;

  getTotalPayments(): number;
  setTotalPayments(value: number): AnalyticsMetrics;

  getSuccessfulPayments(): number;
  setSuccessfulPayments(value: number): AnalyticsMetrics;

  getFailedPayments(): number;
  setFailedPayments(value: number): AnalyticsMetrics;

  getTotalCustomers(): number;
  setTotalCustomers(value: number): AnalyticsMetrics;

  getNewCustomers(): number;
  setNewCustomers(value: number): AnalyticsMetrics;

  getAverageLifetimeValue(): number;
  setAverageLifetimeValue(value: number): AnalyticsMetrics;

  getPeriodStart(): string;
  setPeriodStart(value: string): AnalyticsMetrics;

  getPeriodEnd(): string;
  setPeriodEnd(value: string): AnalyticsMetrics;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AnalyticsMetrics.AsObject;
  static toObject(includeInstance: boolean, msg: AnalyticsMetrics): AnalyticsMetrics.AsObject;
  static serializeBinaryToWriter(message: AnalyticsMetrics, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AnalyticsMetrics;
  static deserializeBinaryFromReader(message: AnalyticsMetrics, reader: jspb.BinaryReader): AnalyticsMetrics;
}

export namespace AnalyticsMetrics {
  export type AsObject = {
    mrr: number;
    arr: number;
    mrrGrowth: number;
    mrrByPlanMap: Array<[string, number]>;
    activeSubscriptions: number;
    trialSubscriptions: number;
    pausedSubscriptions: number;
    cancelledSubscriptions: number;
    churnRate: number;
    churnedCount: number;
    churnReasonsMap: Array<[string, number]>;
    revenue: number;
    revenueGrowth: number;
    revenueByPlanMap: Array<[string, number]>;
    paymentSuccessRate: number;
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    totalCustomers: number;
    newCustomers: number;
    averageLifetimeValue: number;
    periodStart: string;
    periodEnd: string;
  };
}

export class CohortAnalysis extends jspb.Message {
  getCohortMonth(): string;
  setCohortMonth(value: string): CohortAnalysis;

  getInitialSize(): number;
  setInitialSize(value: number): CohortAnalysis;

  getRetentionMap(): jspb.Map<number, number>;
  clearRetentionMap(): CohortAnalysis;

  getRevenue(): number;
  setRevenue(value: number): CohortAnalysis;

  getAverageRevenue(): number;
  setAverageRevenue(value: number): CohortAnalysis;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CohortAnalysis.AsObject;
  static toObject(includeInstance: boolean, msg: CohortAnalysis): CohortAnalysis.AsObject;
  static serializeBinaryToWriter(message: CohortAnalysis, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CohortAnalysis;
  static deserializeBinaryFromReader(message: CohortAnalysis, reader: jspb.BinaryReader): CohortAnalysis;
}

export namespace CohortAnalysis {
  export type AsObject = {
    cohortMonth: string;
    initialSize: number;
    retentionMap: Array<[number, number]>;
    revenue: number;
    averageRevenue: number;
  };
}

export class RevenueForecast extends jspb.Message {
  getMonth(): string;
  setMonth(value: string): RevenueForecast;

  getProjectedRevenue(): number;
  setProjectedRevenue(value: number): RevenueForecast;

  getLowerBound(): number;
  setLowerBound(value: number): RevenueForecast;

  getUpperBound(): number;
  setUpperBound(value: number): RevenueForecast;

  getConfidence(): number;
  setConfidence(value: number): RevenueForecast;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevenueForecast.AsObject;
  static toObject(includeInstance: boolean, msg: RevenueForecast): RevenueForecast.AsObject;
  static serializeBinaryToWriter(message: RevenueForecast, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevenueForecast;
  static deserializeBinaryFromReader(message: RevenueForecast, reader: jspb.BinaryReader): RevenueForecast;
}

export namespace RevenueForecast {
  export type AsObject = {
    month: string;
    projectedRevenue: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  };
}

export class UserAnalytics extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UserAnalytics;

  getTotalSpent(): number;
  setTotalSpent(value: number): UserAnalytics;

  getLifetimeValue(): number;
  setLifetimeValue(value: number): UserAnalytics;

  getSubscriptionCount(): number;
  setSubscriptionCount(value: number): UserAnalytics;

  getActiveSubscriptions(): number;
  setActiveSubscriptions(value: number): UserAnalytics;

  getPaymentCount(): number;
  setPaymentCount(value: number): UserAnalytics;

  getSuccessfulPayments(): number;
  setSuccessfulPayments(value: number): UserAnalytics;

  getFailedPayments(): number;
  setFailedPayments(value: number): UserAnalytics;

  getPaymentSuccessRate(): number;
  setPaymentSuccessRate(value: number): UserAnalytics;

  getFirstSubscription(): string;
  setFirstSubscription(value: string): UserAnalytics;

  getDaysSinceFirst(): number;
  setDaysSinceFirst(value: number): UserAnalytics;

  getAverageMonthlySpend(): number;
  setAverageMonthlySpend(value: number): UserAnalytics;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserAnalytics.AsObject;
  static toObject(includeInstance: boolean, msg: UserAnalytics): UserAnalytics.AsObject;
  static serializeBinaryToWriter(message: UserAnalytics, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserAnalytics;
  static deserializeBinaryFromReader(message: UserAnalytics, reader: jspb.BinaryReader): UserAnalytics;
}

export namespace UserAnalytics {
  export type AsObject = {
    userId: string;
    totalSpent: number;
    lifetimeValue: number;
    subscriptionCount: number;
    activeSubscriptions: number;
    paymentCount: number;
    successfulPayments: number;
    failedPayments: number;
    paymentSuccessRate: number;
    firstSubscription: string;
    daysSinceFirst: number;
    averageMonthlySpend: number;
  };
}

export class AddPaymentMethodRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): AddPaymentMethodRequest;

  getType(): string;
  setType(value: string): AddPaymentMethodRequest;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): AddPaymentMethodRequest;

  getCardLast4(): string;
  setCardLast4(value: string): AddPaymentMethodRequest;

  getCardBrand(): string;
  setCardBrand(value: string): AddPaymentMethodRequest;

  getCardExpMonth(): number;
  setCardExpMonth(value: number): AddPaymentMethodRequest;

  getCardExpYear(): number;
  setCardExpYear(value: number): AddPaymentMethodRequest;

  getNickname(): string;
  setNickname(value: string): AddPaymentMethodRequest;

  getIsDefault(): boolean;
  setIsDefault(value: boolean): AddPaymentMethodRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddPaymentMethodRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddPaymentMethodRequest): AddPaymentMethodRequest.AsObject;
  static serializeBinaryToWriter(message: AddPaymentMethodRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddPaymentMethodRequest;
  static deserializeBinaryFromReader(message: AddPaymentMethodRequest, reader: jspb.BinaryReader): AddPaymentMethodRequest;
}

export namespace AddPaymentMethodRequest {
  export type AsObject = {
    userId: string;
    type: string;
    phoneNumber: string;
    cardLast4: string;
    cardBrand: string;
    cardExpMonth: number;
    cardExpYear: number;
    nickname: string;
    isDefault: boolean;
  };
}

export class AddPaymentMethodResponse extends jspb.Message {
  getPaymentMethod(): PaymentMethod | undefined;
  setPaymentMethod(value?: PaymentMethod): AddPaymentMethodResponse;
  hasPaymentMethod(): boolean;
  clearPaymentMethod(): AddPaymentMethodResponse;

  getMessage(): string;
  setMessage(value: string): AddPaymentMethodResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddPaymentMethodResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddPaymentMethodResponse): AddPaymentMethodResponse.AsObject;
  static serializeBinaryToWriter(message: AddPaymentMethodResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddPaymentMethodResponse;
  static deserializeBinaryFromReader(message: AddPaymentMethodResponse, reader: jspb.BinaryReader): AddPaymentMethodResponse;
}

export namespace AddPaymentMethodResponse {
  export type AsObject = {
    paymentMethod?: PaymentMethod.AsObject;
    message: string;
  };
}

export class GetPaymentMethodsRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetPaymentMethodsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentMethodsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentMethodsRequest): GetPaymentMethodsRequest.AsObject;
  static serializeBinaryToWriter(message: GetPaymentMethodsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentMethodsRequest;
  static deserializeBinaryFromReader(message: GetPaymentMethodsRequest, reader: jspb.BinaryReader): GetPaymentMethodsRequest;
}

export namespace GetPaymentMethodsRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetPaymentMethodsResponse extends jspb.Message {
  getPaymentMethodsList(): Array<PaymentMethod>;
  setPaymentMethodsList(value: Array<PaymentMethod>): GetPaymentMethodsResponse;
  clearPaymentMethodsList(): GetPaymentMethodsResponse;
  addPaymentMethods(value?: PaymentMethod, index?: number): PaymentMethod;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPaymentMethodsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPaymentMethodsResponse): GetPaymentMethodsResponse.AsObject;
  static serializeBinaryToWriter(message: GetPaymentMethodsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPaymentMethodsResponse;
  static deserializeBinaryFromReader(message: GetPaymentMethodsResponse, reader: jspb.BinaryReader): GetPaymentMethodsResponse;
}

export namespace GetPaymentMethodsResponse {
  export type AsObject = {
    paymentMethodsList: Array<PaymentMethod.AsObject>;
  };
}

export class GetDefaultPaymentMethodRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetDefaultPaymentMethodRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDefaultPaymentMethodRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDefaultPaymentMethodRequest): GetDefaultPaymentMethodRequest.AsObject;
  static serializeBinaryToWriter(message: GetDefaultPaymentMethodRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDefaultPaymentMethodRequest;
  static deserializeBinaryFromReader(message: GetDefaultPaymentMethodRequest, reader: jspb.BinaryReader): GetDefaultPaymentMethodRequest;
}

export namespace GetDefaultPaymentMethodRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetDefaultPaymentMethodResponse extends jspb.Message {
  getPaymentMethod(): PaymentMethod | undefined;
  setPaymentMethod(value?: PaymentMethod): GetDefaultPaymentMethodResponse;
  hasPaymentMethod(): boolean;
  clearPaymentMethod(): GetDefaultPaymentMethodResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDefaultPaymentMethodResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDefaultPaymentMethodResponse): GetDefaultPaymentMethodResponse.AsObject;
  static serializeBinaryToWriter(message: GetDefaultPaymentMethodResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDefaultPaymentMethodResponse;
  static deserializeBinaryFromReader(message: GetDefaultPaymentMethodResponse, reader: jspb.BinaryReader): GetDefaultPaymentMethodResponse;
}

export namespace GetDefaultPaymentMethodResponse {
  export type AsObject = {
    paymentMethod?: PaymentMethod.AsObject;
  };
}

export class SetDefaultPaymentMethodRequest extends jspb.Message {
  getMethodId(): string;
  setMethodId(value: string): SetDefaultPaymentMethodRequest;

  getUserId(): string;
  setUserId(value: string): SetDefaultPaymentMethodRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetDefaultPaymentMethodRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SetDefaultPaymentMethodRequest): SetDefaultPaymentMethodRequest.AsObject;
  static serializeBinaryToWriter(message: SetDefaultPaymentMethodRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetDefaultPaymentMethodRequest;
  static deserializeBinaryFromReader(message: SetDefaultPaymentMethodRequest, reader: jspb.BinaryReader): SetDefaultPaymentMethodRequest;
}

export namespace SetDefaultPaymentMethodRequest {
  export type AsObject = {
    methodId: string;
    userId: string;
  };
}

export class SetDefaultPaymentMethodResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): SetDefaultPaymentMethodResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetDefaultPaymentMethodResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SetDefaultPaymentMethodResponse): SetDefaultPaymentMethodResponse.AsObject;
  static serializeBinaryToWriter(message: SetDefaultPaymentMethodResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetDefaultPaymentMethodResponse;
  static deserializeBinaryFromReader(message: SetDefaultPaymentMethodResponse, reader: jspb.BinaryReader): SetDefaultPaymentMethodResponse;
}

export namespace SetDefaultPaymentMethodResponse {
  export type AsObject = {
    message: string;
  };
}

export class RemovePaymentMethodRequest extends jspb.Message {
  getMethodId(): string;
  setMethodId(value: string): RemovePaymentMethodRequest;

  getUserId(): string;
  setUserId(value: string): RemovePaymentMethodRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePaymentMethodRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePaymentMethodRequest): RemovePaymentMethodRequest.AsObject;
  static serializeBinaryToWriter(message: RemovePaymentMethodRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePaymentMethodRequest;
  static deserializeBinaryFromReader(message: RemovePaymentMethodRequest, reader: jspb.BinaryReader): RemovePaymentMethodRequest;
}

export namespace RemovePaymentMethodRequest {
  export type AsObject = {
    methodId: string;
    userId: string;
  };
}

export class RemovePaymentMethodResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): RemovePaymentMethodResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemovePaymentMethodResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemovePaymentMethodResponse): RemovePaymentMethodResponse.AsObject;
  static serializeBinaryToWriter(message: RemovePaymentMethodResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemovePaymentMethodResponse;
  static deserializeBinaryFromReader(message: RemovePaymentMethodResponse, reader: jspb.BinaryReader): RemovePaymentMethodResponse;
}

export namespace RemovePaymentMethodResponse {
  export type AsObject = {
    message: string;
  };
}

export class UpdatePaymentMethodNicknameRequest extends jspb.Message {
  getMethodId(): string;
  setMethodId(value: string): UpdatePaymentMethodNicknameRequest;

  getUserId(): string;
  setUserId(value: string): UpdatePaymentMethodNicknameRequest;

  getNickname(): string;
  setNickname(value: string): UpdatePaymentMethodNicknameRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePaymentMethodNicknameRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePaymentMethodNicknameRequest): UpdatePaymentMethodNicknameRequest.AsObject;
  static serializeBinaryToWriter(message: UpdatePaymentMethodNicknameRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePaymentMethodNicknameRequest;
  static deserializeBinaryFromReader(message: UpdatePaymentMethodNicknameRequest, reader: jspb.BinaryReader): UpdatePaymentMethodNicknameRequest;
}

export namespace UpdatePaymentMethodNicknameRequest {
  export type AsObject = {
    methodId: string;
    userId: string;
    nickname: string;
  };
}

export class UpdatePaymentMethodNicknameResponse extends jspb.Message {
  getPaymentMethod(): PaymentMethod | undefined;
  setPaymentMethod(value?: PaymentMethod): UpdatePaymentMethodNicknameResponse;
  hasPaymentMethod(): boolean;
  clearPaymentMethod(): UpdatePaymentMethodNicknameResponse;

  getMessage(): string;
  setMessage(value: string): UpdatePaymentMethodNicknameResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePaymentMethodNicknameResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePaymentMethodNicknameResponse): UpdatePaymentMethodNicknameResponse.AsObject;
  static serializeBinaryToWriter(message: UpdatePaymentMethodNicknameResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePaymentMethodNicknameResponse;
  static deserializeBinaryFromReader(message: UpdatePaymentMethodNicknameResponse, reader: jspb.BinaryReader): UpdatePaymentMethodNicknameResponse;
}

export namespace UpdatePaymentMethodNicknameResponse {
  export type AsObject = {
    paymentMethod?: PaymentMethod.AsObject;
    message: string;
  };
}

export class PaymentMethod extends jspb.Message {
  getId(): string;
  setId(value: string): PaymentMethod;

  getType(): string;
  setType(value: string): PaymentMethod;

  getPhoneNumber(): string;
  setPhoneNumber(value: string): PaymentMethod;

  getCardLast4(): string;
  setCardLast4(value: string): PaymentMethod;

  getCardBrand(): string;
  setCardBrand(value: string): PaymentMethod;

  getCardExpMonth(): number;
  setCardExpMonth(value: number): PaymentMethod;

  getCardExpYear(): number;
  setCardExpYear(value: number): PaymentMethod;

  getNickname(): string;
  setNickname(value: string): PaymentMethod;

  getIsDefault(): boolean;
  setIsDefault(value: boolean): PaymentMethod;

  getIsExpired(): boolean;
  setIsExpired(value: boolean): PaymentMethod;

  getCreatedAt(): string;
  setCreatedAt(value: string): PaymentMethod;

  getLastUsedAt(): string;
  setLastUsedAt(value: string): PaymentMethod;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentMethod.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentMethod): PaymentMethod.AsObject;
  static serializeBinaryToWriter(message: PaymentMethod, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentMethod;
  static deserializeBinaryFromReader(message: PaymentMethod, reader: jspb.BinaryReader): PaymentMethod;
}

export namespace PaymentMethod {
  export type AsObject = {
    id: string;
    type: string;
    phoneNumber: string;
    cardLast4: string;
    cardBrand: string;
    cardExpMonth: number;
    cardExpYear: number;
    nickname: string;
    isDefault: boolean;
    isExpired: boolean;
    createdAt: string;
    lastUsedAt: string;
  };
}

export class PurgeUserDataRequest extends jspb.Message {
  getUserIdsList(): Array<string>;
  setUserIdsList(value: Array<string>): PurgeUserDataRequest;
  clearUserIdsList(): PurgeUserDataRequest;
  addUserIds(value: string, index?: number): PurgeUserDataRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PurgeUserDataRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PurgeUserDataRequest): PurgeUserDataRequest.AsObject;
  static serializeBinaryToWriter(message: PurgeUserDataRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PurgeUserDataRequest;
  static deserializeBinaryFromReader(message: PurgeUserDataRequest, reader: jspb.BinaryReader): PurgeUserDataRequest;
}

export namespace PurgeUserDataRequest {
  export type AsObject = {
    userIdsList: Array<string>;
  };
}

export class PurgeUserDataResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): PurgeUserDataResponse;

  getUsersPurged(): number;
  setUsersPurged(value: number): PurgeUserDataResponse;

  getErrorsList(): Array<string>;
  setErrorsList(value: Array<string>): PurgeUserDataResponse;
  clearErrorsList(): PurgeUserDataResponse;
  addErrors(value: string, index?: number): PurgeUserDataResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PurgeUserDataResponse.AsObject;
  static toObject(includeInstance: boolean, msg: PurgeUserDataResponse): PurgeUserDataResponse.AsObject;
  static serializeBinaryToWriter(message: PurgeUserDataResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PurgeUserDataResponse;
  static deserializeBinaryFromReader(message: PurgeUserDataResponse, reader: jspb.BinaryReader): PurgeUserDataResponse;
}

export namespace PurgeUserDataResponse {
  export type AsObject = {
    message: string;
    usersPurged: number;
    errorsList: Array<string>;
  };
}

export class AddToSubscriptionWhitelistRequest extends jspb.Message {
  getUserIdsList(): Array<string>;
  setUserIdsList(value: Array<string>): AddToSubscriptionWhitelistRequest;
  clearUserIdsList(): AddToSubscriptionWhitelistRequest;
  addUserIds(value: string, index?: number): AddToSubscriptionWhitelistRequest;

  getReason(): string;
  setReason(value: string): AddToSubscriptionWhitelistRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddToSubscriptionWhitelistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddToSubscriptionWhitelistRequest): AddToSubscriptionWhitelistRequest.AsObject;
  static serializeBinaryToWriter(message: AddToSubscriptionWhitelistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddToSubscriptionWhitelistRequest;
  static deserializeBinaryFromReader(message: AddToSubscriptionWhitelistRequest, reader: jspb.BinaryReader): AddToSubscriptionWhitelistRequest;
}

export namespace AddToSubscriptionWhitelistRequest {
  export type AsObject = {
    userIdsList: Array<string>;
    reason: string;
  };
}

export class AddToSubscriptionWhitelistResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): AddToSubscriptionWhitelistResponse;

  getUsersAdded(): number;
  setUsersAdded(value: number): AddToSubscriptionWhitelistResponse;

  getAlreadyWhitelistedList(): Array<string>;
  setAlreadyWhitelistedList(value: Array<string>): AddToSubscriptionWhitelistResponse;
  clearAlreadyWhitelistedList(): AddToSubscriptionWhitelistResponse;
  addAlreadyWhitelisted(value: string, index?: number): AddToSubscriptionWhitelistResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddToSubscriptionWhitelistResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddToSubscriptionWhitelistResponse): AddToSubscriptionWhitelistResponse.AsObject;
  static serializeBinaryToWriter(message: AddToSubscriptionWhitelistResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddToSubscriptionWhitelistResponse;
  static deserializeBinaryFromReader(message: AddToSubscriptionWhitelistResponse, reader: jspb.BinaryReader): AddToSubscriptionWhitelistResponse;
}

export namespace AddToSubscriptionWhitelistResponse {
  export type AsObject = {
    message: string;
    usersAdded: number;
    alreadyWhitelistedList: Array<string>;
  };
}

export class RemoveFromSubscriptionWhitelistRequest extends jspb.Message {
  getUserIdsList(): Array<string>;
  setUserIdsList(value: Array<string>): RemoveFromSubscriptionWhitelistRequest;
  clearUserIdsList(): RemoveFromSubscriptionWhitelistRequest;
  addUserIds(value: string, index?: number): RemoveFromSubscriptionWhitelistRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveFromSubscriptionWhitelistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveFromSubscriptionWhitelistRequest): RemoveFromSubscriptionWhitelistRequest.AsObject;
  static serializeBinaryToWriter(message: RemoveFromSubscriptionWhitelistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveFromSubscriptionWhitelistRequest;
  static deserializeBinaryFromReader(message: RemoveFromSubscriptionWhitelistRequest, reader: jspb.BinaryReader): RemoveFromSubscriptionWhitelistRequest;
}

export namespace RemoveFromSubscriptionWhitelistRequest {
  export type AsObject = {
    userIdsList: Array<string>;
  };
}

export class RemoveFromSubscriptionWhitelistResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): RemoveFromSubscriptionWhitelistResponse;

  getUsersRemoved(): number;
  setUsersRemoved(value: number): RemoveFromSubscriptionWhitelistResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveFromSubscriptionWhitelistResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveFromSubscriptionWhitelistResponse): RemoveFromSubscriptionWhitelistResponse.AsObject;
  static serializeBinaryToWriter(message: RemoveFromSubscriptionWhitelistResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveFromSubscriptionWhitelistResponse;
  static deserializeBinaryFromReader(message: RemoveFromSubscriptionWhitelistResponse, reader: jspb.BinaryReader): RemoveFromSubscriptionWhitelistResponse;
}

export namespace RemoveFromSubscriptionWhitelistResponse {
  export type AsObject = {
    message: string;
    usersRemoved: number;
  };
}

export class ListSubscriptionWhitelistRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSubscriptionWhitelistRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListSubscriptionWhitelistRequest): ListSubscriptionWhitelistRequest.AsObject;
  static serializeBinaryToWriter(message: ListSubscriptionWhitelistRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSubscriptionWhitelistRequest;
  static deserializeBinaryFromReader(message: ListSubscriptionWhitelistRequest, reader: jspb.BinaryReader): ListSubscriptionWhitelistRequest;
}

export namespace ListSubscriptionWhitelistRequest {
  export type AsObject = {
  };
}

export class ListSubscriptionWhitelistResponse extends jspb.Message {
  getUsersList(): Array<WhitelistedUser>;
  setUsersList(value: Array<WhitelistedUser>): ListSubscriptionWhitelistResponse;
  clearUsersList(): ListSubscriptionWhitelistResponse;
  addUsers(value?: WhitelistedUser, index?: number): WhitelistedUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListSubscriptionWhitelistResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListSubscriptionWhitelistResponse): ListSubscriptionWhitelistResponse.AsObject;
  static serializeBinaryToWriter(message: ListSubscriptionWhitelistResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListSubscriptionWhitelistResponse;
  static deserializeBinaryFromReader(message: ListSubscriptionWhitelistResponse, reader: jspb.BinaryReader): ListSubscriptionWhitelistResponse;
}

export namespace ListSubscriptionWhitelistResponse {
  export type AsObject = {
    usersList: Array<WhitelistedUser.AsObject>;
  };
}

export class WhitelistedUser extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): WhitelistedUser;

  getReason(): string;
  setReason(value: string): WhitelistedUser;

  getWhitelistedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setWhitelistedAt(value?: google_protobuf_timestamp_pb.Timestamp): WhitelistedUser;
  hasWhitelistedAt(): boolean;
  clearWhitelistedAt(): WhitelistedUser;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WhitelistedUser.AsObject;
  static toObject(includeInstance: boolean, msg: WhitelistedUser): WhitelistedUser.AsObject;
  static serializeBinaryToWriter(message: WhitelistedUser, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WhitelistedUser;
  static deserializeBinaryFromReader(message: WhitelistedUser, reader: jspb.BinaryReader): WhitelistedUser;
}

export namespace WhitelistedUser {
  export type AsObject = {
    userId: string;
    reason: string;
    whitelistedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class IsUserWhitelistedRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): IsUserWhitelistedRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IsUserWhitelistedRequest.AsObject;
  static toObject(includeInstance: boolean, msg: IsUserWhitelistedRequest): IsUserWhitelistedRequest.AsObject;
  static serializeBinaryToWriter(message: IsUserWhitelistedRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IsUserWhitelistedRequest;
  static deserializeBinaryFromReader(message: IsUserWhitelistedRequest, reader: jspb.BinaryReader): IsUserWhitelistedRequest;
}

export namespace IsUserWhitelistedRequest {
  export type AsObject = {
    userId: string;
  };
}

export class IsUserWhitelistedResponse extends jspb.Message {
  getIsWhitelisted(): boolean;
  setIsWhitelisted(value: boolean): IsUserWhitelistedResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IsUserWhitelistedResponse.AsObject;
  static toObject(includeInstance: boolean, msg: IsUserWhitelistedResponse): IsUserWhitelistedResponse.AsObject;
  static serializeBinaryToWriter(message: IsUserWhitelistedResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IsUserWhitelistedResponse;
  static deserializeBinaryFromReader(message: IsUserWhitelistedResponse, reader: jspb.BinaryReader): IsUserWhitelistedResponse;
}

export namespace IsUserWhitelistedResponse {
  export type AsObject = {
    isWhitelisted: boolean;
  };
}

export class AdminListPaymentsRequest extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): AdminListPaymentsRequest;

  getUserId(): string;
  setUserId(value: string): AdminListPaymentsRequest;

  getOffset(): number;
  setOffset(value: number): AdminListPaymentsRequest;

  getLimit(): number;
  setLimit(value: number): AdminListPaymentsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdminListPaymentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AdminListPaymentsRequest): AdminListPaymentsRequest.AsObject;
  static serializeBinaryToWriter(message: AdminListPaymentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdminListPaymentsRequest;
  static deserializeBinaryFromReader(message: AdminListPaymentsRequest, reader: jspb.BinaryReader): AdminListPaymentsRequest;
}

export namespace AdminListPaymentsRequest {
  export type AsObject = {
    status: string;
    userId: string;
    offset: number;
    limit: number;
  };
}

export class AdminListPaymentsResponse extends jspb.Message {
  getPaymentsList(): Array<Payment>;
  setPaymentsList(value: Array<Payment>): AdminListPaymentsResponse;
  clearPaymentsList(): AdminListPaymentsResponse;
  addPayments(value?: Payment, index?: number): Payment;

  getTotal(): number;
  setTotal(value: number): AdminListPaymentsResponse;

  getOffset(): number;
  setOffset(value: number): AdminListPaymentsResponse;

  getLimit(): number;
  setLimit(value: number): AdminListPaymentsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdminListPaymentsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AdminListPaymentsResponse): AdminListPaymentsResponse.AsObject;
  static serializeBinaryToWriter(message: AdminListPaymentsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdminListPaymentsResponse;
  static deserializeBinaryFromReader(message: AdminListPaymentsResponse, reader: jspb.BinaryReader): AdminListPaymentsResponse;
}

export namespace AdminListPaymentsResponse {
  export type AsObject = {
    paymentsList: Array<Payment.AsObject>;
    total: number;
    offset: number;
    limit: number;
  };
}

export class AdminListSubscriptionsRequest extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): AdminListSubscriptionsRequest;

  getProfileType(): string;
  setProfileType(value: string): AdminListSubscriptionsRequest;

  getOffset(): number;
  setOffset(value: number): AdminListSubscriptionsRequest;

  getLimit(): number;
  setLimit(value: number): AdminListSubscriptionsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdminListSubscriptionsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AdminListSubscriptionsRequest): AdminListSubscriptionsRequest.AsObject;
  static serializeBinaryToWriter(message: AdminListSubscriptionsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdminListSubscriptionsRequest;
  static deserializeBinaryFromReader(message: AdminListSubscriptionsRequest, reader: jspb.BinaryReader): AdminListSubscriptionsRequest;
}

export namespace AdminListSubscriptionsRequest {
  export type AsObject = {
    status: string;
    profileType: string;
    offset: number;
    limit: number;
  };
}

export class AdminListSubscriptionsResponse extends jspb.Message {
  getSubscriptionsList(): Array<Subscription>;
  setSubscriptionsList(value: Array<Subscription>): AdminListSubscriptionsResponse;
  clearSubscriptionsList(): AdminListSubscriptionsResponse;
  addSubscriptions(value?: Subscription, index?: number): Subscription;

  getTotal(): number;
  setTotal(value: number): AdminListSubscriptionsResponse;

  getOffset(): number;
  setOffset(value: number): AdminListSubscriptionsResponse;

  getLimit(): number;
  setLimit(value: number): AdminListSubscriptionsResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdminListSubscriptionsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AdminListSubscriptionsResponse): AdminListSubscriptionsResponse.AsObject;
  static serializeBinaryToWriter(message: AdminListSubscriptionsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdminListSubscriptionsResponse;
  static deserializeBinaryFromReader(message: AdminListSubscriptionsResponse, reader: jspb.BinaryReader): AdminListSubscriptionsResponse;
}

export namespace AdminListSubscriptionsResponse {
  export type AsObject = {
    subscriptionsList: Array<Subscription.AsObject>;
    total: number;
    offset: number;
    limit: number;
  };
}

export class AdminUpdatePlanRequest extends jspb.Message {
  getPlanId(): string;
  setPlanId(value: string): AdminUpdatePlanRequest;

  getName(): string;
  setName(value: string): AdminUpdatePlanRequest;

  getDescription(): string;
  setDescription(value: string): AdminUpdatePlanRequest;

  getPriceAmount(): number;
  setPriceAmount(value: number): AdminUpdatePlanRequest;

  getBillingCycle(): string;
  setBillingCycle(value: string): AdminUpdatePlanRequest;

  getTrialDays(): number;
  setTrialDays(value: number): AdminUpdatePlanRequest;

  getIsActive(): boolean;
  setIsActive(value: boolean): AdminUpdatePlanRequest;

  getMaxProfiles(): number;
  setMaxProfiles(value: number): AdminUpdatePlanRequest;

  getMaxApplications(): number;
  setMaxApplications(value: number): AdminUpdatePlanRequest;

  getMaxHires(): number;
  setMaxHires(value: number): AdminUpdatePlanRequest;

  getDisplayOrder(): number;
  setDisplayOrder(value: number): AdminUpdatePlanRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdminUpdatePlanRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AdminUpdatePlanRequest): AdminUpdatePlanRequest.AsObject;
  static serializeBinaryToWriter(message: AdminUpdatePlanRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdminUpdatePlanRequest;
  static deserializeBinaryFromReader(message: AdminUpdatePlanRequest, reader: jspb.BinaryReader): AdminUpdatePlanRequest;
}

export namespace AdminUpdatePlanRequest {
  export type AsObject = {
    planId: string;
    name: string;
    description: string;
    priceAmount: number;
    billingCycle: string;
    trialDays: number;
    isActive: boolean;
    maxProfiles: number;
    maxApplications: number;
    maxHires: number;
    displayOrder: number;
  };
}

export class AdminUpdatePlanResponse extends jspb.Message {
  getPlan(): SubscriptionPlan | undefined;
  setPlan(value?: SubscriptionPlan): AdminUpdatePlanResponse;
  hasPlan(): boolean;
  clearPlan(): AdminUpdatePlanResponse;

  getMessage(): string;
  setMessage(value: string): AdminUpdatePlanResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AdminUpdatePlanResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AdminUpdatePlanResponse): AdminUpdatePlanResponse.AsObject;
  static serializeBinaryToWriter(message: AdminUpdatePlanResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AdminUpdatePlanResponse;
  static deserializeBinaryFromReader(message: AdminUpdatePlanResponse, reader: jspb.BinaryReader): AdminUpdatePlanResponse;
}

export namespace AdminUpdatePlanResponse {
  export type AsObject = {
    plan?: SubscriptionPlan.AsObject;
    message: string;
  };
}

