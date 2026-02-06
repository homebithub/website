import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useLocation } from "react-router";
import { Dialog, Transition, Tab } from '@headlessui/react';
import { 
  CheckIcon, 
  XMarkIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
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
  profile_type?: string;
  trial_days?: number;
  features: any;
  max_profiles?: number;
  max_applications?: number;
  max_hires?: number;
  is_active: boolean;
}

interface PaymentResponse {
  subscription_id: string;
  payment_id: string;
  transaction_id: string;
  status: string;
  message: string;
  amount: number;
}

export default function Pricing() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'processing' | 'success' | 'failed' | 'timeout'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    fetchPlans();
    if (user?.phone) {
      setPhoneNumber(formatPhoneNumber(user.phone));
    }
  }, [user]);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.payments.plans, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        console.error('Failed to fetch plans:', response.status);
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
      navigate(`/signup?redirect=${redirect}&plan=${plan.id}`);
      return;
    }
    
    setSelectedPlan(plan);
    setPhoneNumber(formatPhoneNumber(user?.phone || ''));
    setPaymentStatus('idle');
    setErrorMessage('');
    setShowPaymentModal(true);
  };

  const initiatePayment = async () => {
    if (!selectedPlan || !phoneNumber) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    // Validate phone number format
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(formattedPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., +254712345678)');
      return;
    }

    setProcessingPayment(true);
    setPaymentStatus('initiating');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated - please login again');
      }

      const response = await fetch(API_ENDPOINTS.payments.checkout, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          phone_number: formattedPhone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentPaymentId(data.payment_id);
        setPaymentStatus('processing');
        startPollingPaymentStatus(data.payment_id);
      } else {
        throw new Error(data.message || data.error || 'Failed to initiate payment');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const startPollingPaymentStatus = (paymentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    let attempts = 0;
    const maxAttempts = 60; // Poll for up to 3 minutes (60 * 3 seconds)

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await fetch(API_ENDPOINTS.payments.transactions.status(paymentId), {
          headers: getAuthHeaders(token),
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.status === 'completed') {
            setPaymentStatus('success');
            clearInterval(interval);
            setPollingInterval(null);
            setProcessingPayment(false);
            
            // Redirect to subscriptions page after 2 seconds
            setTimeout(() => {
              navigate('/subscriptions?payment=success');
            }, 2000);
          } else if (data.status === 'failed') {
            setPaymentStatus('failed');
            setErrorMessage(data.failure_reason || 'Payment failed. Please try again.');
            clearInterval(interval);
            setPollingInterval(null);
            setProcessingPayment(false);
          }
          // If still processing, continue polling
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPollingInterval(null);
        setPaymentStatus('timeout');
        setErrorMessage('Payment is taking longer than expected. Please check your payment history.');
        setProcessingPayment(false);
      }
    }, 3000); // Poll every 3 seconds

    setPollingInterval(interval);
  };

  const handleRetry = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setCurrentPaymentId(null);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  const handleCloseModal = () => {
    if (processingPayment) return; // Don't allow closing while processing
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setShowPaymentModal(false);
    setPaymentStatus('idle');
    setErrorMessage('');
    setCurrentPaymentId(null);
    setProcessingPayment(false);
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    phone = phone.replace(/\s/g, ''); // Remove spaces
    
    if (phone.startsWith('+254')) return phone;
    if (phone.startsWith('254')) return `+${phone}`;
    if (phone.startsWith('0')) return `+254${phone.slice(1)}`;
    if (phone.startsWith('7') || phone.startsWith('1')) return `+254${phone}`;
    return phone;
  };

  const isValidPhoneNumber = (phone: string) => {
    // Kenyan phone numbers: +254 followed by 9 digits (7XX or 1XX)
    const regex = /^\+254[71]\d{8}$/;
    return regex.test(phone);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      'monthly': 'month',
      'semi-annual': '6 months',
      'yearly': 'year'
    };
    return labels[cycle] || cycle;
  };

  const getFeaturesList = (features: any) => {
    const featureList = [];
    
    if (features.messaging) featureList.push('Unlimited messaging');
    if (features.profile_views) featureList.push(`${features.profile_views === 'unlimited' ? 'Unlimited' : features.profile_views} profile views`);
    if (features.search_filters) featureList.push(`${features.search_filters} search filters`);
    if (features.priority_support) featureList.push('Priority support');
    if (features.background_checks) featureList.push('Background checks');
    if (features.verified_profiles) featureList.push('Verified profiles access');
    if (features.direct_messaging) featureList.push('Direct messaging');
    if (features.profile_verification) featureList.push('Profile verification');
    if (features.job_applications) featureList.push(`${features.job_applications === 'unlimited' ? 'Unlimited' : features.job_applications} job applications`);
    if (features.profile_visibility) featureList.push('Enhanced profile visibility');
    if (features.job_alerts) featureList.push('Job alerts');
    if (features.application_tracking) featureList.push('Application tracking');
    
    return featureList;
  };

  const householdPlans = plans.filter(p => p.is_active && p.profile_type === 'household');
  const househelpPlans = plans.filter(p => p.is_active && p.profile_type === 'househelp');

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
            <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
              <Tab.List className="flex space-x-1 rounded-xl bg-white/90 dark:bg-[#13131a]/95 p-1 shadow-light-glow-lg dark:shadow-glow-lg border border-purple-100 dark:border-purple-500/30 max-w-md mx-auto mb-8">
                <Tab
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all
                    ${
                      selected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`
                  }
                >
                  Households
                </Tab>
                <Tab
                  className={({ selected }) =>
                    `w-full rounded-lg py-3 text-sm font-medium leading-5 transition-all
                    ${
                      selected
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                    }`
                  }
                >
                  Househelps
                </Tab>
              </Tab.List>
              
              <Tab.Panels>
                {/* Household Plans */}
                <Tab.Panel>
                  {householdPlans.length === 0 ? (
                    <div className="text-center py-12 bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border border-purple-100 dark:border-purple-500/30">
                      <p className="text-gray-600 dark:text-gray-300">No household plans available at the moment</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-500/30">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            30-Day Free Trial
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Try all features risk-free for 30 days. Cancel anytime during the trial period.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {householdPlans.map((plan, index) => {
                          const features = getFeaturesList(plan.features);
                          const savings = plan.features?.savings;
                          
                          return (
                            <div
                              key={plan.id}
                              className={`relative bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border-2 p-8 hover:scale-105 transition-all flex flex-col h-full ${
                                index === 2 
                                  ? 'border-purple-400 dark:border-purple-400 ring-2 ring-purple-300 dark:ring-purple-500' 
                                  : 'border-purple-100 dark:border-purple-500/30 hover:border-purple-300 dark:hover:border-purple-400'
                              }`}
                            >
                              {index === 2 && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    Best Value
                                  </span>
                                </div>
                              )}
                              
                              <div className="text-center flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                  {plan.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                  {plan.description}
                                </p>
                                
                                {savings && (
                                  <div className="mb-4 bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                    <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                                      {savings}
                                    </p>
                                  </div>
                                )}
                                
                                <div className="mb-6">
                                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(plan.price_amount)}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-300 ml-2">
                                    / {getBillingCycleLabel(plan.billing_cycle)}
                                  </span>
                                </div>
                                
                                <div className="mb-6 space-y-3 text-left flex-grow">
                                  {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                <button
                                  onClick={() => handleSelectPlan(plan)}
                                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                                >
                                  Start Free Trial
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </Tab.Panel>

                {/* Househelp Plans */}
                <Tab.Panel>
                  {househelpPlans.length === 0 ? (
                    <div className="text-center py-12 bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border border-purple-100 dark:border-purple-500/30">
                      <p className="text-gray-600 dark:text-gray-300">No househelp plans available at the moment</p>
                    </div>
                  ) : (
                    <>
                      <div className="text-center mb-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-500/30">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <SparklesIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            30-Day Free Trial
                          </h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">
                          Try all features risk-free for 30 days. One-time annual payment after trial.
                        </p>
                      </div>
                      
                      <div className="max-w-md mx-auto">
                        {househelpPlans.map((plan) => {
                          const features = getFeaturesList(plan.features);
                          
                          return (
                            <div
                              key={plan.id}
                              className="relative bg-white/90 dark:bg-[#13131a]/95 rounded-3xl shadow-light-glow-lg dark:shadow-glow-lg border-2 border-purple-400 dark:border-purple-400 ring-2 ring-purple-300 dark:ring-purple-500 p-8 flex flex-col"
                            >
                              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg">
                                  Recommended
                                </span>
                              </div>
                              
                              <div className="text-center flex-1 flex flex-col">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                  {plan.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                                  {plan.description}
                                </p>
                                
                                <div className="mb-6">
                                  <span className="text-5xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(plan.price_amount)}
                                  </span>
                                  <span className="text-gray-600 dark:text-gray-300 ml-2 block mt-2">
                                    per year
                                  </span>
                                  <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold mt-2">
                                    Just KES 83/month
                                  </p>
                                </div>
                                
                                <div className="mb-6 space-y-3 text-left flex-grow">
                                  {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                                      <CheckIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                                
                                <button
                                  onClick={() => handleSelectPlan(plan)}
                                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                                >
                                  Start Free Trial
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {/* Payment Modal */}
      <Transition appear show={showPaymentModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
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
                  {paymentStatus === 'idle' && (
                    <>
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <PhoneIcon className="w-6 h-6 text-purple-600" />
                        M-Pesa Payment
                      </Dialog.Title>

                      <div className="space-y-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Plan</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">
                            {selectedPlan?.name}
                          </p>
                          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                            {selectedPlan && formatCurrency(selectedPlan.price_amount)}
                          </p>
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
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white text-lg"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Enter number in format: +254XXXXXXXXX
                          </p>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                            What happens next?
                          </p>
                          <ol className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-decimal list-inside">
                            <li>You'll receive an M-Pesa prompt on your phone</li>
                            <li>Enter your M-Pesa PIN to authorize payment</li>
                            <li>You'll receive a confirmation SMS</li>
                            <li>Your subscription will be activated immediately</li>
                          </ol>
                        </div>

                        {errorMessage && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-red-800 dark:text-red-300">{errorMessage}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={handleCloseModal}
                            disabled={processingPayment}
                            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={initiatePayment}
                            disabled={!phoneNumber || processingPayment}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {paymentStatus === 'initiating' && (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Initiating Payment...
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please wait while we process your request
                      </p>
                    </div>
                  )}

                  {paymentStatus === 'processing' && (
                    <div className="text-center py-8">
                      <div className="relative">
                        <PhoneIcon className="w-16 h-16 mx-auto mb-4 text-green-600" />
                        <div className="absolute top-0 right-1/2 translate-x-1/2">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Check Your Phone
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        You'll receive a prompt from <strong>Fingo Payment Services</strong>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter your M-Pesa PIN to complete payment
                      </p>
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-left">
                        <p className="text-xs text-blue-800 dark:text-blue-300 mb-2">
                          <strong>Didn't receive the prompt?</strong>
                        </p>
                        <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
                          <li>Check if your phone is on</li>
                          <li>Ensure you have network coverage</li>
                          <li>Wait a few seconds and check again</li>
                        </ul>
                      </div>
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Waiting for payment confirmation...</span>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'success' && (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 text-green-500" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment Successful!
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Your subscription has been activated
                      </p>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <p className="text-sm text-green-800 dark:text-green-300">
                          You'll receive an M-Pesa confirmation SMS shortly
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                        Redirecting to your subscriptions...
                      </p>
                    </div>
                  )}

                  {paymentStatus === 'failed' && (
                    <div className="text-center py-8">
                      <XCircleIcon className="w-20 h-20 mx-auto mb-4 text-red-500" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment Failed
                      </p>
                      {errorMessage && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                          <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
                            Reason:
                          </p>
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {errorMessage}
                          </p>
                        </div>
                      )}
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300 mb-2">
                          <strong>Common reasons for failure:</strong>
                        </p>
                        <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside text-left">
                          <li>Insufficient M-Pesa balance</li>
                          <li>Wrong PIN entered</li>
                          <li>Request cancelled or timed out</li>
                          <li>Network connectivity issues</li>
                        </ul>
                      </div>
                      <button
                        onClick={handleRetry}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {paymentStatus === 'timeout' && (
                    <div className="text-center py-8">
                      <ClockIcon className="w-20 h-20 mx-auto mb-4 text-yellow-500" />
                      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment Pending
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Your payment is taking longer than expected
                      </p>
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 mb-4">
                        <p className="text-sm text-yellow-800 dark:text-yellow-300">
                          Please check your payment history or M-Pesa messages to confirm if the payment went through.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate('/subscriptions')}
                          className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                          View History
                        </button>
                        <button
                          onClick={handleRetry}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                        >
                          Try Again
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

export { ErrorBoundary } from "~/components/ErrorBoundary";
