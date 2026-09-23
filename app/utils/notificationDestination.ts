import type { NotificationItem } from '~/types/notifications';

export function notificationDestination(item: NotificationItem): string | null {
  let metadata = item.metadata || item.data || {};
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch { metadata = {}; }
  }
  const data = { ...item, ...item.variables, ...metadata };
  for (const value of [data.action_url, data.url, data.link, data.cta_url]) {
    if (typeof value !== 'string' || /[\\\r\n]/.test(value)) continue;
    try {
      const url = new URL(value, 'https://homebit.co.ke');
      if (url.origin === 'https://homebit.co.ke' && /^\/(inbox|hiring|household|service-provider|subscriptions|plans|account|verify)(\/|\?|$)/.test(url.pathname)) {
        return url.pathname + url.search + url.hash;
      }
    } catch { /* Fall back to the event's type and identifiers. */ }
  }
  if (data.conversation_id) return `/inbox?conversation=${encodeURIComponent(data.conversation_id)}`;
  const kind = String(data.notification_type || data.event_type || data.type || '').toLowerCase();
  if (/subscription|payment|billing|trial|plan/.test(kind)) return '/subscriptions';
  if (data.application_id || data.contract_id || /hire|hiring|application|contract|employment/.test(kind)) return '/hiring';
  if (/message|chat|inbox/.test(kind)) return '/inbox';
  if (/review|rating/.test(kind)) return '/account/reviews';
  return null;
}
