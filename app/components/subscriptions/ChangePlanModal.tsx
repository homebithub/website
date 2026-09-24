import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import type { Subscription, SubscriptionPlan } from '~/types/payments';
import { formatCurrency, formatDate } from '~/utils/formatting/currency';
import { subscriptionPeriodEnd } from '~/utils/subscriptionSchedule';

interface ChangePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSubscription: Subscription;
  newPlan: SubscriptionPlan;
  startsAt: Date;
  onConfirm: (newPlanId: string) => Promise<void>;
}

export function ChangePlanModal({ isOpen, onClose, currentSubscription, newPlan, startsAt, onConfirm }: ChangePlanModalProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const continueToPayment = async () => {
    setProcessing(true);
    setError('');
    try { await onConfirm(newPlan.id); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not open checkout. Please try again.'); }
    finally { setProcessing(false); }
  };
  return <Transition appear show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={() => !processing && onClose()}>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="hb-mobile-modal-viewport fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
          <Dialog.Panel className="hb-mobile-modal-panel w-full sm:max-w-lg overflow-y-auto rounded-t-2xl sm:rounded-2xl border border-purple-200 bg-white dark:bg-[#13131a] dark:border-purple-500/30 p-6 shadow-xl max-h-[90dvh]">
            <div className="flex items-start justify-between gap-4 mb-6">
              <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">Change Subscription Plan</Dialog.Title>
              <button aria-label="Close" disabled={processing} onClick={onClose} className="rounded-full border border-purple-200 p-2 text-gray-500 dark:border-purple-500/30 dark:text-purple-200"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="space-y-5 text-sm text-gray-700 dark:text-gray-300">
              <p>Your current {currentSubscription.plan?.name || 'subscription'} remains unchanged. After payment succeeds, <strong>{newPlan.name}</strong> will start after your current coverage ends.</p>
              <dl className="space-y-3 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-500/30 dark:bg-purple-500/10">
                <div className="flex justify-between gap-3"><dt>Pay now</dt><dd className="font-semibold">{formatCurrency(newPlan.price_amount)}</dd></div>
                <div className="flex justify-between gap-3"><dt>New package starts</dt><dd>{formatDate(startsAt.toISOString())}</dd></div>
                <div className="flex justify-between gap-3"><dt>New expiry after payment</dt><dd>{formatDate(subscriptionPeriodEnd(startsAt, newPlan.billing_cycle).toISOString())}</dd></div>
              </dl>
              <p>Continue to confirm your M-Pesa phone number. If you cancel or do not complete payment, your subscription will not change. No unused time is deducted and no new free trial is added.</p>
              {error && <ErrorAlert message={error} />}
              <div className="flex gap-3">
                <button disabled={processing} onClick={onClose} className="flex-1 rounded-xl border border-purple-200 px-4 py-2 dark:border-purple-500/30">Not now</button>
                <button disabled={processing} onClick={continueToPayment} className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 font-semibold text-white hover:from-purple-700 hover:to-pink-700 disabled:opacity-50">{processing ? 'Opening…' : 'Continue to payment'}</button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  </Transition>;
}
