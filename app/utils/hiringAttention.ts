const STORAGE_PREFIX = 'homebit:hiring-attention:v1';

export type HiringAttentionKind = 'application' | 'request' | 'employment-contract' | 'work';

export interface HiringAttentionRecord {
  id?: string | number | null;
  status?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
}

interface ServerAttentionRow {
  kind?: string | null;
  record_id?: string | null;
  version?: string | null;
}

const serverLedgers = new Map<string, Record<string, string>>();
const hydrationRequests = new Map<string, Promise<void>>();

function storageKey(scope: string) { return `${STORAGE_PREFIX}:${scope}`; }

function scopeProfileId(scope: string) {
  return scope.includes(':') ? scope.slice(scope.indexOf(':') + 1) : '';
}

function recordKey(kind: HiringAttentionKind, record: HiringAttentionRecord) {
  const id = String(record?.id ?? '').trim();
  return id ? `${kind}:${id}` : '';
}

export function hiringRecordVersion(record: HiringAttentionRecord) {
  return [
    String(record?.status ?? '').trim().toLowerCase(),
    String(record?.updated_at ?? record?.updatedAt ?? record?.created_at ?? record?.createdAt ?? '').trim(),
  ].join('|');
}

function readLedger(scope: string): Record<string, string> {
  if (typeof window === 'undefined' || !scope) return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(scope)) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch { return {}; }
}

function dispatchAttentionUpdate(scope: string, kind?: HiringAttentionKind, id?: string | number | null) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('hiring-attention-updated', { detail: { scope, kind, id } }));
  window.dispatchEvent(new Event('hiring-updated'));
}

/** Hydrate the attended ledger from the authenticated backend for this profile. */
export async function hydrateHiringAttention(scope: string) {
  if (typeof window === 'undefined' || !scope || serverLedgers.has(scope)) return;
  const profileId = scopeProfileId(scope);
  if (!profileId) return;
  const existing = hydrationRequests.get(scope);
  if (existing) return existing;

  const request = (async () => {
    try {
      const { clientProfileService } = await import('~/services/grpc/authServices');
      const response = await clientProfileService.getHiringAttention(profileId);
      const rows = Array.isArray(response?.data) ? response.data as ServerAttentionRow[] : [];
      const ledger: Record<string, string> = {};
      for (const row of rows) {
        const kind = String(row?.kind ?? '').trim() as HiringAttentionKind;
        const id = String(row?.record_id ?? '').trim();
        if (kind && id) ledger[`${kind}:${id}`] = String(row?.version ?? '');
      }
      serverLedgers.set(scope, ledger);
      dispatchAttentionUpdate(scope);
    } catch {
      // Keep the local cache available when the profile service is temporarily offline.
    } finally {
      hydrationRequests.delete(scope);
    }
  })();
  hydrationRequests.set(scope, request);
  return request;
}

export function isHiringRecordUnattended(scope: string, kind: HiringAttentionKind, record: HiringAttentionRecord) {
  const key = recordKey(kind, record);
  if (!scope || !key) return false;
  const version = hiringRecordVersion(record);
  const ledger = serverLedgers.get(scope);
  if (ledger) return ledger[key] !== version;
  return readLedger(scope)[key] !== version;
}

export function countUnattendedHiringRecords(
  scope: string,
  groups: Array<{ kind: HiringAttentionKind; records: HiringAttentionRecord[] }>,
) {
  const seen = new Set<string>();
  let total = 0;
  for (const group of groups) for (const record of group.records) {
    const key = recordKey(group.kind, record);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    if (isHiringRecordUnattended(scope, group.kind, record)) total += 1;
  }
  return total;
}

export function markHiringRecordAttended(scope: string, kind: HiringAttentionKind, record: HiringAttentionRecord) {
  if (typeof window === 'undefined') return false;
  const key = recordKey(kind, record);
  if (!scope || !key || !isHiringRecordUnattended(scope, kind, record)) return false;
  const version = hiringRecordVersion(record);
  const ledger = serverLedgers.get(scope) ?? readLedger(scope);
  ledger[key] = version;
  serverLedgers.set(scope, ledger);
  window.localStorage.setItem(storageKey(scope), JSON.stringify(ledger));
  dispatchAttentionUpdate(scope, kind, record.id);

  const profileId = scopeProfileId(scope);
  if (profileId) void import('~/services/grpc/authServices')
    .then(({ clientProfileService }) => clientProfileService.markHiringRecordAttended({
      userProfileId: profileId, kind, recordId: String(record.id), version,
    }))
    .catch(() => {
      // The server is authoritative. Roll back an optimistic local mark when
      // persistence fails so a refresh/device does not contradict this tab.
      delete ledger[key];
      serverLedgers.set(scope, ledger);
      window.localStorage.setItem(storageKey(scope), JSON.stringify(ledger));
      dispatchAttentionUpdate(scope, kind, record.id);
    });
  return true;
}

export function hiringAttentionScope(profileId?: string | null, role?: string | null) {
  const id = String(profileId || '').trim();
  const rawRole = String(role || '').trim().toLowerCase();
  // Navigation used service-provider/client while the pages used
  // househelp/household, creating two independent ledgers for one profile.
  const normalizedRole = ['service-provider', 'svc_pvd', 'househelp'].includes(rawRole)
    ? 'househelp'
    : ['client', 'clt', 'household'].includes(rawRole)
      ? 'household'
      : rawRole;
  return id && normalizedRole ? `${normalizedRole}:${id}` : '';
}
