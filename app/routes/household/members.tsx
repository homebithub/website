import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { Loading } from '~/components/Loading';
import { useAuth } from '~/contexts/useAuth';
import { InviteCodeGenerator } from '~/components/household/InviteCodeGenerator';
import { formatTimeAgo } from "~/utils/timeAgo";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import {
  listMembers,
  listPendingRequests,
  listInvitations,
  revokeInvitation,
  approveRequest,
  rejectRequest,
  updateMemberRole,
  removeMember,
  transferOwnership,
  type HouseholdMember,
  type HouseholdMemberRequest,
  type HouseholdInvitation,
} from '~/utils/householdApi';
import { getStoredUser, getStoredUserId } from '~/utils/authStorage';

export default function HouseholdMembersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const currentUserId = user?.user?.user_id || getStoredUserId() || '';
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [invitations, setInvitations] = useState<HouseholdInvitation[]>([]);
  const [pendingRequests, setPendingRequests] = useState<HouseholdMemberRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingRequestAction, setPendingRequestAction] = useState<{
    type: 'approve' | 'reject';
    requestId: string;
  } | null>(null);
  const [invitationToRevoke, setInvitationToRevoke] = useState<HouseholdInvitation | null>(null);
  const [memberRoleAction, setMemberRoleAction] = useState<{
    userId: string;
    userName: string;
    nextRole: 'admin' | 'member';
  } | null>(null);
  const [ownershipTransferTarget, setOwnershipTransferTarget] = useState<{
    userId: string;
    userName: string;
  } | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{
    userId: string;
    userName: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    // Get household ID from user profile
    const householdUserId = storedUser?.household_id;
    if (householdUserId) {
      setHouseholdId(householdUserId);
      loadData(householdUserId);
    } else {
      setError('No household found for your account');
      setLoading(false);
    }
  }, [user, navigate, storedUser]);

  const loadData = async (hhId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [membersData, requestsData, invitationsData] = await Promise.all([
        listMembers(hhId),
        listPendingRequests(hhId).catch(() => []), // Ignore if no permission
        listInvitations(hhId).catch(() => []),
      ]);

      setMembers(membersData);
      setPendingRequests(requestsData);
      setInvitations(Array.isArray(invitationsData) ? invitationsData : []);

      // Find current user's role
      const currentMember = membersData.find((m) => m.user_id === currentUserId);
      if (currentMember) {
        setCurrentUserRole(currentMember.role);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load household data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!householdId) return;

    try {
      setActionLoading(`approve-${requestId}`);
      setError(null);
      setSuccessMessage(null);
      await approveRequest(householdId, requestId);
      await loadData(householdId);
      setSuccessMessage('Request approved successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!householdId) return;

    try {
      setActionLoading(`reject-${requestId}`);
      setError(null);
      setSuccessMessage(null);
      await rejectRequest(householdId, requestId);
      await loadData(householdId);
      setSuccessMessage('Request rejected successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeInvitation = async (invitation: HouseholdInvitation) => {
    if (!householdId) return;

    try {
      setActionLoading(`revoke-${invitation.id}`);
      setError(null);
      setSuccessMessage(null);
      await revokeInvitation(householdId, invitation.id);
      await loadData(householdId);
      setSuccessMessage('Invitation revoked successfully.');
    } catch (err: any) {
      setError(err.message || 'Failed to revoke invitation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateMemberRole = async (userId: string, userName: string, role: 'admin' | 'member') => {
    if (!householdId) return;

    try {
      setActionLoading(`role-${userId}`);
      setError(null);
      setSuccessMessage(null);
      await updateMemberRole(householdId, userId, role);
      await loadData(householdId);
      setSuccessMessage(`${userName} is now ${role}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to update member role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!householdId) return;

    try {
      setActionLoading(`remove-${userId}`);
      setError(null);
      setSuccessMessage(null);
      await removeMember(householdId, userId);
      await loadData(householdId);
      setSuccessMessage(`${userName} was removed from the household.`);
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTransferOwnership = async (userId: string, userName: string) => {
    if (!householdId) return;

    try {
      setActionLoading(`transfer-${userId}`);
      setError(null);
      setSuccessMessage(null);
      await transferOwnership(householdId, userId);
      await loadData(householdId);
      setSuccessMessage(`Ownership transferred to ${userName}.`);
    } catch (err: any) {
      setError(err.message || 'Failed to transfer ownership');
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmPendingRequest = async () => {
    if (!pendingRequestAction) return;

    if (pendingRequestAction.type === 'approve') {
      await handleApprove(pendingRequestAction.requestId);
    } else {
      await handleReject(pendingRequestAction.requestId);
    }

    setPendingRequestAction(null);
  };

  const handleConfirmMemberRemoval = async () => {
    if (!memberToRemove) return;
    await handleRemoveMember(memberToRemove.userId, memberToRemove.userName);
    setMemberToRemove(null);
  };

  const handleConfirmInvitationRevocation = async () => {
    if (!invitationToRevoke) return;
    await handleRevokeInvitation(invitationToRevoke);
    setInvitationToRevoke(null);
  };

  const handleConfirmMemberRoleChange = async () => {
    if (!memberRoleAction) return;
    await handleUpdateMemberRole(memberRoleAction.userId, memberRoleAction.userName, memberRoleAction.nextRole);
    setMemberRoleAction(null);
  };

  const handleConfirmOwnershipTransfer = async () => {
    if (!ownershipTransferTarget) return;
    await handleTransferOwnership(ownershipTransferTarget.userId, ownershipTransferTarget.userName);
    setOwnershipTransferTarget(null);
  };

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canRemove = currentUserRole === 'owner';
  const canManageRoles = currentUserRole === 'owner';
  const canTransferOwnership = currentUserRole === 'owner';

  if (loading) {
    return <Loading text="Loading household members..." />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0f]">
      <Navigation />
      <main className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Household Members
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your household members and pending requests
          </p>
        </div>

        {successMessage && <SuccessAlert message={successMessage} className="mb-6" />}
        {error && <ErrorAlert message={error} className="mb-6" />}

        {/* Invite Button */}
        {canInvite && householdId && (
          <div className="mb-8">
            <InviteCodeGenerator
              householdId={householdId}
              onInviteCreated={() => loadData(householdId)}
            />
          </div>
        )}

        {canInvite && invitations.length > 0 && (
          <div className="mb-8 p-6 bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-500/30 rounded-xl">
            <h2 className="text-2xl font-bold text-violet-800 dark:text-violet-300 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9h8m-8 4h5m5 8H6a2 2 0 01-2-2V5a2 2 0 012-2h8.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V19a2 2 0 01-2 2z" />
              </svg>
              Active Invitations ({invitations.length})
            </h2>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="p-4 bg-white dark:bg-[#13131a] rounded-xl border-2 border-violet-200 dark:border-violet-500/30 shadow-md"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="font-mono text-lg font-bold tracking-[0.25em] text-gray-900 dark:text-white">
                          {invitation.invite_code}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 border border-violet-300 dark:border-violet-500/50">
                          {invitation.role}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                          {invitation.uses_count}/{invitation.max_uses} uses
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Expires {invitation.expires_at ? new Date(invitation.expires_at).toLocaleString() : 'N/A'}
                      </div>
                    </div>
                    <button
                      onClick={() => setInvitationToRevoke(invitation)}
                      disabled={actionLoading === `revoke-${invitation.id}`}
                      className="px-4 py-1 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {actionLoading === `revoke-${invitation.id}` ? 'Revoking...' : 'Revoke'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending Requests */}
        {canInvite && pendingRequests.length > 0 && (
          <div className="mb-8 p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-500/30 rounded-xl">
            <h2 className="text-2xl font-bold text-amber-800 dark:text-amber-300 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-white dark:bg-[#13131a] rounded-xl border-2 border-amber-200 dark:border-amber-500/30 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-bold text-gray-900 dark:text-white text-lg">
                        {request.user?.first_name} {request.user?.last_name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {request.user?.phone} • {request.user?.email}
                      </div>
                      {request.message && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            "{request.message}"
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Requested {formatTimeAgo(request.created_at)}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setPendingRequestAction({ type: 'approve', requestId: request.id })}
                        className="px-4 py-1 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => setPendingRequestAction({ type: 'reject', requestId: request.id })}
                        className="px-4 py-1 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Members */}
        <div className="bg-white dark:bg-[#13131a] rounded-2xl shadow-xl dark:shadow-glow border-2 border-purple-200 dark:border-purple-500/30 p-6">
          <h2 className="text-2xl font-bold text-primary-600 dark:text-purple-400 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            Active Members ({members.length})
          </h2>

          <div className="space-y-4">
            {members.map((member) => {
              const isCurrentUser = member.user_id === currentUserId;
              const isOwner = member.role === 'owner';

              return (
                <div
                  key={member.id}
                  className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 shadow-md hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {member.user?.first_name?.[0]}{member.user?.last_name?.[0]}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-gray-900 dark:text-white text-lg">
                            {member.user?.first_name} {member.user?.last_name}
                            {isCurrentUser && (
                              <span className="ml-2 text-sm text-purple-600 dark:text-purple-400">(You)</span>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              isOwner
                                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-500/50'
                                : member.role === 'admin'
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-500/50'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600'
                            }`}
                          >
                            {member.role}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {member.user?.phone} • {member.user?.email}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Joined {member.joined_at ? new Date(member.joined_at).toLocaleDateString() : 'N/A'}
                        </div>

                        {/* Permissions */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {member.permissions.can_edit_profile && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-xl">
                              Edit Profile
                            </span>
                          )}
                          {member.permissions.can_manage_househelps && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-xl">
                              Manage Househelps
                            </span>
                          )}
                          {member.permissions.can_invite_members && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-xl">
                              Invite Members
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {!isCurrentUser && !isOwner && (canManageRoles || canTransferOwnership || canRemove) && (
                      <div className="flex flex-wrap justify-end gap-2">
                        {canManageRoles && (
                          <button
                            onClick={() => setMemberRoleAction({
                              userId: member.user_id,
                              userName: `${member.user?.first_name} ${member.user?.last_name}`.trim() || 'this member',
                              nextRole: member.role === 'admin' ? 'member' : 'admin',
                            })}
                            disabled={actionLoading === `role-${member.user_id}`}
                            className="px-4 py-1 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            title={member.role === 'admin' ? 'Change role to member' : 'Change role to admin'}
                          >
                            {actionLoading === `role-${member.user_id}`
                              ? 'Saving...'
                              : member.role === 'admin'
                              ? 'Make Member'
                              : 'Make Admin'}
                          </button>
                        )}
                        {canTransferOwnership && (
                          <button
                            onClick={() => setOwnershipTransferTarget({
                              userId: member.user_id,
                              userName: `${member.user?.first_name} ${member.user?.last_name}`.trim() || 'this member',
                            })}
                            disabled={actionLoading === `transfer-${member.user_id}`}
                            className="px-4 py-1 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Transfer household ownership"
                          >
                            {actionLoading === `transfer-${member.user_id}` ? 'Transferring...' : 'Make Owner'}
                          </button>
                        )}
                        <button
                          onClick={() => setMemberToRemove({
                            userId: member.user_id,
                            userName: `${member.user?.first_name} ${member.user?.last_name}`.trim() || 'this member',
                          })}
                          className="px-4 py-1 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all focus:outline-none focus:ring-2 focus:ring-red-500"
                          title="Remove member"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {members.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-lg font-semibold">No members yet</p>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30 rounded-xl">
          <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            About Household Sharing
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-2">
            <li className="flex items-start">
              <span className="mr-2">👥</span>
              <span>Share your household with family members (spouses, parents, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🔐</span>
              <span>Each member has specific permissions based on their role</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">✅</span>
              <span>You must approve all new members before they can access the household</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">🎫</span>
              <span>Invite codes expire after 7 days for security</span>
            </li>
          </ul>
        </div>
      </main>
      <Footer />

      <ConfirmDialog
        isOpen={!!pendingRequestAction}
        onClose={() => setPendingRequestAction(null)}
        onConfirm={handleConfirmPendingRequest}
        title={pendingRequestAction?.type === 'approve' ? 'Approve Request' : 'Reject Request'}
        message={
          pendingRequestAction?.type === 'approve'
            ? 'Approve this request and add the user to your household?'
            : 'Reject this join request?'
        }
        confirmText={pendingRequestAction?.type === 'approve' ? 'Approve' : 'Reject'}
        cancelText="Cancel"
        variant={pendingRequestAction?.type === 'approve' ? 'info' : 'warning'}
      />

      <ConfirmDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmMemberRemoval}
        title="Remove Member"
        message={`Remove ${memberToRemove?.userName || 'this member'} from the household?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={!!memberToRemove && actionLoading === `remove-${memberToRemove.userId}`}
      />

      <ConfirmDialog
        isOpen={!!invitationToRevoke}
        onClose={() => setInvitationToRevoke(null)}
        onConfirm={handleConfirmInvitationRevocation}
        title="Revoke Invitation"
        message={`Revoke invite code ${invitationToRevoke?.invite_code || ''}? Anyone using it will no longer be able to join.`}
        confirmText="Revoke"
        cancelText="Cancel"
        variant="warning"
        isLoading={!!invitationToRevoke && actionLoading === `revoke-${invitationToRevoke.id}`}
      />

      <ConfirmDialog
        isOpen={!!memberRoleAction}
        onClose={() => setMemberRoleAction(null)}
        onConfirm={handleConfirmMemberRoleChange}
        title="Change Member Role"
        message={`Change ${memberRoleAction?.userName || 'this member'} to ${memberRoleAction?.nextRole || 'member'}?`}
        confirmText="Save Role"
        cancelText="Cancel"
        variant="info"
        isLoading={!!memberRoleAction && actionLoading === `role-${memberRoleAction.userId}`}
      />

      <ConfirmDialog
        isOpen={!!ownershipTransferTarget}
        onClose={() => setOwnershipTransferTarget(null)}
        onConfirm={handleConfirmOwnershipTransfer}
        title="Transfer Ownership"
        message={`Transfer household ownership to ${ownershipTransferTarget?.userName || 'this member'}? You will lose owner-only controls after this change.`}
        confirmText="Transfer Ownership"
        cancelText="Cancel"
        variant="warning"
        isLoading={!!ownershipTransferTarget && actionLoading === `transfer-${ownershipTransferTarget.userId}`}
      />
    </div>
  );
}

export { ErrorBoundary } from '~/components/ErrorBoundary';
