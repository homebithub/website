import { useEffect, useRef, useState } from 'react';
import { Bell, BellOff, Bookmark, Check, Loader2, Trash2, X } from 'lucide-react';

export type SavedFilterEntry<T> = { name: string; filters: T; notify?: boolean };

type Props<T> = {
  saved: Array<SavedFilterEntry<T>>;
  hasActiveFilters: boolean;
  onSave: (name: string, notify: boolean) => Promise<void>;
  onApply: (name: string) => void;
  onDelete: (name: string) => Promise<void>;
  /** What a subscription would tell them about, e.g. "new jobs" or "new househelps". */
  notifySubject: string;
};

/**
 * Naming a filter, applying one, and asking to hear about matches.
 *
 * Saving is deliberately gated on there being something to save: an empty
 * filter set under a name means "everything", and subscribing to it would send
 * a notification for every listing on the platform. The person would unsubscribe
 * from us entirely rather than fix the filter.
 */
export function SavedFilterBar<T>({
  saved,
  hasActiveFilters,
  onSave,
  onApply,
  onDelete,
  notifySubject,
}: Props<T>) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState('');
  const [notify, setNotify] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (naming) inputRef.current?.focus();
  }, [naming]);

  const existing = saved.find((item) => item.name === name.trim());

  const submit = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      await onSave(name.trim(), notify);
      setNaming(false);
      setName('');
      setNotify(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save that filter');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4 border-t border-purple-100/70 pt-3 dark:border-purple-500/20">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          <Bookmark className="h-3.5 w-3.5" />
          Saved searches
        </span>

        {saved.length === 0 && !naming && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            None yet — set your filters, then save them under a name.
          </span>
        )}

        {saved.map((item) => (
          <span
            key={item.name}
            className="group inline-flex items-center gap-1 rounded-full border border-purple-200/70 bg-white/80 pl-3 pr-1 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50 dark:border-purple-500/40 dark:bg-white/10 dark:text-purple-200 dark:hover:bg-purple-500/10"
          >
            <button type="button" onClick={() => onApply(item.name)} className="max-w-[14rem] truncate">
              {item.name}
            </button>
            {item.notify ? (
              <Bell className="h-3 w-3 shrink-0 text-pink-500" aria-label={`Notifying about ${notifySubject}`} />
            ) : (
              <BellOff className="h-3 w-3 shrink-0 text-gray-400" aria-hidden="true" />
            )}
            <button
              type="button"
              onClick={() => void onDelete(item.name)}
              aria-label={`Delete saved search ${item.name}`}
              className="rounded-full p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-300"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}

        {!naming && (
          <button
            type="button"
            onClick={() => setNaming(true)}
            disabled={!hasActiveFilters}
            title={hasActiveFilters ? undefined : 'Choose some filters first'}
            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-purple-300 px-3 py-1 text-xs font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-purple-500/40 dark:text-purple-200 dark:hover:bg-purple-500/10"
          >
            <Bookmark className="h-3.5 w-3.5" />
            Save this search
          </button>
        )}
      </div>

      {naming && (
        <div className="mt-3 flex flex-col gap-2 rounded-xl border border-purple-200/70 bg-white/80 p-3 dark:border-purple-500/40 dark:bg-white/5">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              value={name}
              onChange={(event) => setName(event.target.value.slice(0, 60))}
              onKeyDown={(event) => {
                if (event.key === 'Enter') void submit();
                if (event.key === 'Escape') setNaming(false);
              }}
              placeholder="Name this search — e.g. Live-in, Westlands"
              aria-label="Name for this saved search"
              className="h-9 min-w-0 w-full flex-1 rounded-lg border border-purple-200/70 bg-white px-3 text-sm text-gray-800 outline-none focus:border-purple-400 sm:min-w-[16rem] dark:border-purple-500/40 dark:bg-white/10 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => void submit()}
              disabled={!name.trim() || busy}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {existing ? 'Update' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => setNaming(false)}
              aria-label="Cancel saving this search"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <label className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={notify}
              onChange={(event) => setNotify(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-purple-400 accent-purple-600 focus:ring-purple-500"
            />
            <span>
              Tell me about {notifySubject} that match this search. You will get a notification here, and
              an email if your address is confirmed.
            </span>
          </label>

          {existing && (
            <p className="text-xs text-amber-600 dark:text-amber-300">
              A search called “{existing.name}” already exists — saving will replace it.
            </p>
          )}
          {error && <p className="text-xs text-red-600 dark:text-red-300">{error}</p>}
        </div>
      )}
    </div>
  );
}
