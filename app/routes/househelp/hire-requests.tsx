import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_BASE_URL } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { CheckCircle, XCircle, Briefcase, Calendar, DollarSign, MapPin, Eye } from 'lucide-react';

interface HireRequest {
  id: string;
  household_id: string;
  househelp_id: string;
  job_type: string;
  start_date?: string;
  salary_offered: number;
  salary_frequency: string;
  status: string;
  special_requirements?: string;
  work_schedule?: any;
  decline_reason?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  household?: {
    id: string;
    owner_user_id?: string;
    town?: string;
    house_size?: string;
    owner?: { id?: string; first_name?: string; last_name?: string; avatar_url?: string };
  };
}

type TabType = 'all' | 'pending' | 'accepted' | 'declined';

export default function HousehelpHireRequests() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const limit = 20;

  const API_BASE = useMemo(
    () => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );

  useEffect(() => {
    fetchHireRequests();
  }, [activeTab, offset]);

  const fetchHireRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }

      const response = await apiClient.auth(
        `${API_BASE}/api/v1/hire-requests?${params.toString()}`
      );
      if (!response.ok) throw new Error('Failed to fetch hire requests');

      const raw = await response.json();
      const envelope = raw?.data?.data || raw?.data || raw || {};
      const items = envelope?.data || [];
      setHireRequests(Array.isArray(items) ? items : []);
      setTotal(typeof envelope?.total === 'number' ? envelope.total : 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load hire requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to accept this hire request?')) return;
    setActionLoading(requestId);
    try {
      const response = await apiClient.auth(
        `${API_BASE}/api/v1/hire-requests/${requestId}/accept`,
        { method: 'PUT' }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || 'Failed to accept hire request');
      }
      fetchHireRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to accept hire request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) return;
    setActionLoading(selectedRequest);
    try {
      const response = await apiClient.auth(
        `${API_BASE}/api/v1/hire-requests/${selectedRequest}/decline`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: declineReason }),
        }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.message || 'Failed to decline hire request');
      }
      fetchHireRequests();
      setShowDeclineModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
    } catch (err: any) {
      alert(err.message || 'Failed to decline hire request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getHouseholdName = (request: HireRequest) => {
    const owner = request.household?.owner;
    if (owner?.first_name || owner?.last_name) {
      return `${owner.first_name || ''} ${owner.last_name || ''}`.trim();
    }
    return 'Household';
  };

  const getHouseholdUserId = (request: HireRequest) => {
    return request.household?.owner_user_id || request.household?.owner?.id || '';
  };

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-300', label: 'Pending' },
    accepted: { bg: 'bg-green-500/20', text: 'text-green-300', label: 'Accepted' },
    declined: { bg: 'bg-red-500/20', text: 'text-red-300', label: 'Declined' },
    cancelled: { bg: 'bg-gray-500/20', text: 'text-gray-300', label: 'Cancelled' },
    expired: { bg: 'bg-gray-500/20', text: 'text-gray-400', label: 'Expired' },
    finalized: { bg: 'bg-blue-500/20', text: 'text-blue-300', label: 'Finalized' },
  };

  const renderWorkSchedule = (schedule: any) => {
    if (!schedule) return null;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const activeDays = days.filter(day => {
      const d = schedule[day];
      return d && (d.morning || d.afternoon || d.evening);
    });
    if (activeDays.length === 0) return null;

    return (
      <div className="mt-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Work Schedule</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {activeDays.map(day => {
            const d = schedule[day];
            const times: string[] = [];
            if (d.morning) times.push('AM');
            if (d.afternoon) times.push('PM');
            if (d.evening) times.push('Eve');
            return (
              <span key={day} className="px-3 py-1 bg-purple-500/20 text-purple-200 rounded-full text-xs font-medium">
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}: {times.join(', ')}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'pending', label: 'Pending', icon: '⏳' },
    { key: 'accepted', label: 'Accepted', icon: '✅' },
    { key: 'declined', label: 'Declined', icon: '❌' },
    { key: 'all', label: 'All', icon: '📋' },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hire Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Review and respond to hire requests from households</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setOffset(0); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                : 'bg-white/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-purple-500/20 hover:bg-purple-50 dark:hover:bg-purple-500/10'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
        </div>
      )}

      {/* Empty State */}
      {!loading && hireRequests.length === 0 && !error && (
        <div className="bg-white/5 dark:bg-[#13131a] border-2 border-dashed border-purple-500/20 rounded-2xl p-12 text-center">
          <Briefcase className="w-16 h-16 text-purple-400/50 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No hire requests</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {activeTab === 'pending'
              ? "You don't have any pending hire requests. When a household wants to hire you, their request will appear here."
              : activeTab === 'all'
              ? "You haven't received any hire requests yet."
              : `No ${activeTab} hire requests found.`}
          </p>
        </div>
      )}

      {/* Hire Requests List */}
      {!loading && hireRequests.length > 0 && (
        <div className="space-y-4">
          {hireRequests.map((request) => {
            const sc = statusConfig[request.status] || statusConfig.pending;
            const householdUserId = getHouseholdUserId(request);
            return (
              <div
                key={request.id}
                className="bg-white dark:bg-[#13131a] rounded-2xl border-2 border-gray-200/40 dark:border-purple-500/20 shadow-sm hover:shadow-lg dark:hover:shadow-purple-500/10 transition-all p-5 sm:p-6"
              >
                {/* Top row: name + status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {getHouseholdName(request).charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {getHouseholdName(request)}
                      </h3>
                      {request.household?.town && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {request.household.town}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                      {sc.label}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(request.created_at)}</span>
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-purple-50 dark:bg-purple-500/10">
                    <Briefcase className="w-4 h-4 text-purple-500" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">Job Type</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                        {request.job_type?.replace(/-/g, ' ') || 'Not specified'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-500/10">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">Salary</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        KES {(request.salary_offered || 0).toLocaleString()}
                        <span className="text-xs font-normal text-gray-400"> / {request.salary_frequency || 'month'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">Start Date</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {request.start_date ? formatDate(request.start_date) : 'Flexible'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                {request.special_requirements && (
                  <div className="mb-4 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/50 dark:border-purple-500/10">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Special Requirements</span>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">{request.special_requirements}</p>
                  </div>
                )}

                {/* Work Schedule */}
                {renderWorkSchedule(request.work_schedule)}

                {/* Decline reason (for declined requests) */}
                {request.status === 'declined' && request.decline_reason && (
                  <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/20">
                    <span className="text-xs font-semibold uppercase tracking-wider text-red-400">Decline Reason</span>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">{request.decline_reason}</p>
                  </div>
                )}

                {/* Actions for pending requests */}
                {request.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-5 pt-4 border-t border-gray-200/50 dark:border-purple-500/10">
                    {householdUserId && (
                      <button
                        onClick={() => navigate(`/household/public-profile?user_id=${householdUserId}`, {
                          state: { backTo: location.pathname, backLabel: 'Back to Hire Requests' },
                        })}
                        className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> View Household
                      </button>
                    )}
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {actionLoading === request.id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => { setSelectedRequest(request.id); setShowDeclineModal(true); }}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border-2 border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </div>
                )}

                {/* Accepted state */}
                {request.status === 'accepted' && (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-gray-200/50 dark:border-purple-500/10">
                    <p className="text-sm text-green-500 font-semibold">✓ You accepted this request</p>
                    {householdUserId && (
                      <button
                        onClick={() => navigate(`/household/public-profile?user_id=${householdUserId}`, {
                          state: { backTo: location.pathname, backLabel: 'Back to Hire Requests' },
                        })}
                        className="px-4 py-1.5 text-sm bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        View Household
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && total > limit && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {offset + 1}–{Math.min(offset + limit, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setOffset(Math.max(0, offset - limit))}
              disabled={offset === 0}
              className="px-4 py-1.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <button
              onClick={() => setOffset(offset + limit)}
              disabled={offset + limit >= total}
              className="px-4 py-1.5 rounded-xl text-sm font-medium border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-purple-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setShowDeclineModal(false); setDeclineReason(''); }} />
          <div className="relative bg-white dark:bg-[#1a1a24] rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-200 dark:border-purple-500/20">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Decline Hire Request</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Please provide a reason for declining. This helps the household understand your decision.
            </p>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
              placeholder="e.g., Schedule conflict, salary expectations, location too far..."
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none mb-4 text-sm"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeclineModal(false); setDeclineReason(''); }}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold border border-gray-300 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-purple-500/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineRequest}
                disabled={!declineReason.trim() || actionLoading === selectedRequest}
                className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {actionLoading === selectedRequest ? 'Declining...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
