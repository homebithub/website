import { API_BASE_URL } from '~/config/api';

// ============================================================================
// Types
// ============================================================================

export interface HouseholdMember {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'active' | 'removed';
  permissions: {
    can_edit_profile: boolean;
    can_manage_househelps: boolean;
    can_view_financials: boolean;
    can_invite_members: boolean;
    can_remove_members: boolean;
  };
  invited_by?: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface HouseholdInvitation {
  id: string;
  household_id: string;
  invite_code: string;
  invited_by: string;
  role: 'owner' | 'admin' | 'member';
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  max_uses: number;
  uses_count: number;
  expires_at: string;
  created_at: string;
  share_url?: string;
}

export interface HouseholdMemberRequest {
  id: string;
  household_id: string;
  user_id: string;
  invitation_id?: string;
  status: 'pending' | 'approved' | 'rejected';
  message?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  rejection_reason?: string;
  created_at: string;
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface CreateInvitationRequest {
  role?: 'admin' | 'member';
  invited_email?: string;
  invited_phone?: string;
  expires_in_days?: number;
  max_uses?: number;
  auto_approve?: boolean;
}

export interface JoinHouseholdRequest {
  invite_code: string;
  message?: string;
}

// ============================================================================
// API Functions
// ============================================================================

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// ============================================================================
// Invitation Management
// ============================================================================

export const createInvitation = async (
  householdId: string,
  data: CreateInvitationRequest
): Promise<HouseholdInvitation> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/invitations`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create invitation');
  }

  return response.json();
};

export const listInvitations = async (
  householdId: string
): Promise<HouseholdInvitation[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/invitations`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch invitations');
  }

  return response.json();
};

export const revokeInvitation = async (
  householdId: string,
  invitationId: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/invitations/${invitationId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke invitation');
  }
};

export const validateInviteCode = async (
  code: string
): Promise<{
  valid: boolean;
  household_id: string;
  household_name: string;
  role: string;
  expires_at: string;
}> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/invitations/validate/${code}`
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Invalid invite code');
  }

  return response.json();
};

// ============================================================================
// Join Request Management
// ============================================================================

export const joinHousehold = async (
  data: JoinHouseholdRequest
): Promise<{ request_id: string; status: string; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/households/join`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to join household');
  }

  return response.json();
};

export const listPendingRequests = async (
  householdId: string
): Promise<HouseholdMemberRequest[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/requests`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch requests');
  }

  return response.json();
};

export const approveRequest = async (
  householdId: string,
  requestId: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/requests/${requestId}/approve`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to approve request');
  }
};

export const rejectRequest = async (
  householdId: string,
  requestId: string,
  reason?: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/requests/${requestId}/reject`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to reject request');
  }
};

// ============================================================================
// Member Management
// ============================================================================

export const listMembers = async (
  householdId: string
): Promise<HouseholdMember[]> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/members`,
    {
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch members');
  }

  return response.json();
};

export const updateMemberRole = async (
  householdId: string,
  userId: string,
  role: 'admin' | 'member'
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/members/${userId}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update member role');
  }
};

export const removeMember = async (
  householdId: string,
  userId: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/members/${userId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to remove member');
  }
};

export const leaveHousehold = async (householdId: string): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/users/me/households/${householdId}/leave`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to leave household');
  }
};

export const getUserHouseholds = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/users/me/households`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch households');
  }

  return response.json();
};

export const transferOwnership = async (
  householdId: string,
  newOwnerId: string
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/api/v1/households/${householdId}/transfer-ownership`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ new_owner_id: newOwnerId }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to transfer ownership');
  }
};
