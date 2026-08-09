import { useCallback } from 'react';
import { useAuth } from '~/contexts/useAuth';
import { useDeviceRevocation } from '~/hooks/useDeviceRevocation';

/**
 * Signs this browser out the moment its device is revoked elsewhere.
 *
 * A component rather than a hook inside AuthContext, because the two contexts
 * nest the wrong way round for that: AuthProvider wraps SSEProvider, so auth
 * cannot subscribe to SSE. Sitting inside SSEProvider, this reaches both — auth
 * from above, SSE from around it.
 *
 * Renders nothing. Its whole job is to listen.
 */
export function DeviceRevocationWatcher() {
  const { logout } = useAuth();

  const handleRevoked = useCallback(
    (reason: string) => {
      // The reason is carried through the redirect so the login page can say
      // why the session ended. Arriving at a login screen with no explanation
      // reads as a bug, and this is the one case where the person most needs
      // to know it was deliberate — they, or someone with their password, just
      // took this device off the account.
      const message = encodeURIComponent(reason);
      void logout().finally(() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/login?deviceRevoked=1&reason=${message}`;
        }
      });
    },
    [logout],
  );

  useDeviceRevocation(handleRevoked);

  return null;
}
