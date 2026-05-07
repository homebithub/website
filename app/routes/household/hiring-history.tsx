import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { hireRequestService, hireContractService, employmentContractService, interestService, shortlistService, jobService, profileService as grpcProfileService } from '~/services/grpc/authServices';
import { Clock, CheckCircle, XCircle, Ban, FileText, MessageCircle, HandHeart, Eye, UserCheck, UserX, Briefcase, Heart } from 'lucide-react';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import ConfirmDialog from '~/components/ConfirmDialog';
import JobPostModal from '~/components/modals/JobPostModal';
import { useSSEContextSafe } from '~/contexts/SSEContext';
import { buildIdentifierMap, findByAnyIdentifier, getHousehelpCandidateIds } from '~/utils/hiringIdentifiers';
import { formatOnboardingAmountWithFrequency } from '~/utils/onboardingCompensation';
import { NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';

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
    user_id?: string;
    user?: {
      id?: string;
      first_name?: string;
      last_name?: string;
    };
    avatar_url?: string;
    photos?: string[];
  };
}

interface JobLocation {
  place_type?: string;
  latitude?: number;
  longitude?: number;
  mapbox_id?: string;
  name?: string;
  place?: string;
}

interface JobPosting {
  id: string;
  title?: string;
  description?: string;
  location?: string | JobLocation;
  job_types?: string[];
  start_date?: string;
  max_applicants?: number;
  status?: string;
  created_at?: string;
  salary_range?: { min?: number; max?: number; currency?: string };
}

const formatJobLocation = (location?: string | JobLocation): string => {
  if (!location) return 'Location not specified';
  if (typeof location === 'string') return location;
  return location.name || location.place || 'Location not specified';
};

type TabType = 'applicants' | 'jobs' | 'all' | 'pending' | 'accepted' | 'declined' | 'cancelled';

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

const extractEnvelopeObject = <T = any,>(raw: any): T =>
  (raw?.data?.data || raw?.data || raw || {}) as T;

const extractEnvelopeArray = <T = any,>(raw: any): T[] => {
  const payload: any = extractEnvelopeObject(raw);
  if (Array.isArray(payload)) return payload as T[];
  if (Array.isArray(payload?.data)) return payload.data as T[];
  if (Array.isArray(payload?.items)) return payload.items as T[];
  if (typeof payload === 'object' && payload !== null) {
    const firstArray = Object.values(payload).find(Array.isArray);
    if (firstArray) return firstArray as T[];
  }
  return [];
};

const extractTotal = (raw: any, fallbackLength: number): number => {
  const payload: any = extractEnvelopeObject(raw);
  const total = payload?.total ?? raw?.total;
  return typeof total === 'number' ? total : fallbackLength;
};

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
  const [searchParams, setSearchParams] = useSearchParams();
  const sseContext = useSSEContextSafe();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab');
    const validTabs: TabType[] = ['jobs', 'applicants'];
    return validTabs.includes(tabParam as TabType) ? (tabParam as TabType) : 'jobs';
  });
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [applicants, setApplicants] = useState<Interest[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicantsCount, setApplicantsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<HireRequest | null>(null);
  const [cancelRequest, setCancelRequest] = useState<HireRequest | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [jobActionLoading, setJobActionLoading] = useState<string | null>(null);
  const [jobsSuccess, setJobsSuccess] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [customCancelReason, setCustomCancelReason] = useState('');
  const [cancelMessage, setCancelMessage] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [contractCreating, setContractCreating] = useState<string | null>(null);
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [shortlistError, setShortlistError] = useState<string | null>(null);
  const [shortlistSuccess, setShortlistSuccess] = useState<string | null>(null);
  const [chatLoadingInterestId, setChatLoadingInterestId] = useState<string | null>(null);
  const [shortlistLoadingInterestId, setShortlistLoadingInterestId] = useState<string | null>(null);
  const [shortlistedProfileIds, setShortlistedProfileIds] = useState<Set<string>>(() => new Set());
  // Map all known househelp identifiers to the matching employment contract.
  const [employmentContractMap, setEmploymentContractMap] = useState<Record<string, any>>({});
  const limit = 20;
  const backToPath = `${location.pathname}${location.search || ''}`;

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setOffset(0);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', tab);
    setSearchParams(nextSearchParams, { replace: true });
  };

  const removeHousehelpFromShortlist = async (profileId?: string | null) => {
    if (!profileId) return;
    try {
      await shortlistService.deleteShortlist(profileId);
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err) {
      console.warn('Failed to remove househelp from shortlist:', err);
    }
  };

  const handleJobSaved = () => {
    const message = editingJob ? 'Job posting updated.' : 'Job posting created.';
    fetchJobs();
    if (activeTab !== 'jobs') {
      handleTabChange('jobs');
    }
    setShowJobModal(false);
    setEditingJob(null);
    setJobsSuccess(message);
  };

  const handleToggleJobStatus = async (job: JobPosting) => {
    if (!job?.id) return;
    setJobActionLoading(job.id);
    setError(null);
    setJobsSuccess(null);
    try {
      if (job.status === 'closed') {
        await jobService.reopenJob(job.id, '');
        setJobsSuccess('Job reopened.');
      } else {
        await jobService.closeJob(job.id, '');
        setJobsSuccess('Job closed.');
      }
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to update job status');
    } finally {
      setJobActionLoading(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete?.id) return;
    setJobActionLoading(jobToDelete.id);
    setError(null);
    setJobsSuccess(null);
    try {
      await jobService.deleteJob(jobToDelete.id, '');
      setJobsSuccess('Job deleted.');
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    } finally {
      setJobActionLoading(null);
      setJobToDelete(null);
    }
  };

  // Fetch employment contracts to build lookup map
  useEffect(() => {
    const fetchECMap = async () => {
      try {
        const raw = await employmentContractService.listEmploymentContracts('', undefined, 50, 0);
        const items = extractEnvelopeArray<any>(raw);
        setEmploymentContractMap(buildIdentifierMap(items, getHousehelpCandidateIds));
      } catch (err) {
        // Non-critical
      }
    };
    fetchECMap();
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHouseholdProfileId = async () => {
      if (!currentUserId) return;
      try {
        const profile = await grpcProfileService.getCurrentHouseholdProfile('');
        if (cancelled) return;
        const profileId = profile?.id || profile?.profile_id || profile?.profileId || null;
        setCurrentHouseholdProfileId(profileId);
      } catch (err) {
        console.error('Failed to fetch household profile ID:', err);
      }
    };

    loadHouseholdProfileId();

    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  const refreshShortlistedProfiles = useCallback(async () => {
    try {
      const raw = await shortlistService.listByHousehold('');
      const shortlistItems = extractEnvelopeArray<{ profile_id?: string }>(raw);
      setShortlistedProfileIds(new Set(shortlistItems.map((item) => item.profile_id).filter((id): id is string => Boolean(id))));
    } catch (err) {
      console.error('Failed to fetch shortlist for applicants view:', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadShortlistedProfiles = async () => {
      try {
        await refreshShortlistedProfiles();
      } finally {
        if (cancelled) return;
      }
    };

    loadShortlistedProfiles();

    return () => {
      cancelled = true;
    };
  }, [refreshShortlistedProfiles]);

  useEffect(() => {
    const handleShortlistUpdated = () => {
      refreshShortlistedProfiles();
    };

    window.addEventListener('shortlist-updated', handleShortlistUpdated);
    return () => {
      window.removeEventListener('shortlist-updated', handleShortlistUpdated);
    };
  }, [refreshShortlistedProfiles]);

  useEffect(() => {
    if (!shortlistSuccess) return;
    const timeout = window.setTimeout(() => {
      setShortlistSuccess(null);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [shortlistSuccess]);

  useEffect(() => {
    if (!chatError && !shortlistError) return;
    const timeout = window.setTimeout(() => {
      setChatError(null);
      setShortlistError(null);
    }, 5000);
    return () => window.clearTimeout(timeout);
  }, [chatError, shortlistError]);

  useEffect(() => {
    const missingIds = applicants.reduce<string[]>((acc, interest) => {
      const potentialId = interest.househelp_id || interest.househelp?.id;
      if (typeof potentialId === 'string' && !(potentialId in profilesById)) {
        acc.push(potentialId);
      }
      return acc;
    }, []);

    if (missingIds.length === 0) {
      return;
    }

    let cancelled = false;

    const loadProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const raw = await grpcProfileService.searchMultipleWithUser('', 'househelp', { profile_ids: missingIds });
        if (cancelled) return;
        const profileList = extractEnvelopeArray<any>(raw);
        if (!Array.isArray(profileList) || profileList.length === 0) return;
        setProfilesById((prev) => {
          const next = { ...prev };
          for (const profile of profileList) {
            const profileId = profile?.id || profile?.profile_id;
            if (profileId) {
              next[profileId] = profile;
            }
          }
          return next;
        });
      } catch (err) {
        console.error('Failed to load applicant profiles:', err);
      } finally {
        if (!cancelled) {
          setLoadingProfiles(false);
        }
      }
    };

    loadProfiles();

    return () => {
      cancelled = true;
    };
  }, [applicants, profilesById]);

  const getDaysRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    if (activeTab === 'applicants') {
      fetchApplicants();
    } else if (activeTab === 'jobs') {
      fetchJobs();
    } else {
      fetchHireRequests();
    }
  }, [activeTab, offset]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs: TabType[] = ['jobs', 'applicants'];
    if (tabParam && validTabs.includes(tabParam as TabType) && tabParam !== activeTab) {
      setActiveTab(tabParam as TabType);
      setOffset(0);
    }
  }, [activeTab, searchParams]);

  // Fetch interest count for badge
  useEffect(() => {
    const fetchApplicantCount = async () => {
      try {
        const raw = await interestService.listByHousehold('');
        const items = raw?.data || raw || [];
        setApplicantsCount(Array.isArray(items) ? items.length : 0);
      } catch (err) {
        console.error('Failed to fetch interest count:', err);
      }
    };

    fetchApplicantCount();
  }, []);

  // SSE: auto-refetch applicants when a new application is received
  useEffect(() => {
    if (!sseContext) return;
    const unsub = sseContext.subscribe('auth.household.updated', (event: any) => {
      const action = event?.data?.action;
      if (action === 'interest_received') {
        fetchApplicants();
      }
    });
    return unsub;
  }, [sseContext]);

  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await interestService.listByHousehold('');
      const items = extractEnvelopeArray<Interest>(raw);
      setApplicants(items);
    } catch (err: any) {
      setError(err.message || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const raw = await jobService.getJobsByUserId('');
      const payload = raw?.data || raw || [];
      const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setJobs(items as JobPosting[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load job postings');
    } finally {
      setLoading(false);
    }
  };

  const fetchHireRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const status = activeTab !== 'all' ? activeTab : undefined;
      const raw = await hireRequestService.listHireRequests('', 'household', status);
      const items = extractEnvelopeArray<HireRequest>(raw);
      setHireRequests(items);
      setTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load hiring history');
    } finally {
      setLoading(false);
    }
  };

  const createContract = async (request: HireRequest) => {
    setContractCreating(request.id);
    try {
      const contract = await hireContractService.createFromHireRequest('', { hire_request_id: request.id });
      // Navigate to employment contract page pre-filled with hire request data
      const params = new URLSearchParams({
        househelp_id: request.househelp_id,
        hire_contract_id: contract.id || contract.data?.id || '',
        job_type: request.job_type || '',
        salary: String(request.salary_offered || ''),
        salary_frequency: request.salary_frequency || '',
        backTo: backToPath,
        backLabel: 'Back to Hiring',
      });
      if (request.start_date) params.set('start_date', request.start_date.split('T')[0]);
      navigate(`/household/employment-contract?${params.toString()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create contract');
    } finally {
      setContractCreating(null);
    }
  };

  const navigateToEmploymentContract = (request: HireRequest) => {
    const existingEmploymentContract = findByAnyIdentifier(
      employmentContractMap,
      getHousehelpCandidateIds(request),
    );
    const existingECId = existingEmploymentContract?.id;
    if (existingECId) {
      const params = new URLSearchParams({
        id: existingECId,
        backTo: backToPath,
        backLabel: 'Back to Hiring',
      });
      navigate(`/household/employment-contract?${params.toString()}`);
    } else {
      const params = new URLSearchParams({
        househelp_id: request.househelp_id,
        job_type: request.job_type || '',
        salary: String(request.salary_offered || ''),
        salary_frequency: request.salary_frequency || '',
        backTo: backToPath,
        backLabel: 'Back to Hiring',
      });
      if (request.start_date) params.set('start_date', request.start_date.split('T')[0]);
      navigate(`/household/employment-contract?${params.toString()}`);
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
      await hireRequestService.cancelHireRequest(cancelRequest.id);

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

  const formatSalary = (amount?: number | null, frequency?: string) =>
    formatOnboardingAmountWithFrequency(amount, frequency, 'Not specified');

  const formatJobDate = (value?: string) => {
    if (!value) return 'Flexible';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Flexible';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatJobSalary = (range?: JobPosting['salary_range']) => {
    if (!range) return 'Not specified';
    const min = range.min ? `KES ${range.min.toLocaleString()}` : '';
    const max = range.max ? `KES ${range.max.toLocaleString()}` : '';
    if (min && max) return `${min} - ${max}`;
    return min || max || 'Not specified';
  };

  const tabs: { key: TabType; label: string; count?: number }[] = useMemo(
    () => [
      { key: 'jobs', label: 'Jobs' },
      { key: 'applicants', label: 'Applicants', count: applicantsCount },
    ],
    [applicantsCount],
  );

  const handleViewInterest = async (interest: Interest) => {
    // Mark as viewed if not already
    if (!interest.viewed_at) {
      try {
        await interestService.markViewed(interest.id);
        setApplicantsCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark interest as viewed:', err);
      }
    }
    // Navigate to househelp profile using profileId
    const profileId = interest.househelp_id;
    navigate(`/househelp/public-profile?profileId=${profileId}&from=hiring&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to Hiring')}`, {
      state: { backTo: backToPath, backLabel: 'Back to Hiring' },
    });
  };

  const handleAcceptInterest = async (interest: Interest) => {
    try {
      await interestService.acceptInterest(interest.id);
      fetchApplicants();
      setApplicantsCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('hiring-updated'));
    } catch (err) {
      console.error('Failed to accept interest:', err);
    }
  };

  const handleDeclineInterest = async (interest: Interest) => {
    try {
      await interestService.declineInterest(interest.id);
      fetchApplicants();
      setApplicantsCount((prev) => Math.max(0, prev - 1));
      window.dispatchEvent(new Event('hiring-updated'));
    } catch (err) {
      console.error('Failed to decline interest:', err);
    }
  };

  const handleChatWithApplicant = async (interest: Interest) => {
    const profileId = interest.househelp_id || interest.househelp?.id;
    const profile = profileId ? profilesById[profileId] : undefined;
    const househelpUserId = profile?.user_id || profile?.user?.id || (profile?.user && 'id' in profile.user ? profile.user.id : undefined) || profile?.userId || (typeof interest.househelp?.user === 'object' ? (interest.househelp.user as any)?.id : undefined);
    if (!currentUserId || !profileId || !househelpUserId) {
      setChatError('Missing information to start a chat.');
      return;
    }

    setChatLoadingInterestId(interest.id);
    setChatError(null);
    try {
      const payload: StartConversationPayload = {
        household_user_id: currentUserId,
        househelp_user_id: househelpUserId,
        househelp_profile_id: profileId,
      };

      if (currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const conversationId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(conversationId));
    } catch (err) {
      console.error('Failed to start chat from applicants view:', err);
      setChatError('Could not open conversation. Please try again.');
    } finally {
      setChatLoadingInterestId(null);
    }
  };

  const handleShortlistApplicant = async (interest: Interest) => {
    const profileId = interest.househelp_id || interest.househelp?.id;
    if (!profileId) {
      setShortlistError('Missing househelp profile information.');
      return;
    }

    if (shortlistedProfileIds.has(profileId)) {
      setShortlistSuccess('Already in your shortlist.');
      return;
    }

    setShortlistLoadingInterestId(interest.id);
    setShortlistError(null);
    setShortlistSuccess(null);
    try {
      await shortlistService.createShortlist('', 'household', {
        profile_id: profileId,
        profile_type: 'househelp',
      });
      setShortlistedProfileIds((prev) => {
        const next = new Set(prev);
        next.add(profileId);
        return next;
      });
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
      await refreshShortlistedProfiles();
      setShortlistSuccess('Added to shortlist.');
    } catch (err: any) {
      console.error('Failed to shortlist applicant:', err);
      setShortlistError(err?.message || 'Failed to add to shortlist.');
    } finally {
      setShortlistLoadingInterestId(null);
    }
  };

  return (
    <div className="w-full">
      <div className="rounded-3xl bg-white shadow-xl border border-purple-100 px-4 sm:px-8 py-8 dark:bg-gradient-to-b dark:from-[#1a102b] dark:via-[#0e0a1a] dark:to-[#07050d] dark:border-purple-800/40 dark:shadow-2xl dark:shadow-purple-900/50 transition-colors">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold mb-2 dark:text-purple-300">
              Household • Hiring
            </p>
            <h1 className="text-lg font-extrabold text-gray-900 mb-2 dark:text-white">
              Hiring
            </h1>
            <p className="text-gray-600 dark:text-purple-200">
              Manage all your hire requests and view their status
            </p>
          </div>
          <button
            onClick={() => { setEditingJob(null); setShowJobModal(true); }}
            className="px-4 py-1.5 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Create Job Listing
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-purple-100 mb-6 dark:bg-purple-900/30 dark:shadow-inner dark:shadow-purple-900/40 dark:border-purple-700/50 transition-colors">
          <div className="border-b border-gray-200 dark:border-purple-800/50">
            <nav className="flex space-x-6 px-6 text-gray-600 dark:text-purple-200 overflow-x-auto no-scrollbar" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-xs transition-colors flex items-center gap-2 ${
                    activeTab === tab.key
                      ? 'border-purple-500 text-purple-700 dark:text-white'
                      : 'border-transparent text-gray-400 hover:text-purple-700 dark:hover:text-white hover:border-purple-300'
                  }`}
                >
                  {tab.key === 'applicants' && <HandHeart className="w-4 h-4" />}
                  {tab.key === 'jobs' && <Briefcase className="w-4 h-4" />}
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
        {error && <ErrorAlert message={error} className="mb-6" />}
        {jobsSuccess && <SuccessAlert message={jobsSuccess} className="mb-6" />}
        {chatError && <ErrorAlert message={chatError} className="mb-6" />}
        {shortlistError && <ErrorAlert message={shortlistError} className="mb-6" />}
        {shortlistSuccess && <SuccessAlert message={shortlistSuccess} className="mb-6" />}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        )}

        {/* Empty State for Jobs */}
        {!loading && activeTab === 'jobs' && jobs.length === 0 && (
          <div className="bg-white dark:bg-purple-900 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-700/40 p-8 sm:p-12 text-center transition-colors">
            <Briefcase className="w-16 h-16 text-purple-400 dark:text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-purple-900 dark:text-white mb-2">
              No job postings yet
            </h3>
            <p className="text-gray-600 dark:text-purple-200 mb-6 sm:mb-8 text-xs sm:text-sm">
              Create a job here to start attracting applicants.
            </p>
            <button
              onClick={() => { setEditingJob(null); setShowJobModal(true); }}
              className="inline-flex items-center justify-center px-6 py-1.5 text-sm rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg shadow-purple-500/30 hover:from-purple-700 hover:to-pink-700 hover:shadow-xl transition-all"
            >
              Create Job
            </button>
          </div>
        )}

        {/* Jobs List */}
        {!loading && activeTab === 'jobs' && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow border dark:bg-purple-950/40 dark:shadow-purple-900/40 dark:hover:shadow-2xl dark:border-purple-800/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                      {job.title || 'Untitled role'}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatJobLocation(job.location)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'closed'
                    ? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'}`}>
                    {job.status || 'open'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(job.job_types || []).length > 0 ? (
                    job.job_types?.map((type) => (
                      <span key={type} className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      Flexible role
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                    Start {formatJobDate(job.start_date)}
                  </span>
                  {job.max_applicants ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      Max {job.max_applicants} applicants
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                  Salary: {formatJobSalary(job.salary_range)}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-purple-300 text-purple-700 dark:text-purple-200 dark:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleJobStatus(job)}
                    disabled={jobActionLoading === job.id}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50"
                  >
                    {job.status === 'closed' ? 'Reopen' : 'Close'}
                  </button>
                  <button
                    onClick={() => setJobToDelete(job)}
                    disabled={jobActionLoading === job.id}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 text-red-600 dark:text-red-300 dark:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State for Applicants */}
        {!loading && activeTab === 'applicants' && applicants.length === 0 && (
          <div className="bg-white dark:bg-purple-900 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-700/40 p-8 sm:p-12 text-center transition-colors">
            <HandHeart className="w-16 h-16 text-green-400 dark:text-green-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-purple-900 dark:text-white mb-2">
              No interested househelps yet
            </h3>
            <p className="text-gray-600 dark:text-purple-200 mb-6 sm:mb-8 text-xs sm:text-sm">
              When househelps express interest in working for you, they'll appear here
            </p>
          </div>
        )}

        {/* Applicants List */}
        {!loading && activeTab === 'applicants' && applicants.length > 0 && (
          <div className="space-y-5">
            {applicants.map((interest) => {
              const profileId = interest.househelp_id || interest.househelp?.id;
              const profile = profileId ? profilesById[profileId] : undefined;
              const firstName = profile?.first_name || interest.househelp?.first_name || interest.househelp?.user?.first_name;
              const lastName = profile?.last_name || interest.househelp?.last_name || interest.househelp?.user?.last_name;
              const displayName = `${firstName || ''} ${lastName || ''}`.trim() || getHousehelpName(interest.househelp as any);
              const avatarUrl = profile?.avatar_url || profile?.profile_picture || (Array.isArray(profile?.photos) ? profile?.photos?.[0] : undefined) || interest.househelp?.avatar_url || interest.househelp?.photos?.[0];
              const locationCandidate = [profile?.county_of_residence, profile?.location, (profile as any)?.neighborhood, (profile as any)?.region, (profile as any)?.city].find((value) => typeof value === 'string' && value.length > 0);
              const experienceValue = profile?.years_of_experience ?? profile?.experience;
              const experienceYears = typeof experienceValue === 'number' && experienceValue > 0 ? experienceValue : undefined;
              const primaryRole = interest.job_type || profile?.househelp_type || (profile as any)?.primary_role;
              const rawSkills = Array.isArray(profile?.skills)
                ? profile.skills
                : Array.isArray((profile as any)?.top_skills)
                  ? (profile as any).top_skills
                  : [];
              const normalizedSkills = rawSkills.filter((skill: unknown): skill is string => typeof skill === 'string');
              const displayedSkills = normalizedSkills.slice(0, 3);
              const remainingSkills = normalizedSkills.length > 3 ? normalizedSkills.length - 3 : 0;
              const availabilityDate = interest.available_from
                ? formatDate(interest.available_from)
                : profile?.availability_date
                  ? formatDate(profile.availability_date)
                  : 'Flexible';
              const isNew = !interest.viewed_at;
              const isShortlisted = Boolean(profileId && shortlistedProfileIds.has(profileId));
              const chatLoading = chatLoadingInterestId === interest.id;
              const shortlistLoading = shortlistLoadingInterestId === interest.id;
              const canActOnInterest = interest.status === 'pending' || interest.status === 'viewed';
              const statusLabel = interest.status
                ? interest.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
                : 'Pending';
              const ratingValue = typeof profile?.rating === 'number' ? profile.rating : undefined;
              const reviewCount = typeof profile?.review_count === 'number' ? profile.review_count : undefined;
              const profileBio = profile?.bio || (profile as any)?.about || (profile as any)?.summary || (profile as any)?.about_me;

              return (
                <div
                  key={interest.id}
                  className={`relative overflow-hidden rounded-2xl border bg-white p-5 sm:p-7 transition-shadow hover:shadow-xl dark:bg-purple-950/40 ${
                    isNew
                      ? 'border-green-300 dark:border-green-600/40 ring-2 ring-green-100 dark:ring-green-900/30'
                      : 'border-purple-100 dark:border-purple-800/40'
                  }`}
                >
                  <div className="absolute top-4 right-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      onClick={() => handleChatWithApplicant(interest)}
                      disabled={chatLoading}
                      className="inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition-colors hover:bg-purple-100 disabled:opacity-60 dark:border-purple-700/50 dark:bg-purple-900/40 dark:text-purple-100 dark:hover:bg-purple-800/60"
                    >
                      {chatLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
                      ) : (
                        <MessageCircle className="h-4 w-4" />
                      )}
                      <span>Chat</span>
                    </button>
                    <button
                      onClick={() => handleShortlistApplicant(interest)}
                      disabled={shortlistLoading || isShortlisted}
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                        isShortlisted
                          ? 'border-green-500 bg-green-500/90 text-white dark:bg-green-500/70'
                          : 'border-purple-300 bg-white text-purple-700 hover:bg-purple-50 disabled:hover:bg-white dark:border-purple-700/40 dark:bg-purple-900/40 dark:text-purple-100 dark:hover:bg-purple-800/60'
                      } disabled:opacity-60`}
                    >
                      {shortlistLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} />
                      )}
                      <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                    </button>
                  </div>

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
                    <div className="flex flex-1 items-start gap-4">
                      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold">
                            {getHousehelpInitials(interest.househelp as any)}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white">{displayName}</h3>
                          {isNew && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-200">
                              <HandHeart className="h-3 w-3" />
                              New
                            </span>
                          )}
                          {interest.status && interest.status !== 'pending' && (
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                interest.status === 'accepted'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                                  : interest.status === 'declined'
                                    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-200'
                                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-200'
                              }`}
                            >
                              {statusLabel}
                            </span>
                          )}
                          {isShortlisted && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-200">
                              <Heart className="h-3 w-3 fill-current" />
                              In shortlist
                            </span>
                          )}
                        </div>

                        {locationCandidate && (
                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">📍 {locationCandidate}</p>
                        )}

                        <div className="mt-4 grid grid-cols-1 gap-4 text-xs text-gray-700 dark:text-purple-100 sm:grid-cols-2 xl:grid-cols-4">
                          {primaryRole && (
                            <div>
                              <span className="text-gray-500 dark:text-purple-300">Preferred Role</span>
                              <p className="font-medium text-gray-900 dark:text-white capitalize">{primaryRole.replace(/[-_]/g, ' ')}</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-500 dark:text-purple-300">Salary Expectation</span>
                            <p className="font-medium text-gray-900 dark:text-white">{formatSalary(interest.salary_expectation, interest.salary_frequency)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-purple-300">Available From</span>
                            <p className="font-medium text-gray-900 dark:text-white">{availabilityDate}</p>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-purple-300">Applied On</span>
                            <p className="font-medium text-gray-900 dark:text-white">{formatDate(interest.created_at)}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                          {typeof experienceYears === 'number' && (
                            <span className="rounded-full bg-purple-100 px-2.5 py-1 text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">{experienceYears} yrs experience</span>
                          )}
                          {typeof profile?.can_work_with_kids === 'boolean' && (
                            <span className="rounded-full bg-blue-100 px-2.5 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
                              {profile.can_work_with_kids ? 'Good with kids' : 'Prefers no kids'}
                            </span>
                          )}
                          {typeof profile?.can_work_with_pets === 'boolean' && (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                              {profile.can_work_with_pets ? 'Pet friendly' : 'No pets'}
                            </span>
                          )}
                          {ratingValue !== undefined && (
                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                              ★ {ratingValue.toFixed(1)}{reviewCount ? ` (${reviewCount})` : ''}
                            </span>
                          )}
                        </div>

                        {displayedSkills.length > 0 && (
                          <p className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                            🧹 {displayedSkills.join(', ')}{remainingSkills > 0 ? ` +${remainingSkills} more` : ''}
                          </p>
                        )}

                        {interest.comments && (
                          <div className="mt-3 rounded-xl bg-gray-50 p-3 text-xs text-gray-700 dark:bg-purple-900/20 dark:text-purple-100">
                            <span className="block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-purple-300">Message</span>
                            <p className="mt-1">{interest.comments}</p>
                          </div>
                        )}

                        {profileBio && (
                          <p className="mt-3 line-clamp-3 text-xs text-gray-600 dark:text-gray-300">{profileBio}</p>
                        )}

                        {loadingProfiles && !profile && (
                          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">Loading profile details…</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      {canActOnInterest ? (
                        <>
                          <button
                            onClick={() => handleAcceptInterest(interest)}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                          >
                            <UserCheck className="h-4 w-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleDeclineInterest(interest)}
                            className="inline-flex items-center gap-2 rounded-xl bg-red-100 px-4 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-200 dark:bg-red-900/40 dark:text-red-200 dark:hover:bg-red-800/60"
                          >
                            <UserX className="h-4 w-4" />
                            Decline
                          </button>
                        </>
                      ) : (
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-300">Status: {statusLabel}</p>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewInterest(interest)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 px-5 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors hover:from-purple-700 hover:via-pink-700 hover:to-rose-500"
                    >
                      <Eye className="h-4 w-4" />
                      View More
                    </button>
                  </div>
                </div>
              );
            })}
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
          <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white leading-tight">
            {getHousehelpName(selectedRequest.househelp)}
          </h3>
          <div className="text-xs sm:text-xs text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center sm:gap-2">
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
          <p className="text-xs sm:text-xs uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Salary
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white break-words">
            {formatSalary(selectedRequest.salary_offered, selectedRequest.salary_frequency)}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-xs uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Start Date
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            {selectedRequest.start_date
              ? formatDate(selectedRequest.start_date)
              : "Not specified"}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-xs uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Requested On
          </p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
            {formatDate(selectedRequest.created_at)}
          </p>
        </div>

        <div className="rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 p-3 sm:p-4 border border-purple-100 dark:border-purple-500/30">
          <p className="text-xs sm:text-xs uppercase tracking-wide text-purple-400 dark:text-purple-200 mb-1">
            Status
          </p>
          <p className="text-sm sm:text-base font-semibold capitalize text-gray-900 dark:text-white">
            {selectedRequest.status}
          </p>
        </div>
      </div>

      <div className="mb-5 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-500/30">
        <p className="text-xs uppercase tracking-wide text-purple-500 dark:text-purple-300 mb-1">
          Job Type
        </p>
        <p className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white capitalize">
          {selectedRequest.job_type.replace("-", " ")}
        </p>
      </div>

      {selectedRequest.special_requirements && (
        <div className="mb-5 sm:mb-6">
          <h4 className="text-xs sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            Special Requirements
          </h4>
          <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700/80">
            {selectedRequest.special_requirements}
          </p>
        </div>
      )}

      {(selectedRequest.decline_reason || selectedRequest.cancel_reason) && (
        <div className="mb-5 sm:mb-6">
          <h4 className="text-xs sm:text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide mb-2">
            {selectedRequest.status === "declined"
              ? "Decline Reason"
              : "Cancellation Reason"}
          </h4>
          <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-100 bg-red-50 dark:bg-red-900/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-red-100 dark:border-red-500/30">
            {selectedRequest.decline_reason || selectedRequest.cancel_reason}
          </p>

          {selectedRequest.cancellation_message && (
            <div className="mt-3">
              <span className="text-xs sm:text-xs font-medium text-gray-600 dark:text-gray-300">
                Message sent to househelp:
              </span>
              <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-100 dark:border-gray-700/60 mt-1">
                {selectedRequest.cancellation_message}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
        {selectedRequest.status === 'finalized' && (
          <button
            onClick={() => {
              navigateToEmploymentContract(selectedRequest);
              setSelectedRequest(null);
            }}
            className="
              flex-1 inline-flex items-center justify-center gap-2
              px-5 sm:px-6 py-1 sm:py-1.5
              text-xs sm:text-sm
              rounded-xl sm:rounded-2xl
              bg-gradient-to-r from-blue-600 to-purple-600
              text-white font-semibold
              shadow-lg shadow-blue-500/30
              hover:from-blue-700 hover:to-purple-700
              transition-all
              focus:outline-none focus-visible:ring-2
              focus-visible:ring-offset-2 focus-visible:ring-blue-500
            "
          >
            <FileText className="w-4 h-4" />
            {findByAnyIdentifier(employmentContractMap, getHousehelpCandidateIds(selectedRequest)) ? 'View Employment Contract' : 'Create Employment Contract'}
          </button>
        )}

        {selectedRequest.status === 'accepted' && (
          <button
            onClick={() => {
              createContract(selectedRequest);
              setSelectedRequest(null);
            }}
            disabled={contractCreating === selectedRequest.id}
            className="
              flex-1 inline-flex items-center justify-center gap-2
              px-5 sm:px-6 py-1 sm:py-1.5
              text-xs sm:text-sm
              rounded-xl sm:rounded-2xl
              bg-gradient-to-r from-green-600 to-emerald-600
              text-white font-semibold
              shadow-lg shadow-green-500/30
              hover:from-green-700 hover:to-emerald-700
              transition-all
              focus:outline-none focus-visible:ring-2
              focus-visible:ring-offset-2 focus-visible:ring-green-500
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            <FileText className="w-4 h-4" />
            {contractCreating === selectedRequest.id ? 'Creating...' : 'Create Contract'}
          </button>
        )}

        <button
          onClick={() => {
            const profileId =
              selectedRequest?.househelp?.id || selectedRequest?.househelp_id;
            if (profileId) {
              navigate(`/househelp/public-profile?profileId=${encodeURIComponent(profileId)}&from=hiring&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to Hiring')}`, {
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
            px-5 sm:px-6 py-1 sm:py-1.5
            text-xs sm:text-sm
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
            px-5 sm:px-6 py-1 sm:py-1.5
            text-xs sm:text-sm
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
          <h3 className="text-base sm:text-xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {getHousehelpName(cancelRequest.househelp)}
          </h3>
          <p className="text-xs sm:text-xs text-gray-500 dark:text-gray-400">
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
            <span className="text-xs sm:text-xs text-gray-800 dark:text-gray-100">
              {reason.label}
            </span>
          </label>
        ))}
      </div>

      {cancelReason === "other" && (
        <div className="mb-5 sm:mb-6">
          <label className="block text-xs sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Provide your reason
          </label>
          <input
            type="text"
            value={customCancelReason}
            onChange={(e) => setCustomCancelReason(e.target.value)}
            className="
              w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs
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
        <label className="block text-xs sm:text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Additional message to the househelp (optional)
        </label>
        <textarea
          rows={4}
          value={cancelMessage}
          onChange={(e) => setCancelMessage(e.target.value)}
          placeholder="Let them know anything specific about the cancellation..."
          className="
            w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs
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

      {cancelError && <ErrorAlert message={cancelError} className="mb-4" />}

      <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
        <button
          onClick={submitCancelRequest}
          disabled={cancelSubmitting}
          className="
            flex-1 inline-flex items-center justify-center
            px-5 sm:px-6 py-1 sm:py-1.5
            text-xs sm:text-sm
            rounded-xl
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
            px-5 sm:px-6 py-1 sm:py-1.5
            text-xs sm:text-sm
            rounded-xl
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
<JobPostModal
  isOpen={showJobModal}
  onClose={() => { setShowJobModal(false); setEditingJob(null); }}
  job={editingJob}
  onSaved={handleJobSaved}
/>
<ConfirmDialog
  isOpen={!!jobToDelete}
  title="Delete Job Posting"
  message="Delete this job posting? This cannot be undone."
  confirmText={jobActionLoading === jobToDelete?.id ? 'Deleting...' : 'Delete'}
  cancelText="Cancel"
  onConfirm={handleDeleteJob}
  onCancel={() => setJobToDelete(null)}
  variant="danger"
/>
</div>
  );
}
