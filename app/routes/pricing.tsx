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
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchPlans();
  }, []); // Fetch plans immediately on page load - no authentication required

  
  const fetchPlans = async () => {
    try {
      console.log('[Pricing] Fetching plans from:', API_ENDPOINTS.payments.plans);
      
      // Public pricing page - no authentication required
      const response = await fetch(API_ENDPOINTS.payments.plans, {
        headers: { 'Content-Type': 'application/json' }
      });
      console.log('[Pricing] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Pricing] Plans data:', data);
        setPlans(data.plans || []);
      } else {
        const errorText = await response.text();
        console.error('[Pricing] Failed to fetch plans:', response.status, errorText);
      }
    } catch (error) {
      console.error('[Pricing] Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!user) {
      // Redirect to signup with plan information for post-signup flow
      const redirect = encodeURIComponent(location.pathname);
      navigate(`/signup?redirect=${redirect}&plan=${plan.id}`);
      return;
    }
    
    // Go directly to checkout
    initiateCheckout(plan);
  };

  const initiateCheckout = async (plan: SubscriptionPlan) => {
    // Check if user has phone number, otherwise prompt for it
    let phoneNumber = user?.phone;
    
    if (!phoneNumber) {
      const promptResult = prompt('Enter your M-Pesa phone number (e.g., +254 7XX XXX XXX):');
      phoneNumber = promptResult || '';
      if (!phoneNumber || !phoneNumber.trim()) {
        setErrorMessage('Phone number is required for payment');
        setProcessingPayment(false);
        setPaymentStatus('idle');
        return;
      }
      // Format phone number
      if (!phoneNumber.startsWith('+254')) {
        if (phoneNumber.startsWith('254')) {
          phoneNumber = `+${phoneNumber}`;
        } else if (phoneNumber.startsWith('0')) {
          phoneNumber = `+254${phoneNumber.slice(1)}`;
        } else {
          phoneNumber = `+254${phoneNumber}`;
        }
      }
    }

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
          plan_id: plan.id,
          phone_number: phoneNumber,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPaymentStatus('success');
        // Redirect to payment URL or handle success
        if (data.payment_url) {
          window.location.href = data.payment_url;
        } else {
          // Show success message or redirect to subscriptions
          navigate('/subscriptions?success=true');
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Checkout failed');
      }
    } catch (error) {
      console.error('[Pricing] Checkout error:', error);
      setPaymentStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred during checkout');
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
                    className="relative bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border-2 border-purple-100 dark:border-purple-500/30 p-8 hover:border-purple-300 dark:hover:border-purple-400 transition-all hover:scale-105 flex flex-col h-full"
                  >
                    <div className="text-center flex-1 flex flex-col">
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
                      <div className="mb-6 space-y-3 text-left flex-grow">
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
                        {/* Default features if specific limits aren't set */}
                        {!plan.max_profiles && !plan.max_applications && !plan.max_hires && (
                          <>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span>Full access to all features</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span>Priority support</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                              <CheckIcon className="w-5 h-5 text-green-500" />
                              <span>Advanced search filters</span>
                            </div>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={processingPayment}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {processingPayment ? (
                          <>
                            <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Select Plan'
                        )}
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

      {/* Payment Processing Overlay */}
      {processingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-sm mx-4 text-center">
            <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Processing Payment
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Initiating your subscription...
            </p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {paymentStatus === 'error' && errorMessage && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm">
          <p className="font-medium">Payment Error</p>
          <p className="text-sm">{errorMessage}</p>
          <button
            onClick={() => {
              setPaymentStatus('idle');
              setErrorMessage('');
            }}
            className="mt-2 text-xs underline"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
