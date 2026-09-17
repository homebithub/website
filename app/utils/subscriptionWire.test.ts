import { describe, expect, it } from 'vitest';
import * as liteModule from '../grpc/lite/subscription/subscription_pb';

const lite = (liteModule as any).default ?? liteModule;

describe('subscription client isolation', () => {
  it('keeps the inbox trial decoder usable after the billing client loads', async () => {
    const full = (await import('../grpc/generated/payments/payments_pb')).default as any;
    const trial = new full.CheckSubscriptionAccessResponse();
    trial.setHasAccess(true);
    trial.setIsTrial(true);
    trial.setStatus('trial');
    expect(lite.CheckSubscriptionAccessResponse).toBeTypeOf('function');
    const decoded = lite.CheckSubscriptionAccessResponse.deserializeBinary(trial.serializeBinary());
    expect(decoded.getHasAccess()).toBe(true);
    expect(decoded.getIsTrial()).toBe(true);
    const request = new lite.GetMySubscriptionRequest();
    request.setProfileType('service_provider');
    expect(request.getProfileType()).toBe('service_provider');
    const subscription = new full.Subscription();
    subscription.setId('trial-subscription');
    subscription.setProfileType('service_provider');
    subscription.setStatus('trial');
    const response = new full.GetMySubscriptionResponse();
    response.setSubscription(subscription);
    const details = lite.GetMySubscriptionResponse.deserializeBinary(response.serializeBinary()).getSubscription();
    expect(details.getStatus()).toBe('trial');
    expect(details.getProfileType()).toBe('service_provider');
  });
});
