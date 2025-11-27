import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import NegotiationPanel from '~/components/hiring/NegotiationPanel';
import { Briefcase, Calendar, DollarSign, FileText, CheckCircle, XCircle, Ban } from 'lucide-react';

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
  created_at: string;
  updated_at: string;
  decline_reason?: string;
  househelp?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    photos?: string[];
    salary_expectation?: number;
  };
}

export default function HireRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hireRequest, setHireRequest] = useState<HireRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractNotes, setContractNotes] = useState('');

  useEffect(() => {
    fetchHireRequest();
    fetchCurrentUser();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const response = await apiClient.auth(`${API_ENDPOINTS.auth.me}`, { method: 'GET' });
      if (response.ok) {
        const data = await response.json();
        setCurrentUserId(data.id || data.user_id || '');
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
    }
  };

  const fetchHireRequest = async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.byId(id),
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hire request');
      }

      const data = await response.json();
      setHireRequest(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hire request');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm('Are you sure you want to cancel this hire request?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.byId(id!),
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel hire request');
      }

      alert('Hire request cancelled successfully');
      navigate('/household/hiring');
    } catch (err: any) {
      alert(err.message || 'Failed to cancel hire request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateContract = async () => {
    setActionLoading(true);
    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.contracts.base,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hire_request_id: id,
            notes: contractNotes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create contract');
      }

      const contract = await response.json();
      alert('Contract created successfully!');
      setShowContractModal(false);
      navigate(`/household/contracts/${contract.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create contract');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatSalary = (amount: number, frequency: string) => {
    return `KES ${amount.toLocaleString()} / ${frequency}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FileText className="w-6 h-6 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'declined':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'cancelled':
        return <Ban className="w-6 h-6 text-gray-500" />;
      case 'finalized':
        return <FileText className="w-6 h-6 text-blue-500" />;
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

  const renderWorkSchedule = (schedule: any) => {
    if (!schedule) return null;

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const daySchedule = schedule[day];
          const isActive = daySchedule && (daySchedule.morning || daySchedule.afternoon || daySchedule.evening);
          const times = [];
          if (daySchedule?.morning) times.push('M');
          if (daySchedule?.afternoon) times.push('A');
          if (daySchedule?.evening) times.push('E');

          return (
            <div
              key={day}
              className={`p-3 rounded-lg text-center ${
                isActive
                  ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-500'
                  : 'bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600'
              }`}
            >
              <p className={`text-xs font-semibold mb-1 ${
                isActive ? 'text-green-900 dark:text-green-100' : 'text-gray-600 dark:text-gray-400'
              }`}>
                {day.slice(0, 3).toUpperCase()}
              </p>
              {isActive && (
                <p className="text-xs text-green-700 dark:text-green-300">
                  {times.join(', ')}
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !hireRequest) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 max-w-md w-full">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || 'Hire request not found'}</p>
          <button
            onClick={() => navigate('/household/hiring')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Hiring
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/household/hiring')}
            className="text-purple-600 dark:text-purple-400 hover:underline mb-4"
          >
            ← Back to Hiring History
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Hire Request Details
            </h1>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(hireRequest.status)}`}>
              {getStatusIcon(hireRequest.status)}
              {hireRequest.status.charAt(0).toUpperCase() + hireRequest.status.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Request Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Househelp Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Househelp Information
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400">
                  {hireRequest.househelp?.avatar_url || hireRequest.househelp?.photos?.[0] ? (
                    <img
                      src={hireRequest.househelp.avatar_url || hireRequest.househelp.photos?.[0]}
                      alt={`${hireRequest.househelp.first_name} ${hireRequest.househelp.last_name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                      {hireRequest.househelp?.first_name?.[0]}{hireRequest.househelp?.last_name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {hireRequest.househelp?.first_name} {hireRequest.househelp?.last_name}
                  </h3>
                  <button
                    onClick={() => navigate(`/househelp/public-profile`, {
                      state: { profileId: hireRequest.househelp_id }
                    })}
                    className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    View Full Profile →
                  </button>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Job Details
              </h2>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Job Type</p>
                    <p className="font-medium text-gray-900 dark:text-white capitalize">
                      {hireRequest.job_type.replace('-', ' ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <DollarSign className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Salary Offered</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatSalary(hireRequest.salary_offered, hireRequest.salary_frequency)}
                    </p>
                    {hireRequest.househelp?.salary_expectation && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Expected: KES {hireRequest.househelp.salary_expectation.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {hireRequest.start_date ? formatDate(hireRequest.start_date) : 'Flexible'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Request Date</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatDate(hireRequest.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Schedule */}
            {hireRequest.work_schedule && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Work Schedule
                </h2>
                {renderWorkSchedule(hireRequest.work_schedule)}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  M = Morning, A = Afternoon, E = Evening
                </p>
              </div>
            )}

            {/* Special Requirements */}
            {hireRequest.special_requirements && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Special Requirements
                </h2>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {hireRequest.special_requirements}
                </p>
              </div>
            )}

            {/* Decline Reason */}
            {hireRequest.decline_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-4">
                  Decline Reason
                </h2>
                <p className="text-red-700 dark:text-red-300">
                  {hireRequest.decline_reason}
                </p>
              </div>
            )}

            {/* Negotiation Panel */}
            {(hireRequest.status === 'pending' || hireRequest.status === 'accepted') && currentUserId && (
              <NegotiationPanel
                hireRequestId={hireRequest.id}
                currentUserId={currentUserId}
              />
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h2>

              {hireRequest.status === 'pending' && (
                <button
                  onClick={handleCancelRequest}
                  disabled={actionLoading}
                  className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {actionLoading ? 'Cancelling...' : 'Cancel Request'}
                </button>
              )}

              {hireRequest.status === 'accepted' && (
                <button
                  onClick={() => setShowContractModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors mb-3"
                >
                  Create Contract
                </button>
              )}

              <button
                onClick={() => navigate(`/househelp/public-profile`, {
                  state: { profileId: hireRequest.househelp_id }
                })}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                View Househelp Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowContractModal(false)}
            />

            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Create Employment Contract
              </h3>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                This will finalize the hire request and create an active employment contract.
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contract Notes (Optional)
                </label>
                <textarea
                  value={contractNotes}
                  onChange={(e) => setContractNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any additional notes or terms..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowContractModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateContract}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {actionLoading ? 'Creating...' : 'Create Contract'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
