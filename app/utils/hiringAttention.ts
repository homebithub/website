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

function storageKey(scope: string) {
  return `${STORAGE_PREFIX}:${scope}`;
}

function recordKey(kind: HiringAttentionKind, record: HiringAttentionRecord) {
  const id = String(record?.id ?? '').trim();
  return id ? `${kind}:${id}` : '';
}

function recordVersion(record: HiringAttentionRecord) {
  return [
    String(record?.status ?? '').trim().toLowerCase(),
    String(record?.created_at ?? record?.createdAt ?? '').trim(),
  ].join('|');
}

function readLedger(scope: string): Record<string, string> {
  if (typeof window === 'undefined' || !scope) return {};
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(scope)) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function isHiringRecordUnattended(
  scope: string,
  kind: HiringAttentionKind,
  record: HiringAttentionRecord,
) {
  const key = recordKey(kind, record);
  if (!scope || !key) return false;
  return readLedger(scope)[key] !== recordVersion(record);
}

export function countUnattendedHiringRecords(
  scope: string,
  groups: Array<{ kind: HiringAttentionKind; records: HiringAttentionRecord[] }>,
) {
  const seen = new Set<string>();
  let total = 0;
  for (const group of groups) {
    for (const record of group.records) {
      const key = recordKey(group.kind, record);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      if (isHiringRecordUnattended(scope, group.kind, record)) total += 1;
    }
  }
  return total;
}

export function markHiringRecordAttended(
  scope: string,
  kind: HiringAttentionKind,
  record: HiringAttentionRecord,
) {
  if (typeof window === 'undefined') return false;
  const key = recordKey(kind, record);
  if (!scope || !key || !isHiringRecordUnattended(scope, kind, record)) return false;
  const ledger = readLedger(scope);
  ledger[key] = recordVersion(record);
  window.localStorage.setItem(storageKey(scope), JSON.stringify(ledger));
  window.dispatchEvent(new CustomEvent('hiring-attention-updated', { detail: { scope, kind, id: record.id } }));
  window.dispatchEvent(new Event('hiring-updated'));
  return true;
}

export function hiringAttentionScope(profileId?: string | null, role?: string | null) {
  const id = String(profileId || '').trim();
  const normalizedRole = String(role || '').trim().toLowerCase();
  return id && normalizedRole ? `${normalizedRole}:${id}` : '';
}
