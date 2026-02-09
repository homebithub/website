import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { Clock, CheckCircle, XCircle, MessageCircle, Briefcase, Calendar, DollarSign } from 'lucide-react';

interface HireRequest {
  id: string;
  household_id: string;
  job_type: string;
  start_date?: string;
  salary_offered: number;
  salary_frequency: string;
  status: string;
  special_requirements?: string;
  work_schedule?: any;
  created_at: string;
  updated_at: string;
  household?: {
    id: string;
    household_name?: string;
    user?: {
      first_name: string;
      last_name: string;
    };
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
  const backToPath = `${location.pathname}${location.search || ''}`;

  const removeHouseholdFromShortlist = async (profileId?: string | null) => {
    if (!profileId) return;
    try {
      const response = await apiClient.auth(API_ENDPOINTS.shortlists.byId(profileId), {
        method: 'DELETE',
      });
      if (response.ok) {
        window.dispatchEvent(new CustomEvent('shortlist-updated'));
      }
    } catch (err) {
      console.warn('Failed to remove household from shortlist:', err);
    }
  };

  useEffect(() => {
    fetchHireRequests();
  }, [activeTab, offset]);

  const fetchHireRequests = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/login');
        return;
      }

      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      });

      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }

      const response = await apiClient.auth(
        `${API_ENDPOINTS.hiring.requests.base}?${params.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hire requests');
      }

      const data = await response.json();
      setHireRequests(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load hire requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to accept this hire request?')) {
      return;
    }

    setActionLoading(requestId);
    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.accept(requestId),
        { method: 'POST' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept hire request');
      }

      // Refresh the list
      fetchHireRequests();
      alert('Hire request accepted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to accept hire request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest || !declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    const decliningId = selectedRequest;
    setActionLoading(decliningId);
    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.decline(decliningId),
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: declineReason }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decline hire request');
      }

      const declinedRequest = hireRequests.find((req) => req.id === decliningId);
      await removeHouseholdFromShortlist(declinedRequest?.household_id);

      // Refresh the list
      fetchHireRequests();
      setShowDeclineModal(false);
      setSelectedRequest(null);
      setDeclineReason('');
      alert('Hire request declined');
    } catch (err: any) {
      alert(err.message || 'Failed to decline hire request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatSalary = (amount: number, frequency: string) => {
    return `KES ${amount.toLocaleString()} / ${frequency}`;
  };

  const getHouseholdName = (request: HireRequest) => {
    if (request.household?.household_name) {
      return request.household.household_name;
    }
    if (request.household?.user) {
      return `${request.household.user.first_name} ${request.household.user.last_name}`;
    }
    return 'Household';
  };

  const renderWorkSchedule = (schedule: any) => {
    if (!schedule) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const activeDays = days.filter(day => {
      const daySchedule = schedule[day];
      return daySchedule && (daySchedule.morning || daySchedule.afternoon || daySchedule.evening);
    });

    if (activeDays.length === 0) return null;

    return (
      <div className="mt-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Schedule:</span>
        <div className="mt-2 flex flex-wrap gap-2">
          {activeDays.map(day => {
            const daySchedule = schedule[day];
            const times = [];
            if (daySchedule.morning) times.push('M');
            if (daySchedule.afternoon) times.push('A');
            if (daySchedule.evening) times.push('E');
            
            return (
              <span
                key={day}
                className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-xs font-medium"
              >
                {day.charAt(0).toUpperCase() + day.slice(1)}: {times.join(', ')}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'declined', label: 'Declined' },
    { key: 'all', label: 'All Requests' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Hire Requests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review and respond to hire requests from households
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setOffset(0);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && hireRequests.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hire requests yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeTab === 'pending' 
                ? 'You don\'t have any pending hire requests at the moment'
                : `No ${activeTab} hire requests found`
              }
            </p>
          </div>
        )}

        {/* Hire Requests List */}
        {!loading && hireRequests.length > 0 && (
          <div className="space-y-4">
            {hireRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {getHouseholdName(request)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200'
                          : request.status === 'accepted'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Received {formatDate(request.created_at)}
                    </p>
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Job Type</span>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">
                        {request.job_type.replace('-', ' ')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Salary Offered</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatSalary(request.salary_offered, request.salary_frequency)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Start Date</span>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {request.start_date ? formatDate(request.start_date) : 'Flexible'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Special Requirements */}
                {request.special_requirements && (
                  <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Special Requirements:
                    </span>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {request.special_requirements}
                    </p>
                  </div>
                )}

                {/* Work Schedule */}
                {renderWorkSchedule(request.work_schedule)}

                {/* Actions */}
                {request.status === 'pending' && (
                  <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-6 py-1.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {actionLoading === request.id ? 'Accepting...' : 'Accept'}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedRequest(request.id);
                        setShowDeclineModal(true);
                      }}
                      disabled={actionLoading === request.id}
                      className="flex-1 px-6 py-1.5 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Decline
                    </button>
                  </div>
                )}

                {request.status === 'accepted' && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                        ✓ You accepted this request
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/household/public-profile`, {
                            state: {
                              profileId: request.household_id,
                              backTo: backToPath,
                              backLabel: 'Back to Hire Requests',
                            },
                          })
                        }
                        className="px-4 py-1 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                      >
                        Contact Household
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > limit && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{offset + 1}</span> to{' '}
              <span className="font-medium">{Math.min(offset + limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowDeclineModal(false)}
            />
            
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Decline Hire Request
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for declining this hire request. This will help the household understand your decision.
              </p>
              
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={4}
                placeholder="e.g., Schedule conflict, salary expectations, etc."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none mb-4"
              />
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeclineModal(false);
                    setDeclineReason('');
                  }}
                  className="flex-1 px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeclineRequest}
                  disabled={!declineReason.trim() || actionLoading === selectedRequest}
                  className="flex-1 px-4 py-1 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading === selectedRequest ? 'Declining...' : 'Decline Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
