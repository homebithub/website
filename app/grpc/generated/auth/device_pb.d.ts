import * as jspb from 'google-protobuf'

import * as google_protobuf_timestamp_pb from 'google-protobuf/google/protobuf/timestamp_pb'; // proto import: "google/protobuf/timestamp.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class Device extends jspb.Message {
  getId(): string;
  setId(value: string): Device;

  getUserId(): string;
  setUserId(value: string): Device;

  getDeviceId(): string;
  setDeviceId(value: string): Device;

  getDeviceName(): string;
  setDeviceName(value: string): Device;

  getDeviceType(): string;
  setDeviceType(value: string): Device;

  getStatus(): string;
  setStatus(value: string): Device;

  getUserAgent(): string;
  setUserAgent(value: string): Device;

  getBrowser(): string;
  setBrowser(value: string): Device;

  getBrowserVersion(): string;
  setBrowserVersion(value: string): Device;

  getOs(): string;
  setOs(value: string): Device;

  getOsVersion(): string;
  setOsVersion(value: string): Device;

  getPlatform(): string;
  setPlatform(value: string): Device;

  getIpAddress(): string;
  setIpAddress(value: string): Device;

  getCountry(): string;
  setCountry(value: string): Device;

  getCity(): string;
  setCity(value: string): Device;

  getRegion(): string;
  setRegion(value: string): Device;

  getTimezone(): string;
  setTimezone(value: string): Device;

  getLatitude(): number;
  setLatitude(value: number): Device;

  getLongitude(): number;
  setLongitude(value: number): Device;

  getConfirmedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setConfirmedAt(value?: google_protobuf_timestamp_pb.Timestamp): Device;
  hasConfirmedAt(): boolean;
  clearConfirmedAt(): Device;

  getLastActivityAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setLastActivityAt(value?: google_protobuf_timestamp_pb.Timestamp): Device;
  hasLastActivityAt(): boolean;
  clearLastActivityAt(): Device;

  getExpiresAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setExpiresAt(value?: google_protobuf_timestamp_pb.Timestamp): Device;
  hasExpiresAt(): boolean;
  clearExpiresAt(): Device;

  getRevokedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setRevokedAt(value?: google_protobuf_timestamp_pb.Timestamp): Device;
  hasRevokedAt(): boolean;
  clearRevokedAt(): Device;

  getRevokedReason(): string;
  setRevokedReason(value: string): Device;

  getIsTrusted(): boolean;
  setIsTrusted(value: boolean): Device;

  getIsCurrentDevice(): boolean;
  setIsCurrentDevice(value: boolean): Device;

  getLoginCount(): number;
  setLoginCount(value: number): Device;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Device;
  hasCreatedAt(): boolean;
  clearCreatedAt(): Device;

  getUpdatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setUpdatedAt(value?: google_protobuf_timestamp_pb.Timestamp): Device;
  hasUpdatedAt(): boolean;
  clearUpdatedAt(): Device;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Device.AsObject;
  static toObject(includeInstance: boolean, msg: Device): Device.AsObject;
  static serializeBinaryToWriter(message: Device, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Device;
  static deserializeBinaryFromReader(message: Device, reader: jspb.BinaryReader): Device;
}

export namespace Device {
  export type AsObject = {
    id: string;
    userId: string;
    deviceId: string;
    deviceName: string;
    deviceType: string;
    status: string;
    userAgent: string;
    browser: string;
    browserVersion: string;
    os: string;
    osVersion: string;
    platform: string;
    ipAddress: string;
    country: string;
    city: string;
    region: string;
    timezone: string;
    latitude: number;
    longitude: number;
    confirmedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    lastActivityAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    expiresAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    revokedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    revokedReason: string;
    isTrusted: boolean;
    isCurrentDevice: boolean;
    loginCount: number;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
    updatedAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class RegisterDeviceRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): RegisterDeviceRequest;

  getDeviceId(): string;
  setDeviceId(value: string): RegisterDeviceRequest;

  getDeviceName(): string;
  setDeviceName(value: string): RegisterDeviceRequest;

  getUserAgent(): string;
  setUserAgent(value: string): RegisterDeviceRequest;

  getIpAddress(): string;
  setIpAddress(value: string): RegisterDeviceRequest;

  getLatitude(): number;
  setLatitude(value: number): RegisterDeviceRequest;

  getLongitude(): number;
  setLongitude(value: number): RegisterDeviceRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterDeviceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterDeviceRequest): RegisterDeviceRequest.AsObject;
  static serializeBinaryToWriter(message: RegisterDeviceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterDeviceRequest;
  static deserializeBinaryFromReader(message: RegisterDeviceRequest, reader: jspb.BinaryReader): RegisterDeviceRequest;
}

export namespace RegisterDeviceRequest {
  export type AsObject = {
    userId: string;
    deviceId: string;
    deviceName: string;
    userAgent: string;
    ipAddress: string;
    latitude: number;
    longitude: number;
  };
}

export class RegisterDeviceResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): RegisterDeviceResponse;

  getDevice(): Device | undefined;
  setDevice(value?: Device): RegisterDeviceResponse;
  hasDevice(): boolean;
  clearDevice(): RegisterDeviceResponse;

  getRequiresConfirmation(): boolean;
  setRequiresConfirmation(value: boolean): RegisterDeviceResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RegisterDeviceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RegisterDeviceResponse): RegisterDeviceResponse.AsObject;
  static serializeBinaryToWriter(message: RegisterDeviceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RegisterDeviceResponse;
  static deserializeBinaryFromReader(message: RegisterDeviceResponse, reader: jspb.BinaryReader): RegisterDeviceResponse;
}

export namespace RegisterDeviceResponse {
  export type AsObject = {
    message: string;
    device?: Device.AsObject;
    requiresConfirmation: boolean;
  };
}

export class ConfirmDeviceRequest extends jspb.Message {
  getToken(): string;
  setToken(value: string): ConfirmDeviceRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmDeviceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmDeviceRequest): ConfirmDeviceRequest.AsObject;
  static serializeBinaryToWriter(message: ConfirmDeviceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmDeviceRequest;
  static deserializeBinaryFromReader(message: ConfirmDeviceRequest, reader: jspb.BinaryReader): ConfirmDeviceRequest;
}

export namespace ConfirmDeviceRequest {
  export type AsObject = {
    token: string;
  };
}

export class ConfirmDeviceResponse extends jspb.Message {
  getMessage(): string;
  setMessage(value: string): ConfirmDeviceResponse;

  getDevice(): Device | undefined;
  setDevice(value?: Device): ConfirmDeviceResponse;
  hasDevice(): boolean;
  clearDevice(): ConfirmDeviceResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ConfirmDeviceResponse.AsObject;
  static toObject(includeInstance: boolean, msg: ConfirmDeviceResponse): ConfirmDeviceResponse.AsObject;
  static serializeBinaryToWriter(message: ConfirmDeviceResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ConfirmDeviceResponse;
  static deserializeBinaryFromReader(message: ConfirmDeviceResponse, reader: jspb.BinaryReader): ConfirmDeviceResponse;
}

export namespace ConfirmDeviceResponse {
  export type AsObject = {
    message: string;
    device?: Device.AsObject;
  };
}

export class GetUserDevicesRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetUserDevicesRequest;

  getCurrentDeviceId(): string;
  setCurrentDeviceId(value: string): GetUserDevicesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserDevicesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserDevicesRequest): GetUserDevicesRequest.AsObject;
  static serializeBinaryToWriter(message: GetUserDevicesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserDevicesRequest;
  static deserializeBinaryFromReader(message: GetUserDevicesRequest, reader: jspb.BinaryReader): GetUserDevicesRequest;
}

export namespace GetUserDevicesRequest {
  export type AsObject = {
    userId: string;
    currentDeviceId: string;
  };
}

export class GetUserDevicesResponse extends jspb.Message {
  getDevicesList(): Array<Device>;
  setDevicesList(value: Array<Device>): GetUserDevicesResponse;
  clearDevicesList(): GetUserDevicesResponse;
  addDevices(value?: Device, index?: number): Device;

  getTotalCount(): number;
  setTotalCount(value: number): GetUserDevicesResponse;

  getActiveCount(): number;
  setActiveCount(value: number): GetUserDevicesResponse;

  getPendingCount(): number;
  setPendingCount(value: number): GetUserDevicesResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetUserDevicesResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetUserDevicesResponse): GetUserDevicesResponse.AsObject;
  static serializeBinaryToWriter(message: GetUserDevicesResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetUserDevicesResponse;
  static deserializeBinaryFromReader(message: GetUserDevicesResponse, reader: jspb.BinaryReader): GetUserDevicesResponse;
}

export namespace GetUserDevicesResponse {
  export type AsObject = {
    devicesList: Array<Device.AsObject>;
    totalCount: number;
    activeCount: number;
    pendingCount: number;
  };
}

export class GetDeviceRequest extends jspb.Message {
  getDeviceId(): string;
  setDeviceId(value: string): GetDeviceRequest;

  getUserId(): string;
  setUserId(value: string): GetDeviceRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeviceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeviceRequest): GetDeviceRequest.AsObject;
  static serializeBinaryToWriter(message: GetDeviceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeviceRequest;
  static deserializeBinaryFromReader(message: GetDeviceRequest, reader: jspb.BinaryReader): GetDeviceRequest;
}

export namespace GetDeviceRequest {
  export type AsObject = {
    deviceId: string;
    userId: string;
  };
}

export class RevokeDeviceRequest extends jspb.Message {
  getDeviceId(): string;
  setDeviceId(value: string): RevokeDeviceRequest;

  getUserId(): string;
  setUserId(value: string): RevokeDeviceRequest;

  getReason(): string;
  setReason(value: string): RevokeDeviceRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeDeviceRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeDeviceRequest): RevokeDeviceRequest.AsObject;
  static serializeBinaryToWriter(message: RevokeDeviceRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeDeviceRequest;
  static deserializeBinaryFromReader(message: RevokeDeviceRequest, reader: jspb.BinaryReader): RevokeDeviceRequest;
}

export namespace RevokeDeviceRequest {
  export type AsObject = {
    deviceId: string;
    userId: string;
    reason: string;
  };
}

export class RevokeAllDevicesRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): RevokeAllDevicesRequest;

  getExceptDeviceId(): string;
  setExceptDeviceId(value: string): RevokeAllDevicesRequest;

  getReason(): string;
  setReason(value: string): RevokeAllDevicesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RevokeAllDevicesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RevokeAllDevicesRequest): RevokeAllDevicesRequest.AsObject;
  static serializeBinaryToWriter(message: RevokeAllDevicesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RevokeAllDevicesRequest;
  static deserializeBinaryFromReader(message: RevokeAllDevicesRequest, reader: jspb.BinaryReader): RevokeAllDevicesRequest;
}

export namespace RevokeAllDevicesRequest {
  export type AsObject = {
    userId: string;
    exceptDeviceId: string;
    reason: string;
  };
}

export class DeviceActivityLog extends jspb.Message {
  getId(): string;
  setId(value: string): DeviceActivityLog;

  getDeviceId(): string;
  setDeviceId(value: string): DeviceActivityLog;

  getUserId(): string;
  setUserId(value: string): DeviceActivityLog;

  getAction(): string;
  setAction(value: string): DeviceActivityLog;

  getIpAddress(): string;
  setIpAddress(value: string): DeviceActivityLog;

  getUserAgent(): string;
  setUserAgent(value: string): DeviceActivityLog;

  getMetadata(): string;
  setMetadata(value: string): DeviceActivityLog;

  getCreatedAt(): google_protobuf_timestamp_pb.Timestamp | undefined;
  setCreatedAt(value?: google_protobuf_timestamp_pb.Timestamp): DeviceActivityLog;
  hasCreatedAt(): boolean;
  clearCreatedAt(): DeviceActivityLog;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeviceActivityLog.AsObject;
  static toObject(includeInstance: boolean, msg: DeviceActivityLog): DeviceActivityLog.AsObject;
  static serializeBinaryToWriter(message: DeviceActivityLog, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeviceActivityLog;
  static deserializeBinaryFromReader(message: DeviceActivityLog, reader: jspb.BinaryReader): DeviceActivityLog;
}

export namespace DeviceActivityLog {
  export type AsObject = {
    id: string;
    deviceId: string;
    userId: string;
    action: string;
    ipAddress: string;
    userAgent: string;
    metadata: string;
    createdAt?: google_protobuf_timestamp_pb.Timestamp.AsObject;
  };
}

export class GetDeviceActivityRequest extends jspb.Message {
  getDeviceId(): string;
  setDeviceId(value: string): GetDeviceActivityRequest;

  getUserId(): string;
  setUserId(value: string): GetDeviceActivityRequest;

  getLimit(): number;
  setLimit(value: number): GetDeviceActivityRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeviceActivityRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeviceActivityRequest): GetDeviceActivityRequest.AsObject;
  static serializeBinaryToWriter(message: GetDeviceActivityRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeviceActivityRequest;
  static deserializeBinaryFromReader(message: GetDeviceActivityRequest, reader: jspb.BinaryReader): GetDeviceActivityRequest;
}

export namespace GetDeviceActivityRequest {
  export type AsObject = {
    deviceId: string;
    userId: string;
    limit: number;
  };
}

export class GetDeviceActivityResponse extends jspb.Message {
  getLogsList(): Array<DeviceActivityLog>;
  setLogsList(value: Array<DeviceActivityLog>): GetDeviceActivityResponse;
  clearLogsList(): GetDeviceActivityResponse;
  addLogs(value?: DeviceActivityLog, index?: number): DeviceActivityLog;

  getCount(): number;
  setCount(value: number): GetDeviceActivityResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetDeviceActivityResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetDeviceActivityResponse): GetDeviceActivityResponse.AsObject;
  static serializeBinaryToWriter(message: GetDeviceActivityResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetDeviceActivityResponse;
  static deserializeBinaryFromReader(message: GetDeviceActivityResponse, reader: jspb.BinaryReader): GetDeviceActivityResponse;
}

export namespace GetDeviceActivityResponse {
  export type AsObject = {
    logsList: Array<DeviceActivityLog.AsObject>;
    count: number;
  };
}

export class UpdateDeviceActivityRequest extends jspb.Message {
  getDeviceId(): string;
  setDeviceId(value: string): UpdateDeviceActivityRequest;

  getUserId(): string;
  setUserId(value: string): UpdateDeviceActivityRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): UpdateDeviceActivityRequest.AsObject;
  static toObject(includeInstance: boolean, msg: UpdateDeviceActivityRequest): UpdateDeviceActivityRequest.AsObject;
  static serializeBinaryToWriter(message: UpdateDeviceActivityRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): UpdateDeviceActivityRequest;
  static deserializeBinaryFromReader(message: UpdateDeviceActivityRequest, reader: jspb.BinaryReader): UpdateDeviceActivityRequest;
}

export namespace UpdateDeviceActivityRequest {
  export type AsObject = {
    deviceId: string;
    userId: string;
  };
}

