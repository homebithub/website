/**
 * Subscription Management API Service
 * 
 * API functions for managing subscriptions (pause, resume, cancel, change plan, etc.).
 */

import { API_ENDPOINTS, getAuthHeaders } from '~/config/api';
import { parseErrorResponse } from '~/utils/errors/apiErrors';
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
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.subscriptions.pause(subscriptionId), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};

/**
 * Resume a paused subscription
 */
export const resumeSubscription = async (
  subscriptionId: string
): Promise<ResumeSubscriptionResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.subscriptions.resume(subscriptionId), {
    method: 'POST',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};

/**
 * Get pause status for a subscription
 */
export const getPauseStatus = async (
  subscriptionId: string
): Promise<PauseStatusResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.subscriptions.pauseStatus(subscriptionId), {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (
  subscriptionId: string,
  request: CancelSubscriptionRequest
): Promise<CancelSubscriptionResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.subscriptions.cancel(subscriptionId), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};

/**
 * Change subscription plan
 */
export const changePlan = async (
  subscriptionId: string,
  request: ChangePlanRequest
): Promise<ChangePlanResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.subscriptions.changePlan(subscriptionId), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};

/**
 * Preview proration for plan change
 */
export const previewProration = async (
  subscriptionId: string,
  request: PreviewProrationRequest
): Promise<PreviewProrationResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    API_ENDPOINTS.payments.subscriptions.previewProration(subscriptionId),
    {
      method: 'POST',
      headers: getAuthHeaders(token),
      body: JSON.stringify(request),
    }
  );
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};

/**
 * Get credit balance for a subscription
 */
export const getCreditBalance = async (
  subscriptionId: string
): Promise<CreditBalanceResponse> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(
    API_ENDPOINTS.payments.subscriptions.creditBalance(subscriptionId),
    {
      method: 'GET',
      headers: getAuthHeaders(token),
    }
  );
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  return response.json();
};
