import { remainingFeatureGroups } from '~/utils/listingFeatures';

type ListingCardFactsProps = { listing: unknown; limit?: number; className?: string };

/** Uses the otherwise empty middle of wide cards without lengthening mobile cards. */
export function ListingCardFacts({ listing, limit = 4, className = '' }: ListingCardFactsProps) {
  const groups = remainingFeatureGroups(listing).slice(0, limit);
  if (groups.length === 0) return null;

  return (
    <dl className={`hidden min-w-0 grid-cols-2 gap-x-6 gap-y-3 lg:grid ${className}`}>
      {groups.map((group) => (
        <div key={`${group.featureId}-${group.key}`} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{group.name}</dt>
          <dd className="mt-0.5 line-clamp-2 text-xs font-medium text-gray-800 dark:text-gray-100">{group.properties.join(', ')}</dd>
        </div>
      ))}
    </dl>
  );
}
