/**
 * Device Authentication Types
 * 
 * Type definitions for device authentication and management.
 */

export interface Device {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  device_type: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  status: 'pending' | 'active' | 'revoked' | 'expired' | 'suspicious';
  user_agent: string;
  browser: string;
  browser_version: string;
  os: string;
  os_version: string;
  platform: string;
  ip_address: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  latitude: number;
  longitude: number;
  confirmed_at?: string;
  last_activity_at?: string;
  expires_at?: string;
  revoked_at?: string;
  revoked_reason?: string;
  is_trusted: boolean;
  is_current_device: boolean;
  login_count: number;
  created_at: string;
  updated_at: string;
}

export interface RegisterDeviceRequest {
  device_id: string;
  device_name?: string;
  user_agent: string;
  ip_address: string;
  latitude?: number;
  longitude?: number;
}

export interface RegisterDeviceResponse {
  message: string;
  device: Device;
  requires_confirmation: boolean;
}

export interface ConfirmDeviceRequest {
  token: string;
}

export interface ConfirmDeviceResponse {
  message: string;
  device: Device;
}

export interface GetUserDevicesResponse {
  devices: Device[];
  total_count: number;
  active_count: number;
  pending_count: number;
}

export interface DeviceResponse {
  device: Device;
}

export interface RevokeDeviceRequest {
  reason?: string;
}

export interface RevokeAllDevicesRequest {
  reason?: string;
}

export interface DeviceActivityLog {
  id: string;
  device_id: string;
  user_id: string;
  action: string;
  ip_address: string;
  user_agent: string;
  metadata: string;
  created_at: string;
}

export interface GetDeviceActivityResponse {
  logs: DeviceActivityLog[];
  count: number;
}

// Device icon mapping
export const DEVICE_TYPE_ICONS: Record<Device['device_type'], string> = {
  mobile: '📱',
  tablet: '📱',
  desktop: '💻',
  unknown: '🖥️',
};

// Device status colors
export const DEVICE_STATUS_COLORS: Record<Device['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  revoked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  expired: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  suspicious: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

// Device status labels
export const DEVICE_STATUS_LABELS: Record<Device['status'], string> = {
  pending: 'Pending Confirmation',
  active: 'Active',
  revoked: 'Revoked',
  expired: 'Expired',
  suspicious: 'Suspicious',
};
