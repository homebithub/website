import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { 
  Clock, CheckCircle, XCircle, MessageCircle, Briefcase, 
  Eye, HandHeart, Building2, Star, Ban, X, Calendar, DollarSign, MapPin, User
} from 'lucide-react';

interface HireRequest {
  id: string;
  household_id: string;
  job_type: string;
  start_date?: string;
  salary_offered: number;
  salary_frequency: string;
  status: string;
  special_requirements?: string;
  created_at: string;
  updated_at: string;
  household?: {
    id: string;
    household_name?: string;
    avatar_url?: string;
    town?: string;
    user?: {
      first_name: string;
      last_name: string;
    };
    user_id?: string;
  };
}

interface HireContract {
  id: string;
  household_id: string;
  job_type: string;
  start_date: string;
  end_date?: string;
  salary: number;
  salary_frequency: string;
  status: string;
  created_at: string;
  household?: {
    id: string;
    household_name?: string;
    avatar_url?: string;
    town?: string;
    user?: {
      first_name: string;
      last_name: string;
    };
    user_id?: string;
  };
}

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
  household?: {
    id: string;
    household_name?: string;
    avatar_url?: string;
    town?: string;
    user?: {
      first_name: string;
      last_name: string;
    };
    user_id?: string;
  };
}

type TabType = 'requests' | 'work-history' | 'interests';

const getHouseholdName = (household?: HireRequest['household'] | HireContract['household'] | Interest['household']) => {
  if (!household) return 'Household';
  if (household.household_name) return household.household_name;
  if (household.user) {
    return `${household.user.first_name} ${household.user.last_name}`.trim();
  }
  return 'Household';
};

const getHouseholdInitials = (household?: HireRequest['household'] | HireContract['household'] | Interest['household']) => {
  const name = getHouseholdName(household);
  const parts = name.split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const extractEnvelopeObject = <T = any,>(raw: any): T =>
  (raw?.data?.data || raw?.data || raw || {}) as T;

const extractEnvelopeArray = <T = any,>(raw: any): T[] => {
  const payload: any = extractEnvelopeObject(raw);
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  if (Array.isArray(raw?.items)) return raw.items as T[];
  return [];
};

const extractTotal = (raw: any, fallbackLength: number): number => {
  const payload: any = extractEnvelopeObject(raw);
  const total = payload?.total ?? raw?.total;
  return typeof total === 'number' ? total : fallbackLength;
};

export default function HousehelpHiringHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('requests');
  
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsLoading, setRequestsLoading] = useState(true);
  
  const [contracts, setContracts] = useState<HireContract[]>([]);
  const [contractsTotal, setContractsTotal] = useState(0);
  const [contractsLoading, setContractsLoading] = useState(true);
  
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsTotal, setInterestsTotal] = useState(0);
  const [interestsLoading, setInterestsLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  
  // Confirmation dialog states
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const limit = 20;
  const backToPath = `${location.pathname}${location.search || ''}`;

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const response = await apiClient.auth(
          `${API_ENDPOINTS.hiring.requests.base}?status=pending&limit=1`,
          { method: 'GET' }
        );
        if (response.ok) {
          const raw = await apiClient.json<any>(response);
          const items = extractEnvelopeArray(raw);
          setPendingCount(extractTotal(raw, items.length));
        }
      } catch (err) {
        console.error('Failed to fetch pending count:', err);
      }
    };
    fetchPendingCount();
  }, []);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchHireRequests();
    } else if (activeTab === 'work-history') {
      fetchContracts();
    } else if (activeTab === 'interests') {
      fetchInterests();
    }
  }, [activeTab, offset]);

  const fetchHireRequests = async () => {
    setRequestsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate('/login'); return; }
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      const response = await apiClient.auth(`${API_ENDPOINTS.hiring.requests.base}?${params.toString()}`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch hire requests');
      const raw = await apiClient.json<any>(response);
      const items = extractEnvelopeArray<HireRequest>(raw);
      setHireRequests(items);
      setRequestsTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load hire requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  const fetchContracts = async () => {
    setContractsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate('/login'); return; }
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      const response = await apiClient.auth(`${API_ENDPOINTS.hiring.contracts.base}?${params.toString()}`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch work history');
      const raw = await apiClient.json<any>(response);
      const items = extractEnvelopeArray<HireContract>(raw);
      setContracts(items);
      setContractsTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load work history');
    } finally {
      setContractsLoading(false);
    }
  };

  const fetchInterests = async () => {
    setInterestsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate('/login'); return; }
      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      const response = await apiClient.auth(`${API_ENDPOINTS.interests.househelp}?${params.toString()}`, { method: 'GET' });
      if (!response.ok) throw new Error('Failed to fetch interests');
      const raw = await apiClient.json<any>(response);
      const items = extractEnvelopeArray<Interest>(raw);
      setInterests(items);
      setInterestsTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load interests');
    } finally {
      setInterestsLoading(false);
    }
  };

  const openAcceptConfirm = (requestId: string) => {
    setPendingActionId(requestId);
    setShowAcceptConfirm(true);
  };

  const handleAcceptRequest = async () => {
    if (!pendingActionId) return;
    setActionLoading(pendingActionId);
    try {
      const response = await apiClient.auth(API_ENDPOINTS.hiring.requests.accept(pendingActionId), { method: 'POST' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept hire request');
      }
      fetchHireRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to accept hire request');
    } finally {
      setActionLoading(null);
      setShowAcceptConfirm(false);
      setPendingActionId(null);
    }
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest || !declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }
    setActionLoading(selectedRequest);
    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.decline(selectedRequest),
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: declineReason }) }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decline hire request');
      }
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

  const openWithdrawConfirm = (interestId: string) => {
    setPendingActionId(interestId);
    setShowWithdrawConfirm(true);
  };

  const handleWithdrawInterest = async () => {
    if (!pendingActionId) return;
    setActionLoading(pendingActionId);
    try {
      const response = await apiClient.auth(API_ENDPOINTS.interests.byId(pendingActionId), { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to withdraw interest');
      }
      fetchInterests();
      setShowInterestModal(false);
      setSelectedInterest(null);
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw interest');
    } finally {
      setActionLoading(null);
      setShowWithdrawConfirm(false);
      setPendingActionId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatSalary = (amount: number, frequency: string) => `KES ${amount.toLocaleString()} / ${frequency}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted': case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'declined': case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'viewed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'accepted': case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'declined': case 'terminated': return <XCircle className="w-4 h-4" />;
      case 'completed': return <Star className="w-4 h-4" />;
      case 'viewed': return <Eye className="w-4 h-4" />;
      case 'cancelled': return <Ban className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const tabs: { key: TabType; label: string; count?: number }[] = [
    { key: 'requests', label: 'Requests Received', count: pendingCount > 0 ? pendingCount : undefined },
    { key: 'work-history', label: 'Work History' },
    { key: 'interests', label: 'Interests Sent' },
  ];

  const loading = activeTab === 'requests' ? requestsLoading : activeTab === 'work-history' ? contractsLoading : interestsLoading;

  return (
    <div>
      {/* Main Card Container */}
      <div className="bg-white dark:bg-purple-950/40 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/40 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <p className="text-sm font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            Househelp • Hiring
          </p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Hiring</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">Manage your hire requests and view their status</p>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-gray-200 dark:border-purple-800/40">
          <nav className="flex gap-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setOffset(0); }}
                className={`relative flex items-center gap-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.key === 'requests' && <MessageCircle className="w-4 h-4" />}
                {tab.key === 'work-history' && <Briefcase className="w-4 h-4" />}
                {tab.key === 'interests' && <HandHeart className="w-4 h-4" />}
                {tab.label}
                {tab.count && tab.count > 0 && (
                  <span className="ml-1 px-2 py-0.5 text-xs font-bold rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Error State */}
        {error && <div className="mx-6 mt-4"><ErrorAlert message={error} /></div>}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Requests Tab Content */}
        {activeTab === 'requests' && !loading && (
          <>
            {!Array.isArray(hireRequests) || hireRequests.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hire requests yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">When households send you hire requests, they'll appear here</p>
                <button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Browse Households
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-purple-800/40">
                {(Array.isArray(hireRequests) ? hireRequests : []).map((request) => (
                  <div key={request.id} className="p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                          {request.household?.avatar_url ? (
                            <img src={request.household.avatar_url} alt={getHouseholdName(request.household)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{getHouseholdInitials(request.household)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getHouseholdName(request.household)}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-gray-500 dark:text-purple-300">Job Type</span><p className="font-medium text-gray-900 dark:text-white capitalize">{request.job_type.replace('-', ' ')}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Salary</span><p className="font-medium text-gray-900 dark:text-white">{formatSalary(request.salary_offered, request.salary_frequency)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Start Date</span><p className="font-medium text-gray-900 dark:text-white">{request.start_date ? formatDate(request.start_date) : 'Not specified'}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Requested</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(request.created_at)}</p></div>
                          </div>
                          {request.special_requirements && (
                            <div className="mt-3"><span className="text-gray-500 dark:text-purple-300 text-sm">Special Requirements:</span><p className="text-sm text-gray-700 dark:text-purple-200">{request.special_requirements}</p></div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:self-end">
                        <button onClick={() => navigate(`/household/public-profile?user_id=${request.household?.user_id}`, { state: { profileId: request.household?.user_id, backTo: backToPath, backLabel: 'Back to Hiring' } })} className="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                          View Profile
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button onClick={() => openAcceptConfirm(request.id)} disabled={actionLoading === request.id} className="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50">
                              <CheckCircle className="w-4 h-4" /> Accept
                            </button>
                            <button onClick={() => { setSelectedRequest(request.id); setShowDeclineModal(true); }} disabled={actionLoading === request.id} className="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50">
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Work History Tab Content */}
        {activeTab === 'work-history' && !loading && (
          <>
            {contracts.length === 0 ? (
              <div className="p-12 text-center">
                <Briefcase className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No work history yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Your completed and ongoing work contracts will appear here</p>
                <button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Find Work
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-purple-800/40">
                {contracts.map((contract) => (
                  <div key={contract.id} className="p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                          {contract.household?.avatar_url ? (
                            <img src={contract.household.avatar_url} alt={getHouseholdName(contract.household)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{getHouseholdInitials(contract.household)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getHouseholdName(contract.household)}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                              {getStatusIcon(contract.status)}
                              {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div><span className="text-gray-500 dark:text-purple-300">Job Type</span><p className="font-medium text-gray-900 dark:text-white capitalize">{contract.job_type.replace('-', ' ')}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Salary</span><p className="font-medium text-gray-900 dark:text-white">{formatSalary(contract.salary, contract.salary_frequency)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Start Date</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(contract.start_date)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">End Date</span><p className="font-medium text-gray-900 dark:text-white">{contract.end_date ? formatDate(contract.end_date) : 'Ongoing'}</p></div>
                          </div>
                          {contract.household?.town && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-purple-300">
                              <Building2 className="w-4 h-4" /> {contract.household.town}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:self-end">
                        <button onClick={() => navigate(`/household/public-profile?user_id=${contract.household?.user_id}`, { state: { profileId: contract.household?.user_id, backTo: backToPath, backLabel: 'Back to Hiring' } })} className="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Interests Tab Content */}
        {activeTab === 'interests' && !loading && (
          <>
            {interests.length === 0 ? (
              <div className="p-12 text-center">
                <HandHeart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No interests sent yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">When you express interest in working for a household, it will appear here</p>
                <button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Browse Households
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-purple-800/40">
                {interests.map((interest) => (
                  <div key={interest.id} className="p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                          {interest.household?.avatar_url ? (
                            <img src={interest.household.avatar_url} alt={getHouseholdName(interest.household)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">{getHouseholdInitials(interest.household)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{getHouseholdName(interest.household)}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interest.status)}`}>
                              {getStatusIcon(interest.status)}
                              {interest.status.charAt(0).toUpperCase() + interest.status.slice(1)}
                            </span>
                            {interest.viewed_at && interest.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                <Eye className="w-3 h-3" /> Viewed
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            {interest.job_type && <div><span className="text-gray-500 dark:text-purple-300">Job Type</span><p className="font-medium text-gray-900 dark:text-white capitalize">{interest.job_type.replace('-', ' ')}</p></div>}
                            <div><span className="text-gray-500 dark:text-purple-300">Salary Expected</span><p className="font-medium text-gray-900 dark:text-white">{formatSalary(interest.salary_expectation, interest.salary_frequency)}</p></div>
                            {interest.available_from && <div><span className="text-gray-500 dark:text-purple-300">Available From</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(interest.available_from)}</p></div>}
                            <div><span className="text-gray-500 dark:text-purple-300">Sent</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(interest.created_at)}</p></div>
                          </div>
                          {interest.comments && (
                            <div className="mt-3"><span className="text-gray-500 dark:text-purple-300 text-sm">Your message:</span><p className="text-sm text-gray-700 dark:text-purple-200">{interest.comments}</p></div>
                          )}
                          {interest.household?.town && (
                            <div className="mt-2 flex items-center gap-1 text-sm text-gray-500 dark:text-purple-300">
                              <Building2 className="w-4 h-4" /> {interest.household.town}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                        <button onClick={() => { setSelectedInterest(interest); setShowInterestModal(true); }} className="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                          View Details
                        </button>
                        {interest.status === 'pending' && (
                          <button onClick={() => openWithdrawConfirm(interest.id)} disabled={actionLoading === interest.id} className="inline-flex items-center gap-2 px-4 py-1 text-sm font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50">
                            <XCircle className="w-4 h-4" /> Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {!loading && (
          (activeTab === 'requests' && requestsTotal > limit) ||
          (activeTab === 'work-history' && contractsTotal > limit) ||
          (activeTab === 'interests' && interestsTotal > limit)
        ) && (
          <div className="p-6 border-t border-gray-200 dark:border-purple-800/40 flex justify-center gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0} className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-purple-900/30 rounded-xl hover:bg-gray-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button onClick={() => setOffset(offset + limit)} disabled={(activeTab === 'requests' && offset + limit >= requestsTotal) || (activeTab === 'work-history' && offset + limit >= contractsTotal) || (activeTab === 'interests' && offset + limit >= interestsTotal)} className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-purple-900/30 rounded-xl hover:bg-gray-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => { setShowDeclineModal(false); setSelectedRequest(null); setDeclineReason(''); }} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Decline Hire Request</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Please provide a reason for declining this hire request.</p>
              <textarea value={declineReason} onChange={(e) => setDeclineReason(e.target.value)} rows={4} placeholder="Enter your reason..." className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all resize-none" />
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setShowDeclineModal(false); setSelectedRequest(null); setDeclineReason(''); }} className="flex-1 px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  Cancel
                </button>
                <button onClick={handleDeclineRequest} disabled={!declineReason.trim() || actionLoading !== null} className="flex-1 px-4 py-1 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                  {actionLoading ? 'Declining...' : 'Decline Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interest Details Modal */}
      {showInterestModal && selectedInterest && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => { setShowInterestModal(false); setSelectedInterest(null); }} />
            <div className="relative bg-white dark:bg-[#1a1a2e] rounded-2xl shadow-xl max-w-lg w-full overflow-hidden">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-gray-700 to-gray-600 dark:from-gray-800 dark:to-gray-700 px-6 py-8">
                <button 
                  onClick={() => { setShowInterestModal(false); setSelectedInterest(null); }}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-white/20 flex-shrink-0 ring-4 ring-white/30">
                    {selectedInterest.household?.avatar_url ? (
                      <img src={selectedInterest.household.avatar_url} alt={getHouseholdName(selectedInterest.household)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {getHouseholdInitials(selectedInterest.household)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{getHouseholdName(selectedInterest.household)}</h3>
                    {selectedInterest.household?.town && (
                      <p className="text-white/80 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" /> {selectedInterest.household.town}
                      </p>
                    )}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedInterest.status)}`}>
                      {getStatusIcon(selectedInterest.status)}
                      {selectedInterest.status.charAt(0).toUpperCase() + selectedInterest.status.slice(1)}
                      {selectedInterest.viewed_at && selectedInterest.status === 'pending' && (
                        <span className="ml-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Viewed</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Interest Details */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-purple-400 uppercase tracking-wider mb-3">Your Interest Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedInterest.job_type && (
                      <div className="bg-gray-50 dark:bg-purple-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-purple-300 mb-1">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-xs font-medium">Job Type</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedInterest.job_type.replace('-', ' ')}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-purple-300 mb-1">
                        <DollarSign className="w-4 h-4" />
                        <span className="text-xs font-medium">Salary Expected</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatSalary(selectedInterest.salary_expectation, selectedInterest.salary_frequency)}</p>
                    </div>
                    {selectedInterest.available_from && (
                      <div className="bg-gray-50 dark:bg-purple-900/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-purple-300 mb-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs font-medium">Available From</span>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedInterest.available_from)}</p>
                      </div>
                    )}
                    <div className="bg-gray-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-gray-500 dark:text-purple-300 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">Sent On</span>
                      </div>
                      <p className="font-semibold text-gray-900 dark:text-white">{formatDate(selectedInterest.created_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedInterest.comments && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-purple-400 uppercase tracking-wider mb-3">Your Message</h4>
                    <div className="bg-gray-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <p className="text-gray-700 dark:text-gray-300">{selectedInterest.comments}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => navigate(`/household/public-profile?user_id=${selectedInterest.household?.user_id}`, { state: { profileId: selectedInterest.household?.user_id, backTo: backToPath, backLabel: 'Back to Hiring' } })}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <User className="w-4 h-4" /> View Household Profile
                  </button>
                  {selectedInterest.status === 'pending' && (
                    <button 
                      onClick={() => openWithdrawConfirm(selectedInterest.id)}
                      disabled={actionLoading === selectedInterest.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-1.5 text-sm font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Accept Hire Request Confirmation */}
      <ConfirmDialog
        isOpen={showAcceptConfirm}
        onClose={() => { setShowAcceptConfirm(false); setPendingActionId(null); }}
        onConfirm={handleAcceptRequest}
        title="Accept Hire Request"
        message="Are you sure you want to accept this hire request? This will create a work contract with the household."
        confirmText="Accept"
        cancelText="Cancel"
        variant="info"
        isLoading={actionLoading !== null}
      />

      {/* Withdraw Interest Confirmation */}
      <ConfirmDialog
        isOpen={showWithdrawConfirm}
        onClose={() => { setShowWithdrawConfirm(false); setPendingActionId(null); }}
        onConfirm={handleWithdrawInterest}
        title="Withdraw Interest"
        message="Are you sure you want to withdraw your interest? The household will no longer see your application."
        confirmText="Withdraw"
        cancelText="Cancel"
        variant="danger"
        isLoading={actionLoading !== null}
      />
    </div>
  );
}
