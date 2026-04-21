import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router';

type SubscriptionRequiredModalProps = {
  open: boolean;
  onClose: () => void;
  status?: string | null;
  actionLabel?: string;
  plansHref?: string;
};

export function SubscriptionRequiredModal({
  open,
  onClose,
  status,
  actionLabel = 'continue',
  plansHref = '/plans',
}: SubscriptionRequiredModalProps) {
  if (!open) return null;

  const description =
    status === 'expired'
      ? `Your subscription has expired. Renew your plan to ${actionLabel}.`
      : `You need an active subscription or free trial to ${actionLabel}. Choose a plan to get started.`;

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-md bg-white dark:bg-[#13131a] rounded-t-2xl sm:rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 shadow-xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto sm:mx-4"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <XMarkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Subscription Required</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { title: 'Unlimited messaging', desc: 'Send and receive messages with households and househelps' },
            { title: 'Hiring actions included', desc: 'Send hire requests and express interest when the time is right' },
            { title: 'Free trial available', desc: 'Start with a free trial before moving onto a paid plan' },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3 p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-500/20">
              <CheckCircleIcon className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-900 dark:text-white">{item.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <Link
          to={plansHref}
          onClick={onClose}
          className="block w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-center text-xs font-bold text-white shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          View Plans &amp; Pricing
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-3 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 py-2 transition-colors"
        >
          Maybe later
        </button>
      </div>
    </div>
  );
}
