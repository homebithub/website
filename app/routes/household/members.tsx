import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { Loading } from '~/components/Loading';
import { useAuth } from '~/contexts/useAuth';
import { InviteCodeGenerator } from '~/components/household/InviteCodeGenerator';
import { formatTimeAgo } from "~/utils/timeAgo";
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import {
  listMembers,
  listPendingRequests,
  approveRequest,
  rejectRequest,
  removeMember,
  updateMemberRole,
  type HouseholdMember,
  type HouseholdMemberRequest,
} from '~/utils/householdApi';

export default function HouseholdMembersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<HouseholdMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<HouseholdMemberRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [householdId, setHouseholdId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Get household ID from user profile
    const userObj = localStorage.getItem('user_object');
    if (userObj) {
      const parsed = JSON.parse(userObj);
      // Assuming household_id is stored in user profile
      const hhId = parsed.household_id;
      if (hhId) {
        setHouseholdId(hhId);
        loadData(hhId);
      } else {
        setError('No household found for your account');
        setLoading(false);
      }
    }
  }, [user, navigate]);

  const loadData = async (hhId: string) => {
    try {
      setLoading(true);
      setError(null);

      const [membersData, requestsData] = await Promise.all([
        listMembers(hhId),
        listPendingRequests(hhId).catch(() => []), // Ignore if no permission
      ]);

      setMembers(membersData);
      setPendingRequests(requestsData);

      // Find current user's role
      const currentMember = membersData.find((m) => m.user_id === user?.id);
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
      await approveRequest(householdId, requestId);
      await loadData(householdId);
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!householdId) return;

    const reason = prompt('Reason for rejection (optional):');
    try {
      await rejectRequest(householdId, requestId, reason || undefined);
      await loadData(householdId);
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    }
  };

  const handleRemoveMember = async (userId: string, userName: string) => {
    if (!householdId) return;

    if (!confirm(`Are you sure you want to remove ${userName} from the household?`)) {
      return;
    }

    try {
      await removeMember(householdId, userId);
      await loadData(householdId);
    } catch (err: any) {
      alert(err.message || 'Failed to remove member');
    }
  };

  const handleChangeRole = async (userId: string, currentRole: string) => {
    if (!householdId) return;

    const newRole = currentRole === 'admin' ? 'member' : 'admin';
    if (!confirm(`Change role to ${newRole}?`)) {
      return;
    }

    try {
      await updateMemberRole(householdId, userId, newRole as 'admin' | 'member');
      await loadData(householdId);
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  const canInvite = currentUserRole === 'owner' || currentUserRole === 'admin';
  const canRemove = currentUserRole === 'owner';

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
                        onClick={() => handleApprove(request.id)}
                        className="px-4 py-1 rounded-xl bg-green-600 text-white font-bold hover:bg-green-700 transition-all focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
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
              const isCurrentUser = member.user_id === user?.id;
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
                    {!isCurrentUser && !isOwner && canRemove && (
                      <div className="flex gap-2">
                        {member.role !== 'owner' && (
                          <button
                            onClick={() => handleChangeRole(member.user_id, member.role)}
                            className="px-4 py-1 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                            title="Change role"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleRemoveMember(
                              member.user_id,
                              `${member.user?.first_name} ${member.user?.last_name}`
                            )
                          }
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
    </div>
  );
}

export { ErrorBoundary } from '~/components/ErrorBoundary';
