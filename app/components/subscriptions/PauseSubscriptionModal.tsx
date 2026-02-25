import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import type { Subscription, PauseReason } from '~/types/payments';
import { validatePauseDuration } from '~/utils/validation/payments';
import { formatDate, calculateResumeDate } from '~/utils/formatting/currency';

interface PauseSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  onSuccess: (resumeDate: string) => void;
  onPause: (reason: PauseReason, durationDays: number) => Promise<void>;
}

const DURATION_OPTIONS = [
  { value: 7, label: '1 Week (7 days)' },
  { value: 14, label: '2 Weeks (14 days)' },
  { value: 30, label: '1 Month (30 days)' },
  { value: 60, label: '2 Months (60 days)' },
  { value: 90, label: '3 Months (90 days)' },
];

const REASON_OPTIONS: { value: PauseReason; label: string }[] = [
  { value: 'vacation', label: 'Going on vacation' },
  { value: 'financial', label: 'Financial reasons' },
  { value: 'not_using', label: 'Not using the service' },
  { value: 'other', label: 'Other' },
];

export function PauseSubscriptionModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
  onPause,
}: PauseSubscriptionModalProps) {
  const [durationDays, setDurationDays] = useState(30);
  const [reason, setReason] = useState<PauseReason>('vacation');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const resumeDate = calculateResumeDate(durationDays);
  const accessUntil = subscription.current_period_end;

  const handleSubmit = async () => {
    const validationError = validatePauseDuration(durationDays);
    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);
    setError('');

    try {
      await onPause(reason, durationDays);
      onSuccess(resumeDate);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to pause subscription');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => !processing && onClose()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="flex items-start justify-between mb-4">
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Pause Your Subscription
                  </Dialog.Title>
                  <button
                    onClick={() => !processing && onClose()}
                    disabled={processing}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {/* Info Box */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    <strong>What happens when you pause:</strong>
                  </p>
                  <ul className="mt-2 text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                    <li>You keep access until {formatDate(accessUntil)}</li>
                    <li>Billing pauses for the selected duration</li>
                    <li>Your subscription resumes automatically</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  {/* Duration Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Pause Duration
                    </label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(Number(e.target.value))}
                      disabled={processing}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      {DURATION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reason Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reason for Pausing
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value as PauseReason)}
                      disabled={processing}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      {REASON_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Resume Date Preview */}
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-2">
                      <ClockIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Resume Date
                      </p>
                    </div>
                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {formatDate(resumeDate)}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      Your subscription will automatically resume on this date
                    </p>
                  </div>

                  {error && <ErrorAlert message={error} />}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => !processing && onClose()}
                      disabled={processing}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                      {processing ? 'Pausing...' : 'Pause Subscription'}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
