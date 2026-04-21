import { getAccessTokenFromCookies } from '~/utils/cookie';
import { householdMemberService } from '~/services/grpc/authServices';

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
  invited_email?: string;
  invited_phone?: string;
  auto_approve?: boolean;
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


// ============================================================================
// Invitation Management
// ============================================================================

export const createInvitation = async (
  householdId: string,
  data: CreateInvitationRequest
): Promise<HouseholdInvitation> => {
  const result = await householdMemberService.createInvitation(householdId, data);
  return result?.data || result;
};

export const listInvitations = async (
  householdId: string
): Promise<HouseholdInvitation[]> => {
  const result = await householdMemberService.listInvitations(householdId);
  return result?.invitations || result?.data || result || [];
};

export const revokeInvitation = async (
  householdId: string,
  invitationId: string
): Promise<void> => {
  await householdMemberService.revokeInvitation(householdId, invitationId, '');
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
  return householdMemberService.validateInviteCode(code);
};

// ============================================================================
// Join Request Management
// ============================================================================

export const joinHousehold = async (
  data: JoinHouseholdRequest
): Promise<{ request_id: string; status: string; message: string }> => {
  return householdMemberService.joinHousehold('', data.invite_code, data.message);
};

export const listPendingRequests = async (
  householdId: string
): Promise<HouseholdMemberRequest[]> => {
  const result = await householdMemberService.listPendingRequests(householdId);
  return result?.requests || result || [];
};

export const approveRequest = async (
  householdId: string,
  requestId: string
): Promise<void> => {
  await householdMemberService.approveRequest(householdId, requestId, '');
};

export const rejectRequest = async (
  householdId: string,
  requestId: string,
  _reason?: string
): Promise<void> => {
  await householdMemberService.rejectRequest(householdId, requestId, '');
};

// ============================================================================
// Member Management
// ============================================================================

export const listMembers = async (
  householdId: string
): Promise<HouseholdMember[]> => {
  const result = await householdMemberService.listMembers(householdId);
  return result?.members || result || [];
};

export const updateMemberRole = async (
  householdId: string,
  userId: string,
  role: 'admin' | 'member'
): Promise<void> => {
  await householdMemberService.updateMemberRole(householdId, userId, role, '');
};

export const removeMember = async (
  householdId: string,
  userId: string
): Promise<void> => {
  await householdMemberService.removeMember(householdId, userId, '');
};

export const leaveHousehold = async (householdId: string): Promise<void> => {
  await householdMemberService.leaveHousehold(householdId);
};

export const getUserHouseholds = async (): Promise<any[]> => {
  const result = await householdMemberService.getUserHouseholds('');
  return result?.households || result || [];
};

export const transferOwnership = async (
  householdId: string,
  newOwnerId: string
): Promise<void> => {
  await householdMemberService.transferOwnership(householdId, newOwnerId, '');
};
