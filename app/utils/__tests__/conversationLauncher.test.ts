import { describe, it, expect, vi, beforeEach } from 'vitest';
import { startOrGetConversation, getInboxRoute } from '../conversationLauncher';
import type { StartConversationPayload } from '../conversationLauncher';

// Mock apiClient
vi.mock('~/utils/apiClient', () => ({
  apiClient: {
    auth: vi.fn(),
    json: vi.fn(),
  },
}));

import { apiClient } from '~/utils/apiClient';

describe('conversationLauncher utility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      // Empty string is falsy, so it returns base route
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
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        } as any);
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: existingConvId,
              household_profile_id: 'profile-household-789',
              househelp_profile_id: 'profile-househelp-012',
            },
          ],
        });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(existingConvId);
        expect(apiClient.auth).toHaveBeenCalledTimes(1);
      });

      it('matches conversation with nested profile IDs', async () => {
        const existingConvId = '223e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: existingConvId,
              household: { id: 'profile-household-789' },
              househelp: { id: 'profile-househelp-012' },
            },
          ],
        });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(existingConvId);
      });

      it('is case-insensitive when matching IDs', async () => {
        const existingConvId = '323e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: existingConvId,
              household_profile_id: 'PROFILE-HOUSEHOLD-789',
              househelp_profile_id: 'PROFILE-HOUSEHELP-012',
            },
          ],
        });

        const result = await startOrGetConversation(notificationsBase, {
          ...validPayload,
          household_profile_id: 'profile-household-789',
          househelp_profile_id: 'profile-househelp-012',
        });
        expect(result).toBe(existingConvId);
      });
    });

    describe('Existing Conversation - User ID Match', () => {
      it('returns existing conversation ID when matched by user IDs', async () => {
        const existingConvId = '423e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: existingConvId,
              household_user_id: 'household-123',
              househelp_user_id: 'househelp-456',
            },
          ],
        });

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(existingConvId);
      });

      it('matches with nested user IDs', async () => {
        const existingConvId = '523e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: existingConvId,
              household: { user_id: 'household-123' },
              househelp: { user_id: 'househelp-456' },
            },
          ],
        });

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
        
        // First call - list conversations (empty)
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [],
        });

        // Second call - create conversation
        vi.mocked(apiClient.auth).mockResolvedValueOnce({
          ok: true,
        });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          id: newConvId,
        });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(newConvId);
        expect(vi.mocked(apiClient.auth)).toHaveBeenCalledTimes(2);
      });

      it('sends correct payload when creating conversation', async () => {
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ id: '723e4567-e89b-12d3-a456-426614174000' });

        await startOrGetConversation(notificationsBase, validPayload);

        expect(vi.mocked(apiClient.auth)).toHaveBeenNthCalledWith(
          2,
          `${notificationsBase}/api/v1/inbox/conversations`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(validPayload),
          })
        );
      });

      it('extracts conversation ID from nested data structure', async () => {
        const newConvId = '823e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          data: {
            conversation_id: newConvId,
          },
        });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(newConvId);
      });

      it('handles ID field variations', async () => {
        const newConvId = '923e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          ID: newConvId,
        });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe(newConvId);
      });
    });

    describe('Error Handling', () => {
      it('throws error when conversation creation fails', async () => {
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: false });

        await expect(
          startOrGetConversation(notificationsBase, validPayload)
        ).rejects.toThrow('Failed to start conversation');
      });

      it('creates new conversation when list fetch fails initially', async () => {
        const invalidConvId = 'h23e4567-e89b-12d3-a456-426614174000'; // Invalid UUID (starts with 'h')
        
        // First call - list conversations fails
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: false } as any);

        // Second call - create conversation succeeds but returns invalid UUID
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true } as any);
        vi.mocked(apiClient.json).mockResolvedValueOnce({ id: invalidConvId });

        // Third call - retry list after creation (also fails)
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: false } as any);

        const result = await startOrGetConversation(notificationsBase, validPayload);
        // When both list fetches fail and creation returns invalid UUID, returns undefined
        expect(result).toBeUndefined();
      });

      it('retries list fetch after failed creation response parsing', async () => {
        const existingConvId = 'a23e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockRejectedValueOnce(new Error('Parse error'));
        
        // Retry list fetch
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: existingConvId,
              household_user_id: 'household-123',
              househelp_user_id: 'househelp-456',
            },
          ],
        });

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(existingConvId);
      });

      it('validates UUID format of returned ID', async () => {
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          id: 'invalid-uuid-format',
        });

        // Should retry list fetch
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBeUndefined();
      });
    });

    describe('Response Format Variations', () => {
      it('handles conversations in data.conversations', async () => {
        const existingConvId = 'b23e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          data: {
            conversations: [
              {
                id: existingConvId,
                household_user_id: 'household-123',
                househelp_user_id: 'househelp-456',
              },
            ],
          },
        });

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(existingConvId);
      });

      it('handles conversations in data.data.conversations', async () => {
        const existingConvId = 'c23e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          data: {
            data: {
              conversations: [
                {
                  id: existingConvId,
                  household_user_id: 'household-123',
                  househelp_user_id: 'househelp-456',
                },
              ],
            },
          },
        });

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(existingConvId);
      });

      it('handles empty conversations array', async () => {
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({ conversations: [] });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          id: 'd23e4567-e89b-12d3-a456-426614174000',
        });

        const result = await startOrGetConversation(notificationsBase, validPayload);
        expect(result).toBe('d23e4567-e89b-12d3-a456-426614174000');
      });
    });

    describe('ID Normalization', () => {
      it('trims whitespace from IDs', async () => {
        const existingConvId = 'e23e4567-e89b-12d3-a456-426614174000';
        
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: `  ${existingConvId}  `,
              household_user_id: 'household-123',
              househelp_user_id: 'househelp-456',
            },
          ],
        });

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe(existingConvId);
      });

      it('ignores empty string IDs', async () => {
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          conversations: [
            {
              id: '',
              household_user_id: 'household-123',
              househelp_user_id: 'househelp-456',
            },
          ],
        });
        vi.mocked(apiClient.auth).mockResolvedValueOnce({ ok: true });
        vi.mocked(apiClient.json).mockResolvedValueOnce({
          id: 'f23e4567-e89b-12d3-a456-426614174000',
        });

        const result = await startOrGetConversation(notificationsBase, {
          household_user_id: 'household-123',
          househelp_user_id: 'househelp-456',
        });
        expect(result).toBe('f23e4567-e89b-12d3-a456-426614174000');
      });
    });
  });
});
