/**
 * Reads the feature picks a job listing carries.
 *
 * A listing's real substance — what it pays, when it starts, how often, live-in
 * or not — is not columns on the listing. It is rows in the feature catalogue,
 * which the BFF resolves into `listing_feature_groups` before the listing ever
 * reaches a component. Cards and modals were reading `salary_range` and
 * `start_date` instead, fields no listing has ever carried, which is why every
 * card said "Not specified" no matter what the household filled in.
 *
 * Everything here works off the groups, so a surface only has to decide which
 * facts it has room for.
 */

/** One feature and the values a listing chose for it, ready to display. */
export type FeatureGroup = {
  featureId: number;
  /** Humanised: "Salary Range", not "SalaryRange". */
  name: string;
  /** The catalogue name, for looking a feature up by identity. */
  key: string;
  properties: string[];
};

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';

/**
 * Turns a catalogue identifier into something a person would read.
 *
 * Every feature in the catalogue is named as one PascalCase token —
 * SalaryRange, EngagementFrequency, WashingMachineAvailable — because the column
 * is a unique key that matching code compares against. Those names were being
 * shown to households verbatim as form headings.
 *
 * Renaming them in the database is the wrong fix: the name is the identity, and
 * the seed migrations, the matching rules and the job-type bundles all join on
 * it. So the split happens here, at the point of display.
 */
export function humanizeFeatureName(raw: unknown): string {
  const name = text(raw);
  if (!name) return '';
  // Already spaced, so it is either prose or a name someone has fixed at source.
  if (/\s/.test(name)) return name;

  return name
    .replace(/[_-]+/g, ' ')
    // An acronym runs into the next word without a case change to split on:
    // KYCStatus has to break as KYC | Status, not K | Y | C | Status.
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    // The ordinary boundary: a lowercase or digit followed by a capital.
    .replace(/([a-z\d])([A-Z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .trim();
}

type RawGroup = {
  feature_id?: unknown;
  featureId?: unknown;
  feature_name?: unknown;
  name?: unknown;
  properties?: unknown;
};

/**
 * Normalises whatever `listing_feature_groups` shape arrived into one the UI can
 * rely on, dropping groups the household left empty.
 */
export function readFeatureGroups(listing: unknown): FeatureGroup[] {
  const record = listing && typeof listing === 'object' ? (listing as Record<string, unknown>) : {};
  const raw = record.listing_feature_groups;
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry): FeatureGroup => {
      const group = (entry ?? {}) as RawGroup;
      const key = text(group.feature_name) || text(group.name);
      return {
        featureId: Number(group.feature_id ?? group.featureId ?? 0) || 0,
        key,
        name: humanizeFeatureName(key) || 'Feature',
        properties: Array.isArray(group.properties)
          ? group.properties.map(text).filter(Boolean)
          : [],
      };
    })
    .filter((group) => group.properties.length > 0);
}

/**
 * The values a listing chose for one catalogue feature, by its catalogue name.
 *
 * Matched case-insensitively and ignoring spacing, so a caller can ask for
 * "SalaryRange" whether or not the name has already been humanised upstream.
 */
export function featureValues(groups: FeatureGroup[], key: string): string[] {
  const wanted = key.replace(/\s+/g, '').toLowerCase();
  const found = groups.find((group) => group.key.replace(/\s+/g, '').toLowerCase() === wanted);
  return found ? found.properties : [];
}

/** Joined values for one feature, or '' when the household did not answer it. */
export function featureValue(groups: FeatureGroup[], key: string): string {
  return featureValues(groups, key).join(', ');
}

/**
 * Catalogue names for the facts a card has room for.
 *
 * A card is a screening decision — near me, affordable, available when I am —
 * so it carries these three and nothing else. Everything the household filled
 * in is still shown, in the details modal.
 */
export const CARD_FEATURE_KEYS = ['SalaryRange', 'StartTiming'] as const;

export type ListingHighlights = {
  /** Joined salary values, e.g. "monthly: 10,000-15,000 KES". */
  salary: string;
  /** When the job starts, e.g. "Immediately". */
  startTiming: string;
};

/** The card-facing facts, read out of the listing's feature picks. */
export function listingHighlights(listing: unknown): ListingHighlights {
  const groups = readFeatureGroups(listing);
  return {
    salary: featureValue(groups, 'SalaryRange'),
    startTiming: featureValue(groups, 'StartTiming'),
  };
}

/**
 * Everything else, for a details modal: the groups a card did not have room for,
 * in catalogue order, with the card's own facts left out so they are not stated
 * twice on the same screen.
 */
export function remainingFeatureGroups(listing: unknown): FeatureGroup[] {
  const skip = new Set<string>(CARD_FEATURE_KEYS.map((key) => key.toLowerCase()));
  return readFeatureGroups(listing).filter(
    (group) => !skip.has(group.key.replace(/\s+/g, '').toLowerCase()),
  );
}
