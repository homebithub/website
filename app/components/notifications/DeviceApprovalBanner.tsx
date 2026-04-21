import { Fragment, useMemo, useState } from 'react';
import { Transition } from '@headlessui/react';
import {
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  GlobeAltIcon,
  MapPinIcon,
  ArrowRightIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router';
import type { PendingDeviceApproval } from '~/hooks/useDeviceAuthPendingApprovals';

interface DeviceApprovalBannerProps {
  approval: PendingDeviceApproval | null;
  onDismiss?: (id: string) => void;
  onClearAll?: () => void;
  baseConfirmPath?: string;
}

const DEVICE_ICON_MAP: Record<string, typeof DevicePhoneMobileIcon> = {
  mobile: DevicePhoneMobileIcon,
  tablet: DeviceTabletIcon,
  desktop: ComputerDesktopIcon,
};

const formatLocation = (city?: string, country?: string) => {
  if (city && country) return `${city}, ${country}`;
  if (city) return city;
  if (country) return country;
  return null;
};

export function DeviceApprovalBanner({
  approval,
  onDismiss,
  onClearAll,
  baseConfirmPath = '/devices/confirm',
}: DeviceApprovalBannerProps) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);

  const DeviceIcon = useMemo(() => {
    if (!approval) return DevicePhoneMobileIcon;
    const key = approval.deviceType?.toLowerCase?.() ?? 'unknown';
    return DEVICE_ICON_MAP[key] ?? ComputerDesktopIcon;
  }, [approval]);

  const location = useMemo(() => {
    if (!approval) return null;
    return formatLocation(approval.city, approval.country);
  }, [approval]);

  const handleApprove = () => {
    if (!approval) return;
    if (approval.confirmationUrl) {
      window.open(approval.confirmationUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate({ pathname: baseConfirmPath, search: `?token=${encodeURIComponent(approval.confirmationToken)}` });
    }
  };

  const handleDismiss = () => {
    if (!approval) return;
    onDismiss?.(approval.id);
  };

  return (
    <div className="fixed inset-x-0 top-16 z-40 flex justify-center px-4 sm:px-6 lg:px-8 pointer-events-none" data-testid="device-approval-banner-root">
      <Transition
        as={Fragment}
        show={!!approval}
        enter="transition transform duration-300"
        enterFrom="opacity-0 -translate-y-6"
        enterTo="opacity-100 translate-y-0"
        leave="transition transform duration-200"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 -translate-y-6"
      >
        <div
          className={`pointer-events-auto w-full max-w-2xl rounded-3xl border border-purple-200/60 dark:border-purple-500/30 bg-white/80 dark:bg-[#101019]/90 backdrop-blur-xl shadow-2xl shadow-purple-300/50 dark:shadow-purple-900/40 overflow-hidden transition-colors duration-300 ${
            isHovering ? 'bg-gradient-to-br from-purple-50/90 to-white/95 dark:from-purple-900/60 dark:to-[#11111b]/95' : ''
          }`}
          data-testid="device-approval-banner"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex items-center gap-4 px-5 py-4 sm:px-6 sm:py-5">
            <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">
              <ShieldCheckIcon className="absolute -top-2 -left-2 h-5 w-5 text-green-500 drop-shadow" />
              {approval ? <DeviceIcon className="h-7 w-7" /> : null}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-purple-500 dark:text-purple-300">
                Device Authentication
              </p>
              <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                {approval ? `Approve ${approval.deviceName}` : 'No pending approvals'}
              </p>
              {approval && (
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 font-medium text-purple-600 dark:text-purple-300">
                    <DeviceIcon className="h-4 w-4" />
                    {approval.deviceType?.toUpperCase?.() || 'UNKNOWN'}
                  </span>
                  {approval.browser && (
                    <span className="inline-flex items-center gap-1">
                      <GlobeAltIcon className="h-4 w-4 text-purple-400" />
                      {approval.browser}
                      {approval.os ? ` · ${approval.os}` : ''}
                    </span>
                  )}
                  {location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPinIcon className="h-4 w-4 text-purple-400" />
                      {location}
                    </span>
                  )}
                  {approval.ipAddress && (
                    <span className="text-[11px] text-gray-400 dark:text-gray-500">
                      IP: {approval.ipAddress}
                    </span>
                  )}
                </div>
              )}
            </div>
            {approval && (
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={handleApprove}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-500/40 transition-all hover:shadow-purple-500/60 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
                >
                  Approve Now
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={handleDismiss}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Dismiss
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
                {onClearAll && (
                  <button
                    onClick={onClearAll}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    Clear all
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </Transition>
    </div>
  );
}

export default DeviceApprovalBanner;
