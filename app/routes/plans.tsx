import React, { useState, useEffect, Fragment } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  PhoneIcon,
  ChevronLeftIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import { paymentsService } from "~/services/grpc/payments.service";
import { getStoredProfileType } from "~/utils/authStorage";

export const meta = () => [
  { title: "Choose a Plan — Homebit" },
  { name: "description", content: "Choose a Homebit subscription plan to unlock messaging, hire requests and full platform access." },
];

// ── Types ────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  billing_cycle: string;
  profile_type: string;
  trial_days: number;
  is_active: boolean;
  features: Record<string, any>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizePlan(p: any): Plan {
  return {
    id: p.id ?? p.planId ?? p.plan_id ?? "",
    name: p.name ?? "",
    description: p.description ?? "",
    price_amount: p.priceAmount ?? p.price_amount ?? 0,
    billing_cycle: p.billingCycle ?? p.billing_cycle ?? "",
    profile_type: p.profileType ?? p.profile_type ?? "",
    trial_days: p.trialDays ?? p.trial_days ?? 0,
    is_active: p.isActive ?? p.is_active ?? true,
    features: p.features ?? {},
  };
}

function formatCurrency(amount: number) {
  return `KES ${(amount / 100).toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

function formatPhoneNumber(phone: string) {
  if (!phone) return "";
  phone = phone.replace(/\s/g, "");
  if (phone.startsWith("+254")) return phone;
  if (phone.startsWith("254")) return `+${phone}`;
  if (phone.startsWith("0")) return `+254${phone.slice(1)}`;
  if (phone.startsWith("7") || phone.startsWith("1")) return `+254${phone}`;
  return phone;
}

function isValidPhoneNumber(phone: string) {
  return /^\+254[71]\d{8}$/.test(phone);
}

function billingLabel(cycle: string) {
  const map: Record<string, string> = {
    monthly: "month",
    quarterly: "3 months",
    "semi-annual": "6 months",
    semiannual: "6 months",
    yearly: "year",
    annual: "year",
  };
  return map[cycle.toLowerCase()] ?? cycle;
}

function featuresList(features: Record<string, any>): string[] {
  const list: string[] = [];
  if (features.messaging || features.direct_messaging) list.push("Unlimited messaging");
  if (features.profile_views) list.push(`${features.profile_views === "unlimited" ? "Unlimited" : features.profile_views} profile views`);
  if (features.search_filters) list.push(`${features.search_filters === "advanced" ? "Advanced" : features.search_filters} search filters`);
  if (features.priority_support) list.push("Priority support");
  if (features.background_checks) list.push("Background checks");
  if (features.verified_profiles) list.push("Verified profiles");
  if (features.profile_verification) list.push("Profile verification");
  if (features.job_applications) list.push(`${features.job_applications === "unlimited" ? "Unlimited" : features.job_applications} job applications`);
  if (features.profile_visibility) list.push("Enhanced visibility");
  if (features.job_alerts) list.push("Job alerts");
  if (features.application_tracking) list.push("Application tracking");
  return list;
}

// ── Plan Card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  onSelect,
  highlighted,
}: {
  plan: Plan;
  onSelect: (plan: Plan) => void;
  highlighted?: boolean;
}) {
  const features = featuresList(plan.features);
  const savings = plan.features?.savings as string | undefined;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border-2 p-6 transition-all duration-200 ${
        highlighted
          ? "border-purple-500 bg-purple-900/10 shadow-[0_0_24px_rgba(168,85,247,0.25)]"
          : "border-[#1e1e2e] bg-[#13131a] hover:border-purple-500/50"
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-0.5 text-xs font-bold text-white shadow">
            <SparklesIcon className="w-3 h-3" /> Most Popular
          </span>
        </div>
      )}

      <div className="mb-4">
        <h3 className="text-lg font-bold text-white mb-1">{plan.name}</h3>
        {savings && (
          <span className="inline-block text-xs font-semibold text-green-400 bg-green-400/10 rounded-full px-2 py-0.5 mb-2">
            {savings}
          </span>
        )}
        <div className="flex items-end gap-1 mt-2">
          <span className="text-3xl font-extrabold text-white">{formatCurrency(plan.price_amount)}</span>
          <span className="text-sm text-gray-400 mb-1">/ {billingLabel(plan.billing_cycle)}</span>
        </div>
        {plan.trial_days > 0 && (
          <p className="text-xs text-green-400 mt-1">{plan.trial_days}-day free trial included</p>
        )}
      </div>

      {features.length > 0 && (
        <ul className="space-y-2 mb-6 flex-1">
          {features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
              <CheckIcon className="w-4 h-4 text-purple-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => onSelect(plan)}
        className={`w-full rounded-xl py-2.5 text-sm font-bold transition-all duration-200 ${
          highlighted
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg"
            : "border-2 border-purple-500/60 text-purple-400 hover:bg-purple-500/10"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const returnTo = searchParams.get("return") || "/";

  // ── State ──────────────────────────────────────────────────────────────────
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Payment modal
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [resolvedPlanId, setResolvedPlanId] = useState<string | null>(null);
  const [planResolving, setPlanResolving] = useState(false);
  const [planResolveError, setPlanResolveError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "initiating" | "processing" | "success" | "failed" | "timeout"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pollingInterval, setPollingInterval] = useState<ReturnType<typeof setInterval> | null>(null);

  // ── Profile type ───────────────────────────────────────────────────────────
  const userObj: any = (user as any)?.user ?? user;
  const profileType: string =
    userObj?.profile_type ||
    getStoredProfileType() ||
    "";

  // ── Load plans from backend ────────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`);
      return;
    }

    setPlansLoading(true);
    setPlansError(null);

    paymentsService
      .getPlans()
      .then((data: any) => {
        const raw: any[] =
          data?.toObject?.()?.plansList ??
          data?.plansList ??
          data?.plans ??
          [];
        const normalized = raw.map(normalizePlan).filter((p) => p.is_active);
        setPlans(normalized);
      })
      .catch((err: any) => {
        console.error("[Plans] Failed to load plans:", err);
        setPlansError("Failed to load plans. Please try again.");
      })
      .finally(() => setPlansLoading(false));
  }, [user, authLoading]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  }, [pollingInterval]);

  // Pre-fill phone
  useEffect(() => {
    if (userObj?.phone) setPhoneNumber(formatPhoneNumber(userObj.phone));
  }, [userObj?.phone]);

  // ── Filtered plans for this user ───────────────────────────────────────────
  const myPlans = profileType
    ? plans.filter((p) => p.profile_type === profileType)
    : plans;

  // ── Helpers ────────────────────────────────────────────────────────────────
  const normalizeCycle = (s: string) => {
    const v = (s || "").toLowerCase().replace(/[-_\s]/g, "");
    if (v === "annual" || v === "yearly") return "yearly";
    if (v === "semiannual" || v === "6months" || v === "halfyearly") return "semiannual";
    if (v === "quarterly" || v === "3months" || v === "quarter") return "quarterly";
    return v;
  };

  // ── Plan selection → resolve real ID → open modal ─────────────────────────
  const handleSelectPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setPaymentStatus("idle");
    setErrorMessage("");
    setResolvedPlanId(null);
    setPlanResolveError(null);
    setPlanResolving(true);
    setShowModal(true);

    const normalize = (s: string) => (s || "").toLowerCase().replace(/[-_\s]/g, "");

    paymentsService
      .getPlans()
      .then((data: any) => {
        const raw: any[] =
          data?.toObject?.()?.plansList ??
          data?.plansList ??
          data?.plans ??
          [];

        let match = raw.find((p: any) => {
          const pt = normalize(p.profileType ?? p.profile_type ?? "");
          const bc = normalizeCycle(p.billingCycle ?? p.billing_cycle ?? "");
          return pt === normalize(plan.profile_type) && bc === normalizeCycle(plan.billing_cycle);
        });

        if (!match) {
          match = raw.find((p: any) => {
            const pt = normalize(p.profileType ?? p.profile_type ?? "");
            const amt = p.priceAmount ?? p.price_amount ?? 0;
            return pt === normalize(plan.profile_type) && amt === plan.price_amount;
          });
        }

        if (match) {
          setResolvedPlanId(match.id ?? match.planId ?? match.plan_id ?? null);
        } else {
          setPlanResolveError("Could not match plan on the server. Please try again.");
        }
      })
      .catch(() => {
        setPlanResolveError("Failed to load plan details. Check your connection and try again.");
      })
      .finally(() => setPlanResolving(false));
  };

  // ── Initiate M-Pesa payment ────────────────────────────────────────────────
  const initiatePayment = async () => {
    if (!selectedPlan || !phoneNumber) {
      setErrorMessage("Please enter your phone number");
      return;
    }
    if (!resolvedPlanId) {
      setErrorMessage("Plan could not be loaded. Please close and try again.");
      return;
    }
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!isValidPhoneNumber(formattedPhone)) {
      setErrorMessage("Please enter a valid Kenyan phone number (e.g., 0712345678)");
      return;
    }

    const pt =
      userObj?.profile_type ||
      getStoredProfileType() ||
      selectedPlan.profile_type ||
      "";

    setProcessingPayment(true);
    setPaymentStatus("initiating");
    setErrorMessage("");

    try {
      const data = (await paymentsService.createSubscriptionCheckout(
        "",
        resolvedPlanId,
        formattedPhone,
        "",
        pt
      )) as any;
      const result = data?.toObject?.() ?? data;
      const paymentId = result.paymentId ?? result.payment_id;
      setPaymentStatus("processing");
      startPolling(paymentId);
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setPaymentStatus("failed");
      setErrorMessage(error instanceof Error ? error.message : "Failed to initiate payment. Please try again.");
      setProcessingPayment(false);
    }
  };

  // ── Poll payment status ────────────────────────────────────────────────────
  const startPolling = (paymentId: string) => {
    let attempts = 0;
    const maxAttempts = 60;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = (await paymentsService.checkPaymentStatus(paymentId, "")) as any;
        const data = response?.toObject?.() ?? response;
        if (data?.status === "completed") {
          setPaymentStatus("success");
          clearInterval(interval);
          setPollingInterval(null);
          setProcessingPayment(false);
          setTimeout(() => navigate(returnTo), 2000);
        } else if (data?.status === "failed") {
          setPaymentStatus("failed");
          setErrorMessage(data.failureReason ?? data.failure_reason ?? "Payment failed. Please try again.");
          clearInterval(interval);
          setPollingInterval(null);
          setProcessingPayment(false);
        }
      } catch {}

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPollingInterval(null);
        setPaymentStatus("timeout");
        setErrorMessage("Payment is taking longer than expected. Please check your payment history.");
        setProcessingPayment(false);
      }
    }, 3000);

    setPollingInterval(interval);
  };

  const handleCloseModal = () => {
    if (processingPayment) return;
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    setShowModal(false);
    setPaymentStatus("idle");
    setErrorMessage("");
    setProcessingPayment(false);
    setResolvedPlanId(null);
    setPlanResolveError(null);
    setPlanResolving(false);
  };

  const handleRetry = () => {
    setPaymentStatus("idle");
    setErrorMessage("");
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  if (authLoading) return <Loading text="Loading..." />;

  const profileLabel = profileType === "househelp" ? "Househelp" : profileType === "household" ? "Household" : "";

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a12]">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(returnTo)}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors mb-6"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Back
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-purple-900/30 px-3 py-1 mb-4">
              <SparklesIcon className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs font-semibold text-purple-300 uppercase tracking-wide">
                {profileLabel ? `${profileLabel} Plans` : "Subscription Plans"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Choose Your Plan
            </h1>
            <p className="text-gray-400 text-sm">
              {profileType === "househelp"
                ? "One simple annual plan — get found, get hired."
                : "Start with a free trial. Cancel anytime."}
            </p>
          </div>
        </div>

        {/* Plans */}
        {plansLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <ArrowPathIcon className="w-8 h-8 text-purple-400 animate-spin" />
            <p className="text-gray-400 text-sm">Loading plans...</p>
          </div>
        ) : plansError ? (
          <div className="max-w-md mx-auto">
            <ErrorAlert message={plansError} />
            <button
              onClick={() => window.location.reload()}
              className="mt-4 w-full rounded-xl py-2.5 text-sm font-semibold text-purple-400 border-2 border-purple-500/50 hover:bg-purple-500/10 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : myPlans.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400">No plans available for your account type. Please contact support.</p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              myPlans.length === 1
                ? "max-w-sm mx-auto"
                : myPlans.length === 2
                ? "sm:grid-cols-2 max-w-2xl mx-auto"
                : myPlans.length === 3
                ? "sm:grid-cols-3"
                : "sm:grid-cols-2 lg:grid-cols-4"
            }`}
          >
            {myPlans.map((plan, i) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onSelect={handleSelectPlan}
                highlighted={myPlans.length > 1 && i === Math.floor(myPlans.length / 2)}
              />
            ))}
          </div>
        )}

        {/* Fine print */}
        {!plansLoading && !plansError && myPlans.length > 0 && (
          <p className="text-center text-xs text-gray-500 mt-8">
            All plans include a free trial. No payment required upfront. Cancel anytime.
          </p>
        )}
      </main>

      <Footer />

      {/* ── Payment Modal ──────────────────────────────────────────────────── */}
      <Transition appear show={showModal} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleCloseModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-[#13131a] border border-[#1e1e2e] p-6 shadow-xl transition-all max-h-[90vh] overflow-y-auto">

                  {/* idle */}
                  {paymentStatus === "idle" && (
                    <>
                      <Dialog.Title className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <PhoneIcon className="w-6 h-6 text-purple-500" />
                        M-Pesa Payment
                      </Dialog.Title>

                      <div className="space-y-4">
                        {/* Plan summary */}
                        <div className="bg-purple-900/20 border border-purple-500/20 rounded-xl p-4">
                          <p className="text-xs text-gray-400 mb-1">Plan</p>
                          <p className="text-base font-bold text-white">{selectedPlan?.name}</p>
                          <p className="text-2xl font-extrabold text-purple-400 mt-1">
                            {selectedPlan && formatCurrency(selectedPlan.price_amount)}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            per {selectedPlan && billingLabel(selectedPlan.billing_cycle)}
                            {selectedPlan && selectedPlan.trial_days > 0 && (
                              <span className="text-green-400 ml-2">· {selectedPlan.trial_days}-day free trial</span>
                            )}
                          </p>
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            M-Pesa Phone Number
                          </label>
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="0712345678"
                            className="w-full px-4 py-3 border border-[#2a2a3d] rounded-lg focus:ring-2 focus:ring-purple-500 bg-[#0d0d14] text-white text-lg"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            07XXXXXXXX or 01XXXXXXXX
                          </p>
                        </div>

                        {/* Plan resolving */}
                        {planResolving && (
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <ArrowPathIcon className="w-4 h-4 animate-spin text-purple-400" />
                            Verifying plan details...
                          </div>
                        )}
                        {planResolveError && <ErrorAlert message={planResolveError} />}

                        {/* What happens next */}
                        <div className="bg-[#0d0d14] border border-[#1e1e2e] rounded-xl p-4">
                          <p className="text-sm font-medium text-gray-300 mb-2">What happens next?</p>
                          <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                            <li>You'll receive an M-Pesa prompt on your phone</li>
                            <li>Enter your M-Pesa PIN to authorise payment</li>
                            <li>You'll receive a confirmation SMS</li>
                            <li>Your subscription will be activated immediately</li>
                          </ol>
                        </div>

                        {errorMessage && <ErrorAlert message={errorMessage} />}

                        <div className="flex gap-3 mt-2">
                          <button
                            onClick={handleCloseModal}
                            disabled={processingPayment}
                            className="flex-1 px-4 py-2.5 border border-[#2a2a3d] rounded-xl hover:bg-[#1e1e2e] transition-colors disabled:opacity-50 text-sm font-medium text-gray-300"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={initiatePayment}
                            disabled={!phoneNumber || processingPayment || planResolving || !resolvedPlanId}
                            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-bold shadow-lg"
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* initiating */}
                  {paymentStatus === "initiating" && (
                    <div className="text-center py-10">
                      <ArrowPathIcon className="w-16 h-16 mx-auto mb-4 text-purple-500 animate-spin" />
                      <p className="text-lg font-semibold text-white mb-1">Initiating Payment...</p>
                      <p className="text-sm text-gray-400">Please wait while we process your request</p>
                    </div>
                  )}

                  {/* processing */}
                  {paymentStatus === "processing" && (
                    <div className="text-center py-10">
                      <div className="relative mx-auto w-16 h-16 mb-4">
                        <PhoneIcon className="w-16 h-16 text-green-500" />
                        <div className="absolute -top-1 -right-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                        </div>
                      </div>
                      <p className="text-xl font-bold text-white mb-2">Check Your Phone</p>
                      <p className="text-sm text-gray-400 mb-1">
                        Enter your M-Pesa PIN to complete the payment
                      </p>
                      <p className="text-xs text-gray-500">Waiting for confirmation...</p>
                    </div>
                  )}

                  {/* success */}
                  {paymentStatus === "success" && (
                    <div className="text-center py-10">
                      <CheckCircleIcon className="w-20 h-20 mx-auto mb-4 text-green-500" />
                      <p className="text-2xl font-bold text-white mb-2">Payment Successful!</p>
                      <p className="text-sm text-gray-400">Your subscription is now active. Redirecting you back...</p>
                    </div>
                  )}

                  {/* failed */}
                  {paymentStatus === "failed" && (
                    <div className="text-center py-8">
                      <XCircleIcon className="w-20 h-20 mx-auto mb-4 text-red-500" />
                      <p className="text-2xl font-bold text-white mb-2">Payment Failed</p>
                      {errorMessage && <ErrorAlert message={errorMessage} title="Reason" className="mb-4" />}
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-4 text-left">
                        <p className="text-sm text-yellow-300 font-medium mb-2">Common reasons for failure:</p>
                        <ul className="text-xs text-yellow-400 space-y-1 list-disc list-inside">
                          <li>Insufficient M-Pesa balance</li>
                          <li>Wrong PIN entered</li>
                          <li>Request cancelled or timed out</li>
                          <li>Network connectivity issues</li>
                        </ul>
                      </div>
                      <button
                        onClick={handleRetry}
                        className="w-full px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* timeout */}
                  {paymentStatus === "timeout" && (
                    <div className="text-center py-8">
                      <ClockIcon className="w-20 h-20 mx-auto mb-4 text-yellow-400" />
                      <p className="text-2xl font-bold text-white mb-2">Payment Pending</p>
                      <p className="text-sm text-gray-400 mb-4">Your payment is taking longer than expected.</p>
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mb-4">
                        <p className="text-sm text-yellow-300">
                          Please check your M-Pesa messages or payment history to confirm.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => navigate("/subscriptions")}
                          className="flex-1 px-4 py-2.5 border border-[#2a2a3d] rounded-xl text-sm font-medium text-gray-300 hover:bg-[#1e1e2e] transition-colors"
                        >
                          View History
                        </button>
                        <button
                          onClick={handleRetry}
                          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl text-sm font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
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
