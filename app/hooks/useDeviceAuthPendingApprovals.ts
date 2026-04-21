import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSSESubscription } from '~/hooks/useSSESubscription';

export interface PendingDeviceApproval {
  id: string;
  deviceName: string;
  deviceType: string;
  browser?: string;
  os?: string;
  city?: string;
  country?: string;
  ipAddress?: string;
  confirmationUrl?: string;
  confirmationToken: string;
  receivedAt?: string;
  metadata: Record<string, string>;
}

const pick = <T,>(value: T | undefined | null, fallback: T): T =>
  value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
    ? fallback
    : value;

const normalizeString = (value?: unknown) =>
  typeof value === 'string' ? value : undefined;

const extractMap = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === 'string') {
      out[k] = v;
    }
  }
  return out;
};

export function useDeviceAuthPendingApprovals(enabled: boolean = true) {
  const [approvals, setApprovals] = useState<PendingDeviceApproval[]>([]);
  const seenRef = useRef<Set<string>>(new Set());

  const handleEvent = useCallback(
    (event: any) => {
      if (!event || typeof event !== 'object') return;
      const payload = event.data ?? event;
      if (!payload || typeof payload !== 'object') return;

      const token = normalizeString(payload.confirmation_token) ?? normalizeString(payload.confirmationToken);
      const deviceId = normalizeString(payload.device_id) ?? normalizeString(payload.deviceId);
      if (!token && !deviceId) {
        return;
      }

      const key = token ?? `${deviceId}:${normalizeString(event.event_id ?? event.eventId) ?? ''}`;
      if (seenRef.current.has(key)) {
        return;
      }
      seenRef.current.add(key);

      const metadata = {
        ...extractMap(payload.metadata),
      };

      const approval: PendingDeviceApproval = {
        id: key,
        deviceName: pick(normalizeString(payload.device_name) ?? normalizeString(payload.deviceName), 'New device'),
        deviceType: normalizeString(payload.device_type) ?? normalizeString(payload.deviceType) ?? 'unknown',
        browser: normalizeString(payload.browser),
        os: normalizeString(payload.os),
        city: normalizeString(payload.city),
        country: normalizeString(payload.country),
        ipAddress: normalizeString(payload.ip_address) ?? normalizeString(payload.ipAddress),
        confirmationUrl:
          metadata.confirmation_url ??
          normalizeString(payload.confirmation_url) ??
          normalizeString(payload.confirmationUrl),
        confirmationToken: token ?? '',
        receivedAt: normalizeString(payload.created_at) ?? normalizeString(event.timestamp),
        metadata,
      };

      setApprovals((prev) => {
        const existing = prev.find((item) => item.id === approval.id);
        if (existing) {
          return prev;
        }
        return [approval, ...prev].slice(0, 5);
      });
    },
    []
  );

  useSSESubscription('auth.device.pending_confirmation', handleEvent, enabled);

  useEffect(() => {
    if (!enabled) {
      setApprovals([]);
      seenRef.current.clear();
    }
  }, [enabled]);

  const dismiss = useCallback((id: string) => {
    seenRef.current.delete(id);
    setApprovals((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    seenRef.current.clear();
    setApprovals([]);
  }, []);

  const newestApproval = useMemo(() => approvals[0] ?? null, [approvals]);

  return {
    approvals,
    newestApproval,
    dismiss,
    clearAll,
  } as const;
}
