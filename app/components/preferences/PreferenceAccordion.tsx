import { ChevronDown, Check } from 'lucide-react';
import type { ReactNode } from 'react';

export function PreferenceAccordion({
  title,
  summary,
  complete = false,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary?: string;
  complete?: boolean;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-purple-100 bg-purple-50/60 dark:border-purple-500/25 dark:bg-purple-950/15">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs ${complete ? 'border-purple-600 bg-purple-600 text-white' : 'border-purple-200 text-purple-600 dark:border-purple-500/40 dark:text-purple-300'}`}>
            {complete ? <Check className="h-4 w-4" /> : '•'}
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-gray-900 dark:text-white">{title}</span>
            {summary ? <span className="block truncate text-xs text-gray-500 dark:text-gray-400">{summary}</span> : null}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-purple-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="border-t border-purple-100 px-4 py-4 dark:border-purple-500/20">{children}</div> : null}
    </section>
  );
}
