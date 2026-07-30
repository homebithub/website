/**
 * Formats the place a listing or a person is in, for display on a card.
 *
 * Locations reach the browser in three shapes, because they were stored three
 * ways over time: a listing now carries ward/subcounty/county names resolved by
 * the auth service, a profile carries a location object holding the same names,
 * and older records hold only a free-text string. A card should not have to know
 * which it got.
 */

type PlaceParts = {
  ward?: unknown;
  subcounty?: unknown;
  county?: unknown;
  /** Older records: whatever free text was typed at the time. */
  place?: unknown;
  name?: unknown;
  town?: unknown;
};

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';

/**
 * Joins the parts of a place, most specific first.
 *
 * Ward and subcounty together — "Kitisuru, Westlands" — tell someone far more
 * about whether the distance works than either alone. County is omitted: a
 * browse is almost always already inside one, so repeating it on every card is
 * noise.
 */
function joinParts(parts: PlaceParts): string {
  const ward = text(parts.ward);
  const subcounty = text(parts.subcounty);
  const joined = [ward, subcounty].filter(Boolean).join(', ');
  if (joined) return joined;

  // Nothing from the hierarchy, so fall back to whatever free text exists.
  return text(parts.place) || text(parts.name) || text(parts.town) || '';
}

/**
 * Names the place held in a location field of unknown shape.
 *
 * `extra` supplies fields that live beside the location rather than inside it —
 * a profile's `town` column, say — so a caller does not have to merge them
 * itself.
 */
export function formatPlace(location: unknown, extra?: PlaceParts): string {
  if (typeof location === 'string' && location.trim()) return location.trim();

  const record = location && typeof location === 'object' ? (location as PlaceParts) : {};
  return joinParts({ ...extra, ...record }) || joinParts(extra ?? {});
}

/** What to show when there is genuinely nothing recorded. */
export const NO_PLACE = 'Location not specified';

/** formatPlace with the standard fallback text, for card display. */
export function formatPlaceOrFallback(location: unknown, extra?: PlaceParts): string {
  return formatPlace(location, extra) || NO_PLACE;
}

/**
 * Names where a listing is.
 *
 * Listings carry the resolved names at the top level, alongside ward_id. A card
 * must never show the id: it is a catalogue key, meaningless to a househelp
 * judging a commute.
 */
export function formatListingPlace(listing: PlaceParts & { location?: unknown }): string {
  const joined = joinParts(listing);
  if (joined) return joined;
  return formatPlace(listing.location) || NO_PLACE;
}
