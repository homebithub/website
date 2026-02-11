import { useNavigate, useLocation } from "react-router";
import React, { useEffect, useState, Fragment } from "react";
import { Dialog, Transition } from '@headlessui/react';
import { 
  WalletIcon, 
  XMarkIcon, 
  CreditCardIcon, 
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BanknotesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
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
  is_active: boolean;
}

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
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
  subscription_id?: string;
  failure_reason?: string;
}

export default function SubscriptionsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dataLoading, setDataLoading] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  console.log('[Subscriptions] Initial phone number state:', user?.phone || 'No user phone');
  
  // Add console log to track phone number changes
  useEffect(() => {
    console.log('[Subscriptions] Phone number state changed to:', phoneNumber);
  }, [phoneNumber]);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'processing' | 'success' | 'failed' | 'timeout'>('idle');
  const [currentPaymentId, setCurrentPaymentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [receiptEmail, setReceiptEmail] = useState('');
  const [sendingReceipt, setSendingReceipt] = useState(false);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [receiptMessage, setReceiptMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchSubscriptionData = React.useCallback(async () => {
    setDataLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('[Subscriptions] No token found');
        return;
      }

      console.log('[Subscriptions] Fetching subscription data...');

      const subRes = await fetch(API_ENDPOINTS.payments.subscriptions.mine, {
        headers: getAuthHeaders(token),
      });
      
      if (subRes.ok) {
        const subData = await subRes.json();
        console.log('[Subscriptions] Subscription data:', subData);
        setSubscription(subData);
      } else {
        console.warn('[Subscriptions] Failed to fetch subscription:', subRes.status);
      }

      const paymentsRes = await fetch(`${API_ENDPOINTS.payments.transactions.list}?limit=10`, {
        headers: getAuthHeaders(token),
      });
      
      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        console.log('[Subscriptions] Payments data:', paymentsData);
        setPayments(paymentsData.payments || []);
      } else {
        console.warn('[Subscriptions] Failed to fetch payments:', paymentsRes.status);
      }

      const plansRes = await fetch(API_ENDPOINTS.payments.plans, {
        headers: getAuthHeaders(token),
      });
      
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        console.log('[Subscriptions] Plans data:', plansData);
        setPlans(plansData.plans || []);
      } else {
        console.warn('[Subscriptions] Failed to fetch plans:', plansRes.status);
      }
    } catch (error) {
      console.error('[Subscriptions] Failed to fetch subscription data:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  useEffect(() => {
    if (!loading && !user) {
      console.log('[Subscriptions] No user, redirecting to login');
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  useEffect(() => {
    if (user) {
      console.log('[Subscriptions] User authenticated, fetching data');
      fetchSubscriptionData();
      setPhoneNumber(user.phone || '');
      setReceiptEmail(user.email || '');
      console.log('[Subscriptions] Setting phone number from user:', user.phone);
    }
  }, [user, fetchSubscriptionData]);

  const initiatePayment = async () => {
    if (!subscription || !phoneNumber) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    // Validate phone number
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
        throw new Error('Not authenticated');
      }

      const response = await fetch(API_ENDPOINTS.payments.transactions.initiate, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify({
          subscription_id: subscription.id,
          phone_number: formattedPhone,
          amount: paymentAmount || subscription.plan?.price_amount || 0,
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
    const maxAttempts = 60; // Poll for up to 3 minutes

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
            
            // Refresh subscription data
            fetchSubscriptionData();
            
            // Close modal after 2 seconds
            setTimeout(() => {
              setShowPaymentModal(false);
              setPaymentStatus('idle');
              setCurrentPaymentId(null);
            }, 2000);
          } else if (data.status === 'failed') {
            setPaymentStatus('failed');
            setErrorMessage(data.failure_reason || 'Payment failed. Please try again.');
            clearInterval(interval);
            setPollingInterval(null);
            setProcessingPayment(false);
          }
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
    }, 3000);

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
    if (processingPayment) return;
    
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setShowPaymentModal(false);
    setPaymentStatus('idle');
    setErrorMessage('');
    setCurrentPaymentId(null);
  };

  const handleViewTransaction = (payment: Payment) => {
    setSelectedPayment(payment);
    setReceiptEmail(user?.email || '');
    setReceiptMessage(null);
    setShowTransactionModal(true);
  };

  const handleCloseTransactionModal = () => {
    setShowTransactionModal(false);
    setSelectedPayment(null);
    setReceiptMessage(null);
  };

  const handleDownloadReceipt = async () => {
    if (!selectedPayment || selectedPayment.status !== 'completed') return;
    
    setDownloadingReceipt(true);
    setReceiptMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${API_ENDPOINTS.payments.transactions.byId(selectedPayment.id)}/receipt`,
        {
          headers: getAuthHeaders(token),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download receipt');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receipt-${selectedPayment.mpesa_receipt_number || selectedPayment.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setReceiptMessage({ type: 'success', text: 'Receipt downloaded successfully!' });
    } catch (error) {
      console.error('Failed to download receipt:', error);
      setReceiptMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to download receipt' 
      });
    } finally {
      setDownloadingReceipt(false);
    }
  };

  const handleEmailReceipt = async () => {
    if (!selectedPayment || selectedPayment.status !== 'completed' || !receiptEmail) return;
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiptEmail)) {
      setReceiptMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setSendingReceipt(true);
    setReceiptMessage(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(
        `${API_ENDPOINTS.payments.transactions.byId(selectedPayment.id)}/receipt/email`,
        {
          method: 'POST',
          headers: getAuthHeaders(token),
          body: JSON.stringify({ email: receiptEmail }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to send receipt');
      }

      setReceiptMessage({ 
        type: 'success', 
        text: `Receipt sent successfully to ${receiptEmail}!` 
      });
    } catch (error) {
      console.error('Failed to send receipt:', error);
      setReceiptMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to send receipt' 
      });
    } finally {
      setSendingReceipt(false);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return '';
    phone = phone.replace(/\s/g, '');
    
    if (phone.startsWith('+254')) return phone;
    if (phone.startsWith('254')) return `+${phone}`;
    if (phone.startsWith('0')) return `+254${phone.slice(1)}`;
    if (phone.startsWith('7') || phone.startsWith('1')) return `+254${phone}`;
    return phone;
  };

  const isValidPhoneNumber = (phone: string) => {
    const regex = /^\+254[71]\d{8}$/;
    return regex.test(phone);
  };

  const formatCurrency = (amount: number) => {
    return `KES ${(amount / 100).toLocaleString('en-KE', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  if (loading) {
    return <Loading text="Checking authentication..." />;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-5xl bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-[#13131a] rounded-3xl shadow-2xl dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 p-8 transition-colors duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                <WalletIcon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Subscriptions & Wallet
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Manage your subscription and payment history
                </p>
              </div>
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="space-y-8">
                {/* Available Plans Section */}
                {!subscription && plans.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Choose Your Plan
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Select a subscription plan to access premium features
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {plans.filter(p => p.is_active).map((plan) => (
                        <div
                          key={plan.id}
                          className="relative bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-6 hover:border-purple-300 dark:hover:border-purple-400 transition-all hover:scale-105"
                        >
                          <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                              {plan.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                              {plan.description}
                            </p>
                            <div className="mb-4">
                              <span className="text-xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(plan.price_amount)}
                              </span>
                              <span className="text-gray-600 dark:text-gray-300 ml-2">/ {plan.billing_cycle}</span>
                            </div>
                            <button
                              onClick={() => navigate(`/pricing?plan=${plan.id}`)}
                              className="w-full px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all"
                            >
                              Select Plan
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {subscription ? (
                  <>
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
                        {getStatusBadge(subscription.status)}
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
                          console.log('[Subscriptions] Make Payment clicked - user phone:', user?.phone);
                          setPaymentAmount(subscription.plan?.price_amount || 0);
                          setPhoneNumber(user?.phone || '');
                          console.log('[Subscriptions] Phone number set to:', user?.phone || '');
                          setShowPaymentModal(true);
                        }}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                      >
                        <CreditCardIcon className="w-5 h-5" />
                        Make Payment Now
                      </button>
                    </div>

                    {/* Change Plan Section */}
                    {plans.length > 0 && (
                      <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-6">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Change Your Plan
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                          Switch to a different billing cycle. Your new plan will take effect after your current subscription expires on <strong>{formatDate(subscription.current_period_end)}</strong>.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {plans.filter(p => p.is_active && p.id !== subscription.plan_id).map((plan) => (
                            <div
                              key={plan.id}
                              className="relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 transition-all"
                            >
                              <div className="text-center">
                                <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                  {plan.name}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                  {plan.description}
                                </p>
                                <div className="mb-3">
                                  <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(plan.price_amount)}
                                  </span>
                                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">/ {plan.billing_cycle}</span>
                                </div>
                                <button
                                  onClick={() => navigate(`/pricing?plan=${plan.id}`)}
                                  className="w-full px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                                >
                                  Switch to This Plan
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                          <p className="text-xs text-blue-800 dark:text-blue-300">
                            <strong>Note:</strong> If you pay for a new plan now, it will be queued and become active after your current subscription expires. You won't lose any remaining time on your current plan.
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-6">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No active subscription</p>
                    <button
                      onClick={() => navigate('/pricing')}
                      className="inline-flex items-center justify-center px-6 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:from-purple-700 hover:to-pink-700 hover:shadow-purple-500/40 transition-all duration-200"
                    >
                      View Plans
                    </button>
                  </div>
                )}

                <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-lg dark:shadow-glow-md border-2 border-purple-100 dark:border-purple-500/30 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <BanknotesIcon className="w-5 h-5" />
                    Payment History
                  </h4>
                  
                  {payments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {payments.map((payment) => (
                        <button
                          key={payment.id}
                          onClick={() => handleViewTransaction(payment)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer text-left"
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
                        </button>
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
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

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
                  {paymentStatus === 'idle' && (
                    <>
                      <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        Make Payment
                      </Dialog.Title>

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

                        {errorMessage && <ErrorAlert message={errorMessage} />}

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={handleCloseModal}
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
                    </>
                  )}

                  {paymentStatus === 'initiating' && (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
                      <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Initiating Payment...
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Please wait
                      </p>
                    </div>
                  )}

                  {paymentStatus === 'processing' && (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Check Your Phone
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        You'll receive a prompt from <strong>Fingo Payment Services</strong>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Enter your M-Pesa PIN to complete payment
                      </p>
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        <span>Waiting for confirmation...</span>
                      </div>
                    </div>
                  )}

                  {paymentStatus === 'success' && (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Payment Successful!
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Your payment has been processed
                      </p>
                    </div>
                  )}

                  {paymentStatus === 'failed' && (
                    <div className="text-center py-8">
                      <XCircleIcon className="w-16 h-16 mx-auto mb-4 text-red-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Payment Failed
                      </p>
                      {errorMessage && <ErrorAlert message={errorMessage} title="Reason" className="mb-4" />}
                      <button
                        onClick={handleRetry}
                        className="w-full px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {paymentStatus === 'timeout' && (
                    <div className="text-center py-8">
                      <ClockIcon className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                      <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                        Payment Pending
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Check payment history for status
                      </p>
                      <button
                        onClick={handleRetry}
                        className="w-full px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Transaction Details Modal */}
      <Transition appear show={showTransactionModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseTransactionModal}>
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
                  <div className="flex items-start justify-between mb-4">
                    <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white">
                      Transaction Details
                    </Dialog.Title>
                    <button
                      onClick={handleCloseTransactionModal}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-6 h-6" />
                    </button>
                  </div>

                  {selectedPayment && (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex justify-center">
                        {getStatusBadge(selectedPayment.status)}
                      </div>

                      {/* Amount */}
                      <div className="text-center py-1 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(selectedPayment.amount)}
                        </p>
                      </div>

                      {/* Transaction Details */}
                      <div className="space-y-3 bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Transaction ID</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            {selectedPayment.id.slice(0, 8)}...
                          </span>
                        </div>

                        {selectedPayment.mpesa_receipt_number && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">M-Pesa Receipt</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedPayment.mpesa_receipt_number}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Payment Method</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {selectedPayment.payment_method}
                          </span>
                        </div>

                        {selectedPayment.phone_number && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Phone Number</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {selectedPayment.phone_number}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDate(selectedPayment.created_at)}
                          </span>
                        </div>

                        {selectedPayment.paid_at && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Paid At</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {new Date(selectedPayment.paid_at).toLocaleString('en-KE')}
                            </span>
                          </div>
                        )}

                        {selectedPayment.failure_reason && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Failure Reason</p>
                            <p className="text-sm text-red-600 dark:text-red-400">
                              {selectedPayment.failure_reason}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Receipt Actions - Only for completed transactions */}
                      {selectedPayment.status === 'completed' && (
                        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Receipt Options
                          </h4>

                          {/* Download Receipt */}
                          <button
                            onClick={handleDownloadReceipt}
                            disabled={downloadingReceipt}
                            className="w-full flex items-center justify-center gap-2 px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {downloadingReceipt ? (
                              <>
                                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Download Receipt (PDF)
                              </>
                            )}
                          </button>

                          {/* Email Receipt */}
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                              Email Receipt To
                            </label>
                            <input
                              type="email"
                              value={receiptEmail}
                              onChange={(e) => setReceiptEmail(e.target.value)}
                              placeholder="your@email.com"
                              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                            />
                            <button
                              onClick={handleEmailReceipt}
                              disabled={sendingReceipt || !receiptEmail}
                              className="w-full flex items-center justify-center gap-2 px-4 py-1.5 bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 border-2 border-purple-600 dark:border-purple-500 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendingReceipt ? (
                                <>
                                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                  Sending...
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  Send via Email
                                </>
                              )}
                            </button>
                          </div>

                          {/* Success/Error Message */}
                          {receiptMessage && receiptMessage.type === 'success' && (
                            <SuccessAlert message={receiptMessage.text} />
                          )}
                          {receiptMessage && receiptMessage.type !== 'success' && (
                            <ErrorAlert message={receiptMessage.text} />
                          )}
                        </div>
                      )}

                      {/* Disabled state message for non-completed transactions */}
                      {selectedPayment.status !== 'completed' && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-start gap-2">
                            <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                              Receipt download and email options are only available for completed transactions.
                            </p>
                          </div>
                        </div>
                      )}
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
