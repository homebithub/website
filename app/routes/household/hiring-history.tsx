import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { Clock, CheckCircle, XCircle, Ban, FileText, MessageCircle, HandHeart, Eye, UserCheck, UserX } from 'lucide-react';

interface HireRequest {
  id: string;
  househelp_id: string;
  job_type: string;
  start_date?: string;
  salary_offered: number;
  salary_frequency: string;
  status: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  decline_reason?: string;
  cancel_reason?: string;
  cancellation_message?: string;
  househelp?: {
    id: string;
    first_name?: string;
    last_name?: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
    avatar_url?: string;
    photos?: string[];
  };
}

type TabType = 'interested' | 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled';

interface Interest {
  id: string;
  househelp_id: string;
  household_id: string;
  salary_expectation: number;
  salary_frequency: string;
  available_from?: string;
  job_type?: string;
  comments?: string;
  status: string;
  viewed_at?: string;
  created_at: string;
  househelp?: {
    id: string;
    first_name?: string;
    last_name?: string;
    user?: {
      first_name?: string;
      last_name?: string;
    };
    avatar_url?: string;
    photos?: string[];
    user_id?: string;
  };
}

const CANCEL_REASONS = [
  { value: 'schedule_change', label: 'My schedule changed' },
  { value: 'found_alternative', label: 'Found another househelp' },
  { value: 'budget', label: 'Budget or salary mismatch' },
  { value: 'no_longer_needed', label: 'No longer need assistance' },
  { value: 'communication', label: 'Communication issues' },
  { value: 'other', label: 'Other (please specify)' },
] as const;

const getHousehelpInitials = (househelp?: HireRequest['househelp']) => {
  const first = (househelp?.first_name || househelp?.user?.first_name)?.trim();
  const last = (househelp?.last_name || househelp?.user?.last_name)?.trim();
  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) {
    const parts = first.split(/\s+/);
    if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return first.slice(0, 2).toUpperCase();
  }
  if (last) return last.slice(0, 2).toUpperCase();
  return 'HH';
};

const getHousehelpName = (househelp?: HireRequest['househelp']) => {
  const first = househelp?.user?.first_name || househelp?.first_name || '';
  const last = househelp?.user?.last_name || househelp?.last_name || '';
  const full = `${first} ${last}`.trim();
  return full || 'Househelp';
};

export default function HiringHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('interested');
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsTotal, setInterestsTotal] = useState(0);
  const [interestsCount, setInterestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null);
  const [cancelRequest, setCancelRequest] = useState<HireRequest | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const limit = 20;
  const backToPath = `${location.pathname}${location.search || ''}`;

  const removeHousehelpFromShortlist = async (profileId?: string | null) => {
    if (!profileId) return;
    try {
      const response = await apiClient.auth(API_ENDPOINTS.shortlists.byId(profileId), {
        method: 'DELETE',
      });
      if (response.ok) {
        window.dispatchEvent(new CustomEvent('shortlist-updated'));
      }
    } catch (err) {
      console.warn('Failed to remove househelp from shortlist:', err);
    }
  };

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (activeTab === 'interested') {
      fetchInterests();
    } else {
      fetchHireRequests();
    }
  }, [activeTab, offset]);

  // Fetch interest count for badge
  useEffect(() => {
    const fetchInterestCount = async () => {
      try {
        const response = await apiClient.auth(API_ENDPOINTS.interests.count, { method: 'GET' });
        if (response.ok) {
          const data = await response.json();
          setInterestsCount(data.count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch interest count:', err);
      }
    };
    fetchInterestCount();
  }, []);

  const fetchInterests = async () => {
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

      const response = await apiClient.auth(
        `${API_ENDPOINTS.interests.household}?${params.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch interested househelps');
      }

      const data = await response.json();
      setInterests(data.items || []);
      setInterestsTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load interested househelps');
    } finally {
      setLoading(false);
    }
  };

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
      setError(err.message || 'Failed to load hiring history');
    } finally {
      setLoading(false);
    }
  };

  const openCancelModal = (request: HireRequest) => {
    setCancelRequest(request);
    setCancelReason('');
    setCustomCancelReason('');
    setCancelMessage('');
    setCancelError(null);
  };

  const closeCancelModal = () => {
    if (cancelSubmitting) return;
    setCancelRequest(null);
  };

  const getReasonLabel = (value: string) =>
    CANCEL_REASONS.find((reason) => reason.value === value)?.label || value;

  const submitCancelRequest = async () => {
    if (!cancelRequest) return;
    if (!cancelReason) {
      setCancelError('Please select a reason for cancelling.');
      return;
    }
    if (cancelReason === 'other' && !customCancelReason.trim()) {
      setCancelError('Please provide your reason for cancelling.');
      return;
    }

    const resolvedReason =
      cancelReason === 'other' ? customCancelReason.trim() : getReasonLabel(cancelReason);

    setCancelSubmitting(true);
    setCancelError(null);

    try {
      const response = await apiClient.auth(API_ENDPOINTS.hiring.requests.byId(cancelRequest.id), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: resolvedReason,
          message: cancelMessage.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel hire request');
      }

      await removeHousehelpFromShortlist(cancelRequest.househelp?.id || cancelRequest.househelp_id);
      setCancelRequest(null);
      fetchHireRequests();
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel hire request');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'declined':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'cancelled':
        return <Ban className="w-5 h-5 text-gray-500" />;
      case 'finalized':
        return <FileText className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'declined':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
      case 'finalized':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
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

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'interested', label: 'Interested', count: interestsCount },
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'declined', label: 'Declined' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const handleViewInterest = async (interest: Interest) => {
    // Mark as viewed if not already
    if (!interest.viewed_at) {
      try {
        await apiClient.auth(API_ENDPOINTS.interests.markViewed(interest.id), { method: 'PUT' });
        setInterestsCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark interest as viewed:', err);
      }
    }
    // Navigate to househelp profile using profileId
    const profileId = interest.househelp_id;
    navigate(`/househelp/public-profile?profileId=${profileId}`, {
      state: { backTo: backToPath, backLabel: 'Back to Hiring' },
    });
  };

  const handleAcceptInterest = async (interest: Interest) => {
    try {
      await apiClient.auth(API_ENDPOINTS.interests.accept(interest.id), { method: 'PUT' });
      fetchInterests();
      setInterestsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to accept interest:', err);
    }
  };

  const handleDeclineInterest = async (interest: Interest) => {
    try {
      await apiClient.auth(API_ENDPOINTS.interests.decline(interest.id), { method: 'PUT' });
      fetchInterests();
      setInterestsCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to decline interest:', err);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white shadow-xl border border-purple-100 px-4 sm:px-8 py-8 dark:bg-gradient-to-b dark:from-[#1a102b] dark:via-[#0e0a1a] dark:to-[#07050d] dark:border-purple-800/40 dark:shadow-2xl dark:shadow-purple-900/50 transition-colors">
        {/* Header */}
        <div className="mb-8">
          <p className="text-sm uppercase tracking-widest text-gray-500 font-semibold mb-2 dark:text-purple-300">
            Household • Hiring
          </p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2 dark:text-white">
            Hiring
          </h1>
          <p className="text-gray-600 dark:text-purple-200">
            Manage all your hire requests and view their status
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 mb-6 dark:bg-purple-900/30 dark:shadow-inner dark:shadow-purple-900/40 dark:border-purple-700/50 transition-colors">
          <div className="border-b border-gray-200 dark:border-purple-800/50">
            <nav className="flex space-x-6 px-6 text-gray-600 dark:text-purple-200 overflow-x-auto no-scrollbar" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setOffset(0);
                  }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-700 dark:text-white'
                      : 'border-transparent text-gray-400 hover:text-purple-700 dark:hover:text-white hover:border-purple-300'
                  }`}
                >
                  {tab.key === 'interested' && <HandHeart className="w-4 h-4" />}
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-green-500 text-white">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50/90 dark:bg-red-900/30 border border-red-200 dark:border-red-600/40 rounded-2xl p-4 mb-6 transition-colors">
            <p className="text-red-700 dark:text-red-100 font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State for Interests */}
        {!loading && activeTab === 'interested' && interests.length === 0 && (
          <div className="bg-white/95 dark:bg-purple-900/30 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-700/40 p-8 sm:p-12 text-center transition-colors">
            <HandHeart className="w-16 h-16 text-green-400 dark:text-green-300 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-purple-900 dark:text-white mb-2">
              No interested househelps yet
            </h3>
            <p className="text-gray-600 dark:text-purple-200 mb-6 sm:mb-8 text-sm sm:text-base">
              When househelps express interest in working for you, they'll appear here
            </p>
          </div>
        )}

        {/* Interests List */}
        {!loading && activeTab === 'interested' && interests.length > 0 && (
          <div className="space-y-4">
            {interests.map((interest) => (
              <div
                key={interest.id}
                className={`bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow border dark:bg-purple-950/40 dark:shadow-purple-900/40 dark:hover:shadow-2xl ${
                  !interest.viewed_at 
                    ? 'border-green-300 dark:border-green-600/40 ring-2 ring-green-100 dark:ring-green-900/30' 
                    : 'border-purple-100 dark:border-purple-800/40'
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Househelp Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-400 flex-shrink-0">
                      {interest.househelp?.avatar_url || interest.househelp?.photos?.[0] ? (
                        <img
                          src={interest.househelp.avatar_url || interest.househelp.photos?.[0]}
                          alt={getHousehelpName(interest.househelp as any)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                          {getHousehelpInitials(interest.househelp as any)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {getHousehelpName(interest.househelp as any)}
                        </h3>
                        {!interest.viewed_at && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200">
                            <HandHeart className="w-3 h-3" />
                            New
                          </span>
                        )}
                        {interest.status === 'accepted' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                            <UserCheck className="w-3 h-3" />
                            Accepted
                          </span>
                        )}
                        {interest.status === 'declined' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200">
                            <UserX className="w-3 h-3" />
                            Declined
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-700 dark:text-purple-100">
                        {interest.job_type && (
                          <div>
                            <span className="text-gray-500 dark:text-purple-300">Preferred Job</span>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {interest.job_type.replace('-', ' ')}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Salary Expectation</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatSalary(interest.salary_expectation, interest.salary_frequency)}
                          </p>
                        </div>
                        {interest.available_from && (
                          <div>
                            <span className="text-gray-500 dark:text-purple-300">Available From</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(interest.available_from)}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Expressed Interest</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(interest.created_at)}
                          </p>
                        </div>
                      </div>

                      {interest.comments && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-purple-900/20 rounded-lg">
                          <span className="text-xs text-gray-500 dark:text-purple-300 block mb-1">Message</span>
                          <p className="text-sm text-gray-700 dark:text-purple-100">{interest.comments}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-row lg:flex-col gap-2 lg:items-end">
                    <button
                      onClick={() => handleViewInterest(interest)}
                      className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 dark:text-purple-200 dark:bg-purple-900/40 dark:hover:bg-purple-800/60 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Profile
                    </button>
                    {interest.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptInterest(interest)}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineInterest(interest)}
                          className="flex-1 lg:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 dark:text-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60 transition-colors"
                        >
                          <UserX className="w-4 h-4" />
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for Hire Requests */}
        {!loading && activeTab !== 'interested' && hireRequests.length === 0 && (
          <div className="bg-white/95 dark:bg-purple-900/30 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-700/40 p-8 sm:p-12 text-center transition-colors">
            <FileText className="w-16 h-16 text-purple-400 dark:text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl sm:text-2xl font-semibold text-purple-900 dark:text-white mb-2">
              No hire requests yet
            </h3>
            <p className="text-gray-600 dark:text-purple-200 mb-6 sm:mb-8 text-sm sm:text-base">
              Start hiring by browsing househelps and sending hire requests
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-base sm:text-lg rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500"
            >
              Find Househelps
            </button>
          </div>
        )}

        {/* Hire Requests List */}
        {!loading && activeTab !== 'interested' && hireRequests.length > 0 && (
          <div className="space-y-4">
            {hireRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-lg shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow border border-purple-100 dark:bg-purple-950/40 dark:border-purple-800/40 dark:shadow-purple-900/40 dark:hover:shadow-2xl"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  {/* Left: Househelp Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                      {request.househelp?.avatar_url || request.househelp?.photos?.[0] ? (
                        <img
                          src={request.househelp.avatar_url || request.househelp.photos?.[0]}
                          alt={getHousehelpName(request.househelp)}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                          {getHousehelpInitials(request.househelp)}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                          {getHousehelpName(request.househelp)}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm text-gray-700 dark:text-purple-100">
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Job Type</span>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {request.job_type.replace('-', ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Salary</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatSalary(request.salary_offered, request.salary_frequency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Start Date</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.start_date ? formatDate(request.start_date) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Requested</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-purple-300">Expires</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {(() => {
                              const days = getDaysRemaining(request.expires_at);
                              if (days === null) return '—';
                              if (days <= 0) return 'Expired';
                              if (days === 1) return '1 day left';
                              return `${days} days left`;
                            })()}
                          </p>
                        </div>
                      </div>

                      {request.special_requirements && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500 dark:text-purple-300">Special Requirements:</span>
                          <p className="text-sm text-gray-700 dark:text-purple-100 mt-1">
                            {request.special_requirements}
                          </p>
                        </div>
                      )}

                      {request.decline_reason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 dark:bg-red-900/30 dark:border-red-700/40 dark:text-red-100">
                          <span className="text-sm font-medium">Decline Reason:</span>
                          <p className="text-sm mt-1">
                            {request.decline_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 flex-1"
                    >
                      View Details
                    </button>

                    {request.status === 'pending' && (
                      <button
                        onClick={() => openCancelModal(request)}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-red-600 via-red-500 to-orange-400 text-white font-semibold shadow-lg shadow-red-500/40 hover:from-red-700 hover:via-red-500 hover:to-orange-400 transition-all whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-500 flex-1"
                      >
                        Cancel Request
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && total > limit && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{offset + 1}</span> to{' '}
              <span className="font-medium">{Math.min(offset + limit, total)}</span> of{' '}
              <span className="font-medium">{total}</span> results
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
     <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-4">
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      onClick={() => setSelectedRequest(null)}
    />

    {/* Modal */}
    <div className="
      relative w-full max-w-[360px] sm:max-w-3xl mx-auto
      bg-white dark:bg-[#0d0d15]
      rounded-2xl sm:rounded-3xl
      border border-purple-200/50 dark:border-purple-600/40
      shadow-2xl shadow-purple-500/20
      p-4 sm:p-8
      max-h-[90vh]
      overflow-y-auto
      pb-safe
    ">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-start sm:justify-between mb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-purple-500 dark:text-purple-300 font-semibold">
            Hire Request
          </p>
          <h3 className="text-lg sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {getHousehelpName(selectedRequest.househelp)}
          </h3>
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span className="capitalize">
              {selectedRequest.job_type.replace("-", " ")}
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="capitalize">
              {selectedRequest.status}
            </span>
          </div>
        </div>
        <button
          onClick={() => setSelectedRequest(null)}
          className="text-gray-500 dark:text-gray-300 hover:text-purple-500 transition self-start"
          aria-label="Close details"
        >
          ✕
        </button>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 mb-5 sm:mb-6">
        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-sm uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Salary
          </p>
          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white break-words">
            {formatSalary(selectedRequest.salary_offered, selectedRequest.salary_frequency)}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-sm uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Start Date
          </p>
          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {selectedRequest.start_date
              ? formatDate(selectedRequest.start_date)
              : "Not specified"}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-sm uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Requested On
          </p>
          <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
            {formatDate(selectedRequest.created_at)}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-sm uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Status
          </p>
          <p className="text-base sm:text-lg font-semibold capitalize text-gray-900 dark:text-white">
            {selectedRequest.status}
          </p>
        </div>
      </div>

      <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/30">
        <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-purple-300 mb-1">
          Job Type
        </p>
        <p className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white capitalize">
          {selectedRequest.job_type.replace("-", " ")}
        </p>
      </div>

      {selectedRequest.special_requirements && (
        <div className="mb-5 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            Special Requirements
          </h4>
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700/80">
            {selectedRequest.special_requirements}
          </p>
        </div>
      )}

      {(selectedRequest.decline_reason || selectedRequest.cancel_reason) && (
        <div className="mb-5 sm:mb-6">
          <h4 className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            {selectedRequest.status === "declined"
              ? "Decline Reason"
              : "Cancellation Reason"}
          </h4>
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-100 bg-red-50 dark:bg-red-900/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-100 dark:border-red-500/30">
            {selectedRequest.decline_reason || selectedRequest.cancel_reason}
          </p>

          {selectedRequest.cancellation_message && (
            <div className="mt-3">
              <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300">
                Message sent to househelp:
              </span>
              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/40 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700/60 mt-1">
                {selectedRequest.cancellation_message}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
        <button
          onClick={() => {
            const profileId =
              selectedRequest?.househelp?.id || selectedRequest?.househelp_id;
            if (profileId) {
              navigate("/househelp/public-profile", {
                state: {
                  profileId,
                  backTo: backToPath,
                  backLabel: "Back to Hiring",
                },
              });
              setSelectedRequest(null);
            }
          }}
          className="
            flex-1 inline-flex items-center justify-center
            px-5 sm:px-6 py-2.5 sm:py-3
            text-sm sm:text-base
            rounded-xl sm:rounded-2xl
            bg-gradient-to-r from-purple-600 to-pink-600
            text-white font-semibold
            shadow-lg shadow-purple-500/30
            hover:from-purple-700 hover:to-pink-700
            transition-all
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2 focus-visible:ring-purple-500
            disabled:opacity-60 disabled:cursor-not-allowed
          "
          disabled={!selectedRequest.househelp?.id && !selectedRequest.househelp_id}
        >
          View Househelp Profile
        </button>

        <button
          onClick={() => setSelectedRequest(null)}
          className="
            inline-flex items-center justify-center
            px-5 sm:px-6 py-2.5 sm:py-3
            text-sm sm:text-base
            rounded-xl sm:rounded-2xl
            border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-200 font-semibold
            hover:bg-gray-50 dark:hover:bg-gray-800
            transition-all
          "
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}


{cancelRequest && (
  <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-4">
    {/* Overlay */}
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      onClick={closeCancelModal}
    />

    {/* Modal */}
    <div
      className="
        relative w-full max-w-[360px] sm:max-w-2xl mx-auto
        bg-white dark:bg-[#0d0d15]
        rounded-2xl sm:rounded-3xl
        border border-red-200/50 dark:border-red-500/40
        shadow-2xl shadow-red-500/20
        p-4 sm:p-8
        max-h-[90vh]
        overflow-y-auto
        pb-safe
      "
    >
      <div className="flex flex-col sm:flex-row gap-3 sm:items-start sm:justify-between mb-5 sm:mb-6">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-red-500 dark:text-red-300 font-semibold">
            Cancel Hire Request
          </p>
          <h3 className="text-lg sm:text-2xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {getHousehelpName(cancelRequest.househelp)}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Select a reason and optionally leave a message the househelp will see.
          </p>
        </div>
        <button
          onClick={closeCancelModal}
          className="text-gray-500 dark:text-gray-300 hover:text-red-500 transition self-start"
          aria-label="Close cancellation modal"
          disabled={cancelSubmitting}
        >
          ✕
        </button>
      </div>

      <div className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
        {CANCEL_REASONS.map((reason) => (
          <label
            key={reason.value}
            className={`flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl sm:rounded-2xl border cursor-pointer transition ${
              cancelReason === reason.value
                ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-500/40"
            }`}
          >
            <input
              type="radio"
              name="cancel-reason"
              value={reason.value}
              checked={cancelReason === reason.value}
              onChange={() => setCancelReason(reason.value)}
              className="mt-0.5 sm:mt-1 text-red-500 focus:ring-red-500 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-800 dark:text-gray-100">
              {reason.label}
            </span>
          </label>
        ))}
      </div>

      {cancelReason === "other" && (
        <div className="mb-5 sm:mb-6">
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Provide your reason
          </label>
          <input
            type="text"
            value={customCancelReason}
            onChange={(e) => setCustomCancelReason(e.target.value)}
            className="
              w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm
              rounded-xl sm:rounded-2xl
              border-2
              bg-white dark:bg-[#13131a]
              text-gray-900 dark:text-white
              border-red-200 dark:border-red-500/40
              focus:outline-none focus:ring-2 focus:ring-red-500
            "
            placeholder="Tell us why you're cancelling"
          />
        </div>
      )}

      <div className="mb-5 sm:mb-6">
        <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Additional message to the househelp (optional)
        </label>
        <textarea
          rows={4}
          value={cancelMessage}
          onChange={(e) => setCancelMessage(e.target.value)}
          placeholder="Let them know anything specific about the cancellation..."
          className="
            w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm
            rounded-xl sm:rounded-2xl
            border-2
            bg-white dark:bg-[#13131a]
            text-gray-900 dark:text-white
            border-red-200 dark:border-red-500/40
            focus:outline-none focus:ring-2 focus:ring-red-500
            resize-none
          "
        />
      </div>

      {cancelError && (
        <div className="mb-4 p-3 rounded-xl sm:rounded-2xl border border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-xs sm:text-sm text-red-700 dark:text-red-200">
          {cancelError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
        <button
          onClick={submitCancelRequest}
          disabled={cancelSubmitting}
          className="
            flex-1 inline-flex items-center justify-center
            px-5 sm:px-6 py-2.5 sm:py-3
            text-sm sm:text-base
            rounded-xl sm:rounded-2xl
            bg-gradient-to-r from-red-600 via-red-500 to-orange-400
            text-white font-semibold
            shadow-lg shadow-red-500/30
            hover:from-red-700 hover:via-red-500 hover:to-orange-400
            transition-all
            focus:outline-none focus-visible:ring-2
            focus-visible:ring-offset-2 focus-visible:ring-red-500
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {cancelSubmitting ? "Cancelling..." : "Submit Cancellation"}
        </button>

        <button
          onClick={closeCancelModal}
          disabled={cancelSubmitting}
          className="
            inline-flex items-center justify-center
            px-5 sm:px-6 py-2.5 sm:py-3
            text-sm sm:text-base
            rounded-xl sm:rounded-2xl
            border border-gray-300 dark:border-gray-600
            text-gray-700 dark:text-gray-200 font-semibold
            hover:bg-gray-50 dark:hover:bg-gray-800
            transition-all
          "
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}
</div>
)}
