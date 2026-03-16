import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startOrGetConversation, getInboxRoute } from '../conversationLauncher';
import type { StartConversationPayload } from '../conversationLauncher';

// ── Mock gRPC dependencies ──────────────────────────────────────────────
const mockListConversations = vi.fn();
const mockStartConversation = vi.fn();

vi.mock('~/services/grpc/notifications.service', () => ({
  notificationsService: {
    listConversations: (...args: any[]) => mockListConversations(...args),
    startConversation: (...args: any[]) => mockStartConversation(...args),
  },
}));

// Helper: build a plain JS conversation list response
function buildListResponse(conversations: Array<Record<string, string>>) {
  return { conversations };
}

function buildStartResponse(id: string) {
  return { id };
}

describe('conversationLauncher utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('getInboxRoute', () => {
    it('returns inbox route without conversation ID', () => {
      expect(getInboxRoute()).toBe('/inbox');
    });

    it('returns inbox route with conversation ID', () => {
      const conversationId = '123e4567-e89b-12d3-a456-426614174000';
      expect(getInboxRoute(conversationId)).toBe(`/inbox?conversation=${conversationId}`);
    });

    it('encodes conversation ID in URL', () => {
      const conversationId = 'test id with spaces';
      const result = getInboxRoute(conversationId);
      expect(result).toBe('/inbox?conversation=test%20id%20with%20spaces');
    });

    it('handles special characters in conversation ID', () => {
      const conversationId = 'test&id=value';
      const result = getInboxRoute(conversationId);
      expect(result).toContain('test%26id%3Dvalue');
    });

    it('handles empty string conversation ID', () => {
      expect(getInboxRoute('')).toBe('/inbox');
    });

    it('handles undefined conversation ID', () => {
      expect(getInboxRoute(undefined)).toBe('/inbox');
    });
  });

  describe('startOrGetConversation', () => {
    const notificationsBase = 'https://notifications.example.com';
    const validPayload: StartConversationPayload = {
      household_user_id: 'household-123',
      househelp_user_id: 'househelp-456',
      household_profile_id: 'profile-household-789',
      househelp_profile_id: 'profile-househelp-012',
    };

    describe('Existing Conversation - Profile ID Match', () => {
      it('returns existing conversation ID when matched by profile IDs', async () => {
        const existingConvId = '123e4567-e89b-12d3-a456-426614174000';

        mockListConversations.mockResolvedValueOnce(
          buildListResponse([
            {
              id: existingConvId,
              household_profile_id: 'profile-household-789',
              househelp_profile_id: 'profile-househelp-012',
            },
          ]),
        );

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(existingConvId);
        expect(mockListConversations).toHaveBeenCalledTimes(1);
      });
    });

    describe('Existing Conversation - User ID Match', () => {
      it('returns existing conversation ID when matched by user IDs', async () => {
        const existingConvId = '423e4567-e89b-12d3-a456-426614174000';

        mockListConversations.mockResolvedValueOnce(
          buildListResponse([
            {
              id: existingConvId,
              household_user_id: 'household-123',
              househelp_user_id: 'househelp-456',
            },
          ]),
        );

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(existingConvId);
      });
    });

    describe('Creating New Conversation', () => {
      it('creates new conversation when none exists', async () => {
        const newConvId = '623e4567-e89b-12d3-a456-426614174000';

        // List returns empty
        mockListConversations.mockResolvedValueOnce(buildListResponse([]));
        // Start returns new ID
        mockStartConversation.mockResolvedValueOnce(buildStartResponse(newConvId));

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(newConvId);
        expect(mockStartConversation).toHaveBeenCalledTimes(1);
      });

      it('retries list after startConversation returns invalid UUID', async () => {
        const realConvId = '723e4567-e89b-12d3-a456-426614174000';

        // First list: empty
        mockListConversations.mockResolvedValueOnce(buildListResponse([]));
        // Start returns invalid UUID
        mockStartConversation.mockResolvedValueOnce(buildStartResponse('not-a-uuid'));
        // Retry list finds the conversation
        mockListConversations.mockResolvedValueOnce(
          buildListResponse([
            {
              id: realConvId,
              household_user_id: 'household-123',
              househelp_user_id: 'househelp-456',
            },
          ]),
        );

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(realConvId);
      });
    });

    describe('Error Handling', () => {
      it('throws error when conversation creation fails', async () => {
        mockListConversations.mockResolvedValueOnce(buildListResponse([]));
        mockStartConversation.mockRejectedValueOnce(new Error('gRPC error'));

        await expect(
          startOrGetConversation(notificationsBase, validPayload),
        ).rejects.toThrow('Failed to start conversation');
      });

      it('returns undefined when list fails and start returns invalid UUID', async () => {
        // List fails
        mockListConversations.mockRejectedValueOnce(new Error('list error'));
        // Start returns invalid UUID
        mockStartConversation.mockResolvedValueOnce(buildStartResponse('bad'));
        // Retry list also fails
        mockListConversations.mockRejectedValueOnce(new Error('list error'));

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBeUndefined();
      });
    });

    describe('Empty Conversations', () => {
      it('handles empty conversations array then creates', async () => {
        const newConvId = 'd23e4567-e89b-12d3-a456-426614174000';

        mockListConversations.mockResolvedValueOnce(buildListResponse([]));
        mockStartConversation.mockResolvedValueOnce(buildStartResponse(newConvId));

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(newConvId);
      });
    });
  });
});
