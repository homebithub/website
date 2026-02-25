import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import type { Subscription, CancelReason, SubscriptionPlan } from '~/types/payments';
import { validateFeedback } from '~/utils/validation/payments';
import { formatDate } from '~/utils/formatting/currency';

interface CancelSubscriptionFlowProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: Subscription;
  availablePlans: SubscriptionPlan[];
  onCancel: (reason: CancelReason, feedback?: string) => Promise<void>;
  onPauseInstead: () => void;
  onDowngrade: (planId: string) => void;
}

const CANCEL_REASONS: { value: CancelReason; label: string }[] = [
  { value: 'price', label: 'Too expensive' },
  { value: 'features', label: 'Missing features I need' },
  { value: 'not_using', label: 'Not using the service' },
  { value: 'found_alternative', label: 'Found a better alternative' },
  { value: 'other', label: 'Other reason' },
];

export function CancelSubscriptionFlow({
  isOpen,
  onClose,
  subscription,
  availablePlans,
  onCancel,
  onPauseInstead,
  onDowngrade,
}: CancelSubscriptionFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [reason, setReason] = useState<CancelReason>('price');
  const [feedback, setFeedback] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const cheaperPlans = availablePlans.filter(
    (p) => p.is_active && p.price_amount < (subscription.plan?.price_amount || 0)
  );

  const handleClose = () => {
    if (!processing) {
      setStep(1);
      setReason('price');
      setFeedback('');
      setError('');
      setFeedbackError('');
      onClose();
    }
  };

  const handleContinueToReason = () => {
    setStep(2);
  };

  const handleContinueToConfirmation = () => {
    const validationError = validateFeedback(feedback);
    if (validationError) {
      setFeedbackError(validationError);
      return;
    }
    setStep(3);
  };

  const handleConfirmCancel = async () => {
    setProcessing(true);
    setError('');

    try {
      await onCancel(reason, feedback || undefined);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
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
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                {/* Step 1: Retention Offers */}
                {step === 1 && (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                        We'd Hate to See You Go
                      </Dialog.Title>
                      <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Before you cancel, consider these alternatives:
                    </p>

                    <div className="space-y-4">
                      {/* Pause Option */}
                      <button
                        onClick={() => {
                          handleClose();
                          onPauseInstead();
                        }}
                        className="w-full p-4 text-left bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-all"
                      >
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                          Pause Your Subscription Instead
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Take a break for 7-90 days. Your subscription will resume automatically.
                        </p>
                      </button>

                      {/* Downgrade Options */}
                      {cheaperPlans.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Or Downgrade to a Cheaper Plan
                          </h4>
                          {cheaperPlans.map((plan) => (
                            <button
                              key={plan.id}
                              onClick={() => {
                                handleClose();
                                onDowngrade(plan.id);
                              }}
                              className="w-full p-4 text-left bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-white">
                                    {plan.name}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {plan.description}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                    KES {(plan.price_amount / 100).toFixed(2)}
                                  </p>
                                  <p className="text-xs text-gray-500">/{plan.billing_cycle}</p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Continue with Cancellation */}
                      <button
                        onClick={handleContinueToReason}
                        className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        Continue with cancellation →
                      </button>
                    </div>
                  </>
                )}

                {/* Step 2: Reason Selection */}
                {step === 2 && (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setStep(1)}
                          disabled={processing}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                        >
                          <ArrowLeftIcon className="w-5 h-5" />
                        </button>
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                          Help Us Improve
                        </Dialog.Title>
                      </div>
                      <button
                        onClick={handleClose}
                        disabled={processing}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                      Please tell us why you're cancelling. Your feedback helps us improve.
                    </p>

                    <div className="space-y-4">
                      {/* Reason Selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Reason for Cancellation
                        </label>
                        <select
                          value={reason}
                          onChange={(e) => setReason(e.target.value as CancelReason)}
                          disabled={processing}
                          className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:border-purple-500 dark:focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                        >
                          {CANCEL_REASONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Feedback Textarea */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Additional Feedback (Optional)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => {
                            setFeedback(e.target.value);
                            setFeedbackError('');
                          }}
                          placeholder="Tell us more about your experience..."
                          maxLength={500}
                          rows={4}
                          disabled={processing}
                          className={`w-full px-4 py-2 border-2 rounded-xl focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-900/30 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 ${
                            feedbackError
                              ? 'border-red-500 focus:border-red-500'
                              : 'border-gray-300 dark:border-gray-600 focus:border-purple-500'
                          }`}
                        />
                        <div className="flex items-center justify-between mt-1">
                          {feedbackError && (
                            <p className="text-sm text-red-600 dark:text-red-400">{feedbackError}</p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                            {feedback.length}/500
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setStep(1)}
                          disabled={processing}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleContinueToConfirmation}
                          disabled={processing}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <>
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                        <ExclamationTriangleIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1">
                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                          Confirm Cancellation
                        </Dialog.Title>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Are you sure you want to cancel your subscription?
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Current Plan</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.plan?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Access Until</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(subscription.current_period_end)}
                        </span>
                      </div>
                    </div>

                    {/* Warning */}
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Important:</strong> You'll lose access to premium features on{' '}
                        {formatDate(subscription.current_period_end)}. No refunds will be issued for the
                        remaining time.
                      </p>
                    </div>

                    {error && <ErrorAlert message={error} className="mb-4" />}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(2)}
                        disabled={processing}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleConfirmCancel}
                        disabled={processing}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {processing ? 'Cancelling...' : 'Yes, Cancel My Subscription'}
                      </button>
                    </div>
                  </>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
