import * as grpcWeb from 'grpc-web';

import * as auth_device_pb from '../auth/device_pb'; // proto import: "auth/device.proto"
import * as google_protobuf_empty_pb from 'google-protobuf/google/protobuf/empty_pb'; // proto import: "google/protobuf/empty.proto"


export class DeviceServiceClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  registerDevice(
    request: auth_device_pb.RegisterDeviceRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_device_pb.RegisterDeviceResponse) => void
  ): grpcWeb.ClientReadableStream<auth_device_pb.RegisterDeviceResponse>;

  confirmDevice(
    request: auth_device_pb.ConfirmDeviceRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_device_pb.ConfirmDeviceResponse) => void
  ): grpcWeb.ClientReadableStream<auth_device_pb.ConfirmDeviceResponse>;

  getUserDevices(
    request: auth_device_pb.GetUserDevicesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_device_pb.GetUserDevicesResponse) => void
  ): grpcWeb.ClientReadableStream<auth_device_pb.GetUserDevicesResponse>;

  getDevice(
    request: auth_device_pb.GetDeviceRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_device_pb.Device) => void
  ): grpcWeb.ClientReadableStream<auth_device_pb.Device>;

  revokeDevice(
    request: auth_device_pb.RevokeDeviceRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  revokeAllDevices(
    request: auth_device_pb.RevokeAllDevicesRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

  getDeviceActivity(
    request: auth_device_pb.GetDeviceActivityRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: auth_device_pb.GetDeviceActivityResponse) => void
  ): grpcWeb.ClientReadableStream<auth_device_pb.GetDeviceActivityResponse>;

  updateDeviceActivity(
    request: auth_device_pb.UpdateDeviceActivityRequest,
    metadata: grpcWeb.Metadata | undefined,
    callback: (err: grpcWeb.RpcError,
               response: google_protobuf_empty_pb.Empty) => void
  ): grpcWeb.ClientReadableStream<google_protobuf_empty_pb.Empty>;

}

export class DeviceServicePromiseClient {
  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; });

  registerDevice(
    request: auth_device_pb.RegisterDeviceRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_device_pb.RegisterDeviceResponse>;

  confirmDevice(
    request: auth_device_pb.ConfirmDeviceRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_device_pb.ConfirmDeviceResponse>;

  getUserDevices(
    request: auth_device_pb.GetUserDevicesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_device_pb.GetUserDevicesResponse>;

  getDevice(
    request: auth_device_pb.GetDeviceRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_device_pb.Device>;

  revokeDevice(
    request: auth_device_pb.RevokeDeviceRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  revokeAllDevices(
    request: auth_device_pb.RevokeAllDevicesRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

  getDeviceActivity(
    request: auth_device_pb.GetDeviceActivityRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<auth_device_pb.GetDeviceActivityResponse>;

  updateDeviceActivity(
    request: auth_device_pb.UpdateDeviceActivityRequest,
    metadata?: grpcWeb.Metadata
  ): Promise<google_protobuf_empty_pb.Empty>;

}

