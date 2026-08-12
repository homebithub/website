function normalizeId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function collectIds(...values: Array<unknown>): string[] {
  const ids = values.map(normalizeId).filter((value): value is string => Boolean(value));
  return Array.from(new Set(ids));
}

export function getHouseholdCandidateIds(record: any): string[] {
  return collectIds(
    record?.household_id,
    record?.household_user_id,
    record?.household_profile_id,
    record?.household?.id,
    record?.household?.profile_id,
    record?.household?.user_id,
    record?.household?.owner_user_id,
    record?.household?.owner?.id,
  );
}

export function getHousehelpCandidateIds(record: any): string[] {
  return collectIds(
    record?.househelp_id,
    record?.househelp_user_id,
    record?.househelp_profile_id,
    record?.househelp?.id,
    record?.househelp?.profile_id,
    record?.househelp?.user_id,
    record?.househelp?.user?.id,
  );
}

export function buildIdentifierMap<T>(items: T[], getIdentifiers: (item: T) => string[]): Record<string, T> {
  const map: Record<string, T> = {};
  for (const item of items) {
    for (const identifier of getIdentifiers(item)) {
      if (!map[identifier]) {
        map[identifier] = item;
      }
    }
  }
  return map;
}

export function findByAnyIdentifier<T>(map: Record<string, T>, identifiers: string[]): T | undefined {
  for (const identifier of identifiers) {
    if (map[identifier]) {
      return map[identifier];
    }
  }
  return undefined;
}

/**
 * Index contracts by their application, including records created by the old
 * two-step form. Those legacy rows point at the original draft through
 * hire_contract_id; resolving that pointer keeps already-signed contracts from
 * leaving the application in the attention queue.
 */
export function buildApplicationContractMap<T extends Record<string, any>>(items: T[]): Record<string, T> {
  const byId = new Map(items.map((item) => [String(item.id ?? ''), item]));
  const result: Record<string, T> = {};
  const statusRank = (item: T) => {
    const status = String(item.storage_status || item.status || '').toLowerCase();
    if (['active', 'signed_by_both', 'completed'].includes(status)) return 3;
    if (['forwarded', 'partially_signed', 'pending_househelp'].includes(status)) return 2;
    return 1;
  };

  for (const item of items) {
    const source = item.hire_contract_id ? byId.get(String(item.hire_contract_id)) : undefined;
    const applicationId = String(item.application_id || source?.application_id || '');
    if (!applicationId) continue;
    const key = `application:${applicationId}`;
    if (!result[key] || statusRank(item) > statusRank(result[key])) result[key] = item;
  }
  return result;
}

/**
 * Contracts created by the older form do not always retain application_id.
 * They still carry the listing and househelp, which together identify the
 * exact relationship without preventing the household from hiring a different
 * person for the same advert.
 */
export function buildListingHousehelpContractMap<T extends Record<string, any>>(items: T[]): Record<string, T> {
  const result: Record<string, T> = {};
  const rank = (item: T) => {
    const status = String(item.storage_status || item.status || '').toLowerCase();
    if (['active', 'signed_by_both', 'fully_signed'].includes(status)) return 4;
    if (['forwarded', 'partially_signed', 'pending_househelp'].includes(status)) return 3;
    if (status === 'draft') return 2;
    return 1;
  };
  for (const item of items) {
    const listingId = normalizeId(item.listing_id);
    if (!listingId) continue;
    for (const househelpId of getHousehelpCandidateIds(item)) {
      const key = `listing-househelp:${listingId}:${househelpId}`;
      if (!result[key] || rank(item) > rank(result[key])) result[key] = item;
    }
  }
  return result;
}

export function collapseApplicationContracts<T extends Record<string, any>>(items: T[]): T[] {
  const applicationContracts = buildApplicationContractMap(items);
  const selected = new Set(Object.values(applicationContracts));
  const byId = new Map(items.map((item) => [String(item.id ?? ''), item]));
  return items.filter((item) => {
    if (selected.has(item)) return true;
    const source = item.hire_contract_id ? byId.get(String(item.hire_contract_id)) : undefined;
    return !item.application_id && !source?.application_id;
  });
}
