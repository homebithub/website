import React from 'react';
import { Briefcase, Calendar, DollarSign, FileText, X } from 'lucide-react';

export type ChatHireRequest = {
  id: string;
  listing_id?: string | number | null;
  job_type?: string | null;
  listing_title?: string | null;
  start_date?: string | null;
  salary_offered?: number | string | null;
  salary_frequency?: string | null;
  status?: string | null;
  special_requirements?: string | null;
  work_schedule?: unknown;
  created_at?: string | null;
};

type Props = {
  request: ChatHireRequest;
  participantName?: string;
  onClose: () => void;
  onViewJob?: () => void;
  jobLoading?: boolean;
};

function humanize(value?: string | null, fallback = 'Not specified') {
  const text = String(value || '').trim();
  return text ? text.replace(/[-_]+/g, ' ') : fallback;
}

function formatDate(value?: string | null) {
  if (!value) return 'Not specified';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not specified'
    : date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSalary(request: ChatHireRequest) {
  const amount = Number(request.salary_offered);
  if (!Number.isFinite(amount) || amount <= 0) return 'Not specified';
  const frequency = humanize(request.salary_frequency, '').trim();
  return `KES ${amount.toLocaleString('en-KE')}${frequency ? ` / ${frequency}` : ''}`;
}

export default function ChatHireRequestDetailsModal({
  request,
  participantName,
  onClose,
  onViewJob,
  jobLoading = false,
}: Props) {
  const schedule = typeof request.work_schedule === 'string'
    ? request.work_schedule
    : request.work_schedule && typeof request.work_schedule === 'object'
      ? Object.entries(request.work_schedule as Record<string, unknown>)
          .filter(([, value]) => value !== null && value !== undefined && value !== '')
          .map(([key, value]) => `${humanize(key)}: ${String(value)}`)
          .join(' · ')
      : '';

  return (
    <div className="hb-mobile-modal-viewport fixed inset-0 z-[160] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-hire-request-title"
        className="max-h-[90dvh] w-full overflow-y-auto rounded-t-3xl border border-purple-500/40 bg-white shadow-2xl dark:bg-[#171122] sm:max-w-2xl sm:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-purple-200 bg-white/95 px-5 py-4 backdrop-blur dark:border-purple-700/50 dark:bg-[#171122]/95 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-600 dark:text-purple-300">Hire request details</p>
            <h2 id="chat-hire-request-title" className="mt-1 text-lg font-bold text-gray-950 dark:text-white">
              {humanize(request.listing_title || request.job_type, 'Hire request')}
            </h2>
            {participantName && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">With {participantName}</p>}
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-purple-300 p-2 text-purple-700 transition hover:bg-purple-50 dark:border-purple-600 dark:text-purple-200 dark:hover:bg-purple-900/30" aria-label="Close hire request details">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: Briefcase, label: 'Job', value: humanize(request.listing_title || request.job_type) },
              { icon: DollarSign, label: 'Salary', value: formatSalary(request) },
              { icon: Calendar, label: 'Start date', value: formatDate(request.start_date) },
              { icon: FileText, label: 'Requested on', value: formatDate(request.created_at) },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 dark:border-purple-700/50 dark:bg-purple-950/30">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300"><Icon className="h-4 w-4" />{label}</div>
                <p className="mt-2 break-words text-sm font-semibold capitalize text-gray-950 dark:text-white">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-purple-200 p-4 dark:border-purple-700/50">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">Status</p>
            <p className="mt-2 text-sm font-semibold capitalize text-gray-950 dark:text-white">{humanize(request.status)}</p>
          </div>

          {request.special_requirements && (
            <div className="rounded-2xl border border-purple-200 p-4 dark:border-purple-700/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">Special requirements</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-200">{request.special_requirements}</p>
            </div>
          )}

          {schedule && (
            <div className="rounded-2xl border border-purple-200 p-4 dark:border-purple-700/50">
              <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">Work schedule</p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-200">{schedule}</p>
            </div>
          )}
        </div>

        <footer className="sticky bottom-0 flex flex-col-reverse gap-2 border-t border-purple-200 bg-white/95 p-4 backdrop-blur dark:border-purple-700/50 dark:bg-[#171122]/95 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-purple-300 px-5 py-2 text-sm font-semibold text-purple-700 dark:border-purple-600 dark:text-purple-200">Close</button>
          {onViewJob && (
            <button type="button" onClick={onViewJob} disabled={jobLoading} className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2 text-sm font-semibold text-white shadow-md disabled:cursor-wait disabled:opacity-60">
              {jobLoading ? 'Loading job…' : 'View job listing'}
            </button>
          )}
        </footer>
      </section>
    </div>
  );
}
