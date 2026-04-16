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
  ExclamationTriangleIcon,
  PauseIcon,
  PlayIcon,
  XCircleIcon as CancelIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { Navigation } from "~/components/Navigation";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import { paymentsService } from '~/services/grpc/payments.service';
import { PauseSubscriptionModal } from '~/components/subscriptions/PauseSubscriptionModal';
import { CancelSubscriptionFlow } from '~/components/subscriptions/CancelSubscriptionFlow';
import { ChangePlanModal } from '~/components/subscriptions/ChangePlanModal';
import { CreditBalanceCard } from '~/components/subscriptions/CreditBalanceCard';
import { PauseStatusCard } from '~/components/subscriptions/PauseStatusCard';
import type { PauseStatusResponse, CreditBalanceResponse, PauseReason, CancelReason } from '~/types/payments';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  billing_cycle: string;
  profile_type?: string;
  trial_days?: number;
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
  
  // Subscription management state
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showCancelFlow, setShowCancelFlow] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<SubscriptionPlan | null>(null);
  const [pauseStatus, setPauseStatus] = useState<PauseStatusResponse | null>(null);
  const [creditBalance, setCreditBalance] = useState<CreditBalanceResponse | null>(null);
  const [loadingPauseStatus, setLoadingPauseStatus] = useState(false);
  const [loadingCreditBalance, setLoadingCreditBalance] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Checkout state (for subscribing to a new plan inline)
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<SubscriptionPlan | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutPhone, setCheckoutPhone] = useState('');
  const [checkoutStatus, setCheckoutStatus] = useState<'idle' | 'initiating' | 'processing' | 'success' | 'failed' | 'timeout'>('idle');
  const [checkoutProcessing, setCheckoutProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [checkoutPolling, setCheckoutPolling] = useState<NodeJS.Timeout | null>(null);

  // Hardcoded pricing plans (same as pricing page)
  const allPlans: SubscriptionPlan[] = [
    {
      id: 'household-monthly', name: 'Monthly',
      description: 'Monthly subscription with 1-month free trial',
      price_amount: 49900, billing_cycle: 'monthly', profile_type: 'household',
      trial_days: 30, is_active: true,
      features: { messaging: true, profile_views: 'unlimited', search_filters: 'advanced', priority_support: true, background_checks: true, verified_profiles: true },
    },
    {
      id: 'household-quarterly', name: 'Quarterly',
      description: '3-month subscription - Save 10%! (1-month free trial)',
      price_amount: 134900, billing_cycle: 'quarterly', profile_type: 'household',
      trial_days: 30, is_active: true,
      features: { messaging: true, profile_views: 'unlimited', search_filters: 'advanced', priority_support: true, background_checks: true, verified_profiles: true, savings: 'Save KES 150' },
    },
    {
      id: 'household-semi-annual', name: 'Semi-Annual',
      description: '6-month subscription - Save 20%! (1-month free trial)',
      price_amount: 239900, billing_cycle: 'semi-annual', profile_type: 'household',
      trial_days: 30, is_active: true,
      features: { messaging: true, profile_views: 'unlimited', search_filters: 'advanced', priority_support: true, background_checks: true, verified_profiles: true, savings: 'Save KES 600' },
    },
    {
      id: 'household-annual', name: 'Annual',
      description: '1-year subscription - Save 30%! (1-month free trial)',
      price_amount: 419900, billing_cycle: 'yearly', profile_type: 'household',
      trial_days: 30, is_active: true,
      features: { messaging: true, profile_views: 'unlimited', search_filters: 'advanced', priority_support: true, background_checks: true, verified_profiles: true, savings: 'Save KES 1,800' },
    },
    {
      id: 'househelp-annual', name: 'Annual Access',
      description: 'One-time annual payment with 1-month free trial',
      price_amount: 99900, billing_cycle: 'yearly', profile_type: 'househelp',
      trial_days: 30, is_active: true,
      features: { direct_messaging: true, profile_verification: true, job_applications: 'unlimited', profile_visibility: true, job_alerts: true, application_tracking: true },
    },
  ];

  // Filter plans by user's profile type
  const userObj: any = (user as any)?.user || user;
  const profileType: string = userObj?.profile_type || localStorage.getItem('profile_type') || '';
  const relevantPlans = allPlans.filter(p => p.is_active && p.profile_type === profileType);

  const getFeaturesList = (features: any): string[] => {
    const list: string[] = [];
    if (!features) return list;
    if (features.messaging) list.push('Unlimited messaging');
    if (features.profile_views) list.push(`${features.profile_views === 'unlimited' ? 'Unlimited' : features.profile_views} profile views`);
    if (features.search_filters) list.push(`${features.search_filters} search filters`);
    if (features.priority_support) list.push('Priority support');
    if (features.background_checks) list.push('Background checks');
    if (features.verified_profiles) list.push('Verified profiles access');
    if (features.direct_messaging) list.push('Direct messaging');
    if (features.profile_verification) list.push('Profile verification');
    if (features.job_applications) list.push(`${features.job_applications === 'unlimited' ? 'Unlimited' : features.job_applications} job applications`);
    if (features.profile_visibility) list.push('Enhanced profile visibility');
    if (features.job_alerts) list.push('Job alerts');
    if (features.application_tracking) list.push('Application tracking');
    return list;
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = { 'monthly': 'month', 'quarterly': '3 months', 'semi-annual': '6 months', 'yearly': 'year' };
    return labels[cycle] || cycle;
  };

  const handleSelectCheckoutPlan = async (plan: SubscriptionPlan) => {
    setSelectedCheckoutPlan(plan);

    // 1. localStorage user_object is always the most up-to-date cached source
    let prefillPhone = '';
    try {
      const stored = JSON.parse(localStorage.getItem('user_object') || '{}');
      prefillPhone = stored?.phone || '';
    } catch {}

    // 2. Fall back to auth context in-memory user (covers freshly-logged-in session)
    if (!prefillPhone) {
      prefillPhone = userObj?.phone || (user as any)?.phone || '';
    }

    // 3. Last resort: query auth service via gateway
    if (!prefillPhone) {
      try {
        const { default: authService } = await import('~/services/grpc/auth.service');
        const userProto = await authService.getCurrentUser();
        prefillPhone = userProto?.getPhone?.() || '';
        if (prefillPhone) {
          try {
            const stored = JSON.parse(localStorage.getItem('user_object') || '{}');
            stored.phone = prefillPhone;
            localStorage.setItem('user_object', JSON.stringify(stored));
          } catch {}
        }
      } catch {}
    }

    setCheckoutPhone(formatPhoneNumber(prefillPhone));
    setCheckoutStatus('idle');
    setCheckoutError('');
    setShowCheckoutModal(true);
  };

  const initiateCheckout = async () => {
    if (!selectedCheckoutPlan || !checkoutPhone) {
      setCheckoutError('Please enter your phone number');
      return;
    }
    const formatted = formatPhoneNumber(checkoutPhone);
    if (!isValidPhoneNumber(formatted)) {
      setCheckoutError('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }
    setCheckoutProcessing(true);
    setCheckoutStatus('initiating');
    setCheckoutError('');
    try {
      const data = await paymentsService.createSubscriptionCheckout('', selectedCheckoutPlan.id, formatted, '', '') as any;
      const result = data?.toObject?.() ?? data;
      setCheckoutStatus('processing');
      startCheckoutPolling(result.paymentId || result.payment_id);
    } catch (error) {
      setCheckoutStatus('failed');
      setCheckoutError(error instanceof Error ? error.message : 'Failed to initiate payment.');
      setCheckoutProcessing(false);
    }
  };

  const startCheckoutPolling = (paymentId: string) => {
    let attempts = 0;
    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await paymentsService.checkPaymentStatus(paymentId, '') as any;
        const data = response?.toObject?.() ?? response;
        if (data?.status === 'completed') {
          setCheckoutStatus('success');
          clearInterval(interval);
          setCheckoutPolling(null);
          setCheckoutProcessing(false);
          setTimeout(() => {
            setShowCheckoutModal(false);
            fetchSubscriptionData();
          }, 2000);
        } else if (data?.status === 'failed') {
          setCheckoutStatus('failed');
          setCheckoutError(data.failureReason || data.failure_reason || 'Payment failed.');
          clearInterval(interval);
          setCheckoutPolling(null);
          setCheckoutProcessing(false);
        }
      } catch (e) { /* continue polling */ }
      if (attempts >= 60) {
        clearInterval(interval);
        setCheckoutPolling(null);
        setCheckoutStatus('timeout');
        setCheckoutError('Payment is taking longer than expected. Check your payment history.');
        setCheckoutProcessing(false);
      }
    }, 3000);
    setCheckoutPolling(interval);
  };

  const handleCloseCheckoutModal = () => {
    if (checkoutProcessing) return;
    if (checkoutPolling) { clearInterval(checkoutPolling); setCheckoutPolling(null); }
    setShowCheckoutModal(false);
    setCheckoutStatus('idle');
    setCheckoutError('');
    setSelectedCheckoutPlan(null);
  };

  const handleCheckoutRetry = () => {
    setCheckoutStatus('idle');
    setCheckoutError('');
    if (checkoutPolling) { clearInterval(checkoutPolling); setCheckoutPolling(null); }
  };

  const fetchSubscriptionData = React.useCallback(async () => {
    setDataLoading(true);
    try {
      console.log('[Subscriptions] Fetching subscription data...');

      try {
        const subData = await paymentsService.getMySubscription('') as any;
        console.log('[Subscriptions] Subscription data:', subData);
        setSubscription(subData?.toObject?.() ?? subData);
      } catch (err) {
        console.warn('[Subscriptions] Failed to fetch subscription:', err);
      }

      try {
        const paymentsData = await paymentsService.listMyPayments('', 0, 10) as any;
        console.log('[Subscriptions] Payments data:', paymentsData);
        const paymentsList = paymentsData?.toObject?.()?.paymentsList ?? paymentsData?.payments ?? [];
        setPayments(paymentsList);
      } catch (err) {
        console.warn('[Subscriptions] Failed to fetch payments:', err);
      }

      try {
        const plansData = await paymentsService.getPlans() as any;
        console.log('[Subscriptions] Plans data:', plansData);
        const plansList = plansData?.toObject?.()?.plansList ?? plansData?.plans ?? [];
        setPlans(plansList);
      } catch (err) {
        console.warn('[Subscriptions] Failed to fetch plans:', err);
      }
    } catch (error) {
      console.error('[Subscriptions] Failed to fetch subscription data:', error);
    } finally {
      setDataLoading(false);
    }
  }, []);

  // Fetch pause status
  const fetchPauseStatus = React.useCallback(async () => {
    if (!subscription?.id) return;
    
    setLoadingPauseStatus(true);
    try {
      const status = await paymentsService.getPauseStatus(subscription.id, '');
      setPauseStatus(status);
    } catch (error) {
      console.error('[Subscriptions] Failed to fetch pause status:', error);
    } finally {
      setLoadingPauseStatus(false);
    }
  }, [subscription?.id]);

  // Fetch credit balance
  const fetchCreditBalance = React.useCallback(async () => {
    if (!subscription?.id) return;
    
    setLoadingCreditBalance(true);
    try {
      const balance = await paymentsService.getCreditBalance('');
      setCreditBalance(balance);
    } catch (error) {
      console.error('[Subscriptions] Failed to fetch credit balance:', error);
    } finally {
      setLoadingCreditBalance(false);
    }
  }, [subscription?.id]);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
      if (checkoutPolling) {
        clearInterval(checkoutPolling);
      }
    };
  }, [pollingInterval, checkoutPolling]);

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

  // Fetch pause status and credit balance when subscription is loaded
  useEffect(() => {
    if (subscription?.id) {
      fetchPauseStatus();
      fetchCreditBalance();
    }
  }, [subscription?.id, fetchPauseStatus, fetchCreditBalance]);

  // Handle pause subscription
  const handlePauseSubscription = async (reason: PauseReason, durationDays: number) => {
    if (!subscription?.id) return;
    
    await paymentsService.pauseSubscription(subscription.id, '', reason, durationDays);
    await fetchSubscriptionData();
    await fetchPauseStatus();
  };

  // Handle resume subscription
  const handleResumeSubscription = async () => {
    if (!subscription?.id) return;
    
    setErrorMessage('');
    try {
      await paymentsService.resumeSubscription(subscription.id, '');
      setSuccessMessage('Subscription resumed successfully');
      await fetchSubscriptionData();
      await fetchPauseStatus();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to resume subscription');
    }
  };

  // Handle cancel subscription
  const handleCancelSubscription = async (reason: CancelReason, feedback?: string) => {
    if (!subscription?.id) return;
    
    await paymentsService.cancelSubscription(subscription.id, '');
    setSuccessMessage('Subscription cancelled successfully. Access continues until the end of your billing period.');
    await fetchSubscriptionData();
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Handle change plan
  const handleChangePlan = async (newPlanId: string) => {
    if (!subscription?.id) return;
    
    await paymentsService.changePlan(subscription.id, newPlanId, '');
    setSuccessMessage('Plan changed successfully');
    await fetchSubscriptionData();
    await fetchCreditBalance();
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  // Handle preview proration
  const handlePreviewProration = async (newPlanId: string) => {
    if (!subscription?.id) return { unused_credit: 0, prorated_charge: 0, net_amount: 0, days_used: 0, days_remaining: 0, total_days: 0, description: '' };
    
    const preview = await paymentsService.previewProration(subscription.id, newPlanId, '');
    return (preview as any)?.proration || preview;
  };

  const initiatePayment = async () => {
    if (!subscription || !phoneNumber) {
      setErrorMessage('Please enter your phone number');
      return;
    }

    // Validate phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(formattedPhone)) {
      setErrorMessage('Please enter a valid Kenyan phone number (e.g., 0712345678)');
      return;
    }

    setProcessingPayment(true);
    setPaymentStatus('initiating');
    setErrorMessage('');

    try {
      const data = await paymentsService.initiatePayment('', subscription.id, formattedPhone, paymentAmount || subscription.plan?.price_amount || 0) as any;
      const result = data?.toObject?.() ?? data;
      setCurrentPaymentId(result.paymentId || result.payment_id);
      setPaymentStatus('processing');
      startPollingPaymentStatus(result.paymentId || result.payment_id);
    } catch (error) {
      console.error('Payment initiation failed:', error);
      setPaymentStatus('failed');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.');
      setProcessingPayment(false);
    }
  };

  const startPollingPaymentStatus = (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // Poll for up to 3 minutes

    const interval = setInterval(async () => {
      attempts++;

      try {
        const response = await paymentsService.checkPaymentStatus(paymentId, '') as any;
        const data = response?.toObject?.() ?? response;

        if (data) {
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
            setErrorMessage(data.failureReason || data.failure_reason || 'Payment failed. Please try again.');
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
      const response = await paymentsService.downloadReceipt(selectedPayment.id, '') as any;
      const result = response?.toObject?.() ?? response;
      const pdfData = result.pdfData || result.pdf_data;
      const filename = result.filename || `receipt-${selectedPayment.mpesa_receipt_number || selectedPayment.id}.pdf`;

      const blob = new Blob([pdfData], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
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
      await paymentsService.emailReceipt(selectedPayment.id, '', receiptEmail);

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

  const formatDate = (dateVal: any): string => {
    if (!dateVal) return '—';
    let d: Date;
    if (typeof dateVal === 'object' && 'seconds' in dateVal) {
      d = new Date(Number(dateVal.seconds) * 1000);
    } else {
      d = new Date(dateVal);
    }
    if (isNaN(d.getTime())) return '—';
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
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                Subscriptions & Wallet
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your subscription and payment history
              </p>
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-12">
                <ArrowPathIcon className="w-8 h-8 animate-spin text-purple-500" />
              </div>
            ) : (
              <div className="space-y-8">
                {subscription ? (
                  <>
                    <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                            {subscription.plan?.name || 'Current Plan'}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
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
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(subscription.plan?.price_amount || 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Billing Cycle</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">
                            {subscription.plan?.billing_cycle}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Period Start</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {formatDate(subscription.current_period_start)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Period End</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg"
                      >
                        <CreditCardIcon className="w-5 h-5" />
                        Make Payment Now
                      </button>

                      {/* Subscription Management Actions */}
                      <div className="mt-4 flex flex-wrap gap-2">
                        {subscription.status === 'active' && !pauseStatus?.is_paused && (
                          <button
                            onClick={() => setShowPauseModal(true)}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/50 transition-all text-sm font-medium"
                          >
                            <PauseIcon className="w-4 h-4" />
                            Pause
                          </button>
                        )}
                        
                        {pauseStatus?.is_paused && (
                          <button
                            onClick={handleResumeSubscription}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50 transition-all text-sm font-medium"
                          >
                            <PlayIcon className="w-4 h-4" />
                            Resume
                          </button>
                        )}
                        
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => setShowCancelFlow(true)}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-all text-sm font-medium"
                          >
                            <CancelIcon className="w-4 h-4" />
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && <SuccessAlert message={successMessage} />}
                    {errorMessage && <ErrorAlert message={errorMessage} />}

                    {/* Pause Status Card */}
                    {pauseStatus?.is_paused && (
                      <PauseStatusCard
                        pauseStatus={pauseStatus}
                        loading={loadingPauseStatus}
                        onResume={handleResumeSubscription}
                      />
                    )}

                    {/* Credit Balance Card */}
                    {creditBalance && (
                      <CreditBalanceCard
                        creditBalance={creditBalance.credit_balance}
                        formatted={creditBalance.formatted}
                        loading={loadingCreditBalance}
                      />
                    )}

                    {/* Change Plan Section */}
                    {plans.length > 0 && (
                      <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          Change Your Plan
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                          Switch to a different billing cycle. Your new plan will take effect after your current subscription expires on <strong>{formatDate(subscription.current_period_end)}</strong>.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {plans.filter(p => p.is_active && p.id !== subscription.plan_id).map((plan) => (
                            <div
                              key={plan.id}
                              className="relative bg-white dark:bg-[#13131a] rounded-xl p-4 border border-purple-200/40 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400 transition-colors"
                            >
                              <div className="text-center">
                                <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                  {plan.name}
                                </h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                  {plan.description}
                                </p>
                                <div className="mb-3">
                                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(plan.price_amount)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">/ {plan.billing_cycle}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedNewPlan(plan);
                                    setShowChangePlanModal(true);
                                  }}
                                  className="w-full px-4 py-1 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors"
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
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Choose Your Plan
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                      All plans include a 30-day free trial. Cancel anytime.
                    </p>

                    {relevantPlans.length > 0 ? (
                      <div className={`grid gap-4 ${relevantPlans.length === 1 ? 'max-w-md' : relevantPlans.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                        {relevantPlans.map((plan) => {
                          const features = getFeaturesList(plan.features);
                          const savings = plan.features?.savings;
                          return (
                            <div
                              key={plan.id}
                              className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5 hover:border-purple-400 dark:hover:border-purple-400 transition-colors flex flex-col"
                            >
                              <div className="flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                                  {plan.name}
                                </h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                                  {plan.description}
                                </p>

                                {savings && (
                                  <div className="mb-3 bg-green-50 dark:bg-green-900/20 rounded-lg px-2 py-1">
                                    <p className="text-xs font-semibold text-green-700 dark:text-green-400">{savings}</p>
                                  </div>
                                )}

                                <div className="mb-4">
                                  <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                                    {formatCurrency(plan.price_amount)}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                    / {getBillingCycleLabel(plan.billing_cycle)}
                                  </span>
                                </div>

                                <div className="space-y-2 mb-4">
                                  {features.map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                                      <CheckIcon className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                                      <span>{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <button
                                onClick={() => handleSelectCheckoutPlan(plan)}
                                className="w-full px-4 py-1.5 text-sm font-bold rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                Start Free Trial
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No plans available for your profile type at the moment.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="bg-white dark:bg-[#13131a] rounded-2xl border border-purple-200/40 dark:border-purple-500/30 p-5">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <BanknotesIcon className="w-5 h-5" />
                    Payment History
                  </h4>
                  
                  {payments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {payments.map((payment) => (
                        <button
                          key={payment.id}
                          onClick={() => handleViewTransaction(payment)}
                          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer text-left"
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
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#13131a] border dark:border-[#1e1e2e] p-6 shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
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
                            placeholder="0712345678"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2a2a3d] rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-[#0d0d14] dark:text-white"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            07XXXXXXXX or 01XXXXXXXX
                          </p>
                        </div>

                        {errorMessage && <ErrorAlert message={errorMessage} />}

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={handleCloseModal}
                            disabled={processingPayment}
                            className="flex-1 px-4 py-1 border border-gray-300 dark:border-[#2a2a3d] rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e1e2e] transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={initiatePayment}
                            disabled={!phoneNumber || processingPayment}
                            className="flex-1 px-4 py-1 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                        className="w-full px-4 py-1.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
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
                        className="w-full px-4 py-1.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors"
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
                <Dialog.Panel className="w-full sm:max-w-lg transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#13131a] border dark:border-[#1e1e2e] p-6 shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
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
                      <div className="text-center py-1 bg-gray-50 dark:bg-[#0d0d14] rounded-xl">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Amount Paid</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(selectedPayment.amount)}
                        </p>
                      </div>

                      {/* Transaction Details */}
                      <div className="space-y-3 bg-gray-50 dark:bg-[#0d0d14] rounded-xl p-4">
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
                            className="w-full flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                              className="w-full flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-semibold text-purple-600 dark:text-purple-400 bg-white dark:bg-[#1a1a24] border border-purple-200/40 dark:border-purple-500/30 rounded-xl hover:bg-gray-50 dark:hover:bg-[#1e1e2a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Pause Subscription Modal */}
      {subscription && (
        <PauseSubscriptionModal
          isOpen={showPauseModal}
          onClose={() => setShowPauseModal(false)}
          subscription={subscription as any}
          onSuccess={(resumeDate) => {
            setSuccessMessage(`Subscription paused successfully. Will resume on ${formatDate(resumeDate)}`);
            setTimeout(() => setSuccessMessage(''), 5000);
          }}
          onPause={handlePauseSubscription}
        />
      )}

      {/* Cancel Subscription Flow */}
      {subscription && (
        <CancelSubscriptionFlow
          isOpen={showCancelFlow}
          onClose={() => setShowCancelFlow(false)}
          subscription={subscription as any}
          availablePlans={plans as any}
          onCancel={handleCancelSubscription}
          onPauseInstead={() => {
            setShowCancelFlow(false);
            setShowPauseModal(true);
          }}
          onDowngrade={(planId) => {
            const plan = plans.find(p => p.id === planId);
            if (plan) {
              setSelectedNewPlan(plan);
              setShowChangePlanModal(true);
            }
          }}
        />
      )}

      {/* Change Plan Modal */}
      {subscription && selectedNewPlan && (
        <ChangePlanModal
          isOpen={showChangePlanModal}
          onClose={() => {
            setShowChangePlanModal(false);
            setSelectedNewPlan(null);
          }}
          currentSubscription={subscription as any}
          newPlan={selectedNewPlan as any}
          onPreview={handlePreviewProration}
          onConfirm={handleChangePlan}
        />
      )}

      {/* Checkout Modal (new subscription) */}
      <Transition appear show={showCheckoutModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseCheckoutModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center sm:items-center sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300" enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 sm:scale-100" leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 p-6 shadow-xl transition-all max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
                  {checkoutStatus === 'idle' && selectedCheckoutPlan && (
                    <>
                      <Dialog.Title as="h3" className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
                        Subscribe to {selectedCheckoutPlan.name}
                      </Dialog.Title>

                      <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-[#0d0d14] rounded-xl p-4">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Plan</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {selectedCheckoutPlan.name} — {selectedCheckoutPlan.description}
                          </p>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">
                            {formatCurrency(selectedCheckoutPlan.price_amount)}
                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">
                              / {getBillingCycleLabel(selectedCheckoutPlan.billing_cycle)}
                            </span>
                          </p>
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            Includes 30-day free trial
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            M-Pesa Phone Number
                          </label>
                          <input
                            type="tel"
                            value={checkoutPhone}
                            onChange={(e) => setCheckoutPhone(e.target.value)}
                            placeholder="0712345678"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-[#2a2a3d] rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-[#0d0d14] dark:text-white"
                          />
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            07XXXXXXXX or 01XXXXXXXX
                          </p>
                        </div>

                        {checkoutError && <ErrorAlert message={checkoutError} />}

                        <div className="flex gap-3 mt-6">
                          <button
                            onClick={handleCloseCheckoutModal}
                            className="flex-1 px-4 py-1.5 text-sm font-semibold rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#1a1a24] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1e1e2a] transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={initiateCheckout}
                            disabled={!checkoutPhone || checkoutProcessing}
                            className="flex-1 px-4 py-1.5 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Start Free Trial
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {checkoutStatus === 'initiating' && (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 text-purple-500 animate-spin" />
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Initiating payment...</p>
                    </div>
                  )}

                  {checkoutStatus === 'processing' && (
                    <div className="text-center py-8">
                      <ArrowPathIcon className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Check your phone</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        You'll receive a prompt from <strong>Fingo Payment Services</strong>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter your M-Pesa PIN to complete payment
                      </p>
                    </div>
                  )}

                  {checkoutStatus === 'success' && (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Payment Successful!</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Your subscription is now active.</p>
                    </div>
                  )}

                  {checkoutStatus === 'failed' && (
                    <div className="text-center py-8">
                      <XCircleIcon className="w-12 h-12 mx-auto mb-4 text-red-500" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Payment Failed</p>
                      {checkoutError && <ErrorAlert message={checkoutError} className="mb-4" />}
                      <button
                        onClick={handleCheckoutRetry}
                        className="w-full px-4 py-1.5 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {checkoutStatus === 'timeout' && (
                    <div className="text-center py-8">
                      <ClockIcon className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">Payment Pending</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Check payment history for status.</p>
                      <button
                        onClick={handleCheckoutRetry}
                        className="w-full px-4 py-1.5 text-sm font-semibold rounded-xl text-white bg-purple-600 hover:bg-purple-700 transition-colors"
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
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
