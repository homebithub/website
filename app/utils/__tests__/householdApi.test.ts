import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createInvitation,
  listInvitations,
  revokeInvitation,
  validateInviteCode,
  joinHousehold,
  listPendingRequests,
  approveRequest,
  rejectRequest,
  listMembers,
  updateMemberRole,
  removeMember,
  leaveHousehold,
  getUserHouseholds,
  transferOwnership,
} from '../householdApi';

// Mock config
vi.mock('~/config/api', () => ({
  API_BASE_URL: 'https://api.test.com',
}));

describe('householdApi', () => {
  let mockFetch: any;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock fetch
    mockFetch = vi.fn();
    global.fetch = mockFetch;

    // Mock localStorage
    mockLocalStorage = {
      getItem: vi.fn(() => 'test-token'),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };
    Object.defineProperty(global, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });

    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Invitation Management', () => {
    describe('createInvitation', () => {
      it('creates invitation successfully', async () => {
        const mockInvitation = {
          id: 'inv-123',
          household_id: 'hh-456',
          invite_code: 'ABC123',
          role: 'member',
          status: 'pending',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockInvitation,
        });

        const result = await createInvitation('hh-456', { role: 'member' });

        expect(result).toEqual(mockInvitation);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/invitations',
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
              Authorization: 'Bearer test-token',
            }),
            body: JSON.stringify({ role: 'member' }),
          })
        );
      });

      it('creates invitation with all options', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'inv-123' }),
        });

        const data = {
          role: 'admin' as const,
          invited_email: 'test@example.com',
          invited_phone: '+1234567890',
          expires_in_days: 7,
          max_uses: 5,
          auto_approve: true,
        };

        await createInvitation('hh-456', data);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify(data),
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Permission denied' }),
        });

        await expect(createInvitation('hh-456', {})).rejects.toThrow(
          'Permission denied'
        );
      });

      it('throws default error when error message missing', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({}),
        });

        await expect(createInvitation('hh-456', {})).rejects.toThrow(
          'Failed to create invitation'
        );
      });
    });

    describe('listInvitations', () => {
      it('lists invitations successfully', async () => {
        const mockInvitations = [
          { id: 'inv-1', invite_code: 'ABC123', status: 'pending' },
          { id: 'inv-2', invite_code: 'DEF456', status: 'active' },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockInvitations,
        });

        const result = await listInvitations('hh-456');

        expect(result).toEqual(mockInvitations);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/invitations',
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      });

      it('returns empty array when no invitations', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });

        const result = await listInvitations('hh-456');
        expect(result).toEqual([]);
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Not found' }),
        });

        await expect(listInvitations('hh-456')).rejects.toThrow('Not found');
      });
    });

    describe('revokeInvitation', () => {
      it('revokes invitation successfully', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await revokeInvitation('hh-456', 'inv-123');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/invitations/inv-123',
          expect.objectContaining({
            method: 'DELETE',
            headers: expect.objectContaining({
              Authorization: 'Bearer test-token',
            }),
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Invitation not found' }),
        });

        await expect(revokeInvitation('hh-456', 'inv-123')).rejects.toThrow(
          'Invitation not found'
        );
      });
    });

    describe('validateInviteCode', () => {
      it('validates invite code successfully', async () => {
        const mockValidation = {
          valid: true,
          household_id: 'hh-456',
          household_name: 'Test Household',
          role: 'member',
          expires_at: '2026-03-01T00:00:00Z',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockValidation,
        });

        const result = await validateInviteCode('ABC123');

        expect(result).toEqual(mockValidation);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/invitations/validate/ABC123'
        );
      });

      it('throws error for invalid code', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Code expired' }),
        });

        await expect(validateInviteCode('INVALID')).rejects.toThrow(
          'Code expired'
        );
      });

      it('throws default error when error message missing', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({}),
        });

        await expect(validateInviteCode('INVALID')).rejects.toThrow(
          'Invalid invite code'
        );
      });
    });
  });

  describe('Join Request Management', () => {
    describe('joinHousehold', () => {
      it('joins household successfully', async () => {
        const mockResponse = {
          request_id: 'req-123',
          status: 'pending',
          message: 'Request submitted',
        };

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockResponse,
        });

        const result = await joinHousehold({ invite_code: 'ABC123' });

        expect(result).toEqual(mockResponse);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/join',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ invite_code: 'ABC123' }),
          })
        );
      });

      it('joins household with message', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({ request_id: 'req-123', status: 'pending' }),
        });

        await joinHousehold({
          invite_code: 'ABC123',
          message: 'Please let me join',
        });

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({
              invite_code: 'ABC123',
              message: 'Please let me join',
            }),
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Invalid invite code' }),
        });

        await expect(
          joinHousehold({ invite_code: 'INVALID' })
        ).rejects.toThrow('Invalid invite code');
      });
    });

    describe('listPendingRequests', () => {
      it('lists pending requests successfully', async () => {
        const mockRequests = [
          {
            id: 'req-1',
            household_id: 'hh-456',
            user_id: 'user-1',
            status: 'pending',
          },
          {
            id: 'req-2',
            household_id: 'hh-456',
            user_id: 'user-2',
            status: 'pending',
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockRequests,
        });

        const result = await listPendingRequests('hh-456');

        expect(result).toEqual(mockRequests);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/requests',
          expect.any(Object)
        );
      });

      it('returns empty array when no requests', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });

        const result = await listPendingRequests('hh-456');
        expect(result).toEqual([]);
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Unauthorized' }),
        });

        await expect(listPendingRequests('hh-456')).rejects.toThrow(
          'Unauthorized'
        );
      });
    });

    describe('approveRequest', () => {
      it('approves request successfully', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await approveRequest('hh-456', 'req-123');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/requests/req-123/approve',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Request not found' }),
        });

        await expect(approveRequest('hh-456', 'req-123')).rejects.toThrow(
          'Request not found'
        );
      });
    });

    describe('rejectRequest', () => {
      it('rejects request without reason', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await rejectRequest('hh-456', 'req-123');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/requests/req-123/reject',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ reason: undefined }),
          })
        );
      });

      it('rejects request with reason', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await rejectRequest('hh-456', 'req-123', 'Not suitable');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ reason: 'Not suitable' }),
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Request already processed' }),
        });

        await expect(rejectRequest('hh-456', 'req-123')).rejects.toThrow(
          'Request already processed'
        );
      });
    });
  });

  describe('Member Management', () => {
    describe('listMembers', () => {
      it('lists members successfully', async () => {
        const mockMembers = [
          {
            id: 'mem-1',
            household_id: 'hh-456',
            user_id: 'user-1',
            role: 'owner',
            status: 'active',
          },
          {
            id: 'mem-2',
            household_id: 'hh-456',
            user_id: 'user-2',
            role: 'member',
            status: 'active',
          },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockMembers,
        });

        const result = await listMembers('hh-456');

        expect(result).toEqual(mockMembers);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/members',
          expect.any(Object)
        );
      });

      it('returns empty array when no members', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });

        const result = await listMembers('hh-456');
        expect(result).toEqual([]);
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Household not found' }),
        });

        await expect(listMembers('hh-456')).rejects.toThrow(
          'Household not found'
        );
      });
    });

    describe('updateMemberRole', () => {
      it('updates member role to admin', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await updateMemberRole('hh-456', 'user-123', 'admin');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/members/user-123',
          expect.objectContaining({
            method: 'PATCH',
            body: JSON.stringify({ role: 'admin' }),
          })
        );
      });

      it('updates member role to member', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await updateMemberRole('hh-456', 'user-123', 'member');

        expect(mockFetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            body: JSON.stringify({ role: 'member' }),
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Permission denied' }),
        });

        await expect(
          updateMemberRole('hh-456', 'user-123', 'admin')
        ).rejects.toThrow('Permission denied');
      });
    });

    describe('removeMember', () => {
      it('removes member successfully', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await removeMember('hh-456', 'user-123');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/members/user-123',
          expect.objectContaining({
            method: 'DELETE',
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Cannot remove owner' }),
        });

        await expect(removeMember('hh-456', 'user-123')).rejects.toThrow(
          'Cannot remove owner'
        );
      });
    });

    describe('leaveHousehold', () => {
      it('leaves household successfully', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await leaveHousehold('hh-456');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/users/me/households/hh-456/leave',
          expect.objectContaining({
            method: 'POST',
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Owner cannot leave' }),
        });

        await expect(leaveHousehold('hh-456')).rejects.toThrow(
          'Owner cannot leave'
        );
      });
    });

    describe('getUserHouseholds', () => {
      it('gets user households successfully', async () => {
        const mockHouseholds = [
          { id: 'hh-1', name: 'Household 1', role: 'owner' },
          { id: 'hh-2', name: 'Household 2', role: 'member' },
        ];

        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => mockHouseholds,
        });

        const result = await getUserHouseholds();

        expect(result).toEqual(mockHouseholds);
        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/users/me/households',
          expect.any(Object)
        );
      });

      it('returns empty array when no households', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => [],
        });

        const result = await getUserHouseholds();
        expect(result).toEqual([]);
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'Unauthorized' }),
        });

        await expect(getUserHouseholds()).rejects.toThrow('Unauthorized');
      });
    });

    describe('transferOwnership', () => {
      it('transfers ownership successfully', async () => {
        mockFetch.mockResolvedValue({
          ok: true,
          json: async () => ({}),
        });

        await transferOwnership('hh-456', 'user-789');

        expect(mockFetch).toHaveBeenCalledWith(
          'https://api.test.com/api/v1/households/hh-456/transfer-ownership',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ new_owner_id: 'user-789' }),
          })
        );
      });

      it('throws error on failure', async () => {
        mockFetch.mockResolvedValue({
          ok: false,
          json: async () => ({ error: 'New owner must be admin' }),
        });

        await expect(
          transferOwnership('hh-456', 'user-789')
        ).rejects.toThrow('New owner must be admin');
      });
    });
  });

  describe('Authentication', () => {
    it('includes auth token in all requests', async () => {
      mockLocalStorage.getItem.mockReturnValue('my-auth-token');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await listMembers('hh-456');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-auth-token',
          }),
        })
      );
    });

    it('handles missing token gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => [],
      });

      await listMembers('hh-456');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: '',
          }),
        })
      );
    });
  });

  describe('Error Handling', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(listMembers('hh-456')).rejects.toThrow('Network error');
    });

    it('handles malformed JSON responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(listMembers('hh-456')).rejects.toThrow('Invalid JSON');
    });

    it('uses default error messages when API error missing', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      });

      await expect(listMembers('hh-456')).rejects.toThrow(
        'Failed to fetch members'
      );
    });
  });
});
