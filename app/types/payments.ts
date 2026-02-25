/**
 * Payment Methods and Subscription Management Types
 * 
 * Type definitions for payment methods, subscriptions, and related entities.
 */

// ============================================================================
// Payment Methods
// ============================================================================

export type PaymentMethodType = 'mpesa' | 'card' | 'bank_transfer';

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  phone_number?: string;
  card_last4?: string;
  card_brand?: string;
  nickname?: string;
  is_default: boolean;
  is_expired: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface AddPaymentMethodRequest {
  type: PaymentMethodType;
  phone_number?: string;
  card_token?: string;
  nickname?: string;
  is_default?: boolean;
}

export interface UpdateNicknameRequest {
  nickname: string;
}

export interface PaymentMethodsResponse {
  payment_methods: PaymentMethod[];
}

export interface PaymentMethodResponse {
  payment_method: PaymentMethod;
  message?: string;
}

// ============================================================================
// Subscription Pause/Resume
// ============================================================================

export type PauseReason = 'vacation' | 'financial' | 'not_using' | 'other';

export interface PauseSubscriptionRequest {
  reason: PauseReason;
  duration_days: number;
}

export interface PauseHistory {
  id: string;
  subscription_id: string;
  user_id: string;
  paused_at: string;
  resume_at: string;
  resumed_at?: string;
  pause_reason: string;
  status: string;
  duration_days: number;
  days_remaining: number;
}

export interface PauseSubscriptionResponse {
  subscription: Subscription;
  pause_history: PauseHistory;
  message: string;
  resume_date: string;
  access_until: string;
}

export interface ResumeSubscriptionResponse {
  subscription: Subscription;
  pause_history: PauseHistory;
  message: string;
  next_billing_date: string;
  next_billing_amount: number;
}

export interface PauseStatusResponse {
  is_paused: boolean;
  paused_at?: string;
  resume_at?: string;
  days_remaining: number;
  can_pause: boolean;
  cannot_pause_reason?: string;
  history: PauseHistory[];
}


// ============================================================================
// Subscription Cancellation
// ============================================================================

export type CancelReason = 'price' | 'features' | 'not_using' | 'found_alternative' | 'other';

export interface CancelSubscriptionRequest {
  reason: CancelReason;
  feedback?: string;
}

export interface CancelSubscriptionResponse {
  message: string;
}

// ============================================================================
// Plan Changes and Proration
// ============================================================================

export interface ChangePlanRequest {
  new_plan_id: string;
}

export interface PreviewProrationRequest {
  new_plan_id: string;
}

export interface PlanSummary {
  id: string;
  name: string;
  price: number;
}

export interface ProrationDetails {
  unused_credit: number;
  prorated_charge: number;
  net_amount: number;
  days_used: number;
  days_remaining: number;
  total_days: number;
  description: string;
}

export interface ProrationCredit {
  id: string;
  old_plan_id: string;
  new_plan_id: string;
  old_plan_name: string;
  new_plan_name: string;
  unused_credit: number;
  prorated_charge: number;
  net_amount: number;
  days_used: number;
  days_remaining: number;
  status: string;
  change_date: string;
  applied_at?: string;
}

export interface ChangePlanResponse {
  subscription: Subscription;
  proration_credit: ProrationCredit;
  payment?: Payment;
  message: string;
}

export interface PreviewProrationResponse {
  old_plan: PlanSummary;
  new_plan: PlanSummary;
  proration: ProrationDetails;
}

// ============================================================================
// Credit Balance
// ============================================================================

export interface CreditBalanceResponse {
  credit_balance: number;
  formatted: string;
}

// ============================================================================
// Subscription and Plan
// ============================================================================

export interface Subscription {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: string;
  plan_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  trial_end?: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  plan?: SubscriptionPlan;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_amount: number;
  billing_cycle: string;
  profile_type: string;
  trial_days: number;
  display_order: number;
  is_active: boolean;
  max_profiles: number;
  max_applications: number;
  max_hires: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  profile_id: string;
  profile_type: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  phone_number?: string;
  merchant_transaction_id?: string;
  fingo_transaction_id?: string;
  mpesa_receipt_number?: string;
  failure_reason?: string;
  retry_count: number;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}
