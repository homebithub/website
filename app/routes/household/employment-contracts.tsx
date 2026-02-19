import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { API_ENDPOINTS } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import {
  FileText, CheckCircle, Clock, Send, Plus, ChevronRight, AlertCircle
} from 'lucide-react';
import { ErrorAlert } from '~/components/ui/ErrorAlert';

interface EmploymentContract {
  id: string;
  household_id: string;
  househelp_id: string;
  status: string;
  job_title: string;
  salary: number;
  salary_frequency: string;
  start_date?: string;
  household_signed_at?: string;
  househelp_signed_at?: string;
  household_signer_name: string;
  househelp_signer_name: string;
  created_at: string;
  househelp?: {
    id: string;
    first_name?: string;
    last_name?: string;
    photos?: string[];
  };
}

type TabType = 'all' | 'draft' | 'pending_househelp' | 'signed_by_both';

export default function EmploymentContractsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [contracts, setContracts] = useState<EmploymentContract[]>([]);
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
      if (!token) { navigate('/login'); return; }

      const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
      if (activeTab !== 'all') params.append('status', activeTab);

      const response = await apiClient.auth(
        `${API_ENDPOINTS.hiring.employmentContracts.base}?${params.toString()}`,
        { method: 'GET' }
      );
      if (!response.ok) throw new Error('Failed to fetch employment contracts');
      const data = await response.json();
      setContracts(data.data?.data || data.data || []);
      setTotal(data.data?.total || data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  const getStatusBadge = (contract: EmploymentContract) => {
    const s = contract.status;
    if (s === 'signed_by_both') return { label: 'Fully Signed', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200', icon: CheckCircle };
    if (s === 'pending_househelp') return { label: 'Awaiting Househelp', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200', icon: Send };
    if (s === 'draft' && contract.household_signed_at) return { label: 'Signed - Ready to Forward', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200', icon: AlertCircle };
    if (s === 'draft') return { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-200', icon: FileText };
    return { label: s, color: 'bg-gray-100 text-gray-800', icon: FileText };
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'draft', label: 'Drafts' },
    { key: 'pending_househelp', label: 'Pending' },
    { key: 'signed_by_both', label: 'Signed' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Employment Contracts
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Formal employment contracts with your househelps
            </p>
          </div>
          <button
            onClick={() => navigate('/household/employment-contract')}
            className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setOffset(0); }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {error && <ErrorAlert message={error} className="mb-6" />}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {!loading && contracts.length === 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employment contracts yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create a formal employment contract to get started
            </p>
            <button
              onClick={() => navigate('/household/employment-contract')}
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors"
            >
              Create Contract
            </button>
          </div>
        )}

        {!loading && contracts.length > 0 && (
          <div className="space-y-3">
            {contracts.map((contract) => {
              const badge = getStatusBadge(contract);
              const Icon = badge.icon;
              return (
                <button
                  key={contract.id}
                  onClick={() => navigate(`/household/employment-contract?id=${contract.id}`)}
                  className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow text-left flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {contract.househelp?.first_name?.[0] || '?'}{contract.househelp?.last_name?.[0] || ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                        {contract.job_title}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
                        <Icon className="w-3 h-3" />
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contract.househelp?.first_name} {contract.househelp?.last_name} &bull; KES {contract.salary?.toLocaleString()} / {contract.salary_frequency}
                      {contract.start_date && ` &bull; From ${formatDate(contract.start_date)}`}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Created {formatDate(contract.created_at)}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {!loading && total > limit && (
          <div className="mt-8 flex items-center justify-between">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0}
                className="px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300">
                Previous
              </button>
              <button onClick={() => setOffset(offset + limit)} disabled={offset + limit >= total}
                className="px-4 py-1 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 text-gray-700 dark:text-gray-300">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
