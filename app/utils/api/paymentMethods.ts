/**
 * Payment Methods API Service
 * 
 * API functions for managing payment methods.
 */

import { API_ENDPOINTS, getAuthHeaders } from '~/config/api';
import { parseErrorResponse } from '~/utils/errors/apiErrors';
import type {
  PaymentMethod,
  AddPaymentMethodRequest,
  UpdateNicknameRequest,
  PaymentMethodsResponse,
  PaymentMethodResponse,
} from '~/types/payments';

/**
 * Get all payment methods for the authenticated user
 */
export const listPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.paymentMethods.list, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  const data: PaymentMethodsResponse = await response.json();
  return data.payment_methods || [];
};

/**
 * Get the default payment method
 */
export const getDefaultPaymentMethod = async (): Promise<PaymentMethod | null> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.paymentMethods.default, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    if (response.status === 404) {
      return null; // No default payment method
    }
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  const data: PaymentMethodResponse = await response.json();
  return data.payment_method;
};

/**
 * Add a new payment method
 */
export const addPaymentMethod = async (
  request: AddPaymentMethodRequest
): Promise<PaymentMethod> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.paymentMethods.add, {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  const data: PaymentMethodResponse = await response.json();
  return data.payment_method;
};

/**
 * Set a payment method as default
 */
export const setDefaultPaymentMethod = async (methodId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.paymentMethods.setDefault(methodId), {
    method: 'PUT',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
};

/**
 * Update payment method nickname
 */
export const updatePaymentMethodNickname = async (
  methodId: string,
  request: UpdateNicknameRequest
): Promise<PaymentMethod> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.paymentMethods.updateNickname(methodId), {
    method: 'PATCH',
    headers: getAuthHeaders(token),
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
  
  const data: PaymentMethodResponse = await response.json();
  return data.payment_method;
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (methodId: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(API_ENDPOINTS.payments.paymentMethods.delete(methodId), {
    method: 'DELETE',
    headers: getAuthHeaders(token),
  });
  
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw error;
  }
};
