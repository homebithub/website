import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  profileId: vi.fn(() => 'household-profile'),
  profileType: vi.fn(() => 'household'),
}));

vi.mock('~/grpc/generated/notifications/notifications_grpc_web_pb', () => ({
  NotificationsServiceClient: class { sendMessage = mocks.send; },
}));
vi.mock('./client', () => ({
  GRPC_WEB_BASE_URL: 'http://localhost',
  handleGrpcError: (err: unknown) => err,
  callWithAuthRetry: (call: (callback: (err: unknown, response: unknown) => void) => void) =>
    new Promise((resolve, reject) => call((err, response) => err ? reject(err) : resolve(response))),
}));
vi.mock('~/utils/authStorage', () => ({
  getStoredAccessToken: () => 'test-token',
  getStoredUserId: () => 'account',
  getStoredUserProfileId: mocks.profileId,
  getStoredCanonicalProfileType: mocks.profileType,
}));

import { notificationsService } from './notifications.service';

describe('inbox send profile scope', () => {
  beforeEach(() => {
    mocks.send.mockReset();
    mocks.profileId.mockReturnValue('household-profile');
    mocks.profileType.mockReturnValue('household');
    mocks.send.mockImplementation((_request, _metadata, callback) => callback(null, {
      getData: () => ({ toJavaScript: () => ({ id: 'saved-message' }) }),
    }));
  });

  it('includes account and active profile when the inbox caller omits optional fields', async () => {
    await expect(notificationsService.sendMessage('conversation', 'Hello')).resolves.toEqual({ id: 'saved-message' });
    const request = mocks.send.mock.calls[0][0];
    expect(request.getUserId()).toBe('account');
    expect(request.getSenderProfileId()).toBe('household-profile');
    expect(request.getSenderProfileType()).toBe('household');
  });

  it('reads the current profile again after switching profiles', async () => {
    await notificationsService.sendMessage('one', 'Hello');
    mocks.profileId.mockReturnValue('provider-profile');
    mocks.profileType.mockReturnValue('service_provider');
    await notificationsService.sendMessage('two', 'Reply');
    const request = mocks.send.mock.calls[1][0];
    expect(request.getSenderProfileId()).toBe('provider-profile');
    expect(request.getSenderProfileType()).toBe('service_provider');
  });

  it('rejects a failed send instead of returning a saved message', async () => {
    mocks.send.mockImplementation((_request, _metadata, callback) => callback(new Error('Subscription check unavailable')));
    await expect(notificationsService.sendMessage('conversation', 'Hello')).rejects.toThrow('Subscription check unavailable');
  });
});
