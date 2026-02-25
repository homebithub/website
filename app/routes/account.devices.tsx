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
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import {
  listDevices,
  revokeDevice,
  revokeAllDevices,
} from '~/utils/api/devices';
import type { Device } from '~/types/devices';
import { DEVICE_TYPE_ICONS, DEVICE_STATUS_COLORS, DEVICE_STATUS_LABELS } from '~/types/devices';
import { getDeviceId } from '~/utils/deviceFingerprint';

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
      
      const response = await listDevices(deviceId);
      setDevices(response.devices);
      setTotalCount(response.total_count);
      setActiveCount(response.active_count);
      setPendingCount(response.pending_count);
    } catch (error) {
      console.error('Failed to fetch devices:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load devices');
    } finally {
      setDataLoading(false);
    }
  }, []);

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
      await revokeDevice(device.id, {
        reason: 'Revoked by user',
      });
      
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
      const currentDevice = devices.find(d => d.is_current_device);
      await revokeAllDevices(currentDevice?.id, {
        reason: 'Logged out all devices',
      });
      
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
    <PurpleThemeWrapper>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <Navigation />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Devices
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ComputerDesktopIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Devices</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Log out all button */}
          {activeCount > 1 && (
            <div className="mb-6">
              <button
                onClick={() => setShowRevokeAllModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-900"
              >
                <ShieldCheckIcon className="h-5 w-5 mr-2" />
                Log Out All Other Devices
              </button>
            </div>
          )}

          {/* Devices List */}
          <div className="space-y-4">
            {devices.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
                <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No devices</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  You don't have any devices registered yet.
                </p>
              </div>
            ) : (
              devices.map((device) => (
                <div
                  key={device.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
                    device.is_current_device ? 'ring-2 ring-purple-500 dark:ring-purple-400' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      {/* Device Icon */}
                      <div className="flex-shrink-0 text-gray-600 dark:text-gray-400">
                        {getDeviceIcon(device.device_type)}
                      </div>
                      
                      {/* Device Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                            {device.device_name || 'Unknown Device'}
                          </h3>
                          {device.is_current_device && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Current Device
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${DEVICE_STATUS_COLORS[device.status]}`}>
                            {DEVICE_STATUS_LABELS[device.status]}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                          <p>
                            {device.browser} {device.browser_version} on {device.os} {device.os_version}
                          </p>
                          {device.city && device.country && (
                            <p className="flex items-center">
                              <MapPinIcon className="h-4 w-4 mr-1" />
                              {device.city}, {device.country}
                            </p>
                          )}
                          <p className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            Last active: {formatDate(device.last_activity_at)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            {device.login_count} login{device.login_count !== 1 ? 's' : ''} • 
                            First login: {formatDate(device.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    {!device.is_current_device && device.status === 'active' && (
                      <button
                        onClick={() => setRevokingDevice(device)}
                        className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800 dark:focus:ring-offset-gray-900"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <Footer />
      </div>

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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                    Revoke Device Access
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Are you sure you want to revoke access for "{revokingDevice?.device_name || 'this device'}"? 
                      This device will be logged out and will need to be confirmed again to access your account.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => revokingDevice && handleRevokeDevice(revokingDevice)}
                      disabled={processingAction}
                    >
                      {processingAction ? 'Revoking...' : 'Yes, Revoke'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-white flex items-center"
                  >
                    <ShieldCheckIcon className="h-6 w-6 text-red-600 mr-2" />
                    Log Out All Other Devices
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      This will log you out of all devices except this one. You'll need to log in again on those devices.
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      This is useful if you've lost a device or want to ensure your account is secure.
                    </p>
                  </div>

                  <div className="mt-4 flex space-x-3">
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleRevokeAllDevices}
                      disabled={processingAction}
                    >
                      {processingAction ? 'Logging Out...' : 'Yes, Log Out All'}
                    </button>
                    <button
                      type="button"
                      className="flex-1 inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
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
    </PurpleThemeWrapper>
  );
}
