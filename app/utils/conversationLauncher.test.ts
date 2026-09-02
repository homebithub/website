import { beforeEach, describe, expect, it, vi } from 'vitest';

const { listConversations, startConversation } = vi.hoisted(() => ({
  listConversations: vi.fn(),
  startConversation: vi.fn(),
}));

vi.mock('~/services/grpc/notifications.service', () => ({
  notificationsService: {
    listConversations,
    startConversation,
  },
}));

import { startOrGetConversation } from './conversationLauncher';

const CONVERSATION_ID = '123e4567-e89b-42d3-a456-426614174000';

describe('service-provider conversation compatibility', () => {
  beforeEach(() => {
    listConversations.mockReset();
    startConversation.mockReset();
  });

  it('normalizes an older caller to canonical service identifiers', async () => {
    listConversations.mockResolvedValue({ conversations: [] });
    startConversation.mockResolvedValue({ id: CONVERSATION_ID });

    await expect(startOrGetConversation('', {
      household_user_id: 'household-user',
      household_profile_id: 'household-profile',
      househelp_user_id: 'provider-user',
      househelp_profile_id: 'provider-profile',
      listing_id: 17,
    })).resolves.toBe(CONVERSATION_ID);

    expect(startConversation).toHaveBeenCalledWith({
      householdUserId: 'household-user',
      householdProfileId: 'household-profile',
      serviceProviderUserId: 'provider-user',
      serviceProviderProfileId: 'provider-profile',
      listingId: '17',
    });
  });

  it('finds an existing conversation returned with canonical identifiers', async () => {
    listConversations.mockResolvedValue({
      conversations: [{
        id: CONVERSATION_ID,
        household_user_id: 'household-user',
        service_provider_user_id: 'provider-user',
        service_provider_profile_id: 'provider-profile',
      }],
    });

    await expect(startOrGetConversation('', {
      household_user_id: 'household-user',
      service_provider_user_id: 'provider-user',
      service_provider_profile_id: 'provider-profile',
    })).resolves.toBe(CONVERSATION_ID);

    expect(startConversation).not.toHaveBeenCalled();
  });
});
