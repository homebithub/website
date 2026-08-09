import { useCallback } from 'react';
import { useSSESubscriptions } from '~/hooks/useSSESubscription';
import { storedDeviceId } from '~/utils/deviceFingerprint';

/**
 * Signs this browser out when its device is revoked from somewhere else.
 *
 * Enforcement does not live here. Registration refuses a revoked device and
 * session renewal refuses it within the access token's life, so a revoked
 * browser stops working within fifteen minutes whether or not this hook ever
 * fires. This turns that into "immediately" for a session that happens to be
 * open, which is what someone revoking a stolen laptop actually wants.
 *
 * Which is also why a missed event is not a hole. The event is a courtesy; the
 * floor is the refusal at renewal.
 */
export function useDeviceRevocation(onRevoked: (reason: string) => void) {
  // Compared per event rather than captured once: a browser that registers
  // after this hook mounts would otherwise hold "" forever and ignore its own
  // revocation.
  const isThisDevice = useCallback((deviceId: unknown) => {
    const mine = storedDeviceId();
    return Boolean(mine) && String(deviceId ?? '') === mine;
  }, []);

  const handleRevoked = useCallback(
    (event: any) => {
      const payload = event?.data ?? event ?? {};
      // Only the revoked browser reacts. Someone revoking a lost phone from
      // their laptop must not be signed out of the laptop — the obvious way to
      // get this wrong, and the one that would make the feature unusable.
      if (!isThisDevice(payload.device_id ?? payload.deviceId)) return;
      onRevoked(
        String(payload.reason || '') ||
          'This device was signed out from your trusted devices.',
      );
    },
    [isThisDevice, onRevoked],
  );

  const handleAllRevoked = useCallback(
    (event: any) => {
      const payload = event?.data ?? event ?? {};
      const spared = String(payload.except_device_id ?? payload.exceptDeviceId ?? '');
      const mine = storedDeviceId();
      // "Revoke other devices" spares the browser that asked for it. Without
      // this check that browser would sign itself out the instant it acted.
      if (!mine || (spared && spared === mine)) return;
      onRevoked(
        String(payload.reason || '') ||
          'You signed out of all other devices, and this was one of them.',
      );
    },
    [onRevoked],
  );

  useSSESubscriptions(
    [
      { eventType: 'device.revoked', handler: handleRevoked },
      { eventType: 'device.all_revoked', handler: handleAllRevoked },
    ],
    true,
  );
}
