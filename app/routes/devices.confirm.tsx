import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Loading } from "~/components/Loading";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { 
  CheckCircleIcon, 
  XCircleIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
} from '@heroicons/react/24/outline';
import { confirmDevice } from '~/utils/api/devices';
import type { Device } from '~/types/devices';

export const meta = () => [
  { title: "Confirm Device — Homebit" },
  { name: "description", content: "Confirm your device to access your Homebit account." },
];

export default function DeviceConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<Device | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid confirmation link. Please check your email and try again.');
      setLoading(false);
      return;
    }

    const confirmDeviceToken = async () => {
      try {
        const response = await confirmDevice({ token });
        setDevice(response.device);
        setSuccess(true);
        setError(null);
      } catch (err) {
        console.error('Device confirmation failed:', err);
        setError(
          err instanceof Error 
            ? err.message 
            : 'Failed to confirm device. The link may have expired or is invalid.'
        );
        setSuccess(false);
      } finally {
        setLoading(false);
      }
    };

    confirmDeviceToken();
  }, [token]);

  const getDeviceIcon = (deviceType?: Device['device_type']) => {
    switch (deviceType) {
      case 'mobile':
        return <DevicePhoneMobileIcon className="h-16 w-16" />;
      case 'tablet':
        return <DeviceTabletIcon className="h-16 w-16" />;
      case 'desktop':
        return <ComputerDesktopIcon className="h-16 w-16" />;
      default:
        return <ComputerDesktopIcon className="h-16 w-16" />;
    }
  };

  if (loading) {
    return <Loading text="Confirming your device..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <PurpleCard hover={false} glow={true} className="w-full max-w-md p-8 sm:p-10">
            {success && device ? (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                    <CheckCircleIcon className="h-16 w-16 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Device Confirmed! 🎉
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your device has been successfully confirmed and is now active.
                </p>

                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-6 text-left">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 text-purple-600 dark:text-purple-400">
                      {getDeviceIcon(device.device_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {device.device_name || 'Unknown Device'}
                      </h3>
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          {device.browser} {device.browser_version} on {device.os} {device.os_version}
                        </p>
                        {device.city && device.country && (
                          <p>
                            📍 {device.city}, {device.country}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Continue to Login
                  </button>
                  
                  <Link
                    to="/account/devices"
                    className="block w-full px-6 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold text-center hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all"
                  >
                    Manage Devices
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-4">
                    <XCircleIcon className="h-16 w-16 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Confirmation Failed
                </h1>
                
                {error && (
                  <div className="mb-6">
                    <ErrorAlert message={error} />
                  </div>
                )}

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    What can you do?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Check if the link in your email is complete</li>
                    <li>• Try logging in again to receive a new confirmation email</li>
                    <li>• Contact support if the problem persists</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    Go to Login
                  </button>
                  
                  <Link
                    to="/contact"
                    className="block w-full px-6 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 font-semibold text-center hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500/50 transition-all"
                  >
                    Contact Support
                  </Link>
                </div>
              </div>
            )}
          </PurpleCard>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
