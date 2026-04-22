type MaybeTimestamp =
  | string
  | Date
  | { seconds?: number | string; nanos?: number | string }
  | null
  | undefined;

export type NormalizedSubscriptionPlan = {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  billing_cycle: string;
  profile_type?: string;
  trial_days?: number;
  features?: any;
  is_active?: boolean;
};

export type NormalizedSubscription = {
  id: string;
  user_id?: string;
  plan_id: string;
  profile_id?: string;
  profile_type?: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_start?: string;
  trial_end?: string;
  is_trial_used?: boolean;
  cancelled_at?: string;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, any>;
  plan?: NormalizedSubscriptionPlan;
};

export type NormalizedPayment = {
  id: string;
  user_id?: string;
  profile_id?: string;
  profile_type?: string;
  subscription_id?: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  phone_number?: string;
  mpesa_receipt_number?: string;
  merchant_transaction_id?: string;
  fingo_transaction_id?: string;
  paid_at?: string;
  created_at?: string;
  updated_at?: string;
  failure_reason?: string;
  retry_count?: number;
};

function toIsoString(value: MaybeTimestamp): string {
  if (!value) return '';
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object' && value.seconds !== undefined) {
    const seconds =
      typeof value.seconds === 'string' ? Number(value.seconds) : value.seconds;
    if (Number.isFinite(seconds)) {
      return new Date(Number(seconds) * 1000).toISOString();
    }
  }
  return '';
}

function normalizePlan(raw: any): NormalizedSubscriptionPlan | undefined {
  if (!raw) return undefined;
  return {
    id: raw.id || '',
    name: raw.name || '',
    description: raw.description || '',
    price_amount: Number(raw.priceAmount ?? raw.price_amount ?? 0),
    billing_cycle: raw.billingCycle ?? raw.billing_cycle ?? '',
    profile_type: raw.profileType ?? raw.profile_type ?? undefined,
    trial_days: Number(raw.trialDays ?? raw.trial_days ?? 0) || undefined,
    features: raw.features,
    is_active:
      typeof raw.isActive === 'boolean'
        ? raw.isActive
        : typeof raw.is_active === 'boolean'
          ? raw.is_active
          : undefined,
  };
}

function normalizeSubscription(raw: any): NormalizedSubscription | null {
  if (!raw?.id) return null;
  return {
    id: raw.id,
    user_id: raw.userId ?? raw.user_id ?? undefined,
    plan_id: raw.planId ?? raw.plan_id ?? '',
    profile_id: raw.profileId ?? raw.profile_id ?? undefined,
    profile_type: raw.profileType ?? raw.profile_type ?? undefined,
    status: raw.status || '',
    current_period_start: toIsoString(raw.currentPeriodStart ?? raw.current_period_start),
    current_period_end: toIsoString(raw.currentPeriodEnd ?? raw.current_period_end),
    trial_start: toIsoString(raw.trialStart ?? raw.trial_start) || undefined,
    trial_end: toIsoString(raw.trialEnd ?? raw.trial_end) || undefined,
    is_trial_used: Boolean(raw.isTrialUsed ?? raw.is_trial_used ?? false),
    cancelled_at: toIsoString(raw.cancelledAt ?? raw.cancelled_at) || undefined,
    cancel_at_period_end:
      raw.cancelAtPeriodEnd ?? raw.cancel_at_period_end ?? false,
    metadata: raw.metadata || {},
    plan: normalizePlan(raw.plan),
  };
}

export function extractSubscription(response: any): NormalizedSubscription | null {
  const raw =
    response?.getSubscription?.()?.toObject?.() ??
    response?.toObject?.()?.subscription ??
    response?.subscription ??
    null;

  return normalizeSubscription(raw);
}

export function extractPayments(response: any): NormalizedPayment[] {
  const rawPayments =
    response?.getPaymentsList?.()?.map((payment: any) => payment?.toObject?.() ?? payment) ??
    response?.toObject?.()?.paymentsList ??
    response?.payments ??
    [];

  return rawPayments
    .map((payment: any) => {
      if (!payment?.id) return null;
      return {
        id: payment.id,
        user_id: payment.userId ?? payment.user_id ?? undefined,
        profile_id: payment.profileId ?? payment.profile_id ?? undefined,
        profile_type: payment.profileType ?? payment.profile_type ?? undefined,
        subscription_id: payment.subscriptionId ?? payment.subscription_id ?? undefined,
        amount: Number(payment.amount ?? 0),
        currency: payment.currency || 'KES',
        status: payment.status || '',
        payment_method: payment.paymentMethod ?? payment.payment_method ?? '',
        phone_number: payment.phoneNumber ?? payment.phone_number ?? undefined,
        mpesa_receipt_number:
          payment.mpesaReceiptNumber ?? payment.mpesa_receipt_number ?? undefined,
        merchant_transaction_id:
          payment.merchantTransactionId ??
          payment.merchant_transaction_id ??
          undefined,
        fingo_transaction_id:
          payment.fingoTransactionId ?? payment.fingo_transaction_id ?? undefined,
        paid_at: toIsoString(payment.paidAt ?? payment.paid_at) || undefined,
        created_at: toIsoString(payment.createdAt ?? payment.created_at) || undefined,
        updated_at: toIsoString(payment.updatedAt ?? payment.updated_at) || undefined,
        failure_reason: payment.failureReason ?? payment.failure_reason ?? undefined,
        retry_count: Number(payment.retryCount ?? payment.retry_count ?? 0) || undefined,
      } satisfies NormalizedPayment;
    })
    .filter(Boolean) as NormalizedPayment[];
}

export function extractPlans(response: any): NormalizedSubscriptionPlan[] {
  const rawPlans =
    response?.getPlansList?.()?.map((plan: any) => plan?.toObject?.() ?? plan) ??
    response?.toObject?.()?.plansList ??
    response?.plans ??
    [];

  return rawPlans
    .map(normalizePlan)
    .filter(Boolean) as NormalizedSubscriptionPlan[];
}
