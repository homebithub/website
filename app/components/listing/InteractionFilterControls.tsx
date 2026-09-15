type InteractionFilterControlsProps = {
  hideSaved: boolean;
  hideContacted: boolean;
  hideApplied?: boolean;
  contactedLabel?: string;
  onChange: (name: 'hideSaved' | 'hideContacted' | 'hideApplied', checked: boolean) => void;
};

export function InteractionFilterControls({
  hideSaved,
  hideContacted,
  hideApplied,
  contactedLabel = 'Messaged or contacted',
  onChange,
}: InteractionFilterControlsProps) {
  const options = [
    { name: 'hideSaved' as const, checked: hideSaved, label: 'Saved' },
    { name: 'hideContacted' as const, checked: hideContacted, label: contactedLabel },
    ...(hideApplied === undefined
      ? []
      : [{ name: 'hideApplied' as const, checked: hideApplied, label: 'Applied jobs' }]),
  ];

  return (
    <fieldset className="rounded-xl border border-purple-200/70 p-3 dark:border-purple-500/30 sm:col-span-2 lg:col-span-3">
      <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Hide from results
      </legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((option) => (
          <label key={option.name} className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-200">
            <input
              type="checkbox"
              checked={option.checked}
              onChange={(event) => onChange(option.name, event.target.checked)}
              className="h-4 w-4 rounded border-purple-300 text-purple-600 focus:ring-purple-500"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
