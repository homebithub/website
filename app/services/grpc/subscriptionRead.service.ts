import * as subscriptionGrpcModule from '~/grpc/lite/subscription/subscription_grpc_web_pb';
import * as subscriptionPbModule from '~/grpc/lite/subscription/subscription_pb';

import { GRPC_WEB_BASE_URL, callWithAuthRetry } from './client';
import { getStoredAccessToken, getStoredCanonicalProfileType, getStoredUserId } from '~/utils/authStorage';

const subscriptionPb = (subscriptionPbModule as any).default ?? subscriptionPbModule;
const { PaymentsServiceClient } = subscriptionGrpcModule as any;
const client = new PaymentsServiceClient(GRPC_WEB_BASE_URL, null, null);

function metadata(): Record<string, string> {
  const result: Record<string, string> = {};
  const token = getStoredAccessToken();
  if (token) result.authorization = `Bearer ${token}`;
  const profileType = getStoredCanonicalProfileType();
  if (profileType) result['x-profile-type'] = profileType;
  return result;
}

function request(RequestClass: any, userId: string): any {
  const value = new RequestClass();
  value.setUserId(userId || getStoredUserId());
  return value;
}

function call(start: (callback: (error: any, response?: any) => void) => void): Promise<any> {
  return callWithAuthRetry(start);
}

export const subscriptionReadService = {
  getMySubscription(userId = '') {
    return call(callback => client.getMySubscription(
      request(subscriptionPb.GetMySubscriptionRequest, userId),
      metadata(),
      callback,
    ));
  },
  checkSubscriptionAccess(userId = '') {
    return call(callback => client.checkSubscriptionAccess(
      request(subscriptionPb.CheckSubscriptionAccessRequest, userId),
      metadata(),
      callback,
    ));
  },
};
