/**
 * Subscription Management API Service
 * 
 * API functions for managing subscriptions via gRPC.
 */

import { paymentsService } from '~/services/grpc/payments.service';
import type {
  PauseSubscriptionRequest,
  PauseSubscriptionResponse,
  ResumeSubscriptionResponse,
  PauseStatusResponse,
  CancelSubscriptionRequest,
  CancelSubscriptionResponse,
  ChangePlanRequest,
  ChangePlanResponse,
  PreviewProrationRequest,
  PreviewProrationResponse,
  CreditBalanceResponse,
} from '~/types/payments';

/**
 * Pause a subscription
 */
export const pauseSubscription = async (
  subscriptionId: string,
  request: PauseSubscriptionRequest
): Promise<PauseSubscriptionResponse> => {
  return paymentsService.pauseSubscription(subscriptionId, '', request.reason || '', request.duration_days || 30) as any;
};

/**
 * Resume a paused subscription
 */
export const resumeSubscription = async (
  subscriptionId: string
): Promise<ResumeSubscriptionResponse> => {
  return paymentsService.resumeSubscription(subscriptionId, '') as any;
};

/**
 * Get pause status for a subscription
 */
export const getPauseStatus = async (
  subscriptionId: string
): Promise<PauseStatusResponse> => {
  return paymentsService.getPauseStatus(subscriptionId, '') as any;
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  request: CancelSubscriptionRequest
): Promise<CancelSubscriptionResponse> => {
  return paymentsService.cancelSubscription(subscriptionId, '') as any;
};

/**
 * Change subscription plan
 */
export const changePlan = async (
  subscriptionId: string,
  request: ChangePlanRequest
): Promise<ChangePlanResponse> => {
  return paymentsService.changePlan(subscriptionId, request.new_plan_id, '') as any;
};

/**
 * Preview proration for plan change
 */
export const previewProration = async (
  subscriptionId: string,
  request: PreviewProrationRequest
): Promise<PreviewProrationResponse> => {
  return paymentsService.previewProration(subscriptionId, request.new_plan_id, '') as any;
};

/**
 * Get credit balance for a subscription
 */
export const getCreditBalance = async (
  subscriptionId: string
): Promise<CreditBalanceResponse> => {
  return paymentsService.getCreditBalance('') as any;
};
