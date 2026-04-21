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
