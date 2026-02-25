import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ArrowRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import type { Subscription, SubscriptionPlan, ProrationDetails } from '~/types/payments';
import { formatCurrency, formatDate } from '~/utils/formatting/currency';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: Subscription;
  newPlan: SubscriptionPlan;
  onPreview: (newPlanId: string) => Promise<ProrationDetails>;
  onConfirm: (newPlanId: string) => Promise<void>;
}

export function ChangePlanModal({
  isOpen,
  onClose,
  currentSubscription,
  newPlan,
  onPreview,
  onConfirm,
}: ChangePlanModalProps) {
  const [proration, setProration] = useState<ProrationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadProration();
    }
  }, [isOpen, newPlan.id]);

  const loadProration = async () => {
    setLoading(true);
    setError('');
    try {
      const prorationData = await onPreview(newPlan.id);
      setProration(prorationData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load proration preview');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setProcessing(true);
    setError('');

    try {
      await onConfirm(newPlan.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change plan');
    } finally {
      setProcessing(false);
    }
  };

  const isUpgrade = proration && proration.net_amount > 0;
  const isDowngrade = proration && proration.net_amount < 0;

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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                    Change Subscription Plan
                  </Dialog.Title>
                  <button
                    onClick={() => !processing && onClose()}
                    disabled={processing}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <ArrowPathIcon className="w-8 h-8 animate-spin text-purple-500" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Plan Comparison */}
                    <div className="flex items-center gap-4">
                      {/* Current Plan */}
                      <div className="flex-1 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Plan</p>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {currentSubscription.plan?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatCurrency(currentSubscription.plan?.price_amount || 0)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          /{currentSubscription.plan?.billing_cycle}
                        </p>
                      </div>

                      {/* Arrow */}
                      <ArrowRightIcon className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0" />

                      {/* New Plan */}
                      <div className="flex-1 p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700">
                        <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">New Plan</p>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {newPlan.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {formatCurrency(newPlan.price_amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          /{newPlan.billing_cycle}
                        </p>
                      </div>
                    </div>

                    {/* Proration Breakdown */}
                    {proration && (
                      <>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-3">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Proration Breakdown
                          </h4>

                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Unused credit from current plan
                              </span>
                              <span className="font-medium text-green-600 dark:text-green-400">
                                +{formatCurrency(proration.unused_credit)}
                              </span>
                            </div>

                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-400">
                                Prorated charge for new plan
                              </span>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(proration.prorated_charge)}
                              </span>
                            </div>

                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                              <div className="flex justify-between">
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  Net Amount
                                </span>
                                <span className={`text-lg font-bold ${
                                  isUpgrade
                                    ? 'text-purple-600 dark:text-purple-400'
                                    : 'text-green-600 dark:text-green-400'
                                }`}>
                                  {formatCurrency(Math.abs(proration.net_amount))}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Days used: {proration.days_used}</span>
                              <span>Days remaining: {proration.days_remaining}</span>
                              <span>Total: {proration.total_days} days</span>
                            </div>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-gray-300 pt-2">
                            {proration.description}
                          </p>
                        </div>

                        {/* Payment Summary */}
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Payment Summary
                          </h4>

                          {isUpgrade && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              You'll be charged{' '}
                              <strong className="text-purple-600 dark:text-purple-400">
                                {formatCurrency(proration.net_amount)}
                              </strong>{' '}
                              now
                            </p>
                          )}

                          {isDowngrade && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                              <strong className="text-green-600 dark:text-green-400">
                                {formatCurrency(Math.abs(proration.net_amount))}
                              </strong>{' '}
                              will be added to your credit balance
                            </p>
                          )}

                          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                            <p>
                              Next billing date:{' '}
                              <strong className="text-gray-900 dark:text-white">
                                {formatDate(new Date(Date.now() + proration.days_remaining * 24 * 60 * 60 * 1000).toISOString())}
                              </strong>
                            </p>
                            <p>
                              Next billing amount:{' '}
                              <strong className="text-gray-900 dark:text-white">
                                {formatCurrency(newPlan.price_amount)}
                              </strong>
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {error && <ErrorAlert message={error} />}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => !processing && onClose()}
                        disabled={processing}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleConfirm}
                        disabled={processing || !proration}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {processing ? 'Processing...' : 'Confirm Plan Change'}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
