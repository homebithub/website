/**
 * Payment Methods API Service
 * 
 * API functions for managing payment methods via gRPC.
 */

import { paymentsService } from '~/services/grpc/payments.service';
import type {
  PaymentMethod,
  AddPaymentMethodRequest,
  UpdateNicknameRequest,
} from '~/types/payments';

/**
 * Get all payment methods for the authenticated user
 */
export const listPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const res = await paymentsService.getPaymentMethods('');
  return (res as any)?.getPaymentMethodsList?.()?.map((m: any) => m.toObject()) ?? res?.payment_methods ?? [];
};

/**
 * Get the default payment method
 */
export const getDefaultPaymentMethod = async (): Promise<PaymentMethod | null> => {
  try {
    const res = await paymentsService.getDefaultPaymentMethod('');
    return (res as any)?.getPaymentMethod?.()?.toObject() ?? res?.payment_method ?? null;
  } catch {
    return null;
  }
};

/**
 * Add a new payment method
 */
export const addPaymentMethod = async (
  request: AddPaymentMethodRequest
): Promise<PaymentMethod> => {
  const res = await paymentsService.addPaymentMethod(
    '', request.type || 'mpesa', request.phone_number || '', request.nickname || '', request.is_default ?? false
  );
  return (res as any)?.getPaymentMethod?.()?.toObject() ?? res;
};

/**
 * Set a payment method as default
 */
export const setDefaultPaymentMethod = async (methodId: string): Promise<void> => {
  await paymentsService.setDefaultPaymentMethod(methodId, '');
};

/**
 * Update payment method nickname
 */
export const updatePaymentMethodNickname = async (
  methodId: string,
  request: UpdateNicknameRequest
): Promise<PaymentMethod> => {
  const res = await paymentsService.updatePaymentMethodNickname(methodId, '', request.nickname || '');
  return (res as any)?.getPaymentMethod?.()?.toObject() ?? res;
};

/**
 * Delete a payment method
 */
export const deletePaymentMethod = async (methodId: string): Promise<void> => {
  await paymentsService.removePaymentMethod(methodId, '');
};
