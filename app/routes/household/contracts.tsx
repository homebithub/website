import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { FileText, CheckCircle, XCircle, Calendar, DollarSign, Briefcase } from 'lucide-react';

interface HireContract {
  id: string;
  hire_request_id: string;
  household_id: string;
  househelp_id: string;
  contract_start_date?: string;
  contract_end_date?: string;
  actual_salary: number;
  salary_frequency: string;
  job_type: string;
  status: string;
  notes?: string;
  termination_reason?: string;
  created_at: string;
  updated_at: string;
  househelp?: {
    id: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
    photos?: string[];
  };
}

type TabType = 'all' | 'active' | 'completed' | 'terminated';

export default function HouseholdContracts() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [contracts, setContracts] = useState<HireContract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchContracts();
  }, [activeTab, offset]);

  const fetchContracts = async () => {
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
        `${API_ENDPOINTS.hiring.contracts.base}?${params.toString()}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contracts');
      }

      const data = await response.json();
      setContracts(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200';
      case 'terminated':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200';
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'active', label: 'Active' },
    { key: 'completed', label: 'Completed' },
    { key: 'terminated', label: 'Terminated' },
    { key: 'all', label: 'All Contracts' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Employment Contracts
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your active and past employment contracts
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
        {!loading && contracts.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No contracts yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {activeTab === 'active'
                ? 'You don\'t have any active employment contracts'
                : `No ${activeTab} contracts found`
              }
            </p>
            <button
              onClick={() => navigate('/household/hiring')}
              className="px-6 py-1.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors"
            >
              View Hire Requests
            </button>
          </div>
        )}

        {/* Contracts List */}
        {!loading && contracts.length > 0 && (
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  {/* Left: Househelp Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                      {contract.househelp?.avatar_url || contract.househelp?.photos?.[0] ? (
                        <img
                          src={contract.househelp.avatar_url || contract.househelp.photos?.[0]}
                          alt={`${contract.househelp.first_name} ${contract.househelp.last_name}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                          {contract.househelp?.first_name?.[0]}{contract.househelp?.last_name?.[0]}
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {contract.househelp?.first_name} {contract.househelp?.last_name}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status === 'active' && <CheckCircle className="w-4 h-4" />}
                          {contract.status === 'terminated' && <XCircle className="w-4 h-4" />}
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <Briefcase className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Job Type</span>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {contract.job_type.replace('-', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Salary</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatSalary(contract.actual_salary, contract.salary_frequency)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Start Date</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {contract.contract_start_date ? formatDate(contract.contract_start_date) : 'Not set'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Created</span>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatDate(contract.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {contract.notes && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes:</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {contract.notes}
                          </p>
                        </div>
                      )}

                      {contract.termination_reason && (
                        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                          <span className="text-sm font-medium text-red-800 dark:text-red-200">Termination Reason:</span>
                          <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                            {contract.termination_reason}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <button
                      onClick={() => navigate(`/household/contracts/${contract.id}`)}
                      className="px-4 py-1 text-sm bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => navigate(`/househelp/public-profile`, {
                        state: { profileId: contract.househelp_id }
                      })}
                      className="px-4 py-1 text-sm border border-purple-300 dark:border-purple-700 text-purple-600 dark:text-purple-400 rounded-xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors whitespace-nowrap"
                    >
                      View Profile
                    </button>
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
    </div>
  );
}
