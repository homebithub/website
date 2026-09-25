import { useEffect } from 'react';
import { reportPWAEvent } from '~/utils/pwaTelemetry';

export function PWARegistration() {
  useEffect(() => {
    // Offline caching can serve stale source modules during local design reviews.
    if (import.meta.env.DEV) return;
    reportPWAEvent('launch');
    const installed = () => reportPWAEvent('install');
    window.addEventListener('appinstalled', installed);
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    const register = () => navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
    if (document.readyState === 'complete') void register();
    else window.addEventListener('load', register, { once: true });
    return () => { window.removeEventListener('load', register); window.removeEventListener('appinstalled', installed); };
  }, []);
  return null;
}
