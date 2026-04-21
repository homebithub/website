import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"


export class EventEnvelope extends jspb.Message {
  getEventId(): string;
  setEventId(value: string): EventEnvelope;

  getEventType(): string;
  setEventType(value: string): EventEnvelope;

  getVersion(): number;
  setVersion(value: number): EventEnvelope;

  getSource(): string;
  setSource(value: string): EventEnvelope;

  getUserId(): string;
  setUserId(value: string): EventEnvelope;

  getTimestamp(): string;
  setTimestamp(value: string): EventEnvelope;

  getData(): Uint8Array | string;
  getData_asU8(): Uint8Array;
  getData_asB64(): string;
  setData(value: Uint8Array | string): EventEnvelope;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EventEnvelope.AsObject;
  static toObject(includeInstance: boolean, msg: EventEnvelope): EventEnvelope.AsObject;
  static serializeBinaryToWriter(message: EventEnvelope, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EventEnvelope;
  static deserializeBinaryFromReader(message: EventEnvelope, reader: jspb.BinaryReader): EventEnvelope;
}

export namespace EventEnvelope {
  export type AsObject = {
    eventId: string;
    eventType: string;
    version: number;
    source: string;
    userId: string;
    timestamp: string;
    data: Uint8Array | string;
  };
}

export class OTPSent extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): OTPSent;

  getTarget(): string;
  setTarget(value: string): OTPSent;

  getOtpCode(): string;
  setOtpCode(value: string): OTPSent;

  getVerificationType(): string;
  setVerificationType(value: string): OTPSent;

  getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): OTPSent;
  hasExpiresAt(): boolean;
  clearExpiresAt(): OTPSent;

  getVariablesMap(): jspb.Map<string, string>;
  clearVariablesMap(): OTPSent;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): OTPSent;
  hasCreatedAt(): boolean;
  clearCreatedAt(): OTPSent;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OTPSent.AsObject;
  static toObject(includeInstance: boolean, msg: OTPSent): OTPSent.AsObject;
  static serializeBinaryToWriter(message: OTPSent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OTPSent;
  static deserializeBinaryFromReader(message: OTPSent, reader: jspb.BinaryReader): OTPSent;
}

export namespace OTPSent {
  export type AsObject = {
    userId: string;
    target: string;
    otpCode: string;
    verificationType: string;
    expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    variablesMap: Array<[string, string]>;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class UserSignedUp extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UserSignedUp;

  getProfileType(): string;
  setProfileType(value: string): UserSignedUp;

  getEmail(): string;
  setEmail(value: string): UserSignedUp;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UserSignedUp;
  hasCreatedAt(): boolean;
  clearCreatedAt(): UserSignedUp;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UserSignedUp.AsObject;
  static toObject(includeInstance: boolean, msg: UserSignedUp): UserSignedUp.AsObject;
  static serializeBinaryToWriter(message: UserSignedUp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UserSignedUp;
  static deserializeBinaryFromReader(message: UserSignedUp, reader: jspb.BinaryReader): UserSignedUp;
}

export namespace UserSignedUp {
  export type AsObject = {
    userId: string;
    profileType: string;
    email: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class NotificationCreated extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): NotificationCreated;

  getTitle(): string;
  setTitle(value: string): NotificationCreated;

  getMessage(): string;
  setMessage(value: string): NotificationCreated;

  getType(): string;
  setType(value: string): NotificationCreated;

  getMetadataMap(): jspb.Map<string, string>;
  clearMetadataMap(): NotificationCreated;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): NotificationCreated;
  hasCreatedAt(): boolean;
  clearCreatedAt(): NotificationCreated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NotificationCreated.AsObject;
  static toObject(includeInstance: boolean, msg: NotificationCreated): NotificationCreated.AsObject;
  static serializeBinaryToWriter(message: NotificationCreated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NotificationCreated;
  static deserializeBinaryFromReader(message: NotificationCreated, reader: jspb.BinaryReader): NotificationCreated;
}

export namespace NotificationCreated {
  export type AsObject = {
    userId: string;
    title: string;
    message: string;
    type: string;
    metadataMap: Array<[string, string]>;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class BlastMessage extends jspb.Message {
  getTitle(): string;
  setTitle(value: string): BlastMessage;

  getMessage(): string;
  setMessage(value: string): BlastMessage;

  getFilterType(): string;
  setFilterType(value: string): BlastMessage;

  getFilterParamsMap(): jspb.Map<string, string>;
  clearFilterParamsMap(): BlastMessage;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): BlastMessage;
  hasCreatedAt(): boolean;
  clearCreatedAt(): BlastMessage;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BlastMessage.AsObject;
  static toObject(includeInstance: boolean, msg: BlastMessage): BlastMessage.AsObject;
  static serializeBinaryToWriter(message: BlastMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BlastMessage;
  static deserializeBinaryFromReader(message: BlastMessage, reader: jspb.BinaryReader): BlastMessage;
}

export namespace BlastMessage {
  export type AsObject = {
    title: string;
    message: string;
    filterType: string;
    filterParamsMap: Array<[string, string]>;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class PaymentCreated extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): PaymentCreated;

  getOrderId(): string;
  setOrderId(value: string): PaymentCreated;

  getAmount(): number;
  setAmount(value: number): PaymentCreated;

  getCurrency(): string;
  setCurrency(value: string): PaymentCreated;

  getUserId(): string;
  setUserId(value: string): PaymentCreated;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentCreated;
  hasCreatedAt(): boolean;
  clearCreatedAt(): PaymentCreated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentCreated.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentCreated): PaymentCreated.AsObject;
  static serializeBinaryToWriter(message: PaymentCreated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentCreated;
  static deserializeBinaryFromReader(message: PaymentCreated, reader: jspb.BinaryReader): PaymentCreated;
}

export namespace PaymentCreated {
  export type AsObject = {
    paymentId: string;
    orderId: string;
    amount: number;
    currency: string;
    userId: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class PaymentSucceeded extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): PaymentSucceeded;

  getTransactionId(): string;
  setTransactionId(value: string): PaymentSucceeded;

  getSucceededAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setSucceededAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentSucceeded;
  hasSucceededAt(): boolean;
  clearSucceededAt(): PaymentSucceeded;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentSucceeded.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentSucceeded): PaymentSucceeded.AsObject;
  static serializeBinaryToWriter(message: PaymentSucceeded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentSucceeded;
  static deserializeBinaryFromReader(message: PaymentSucceeded, reader: jspb.BinaryReader): PaymentSucceeded;
}

export namespace PaymentSucceeded {
  export type AsObject = {
    paymentId: string;
    transactionId: string;
    succeededAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class PaymentFailed extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): PaymentFailed;

  getReason(): string;
  setReason(value: string): PaymentFailed;

  getFailedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setFailedAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentFailed;
  hasFailedAt(): boolean;
  clearFailedAt(): PaymentFailed;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentFailed.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentFailed): PaymentFailed.AsObject;
  static serializeBinaryToWriter(message: PaymentFailed, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentFailed;
  static deserializeBinaryFromReader(message: PaymentFailed, reader: jspb.BinaryReader): PaymentFailed;
}

export namespace PaymentFailed {
  export type AsObject = {
    paymentId: string;
    reason: string;
    failedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionCreated extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionCreated;

  getUserId(): string;
  setUserId(value: string): SubscriptionCreated;

  getPlanId(): string;
  setPlanId(value: string): SubscriptionCreated;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionCreated;
  hasCreatedAt(): boolean;
  clearCreatedAt(): SubscriptionCreated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionCreated.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionCreated): SubscriptionCreated.AsObject;
  static serializeBinaryToWriter(message: SubscriptionCreated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionCreated;
  static deserializeBinaryFromReader(message: SubscriptionCreated, reader: jspb.BinaryReader): SubscriptionCreated;
}

export namespace SubscriptionCreated {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planId: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionCancelled extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionCancelled;

  getUserId(): string;
  setUserId(value: string): SubscriptionCancelled;

  getCancelledAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCancelledAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionCancelled;
  hasCancelledAt(): boolean;
  clearCancelledAt(): SubscriptionCancelled;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionCancelled.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionCancelled): SubscriptionCancelled.AsObject;
  static serializeBinaryToWriter(message: SubscriptionCancelled, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionCancelled;
  static deserializeBinaryFromReader(message: SubscriptionCancelled, reader: jspb.BinaryReader): SubscriptionCancelled;
}

export namespace SubscriptionCancelled {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    cancelledAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class OnboardingProgressUpdated extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): OnboardingProgressUpdated;

  getStepName(): string;
  setStepName(value: string): OnboardingProgressUpdated;

  getStatus(): string;
  setStatus(value: string): OnboardingProgressUpdated;

  getMessage(): string;
  setMessage(value: string): OnboardingProgressUpdated;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): OnboardingProgressUpdated;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): OnboardingProgressUpdated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): OnboardingProgressUpdated.AsObject;
  static toObject(includeInstance: boolean, msg: OnboardingProgressUpdated): OnboardingProgressUpdated.AsObject;
  static serializeBinaryToWriter(message: OnboardingProgressUpdated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): OnboardingProgressUpdated;
  static deserializeBinaryFromReader(message: OnboardingProgressUpdated, reader: jspb.BinaryReader): OnboardingProgressUpdated;
}

export namespace OnboardingProgressUpdated {
  export type AsObject = {
    userId: string;
    stepName: string;
    status: string;
    message: string;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class HouseholdUpdated extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): HouseholdUpdated;

  getUserId(): string;
  setUserId(value: string): HouseholdUpdated;

  getAction(): string;
  setAction(value: string): HouseholdUpdated;

  getMessage(): string;
  setMessage(value: string): HouseholdUpdated;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): HouseholdUpdated;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): HouseholdUpdated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HouseholdUpdated.AsObject;
  static toObject(includeInstance: boolean, msg: HouseholdUpdated): HouseholdUpdated.AsObject;
  static serializeBinaryToWriter(message: HouseholdUpdated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HouseholdUpdated;
  static deserializeBinaryFromReader(message: HouseholdUpdated, reader: jspb.BinaryReader): HouseholdUpdated;
}

export namespace HouseholdUpdated {
  export type AsObject = {
    householdId: string;
    userId: string;
    action: string;
    message: string;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SystemMaintenanceAlert extends jspb.Message {
  getAlertId(): string;
  setAlertId(value: string): SystemMaintenanceAlert;

  getMessage(): string;
  setMessage(value: string): SystemMaintenanceAlert;

  getScheduledAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setScheduledAt(value?: google_protobuf_timestamp_pb.Timestamp): SystemMaintenanceAlert;
  hasScheduledAt(): boolean;
  clearScheduledAt(): SystemMaintenanceAlert;

  getDurationMinutes(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setDurationMinutes(value?: google_protobuf_timestamp_pb.Timestamp): SystemMaintenanceAlert;
  hasDurationMinutes(): boolean;
  clearDurationMinutes(): SystemMaintenanceAlert;

  getSeverity(): string;
  setSeverity(value: string): SystemMaintenanceAlert;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SystemMaintenanceAlert.AsObject;
  static toObject(includeInstance: boolean, msg: SystemMaintenanceAlert): SystemMaintenanceAlert.AsObject;
  static serializeBinaryToWriter(message: SystemMaintenanceAlert, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SystemMaintenanceAlert;
  static deserializeBinaryFromReader(message: SystemMaintenanceAlert, reader: jspb.BinaryReader): SystemMaintenanceAlert;
}

export namespace SystemMaintenanceAlert {
  export type AsObject = {
    alertId: string;
    message: string;
    scheduledAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    durationMinutes?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    severity: string;
  };
}

export class MatchFound extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): MatchFound;

  getMatchCount(): number;
  setMatchCount(value: number): MatchFound;

  getMatchesUrl(): string;
  setMatchesUrl(value: string): MatchFound;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): MatchFound;
  hasTimestamp(): boolean;
  clearTimestamp(): MatchFound;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MatchFound.AsObject;
  static toObject(includeInstance: boolean, msg: MatchFound): MatchFound.AsObject;
  static serializeBinaryToWriter(message: MatchFound, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MatchFound;
  static deserializeBinaryFromReader(message: MatchFound, reader: jspb.BinaryReader): MatchFound;
}

export namespace MatchFound {
  export type AsObject = {
    householdId: string;
    matchCount: number;
    matchesUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ProfileUnlocked extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): ProfileUnlocked;

  getProfileName(): string;
  setProfileName(value: string): ProfileUnlocked;

  getPhone(): string;
  setPhone(value: string): ProfileUnlocked;

  getProfileUrl(): string;
  setProfileUrl(value: string): ProfileUnlocked;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): ProfileUnlocked;
  hasTimestamp(): boolean;
  clearTimestamp(): ProfileUnlocked;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProfileUnlocked.AsObject;
  static toObject(includeInstance: boolean, msg: ProfileUnlocked): ProfileUnlocked.AsObject;
  static serializeBinaryToWriter(message: ProfileUnlocked, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProfileUnlocked;
  static deserializeBinaryFromReader(message: ProfileUnlocked, reader: jspb.BinaryReader): ProfileUnlocked;
}

export namespace ProfileUnlocked {
  export type AsObject = {
    householdId: string;
    profileName: string;
    phone: string;
    profileUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ShortlistAdded extends jspb.Message {
  getHousehelpId(): string;
  setHousehelpId(value: string): ShortlistAdded;

  getHouseholdName(): string;
  setHouseholdName(value: string): ShortlistAdded;

  getHouseholdProfileUrl(): string;
  setHouseholdProfileUrl(value: string): ShortlistAdded;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): ShortlistAdded;
  hasTimestamp(): boolean;
  clearTimestamp(): ShortlistAdded;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShortlistAdded.AsObject;
  static toObject(includeInstance: boolean, msg: ShortlistAdded): ShortlistAdded.AsObject;
  static serializeBinaryToWriter(message: ShortlistAdded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShortlistAdded;
  static deserializeBinaryFromReader(message: ShortlistAdded, reader: jspb.BinaryReader): ShortlistAdded;
}

export namespace ShortlistAdded {
  export type AsObject = {
    househelpId: string;
    householdName: string;
    householdProfileUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ShortlistRemoved extends jspb.Message {
  getHousehelpId(): string;
  setHousehelpId(value: string): ShortlistRemoved;

  getHouseholdName(): string;
  setHouseholdName(value: string): ShortlistRemoved;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): ShortlistRemoved;
  hasTimestamp(): boolean;
  clearTimestamp(): ShortlistRemoved;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShortlistRemoved.AsObject;
  static toObject(includeInstance: boolean, msg: ShortlistRemoved): ShortlistRemoved.AsObject;
  static serializeBinaryToWriter(message: ShortlistRemoved, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShortlistRemoved;
  static deserializeBinaryFromReader(message: ShortlistRemoved, reader: jspb.BinaryReader): ShortlistRemoved;
}

export namespace ShortlistRemoved {
  export type AsObject = {
    househelpId: string;
    householdName: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class InterestReceived extends jspb.Message {
  getRecipientId(): string;
  setRecipientId(value: string): InterestReceived;

  getInterestedPartyName(): string;
  setInterestedPartyName(value: string): InterestReceived;

  getInterestedPartyType(): string;
  setInterestedPartyType(value: string): InterestReceived;

  getDetailsUrl(): string;
  setDetailsUrl(value: string): InterestReceived;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): InterestReceived;
  hasTimestamp(): boolean;
  clearTimestamp(): InterestReceived;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InterestReceived.AsObject;
  static toObject(includeInstance: boolean, msg: InterestReceived): InterestReceived.AsObject;
  static serializeBinaryToWriter(message: InterestReceived, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InterestReceived;
  static deserializeBinaryFromReader(message: InterestReceived, reader: jspb.BinaryReader): InterestReceived;
}

export namespace InterestReceived {
  export type AsObject = {
    recipientId: string;
    interestedPartyName: string;
    interestedPartyType: string;
    detailsUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class InterestResponse extends jspb.Message {
  getRecipientId(): string;
  setRecipientId(value: string): InterestResponse;

  getHouseholdName(): string;
  setHouseholdName(value: string): InterestResponse;

  getDetailsUrl(): string;
  setDetailsUrl(value: string): InterestResponse;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): InterestResponse;
  hasTimestamp(): boolean;
  clearTimestamp(): InterestResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InterestResponse.AsObject;
  static toObject(includeInstance: boolean, msg: InterestResponse): InterestResponse.AsObject;
  static serializeBinaryToWriter(message: InterestResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InterestResponse;
  static deserializeBinaryFromReader(message: InterestResponse, reader: jspb.BinaryReader): InterestResponse;
}

export namespace InterestResponse {
  export type AsObject = {
    recipientId: string;
    householdName: string;
    detailsUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class NewProfilesAvailable extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): NewProfilesAvailable;

  getNewCount(): number;
  setNewCount(value: number): NewProfilesAvailable;

  getBrowseUrl(): string;
  setBrowseUrl(value: string): NewProfilesAvailable;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): NewProfilesAvailable;
  hasTimestamp(): boolean;
  clearTimestamp(): NewProfilesAvailable;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NewProfilesAvailable.AsObject;
  static toObject(includeInstance: boolean, msg: NewProfilesAvailable): NewProfilesAvailable.AsObject;
  static serializeBinaryToWriter(message: NewProfilesAvailable, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NewProfilesAvailable;
  static deserializeBinaryFromReader(message: NewProfilesAvailable, reader: jspb.BinaryReader): NewProfilesAvailable;
}

export namespace NewProfilesAvailable {
  export type AsObject = {
    householdId: string;
    newCount: number;
    browseUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SavedSearchAlert extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SavedSearchAlert;

  getSearchName(): string;
  setSearchName(value: string): SavedSearchAlert;

  getResultsCount(): number;
  setResultsCount(value: number): SavedSearchAlert;

  getResultsUrl(): string;
  setResultsUrl(value: string): SavedSearchAlert;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): SavedSearchAlert;
  hasTimestamp(): boolean;
  clearTimestamp(): SavedSearchAlert;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SavedSearchAlert.AsObject;
  static toObject(includeInstance: boolean, msg: SavedSearchAlert): SavedSearchAlert.AsObject;
  static serializeBinaryToWriter(message: SavedSearchAlert, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SavedSearchAlert;
  static deserializeBinaryFromReader(message: SavedSearchAlert, reader: jspb.BinaryReader): SavedSearchAlert;
}

export namespace SavedSearchAlert {
  export type AsObject = {
    userId: string;
    searchName: string;
    resultsCount: number;
    resultsUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ProfileFeatured extends jspb.Message {
  getHousehelpId(): string;
  setHousehelpId(value: string): ProfileFeatured;

  getFeatureDuration(): string;
  setFeatureDuration(value: string): ProfileFeatured;

  getProfileUrl(): string;
  setProfileUrl(value: string): ProfileFeatured;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): ProfileFeatured;
  hasTimestamp(): boolean;
  clearTimestamp(): ProfileFeatured;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProfileFeatured.AsObject;
  static toObject(includeInstance: boolean, msg: ProfileFeatured): ProfileFeatured.AsObject;
  static serializeBinaryToWriter(message: ProfileFeatured, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProfileFeatured;
  static deserializeBinaryFromReader(message: ProfileFeatured, reader: jspb.BinaryReader): ProfileFeatured;
}

export namespace ProfileFeatured {
  export type AsObject = {
    househelpId: string;
    featureDuration: string;
    profileUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SimilarProfilesSuggested extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): SimilarProfilesSuggested;

  getSuggestionsCount(): number;
  setSuggestionsCount(value: number): SimilarProfilesSuggested;

  getSuggestionsUrl(): string;
  setSuggestionsUrl(value: string): SimilarProfilesSuggested;

  getTimestamp(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTimestamp(value?: google_protobuf_timestamp_pb.Timestamp): SimilarProfilesSuggested;
  hasTimestamp(): boolean;
  clearTimestamp(): SimilarProfilesSuggested;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SimilarProfilesSuggested.AsObject;
  static toObject(includeInstance: boolean, msg: SimilarProfilesSuggested): SimilarProfilesSuggested.AsObject;
  static serializeBinaryToWriter(message: SimilarProfilesSuggested, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SimilarProfilesSuggested;
  static deserializeBinaryFromReader(message: SimilarProfilesSuggested, reader: jspb.BinaryReader): SimilarProfilesSuggested;
}

export namespace SimilarProfilesSuggested {
  export type AsObject = {
    householdId: string;
    suggestionsCount: number;
    suggestionsUrl: string;
    timestamp?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionActivated extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionActivated;

  getUserId(): string;
  setUserId(value: string): SubscriptionActivated;

  getPlanId(): string;
  setPlanId(value: string): SubscriptionActivated;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionActivated;

  getAmount(): number;
  setAmount(value: number): SubscriptionActivated;

  getCurrency(): string;
  setCurrency(value: string): SubscriptionActivated;

  getActivatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setActivatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionActivated;
  hasActivatedAt(): boolean;
  clearActivatedAt(): SubscriptionActivated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionActivated.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionActivated): SubscriptionActivated.AsObject;
  static serializeBinaryToWriter(message: SubscriptionActivated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionActivated;
  static deserializeBinaryFromReader(message: SubscriptionActivated, reader: jspb.BinaryReader): SubscriptionActivated;
}

export namespace SubscriptionActivated {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planId: string;
    planName: string;
    amount: number;
    currency: string;
    activatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionSuspended extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionSuspended;

  getUserId(): string;
  setUserId(value: string): SubscriptionSuspended;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionSuspended;

  getSuspendedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setSuspendedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionSuspended;
  hasSuspendedAt(): boolean;
  clearSuspendedAt(): SubscriptionSuspended;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionSuspended.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionSuspended): SubscriptionSuspended.AsObject;
  static serializeBinaryToWriter(message: SubscriptionSuspended, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionSuspended;
  static deserializeBinaryFromReader(message: SubscriptionSuspended, reader: jspb.BinaryReader): SubscriptionSuspended;
}

export namespace SubscriptionSuspended {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planName: string;
    suspendedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionReactivated extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionReactivated;

  getUserId(): string;
  setUserId(value: string): SubscriptionReactivated;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionReactivated;

  getReactivatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setReactivatedAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionReactivated;
  hasReactivatedAt(): boolean;
  clearReactivatedAt(): SubscriptionReactivated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionReactivated.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionReactivated): SubscriptionReactivated.AsObject;
  static serializeBinaryToWriter(message: SubscriptionReactivated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionReactivated;
  static deserializeBinaryFromReader(message: SubscriptionReactivated, reader: jspb.BinaryReader): SubscriptionReactivated;
}

export namespace SubscriptionReactivated {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planName: string;
    reactivatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionPastDue extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionPastDue;

  getUserId(): string;
  setUserId(value: string): SubscriptionPastDue;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionPastDue;

  getDaysInGrace(): number;
  setDaysInGrace(value: number): SubscriptionPastDue;

  getGracePeriodEnd(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setGracePeriodEnd(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionPastDue;
  hasGracePeriodEnd(): boolean;
  clearGracePeriodEnd(): SubscriptionPastDue;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionPastDue.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionPastDue): SubscriptionPastDue.AsObject;
  static serializeBinaryToWriter(message: SubscriptionPastDue, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionPastDue;
  static deserializeBinaryFromReader(message: SubscriptionPastDue, reader: jspb.BinaryReader): SubscriptionPastDue;
}

export namespace SubscriptionPastDue {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planName: string;
    daysInGrace: number;
    gracePeriodEnd?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionTrialStarted extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionTrialStarted;

  getUserId(): string;
  setUserId(value: string): SubscriptionTrialStarted;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionTrialStarted;

  getTrialDays(): number;
  setTrialDays(value: number): SubscriptionTrialStarted;

  getTrialEnd(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTrialEnd(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionTrialStarted;
  hasTrialEnd(): boolean;
  clearTrialEnd(): SubscriptionTrialStarted;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionTrialStarted.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionTrialStarted): SubscriptionTrialStarted.AsObject;
  static serializeBinaryToWriter(message: SubscriptionTrialStarted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionTrialStarted;
  static deserializeBinaryFromReader(message: SubscriptionTrialStarted, reader: jspb.BinaryReader): SubscriptionTrialStarted;
}

export namespace SubscriptionTrialStarted {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planName: string;
    trialDays: number;
    trialEnd?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionExpiryWarning extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionExpiryWarning;

  getUserId(): string;
  setUserId(value: string): SubscriptionExpiryWarning;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionExpiryWarning;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): SubscriptionExpiryWarning;

  getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionExpiryWarning;
  hasExpiresAt(): boolean;
  clearExpiresAt(): SubscriptionExpiryWarning;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionExpiryWarning.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionExpiryWarning): SubscriptionExpiryWarning.AsObject;
  static serializeBinaryToWriter(message: SubscriptionExpiryWarning, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionExpiryWarning;
  static deserializeBinaryFromReader(message: SubscriptionExpiryWarning, reader: jspb.BinaryReader): SubscriptionExpiryWarning;
}

export namespace SubscriptionExpiryWarning {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planName: string;
    daysRemaining: number;
    expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class SubscriptionLapsed extends jspb.Message {
  getSubscriptionId(): string;
  setSubscriptionId(value: string): SubscriptionLapsed;

  getUserId(): string;
  setUserId(value: string): SubscriptionLapsed;

  getPlanName(): string;
  setPlanName(value: string): SubscriptionLapsed;

  getDaysSinceExpiry(): number;
  setDaysSinceExpiry(value: number): SubscriptionLapsed;

  getExpiredAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiredAt(value?: google_protobuf_timestamp_pb.Timestamp): SubscriptionLapsed;
  hasExpiredAt(): boolean;
  clearExpiredAt(): SubscriptionLapsed;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SubscriptionLapsed.AsObject;
  static toObject(includeInstance: boolean, msg: SubscriptionLapsed): SubscriptionLapsed.AsObject;
  static serializeBinaryToWriter(message: SubscriptionLapsed, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SubscriptionLapsed;
  static deserializeBinaryFromReader(message: SubscriptionLapsed, reader: jspb.BinaryReader): SubscriptionLapsed;
}

export namespace SubscriptionLapsed {
  export type AsObject = {
    subscriptionId: string;
    userId: string;
    planName: string;
    daysSinceExpiry: number;
    expiredAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class PaymentRefunded extends jspb.Message {
  getPaymentId(): string;
  setPaymentId(value: string): PaymentRefunded;

  getUserId(): string;
  setUserId(value: string): PaymentRefunded;

  getAmount(): number;
  setAmount(value: number): PaymentRefunded;

  getCurrency(): string;
  setCurrency(value: string): PaymentRefunded;

  getRefundReason(): string;
  setRefundReason(value: string): PaymentRefunded;

  getRefundedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setRefundedAt(value?: google_protobuf_timestamp_pb.Timestamp): PaymentRefunded;
  hasRefundedAt(): boolean;
  clearRefundedAt(): PaymentRefunded;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaymentRefunded.AsObject;
  static toObject(includeInstance: boolean, msg: PaymentRefunded): PaymentRefunded.AsObject;
  static serializeBinaryToWriter(message: PaymentRefunded, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaymentRefunded;
  static deserializeBinaryFromReader(message: PaymentRefunded, reader: jspb.BinaryReader): PaymentRefunded;
}

export namespace PaymentRefunded {
  export type AsObject = {
    paymentId: string;
    userId: string;
    amount: number;
    currency: string;
    refundReason: string;
    refundedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class MessageReceived extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): MessageReceived;

  getConversationId(): string;
  setConversationId(value: string): MessageReceived;

  getRecipientId(): string;
  setRecipientId(value: string): MessageReceived;

  getSenderId(): string;
  setSenderId(value: string): MessageReceived;

  getSenderName(): string;
  setSenderName(value: string): MessageReceived;

  getMessagePreview(): string;
  setMessagePreview(value: string): MessageReceived;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): MessageReceived;
  hasCreatedAt(): boolean;
  clearCreatedAt(): MessageReceived;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageReceived.AsObject;
  static toObject(includeInstance: boolean, msg: MessageReceived): MessageReceived.AsObject;
  static serializeBinaryToWriter(message: MessageReceived, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageReceived;
  static deserializeBinaryFromReader(message: MessageReceived, reader: jspb.BinaryReader): MessageReceived;
}

export namespace MessageReceived {
  export type AsObject = {
    messageId: string;
    conversationId: string;
    recipientId: string;
    senderId: string;
    senderName: string;
    messagePreview: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class MessageRead extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): MessageRead;

  getConversationId(): string;
  setConversationId(value: string): MessageRead;

  getReaderId(): string;
  setReaderId(value: string): MessageRead;

  getSenderId(): string;
  setSenderId(value: string): MessageRead;

  getReadAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setReadAt(value?: google_protobuf_timestamp_pb.Timestamp): MessageRead;
  hasReadAt(): boolean;
  clearReadAt(): MessageRead;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageRead.AsObject;
  static toObject(includeInstance: boolean, msg: MessageRead): MessageRead.AsObject;
  static serializeBinaryToWriter(message: MessageRead, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageRead;
  static deserializeBinaryFromReader(message: MessageRead, reader: jspb.BinaryReader): MessageRead;
}

export namespace MessageRead {
  export type AsObject = {
    messageId: string;
    conversationId: string;
    readerId: string;
    senderId: string;
    readAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class MessageDeleted extends jspb.Message {
  getMessageId(): string;
  setMessageId(value: string): MessageDeleted;

  getConversationId(): string;
  setConversationId(value: string): MessageDeleted;

  getUserId(): string;
  setUserId(value: string): MessageDeleted;

  getDeletedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setDeletedAt(value?: google_protobuf_timestamp_pb.Timestamp): MessageDeleted;
  hasDeletedAt(): boolean;
  clearDeletedAt(): MessageDeleted;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MessageDeleted.AsObject;
  static toObject(includeInstance: boolean, msg: MessageDeleted): MessageDeleted.AsObject;
  static serializeBinaryToWriter(message: MessageDeleted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MessageDeleted;
  static deserializeBinaryFromReader(message: MessageDeleted, reader: jspb.BinaryReader): MessageDeleted;
}

export namespace MessageDeleted {
  export type AsObject = {
    messageId: string;
    conversationId: string;
    userId: string;
    deletedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ConversationStarted extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): ConversationStarted;

  getInitiatorId(): string;
  setInitiatorId(value: string): ConversationStarted;

  getRecipientId(): string;
  setRecipientId(value: string): ConversationStarted;

  getInitiatorName(): string;
  setInitiatorName(value: string): ConversationStarted;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): ConversationStarted;
  hasCreatedAt(): boolean;
  clearCreatedAt(): ConversationStarted;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversationStarted.AsObject;
  static toObject(includeInstance: boolean, msg: ConversationStarted): ConversationStarted.AsObject;
  static serializeBinaryToWriter(message: ConversationStarted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversationStarted;
  static deserializeBinaryFromReader(message: ConversationStarted, reader: jspb.BinaryReader): ConversationStarted;
}

export namespace ConversationStarted {
  export type AsObject = {
    conversationId: string;
    initiatorId: string;
    recipientId: string;
    initiatorName: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ConversationArchived extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): ConversationArchived;

  getUserId(): string;
  setUserId(value: string): ConversationArchived;

  getArchivedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setArchivedAt(value?: google_protobuf_timestamp_pb.Timestamp): ConversationArchived;
  hasArchivedAt(): boolean;
  clearArchivedAt(): ConversationArchived;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversationArchived.AsObject;
  static toObject(includeInstance: boolean, msg: ConversationArchived): ConversationArchived.AsObject;
  static serializeBinaryToWriter(message: ConversationArchived, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversationArchived;
  static deserializeBinaryFromReader(message: ConversationArchived, reader: jspb.BinaryReader): ConversationArchived;
}

export namespace ConversationArchived {
  export type AsObject = {
    conversationId: string;
    userId: string;
    archivedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ConversationMuted extends jspb.Message {
  getConversationId(): string;
  setConversationId(value: string): ConversationMuted;

  getUserId(): string;
  setUserId(value: string): ConversationMuted;

  getMuted(): boolean;
  setMuted(value: boolean): ConversationMuted;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): ConversationMuted;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): ConversationMuted;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConversationMuted.AsObject;
  static toObject(includeInstance: boolean, msg: ConversationMuted): ConversationMuted.AsObject;
  static serializeBinaryToWriter(message: ConversationMuted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConversationMuted;
  static deserializeBinaryFromReader(message: ConversationMuted, reader: jspb.BinaryReader): ConversationMuted;
}

export namespace ConversationMuted {
  export type AsObject = {
    conversationId: string;
    userId: string;
    muted: boolean;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class UnreadMessagesReminder extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UnreadMessagesReminder;

  getUnreadCount(): number;
  setUnreadCount(value: number): UnreadMessagesReminder;

  getSenderNames(): string;
  setSenderNames(value: string): UnreadMessagesReminder;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): UnreadMessagesReminder;
  hasCreatedAt(): boolean;
  clearCreatedAt(): UnreadMessagesReminder;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UnreadMessagesReminder.AsObject;
  static toObject(includeInstance: boolean, msg: UnreadMessagesReminder): UnreadMessagesReminder.AsObject;
  static serializeBinaryToWriter(message: UnreadMessagesReminder, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UnreadMessagesReminder;
  static deserializeBinaryFromReader(message: UnreadMessagesReminder, reader: jspb.BinaryReader): UnreadMessagesReminder;
}

export namespace UnreadMessagesReminder {
  export type AsObject = {
    userId: string;
    unreadCount: number;
    senderNames: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class HireRequestReceived extends jspb.Message {
  getRequestId(): string;
  setRequestId(value: string): HireRequestReceived;

  getHousehelpId(): string;
  setHousehelpId(value: string): HireRequestReceived;

  getHouseholdId(): string;
  setHouseholdId(value: string): HireRequestReceived;

  getHouseholdName(): string;
  setHouseholdName(value: string): HireRequestReceived;

  getPosition(): string;
  setPosition(value: string): HireRequestReceived;

  getSalary(): string;
  setSalary(value: string): HireRequestReceived;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): HireRequestReceived;
  hasCreatedAt(): boolean;
  clearCreatedAt(): HireRequestReceived;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HireRequestReceived.AsObject;
  static toObject(includeInstance: boolean, msg: HireRequestReceived): HireRequestReceived.AsObject;
  static serializeBinaryToWriter(message: HireRequestReceived, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HireRequestReceived;
  static deserializeBinaryFromReader(message: HireRequestReceived, reader: jspb.BinaryReader): HireRequestReceived;
}

export namespace HireRequestReceived {
  export type AsObject = {
    requestId: string;
    househelpId: string;
    householdId: string;
    householdName: string;
    position: string;
    salary: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class HireRequestAccepted extends jspb.Message {
  getRequestId(): string;
  setRequestId(value: string): HireRequestAccepted;

  getHouseholdId(): string;
  setHouseholdId(value: string): HireRequestAccepted;

  getHousehelpId(): string;
  setHousehelpId(value: string): HireRequestAccepted;

  getHousehelpName(): string;
  setHousehelpName(value: string): HireRequestAccepted;

  getPosition(): string;
  setPosition(value: string): HireRequestAccepted;

  getAcceptedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setAcceptedAt(value?: google_protobuf_timestamp_pb.Timestamp): HireRequestAccepted;
  hasAcceptedAt(): boolean;
  clearAcceptedAt(): HireRequestAccepted;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HireRequestAccepted.AsObject;
  static toObject(includeInstance: boolean, msg: HireRequestAccepted): HireRequestAccepted.AsObject;
  static serializeBinaryToWriter(message: HireRequestAccepted, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HireRequestAccepted;
  static deserializeBinaryFromReader(message: HireRequestAccepted, reader: jspb.BinaryReader): HireRequestAccepted;
}

export namespace HireRequestAccepted {
  export type AsObject = {
    requestId: string;
    householdId: string;
    househelpId: string;
    househelpName: string;
    position: string;
    acceptedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class HireRequestRejected extends jspb.Message {
  getRequestId(): string;
  setRequestId(value: string): HireRequestRejected;

  getHouseholdId(): string;
  setHouseholdId(value: string): HireRequestRejected;

  getHousehelpId(): string;
  setHousehelpId(value: string): HireRequestRejected;

  getHousehelpName(): string;
  setHousehelpName(value: string): HireRequestRejected;

  getPosition(): string;
  setPosition(value: string): HireRequestRejected;

  getReason(): string;
  setReason(value: string): HireRequestRejected;

  getRejectedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setRejectedAt(value?: google_protobuf_timestamp_pb.Timestamp): HireRequestRejected;
  hasRejectedAt(): boolean;
  clearRejectedAt(): HireRequestRejected;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HireRequestRejected.AsObject;
  static toObject(includeInstance: boolean, msg: HireRequestRejected): HireRequestRejected.AsObject;
  static serializeBinaryToWriter(message: HireRequestRejected, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HireRequestRejected;
  static deserializeBinaryFromReader(message: HireRequestRejected, reader: jspb.BinaryReader): HireRequestRejected;
}

export namespace HireRequestRejected {
  export type AsObject = {
    requestId: string;
    householdId: string;
    househelpId: string;
    househelpName: string;
    position: string;
    reason: string;
    rejectedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ContractSigned extends jspb.Message {
  getContractId(): string;
  setContractId(value: string): ContractSigned;

  getSignerId(): string;
  setSignerId(value: string): ContractSigned;

  getRecipientId(): string;
  setRecipientId(value: string): ContractSigned;

  getSignerName(): string;
  setSignerName(value: string): ContractSigned;

  getSignerType(): string;
  setSignerType(value: string): ContractSigned;

  getSignedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setSignedAt(value?: google_protobuf_timestamp_pb.Timestamp): ContractSigned;
  hasSignedAt(): boolean;
  clearSignedAt(): ContractSigned;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractSigned.AsObject;
  static toObject(includeInstance: boolean, msg: ContractSigned): ContractSigned.AsObject;
  static serializeBinaryToWriter(message: ContractSigned, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractSigned;
  static deserializeBinaryFromReader(message: ContractSigned, reader: jspb.BinaryReader): ContractSigned;
}

export namespace ContractSigned {
  export type AsObject = {
    contractId: string;
    signerId: string;
    recipientId: string;
    signerName: string;
    signerType: string;
    signedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ContractExpiring extends jspb.Message {
  getContractId(): string;
  setContractId(value: string): ContractExpiring;

  getUserId(): string;
  setUserId(value: string): ContractExpiring;

  getOtherPartyName(): string;
  setOtherPartyName(value: string): ContractExpiring;

  getDaysRemaining(): number;
  setDaysRemaining(value: number): ContractExpiring;

  getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): ContractExpiring;
  hasExpiresAt(): boolean;
  clearExpiresAt(): ContractExpiring;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractExpiring.AsObject;
  static toObject(includeInstance: boolean, msg: ContractExpiring): ContractExpiring.AsObject;
  static serializeBinaryToWriter(message: ContractExpiring, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractExpiring;
  static deserializeBinaryFromReader(message: ContractExpiring, reader: jspb.BinaryReader): ContractExpiring;
}

export namespace ContractExpiring {
  export type AsObject = {
    contractId: string;
    userId: string;
    otherPartyName: string;
    daysRemaining: number;
    expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class ContractTerminated extends jspb.Message {
  getContractId(): string;
  setContractId(value: string): ContractTerminated;

  getTerminatorId(): string;
  setTerminatorId(value: string): ContractTerminated;

  getRecipientId(): string;
  setRecipientId(value: string): ContractTerminated;

  getTerminatorName(): string;
  setTerminatorName(value: string): ContractTerminated;

  getReason(): string;
  setReason(value: string): ContractTerminated;

  getTerminatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setTerminatedAt(value?: google_protobuf_timestamp_pb.Timestamp): ContractTerminated;
  hasTerminatedAt(): boolean;
  clearTerminatedAt(): ContractTerminated;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ContractTerminated.AsObject;
  static toObject(includeInstance: boolean, msg: ContractTerminated): ContractTerminated.AsObject;
  static serializeBinaryToWriter(message: ContractTerminated, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ContractTerminated;
  static deserializeBinaryFromReader(message: ContractTerminated, reader: jspb.BinaryReader): ContractTerminated;
}

export namespace ContractTerminated {
  export type AsObject = {
    contractId: string;
    terminatorId: string;
    recipientId: string;
    terminatorName: string;
    reason: string;
    terminatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

