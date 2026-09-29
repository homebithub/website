import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAuth } from '~/contexts/useAuth';
import { getStoredCanonicalProfileType } from '~/utils/authStorage';
import { hiringDestination } from '~/utils/notificationDestination';

// Keep old notification links and installed PWA shortcuts working.
export default function HiringRedirect() {
  const { loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    const profileType = getStoredCanonicalProfileType();
    if (!profileType) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
      return;
    }
    const params = new URLSearchParams(location.search);
    navigate(hiringDestination(profileType, location.search, {
      type: params.get('notification_type') || params.get('action') || params.get('type'),
    }) + location.hash, { replace: true });
  }, [loading, location.pathname, location.search, location.hash, navigate]);
  return <p className="p-8 text-center text-gray-500 dark:text-gray-400">Opening your hiring page…</p>;
}

export { ErrorBoundary } from '~/components/ErrorBoundary';
