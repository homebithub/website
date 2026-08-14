import { X } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

export interface HiringDetailField {
  label: string;
  value?: ReactNode;
}

interface HiringCardModalProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  imageUrl?: string;
  initials?: string;
  status?: string;
  summary?: ReactNode;
  fields: HiringDetailField[];
  details?: ReactNode;
  message?: ReactNode;
  actions?: ReactNode;
}

export function HiringCardModal({ open, onClose, eyebrow, title, imageUrl, initials, status, summary, fields, details, message, actions }: HiringCardModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="hb-mobile-modal-viewport fixed inset-0 z-[120] flex items-end justify-center p-0 sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label={`${title} details`}>
      <button type="button" aria-label="Close details" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <section className="hb-mobile-modal-panel relative w-full overflow-y-auto rounded-t-3xl border border-purple-500/30 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-2xl dark:bg-[#140a24] sm:max-w-2xl sm:rounded-3xl">
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-purple-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-purple-800/50 dark:bg-[#140a24]/95 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            {(imageUrl || initials) && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-sm ring-2 ring-purple-200 dark:ring-purple-700">
                {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full w-full items-center justify-center text-sm font-bold">{initials}</span>}
              </div>
            )}
            <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-500">{eyebrow}</p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="break-words text-lg font-bold text-gray-950 dark:text-white">{title}</h2>
              {status && <span className="rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-semibold capitalize text-purple-700 dark:bg-purple-900/50 dark:text-purple-200">{status.replace(/[_-]/g, ' ')}</span>}
            </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-purple-200 p-2 text-gray-500 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-200 dark:hover:bg-purple-900/40" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="space-y-5 px-5 py-5 sm:px-7 sm:py-6">
          {summary && <div className="rounded-2xl bg-purple-50 p-4 text-sm text-gray-700 dark:bg-purple-950/60 dark:text-purple-100">{summary}</div>}
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {fields.filter((field) => field.value !== undefined && field.value !== null && field.value !== '').map((field) => (
              <div key={field.label} className="rounded-2xl border border-purple-100 p-3 dark:border-purple-800/50">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-gray-400 dark:text-purple-400">{field.label}</dt>
                <dd className="mt-1 break-words text-sm font-semibold text-gray-900 dark:text-white">{field.value}</dd>
              </div>
            ))}
          </dl>
          {details && <div>{details}</div>}
          {message && <div className="rounded-2xl border border-purple-100 p-4 dark:border-purple-800/50"><p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-purple-500">Message / notes</p><div className="whitespace-pre-wrap text-sm text-gray-700 dark:text-purple-100">{message}</div></div>}
        </div>
        {actions && <footer className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-purple-100 bg-white/95 px-5 py-4 backdrop-blur dark:border-purple-800/50 dark:bg-[#140a24]/95 sm:px-7">{actions}</footer>}
      </section>
    </div>
  );
}

export function isHiringCardAction(target: EventTarget | null) {
  // The card itself has role="button" for keyboard/accessibility semantics.
  // Including [role="button"] here made every descendant look like an action,
  // because closest() eventually found the card and suppressed its modal.
  return target instanceof Element && Boolean(target.closest('button, a, input, select, textarea'));
}
