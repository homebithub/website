type HousehelpCardDetailsProps = {
  description?: string;
  workTypes: string[];
  availability: string;
  schedule?: string | null;
  experience: string;
  salary: string;
  worksWith?: string[];
};

/**
 * Desktop-only detail panel for househelp discovery cards. Mobile keeps the
 * compact chips and summary already used by the marketplace.
 */
export function HousehelpCardDetails({
  description,
  workTypes,
  availability,
  schedule,
  experience,
  salary,
  worksWith = [],
}: HousehelpCardDetailsProps) {
  const facts = [
    { label: 'Preferred work', value: workTypes.length > 0 ? workTypes.join(', ') : 'Flexible role' },
    { label: 'Available from', value: availability },
    { label: 'Schedule', value: schedule || 'Flexible' },
    { label: 'Experience', value: experience },
    { label: 'Expected pay', value: salary },
    ...(worksWith.length > 0 ? [{ label: 'Can work with', value: worksWith.join(' and ') }] : []),
  ];

  return (
    <div className="hidden min-w-0 lg:block">
      {description && (
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">About</p>
          <p className="mt-1 line-clamp-3 text-xs leading-5 text-gray-700 dark:text-gray-200">{description}</p>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-x-8 gap-y-3">
        {facts.map((fact) => (
          <div key={fact.label} className="min-w-0">
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">{fact.label}</dt>
            <dd className="mt-0.5 line-clamp-2 text-xs font-medium text-gray-800 dark:text-gray-100">{fact.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
