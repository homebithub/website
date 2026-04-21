import { useNavigate, useLocation } from "react-router";
import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  XMarkIcon,
  CheckCircleIcon,
  TrashIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import deviceService from '~/services/grpc/device.service';
import type { Device } from '~/types/devices';
import { DEVICE_TYPE_ICONS, DEVICE_STATUS_COLORS, DEVICE_STATUS_LABELS } from '~/types/devices';
import { getDeviceId } from '~/utils/deviceFingerprint';

// Convert proto Device (camelCase) to local Device type (snake_case)
function protoDeviceToLocal(d: any): Device {
  const tsToStr = (ts: any) => {
    if (!ts) return undefined;
    // proto Timestamp.AsObject has { seconds, nanos }
    if (ts.seconds) return new Date(ts.seconds * 1000).toISOString();
    return undefined;
  };
  return {
    id: d.id || '',
    user_id: d.userId || '',
    device_id: d.deviceId || '',
    device_name: d.deviceName || '',
    device_type: d.deviceType || 'unknown',
    status: d.status || 'pending',
    user_agent: d.userAgent || '',
    browser: d.browser || '',
    browser_version: d.browserVersion || '',
    os: d.os || '',
    os_version: d.osVersion || '',
    platform: d.platform || '',
    ip_address: d.ipAddress || '',
    country: d.country || '',
    city: d.city || '',
    region: d.region || '',
    timezone: d.timezone || '',
    latitude: d.latitude || 0,
    longitude: d.longitude || 0,
    confirmed_at: tsToStr(d.confirmedAt),
    last_activity_at: tsToStr(d.lastActivityAt),
    expires_at: tsToStr(d.expiresAt),
    revoked_at: tsToStr(d.revokedAt),
    revoked_reason: d.revokedReason || '',
    is_trusted: d.isTrusted || false,
    is_current_device: d.isCurrentDevice || false,
    login_count: d.loginCount || 0,
    created_at: tsToStr(d.createdAt) || '',
    updated_at: tsToStr(d.updatedAt) || '',
  };
}

export default function DevicesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // State
  const [devices, setDevices] = useState<Device[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [revokingDevice, setRevokingDevice] = useState<Device | null>(null);
  const [showRevokeAllModal, setShowRevokeAllModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [processingAction, setProcessingAction] = useState(false);
  const [currentDeviceId, setCurrentDeviceId] = useState<string>('');

  // Fetch devices
  const fetchDevices = React.useCallback(async () => {
    setDataLoading(true);
    setErrorMessage('');
    try {
      const deviceId = await getDeviceId();
      setCurrentDeviceId(deviceId);
      
      const userObj = (user as any)?.user || user;
      const userId = userObj?.user_id || userObj?.id || '';
      const response = await deviceService.getUserDevices(userId, deviceId);
      setDevices(response.devices.map(protoDeviceToLocal));
      setTotalCount(response.totalCount);
      setActiveCount(response.activeCount);
      setPendingCount(response.pendingCount);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load devices');
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  // Auth check
  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      fetchDevices();
    }
  }, [user, fetchDevices]);

  // Handle revoke device
  const handleRevokeDevice = async (device: Device) => {
    setProcessingAction(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const userObj = (user as any)?.user || user;
      const userId = userObj?.user_id || userObj?.id || '';
      await deviceService.revokeDevice(device.id, userId, 'Revoked by user');
      
      setSuccessMessage(`Device "${device.device_name || 'Unknown'}" has been revoked successfully`);
      setRevokingDevice(null);
      await fetchDevices();
    } catch (error) {
      console.error('Failed to revoke device:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to revoke device');
    } finally {
      setProcessingAction(false);
    }
  };

  // Handle revoke all devices
  const handleRevokeAllDevices = async () => {
    setProcessingAction(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    try {
      const userObj = (user as any)?.user || user;
      const userId = userObj?.user_id || userObj?.id || '';
      const currentDevice = devices.find(d => d.is_current_device);
      await deviceService.revokeAllDevices(userId, currentDevice?.device_id, 'Logged out all devices');
      
      setSuccessMessage('All other devices have been logged out successfully');
      setShowRevokeAllModal(false);
      await fetchDevices();
    } catch (error) {
      console.error('Failed to revoke all devices:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to log out all devices');
    } finally {
      setProcessingAction(false);
    }
  };

  // Get device icon
  const getDeviceIcon = (deviceType: Device['device_type']) => {
    switch (deviceType) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-8 w-8" />;
      case 'tablet':
        return <DeviceTabletIcon className="h-8 w-8" />;
      case 'desktop':
        return <ComputerDesktopIcon className="h-8 w-8" />;
      default:
        return <ComputerDesktopIcon className="h-8 w-8" />;
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
  };

  if (loading || dataLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <button
            onClick={() => navigate('/settings')}
            className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-6 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Settings
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 mb-1">
              Your Devices
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Manage devices that have access to your account
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <div className="mb-6">
              <ErrorAlert message={errorMessage} onClose={() => setErrorMessage('')} />
            </div>
          )}
          
          {successMessage && (
            <div className="mb-6">
              <SuccessAlert message={successMessage} onClose={() => setSuccessMessage('')} />
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
              <div className="flex items-center">
                <ComputerDesktopIcon className="h-6 w-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Total Devices</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Active</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{activeCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
              <div className="flex items-center">
                <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Remove all other devices button */}
          {devices.length > 1 && (
            <div className="mb-6">
              <button
                onClick={() => setShowRevokeAllModal(true)}
                className="inline-flex items-center px-4 py-1.5 text-xs font-semibold rounded-xl text-red-100 bg-red-600 hover:bg-red-700 transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Remove All Other Devices
              </button>
            </div>
          )}

          {/* Devices List */}
          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-8 text-center">
                <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <h3 className="mt-2 text-xs font-medium text-gray-900 dark:text-gray-100">No devices</h3>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  You don't have any devices registered yet.
                </p>
              </div>
            ) : (
              devices.map((device) => (
                <div
                  key={device.id}
                  className={`bg-white dark:bg-[#13131a] rounded-2xl border p-5 transition-colors ${
                    device.is_current_device
                      ? 'border-purple-400 dark:border-purple-500/60'
                      : 'border-purple-200/40 dark:border-purple-500/30'
                  }`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Device Icon */}
                      <div className="flex-shrink-0 text-purple-600 dark:text-purple-400">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      
                      {/* Device Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center flex-wrap gap-2 mb-1">
                          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {device.device_name || 'Unknown Device'}
                          </h3>
                          {device.is_current_device && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                              Current Device
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${DEVICE_STATUS_COLORS[device.status]}`}>
                            {DEVICE_STATUS_LABELS[device.status]}
                          </span>
                        </div>
                        
                        <div className="space-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                          <p>
                            {device.browser} {device.browser_version} on {device.os} {device.os_version}
                          </p>
                          {device.city && device.country && (
                            <p className="flex items-center">
                              <MapPinIcon className="h-3.5 w-3.5 mr-1" />
                              {device.city}, {device.country}
                            </p>
                          )}
                          <p className="flex items-center">
                            <ClockIcon className="h-3.5 w-3.5 mr-1" />
                            Last active: {formatDate(device.last_activity_at)}
                          </p>
                          <p className="text-gray-400 dark:text-gray-500">
                            {device.login_count} login{device.login_count !== 1 ? 's' : ''} • 
                            First login: {formatDate(device.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {!device.is_current_device && (
                      <button
                        onClick={() => setRevokingDevice(device)}
                        className="ml-4 inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <TrashIcon className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {/* Revoke Device Modal */}
      <Transition appear show={revokingDevice !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setRevokingDevice(null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                  <Dialog.Title
                    as="h3"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center"
                  >
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                    Remove Device
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Are you sure you want to remove "{revokingDevice?.device_name || 'this device'}"? 
                      This device will be removed from your account.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={() => revokingDevice && handleRevokeDevice(revokingDevice)}
                      disabled={processingAction}
                    >
                      {processingAction ? 'Removing...' : 'Yes, Remove'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#1a1a24] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e1e2a] transition-colors"
                      onClick={() => setRevokingDevice(null)}
                      disabled={processingAction}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Revoke All Devices Modal */}
      <Transition appear show={showRevokeAllModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setShowRevokeAllModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                  <Dialog.Title
                    as="h3"
                    className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center"
                  >
                    <TrashIcon className="h-5 w-5 text-red-500 mr-2" />
                    Remove All Other Devices
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      This will remove all devices except your current one. You'll need to log in again on those devices.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      onClick={handleRevokeAllDevices}
                      disabled={processingAction}
                    >
                      {processingAction ? 'Removing...' : 'Yes, Remove All'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#1a1a24] px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e1e2a] transition-colors"
                      onClick={() => setShowRevokeAllModal(false)}
                      disabled={processingAction}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
