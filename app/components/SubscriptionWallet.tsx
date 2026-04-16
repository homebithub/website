import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  WalletIcon, 
  XMarkIcon, 
  CreditCardIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import { paymentsService } from '~/services/grpc/payments.service';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  billing_cycle: string;
  features: any;
  is_active: boolean;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  metadata?: Record<string, any>;
  plan?: SubscriptionPlan;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  phone_number?: string;
  mpesa_receipt_number?: string;
  paid_at?: string;
  created_at: string;
}

export function SubscriptionWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSubscriptionData();
    }
  }, [isOpen]);

  const fetchSubscriptionData = async () => {
    setLoading(true);
    try {
      try {
        const subData = await paymentsService.getMySubscription('') as any;
        setSubscription(subData?.toObject?.() ?? subData);
      } catch { /* ignore */ }

      try {
        const paymentsData = await paymentsService.listMyPayments('', 0, 10) as any;
        const paymentsList = paymentsData?.toObject?.()?.paymentsList ?? paymentsData?.payments ?? [];
        setPayments(paymentsList);
      } catch { /* ignore */ }

      try {
        const plansData = await paymentsService.getPlans() as any;
        const plansList = plansData?.toObject?.()?.plansList ?? plansData?.plans ?? [];
        setPlans(plansList);
      } catch { /* ignore */ }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async () => {
    if (!subscription || !phoneNumber) return;

    setProcessingPayment(true);
    setPaymentStatus('initiating');

    try {
      const data = await paymentsService.initiatePayment('', subscription.id, phoneNumber, paymentAmount || subscription.plan?.price_amount || 0) as any;
      const result = data?.toObject?.() ?? data;
      setCurrentPaymentId(result.paymentId || result.payment_id);
      setPaymentStatus('processing');
      pollPaymentStatus(result.paymentId || result.payment_id);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setTimeout(() => setPaymentStatus(null), 3000);
    } finally {
      setProcessingPayment(false);
    }
  };

  const pollPaymentStatus = async (paymentId: string) => {
    const maxAttempts = 20; // Poll for up to 60 seconds (20 * 3s)
    let attempts = 0;

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await paymentsService.checkPaymentStatus(paymentId, '') as any;
        const data = response?.toObject?.() ?? response;

        if (data) {
          if (data.status === 'completed') {
            setPaymentStatus('completed');
            clearInterval(interval);
            setShowPaymentModal(false);
            fetchSubscriptionData(); // Refresh data
            setTimeout(() => {
              setPaymentStatus(null);
              setCurrentPaymentId(null);
            }, 3000);
          } else if (data.status === 'failed') {
            setPaymentStatus('failed');
            clearInterval(interval);
            setTimeout(() => {
              setPaymentStatus(null);
              setCurrentPaymentId(null);
            }, 3000);
          }
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPaymentStatus('timeout');
        setTimeout(() => {
          setPaymentStatus(null);
          setCurrentPaymentId(null);
        }, 3000);
      }
    }, 3000);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateVal: any): string => {
    if (!dateVal) return '\u2014';
    let d: Date;
    if (typeof dateVal === 'object' && 'seconds' in dateVal) {
      d = new Date(Number(dateVal.seconds) * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return '\u2014';
    return d.toLocaleDateString('en-KE', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; icon: any; text: string }> = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon, text: 'Active' },
      trial: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: ClockIcon, text: 'Trial' },
      past_due: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon, text: 'Past Due' },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircleIcon, text: 'Cancelled' },
      expired: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400', icon: XCircleIcon, text: 'Expired' },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircleIcon, text: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400', icon: ClockIcon, text: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400', icon: ArrowPathIcon, text: 'Processing' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400', icon: XCircleIcon, text: 'Failed' },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.text}
      </span>
    );
  };

  return (
    <>
      {/* Wallet Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative flex items-center gap-2 px-4 py-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <WalletIcon className="w-5 h-5" />
        <span className="hidden sm:inline font-medium">Subscription</span>
        {subscription && subscription.status === 'trial' && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
        )}
      </button>

      {/* Main Modal */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
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
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full sm:max-w-4xl transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                  <Dialog.Title as="div" className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                        <WalletIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Subscription & Wallet
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Manage your subscription and payments
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <XMarkIcon className="w-6 h-6 text-gray-500" />
                    </button>
                  </Dialog.Title>

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <ArrowPathIcon className="w-8 h-8 animate-spin text-purple-500" />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Current Subscription */}
                      {subscription ? (
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {subscription.plan?.name || 'Current Plan'}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {subscription.plan?.description}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {subscription.metadata?.early_adopter && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                                  Early Adopter
                                </span>
                              )}
                              {getStatusBadge(subscription.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                              <p className="text-lg font-bold text-gray-900 dark:text-white">
                                {formatCurrency(subscription.plan?.price_amount || 0)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Billing Cycle</p>
                              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                                {subscription.plan?.billing_cycle}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Period Start</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(subscription.current_period_start)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Period End</p>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatDate(subscription.current_period_end)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setPaymentAmount(subscription.plan?.price_amount || 0);
                              setShowPaymentModal(true);
                            }}
                            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                          >
                            <CreditCardIcon className="w-5 h-5" />
                            Make Payment Now
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500 dark:text-gray-400 mb-4">No active subscription</p>
                          <button className="px-6 py-1 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors">
                            View Plans
                          </button>
                        </div>
                      )}

                      {/* Payment History */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                          <BanknotesIcon className="w-5 h-5" />
                          Payment History
                        </h4>
                        
                        {payments.length > 0 ? (
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {payments.map((payment) => (
                              <div
                                key={payment.id}
                                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {formatCurrency(payment.amount)}
                                    </p>
                                    {getStatusBadge(payment.status)}
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(payment.created_at)}
                                    {payment.mpesa_receipt_number && (
                                      <span className="ml-2">• Receipt: {payment.mpesa_receipt_number}</span>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {payment.payment_method}
                                  </p>
                                  {payment.phone_number && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                      {payment.phone_number}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                            No payment history yet
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Payment Modal */}
      <Transition appear show={showPaymentModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processingPayment && setShowPaymentModal(false)}>
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
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                  <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    Make Payment
                  </Dialog.Title>

                  {paymentStatus ? (
                    <div className="text-center py-8">
                      {paymentStatus === 'initiating' && (
                        <div>
                          <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                          <p className="text-gray-700 dark:text-gray-300">Initiating payment...</p>
                        </div>
                      )}
                      {paymentStatus === 'processing' && (
                        <div>
                          <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                          <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                            Check your phone for M-Pesa prompt
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Enter your M-Pesa PIN to complete payment
                          </p>
                        </div>
                      )}
                      {paymentStatus === 'completed' && (
                        <div>
                          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Payment Successful!
                          </p>
                        </div>
                      )}
                      {paymentStatus === 'failed' && (
                        <div>
                          <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Payment Failed
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Please try again
                          </p>
                        </div>
                      )}
                      {paymentStatus === 'timeout' && (
                        <div>
                          <ClockIcon className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                          <p className="text-gray-700 dark:text-gray-300 font-medium">
                            Payment Pending
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Check payment history for status
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Amount
                        </label>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(paymentAmount)}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          M-Pesa Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+254712345678"
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter number in format: +254XXXXXXXXX
                        </p>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowPaymentModal(false)}
                          disabled={processingPayment}
                          className="flex-1 px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={initiatePayment}
                          disabled={!phoneNumber || processingPayment}
                          className="flex-1 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                          Pay Now
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
    </>
  );
}
