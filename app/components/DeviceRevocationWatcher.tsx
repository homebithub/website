import { useCallback, useEffect, useRef } from 'react';
import { useAuth } from '~/contexts/useAuth';
import { useDeviceRevocation } from '~/hooks/useDeviceRevocation';
import { storedDeviceId } from '~/utils/deviceFingerprint';
import { getStoredUserId } from '~/utils/authStorage';

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

  // Ask once, on arrival, whether this device is still allowed.
  //
  // The live event only reaches a session that was open when the revocation
  // happened, and renewal only re-checks when the access token expires. A
  // browser that was closed at the time and reopened with a valid token would
  // otherwise keep working for up to fifteen minutes while already refused.
  // One request on load closes that.
  const checkedRef = useRef(false);
  useEffect(() => {
    if (checkedRef.current) return;

    const deviceId = storedDeviceId();
    const userId = getStoredUserId();
    if (!deviceId || !userId) return;

    checkedRef.current = true;

    void (async () => {
      try {
        const { deviceService } = await import('~/services/grpc/device.service');
        const { devices } = await deviceService.getUserDevices(userId, deviceId);

        const mine = (devices || []).find(
          (device: any) => String(device?.deviceId ?? device?.device_id ?? '') === deviceId,
        );
        // Absent is not refused. A browser that has never registered is
        // ordinary, and signing it out would lock people out of a working
        // session over a missing row.
        if (!mine) return;

        const status = String(mine.status ?? '').toLowerCase();
        if (status === 'revoked' || status === 'banned') {
          handleRevoked('This device no longer has access to your account.');
        }
      } catch {
        // A failed check leaves the session alone. Renewal is the floor, and
        // signing someone out because a request did not complete would be a
        // worse failure than the one being guarded against.
      }
    })();
  }, [handleRevoked]);

  return null;
}
