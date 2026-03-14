/**
 * Device Authentication API Service
 * 
 * API functions for managing device authentication via gRPC.
 */

import { deviceService } from '~/services/grpc/device.service';
import type {
  Device,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  ConfirmDeviceRequest,
  ConfirmDeviceResponse,
  GetUserDevicesResponse,
  RevokeDeviceRequest,
  RevokeAllDevicesRequest,
  GetDeviceActivityResponse,
} from '~/types/devices';

/**
 * Register a new device
 */
export const registerDevice = async (
  request: RegisterDeviceRequest
): Promise<RegisterDeviceResponse> => {
  return deviceService.registerDevice(
    '',
    request.device_id || '',
    request.device_name || '',
    request.user_agent || '',
    request.ip_address || '',
    request.latitude,
    request.longitude,
  ) as any;
};

/**
 * Confirm a device using confirmation token
 */
export const confirmDevice = async (
  request: ConfirmDeviceRequest
): Promise<ConfirmDeviceResponse> => {
  return deviceService.confirmDevice(request.token) as any;
};

/**
 * Get all devices for the authenticated user
 */
export const listDevices = async (currentDeviceId?: string): Promise<GetUserDevicesResponse> => {
  return deviceService.getUserDevices('', currentDeviceId) as any;
};

/**
 * Get a specific device by ID
 */
export const getDevice = async (deviceId: string): Promise<Device> => {
  const res = await deviceService.getUserDevices('', deviceId);
  return (res as any)?.devices?.find((d: any) => d.id === deviceId || d.deviceId === deviceId) ?? res;
};

/**
 * Revoke a device
 */
export const revokeDevice = async (
  deviceId: string,
  request?: RevokeDeviceRequest
): Promise<void> => {
  await deviceService.revokeDevice(deviceId, '', request?.reason);
};

/**
 * Revoke all devices except the current one
 */
export const revokeAllDevices = async (
  exceptDeviceId?: string,
  request?: RevokeAllDevicesRequest
): Promise<void> => {
  await deviceService.revokeAllDevices('', exceptDeviceId, request?.reason);
};

/**
 * Get device activity logs
 */
export const getDeviceActivity = async (
  deviceId: string,
  limit?: number
): Promise<GetDeviceActivityResponse> => {
  return deviceService.getDeviceActivity(deviceId, '', limit) as any;
};
