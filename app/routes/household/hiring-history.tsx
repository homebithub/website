import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { Clock, CheckCircle, XCircle, Ban, FileText, MessageCircle } from 'lucide-react';

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
  decline_reason?: string;
  househelp?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    photos?: string[];
  };
}

type TabType = 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled';

export default function HiringHistory() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

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
      setError(err.message || 'Failed to load hiring history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to cancel this hire request?')) {
      return;
    }

    try {
      const response = await apiClient.auth(
        API_ENDPOINTS.hiring.requests.byId(requestId),
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error('Failed to cancel hire request');
      }

      // Refresh the list
      fetchHireRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel hire request');
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
    { key: 'all', label: 'All Requests' },
    { key: 'pending', label: 'Pending' },
    { key: 'accepted', label: 'Accepted' },
    { key: 'declined', label: 'Declined' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Hiring History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage all your hire requests and view their status
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
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
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No hire requests yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start hiring by browsing househelps and sending hire requests
            </p>
            <button
              onClick={() => navigate('/household/employment')}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
            >
              Find Househelps
            </button>
          </div>
        )}

        {/* Hire Requests List */}
        {!loading && hireRequests.length > 0 && (
          <div className="space-y-4">
            {hireRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Househelp Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                      {request.househelp?.avatar_url || request.househelp?.photos?.[0] ? (
                        <img
                          src={request.househelp.avatar_url || request.househelp.photos?.[0]}
                          alt={`${request.househelp.first_name} ${request.househelp.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                          {request.househelp?.first_name?.[0]}{request.househelp?.last_name?.[0]}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {request.househelp?.first_name} {request.househelp?.last_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Job Type</span>
                          <p className="font-medium text-gray-900 dark:text-white capitalize">
                            {request.job_type.replace('-', ' ')}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Salary</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatSalary(request.salary_offered, request.salary_frequency)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Start Date</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {request.start_date ? formatDate(request.start_date) : 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Requested</span>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>

                      {request.special_requirements && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-500 dark:text-gray-400">Special Requirements:</span>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                            {request.special_requirements}
                          </p>
                        </div>
                      )}

                      {request.decline_reason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">Decline Reason:</span>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {request.decline_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/household/hire-request/${request.id}`)}
                      className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>

                    {request.status === 'pending' && (
                      <button
                        onClick={() => handleCancelRequest(request.id)}
                        className="px-4 py-2 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors whitespace-nowrap"
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
    </div>
  );
}
