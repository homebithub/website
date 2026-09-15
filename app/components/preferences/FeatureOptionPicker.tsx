import { Check, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

export type PreferenceOption = { id: number; label: string; description?: string };

export function FeatureOptionPicker({
  options,
  selected,
  onToggle,
  multiple = true,
  searchThreshold = 12,
}: {
  options: PreferenceOption[];
  selected: number[];
  onToggle: (id: number) => void;
  multiple?: boolean;
  searchThreshold?: number;
}) {
  const [query, setQuery] = useState('');
  const searchable = options.length > searchThreshold;
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? options.filter((option) => option.label.toLowerCase().includes(needle)) : options;
  }, [options, query]);
  const selectedOptions = options.filter((option) => selected.includes(option.id));

  return (
    <div>
      {searchable ? (
        <label className="relative mb-3 block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 w-full rounded-xl border border-purple-200 bg-white pl-9 pr-9 text-sm text-gray-900 outline-none focus:border-purple-500 dark:border-purple-500/30 dark:bg-[#0f0b1a] dark:text-white"
            placeholder={`Search ${options.length} options`}
          />
          {query ? (
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      ) : null}

      {searchable && selectedOptions.length > 0 ? (
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <button key={option.id} type="button" onClick={() => onToggle(option.id)} className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-500/20 dark:text-purple-100">
              {option.label}<X className="h-3 w-3" />
            </button>
          ))}
        </div>
      ) : null}

      <div className={searchable ? 'max-h-64 overflow-y-auto rounded-xl border border-purple-100 p-2 dark:border-purple-500/20' : 'flex flex-wrap gap-2'}>
        {visible.map((option) => {
          const active = selected.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              title={option.description}
              onClick={() => onToggle(option.id)}
              aria-pressed={active}
              className={searchable
                ? `flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${active ? 'bg-purple-100 font-semibold text-purple-800 dark:bg-purple-500/20 dark:text-purple-100' : 'text-gray-700 hover:bg-purple-50 dark:text-gray-200 dark:hover:bg-purple-950/30'}`
                : `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${active ? 'border-purple-300 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/20' : 'border-purple-200 bg-white text-gray-700 hover:border-purple-400 dark:border-slate-600 dark:bg-slate-950/45 dark:text-gray-200'}`}
            >
              <span>{option.label}</span>
              {active ? <Check className="h-3.5 w-3.5" /> : null}
            </button>
          );
        })}
        {visible.length === 0 ? <p className="px-3 py-5 text-center text-xs text-gray-500">No matching options</p> : null}
      </div>
      {!multiple ? <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">Choose one option.</p> : null}
    </div>
  );
}
