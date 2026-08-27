type PersonName = {
  preferred_name?: unknown;
  preferredName?: unknown;
  first_name?: unknown;
  firstName?: unknown;
  last_name?: unknown;
  lastName?: unknown;
};

const words = (value: unknown) => String(value || '').trim().split(/\s+/).filter(Boolean);

/** Marketplace display names are limited to two tokens without changing the
 * verified/legal name stored for KYC, contracts, receipts, or administration. */
export function formatDisplayName(
  personOrFirst?: PersonName | unknown,
  last?: unknown,
  fallback = 'Homebit user',
): string {
  const person = personOrFirst && typeof personOrFirst === 'object'
    ? personOrFirst as PersonName
    : null;
  const firstTokens = words(person
    ? person.preferred_name || person.preferredName || person.first_name || person.firstName
    : personOrFirst);
  const lastTokens = words(person ? person.last_name || person.lastName : last);
  if (!person && (last === undefined || last === null || String(last).trim() === '') && firstTokens.length > 1) {
    return `${firstTokens[0]} ${firstTokens[firstTokens.length - 1]}`;
  }
  const first = firstTokens[0] || '';
  const surname = lastTokens[lastTokens.length - 1] || '';
  return [first, surname].filter(Boolean).join(' ') || fallback;
}
