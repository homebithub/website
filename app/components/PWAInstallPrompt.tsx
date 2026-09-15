import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import {
  ArrowDownTrayIcon,
  ArrowUpOnSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

import { useAuth } from '~/contexts/useAuth';
import { BaseModal } from '~/components/ui/BaseModal';

export const OPEN_PWA_INSTALL_EVENT = 'open-pwa-install';

const DISMISSED_AT_KEY = 'homebit:pwa-install-v2-dismissed-at';
const SESSION_VIEWS_KEY = 'homebit:pwa-install-page-views';
const DISMISSAL_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function isInstalledPWA() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches
    || Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
}

function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(max-width: 767px)').matches
    || /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
}

function isAppleMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isSafariOnAppleMobile() {
  if (!isAppleMobileDevice() || typeof navigator === 'undefined') return false;
  const userAgent = navigator.userAgent;
  return /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent);
}

function dismissalIsCurrent() {
  try {
    const dismissedAt = Number(window.localStorage.getItem(DISMISSED_AT_KEY));
    return Number.isFinite(dismissedAt) && Date.now() - dismissedAt < DISMISSAL_COOLDOWN_MS;
  } catch {
    return false;
  }
}

function rememberDismissal() {
  try {
    window.localStorage.setItem(DISMISSED_AT_KEY, String(Date.now()));
  } catch {
    // Installation guidance still works when storage is unavailable.
  }
}

export function PWAInstallMenuButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const refresh = () => setVisible(isMobileDevice() && !isInstalledPWA());
    refresh();
    window.addEventListener('appinstalled', refresh);
    return () => window.removeEventListener('appinstalled', refresh);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PWA_INSTALL_EVENT))}
      className="mx-2 flex w-[calc(100%-16px)] items-center gap-2 rounded-xl px-5 py-2 text-base font-medium text-primary-700 transition-all hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:text-purple-400"
    >
      <ArrowDownTrayIcon className="h-5 w-5" />
      Install HomeBit
    </button>
  );
}

export function PWAInstallPrompt() {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [copied, setCopied] = useState(false);
  const autoPromptScheduled = useRef(false);
  const isIOS = isAppleMobileDevice();
  const isIOSSafari = isSafariOnAppleMobile();

  useEffect(() => {
    setInstalled(isInstalledPWA());

    const capturePrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setInstalled(true);
      setIsOpen(false);
      setDeferredPrompt(null);
    };
    const openGuidance = () => {
      if (!isInstalledPWA()) setIsOpen(true);
    };

    window.addEventListener('beforeinstallprompt', capturePrompt);
    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener(OPEN_PWA_INSTALL_EVENT, openGuidance);
    return () => {
      window.removeEventListener('beforeinstallprompt', capturePrompt);
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener(OPEN_PWA_INSTALL_EVENT, openGuidance);
    };
  }, []);

  useEffect(() => {
    if (installed || !isMobileDevice() || dismissalIsCurrent()) return;

    let pageViews = 1;
    try {
      pageViews = Number(window.sessionStorage.getItem(SESSION_VIEWS_KEY) || '0') + 1;
      window.sessionStorage.setItem(SESSION_VIEWS_KEY, String(pageViews));
    } catch {
      // Fall back to the authenticated-user condition below.
    }

    // iOS offers no native beforeinstallprompt event. Show our Safari guidance
    // on the first engaged visit there; elsewhere wait for sign-in or a second
    // page so the invitation does not interrupt a brand-new visitor.
    const readyForPrompt = Boolean(user) || pageViews >= 2 || isAppleMobileDevice();
    if (autoPromptScheduled.current || !readyForPrompt) return;
    autoPromptScheduled.current = true;
    const timer = window.setTimeout(() => setIsOpen(true), 7000);
    return () => {
      window.clearTimeout(timer);
      autoPromptScheduled.current = false;
    };
  }, [installed, location.pathname, user]);

  const close = (remember = false) => {
    if (remember) rememberDismissal();
    setIsOpen(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') setIsOpen(false);
    else rememberDismissal();
    setDeferredPrompt(null);
  };

  const copyWebsiteLink = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('textarea');
      input.value = url;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  };

  if (installed) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={() => close(true)}
      title="Install HomeBit"
      description="Keep HomeBit one tap away and use it like an app."
      size="sm"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-4 rounded-2xl border border-purple-200/70 bg-purple-50/80 p-4 dark:border-purple-500/30 dark:bg-purple-950/30">
          <img src="/pwa/icon-192.png" alt="" className="h-16 w-16 rounded-2xl shadow-lg" />
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">HomeBit on your Home Screen</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Faster access, a full-screen experience, and app notifications.</p>
          </div>
        </div>

        {deferredPrompt && !isIOS ? (
          <button
            type="button"
            onClick={() => void install()}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-700 hover:to-pink-700"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
            Install HomeBit
          </button>
        ) : (
          <div>
            <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
              {isIOS ? (isIOSSafari ? 'Install from Safari:' : 'Safari is required on iPhone and iPad') : 'From your browser menu:'}
            </p>
            {isIOS && !isIOSSafari ? (
              <>
                <p className="mb-4 rounded-xl border border-amber-300/60 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-100">
                  Chrome, Firefox, Edge, and other iOS browsers cannot install HomeBit. Copy this page, open Safari, and paste the link there.
                </p>
                <button
                  type="button"
                  onClick={() => void copyWebsiteLink()}
                  className="mb-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-700 hover:to-pink-700"
                >
                  {copied ? <CheckCircleIcon className="h-5 w-5" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                  {copied ? 'Link copied — now open Safari' : 'Copy HomeBit link'}
                </button>
                <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                  <li className="flex gap-3"><DevicePhoneMobileIcon className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" /><span><strong>1.</strong> Open <strong>Safari</strong> and paste the copied link.</span></li>
                  <li className="flex gap-3"><ArrowUpOnSquareIcon className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" /><span><strong>2.</strong> Tap Safari’s <strong>Share</strong> button.</span></li>
                  <li className="flex gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" /><span><strong>3.</strong> Choose <strong>Add to Home Screen</strong>, leave “Open as Web App” enabled, then tap <strong>Add</strong>.</span></li>
                </ol>
              </>
            ) : (
              <ol className="space-y-3 text-sm text-gray-700 dark:text-gray-200">
                <li className="flex gap-3"><ArrowUpOnSquareIcon className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" /><span><strong>1.</strong> Tap the <strong>Share</strong> button{isIOS ? ' in Safari' : ' in your browser'}.</span></li>
                <li className="flex gap-3"><DevicePhoneMobileIcon className="mt-0.5 h-5 w-5 shrink-0 text-purple-500" /><span><strong>2.</strong> Choose <strong>Add to Home Screen</strong>.</span></li>
                <li className="flex gap-3"><CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-pink-500" /><span><strong>3.</strong> Select <strong>Add</strong>{isIOS ? ' and leave “Open as Web App” enabled' : ''}.</span></li>
              </ol>
            )}
          </div>
        )}

        <button type="button" onClick={() => close(true)} className="w-full py-2 text-sm font-medium text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-300">
          Not now
        </button>
      </div>
    </BaseModal>
  );
}
