/**
 * Device Service - gRPC-Web Client
 * 
 * Provides device authentication and management methods using gRPC-Web protocol.
 * Used for device fingerprinting, approval, and security tracking.
 */

import { DeviceServiceClient } from '~/grpc/generated/auth/device_grpc_web_pb';
import device_pb_module from '~/grpc/generated/auth/device_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

const device_pb = device_pb_module as any;

const deviceClient = new DeviceServiceClient(GRPC_WEB_BASE_URL, null, null);

function resolveUserId(userId: string): string {
  if (userId) return userId;
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('user_object');
      if (raw) {
        const user = JSON.parse(raw);
        return user.user_id || user.id || '';
      }
    }
  } catch {}
  return '';
}

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  // Try cookie first, then localStorage (for production where cookie is httpOnly)
  let token = getAccessTokenFromCookies();
  if (!token && typeof window !== 'undefined') {
    token = localStorage.getItem('token') || undefined;
  }
  if (token) md['authorization'] = `Bearer ${token}`;
  try {
    if (typeof window !== 'undefined') {
      const profileType = localStorage.getItem('profile_type');
      if (profileType) md['x-profile-type'] = profileType;
    }
  } catch {}
  return md;
}

export const deviceService = {
  /**
   * Register a new device for the authenticated user.
   * Called after login or signup to track the device.
   */
  async registerDevice(
    userId: string,
    deviceId: string,
    deviceName: string,
    userAgent: string,
    ipAddress: string,
    latitude?: number,
    longitude?: number
  ): Promise<{ message: string; requiresConfirmation: boolean; device: any }> {
    return new Promise((resolve, reject) => {
      try {
        const request = new device_pb.RegisterDeviceRequest();
        request.setUserId(resolveUserId(userId));
        request.setDeviceId(deviceId);
        request.setDeviceName(deviceName);
        request.setUserAgent(userAgent);
        request.setIpAddress(ipAddress);
        if (latitude) request.setLatitude(latitude);
        if (longitude) request.setLongitude(longitude);

        deviceClient.registerDevice(request, getMetadata(), (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve({
              message: response.getMessage(),
              requiresConfirmation: response.getRequiresConfirmation(),
              device: response.getDevice()?.toObject(),
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Confirm a device using a confirmation token (from email link).
   */
  async confirmDevice(token: string): Promise<{ message: string; device: any }> {
    return new Promise((resolve, reject) => {
      try {
        const request = new device_pb.ConfirmDeviceRequest();
        request.setToken(token);

        deviceClient.confirmDevice(request, getMetadata(), (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve({
              message: response.getMessage(),
              device: response.getDevice()?.toObject(),
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Get all devices for the authenticated user.
   */
  async getUserDevices(
    userId: string,
    currentDeviceId?: string
  ): Promise<{ devices: any[]; totalCount: number; activeCount: number; pendingCount: number }> {
    return new Promise((resolve, reject) => {
      try {
        const request = new device_pb.GetUserDevicesRequest();
        request.setUserId(resolveUserId(userId));
        if (currentDeviceId) request.setCurrentDeviceId(currentDeviceId);

        deviceClient.getUserDevices(request, getMetadata(), (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve({
              devices: response.getDevicesList().map((d: any) => d.toObject()),
              totalCount: response.getTotalCount(),
              activeCount: response.getActiveCount(),
              pendingCount: response.getPendingCount(),
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Revoke (remove) a specific device.
   */
  async revokeDevice(deviceId: string, userId: string, reason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = new device_pb.RevokeDeviceRequest();
        request.setDeviceId(deviceId);
        request.setUserId(resolveUserId(userId));
        if (reason) request.setReason(reason);

        deviceClient.revokeDevice(request, getMetadata(), (err: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Revoke all devices except the current one.
   */
  async revokeAllDevices(userId: string, exceptDeviceId?: string, reason?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const request = new device_pb.RevokeAllDevicesRequest();
        request.setUserId(resolveUserId(userId));
        if (exceptDeviceId) request.setExceptDeviceId(exceptDeviceId);
        if (reason) request.setReason(reason);

        deviceClient.revokeAllDevices(request, getMetadata(), (err: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve();
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Get activity logs for a specific device.
   */
  async getDeviceActivity(
    deviceId: string,
    userId: string,
    limit?: number
  ): Promise<{ activities: any[] }> {
    return new Promise((resolve, reject) => {
      try {
        const request = new device_pb.GetDeviceActivityRequest();
        request.setDeviceId(deviceId);
        request.setUserId(resolveUserId(userId));
        if (limit) request.setLimit(limit);

        deviceClient.getDeviceActivity(request, getMetadata(), (err: any, response: any) => {
          if (err) {
            reject(handleGrpcError(err));
          } else {
            resolve({
              activities: response.getActivitiesList().map((a: any) => a.toObject()),
            });
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default deviceService;
