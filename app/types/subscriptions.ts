export type SubscriptionTier = 'none' | 'basic' | 'premium';

export interface SubscriptionFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tier: SubscriptionTier;
  name: string;
  description: string;
  price: {
    amount: number;
    currency: string;
    period: 'one-time' | 'weekly' | 'monthly' | 'yearly';
  };
  features: SubscriptionFeature[];
  profileUnlocks: number; // Number of profiles that can be unlocked
  instantSupport: boolean;
  priorityMatching: boolean;
  backgroundCheckAccess: boolean;
  validityPeriod: number; // in days
}

export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  remainingUnlocks: number;
  paymentHistory: {
    id: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    date: string;
  }[];
} 