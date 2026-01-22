import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useLocation } from "react-router";
import { Dialog, Transition } from '@headlessui/react';
import { 
  CheckIcon, 
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import { API_ENDPOINTS, getAuthHeaders } from '~/config/api';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  billing_cycle: string;
  features: any;
  max_profiles?: number;
  max_applications?: number;
  max_hires?: number;
  is_active: boolean;
}

export default function Pricing() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    if (user && user.phone) {
      setPhoneNumber(user.phone);
    }
  }, [user]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.payments.plans);
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${redirect}`);
      return;
    }
    setSelectedPlan(plan);
    setShowCheckoutModal(true);
    setPaymentStatus('idle');
    setErrorMessage('');
  };

  const handleCheckout = async () => {
    if (!selectedPlan || !phoneNumber || !user) return;

    setProcessingPayment(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.payments.checkout, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          phone_number: phoneNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus('success');
        
        // Wait a moment then redirect to subscriptions page
        setTimeout(() => {
          setShowCheckoutModal(false);
          navigate('/subscriptions');
        }, 3000);
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Payment initiation failed');
        setPaymentStatus('error');
      }
    } catch (error: any) {
      console.error('Checkout failed:', error);
      setErrorMessage(error.message || 'An error occurred');
      setPaymentStatus('error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatPhoneNumber = (phone: string) => {
    // Ensure phone starts with +254
    if (!phone) return '';
    if (phone.startsWith('+254')) return phone;
    if (phone.startsWith('254')) return `+${phone}`;
    if (phone.startsWith('0')) return `+254${phone.slice(1)}`;
    if (phone.startsWith('7') || phone.startsWith('1')) return `+254${phone}`;
    return phone;
  };

  if (authLoading || loading) {
    return <Loading text="Loading plans..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="medium" className="flex-1">
        <main className="flex-1 container mx-auto px-4 py-8 min-h-[calc(100vh-200px)] flex flex-col items-center justify-center">
          <div className="mx-auto max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
              <SparklesIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Test Mode: Only KES 1.00 charged</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl mb-4">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Select a subscription plan to access premium features
            </p>
          </div>

          <div className="mt-12 w-full max-w-6xl">
            {plans.length === 0 ? (
              <div className="text-center py-12 bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border border-purple-100 dark:border-purple-500/30">
                <p className="text-gray-600 dark:text-gray-300">No plans available at the moment</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.filter(p => p.is_active).map((plan) => (
                  <div
                    key={plan.id}
                    className="relative bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border-2 border-purple-100 dark:border-purple-500/30 p-8 hover:border-purple-300 dark:hover:border-purple-400 transition-all hover:scale-105"
                  >
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {plan.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                        {plan.description}
                      </p>
                      <div className="mb-6">
                        <span className="text-4xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(plan.price_amount)}
                        </span>
                        <span className="text-gray-600 dark:text-gray-300 ml-2">/ {plan.billing_cycle}</span>
                      </div>
                      <div className="mb-6 space-y-3 text-left">
                        {plan.max_profiles && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <CheckIcon className="w-5 h-5 text-green-500" />
                            <span>Up to {plan.max_profiles} profiles</span>
                          </div>
                        )}
                        {plan.max_applications && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <CheckIcon className="w-5 h-5 text-green-500" />
                            <span>Up to {plan.max_applications} applications</span>
                          </div>
                        )}
                        {plan.max_hires && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <CheckIcon className="w-5 h-5 text-green-500" />
                            <span>Up to {plan.max_hires} hires</span>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                      >
                        Select Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {/* Checkout Modal */}
      <Transition appear show={showCheckoutModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => !processingPayment && setShowCheckoutModal(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                      Confirm Payment
                    </Dialog.Title>
                    {!processingPayment && (
                      <button
                        onClick={() => setShowCheckoutModal(false)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        <XMarkIcon className="w-6 h-6" />
                      </button>
                    )}
                  </div>

                  {paymentStatus === 'processing' ? (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Check your phone for M-Pesa prompt
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Enter your M-Pesa PIN to complete payment
                      </p>
                    </div>
                  ) : paymentStatus === 'success' ? (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Payment Initiated Successfully!
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Redirecting to subscriptions...
                      </p>
                    </div>
                  ) : paymentStatus === 'error' ? (
                    <div className="text-center py-8">
                      <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                        Payment Failed
                      </p>
                      <p className="text-sm text-red-500 dark:text-red-400">
                        {errorMessage}
                      </p>
                      <button
                        onClick={() => {
                          setPaymentStatus('idle');
                          setErrorMessage('');
                        }}
                        className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedPlan && (
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                            {selectedPlan.name}
                          </h4>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-300">Plan Amount:</span>
                            <span className="font-bold text-gray-900 dark:text-white">
                              {formatCurrency(selectedPlan.price_amount)}
                            </span>
                          </div>
                          <div className="mt-2 pt-2 border-t border-purple-200 dark:border-purple-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">Test Charge:</span>
                              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                KES 1.00
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          M-Pesa Phone Number
                        </label>
                        <input
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+254712345678"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Confirm or update your phone number for payment
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <div className="flex gap-2">
                          <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-blue-700 dark:text-blue-300">
                            <p className="font-medium mb-1">What happens next?</p>
                            <ul className="list-disc list-inside space-y-1 text-xs">
                              <li>You'll receive an M-Pesa prompt on your phone</li>
                              <li>Enter your M-Pesa PIN to confirm</li>
                              <li>Your subscription will be activated immediately</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => setShowCheckoutModal(false)}
                          disabled={processingPayment}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCheckout}
                          disabled={!phoneNumber || processingPayment}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                        >
                          {processingPayment ? 'Processing...' : 'Pay KES 1.00'}
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
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
