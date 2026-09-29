import type { NotificationItem } from '~/types/notifications';
import { normalizeProfileType } from '~/utils/profileType';

const householdTabs = ['jobs', 'applicants', 'shortlisted', 'awaiting', 'hired', 'closed'];
const providerTabs = ['offers', 'interests', 'requests', 'employment-contracts', 'work-history'];

function eventKind(data: Record<string, any>): string {
  return String(data.notification_type || data.event_type || data.action || data.type || '').toLowerCase();
}

function hiringTab(data: Record<string, any>, provider: boolean): string {
  const kind = eventKind(data);
  if (provider) {
    if (/employment_contract/.test(kind)) return 'employment-contracts';
    if (/contract|employment/.test(kind) || data.contract_id) return 'work-history';
    if (/hire_request/.test(kind)) return 'requests';
    if (/invited|offer/.test(kind)) return 'offers';
    return 'interests';
  }
  if (/reject|declin|clos|terminat|cancel|withdraw/.test(kind)) return 'closed';
  if (/contract|employment|approved/.test(kind) || data.contract_id) return 'hired';
  if (/accept/.test(kind)) return 'awaiting';
  if (/shortlist/.test(kind)) return 'shortlisted';
  if (/listing|job/.test(kind)) return 'jobs';
  return 'applicants';
}

// Also used by the legacy /hiring entry point (bookmarks and push links).
export function hiringDestination(profileType?: string | null, search = '', data: Record<string, any> = {}): string {
  const provider = normalizeProfileType(profileType) === 'service_provider';
  const params = new URLSearchParams(search);
  const tabs = provider ? providerTabs : householdTabs;
  if (!tabs.includes(params.get('tab') || '')) {
    params.set('tab', hiringTab(data, provider));
  }
  return `/${provider ? 'service-provider' : 'household'}/hiring?${params}`;
}

export function notificationDestination(item: NotificationItem, profileType?: string | null): string | null {
  let metadata = item.metadata || item.data || {};
  if (typeof metadata === 'string') {
    try { metadata = JSON.parse(metadata); } catch { metadata = {}; }
  }
  const data = { ...item, ...item.variables, ...metadata };
  for (const value of [data.action_url, data.url, data.link, data.cta_url]) {
    if (typeof value !== 'string' || /[\\\r\n]/.test(value)) continue;
    try {
      const url = new URL(value, 'https://homebit.co.ke');
      // Normalize old http links to internal navigation without following other origins.
      if (url.hostname !== 'homebit.co.ke' || url.port || !['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
      if (/^\/(?:household\/|service-provider\/|househelp\/)?hiring\/?$/.test(url.pathname)) {
        const role = profileType || (url.pathname.startsWith('/household/') ? 'household' : url.pathname === '/hiring' ? '' : 'service_provider');
        return hiringDestination(role, url.search, data) + url.hash;
      }
      if (/^\/(inbox|household|service-provider|subscriptions|plans|account|verify)(\/|$)/.test(url.pathname)) {
        return url.pathname + url.search + url.hash;
      }
    } catch { /* Fall back to the event's type and identifiers. */ }
  }
  if (data.conversation_id) return `/inbox?conversation=${encodeURIComponent(data.conversation_id)}`;
  const kind = eventKind(data);
  if (/subscription|payment|billing|trial|plan/.test(kind)) return '/subscriptions';
  if (data.application_id || data.contract_id || /hire|hiring|application|contract|employment/.test(kind)) return hiringDestination(profileType, '', data);
  if (/message|chat|inbox/.test(kind)) return '/inbox';
  if (/review|rating/.test(kind)) return '/account/reviews';
  return null;
}
