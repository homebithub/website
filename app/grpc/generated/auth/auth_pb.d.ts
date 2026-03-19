import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"
import * as google_protobuf_struct_pb from 'google-protobuf/google/protobuf/struct_pb'; // proto import: "google/protobuf/struct.proto"


export class User extends jspb.Message {
  getId(): string;
  setId(value: string): User;

  getEmail(): string;
  setEmail(value: string): User;

  getPhone(): string;
  setPhone(value: string): User;

  getFirstName(): string;
  setFirstName(value: string): User;

  getLastName(): string;
  setLastName(value: string): User;

  getProfileType(): string;
  setProfileType(value: string): User;

  getIsVerified(): boolean;
  setIsVerified(value: boolean): User;

  getToken(): string;
  setToken(value: string): User;

  getProfileImage(): string;
  setProfileImage(value: string): User;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): User;
  hasCreatedAt(): boolean;
  clearCreatedAt(): User;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): User;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    id: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    profileType: string;
    isVerified: boolean;
    token: string;
    profileImage: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class VerificationInfo extends jspb.Message {
  getId(): string;
  setId(value: string): VerificationInfo;

  getUserId(): string;
  setUserId(value: string): VerificationInfo;

  getType(): string;
  setType(value: string): VerificationInfo;

  getStatus(): string;
  setStatus(value: string): VerificationInfo;

  getTarget(): string;
  setTarget(value: string): VerificationInfo;

  getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationInfo;
  hasExpiresAt(): boolean;
  clearExpiresAt(): VerificationInfo;

  getNextResendAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setNextResendAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationInfo;
  hasNextResendAt(): boolean;
  clearNextResendAt(): VerificationInfo;

  getAttempts(): number;
  setAttempts(value: number): VerificationInfo;

  getMaxAttempts(): number;
  setMaxAttempts(value: number): VerificationInfo;

  getResends(): number;
  setResends(value: number): VerificationInfo;

  getMaxResends(): number;
  setMaxResends(value: number): VerificationInfo;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationInfo;
  hasCreatedAt(): boolean;
  clearCreatedAt(): VerificationInfo;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationInfo;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): VerificationInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerificationInfo.AsObject;
  static toObject(includeInstance: boolean, msg: VerificationInfo): VerificationInfo.AsObject;
  static serializeBinaryToWriter(message: VerificationInfo, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerificationInfo;
  static deserializeBinaryFromReader(message: VerificationInfo, reader: jspb.BinaryReader): VerificationInfo;
}

export namespace VerificationInfo {
  export type AsObject = {
    id: string;
    userId: string;
    type: string;
    status: string;
    target: string;
    expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    nextResendAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    attempts: number;
    maxAttempts: number;
    resends: number;
    maxResends: number;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class VerificationStatusResponse extends jspb.Message {
  getId(): string;
  setId(value: string): VerificationStatusResponse;

  getUserId(): string;
  setUserId(value: string): VerificationStatusResponse;

  getType(): string;
  setType(value: string): VerificationStatusResponse;

  getStatus(): string;
  setStatus(value: string): VerificationStatusResponse;

  getVerifiedBy(): string;
  setVerifiedBy(value: string): VerificationStatusResponse;

  getVerifiedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setVerifiedAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationStatusResponse;
  hasVerifiedAt(): boolean;
  clearVerifiedAt(): VerificationStatusResponse;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationStatusResponse;
  hasCreatedAt(): boolean;
  clearCreatedAt(): VerificationStatusResponse;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): VerificationStatusResponse;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): VerificationStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerificationStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VerificationStatusResponse): VerificationStatusResponse.AsObject;
  static serializeBinaryToWriter(message: VerificationStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerificationStatusResponse;
  static deserializeBinaryFromReader(message: VerificationStatusResponse, reader: jspb.BinaryReader): VerificationStatusResponse;
}

export namespace VerificationStatusResponse {
  export type AsObject = {
    id: string;
    userId: string;
    type: string;
    status: string;
    verifiedBy: string;
    verifiedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

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

export class TwoIdRequest extends jspb.Message {
  getId1(): string;
  setId1(value: string): TwoIdRequest;

  getId2(): string;
  setId2(value: string): TwoIdRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TwoIdRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TwoIdRequest): TwoIdRequest.AsObject;
  static serializeBinaryToWriter(message: TwoIdRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TwoIdRequest;
  static deserializeBinaryFromReader(message: TwoIdRequest, reader: jspb.BinaryReader): TwoIdRequest;
}

export namespace TwoIdRequest {
  export type AsObject = {
    id1: string;
    id2: string;
  };
}

export class PhoneRequest extends jspb.Message {
  getPhone(): string;
  setPhone(value: string): PhoneRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PhoneRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PhoneRequest): PhoneRequest.AsObject;
  static serializeBinaryToWriter(message: PhoneRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PhoneRequest;
  static deserializeBinaryFromReader(message: PhoneRequest, reader: jspb.BinaryReader): PhoneRequest;
}

export namespace PhoneRequest {
  export type AsObject = {
    phone: string;
  };
}

export class StringFieldRequest extends jspb.Message {
  getValue(): string;
  setValue(value: string): StringFieldRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StringFieldRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StringFieldRequest): StringFieldRequest.AsObject;
  static serializeBinaryToWriter(message: StringFieldRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StringFieldRequest;
  static deserializeBinaryFromReader(message: StringFieldRequest, reader: jspb.BinaryReader): StringFieldRequest;
}

export namespace StringFieldRequest {
  export type AsObject = {
    value: string;
  };
}

export class StatusRequest extends jspb.Message {
  getStatus(): string;
  setStatus(value: string): StatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StatusRequest): StatusRequest.AsObject;
  static serializeBinaryToWriter(message: StatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StatusRequest;
  static deserializeBinaryFromReader(message: StatusRequest, reader: jspb.BinaryReader): StatusRequest;
}

export namespace StatusRequest {
  export type AsObject = {
    status: string;
  };
}

export class RatingRequest extends jspb.Message {
  getMinRating(): number;
  setMinRating(value: number): RatingRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RatingRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RatingRequest): RatingRequest.AsObject;
  static serializeBinaryToWriter(message: RatingRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RatingRequest;
  static deserializeBinaryFromReader(message: RatingRequest, reader: jspb.BinaryReader): RatingRequest;
}

export namespace RatingRequest {
  export type AsObject = {
    minRating: number;
  };
}

export class ListRequest extends jspb.Message {
  getLimit(): number;
  setLimit(value: number): ListRequest;

  getOffset(): number;
  setOffset(value: number): ListRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ListRequest): ListRequest.AsObject;
  static serializeBinaryToWriter(message: ListRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListRequest;
  static deserializeBinaryFromReader(message: ListRequest, reader: jspb.BinaryReader): ListRequest;
}

export namespace ListRequest {
  export type AsObject = {
    limit: number;
    offset: number;
  };
}

export class PaginatedRequest extends jspb.Message {
  getId(): string;
  setId(value: string): PaginatedRequest;

  getUserId(): string;
  setUserId(value: string): PaginatedRequest;

  getPage(): number;
  setPage(value: number): PaginatedRequest;

  getLimit(): number;
  setLimit(value: number): PaginatedRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaginatedRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PaginatedRequest): PaginatedRequest.AsObject;
  static serializeBinaryToWriter(message: PaginatedRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaginatedRequest;
  static deserializeBinaryFromReader(message: PaginatedRequest, reader: jspb.BinaryReader): PaginatedRequest;
}

export namespace PaginatedRequest {
  export type AsObject = {
    id: string;
    userId: string;
    page: number;
    limit: number;
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

export class BoolResponse extends jspb.Message {
  getValue(): boolean;
  setValue(value: boolean): BoolResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BoolResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BoolResponse): BoolResponse.AsObject;
  static serializeBinaryToWriter(message: BoolResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BoolResponse;
  static deserializeBinaryFromReader(message: BoolResponse, reader: jspb.BinaryReader): BoolResponse;
}

export namespace BoolResponse {
  export type AsObject = {
    value: boolean;
  };
}

export class JsonPayload extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): JsonPayload;

  getProfileType(): string;
  setProfileType(value: string): JsonPayload;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): JsonPayload;
  hasData(): boolean;
  clearData(): JsonPayload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JsonPayload.AsObject;
  static toObject(includeInstance: boolean, msg: JsonPayload): JsonPayload.AsObject;
  static serializeBinaryToWriter(message: JsonPayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JsonPayload;
  static deserializeBinaryFromReader(message: JsonPayload, reader: jspb.BinaryReader): JsonPayload;
}

export namespace JsonPayload {
  export type AsObject = {
    userId: string;
    profileType: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateByIdPayload extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateByIdPayload;

  getUserId(): string;
  setUserId(value: string): UpdateByIdPayload;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateByIdPayload;
  hasData(): boolean;
  clearData(): UpdateByIdPayload;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateByIdPayload.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateByIdPayload): UpdateByIdPayload.AsObject;
  static serializeBinaryToWriter(message: UpdateByIdPayload, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateByIdPayload;
  static deserializeBinaryFromReader(message: UpdateByIdPayload, reader: jspb.BinaryReader): UpdateByIdPayload;
}

export namespace UpdateByIdPayload {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
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

export class StepRequest extends jspb.Message {
  getStep(): number;
  setStep(value: number): StepRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StepRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StepRequest): StepRequest.AsObject;
  static serializeBinaryToWriter(message: StepRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StepRequest;
  static deserializeBinaryFromReader(message: StepRequest, reader: jspb.BinaryReader): StepRequest;
}

export namespace StepRequest {
  export type AsObject = {
    step: number;
  };
}

export class SalaryRangeRequest extends jspb.Message {
  getMinSalary(): number;
  setMinSalary(value: number): SalaryRangeRequest;

  getMaxSalary(): number;
  setMaxSalary(value: number): SalaryRangeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SalaryRangeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SalaryRangeRequest): SalaryRangeRequest.AsObject;
  static serializeBinaryToWriter(message: SalaryRangeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SalaryRangeRequest;
  static deserializeBinaryFromReader(message: SalaryRangeRequest, reader: jspb.BinaryReader): SalaryRangeRequest;
}

export namespace SalaryRangeRequest {
  export type AsObject = {
    minSalary: number;
    maxSalary: number;
  };
}

export class PaginatedUserRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): PaginatedUserRequest;

  getLimit(): number;
  setLimit(value: number): PaginatedUserRequest;

  getOffset(): number;
  setOffset(value: number): PaginatedUserRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PaginatedUserRequest.AsObject;
  static toObject(includeInstance: boolean, msg: PaginatedUserRequest): PaginatedUserRequest.AsObject;
  static serializeBinaryToWriter(message: PaginatedUserRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PaginatedUserRequest;
  static deserializeBinaryFromReader(message: PaginatedUserRequest, reader: jspb.BinaryReader): PaginatedUserRequest;
}

export namespace PaginatedUserRequest {
  export type AsObject = {
    userId: string;
    limit: number;
    offset: number;
  };
}

export class SignupRequest extends jspb.Message {
  getFirstName(): string;
  setFirstName(value: string): SignupRequest;

  getLastName(): string;
  setLastName(value: string): SignupRequest;

  getPhone(): string;
  setPhone(value: string): SignupRequest;

  getPassword(): string;
  setPassword(value: string): SignupRequest;

  getProfileType(): string;
  setProfileType(value: string): SignupRequest;

  getBureauId(): string;
  setBureauId(value: string): SignupRequest;

  getHouseholdId(): string;
  setHouseholdId(value: string): SignupRequest;

  getDateOfBirth(): string;
  setDateOfBirth(value: string): SignupRequest;

  getSignedDate(): string;
  setSignedDate(value: string): SignupRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignupRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SignupRequest): SignupRequest.AsObject;
  static serializeBinaryToWriter(message: SignupRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignupRequest;
  static deserializeBinaryFromReader(message: SignupRequest, reader: jspb.BinaryReader): SignupRequest;
}

export namespace SignupRequest {
  export type AsObject = {
    firstName: string;
    lastName: string;
    phone: string;
    password: string;
    profileType: string;
    bureauId: string;
    householdId: string;
    dateOfBirth: string;
    signedDate: string;
  };
}

export class SignupResponse extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SignupResponse;

  getToken(): string;
  setToken(value: string): SignupResponse;

  getVerification(): VerificationInfo | undefined;
  setVerification(value?: VerificationInfo): SignupResponse;
  hasVerification(): boolean;
  clearVerification(): SignupResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignupResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SignupResponse): SignupResponse.AsObject;
  static serializeBinaryToWriter(message: SignupResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignupResponse;
  static deserializeBinaryFromReader(message: SignupResponse, reader: jspb.BinaryReader): SignupResponse;
}

export namespace SignupResponse {
  export type AsObject = {
    userId: string;
    token: string;
    verification?: VerificationInfo.AsObject;
  };
}

export class LoginRequest extends jspb.Message {
  getPhone(): string;
  setPhone(value: string): LoginRequest;

  getPassword(): string;
  setPassword(value: string): LoginRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoginRequest): LoginRequest.AsObject;
  static serializeBinaryToWriter(message: LoginRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginRequest;
  static deserializeBinaryFromReader(message: LoginRequest, reader: jspb.BinaryReader): LoginRequest;
}

export namespace LoginRequest {
  export type AsObject = {
    phone: string;
    password: string;
  };
}

export class LoginResponse extends jspb.Message {
  getUser(): User | undefined;
  setUser(value?: User): LoginResponse;
  hasUser(): boolean;
  clearUser(): LoginResponse;

  getToken(): string;
  setToken(value: string): LoginResponse;

  getRefreshToken(): string;
  setRefreshToken(value: string): LoginResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LoginResponse): LoginResponse.AsObject;
  static serializeBinaryToWriter(message: LoginResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginResponse;
  static deserializeBinaryFromReader(message: LoginResponse, reader: jspb.BinaryReader): LoginResponse;
}

export namespace LoginResponse {
  export type AsObject = {
    user?: User.AsObject;
    token: string;
    refreshToken: string;
  };
}

export class LogoutRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): LogoutRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LogoutRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LogoutRequest): LogoutRequest.AsObject;
  static serializeBinaryToWriter(message: LogoutRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LogoutRequest;
  static deserializeBinaryFromReader(message: LogoutRequest, reader: jspb.BinaryReader): LogoutRequest;
}

export namespace LogoutRequest {
  export type AsObject = {
    userId: string;
  };
}

export class RefreshTokenRequest extends jspb.Message {
  getRefreshToken(): string;
  setRefreshToken(value: string): RefreshTokenRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RefreshTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RefreshTokenRequest): RefreshTokenRequest.AsObject;
  static serializeBinaryToWriter(message: RefreshTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RefreshTokenRequest;
  static deserializeBinaryFromReader(message: RefreshTokenRequest, reader: jspb.BinaryReader): RefreshTokenRequest;
}

export namespace RefreshTokenRequest {
  export type AsObject = {
    refreshToken: string;
  };
}

export class RefreshTokenResponse extends jspb.Message {
  getToken(): string;
  setToken(value: string): RefreshTokenResponse;

  getRefreshToken(): string;
  setRefreshToken(value: string): RefreshTokenResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RefreshTokenResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RefreshTokenResponse): RefreshTokenResponse.AsObject;
  static serializeBinaryToWriter(message: RefreshTokenResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RefreshTokenResponse;
  static deserializeBinaryFromReader(message: RefreshTokenResponse, reader: jspb.BinaryReader): RefreshTokenResponse;
}

export namespace RefreshTokenResponse {
  export type AsObject = {
    token: string;
    refreshToken: string;
  };
}

export class ValidateTokenRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): ValidateTokenRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateTokenRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateTokenRequest): ValidateTokenRequest.AsObject;
  static serializeBinaryToWriter(message: ValidateTokenRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateTokenRequest;
  static deserializeBinaryFromReader(message: ValidateTokenRequest, reader: jspb.BinaryReader): ValidateTokenRequest;
}

export namespace ValidateTokenRequest {
  export type AsObject = {
    token: string;
  };
}

export class ValidateTokenResponse extends jspb.Message {
  getValid(): boolean;
  setValid(value: boolean): ValidateTokenResponse;

  getUserId(): string;
  setUserId(value: string): ValidateTokenResponse;

  getRole(): string;
  setRole(value: string): ValidateTokenResponse;

  getProfileType(): string;
  setProfileType(value: string): ValidateTokenResponse;

  getProfileId(): string;
  setProfileId(value: string): ValidateTokenResponse;

  getError(): string;
  setError(value: string): ValidateTokenResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ValidateTokenResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ValidateTokenResponse): ValidateTokenResponse.AsObject;
  static serializeBinaryToWriter(message: ValidateTokenResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ValidateTokenResponse;
  static deserializeBinaryFromReader(message: ValidateTokenResponse, reader: jspb.BinaryReader): ValidateTokenResponse;
}

export namespace ValidateTokenResponse {
  export type AsObject = {
    valid: boolean;
    userId: string;
    role: string;
    profileType: string;
    profileId: string;
    error: string;
  };
}

export class ForgotPasswordRequest extends jspb.Message {
  getPhone(): string;
  setPhone(value: string): ForgotPasswordRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForgotPasswordRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ForgotPasswordRequest): ForgotPasswordRequest.AsObject;
  static serializeBinaryToWriter(message: ForgotPasswordRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForgotPasswordRequest;
  static deserializeBinaryFromReader(message: ForgotPasswordRequest, reader: jspb.BinaryReader): ForgotPasswordRequest;
}

export namespace ForgotPasswordRequest {
  export type AsObject = {
    phone: string;
  };
}

export class ForgotPasswordResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): ForgotPasswordResponse;

  getVerification(): VerificationInfo | undefined;
  setVerification(value?: VerificationInfo): ForgotPasswordResponse;
  hasVerification(): boolean;
  clearVerification(): ForgotPasswordResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ForgotPasswordResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ForgotPasswordResponse): ForgotPasswordResponse.AsObject;
  static serializeBinaryToWriter(message: ForgotPasswordResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ForgotPasswordResponse;
  static deserializeBinaryFromReader(message: ForgotPasswordResponse, reader: jspb.BinaryReader): ForgotPasswordResponse;
}

export namespace ForgotPasswordResponse {
  export type AsObject = {
    message: string;
    verification?: VerificationInfo.AsObject;
  };
}

export class ResetPasswordRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ResetPasswordRequest;

  getNewPassword(): string;
  setNewPassword(value: string): ResetPasswordRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResetPasswordRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ResetPasswordRequest): ResetPasswordRequest.AsObject;
  static serializeBinaryToWriter(message: ResetPasswordRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResetPasswordRequest;
  static deserializeBinaryFromReader(message: ResetPasswordRequest, reader: jspb.BinaryReader): ResetPasswordRequest;
}

export namespace ResetPasswordRequest {
  export type AsObject = {
    userId: string;
    newPassword: string;
  };
}

export class ChangePasswordRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ChangePasswordRequest;

  getCurrentPassword(): string;
  setCurrentPassword(value: string): ChangePasswordRequest;

  getNewPassword(): string;
  setNewPassword(value: string): ChangePasswordRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ChangePasswordRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ChangePasswordRequest): ChangePasswordRequest.AsObject;
  static serializeBinaryToWriter(message: ChangePasswordRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ChangePasswordRequest;
  static deserializeBinaryFromReader(message: ChangePasswordRequest, reader: jspb.BinaryReader): ChangePasswordRequest;
}

export namespace ChangePasswordRequest {
  export type AsObject = {
    userId: string;
    currentPassword: string;
    newPassword: string;
  };
}

export class GoogleSignInRequest extends jspb.Message {
  getCode(): string;
  setCode(value: string): GoogleSignInRequest;

  getFlow(): string;
  setFlow(value: string): GoogleSignInRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GoogleSignInRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GoogleSignInRequest): GoogleSignInRequest.AsObject;
  static serializeBinaryToWriter(message: GoogleSignInRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GoogleSignInRequest;
  static deserializeBinaryFromReader(message: GoogleSignInRequest, reader: jspb.BinaryReader): GoogleSignInRequest;
}

export namespace GoogleSignInRequest {
  export type AsObject = {
    code: string;
    flow: string;
  };
}

export class GoogleSignInResponse extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GoogleSignInResponse;

  getToken(): string;
  setToken(value: string): GoogleSignInResponse;

  getRequiresSignup(): boolean;
  setRequiresSignup(value: boolean): GoogleSignInResponse;

  getEmail(): string;
  setEmail(value: string): GoogleSignInResponse;

  getFirstName(): string;
  setFirstName(value: string): GoogleSignInResponse;

  getLastName(): string;
  setLastName(value: string): GoogleSignInResponse;

  getPicture(): string;
  setPicture(value: string): GoogleSignInResponse;

  getGoogleId(): string;
  setGoogleId(value: string): GoogleSignInResponse;

  getFlow(): string;
  setFlow(value: string): GoogleSignInResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GoogleSignInResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GoogleSignInResponse): GoogleSignInResponse.AsObject;
  static serializeBinaryToWriter(message: GoogleSignInResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GoogleSignInResponse;
  static deserializeBinaryFromReader(message: GoogleSignInResponse, reader: jspb.BinaryReader): GoogleSignInResponse;
}

export namespace GoogleSignInResponse {
  export type AsObject = {
    userId: string;
    token: string;
    requiresSignup: boolean;
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    googleId: string;
    flow: string;
  };
}

export class GetGoogleAuthURLRequest extends jspb.Message {
  getFlow(): string;
  setFlow(value: string): GetGoogleAuthURLRequest;

  getState(): string;
  setState(value: string): GetGoogleAuthURLRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGoogleAuthURLRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetGoogleAuthURLRequest): GetGoogleAuthURLRequest.AsObject;
  static serializeBinaryToWriter(message: GetGoogleAuthURLRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGoogleAuthURLRequest;
  static deserializeBinaryFromReader(message: GetGoogleAuthURLRequest, reader: jspb.BinaryReader): GetGoogleAuthURLRequest;
}

export namespace GetGoogleAuthURLRequest {
  export type AsObject = {
    flow: string;
    state: string;
  };
}

export class GetGoogleAuthURLResponse extends jspb.Message {
  getUrl(): string;
  setUrl(value: string): GetGoogleAuthURLResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetGoogleAuthURLResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetGoogleAuthURLResponse): GetGoogleAuthURLResponse.AsObject;
  static serializeBinaryToWriter(message: GetGoogleAuthURLResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetGoogleAuthURLResponse;
  static deserializeBinaryFromReader(message: GetGoogleAuthURLResponse, reader: jspb.BinaryReader): GetGoogleAuthURLResponse;
}

export namespace GetGoogleAuthURLResponse {
  export type AsObject = {
    url: string;
  };
}

export class CompleteGoogleSignupRequest extends jspb.Message {
  getGoogleId(): string;
  setGoogleId(value: string): CompleteGoogleSignupRequest;

  getEmail(): string;
  setEmail(value: string): CompleteGoogleSignupRequest;

  getFirstName(): string;
  setFirstName(value: string): CompleteGoogleSignupRequest;

  getLastName(): string;
  setLastName(value: string): CompleteGoogleSignupRequest;

  getPhone(): string;
  setPhone(value: string): CompleteGoogleSignupRequest;

  getProfileType(): string;
  setProfileType(value: string): CompleteGoogleSignupRequest;

  getBureauId(): string;
  setBureauId(value: string): CompleteGoogleSignupRequest;

  getHouseholdId(): string;
  setHouseholdId(value: string): CompleteGoogleSignupRequest;

  getDateOfBirth(): string;
  setDateOfBirth(value: string): CompleteGoogleSignupRequest;

  getSignedDate(): string;
  setSignedDate(value: string): CompleteGoogleSignupRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CompleteGoogleSignupRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CompleteGoogleSignupRequest): CompleteGoogleSignupRequest.AsObject;
  static serializeBinaryToWriter(message: CompleteGoogleSignupRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CompleteGoogleSignupRequest;
  static deserializeBinaryFromReader(message: CompleteGoogleSignupRequest, reader: jspb.BinaryReader): CompleteGoogleSignupRequest;
}

export namespace CompleteGoogleSignupRequest {
  export type AsObject = {
    googleId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    profileType: string;
    bureauId: string;
    householdId: string;
    dateOfBirth: string;
    signedDate: string;
  };
}

export class GetCurrentUserRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetCurrentUserRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetCurrentUserRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetCurrentUserRequest): GetCurrentUserRequest.AsObject;
  static serializeBinaryToWriter(message: GetCurrentUserRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetCurrentUserRequest;
  static deserializeBinaryFromReader(message: GetCurrentUserRequest, reader: jspb.BinaryReader): GetCurrentUserRequest;
}

export namespace GetCurrentUserRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetUserRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetUserRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserRequest): GetUserRequest.AsObject;
  static serializeBinaryToWriter(message: GetUserRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserRequest;
  static deserializeBinaryFromReader(message: GetUserRequest, reader: jspb.BinaryReader): GetUserRequest;
}

export namespace GetUserRequest {
  export type AsObject = {
    userId: string;
  };
}

export class GetMultipleUsersRequest extends jspb.Message {
  getUserIdsList(): Array<string>;
  setUserIdsList(value: Array<string>): GetMultipleUsersRequest;
  clearUserIdsList(): GetMultipleUsersRequest;
  addUserIds(value: string, index?: number): GetMultipleUsersRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMultipleUsersRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetMultipleUsersRequest): GetMultipleUsersRequest.AsObject;
  static serializeBinaryToWriter(message: GetMultipleUsersRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMultipleUsersRequest;
  static deserializeBinaryFromReader(message: GetMultipleUsersRequest, reader: jspb.BinaryReader): GetMultipleUsersRequest;
}

export namespace GetMultipleUsersRequest {
  export type AsObject = {
    userIdsList: Array<string>;
  };
}

export class GetMultipleUsersResponse extends jspb.Message {
  getUsersMap(): jspb.Map<string, User>;
  clearUsersMap(): GetMultipleUsersResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetMultipleUsersResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetMultipleUsersResponse): GetMultipleUsersResponse.AsObject;
  static serializeBinaryToWriter(message: GetMultipleUsersResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetMultipleUsersResponse;
  static deserializeBinaryFromReader(message: GetMultipleUsersResponse, reader: jspb.BinaryReader): GetMultipleUsersResponse;
}

export namespace GetMultipleUsersResponse {
  export type AsObject = {
    usersMap: Array<[string, User.AsObject]>;
  };
}

export class UpdateEmailRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateEmailRequest;

  getEmail(): string;
  setEmail(value: string): UpdateEmailRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateEmailRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateEmailRequest): UpdateEmailRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateEmailRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateEmailRequest;
  static deserializeBinaryFromReader(message: UpdateEmailRequest, reader: jspb.BinaryReader): UpdateEmailRequest;
}

export namespace UpdateEmailRequest {
  export type AsObject = {
    userId: string;
    email: string;
  };
}

export class UpdateEmailResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): UpdateEmailResponse;

  getVerification(): VerificationInfo | undefined;
  setVerification(value?: VerificationInfo): UpdateEmailResponse;
  hasVerification(): boolean;
  clearVerification(): UpdateEmailResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateEmailResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateEmailResponse): UpdateEmailResponse.AsObject;
  static serializeBinaryToWriter(message: UpdateEmailResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateEmailResponse;
  static deserializeBinaryFromReader(message: UpdateEmailResponse, reader: jspb.BinaryReader): UpdateEmailResponse;
}

export namespace UpdateEmailResponse {
  export type AsObject = {
    message: string;
    verification?: VerificationInfo.AsObject;
  };
}

export class UpdatePhoneRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdatePhoneRequest;

  getPhone(): string;
  setPhone(value: string): UpdatePhoneRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePhoneRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePhoneRequest): UpdatePhoneRequest.AsObject;
  static serializeBinaryToWriter(message: UpdatePhoneRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePhoneRequest;
  static deserializeBinaryFromReader(message: UpdatePhoneRequest, reader: jspb.BinaryReader): UpdatePhoneRequest;
}

export namespace UpdatePhoneRequest {
  export type AsObject = {
    userId: string;
    phone: string;
  };
}

export class UpdateUserRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateUserRequest;

  getEmail(): string;
  setEmail(value: string): UpdateUserRequest;

  getFirstName(): string;
  setFirstName(value: string): UpdateUserRequest;

  getLastName(): string;
  setLastName(value: string): UpdateUserRequest;

  getPhone(): string;
  setPhone(value: string): UpdateUserRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateUserRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateUserRequest): UpdateUserRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateUserRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateUserRequest;
  static deserializeBinaryFromReader(message: UpdateUserRequest, reader: jspb.BinaryReader): UpdateUserRequest;
}

export namespace UpdateUserRequest {
  export type AsObject = {
    userId: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
}

export class UpdatePhoneResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): UpdatePhoneResponse;

  getVerification(): VerificationInfo | undefined;
  setVerification(value?: VerificationInfo): UpdatePhoneResponse;
  hasVerification(): boolean;
  clearVerification(): UpdatePhoneResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePhoneResponse.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePhoneResponse): UpdatePhoneResponse.AsObject;
  static serializeBinaryToWriter(message: UpdatePhoneResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePhoneResponse;
  static deserializeBinaryFromReader(message: UpdatePhoneResponse, reader: jspb.BinaryReader): UpdatePhoneResponse;
}

export namespace UpdatePhoneResponse {
  export type AsObject = {
    message: string;
    verification?: VerificationInfo.AsObject;
  };
}

export class SendOTPRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SendOTPRequest;

  getVerificationType(): string;
  setVerificationType(value: string): SendOTPRequest;

  getTarget(): string;
  setTarget(value: string): SendOTPRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SendOTPRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SendOTPRequest): SendOTPRequest.AsObject;
  static serializeBinaryToWriter(message: SendOTPRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SendOTPRequest;
  static deserializeBinaryFromReader(message: SendOTPRequest, reader: jspb.BinaryReader): SendOTPRequest;
}

export namespace SendOTPRequest {
  export type AsObject = {
    userId: string;
    verificationType: string;
    target: string;
  };
}

export class VerifyOTPRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): VerifyOTPRequest;

  getVerificationType(): string;
  setVerificationType(value: string): VerifyOTPRequest;

  getOtp(): string;
  setOtp(value: string): VerifyOTPRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyOTPRequest.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyOTPRequest): VerifyOTPRequest.AsObject;
  static serializeBinaryToWriter(message: VerifyOTPRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyOTPRequest;
  static deserializeBinaryFromReader(message: VerifyOTPRequest, reader: jspb.BinaryReader): VerifyOTPRequest;
}

export namespace VerifyOTPRequest {
  export type AsObject = {
    userId: string;
    verificationType: string;
    otp: string;
  };
}

export class VerifyOTPResponse extends jspb.Message {
  getUser(): User | undefined;
  setUser(value?: User): VerifyOTPResponse;
  hasUser(): boolean;
  clearUser(): VerifyOTPResponse;

  getToken(): string;
  setToken(value: string): VerifyOTPResponse;

  getRefreshToken(): string;
  setRefreshToken(value: string): VerifyOTPResponse;

  getVerification(): VerificationInfo | undefined;
  setVerification(value?: VerificationInfo): VerifyOTPResponse;
  hasVerification(): boolean;
  clearVerification(): VerifyOTPResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VerifyOTPResponse.AsObject;
  static toObject(includeInstance: boolean, msg: VerifyOTPResponse): VerifyOTPResponse.AsObject;
  static serializeBinaryToWriter(message: VerifyOTPResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VerifyOTPResponse;
  static deserializeBinaryFromReader(message: VerifyOTPResponse, reader: jspb.BinaryReader): VerifyOTPResponse;
}

export namespace VerifyOTPResponse {
  export type AsObject = {
    user?: User.AsObject;
    token: string;
    refreshToken: string;
    verification?: VerificationInfo.AsObject;
  };
}

export class ResendOTPRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ResendOTPRequest;

  getVerificationType(): string;
  setVerificationType(value: string): ResendOTPRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResendOTPRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ResendOTPRequest): ResendOTPRequest.AsObject;
  static serializeBinaryToWriter(message: ResendOTPRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResendOTPRequest;
  static deserializeBinaryFromReader(message: ResendOTPRequest, reader: jspb.BinaryReader): ResendOTPRequest;
}

export namespace ResendOTPRequest {
  export type AsObject = {
    userId: string;
    verificationType: string;
  };
}

export class ResendOTPResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): ResendOTPResponse;

  getVerification(): VerificationInfo | undefined;
  setVerification(value?: VerificationInfo): ResendOTPResponse;
  hasVerification(): boolean;
  clearVerification(): ResendOTPResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ResendOTPResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ResendOTPResponse): ResendOTPResponse.AsObject;
  static serializeBinaryToWriter(message: ResendOTPResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ResendOTPResponse;
  static deserializeBinaryFromReader(message: ResendOTPResponse, reader: jspb.BinaryReader): ResendOTPResponse;
}

export namespace ResendOTPResponse {
  export type AsObject = {
    message: string;
    verification?: VerificationInfo.AsObject;
  };
}

export class CheckVerificationStatusRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CheckVerificationStatusRequest;

  getVerificationType(): string;
  setVerificationType(value: string): CheckVerificationStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckVerificationStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CheckVerificationStatusRequest): CheckVerificationStatusRequest.AsObject;
  static serializeBinaryToWriter(message: CheckVerificationStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckVerificationStatusRequest;
  static deserializeBinaryFromReader(message: CheckVerificationStatusRequest, reader: jspb.BinaryReader): CheckVerificationStatusRequest;
}

export namespace CheckVerificationStatusRequest {
  export type AsObject = {
    userId: string;
    verificationType: string;
  };
}

export class CheckVerificationStatusResponse extends jspb.Message {
  getIsVerified(): boolean;
  setIsVerified(value: boolean): CheckVerificationStatusResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CheckVerificationStatusResponse.AsObject;
  static toObject(includeInstance: boolean, msg: CheckVerificationStatusResponse): CheckVerificationStatusResponse.AsObject;
  static serializeBinaryToWriter(message: CheckVerificationStatusResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CheckVerificationStatusResponse;
  static deserializeBinaryFromReader(message: CheckVerificationStatusResponse, reader: jspb.BinaryReader): CheckVerificationStatusResponse;
}

export namespace CheckVerificationStatusResponse {
  export type AsObject = {
    isVerified: boolean;
  };
}

export class GetVerificationStatusRequest extends jspb.Message {
  getVerificationId(): string;
  setVerificationId(value: string): GetVerificationStatusRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetVerificationStatusRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetVerificationStatusRequest): GetVerificationStatusRequest.AsObject;
  static serializeBinaryToWriter(message: GetVerificationStatusRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetVerificationStatusRequest;
  static deserializeBinaryFromReader(message: GetVerificationStatusRequest, reader: jspb.BinaryReader): GetVerificationStatusRequest;
}

export namespace GetVerificationStatusRequest {
  export type AsObject = {
    verificationId: string;
  };
}

export class ListPendingVerificationsResponse extends jspb.Message {
  getVerificationsList(): Array<VerificationInfo>;
  setVerificationsList(value: Array<VerificationInfo>): ListPendingVerificationsResponse;
  clearVerificationsList(): ListPendingVerificationsResponse;
  addVerifications(value?: VerificationInfo, index?: number): VerificationInfo;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListPendingVerificationsResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ListPendingVerificationsResponse): ListPendingVerificationsResponse.AsObject;
  static serializeBinaryToWriter(message: ListPendingVerificationsResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListPendingVerificationsResponse;
  static deserializeBinaryFromReader(message: ListPendingVerificationsResponse, reader: jspb.BinaryReader): ListPendingVerificationsResponse;
}

export namespace ListPendingVerificationsResponse {
  export type AsObject = {
    verificationsList: Array<VerificationInfo.AsObject>;
  };
}

export class ApproveVerificationRequest extends jspb.Message {
  getVerificationId(): string;
  setVerificationId(value: string): ApproveVerificationRequest;

  getBureauId(): string;
  setBureauId(value: string): ApproveVerificationRequest;

  getNotes(): string;
  setNotes(value: string): ApproveVerificationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApproveVerificationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ApproveVerificationRequest): ApproveVerificationRequest.AsObject;
  static serializeBinaryToWriter(message: ApproveVerificationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApproveVerificationRequest;
  static deserializeBinaryFromReader(message: ApproveVerificationRequest, reader: jspb.BinaryReader): ApproveVerificationRequest;
}

export namespace ApproveVerificationRequest {
  export type AsObject = {
    verificationId: string;
    bureauId: string;
    notes: string;
  };
}

export class RejectVerificationRequest extends jspb.Message {
  getVerificationId(): string;
  setVerificationId(value: string): RejectVerificationRequest;

  getBureauId(): string;
  setBureauId(value: string): RejectVerificationRequest;

  getReason(): string;
  setReason(value: string): RejectVerificationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RejectVerificationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RejectVerificationRequest): RejectVerificationRequest.AsObject;
  static serializeBinaryToWriter(message: RejectVerificationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RejectVerificationRequest;
  static deserializeBinaryFromReader(message: RejectVerificationRequest, reader: jspb.BinaryReader): RejectVerificationRequest;
}

export namespace RejectVerificationRequest {
  export type AsObject = {
    verificationId: string;
    bureauId: string;
    reason: string;
  };
}

export class CreateBureauRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateBureauRequest;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateBureauRequest;
  hasData(): boolean;
  clearData(): CreateBureauRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateBureauRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CreateBureauRequest): CreateBureauRequest.AsObject;
  static serializeBinaryToWriter(message: CreateBureauRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateBureauRequest;
  static deserializeBinaryFromReader(message: CreateBureauRequest, reader: jspb.BinaryReader): CreateBureauRequest;
}

export namespace CreateBureauRequest {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateBureauRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateBureauRequest;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateBureauRequest;
  hasData(): boolean;
  clearData(): UpdateBureauRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateBureauRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateBureauRequest): UpdateBureauRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateBureauRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateBureauRequest;
  static deserializeBinaryFromReader(message: UpdateBureauRequest, reader: jspb.BinaryReader): UpdateBureauRequest;
}

export namespace UpdateBureauRequest {
  export type AsObject = {
    id: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class BureauResponse extends jspb.Message {
  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): BureauResponse;
  hasData(): boolean;
  clearData(): BureauResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BureauResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BureauResponse): BureauResponse.AsObject;
  static serializeBinaryToWriter(message: BureauResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BureauResponse;
  static deserializeBinaryFromReader(message: BureauResponse, reader: jspb.BinaryReader): BureauResponse;
}

export namespace BureauResponse {
  export type AsObject = {
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class BureauListResponse extends jspb.Message {
  getBureausList(): Array<google_protobuf_struct_pb.Struct>;
  setBureausList(value: Array<google_protobuf_struct_pb.Struct>): BureauListResponse;
  clearBureausList(): BureauListResponse;
  addBureaus(value?: google_protobuf_struct_pb.Struct, index?: number): google_protobuf_struct_pb.Struct;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): BureauListResponse.AsObject;
  static toObject(includeInstance: boolean, msg: BureauListResponse): BureauListResponse.AsObject;
  static serializeBinaryToWriter(message: BureauListResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): BureauListResponse;
  static deserializeBinaryFromReader(message: BureauListResponse, reader: jspb.BinaryReader): BureauListResponse;
}

export namespace BureauListResponse {
  export type AsObject = {
    bureausList: Array<google_protobuf_struct_pb.Struct.AsObject>;
  };
}

export class UpdateProfileRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateProfileRequest;

  getProfileType(): string;
  setProfileType(value: string): UpdateProfileRequest;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateProfileRequest;
  hasData(): boolean;
  clearData(): UpdateProfileRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateProfileRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateProfileRequest): UpdateProfileRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateProfileRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateProfileRequest;
  static deserializeBinaryFromReader(message: UpdateProfileRequest, reader: jspb.BinaryReader): UpdateProfileRequest;
}

export namespace UpdateProfileRequest {
  export type AsObject = {
    userId: string;
    profileType: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetByBureauRequest extends jspb.Message {
  getBureauId(): string;
  setBureauId(value: string): GetByBureauRequest;

  getLimit(): number;
  setLimit(value: number): GetByBureauRequest;

  getOffset(): number;
  setOffset(value: number): GetByBureauRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetByBureauRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetByBureauRequest): GetByBureauRequest.AsObject;
  static serializeBinaryToWriter(message: GetByBureauRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetByBureauRequest;
  static deserializeBinaryFromReader(message: GetByBureauRequest, reader: jspb.BinaryReader): GetByBureauRequest;
}

export namespace GetByBureauRequest {
  export type AsObject = {
    bureauId: string;
    limit: number;
    offset: number;
  };
}

export class UpdateProfileFieldRequest extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateProfileFieldRequest;

  getUserId(): string;
  setUserId(value: string): UpdateProfileFieldRequest;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateProfileFieldRequest;
  hasData(): boolean;
  clearData(): UpdateProfileFieldRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateProfileFieldRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateProfileFieldRequest): UpdateProfileFieldRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateProfileFieldRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateProfileFieldRequest;
  static deserializeBinaryFromReader(message: UpdateProfileFieldRequest, reader: jspb.BinaryReader): UpdateProfileFieldRequest;
}

export namespace UpdateProfileFieldRequest {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateHousehelpFieldsRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateHousehelpFieldsRequest;

  getProfileType(): string;
  setProfileType(value: string): UpdateHousehelpFieldsRequest;

  getUpdates(): google_protobuf_struct_pb.Struct | undefined;
  setUpdates(value?: google_protobuf_struct_pb.Struct): UpdateHousehelpFieldsRequest;
  hasUpdates(): boolean;
  clearUpdates(): UpdateHousehelpFieldsRequest;

  getStepMetadata(): google_protobuf_struct_pb.Struct | undefined;
  setStepMetadata(value?: google_protobuf_struct_pb.Struct): UpdateHousehelpFieldsRequest;
  hasStepMetadata(): boolean;
  clearStepMetadata(): UpdateHousehelpFieldsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateHousehelpFieldsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateHousehelpFieldsRequest): UpdateHousehelpFieldsRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateHousehelpFieldsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateHousehelpFieldsRequest;
  static deserializeBinaryFromReader(message: UpdateHousehelpFieldsRequest, reader: jspb.BinaryReader): UpdateHousehelpFieldsRequest;
}

export namespace UpdateHousehelpFieldsRequest {
  export type AsObject = {
    userId: string;
    profileType: string;
    updates?: google_protobuf_struct_pb.Struct.AsObject;
    stepMetadata?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class SaveUserLocationRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SaveUserLocationRequest;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): SaveUserLocationRequest;
  hasData(): boolean;
  clearData(): SaveUserLocationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SaveUserLocationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SaveUserLocationRequest): SaveUserLocationRequest.AsObject;
  static serializeBinaryToWriter(message: SaveUserLocationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SaveUserLocationRequest;
  static deserializeBinaryFromReader(message: SaveUserLocationRequest, reader: jspb.BinaryReader): SaveUserLocationRequest;
}

export namespace SaveUserLocationRequest {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class GetProfileDocumentsRequest extends jspb.Message {
  getProfileId(): string;
  setProfileId(value: string): GetProfileDocumentsRequest;

  getUserId(): string;
  setUserId(value: string): GetProfileDocumentsRequest;

  getDocumentType(): string;
  setDocumentType(value: string): GetProfileDocumentsRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProfileDocumentsRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetProfileDocumentsRequest): GetProfileDocumentsRequest.AsObject;
  static serializeBinaryToWriter(message: GetProfileDocumentsRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProfileDocumentsRequest;
  static deserializeBinaryFromReader(message: GetProfileDocumentsRequest, reader: jspb.BinaryReader): GetProfileDocumentsRequest;
}

export namespace GetProfileDocumentsRequest {
  export type AsObject = {
    profileId: string;
    userId: string;
    documentType: string;
  };
}

export class CreateHireRequestReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateHireRequestReq;

  getProfileType(): string;
  setProfileType(value: string): CreateHireRequestReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateHireRequestReq;
  hasData(): boolean;
  clearData(): CreateHireRequestReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateHireRequestReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateHireRequestReq): CreateHireRequestReq.AsObject;
  static serializeBinaryToWriter(message: CreateHireRequestReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateHireRequestReq;
  static deserializeBinaryFromReader(message: CreateHireRequestReq, reader: jspb.BinaryReader): CreateHireRequestReq;
}

export namespace CreateHireRequestReq {
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

export class UpdateHireRequestReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateHireRequestReq;

  getUserId(): string;
  setUserId(value: string): UpdateHireRequestReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateHireRequestReq;
  hasData(): boolean;
  clearData(): UpdateHireRequestReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateHireRequestReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateHireRequestReq): UpdateHireRequestReq.AsObject;
  static serializeBinaryToWriter(message: UpdateHireRequestReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateHireRequestReq;
  static deserializeBinaryFromReader(message: UpdateHireRequestReq, reader: jspb.BinaryReader): UpdateHireRequestReq;
}

export namespace UpdateHireRequestReq {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateContractReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateContractReq;

  getProfileType(): string;
  setProfileType(value: string): CreateContractReq;

  getHireRequestId(): string;
  setHireRequestId(value: string): CreateContractReq;

  getNotes(): string;
  setNotes(value: string): CreateContractReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateContractReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateContractReq): CreateContractReq.AsObject;
  static serializeBinaryToWriter(message: CreateContractReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateContractReq;
  static deserializeBinaryFromReader(message: CreateContractReq, reader: jspb.BinaryReader): CreateContractReq;
}

export namespace CreateContractReq {
  export type AsObject = {
    userId: string;
    profileType: string;
    hireRequestId: string;
    notes: string;
  };
}

export class ListHireContractsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListHireContractsReq;

  getProfileType(): string;
  setProfileType(value: string): ListHireContractsReq;

  getStatus(): string;
  setStatus(value: string): ListHireContractsReq;

  getLimit(): number;
  setLimit(value: number): ListHireContractsReq;

  getOffset(): number;
  setOffset(value: number): ListHireContractsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListHireContractsReq.AsObject;
  static toObject(includeInstance: boolean, msg: ListHireContractsReq): ListHireContractsReq.AsObject;
  static serializeBinaryToWriter(message: ListHireContractsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListHireContractsReq;
  static deserializeBinaryFromReader(message: ListHireContractsReq, reader: jspb.BinaryReader): ListHireContractsReq;
}

export namespace ListHireContractsReq {
  export type AsObject = {
    userId: string;
    profileType: string;
    status: string;
    limit: number;
    offset: number;
  };
}

export class AddNegotiationReq extends jspb.Message {
  getHireRequestId(): string;
  setHireRequestId(value: string): AddNegotiationReq;

  getUserId(): string;
  setUserId(value: string): AddNegotiationReq;

  getMessage(): string;
  setMessage(value: string): AddNegotiationReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddNegotiationReq.AsObject;
  static toObject(includeInstance: boolean, msg: AddNegotiationReq): AddNegotiationReq.AsObject;
  static serializeBinaryToWriter(message: AddNegotiationReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddNegotiationReq;
  static deserializeBinaryFromReader(message: AddNegotiationReq, reader: jspb.BinaryReader): AddNegotiationReq;
}

export namespace AddNegotiationReq {
  export type AsObject = {
    hireRequestId: string;
    userId: string;
    message: string;
  };
}

export class ListNegotiationsReq extends jspb.Message {
  getHireRequestId(): string;
  setHireRequestId(value: string): ListNegotiationsReq;

  getLimit(): number;
  setLimit(value: number): ListNegotiationsReq;

  getOffset(): number;
  setOffset(value: number): ListNegotiationsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListNegotiationsReq.AsObject;
  static toObject(includeInstance: boolean, msg: ListNegotiationsReq): ListNegotiationsReq.AsObject;
  static serializeBinaryToWriter(message: ListNegotiationsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListNegotiationsReq;
  static deserializeBinaryFromReader(message: ListNegotiationsReq, reader: jspb.BinaryReader): ListNegotiationsReq;
}

export namespace ListNegotiationsReq {
  export type AsObject = {
    hireRequestId: string;
    limit: number;
    offset: number;
  };
}

export class HireEmploymentReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): HireEmploymentReq;

  getHousehelpUserId(): string;
  setHousehelpUserId(value: string): HireEmploymentReq;

  getStartDate(): string;
  setStartDate(value: string): HireEmploymentReq;

  getEndDate(): string;
  setEndDate(value: string): HireEmploymentReq;

  getSalary(): number;
  setSalary(value: number): HireEmploymentReq;

  getNotes(): string;
  setNotes(value: string): HireEmploymentReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HireEmploymentReq.AsObject;
  static toObject(includeInstance: boolean, msg: HireEmploymentReq): HireEmploymentReq.AsObject;
  static serializeBinaryToWriter(message: HireEmploymentReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HireEmploymentReq;
  static deserializeBinaryFromReader(message: HireEmploymentReq, reader: jspb.BinaryReader): HireEmploymentReq;
}

export namespace HireEmploymentReq {
  export type AsObject = {
    userId: string;
    househelpUserId: string;
    startDate: string;
    endDate: string;
    salary: number;
    notes: string;
  };
}

export class TerminateEmploymentReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): TerminateEmploymentReq;

  getHousehelpUserId(): string;
  setHousehelpUserId(value: string): TerminateEmploymentReq;

  getReason(): string;
  setReason(value: string): TerminateEmploymentReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TerminateEmploymentReq.AsObject;
  static toObject(includeInstance: boolean, msg: TerminateEmploymentReq): TerminateEmploymentReq.AsObject;
  static serializeBinaryToWriter(message: TerminateEmploymentReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TerminateEmploymentReq;
  static deserializeBinaryFromReader(message: TerminateEmploymentReq, reader: jspb.BinaryReader): TerminateEmploymentReq;
}

export namespace TerminateEmploymentReq {
  export type AsObject = {
    userId: string;
    househelpUserId: string;
    reason: string;
  };
}

export class TransitionStatusReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): TransitionStatusReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): TransitionStatusReq;
  hasData(): boolean;
  clearData(): TransitionStatusReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransitionStatusReq.AsObject;
  static toObject(includeInstance: boolean, msg: TransitionStatusReq): TransitionStatusReq.AsObject;
  static serializeBinaryToWriter(message: TransitionStatusReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransitionStatusReq;
  static deserializeBinaryFromReader(message: TransitionStatusReq, reader: jspb.BinaryReader): TransitionStatusReq;
}

export namespace TransitionStatusReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateProfileStatusReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateProfileStatusReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateProfileStatusReq;
  hasData(): boolean;
  clearData(): CreateProfileStatusReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateProfileStatusReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateProfileStatusReq): CreateProfileStatusReq.AsObject;
  static serializeBinaryToWriter(message: CreateProfileStatusReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateProfileStatusReq;
  static deserializeBinaryFromReader(message: CreateProfileStatusReq, reader: jspb.BinaryReader): CreateProfileStatusReq;
}

export namespace CreateProfileStatusReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateProfileStatusReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateProfileStatusReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateProfileStatusReq;
  hasData(): boolean;
  clearData(): UpdateProfileStatusReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateProfileStatusReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateProfileStatusReq): UpdateProfileStatusReq.AsObject;
  static serializeBinaryToWriter(message: UpdateProfileStatusReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateProfileStatusReq;
  static deserializeBinaryFromReader(message: UpdateProfileStatusReq, reader: jspb.BinaryReader): UpdateProfileStatusReq;
}

export namespace UpdateProfileStatusReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateJobReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateJobReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateJobReq;
  hasData(): boolean;
  clearData(): CreateJobReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateJobReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateJobReq): CreateJobReq.AsObject;
  static serializeBinaryToWriter(message: CreateJobReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateJobReq;
  static deserializeBinaryFromReader(message: CreateJobReq, reader: jspb.BinaryReader): CreateJobReq;
}

export namespace CreateJobReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateJobReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateJobReq;

  getUserId(): string;
  setUserId(value: string): UpdateJobReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateJobReq;
  hasData(): boolean;
  clearData(): UpdateJobReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateJobReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateJobReq): UpdateJobReq.AsObject;
  static serializeBinaryToWriter(message: UpdateJobReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateJobReq;
  static deserializeBinaryFromReader(message: UpdateJobReq, reader: jspb.BinaryReader): UpdateJobReq;
}

export namespace UpdateJobReq {
  export type AsObject = {
    id: string;
    userId: string;
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

export class UpdateShortlistReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UpdateShortlistReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateShortlistReq;
  hasData(): boolean;
  clearData(): UpdateShortlistReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateShortlistReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateShortlistReq): UpdateShortlistReq.AsObject;
  static serializeBinaryToWriter(message: UpdateShortlistReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateShortlistReq;
  static deserializeBinaryFromReader(message: UpdateShortlistReq, reader: jspb.BinaryReader): UpdateShortlistReq;
}

export namespace UpdateShortlistReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class ShortlistExistsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ShortlistExistsReq;

  getProfileId(): string;
  setProfileId(value: string): ShortlistExistsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ShortlistExistsReq.AsObject;
  static toObject(includeInstance: boolean, msg: ShortlistExistsReq): ShortlistExistsReq.AsObject;
  static serializeBinaryToWriter(message: ShortlistExistsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ShortlistExistsReq;
  static deserializeBinaryFromReader(message: ShortlistExistsReq, reader: jspb.BinaryReader): ShortlistExistsReq;
}

export namespace ShortlistExistsReq {
  export type AsObject = {
    userId: string;
    profileId: string;
  };
}

export class CreateInterestReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateInterestReq;

  getProfileType(): string;
  setProfileType(value: string): CreateInterestReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateInterestReq;
  hasData(): boolean;
  clearData(): CreateInterestReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateInterestReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateInterestReq): CreateInterestReq.AsObject;
  static serializeBinaryToWriter(message: CreateInterestReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateInterestReq;
  static deserializeBinaryFromReader(message: CreateInterestReq, reader: jspb.BinaryReader): CreateInterestReq;
}

export namespace CreateInterestReq {
  export type AsObject = {
    userId: string;
    profileType: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class InterestExistsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): InterestExistsReq;

  getHouseholdId(): string;
  setHouseholdId(value: string): InterestExistsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): InterestExistsReq.AsObject;
  static toObject(includeInstance: boolean, msg: InterestExistsReq): InterestExistsReq.AsObject;
  static serializeBinaryToWriter(message: InterestExistsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): InterestExistsReq;
  static deserializeBinaryFromReader(message: InterestExistsReq, reader: jspb.BinaryReader): InterestExistsReq;
}

export namespace InterestExistsReq {
  export type AsObject = {
    userId: string;
    householdId: string;
  };
}

export class CreateReviewReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateReviewReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateReviewReq;
  hasData(): boolean;
  clearData(): CreateReviewReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateReviewReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateReviewReq): CreateReviewReq.AsObject;
  static serializeBinaryToWriter(message: CreateReviewReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateReviewReq;
  static deserializeBinaryFromReader(message: CreateReviewReq, reader: jspb.BinaryReader): CreateReviewReq;
}

export namespace CreateReviewReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateLocationReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateLocationReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateLocationReq;
  hasData(): boolean;
  clearData(): CreateLocationReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateLocationReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateLocationReq): CreateLocationReq.AsObject;
  static serializeBinaryToWriter(message: CreateLocationReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateLocationReq;
  static deserializeBinaryFromReader(message: CreateLocationReq, reader: jspb.BinaryReader): CreateLocationReq;
}

export namespace CreateLocationReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class LocationQueryReq extends jspb.Message {
  getQuery(): string;
  setQuery(value: string): LocationQueryReq;

  getUserId(): string;
  setUserId(value: string): LocationQueryReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LocationQueryReq.AsObject;
  static toObject(includeInstance: boolean, msg: LocationQueryReq): LocationQueryReq.AsObject;
  static serializeBinaryToWriter(message: LocationQueryReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LocationQueryReq;
  static deserializeBinaryFromReader(message: LocationQueryReq, reader: jspb.BinaryReader): LocationQueryReq;
}

export namespace LocationQueryReq {
  export type AsObject = {
    query: string;
    userId: string;
  };
}

export class UpdateLocationReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateLocationReq;

  getUserId(): string;
  setUserId(value: string): UpdateLocationReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateLocationReq;
  hasData(): boolean;
  clearData(): UpdateLocationReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateLocationReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateLocationReq): UpdateLocationReq.AsObject;
  static serializeBinaryToWriter(message: UpdateLocationReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateLocationReq;
  static deserializeBinaryFromReader(message: UpdateLocationReq, reader: jspb.BinaryReader): UpdateLocationReq;
}

export namespace UpdateLocationReq {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UploadImagesReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UploadImagesReq;

  getImagesList(): Array<Uint8Array | string>;
  setImagesList(value: Array<Uint8Array | string>): UploadImagesReq;
  clearImagesList(): UploadImagesReq;
  addImages(value: Uint8Array | string, index?: number): UploadImagesReq;

  getFilenamesList(): Array<string>;
  setFilenamesList(value: Array<string>): UploadImagesReq;
  clearFilenamesList(): UploadImagesReq;
  addFilenames(value: string, index?: number): UploadImagesReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UploadImagesReq.AsObject;
  static toObject(includeInstance: boolean, msg: UploadImagesReq): UploadImagesReq.AsObject;
  static serializeBinaryToWriter(message: UploadImagesReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UploadImagesReq;
  static deserializeBinaryFromReader(message: UploadImagesReq, reader: jspb.BinaryReader): UploadImagesReq;
}

export namespace UploadImagesReq {
  export type AsObject = {
    userId: string;
    imagesList: Array<Uint8Array | string>;
    filenamesList: Array<string>;
  };
}

export class UploadDocumentsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): UploadDocumentsReq;

  getFilesList(): Array<Uint8Array | string>;
  setFilesList(value: Array<Uint8Array | string>): UploadDocumentsReq;
  clearFilesList(): UploadDocumentsReq;
  addFiles(value: Uint8Array | string, index?: number): UploadDocumentsReq;

  getFilenamesList(): Array<string>;
  setFilenamesList(value: Array<string>): UploadDocumentsReq;
  clearFilenamesList(): UploadDocumentsReq;
  addFilenames(value: string, index?: number): UploadDocumentsReq;

  getDocumentType(): string;
  setDocumentType(value: string): UploadDocumentsReq;

  getDescription(): string;
  setDescription(value: string): UploadDocumentsReq;

  getTagsList(): Array<string>;
  setTagsList(value: Array<string>): UploadDocumentsReq;
  clearTagsList(): UploadDocumentsReq;
  addTags(value: string, index?: number): UploadDocumentsReq;

  getIsPublic(): boolean;
  setIsPublic(value: boolean): UploadDocumentsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UploadDocumentsReq.AsObject;
  static toObject(includeInstance: boolean, msg: UploadDocumentsReq): UploadDocumentsReq.AsObject;
  static serializeBinaryToWriter(message: UploadDocumentsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UploadDocumentsReq;
  static deserializeBinaryFromReader(message: UploadDocumentsReq, reader: jspb.BinaryReader): UploadDocumentsReq;
}

export namespace UploadDocumentsReq {
  export type AsObject = {
    userId: string;
    filesList: Array<Uint8Array | string>;
    filenamesList: Array<string>;
    documentType: string;
    description: string;
    tagsList: Array<string>;
    isPublic: boolean;
  };
}

export class GetUserDocumentsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetUserDocumentsReq;

  getDocumentType(): string;
  setDocumentType(value: string): GetUserDocumentsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserDocumentsReq.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserDocumentsReq): GetUserDocumentsReq.AsObject;
  static serializeBinaryToWriter(message: GetUserDocumentsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserDocumentsReq;
  static deserializeBinaryFromReader(message: GetUserDocumentsReq, reader: jspb.BinaryReader): GetUserDocumentsReq;
}

export namespace GetUserDocumentsReq {
  export type AsObject = {
    userId: string;
    documentType: string;
  };
}

export class UpdateDocumentReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateDocumentReq;

  getUserId(): string;
  setUserId(value: string): UpdateDocumentReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateDocumentReq;
  hasData(): boolean;
  clearData(): UpdateDocumentReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDocumentReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDocumentReq): UpdateDocumentReq.AsObject;
  static serializeBinaryToWriter(message: UpdateDocumentReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDocumentReq;
  static deserializeBinaryFromReader(message: UpdateDocumentReq, reader: jspb.BinaryReader): UpdateDocumentReq;
}

export namespace UpdateDocumentReq {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreatePetReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreatePetReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreatePetReq;
  hasData(): boolean;
  clearData(): CreatePetReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreatePetReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreatePetReq): CreatePetReq.AsObject;
  static serializeBinaryToWriter(message: CreatePetReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreatePetReq;
  static deserializeBinaryFromReader(message: CreatePetReq, reader: jspb.BinaryReader): CreatePetReq;
}

export namespace CreatePetReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdatePetReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdatePetReq;

  getUserId(): string;
  setUserId(value: string): UpdatePetReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdatePetReq;
  hasData(): boolean;
  clearData(): UpdatePetReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdatePetReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdatePetReq): UpdatePetReq.AsObject;
  static serializeBinaryToWriter(message: UpdatePetReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdatePetReq;
  static deserializeBinaryFromReader(message: UpdatePetReq, reader: jspb.BinaryReader): UpdatePetReq;
}

export namespace UpdatePetReq {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateHouseholdKidReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): CreateHouseholdKidReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateHouseholdKidReq;
  hasData(): boolean;
  clearData(): CreateHouseholdKidReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateHouseholdKidReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateHouseholdKidReq): CreateHouseholdKidReq.AsObject;
  static serializeBinaryToWriter(message: CreateHouseholdKidReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateHouseholdKidReq;
  static deserializeBinaryFromReader(message: CreateHouseholdKidReq, reader: jspb.BinaryReader): CreateHouseholdKidReq;
}

export namespace CreateHouseholdKidReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class UpdateHouseholdKidReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateHouseholdKidReq;

  getUserId(): string;
  setUserId(value: string): UpdateHouseholdKidReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): UpdateHouseholdKidReq;
  hasData(): boolean;
  clearData(): UpdateHouseholdKidReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateHouseholdKidReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateHouseholdKidReq): UpdateHouseholdKidReq.AsObject;
  static serializeBinaryToWriter(message: UpdateHouseholdKidReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateHouseholdKidReq;
  static deserializeBinaryFromReader(message: UpdateHouseholdKidReq, reader: jspb.BinaryReader): UpdateHouseholdKidReq;
}

export namespace UpdateHouseholdKidReq {
  export type AsObject = {
    id: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class HouseholdPrefReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): HouseholdPrefReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): HouseholdPrefReq;
  hasData(): boolean;
  clearData(): HouseholdPrefReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HouseholdPrefReq.AsObject;
  static toObject(includeInstance: boolean, msg: HouseholdPrefReq): HouseholdPrefReq.AsObject;
  static serializeBinaryToWriter(message: HouseholdPrefReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HouseholdPrefReq;
  static deserializeBinaryFromReader(message: HouseholdPrefReq, reader: jspb.BinaryReader): HouseholdPrefReq;
}

export namespace HouseholdPrefReq {
  export type AsObject = {
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class CreateInvitationReq extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): CreateInvitationReq;

  getUserId(): string;
  setUserId(value: string): CreateInvitationReq;

  getData(): google_protobuf_struct_pb.Struct | undefined;
  setData(value?: google_protobuf_struct_pb.Struct): CreateInvitationReq;
  hasData(): boolean;
  clearData(): CreateInvitationReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CreateInvitationReq.AsObject;
  static toObject(includeInstance: boolean, msg: CreateInvitationReq): CreateInvitationReq.AsObject;
  static serializeBinaryToWriter(message: CreateInvitationReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CreateInvitationReq;
  static deserializeBinaryFromReader(message: CreateInvitationReq, reader: jspb.BinaryReader): CreateInvitationReq;
}

export namespace CreateInvitationReq {
  export type AsObject = {
    householdId: string;
    userId: string;
    data?: google_protobuf_struct_pb.Struct.AsObject;
  };
}

export class RevokeInvitationReq extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): RevokeInvitationReq;

  getInvitationId(): string;
  setInvitationId(value: string): RevokeInvitationReq;

  getUserId(): string;
  setUserId(value: string): RevokeInvitationReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeInvitationReq.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeInvitationReq): RevokeInvitationReq.AsObject;
  static serializeBinaryToWriter(message: RevokeInvitationReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeInvitationReq;
  static deserializeBinaryFromReader(message: RevokeInvitationReq, reader: jspb.BinaryReader): RevokeInvitationReq;
}

export namespace RevokeInvitationReq {
  export type AsObject = {
    householdId: string;
    invitationId: string;
    userId: string;
  };
}

export class JoinHouseholdReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): JoinHouseholdReq;

  getInviteCode(): string;
  setInviteCode(value: string): JoinHouseholdReq;

  getMessage(): string;
  setMessage(value: string): JoinHouseholdReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): JoinHouseholdReq.AsObject;
  static toObject(includeInstance: boolean, msg: JoinHouseholdReq): JoinHouseholdReq.AsObject;
  static serializeBinaryToWriter(message: JoinHouseholdReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): JoinHouseholdReq;
  static deserializeBinaryFromReader(message: JoinHouseholdReq, reader: jspb.BinaryReader): JoinHouseholdReq;
}

export namespace JoinHouseholdReq {
  export type AsObject = {
    userId: string;
    inviteCode: string;
    message: string;
  };
}

export class ApproveRejectReq extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): ApproveRejectReq;

  getRequestId(): string;
  setRequestId(value: string): ApproveRejectReq;

  getUserId(): string;
  setUserId(value: string): ApproveRejectReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ApproveRejectReq.AsObject;
  static toObject(includeInstance: boolean, msg: ApproveRejectReq): ApproveRejectReq.AsObject;
  static serializeBinaryToWriter(message: ApproveRejectReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ApproveRejectReq;
  static deserializeBinaryFromReader(message: ApproveRejectReq, reader: jspb.BinaryReader): ApproveRejectReq;
}

export namespace ApproveRejectReq {
  export type AsObject = {
    householdId: string;
    requestId: string;
    userId: string;
  };
}

export class UpdateMemberRoleReq extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): UpdateMemberRoleReq;

  getMemberUserId(): string;
  setMemberUserId(value: string): UpdateMemberRoleReq;

  getRole(): string;
  setRole(value: string): UpdateMemberRoleReq;

  getUserId(): string;
  setUserId(value: string): UpdateMemberRoleReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateMemberRoleReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateMemberRoleReq): UpdateMemberRoleReq.AsObject;
  static serializeBinaryToWriter(message: UpdateMemberRoleReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateMemberRoleReq;
  static deserializeBinaryFromReader(message: UpdateMemberRoleReq, reader: jspb.BinaryReader): UpdateMemberRoleReq;
}

export namespace UpdateMemberRoleReq {
  export type AsObject = {
    householdId: string;
    memberUserId: string;
    role: string;
    userId: string;
  };
}

export class RemoveMemberReq extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): RemoveMemberReq;

  getMemberUserId(): string;
  setMemberUserId(value: string): RemoveMemberReq;

  getUserId(): string;
  setUserId(value: string): RemoveMemberReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveMemberReq.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveMemberReq): RemoveMemberReq.AsObject;
  static serializeBinaryToWriter(message: RemoveMemberReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveMemberReq;
  static deserializeBinaryFromReader(message: RemoveMemberReq, reader: jspb.BinaryReader): RemoveMemberReq;
}

export namespace RemoveMemberReq {
  export type AsObject = {
    householdId: string;
    memberUserId: string;
    userId: string;
  };
}

export class TransferOwnershipReq extends jspb.Message {
  getHouseholdId(): string;
  setHouseholdId(value: string): TransferOwnershipReq;

  getNewOwnerUserId(): string;
  setNewOwnerUserId(value: string): TransferOwnershipReq;

  getUserId(): string;
  setUserId(value: string): TransferOwnershipReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TransferOwnershipReq.AsObject;
  static toObject(includeInstance: boolean, msg: TransferOwnershipReq): TransferOwnershipReq.AsObject;
  static serializeBinaryToWriter(message: TransferOwnershipReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TransferOwnershipReq;
  static deserializeBinaryFromReader(message: TransferOwnershipReq, reader: jspb.BinaryReader): TransferOwnershipReq;
}

export namespace TransferOwnershipReq {
  export type AsObject = {
    householdId: string;
    newOwnerUserId: string;
    userId: string;
  };
}

export class RecordViewReq extends jspb.Message {
  getProfileId(): string;
  setProfileId(value: string): RecordViewReq;

  getProfileType(): string;
  setProfileType(value: string): RecordViewReq;

  getViewerUserId(): string;
  setViewerUserId(value: string): RecordViewReq;

  getViewerIp(): string;
  setViewerIp(value: string): RecordViewReq;

  getViewerDeviceId(): string;
  setViewerDeviceId(value: string): RecordViewReq;

  getUserAgent(): string;
  setUserAgent(value: string): RecordViewReq;

  getSessionId(): string;
  setSessionId(value: string): RecordViewReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecordViewReq.AsObject;
  static toObject(includeInstance: boolean, msg: RecordViewReq): RecordViewReq.AsObject;
  static serializeBinaryToWriter(message: RecordViewReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecordViewReq;
  static deserializeBinaryFromReader(message: RecordViewReq, reader: jspb.BinaryReader): RecordViewReq;
}

export namespace RecordViewReq {
  export type AsObject = {
    profileId: string;
    profileType: string;
    viewerUserId: string;
    viewerIp: string;
    viewerDeviceId: string;
    userAgent: string;
    sessionId: string;
  };
}

export class RecordViewResponse extends jspb.Message {
  getViewId(): string;
  setViewId(value: string): RecordViewResponse;

  getIsUnique(): boolean;
  setIsUnique(value: boolean): RecordViewResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RecordViewResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RecordViewResponse): RecordViewResponse.AsObject;
  static serializeBinaryToWriter(message: RecordViewResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RecordViewResponse;
  static deserializeBinaryFromReader(message: RecordViewResponse, reader: jspb.BinaryReader): RecordViewResponse;
}

export namespace RecordViewResponse {
  export type AsObject = {
    viewId: string;
    isUnique: boolean;
  };
}

export class GetAnalyticsReq extends jspb.Message {
  getProfileId(): string;
  setProfileId(value: string): GetAnalyticsReq;

  getProfileType(): string;
  setProfileType(value: string): GetAnalyticsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetAnalyticsReq.AsObject;
  static toObject(includeInstance: boolean, msg: GetAnalyticsReq): GetAnalyticsReq.AsObject;
  static serializeBinaryToWriter(message: GetAnalyticsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetAnalyticsReq;
  static deserializeBinaryFromReader(message: GetAnalyticsReq, reader: jspb.BinaryReader): GetAnalyticsReq;
}

export namespace GetAnalyticsReq {
  export type AsObject = {
    profileId: string;
    profileType: string;
  };
}

export class UpdateViewDurationReq extends jspb.Message {
  getViewId(): string;
  setViewId(value: string): UpdateViewDurationReq;

  getDuration(): number;
  setDuration(value: number): UpdateViewDurationReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateViewDurationReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateViewDurationReq): UpdateViewDurationReq.AsObject;
  static serializeBinaryToWriter(message: UpdateViewDurationReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateViewDurationReq;
  static deserializeBinaryFromReader(message: UpdateViewDurationReq, reader: jspb.BinaryReader): UpdateViewDurationReq;
}

export namespace UpdateViewDurationReq {
  export type AsObject = {
    viewId: string;
    duration: number;
  };
}

export class GetProfileViewsReq extends jspb.Message {
  getProfileId(): string;
  setProfileId(value: string): GetProfileViewsReq;

  getLimit(): number;
  setLimit(value: number): GetProfileViewsReq;

  getOffset(): number;
  setOffset(value: number): GetProfileViewsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetProfileViewsReq.AsObject;
  static toObject(includeInstance: boolean, msg: GetProfileViewsReq): GetProfileViewsReq.AsObject;
  static serializeBinaryToWriter(message: GetProfileViewsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetProfileViewsReq;
  static deserializeBinaryFromReader(message: GetProfileViewsReq, reader: jspb.BinaryReader): GetProfileViewsReq;
}

export namespace GetProfileViewsReq {
  export type AsObject = {
    profileId: string;
    limit: number;
    offset: number;
  };
}

export class PreferencesReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): PreferencesReq;

  getSessionId(): string;
  setSessionId(value: string): PreferencesReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PreferencesReq.AsObject;
  static toObject(includeInstance: boolean, msg: PreferencesReq): PreferencesReq.AsObject;
  static serializeBinaryToWriter(message: PreferencesReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PreferencesReq;
  static deserializeBinaryFromReader(message: PreferencesReq, reader: jspb.BinaryReader): PreferencesReq;
}

export namespace PreferencesReq {
  export type AsObject = {
    userId: string;
    sessionId: string;
  };
}

export class MigratePrefsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): MigratePrefsReq;

  getSessionId(): string;
  setSessionId(value: string): MigratePrefsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MigratePrefsReq.AsObject;
  static toObject(includeInstance: boolean, msg: MigratePrefsReq): MigratePrefsReq.AsObject;
  static serializeBinaryToWriter(message: MigratePrefsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MigratePrefsReq;
  static deserializeBinaryFromReader(message: MigratePrefsReq, reader: jspb.BinaryReader): MigratePrefsReq;
}

export namespace MigratePrefsReq {
  export type AsObject = {
    userId: string;
    sessionId: string;
  };
}

export class UpdateKYCStatusReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateKYCStatusReq;

  getUserId(): string;
  setUserId(value: string): UpdateKYCStatusReq;

  getStatus(): string;
  setStatus(value: string): UpdateKYCStatusReq;

  getReason(): string;
  setReason(value: string): UpdateKYCStatusReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateKYCStatusReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateKYCStatusReq): UpdateKYCStatusReq.AsObject;
  static serializeBinaryToWriter(message: UpdateKYCStatusReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateKYCStatusReq;
  static deserializeBinaryFromReader(message: UpdateKYCStatusReq, reader: jspb.BinaryReader): UpdateKYCStatusReq;
}

export namespace UpdateKYCStatusReq {
  export type AsObject = {
    id: string;
    userId: string;
    status: string;
    reason: string;
  };
}

export class ListEmploymentContractsReq extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): ListEmploymentContractsReq;

  getStatus(): string;
  setStatus(value: string): ListEmploymentContractsReq;

  getLimit(): number;
  setLimit(value: number): ListEmploymentContractsReq;

  getOffset(): number;
  setOffset(value: number): ListEmploymentContractsReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ListEmploymentContractsReq.AsObject;
  static toObject(includeInstance: boolean, msg: ListEmploymentContractsReq): ListEmploymentContractsReq.AsObject;
  static serializeBinaryToWriter(message: ListEmploymentContractsReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ListEmploymentContractsReq;
  static deserializeBinaryFromReader(message: ListEmploymentContractsReq, reader: jspb.BinaryReader): ListEmploymentContractsReq;
}

export namespace ListEmploymentContractsReq {
  export type AsObject = {
    userId: string;
    status: string;
    limit: number;
    offset: number;
  };
}

export class SignContractReq extends jspb.Message {
  getId(): string;
  setId(value: string): SignContractReq;

  getUserId(): string;
  setUserId(value: string): SignContractReq;

  getSignature(): string;
  setSignature(value: string): SignContractReq;

  getSignerName(): string;
  setSignerName(value: string): SignContractReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SignContractReq.AsObject;
  static toObject(includeInstance: boolean, msg: SignContractReq): SignContractReq.AsObject;
  static serializeBinaryToWriter(message: SignContractReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SignContractReq;
  static deserializeBinaryFromReader(message: SignContractReq, reader: jspb.BinaryReader): SignContractReq;
}

export namespace SignContractReq {
  export type AsObject = {
    id: string;
    userId: string;
    signature: string;
    signerName: string;
  };
}

export class UpdateStatusReq extends jspb.Message {
  getId(): string;
  setId(value: string): UpdateStatusReq;

  getStatus(): string;
  setStatus(value: string): UpdateStatusReq;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateStatusReq.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateStatusReq): UpdateStatusReq.AsObject;
  static serializeBinaryToWriter(message: UpdateStatusReq, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateStatusReq;
  static deserializeBinaryFromReader(message: UpdateStatusReq, reader: jspb.BinaryReader): UpdateStatusReq;
}

export namespace UpdateStatusReq {
  export type AsObject = {
    id: string;
    status: string;
  };
}

export class SalaryFrequencyRequest extends jspb.Message {
  getFrequency(): string;
  setFrequency(value: string): SalaryFrequencyRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SalaryFrequencyRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SalaryFrequencyRequest): SalaryFrequencyRequest.AsObject;
  static serializeBinaryToWriter(message: SalaryFrequencyRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SalaryFrequencyRequest;
  static deserializeBinaryFromReader(message: SalaryFrequencyRequest, reader: jspb.BinaryReader): SalaryFrequencyRequest;
}

export namespace SalaryFrequencyRequest {
  export type AsObject = {
    frequency: string;
  };
}

export class ProfileTypeRequest extends jspb.Message {
  getProfileType(): string;
  setProfileType(value: string): ProfileTypeRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ProfileTypeRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ProfileTypeRequest): ProfileTypeRequest.AsObject;
  static serializeBinaryToWriter(message: ProfileTypeRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ProfileTypeRequest;
  static deserializeBinaryFromReader(message: ProfileTypeRequest, reader: jspb.BinaryReader): ProfileTypeRequest;
}

export namespace ProfileTypeRequest {
  export type AsObject = {
    profileType: string;
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

