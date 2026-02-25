/**
 * Device Authentication API Service
 * 
 * API functions for managing device authentication.
 */

import { API_ENDPOINTS, getAuthHeaders, buildApiUrl } from '~/config/api';
import { parseErrorResponse } from '~/utils/errors/apiErrors';
import type {
  Device,
  RegisterDeviceRequest,
  RegisterDeviceResponse,
  ConfirmDeviceRequest,
  ConfirmDeviceResponse,
  GetUserDevicesResponse,
  DeviceResponse,
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.devices.register, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return await response.json();
};

/**
 * Confirm a device using confirmation token
 */
export const confirmDevice = async (
  request: ConfirmDeviceRequest
): Promise<ConfirmDeviceResponse> => {
  const response = await fetch(API_ENDPOINTS.devices.confirm, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return await response.json();
};

/**
 * Get all devices for the authenticated user
 */
export const listDevices = async (currentDeviceId?: string): Promise<GetUserDevicesResponse> => {
  const token = localStorage.getItem('token');
  
  const url = buildApiUrl(API_ENDPOINTS.devices.list, {
    current_device_id: currentDeviceId,
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return await response.json();
};

/**
 * Get a specific device by ID
 */
export const getDevice = async (deviceId: string): Promise<Device> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.devices.byId(deviceId), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  const data: DeviceResponse = await response.json();
  return data.device;
};

/**
 * Revoke a device
 */
export const revokeDevice = async (
  deviceId: string,
  request?: RevokeDeviceRequest
): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.devices.revoke(deviceId), {
    method: 'DELETE',
    headers: getAuthHeaders(token),
    body: request ? JSON.stringify(request) : undefined,
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
};

/**
 * Revoke all devices except the current one
 */
export const revokeAllDevices = async (
  exceptDeviceId?: string,
  request?: RevokeAllDevicesRequest
): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const url = buildApiUrl(API_ENDPOINTS.devices.revokeAll, {
    except_device_id: exceptDeviceId,
  });
  
  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: request ? JSON.stringify(request) : undefined,
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
};

/**
 * Get device activity logs
 */
export const getDeviceActivity = async (
  deviceId: string,
  limit?: number
): Promise<GetDeviceActivityResponse> => {
  const token = localStorage.getItem('token');
  
  const url = buildApiUrl(API_ENDPOINTS.devices.activity(deviceId), {
    limit,
  });
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return await response.json();
};
