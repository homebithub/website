/**
 * Payments Service - gRPC-Web Client
 * 
 * Provides payment, subscription, and plan methods using gRPC-Web protocol
 */

import { PaymentsServiceClient } from '~/grpc/generated/payments/payments_grpc_web_pb';
import payments_pb_module from '~/grpc/generated/payments/payments_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError, retryOnExpiry } from './client';
import {
  getStoredAccessToken,
  getStoredCanonicalProfileType,
  getStoredUserId,
} from '~/utils/authStorage';
import { normalizeProfileType } from '~/utils/profileType';

const payments_pb = payments_pb_module as any;

const paymentsClient = new PaymentsServiceClient(GRPC_WEB_BASE_URL, null, null);

function resolveUserId(userId: string): string {
  if (userId) return userId;
  return getStoredUserId();
}

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getStoredAccessToken();
  if (token) md['authorization'] = `Bearer ${token}`;
  const profileType = getStoredCanonicalProfileType();
  if (profileType) md['x-profile-type'] = profileType;
  return md;
}

export const paymentsService = {
  // ── Plans ───────────────────────────────────────────
  async getPlans(): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetPlansRequest();
      retryOnExpiry((cb) => paymentsClient.getPlans(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async getPlan(planId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetPlanRequest();
      request.setPlanId(planId);
      retryOnExpiry((cb) => paymentsClient.getPlan(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Subscriptions ───────────────────────────────────
  async getMySubscription(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetMySubscriptionRequest();
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.getMySubscription(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async listMySubscriptions(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.ListMySubscriptionsRequest();
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.listMySubscriptions(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async cancelSubscription(subscriptionId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.CancelSubscriptionRequest();
      request.setSubscriptionId(subscriptionId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.cancelSubscription(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async checkSubscriptionAccess(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.CheckSubscriptionAccessRequest();
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.checkSubscriptionAccess(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Pause/Resume ────────────────────────────────────
  async pauseSubscription(subscriptionId: string, userId: string, reason: string, durationDays: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.PauseSubscriptionRequest();
      request.setSubscriptionId(subscriptionId);
      request.setUserId(resolveUserId(userId));
      request.setReason(reason);
      request.setDurationDays(durationDays);
      retryOnExpiry((cb) => paymentsClient.pauseSubscription(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async resumeSubscription(subscriptionId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.ResumeSubscriptionRequest();
      request.setSubscriptionId(subscriptionId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.resumeSubscription(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async getPauseStatus(subscriptionId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetPauseStatusRequest();
      request.setSubscriptionId(subscriptionId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.getPauseStatus(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Cancellation ────────────────────────────────────
  async initiateCancellation(subscriptionId: string, userId: string, reasonCategory: string, reasonText: string, feedback: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.InitiateCancellationRequest();
      request.setSubscriptionId(subscriptionId);
      request.setUserId(resolveUserId(userId));
      request.setReasonCategory(reasonCategory);
      request.setReasonText(reasonText);
      request.setFeedback(feedback);
      retryOnExpiry((cb) => paymentsClient.initiateCancellation(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async confirmCancellation(cancellationRequestId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.ConfirmCancellationRequest();
      request.setCancellationRequestId(cancellationRequestId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.confirmCancellation(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async undoCancellation(cancellationRequestId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.UndoCancellationRequest();
      request.setCancellationRequestId(cancellationRequestId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.undoCancellation(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Payment Processing ──────────────────────────────
  async createSubscriptionCheckout(userId: string, planId: string, phoneNumber: string, profileId: string, profileType: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.CreateSubscriptionCheckoutRequest();
      request.setUserId(resolveUserId(userId));
      request.setPlanId(planId);
      request.setPhoneNumber(phoneNumber);
      request.setProfileId(profileId);
      request.setProfileType(normalizeProfileType(profileType));
      retryOnExpiry((cb) => paymentsClient.createSubscriptionCheckout(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async initiatePayment(userId: string, subscriptionId: string, phoneNumber: string, amount: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.InitiatePaymentRequest();
      request.setUserId(resolveUserId(userId));
      request.setSubscriptionId(subscriptionId);
      request.setPhoneNumber(phoneNumber);
      request.setAmount(amount);
      retryOnExpiry((cb) => paymentsClient.initiatePayment(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async checkPaymentStatus(paymentId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.CheckPaymentStatusRequest();
      request.setPaymentId(paymentId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.checkPaymentStatus(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async listMyPayments(userId: string, offset = 0, limit = 20): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.ListMyPaymentsRequest();
      request.setUserId(resolveUserId(userId));
      request.setOffset(offset);
      request.setLimit(limit);
      retryOnExpiry((cb) => paymentsClient.listMyPayments(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Proration / Plan Changes ────────────────────────
  async previewProration(subscriptionId: string, newPlanId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.PreviewProrationRequest();
      request.setSubscriptionId(subscriptionId);
      request.setNewPlanId(newPlanId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.previewProration(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async changePlan(subscriptionId: string, newPlanId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.ChangePlanRequest();
      request.setSubscriptionId(subscriptionId);
      request.setNewPlanId(newPlanId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.changePlan(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async getCreditBalance(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetCreditBalanceRequest();
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.getCreditBalance(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Payment Methods ─────────────────────────────────
  async getPaymentMethods(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetPaymentMethodsRequest();
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.getPaymentMethods(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async getDefaultPaymentMethod(userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.GetDefaultPaymentMethodRequest();
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.getDefaultPaymentMethod(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async addPaymentMethod(userId: string, type: string, phoneNumber: string, nickname: string, isDefault: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.AddPaymentMethodRequest();
      request.setUserId(resolveUserId(userId));
      request.setType(type);
      request.setPhoneNumber(phoneNumber);
      request.setNickname(nickname);
      request.setIsDefault(isDefault);
      retryOnExpiry((cb) => paymentsClient.addPaymentMethod(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async setDefaultPaymentMethod(methodId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.SetDefaultPaymentMethodRequest();
      request.setMethodId(methodId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.setDefaultPaymentMethod(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async removePaymentMethod(methodId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.RemovePaymentMethodRequest();
      request.setMethodId(methodId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.removePaymentMethod(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  async updatePaymentMethodNickname(methodId: string, userId: string, nickname: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.UpdatePaymentMethodNicknameRequest();
      request.setMethodId(methodId);
      request.setUserId(resolveUserId(userId));
      request.setNickname(nickname);
      retryOnExpiry((cb) => paymentsClient.updatePaymentMethodNickname(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },

  // ── Receipts ──────────────────────────────────────
  async downloadReceipt(paymentId: string, userId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.DownloadReceiptRequest();
      request.setPaymentId(paymentId);
      request.setUserId(resolveUserId(userId));
      retryOnExpiry((cb) => paymentsClient.downloadReceipt(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else {
          const pdfData =
            typeof response?.getPdfData_asU8 === 'function'
              ? response.getPdfData_asU8()
              : response?.getPdfData?.() ?? null;
          const filename =
            typeof response?.getFilename === 'function'
              ? response.getFilename()
              : response?.filename ?? response?.getFilename?.() ?? '';

          resolve({
            pdfData,
            filename,
          });
        }
      });
    });
  },

  async emailReceipt(paymentId: string, userId: string, email: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const request = new payments_pb.EmailReceiptRequest();
      request.setPaymentId(paymentId);
      request.setUserId(resolveUserId(userId));
      request.setEmail(email);
      retryOnExpiry((cb) => paymentsClient.emailReceipt(request, getMetadata(), cb), (err: any, response: any) => {
        if (err) reject(handleGrpcError(err));
        else resolve(response);
      });
    });
  },
};

export default paymentsService;
