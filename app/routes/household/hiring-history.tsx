import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { ListingDetails } from '~/components/listing/ListingDetails';
import { formatListingPlace } from '~/utils/place';
import { hireRequestService, hireContractService, employmentContractService, shortlistService, jobService, listingApplicationService, employmentService, profileService as grpcProfileService } from '~/services/grpc/authServices';
import { Clock, CheckCircle, XCircle, Ban, FileText, MessageCircle, HandHeart, Eye, UserCheck, UserX, Briefcase, Heart, Star } from 'lucide-react';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import ConfirmDialog from '~/components/ConfirmDialog';
import JobPostModal from '~/components/modals/JobPostModal';
import { useSSEContextSafe } from '~/contexts/SSEContext';
import { buildIdentifierMap, findByAnyIdentifier, getHousehelpCandidateIds } from '~/utils/hiringIdentifiers';
import { formatOnboardingAmountWithFrequency } from '~/utils/onboardingCompensation';
import { NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import { ListPageSkeleton } from "~/components/ShimmerLoader";

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
  /** Resolved from the listing's ward by the auth service, alongside location. */
  ward?: string;
  subcounty?: string;
  county?: string;
  job_types?: string[];
  start_date?: string;
  max_applicants?: number;
  status?: string;
  created_at?: string;
  /** When the listing lapses unless the household keeps it open. */
  expires_at?: string;
  salary_range?: { min?: number; max?: number; currency?: string };
  listing_feature_groups?: Array<{
    feature_id?: number | string;
    feature_name?: string;
    name?: string;
    properties?: string[];
  }>;
  listing_features?: Array<Record<string, any>>;
}

// Tabs are application statuses, because that is what the hiring process
// actually is. "awaiting" is the bucket that needs the household to act, kept
// separate so it cannot get lost among candidates they have already dealt with.
type TabType = 'jobs' | 'applicants' | 'shortlisted' | 'awaiting' | 'hired' | 'closed';

// Which application statuses belong under each tab.
//
// From the household's side: someone applying is an applicant; someone they saved
// is shortlisted; a provider accepting hands the decision back to them; approved
// means hired; declined is closed.
/**
 * Presents an application in the shape this page already renders.
 *
 * The list markup and the profile resolver were both written against the older
 * interest record, and they key off `househelp_id`. Adapting here rather than
 * rewriting several hundred lines of JSX keeps the change reviewable, and means
 * the switch to applications is one function rather than a rewrite.
 */
function toApplicantRow(application: Record<string, any>): Interest {
  return {
    id: String(application.id ?? ''),
    // The applicant's user_profile id, which is what the profile lookup needs.
    househelp_id: String(application.applicant_profile_id ?? application.applicantProfileId ?? ''),
    household_id: '',
    salary_expectation: Number(application.salary_expectation ?? 0),
    salary_frequency: String(application.salary_frequency ?? 'monthly'),
    job_type: application.job_type ? String(application.job_type) : undefined,
    // The pitch the applicant attached, now stored on the application itself.
    comments: application.message ? String(application.message) : undefined,
    status: String(application.status ?? 'initiated'),
    created_at: String(application.created_at ?? application.createdAt ?? ''),
    listing_id: application.listing_id ?? application.listingId,
  } as Interest;
}

// One empty state per tab. A single message would be wrong on five of six tabs —
// "no interested househelps" tells someone looking at Hired nothing at all — and
// an empty tab is the moment a person most needs to know what would fill it.
/** Whole days until a moment, floored, never negative. */
function daysUntil(value: string): number {
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.floor((target - Date.now()) / (1000 * 60 * 60 * 24)));
}

/**
 * Says when a job lapses, in the words a person would use.
 *
 * Phrased as a closure rather than an expiry date, because that is the thing the
 * household needs to act on — and it is what makes the "Keep open" button beside
 * it mean something.
 */
function describeExpiry(value: string): string {
  const target = new Date(value).getTime();
  if (Number.isNaN(target)) return '';
  if (target <= Date.now()) return 'Closing now';

  const days = daysUntil(value);
  if (days === 0) return 'Closes today';
  if (days === 1) return 'Closes tomorrow';
  return `Closes in ${days} days`;
}

const EMPTY_TAB_COPY: Record<Exclude<TabType, 'jobs'>, { title: string; body: string }> = {
  applicants: {
    title: 'No applicants yet',
    body: 'When someone applies to one of your jobs, they will appear here with their message.',
  },
  shortlisted: {
    title: 'Nobody shortlisted yet',
    // The visibility claim is true again. Shortlisting now answers the
    // application rather than writing a private bookmark, which records an
    // application event with the household as the actor — which is exactly what
    // the household_advanced check in auth's relationshipTo looks for.
    body: 'Shortlist an applicant to set them aside while you decide. They will be able to see your household once you do.',
  },
  awaiting: {
    title: 'Nothing waiting on you',
    body: 'When an applicant accepts, they will appear here for your final approval.',
  },
  hired: {
    title: 'Nobody hired yet',
    body: 'Once you approve an applicant, they will show here and you will be able to review them after the work.',
  },
  closed: {
    title: 'Nothing closed',
    body: 'Applications that were declined or withdrawn end up here.',
  },
};

const TAB_STATUSES: Record<Exclude<TabType, 'jobs'>, string[]> = {
  applicants:  ['initiated'],
  shortlisted: ['shortlisted'],
  awaiting:    ['accepted'],
  hired:       ['approved'],
  closed:      ['declined'],
};

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
    const validTabs: TabType[] = ['jobs', 'applicants', 'shortlisted', 'awaiting', 'hired', 'closed'];
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
  const [rejecting, setRejecting] = useState<Interest | null>(null);
  const [terminating, setTerminating] = useState<Interest | null>(null);
  // Househelp user ids whose engagement with this household has ended.
  const [endedEngagements, setEndedEngagements] = useState<Set<string>>(() => new Set());
  const [terminateReason, setTerminateReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
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

  // Ids arrive as strings from the shortlist service and are read off records
  // that have carried them as numbers, so both sides are keyed the same way
  // before being compared.
  const refreshEngagements = useCallback(async () => {
    const userId = getStoredUserId();
    if (!userId) return;
    try {
      const raw = await employmentService.listByHousehold(userId, 100, 0);
      const rows = raw?.data?.data ?? raw?.data ?? raw ?? [];
      const ended = new Set<string>();
      for (const row of Array.isArray(rows) ? rows : []) {
        const status = String(row?.status ?? '').toLowerCase();
        const househelp = row?.househelp_user_id;
        if (househelp && ['terminated', 'completed', 'ended'].includes(status)) {
          ended.add(String(househelp));
        }
      }
      setEndedEngagements(ended);
    } catch {
      // Not fatal. Without it the tabs fall back to application status alone,
      // which is where they were before: a hire that has ended still reads as
      // current, and nothing else breaks.
    }
  }, []);

  useEffect(() => {
    void refreshEngagements();
  }, [refreshEngagements]);

  const isShortlistedProfile = useCallback(
    (profileId?: string | null) =>
      Boolean(profileId) && shortlistedProfileIds.has(String(profileId)),
    [shortlistedProfileIds],
  );

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

  // Keeps a job open for another three weeks. Listings lapse by default, so this
  // is how a household says it is still hiring — the action the renewal reminder
  // asks for.
  const handleRenewJob = async (job: JobPosting) => {
    if (!job?.id) return;
    setJobActionLoading(job.id);
    setError(null);
    setJobsSuccess(null);
    try {
      await jobService.renewListing(job.id);
      setJobsSuccess('Job kept open for another three weeks.');
      await fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Could not keep this job open. Please try again.');
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
      setShortlistedProfileIds(new Set(shortlistItems.map((item) => (item.profile_id ? String(item.profile_id) : '')).filter(Boolean)));
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
      // Every remaining tab is an application status served from the same fetch.
      fetchApplicants();
    }
  }, [activeTab, offset]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs: TabType[] = ['jobs', 'applicants', 'shortlisted', 'awaiting', 'hired', 'closed'];
    if (tabParam && validTabs.includes(tabParam as TabType) && tabParam !== activeTab) {
      setActiveTab(tabParam as TabType);
      setOffset(0);
    }
  }, [activeTab, searchParams]);


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

  // Every application across this household's listings, in one request.
  //
  // Applications rather than interests: interests hold one row per household and
  // provider pair, so a candidate applying to a second job was rejected by that
  // unique constraint and never appeared here at all. Applications are per job,
  // and they carry the status these tabs are built from.
  //
  // Fetched unfiltered and grouped in the browser, so every tab count is accurate
  // from one round trip and switching tabs is instant. A household's own
  // applications are a bounded set, so this stays small.
  const fetchApplicants = async () => {
    setLoading(true);
    setError(null);
    try {
      const ownerProfileId = getStoredUserProfileId();
      if (!ownerProfileId) {
        setApplicants([]);
        return;
      }
      const raw = await listingApplicationService.listApplications({ ownerProfileId, limit: 200 });
      const rows = extractEnvelopeArray<any>(raw);
      setApplicants(rows.map(toApplicantRow));
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
      const raw = await jobService.listJobs(limit, offset, getStoredUserProfileId());
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
      // No status filter: the tab names are application statuses now, and hire
      // requests are a separate legacy concept that does not share them.
      const raw = await hireRequestService.listHireRequests('', 'household');
      const items = extractEnvelopeArray<HireRequest>(raw);
      setHireRequests(items);
      setTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load hiring history');
    } finally {
      setLoading(false);
    }
  };

  // Drawing up the contract once somebody has accepted.
  //
  // The helper below builds one from a hire request, a record the newer flow no
  // longer creates. An accepted application is the same agreement in the tables
  // that are actually written now, so it gets its own way through.
  const createContractFromApplication = async (interest: Interest) => {
    setContractCreating(interest.id);
    setError(null);
    try {
      const contract = await hireContractService.createFromHireRequest('', {
        application_id: interest.id,
      });
      const contractId = contract?.id || contract?.data?.id || '';
      const params = new URLSearchParams({
        backTo: backToPath,
        backLabel: 'Back to Hiring',
      });
      if (contractId) params.set('hire_contract_id', String(contractId));
      navigate(`/household/employment-contract?${params.toString()}`);
    } catch (err: any) {
      setError(err?.message || 'We could not draw up a contract. Please try again.');
    } finally {
      setContractCreating(null);
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

  // One grouping drives both the counts and the list, so a tab can never show a
  // number that disagrees with what it contains.
  const applicantsByTab = useMemo(() => {
    const groups: Record<string, Interest[]> = {
      applicants: [], shortlisted: [], awaiting: [], hired: [], closed: [],
    };
    for (const row of applicants) {
      // A hire that has ended belongs with the finished work, not with the
      // current work, whatever the application still says.
      //
      // "approved" records that the hire happened, not that it is still
      // happening — that lives on the engagement. Read from the application
      // alone, a finished job sits under Hired for good.
      const househelpUserID = row.househelp?.user_id;
      if (
        row.status === 'approved' &&
        househelpUserID &&
        endedEngagements.has(String(househelpUserID))
      ) {
        groups.closed.push(row);
        continue;
      }

      for (const [tab, statuses] of Object.entries(TAB_STATUSES)) {
        if (statuses.includes(row.status)) {
          groups[tab].push(row);
          break;
        }
      }
    }
    return groups;
  }, [applicants, endedEngagements]);

  // The nav badge counts what needs the household's attention: new applicants
  // plus anyone who has accepted and is waiting on their approval.
  //
  // Derived from the same grouping the tabs use rather than fetched separately,
  // so the badge and the tabs can never disagree — a badge showing three when the
  // tab shows none is the kind of thing that trains people to ignore badges.
  useEffect(() => {
    setApplicantsCount(applicantsByTab.applicants.length + applicantsByTab.awaiting.length);
  }, [applicantsByTab]);

  // What the active tab shows. 'jobs' renders its own list, so anything else
  // falls back to an empty group rather than the whole set.
  const visibleApplicants = useMemo(
    () => (activeTab === 'jobs' ? [] : applicantsByTab[activeTab] ?? []),
    [activeTab, applicantsByTab],
  );

  const tabs: { key: TabType; label: string; count?: number }[] = useMemo(
    () => [
      { key: 'jobs', label: 'Jobs' },
      // Counts only where a number tells the household something. "Applicants"
      // and "Needs your reply" are queues to work through; hired and closed are
      // history, and a badge on history reads as something to action.
      { key: 'applicants', label: 'Applicants', count: applicantsByTab.applicants.length },
      { key: 'shortlisted', label: 'Shortlisted', count: applicantsByTab.shortlisted.length },
      { key: 'awaiting', label: 'Needs your reply', count: applicantsByTab.awaiting.length },
      { key: 'hired', label: 'Hired' },
      { key: 'closed', label: 'Closed' },
    ],
    [applicantsByTab],
  );

  const handleViewInterest = async (interest: Interest) => {
    // No "mark as viewed": applications have no such flag, and the tabs already
    // say what needs attention by status. Nothing is lost — a read receipt was
    // never shown to the applicant.
    // Navigate to househelp profile using profileId
    const profileId = interest.househelp_id;
    navigate(`/househelp/public-profile?profileId=${profileId}&from=hiring&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to Hiring')}`, {
      state: { backTo: backToPath, backLabel: 'Back to Hiring' },
    });
  };

  // Advancing an applicant. Which transition depends on where they are: a
  // shortlisted candidate is promoted into a live application, and one who has
  // already accepted is given final approval.
  //
  // Both record the household as the actor, which is what lets the applicant see
  // the household's profile from that point — the signal that the interest is
  // real rather than someone merely having applied.
  const handleAcceptInterest = async (interest: Interest) => {
    const actorProfileId = getStoredUserProfileId();
    if (!actorProfileId) {
      setError('We could not identify your household profile. Please sign in again.');
      return;
    }
    try {
      if (interest.status === 'shortlisted') {
        await listingApplicationService.promoteApplication(interest.id, actorProfileId);
      } else {
        await listingApplicationService.approveApplication(interest.id, actorProfileId);
      }
      await fetchApplicants();
      window.dispatchEvent(new Event('hiring-updated'));
    } catch (err: any) {
      console.error('Failed to advance application:', err);
      setError(err?.message || 'We could not update this application. Please try again.');
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

  // Shortlisting and rejecting are the two answers a household can give an
  // application, and both go through the same call.
  //
  // Shortlist used to write a personal bookmark into the saved list — the same
  // store the househelp's saved jobs live in. It reported "Added to shortlist"
  // truthfully and filed the applicant under the navbar's Saved page, which is
  // not where the household went looking, while the application itself stayed
  // at "initiated" and the Shortlisted tab beside it stayed empty.
  const answerApplication = async (
    interest: Interest,
    response: 'shortlisted' | 'declined',
    note = '',
  ) => {
    const actorProfileId = getStoredUserProfileId();
    if (!actorProfileId) {
      setShortlistError('We could not tell which household you are. Please sign in again.');
      return;
    }

    setShortlistLoadingInterestId(interest.id);
    setShortlistError(null);
    setShortlistSuccess(null);
    try {
      await listingApplicationService.respondToApplication(
        interest.id,
        actorProfileId,
        response,
        note,
      );
      // Re-read rather than patched in place. Which tab an applicant belongs to
      // is decided by their status, and guessing the new one here is how a list
      // and the tabs above it drift apart.
      await fetchApplicants();
      setShortlistSuccess(
        response === 'shortlisted'
          ? 'Shortlisted. They are in the Shortlisted tab, and we have told them.'
          : 'Application closed. We have told them.',
      );
    } catch (err: any) {
      console.error('Failed to answer application:', err);
      setShortlistError(
        err?.message ||
          (response === 'shortlisted'
            ? 'We could not shortlist this applicant. Please try again.'
            : 'We could not close this application. Please try again.'),
      );
    } finally {
      setShortlistLoadingInterestId(null);
    }
  };

  // Ending a job that is under way.
  //
  // The reason is required here, unlike a rejection. Somebody is losing work
  // they had, and "no reason given" is not something to make easy — it also has
  // to hold up if either of them ever needs to say what happened.
  const confirmTermination = async () => {
    if (!terminating) return;
    const interest = terminating;
    const reason = terminateReason.trim();
    if (!reason) return;

    const househelpUserId = interest.househelp?.user_id;
    if (!househelpUserId) {
      setError('We could not tell whose engagement this is. Please reload and try again.');
      return;
    }

    setTerminating(null);
    setTerminateReason('');
    setShortlistLoadingInterestId(interest.id);
    setError(null);
    try {
      await employmentService.terminate(househelpUserId, reason);
      await Promise.all([fetchApplicants(), refreshEngagements()]);
      window.dispatchEvent(new Event('hiring-updated'));
      setShortlistSuccess('The engagement has ended, and we have told them why.');
    } catch (err: any) {
      setError(err?.message || 'We could not end this engagement. Please try again.');
    } finally {
      setShortlistLoadingInterestId(null);
    }
  };

  // Reviewing is done on the person's profile, where the reviews live and where
  // the eligibility rule is enforced. Sending them there beats a second copy of
  // the form that could disagree with it.
  const openReview = (interest: Interest) => {
    const userId = interest.househelp?.user_id || '';
    if (!userId) {
      setError('We could not open a review for this person.');
      return;
    }
    navigate(
      `/household/househelp/profile?userId=${encodeURIComponent(userId)}&review=1` +
        `&backTo=${encodeURIComponent(backToPath)}&backLabel=${encodeURIComponent('Back to Hiring')}`,
    );
  };

  const handleShortlistApplicant = (interest: Interest) =>
    answerApplication(interest, 'shortlisted');

  // Rejecting asks why. The reason is optional, because a household that does
  // not want to give one should not be stuck — but it is asked for, because
  // "we went with someone else" is worth far more to somebody looking for work
  // than silence, and it is the only thing they will get.
  const handleRejectApplicant = (interest: Interest) => setRejecting(interest);

  const confirmRejection = async () => {
    if (!rejecting) return;
    const interest = rejecting;
    const note = rejectReason.trim();
    setRejecting(null);
    setRejectReason('');
    await answerApplication(interest, 'declined', note);
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
            {/* Scrolls when it has to, but sized so it usually does not have
                to: at phone widths the old px-6/space-x-6 pushed the last tab
                past the edge, and no-scrollbar meant nothing showed that there
                was more to reach. */}
            <nav
              className="flex gap-4 sm:gap-6 px-4 sm:px-6 text-gray-600 dark:text-purple-200 overflow-x-auto no-scrollbar"
              aria-label="Tabs"
            >
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  className={`shrink-0 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-xs transition-colors flex items-center gap-1.5 sm:gap-2 ${
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
          <div className="py-6">
            <ListPageSkeleton items={4} />
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
            {jobs.map((job) => {

              return (
                <div
                  key={job.id}
                  className="bg-white rounded-xl shadow-sm p-4 sm:p-6 hover:shadow-md transition-shadow border dark:bg-purple-950/40 dark:shadow-purple-900/40 dark:hover:shadow-2xl dark:border-purple-800/40"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                        {job.title || 'Untitled role'}
                      </h3>
                      {/* Where the job is. This is now the only place a
                          household sees its own listings, so the location has to
                          be here rather than only on the profile page it used
                          to share the job with. */}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        📍 {formatListingPlace(job)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${job.status === 'closed'
                      ? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                      : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'}`}>
                      {job.status || 'open'}
                    </span>
                  </div>

                  {/* The same renderer the househelp sees. Two copies of this
                      was how the two sides came to describe one job
                      differently. */}
                  <ListingDetails listing={job} className="mt-4" emptyMessage="" />

                  {(job.max_applicants || (job.status === 'active' && job.expires_at)) ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {job.max_applicants ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                          Max {job.max_applicants} applicants
                        </span>
                      ) : null}
                      {job.status === 'active' && job.expires_at ? (
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            daysUntil(job.expires_at) <= 2
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200'
                              : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                          }`}
                        >
                          {describeExpiry(job.expires_at)}
                        </span>
                      ) : null}
                    </div>
                  ) : null}

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
                    {/* Only on live jobs: a closed or filled one has no expiry to
                        extend, and offering it there would suggest otherwise. */}
                    {job.status === 'active' && (
                      <button
                        onClick={() => handleRenewJob(job)}
                        disabled={jobActionLoading === job.id}
                        className="px-3 py-1 text-xs font-semibold rounded-lg border border-purple-300 text-purple-700 dark:text-purple-200 dark:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-500/10 disabled:opacity-50"
                      >
                        {jobActionLoading === job.id ? 'Keeping open…' : 'Keep open'}
                      </button>
                    )}
                    <button
                      onClick={() => setJobToDelete(job)}
                      disabled={jobActionLoading === job.id}
                      className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 text-red-600 dark:text-red-300 dark:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State for Applicants */}
        {!loading && activeTab !== 'jobs' && visibleApplicants.length === 0 && (
          <div className="bg-white dark:bg-purple-900 rounded-3xl shadow-lg border border-purple-200 dark:border-purple-700/40 p-8 sm:p-12 text-center transition-colors">
            <HandHeart className="w-16 h-16 text-green-400 dark:text-green-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-purple-900 dark:text-white mb-2">
              {EMPTY_TAB_COPY[activeTab as Exclude<TabType, 'jobs'>]?.title ?? 'Nothing here yet'}
            </h3>
            <p className="text-gray-600 dark:text-purple-200 mb-6 sm:mb-8 text-xs sm:text-sm">
              {EMPTY_TAB_COPY[activeTab as Exclude<TabType, 'jobs'>]?.body ?? ''}
            </p>
          </div>
        )}

        {/* Applicants List */}
        {!loading && activeTab !== 'jobs' && visibleApplicants.length > 0 && (
          <div className="space-y-5">
            {visibleApplicants.map((interest) => {
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
              // The application's own status, not a bookmark somewhere else.
              const isShortlisted = interest.status === 'shortlisted';
              const isClosed = ['declined', 'approved'].includes(interest.status);
              // Approved means the work is on. Ending it and reviewing them are
              // the two things left to do about this person.
              const isHired =
                interest.status === 'approved' &&
                !endedEngagements.has(String(interest.househelp?.user_id ?? ''));
              const chatLoading = chatLoadingInterestId === interest.id;
              const shortlistLoading = shortlistLoadingInterestId === interest.id;
              // Where the household has a next step of its own.
              //
              // This read `status === 'pending' || 'viewed'` — two statuses an
              // application never holds. Applications are shortlisted,
              // initiated, accepted, declined or approved, so the condition was
              // false for every row ever rendered and the buttons under it had
              // never once appeared.
              const canActOnInterest =
                interest.status === 'shortlisted' || interest.status === 'accepted';
              // What the next step actually is, named as the household would
              // name it: an offer to somebody set aside, a contract to somebody
              // who has already said yes.
              const advanceLabel =
                interest.status === 'accepted' ? 'Send contract' : 'Send offer';
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

                  {/* Everything you can do about this applicant, in one place.
                      Chat and Shortlist used to be pinned to the card's top
                      right corner, which cleared the text only while the card
                      was wide: on a phone they landed on top of the applicant's
                      own name and the status beside it, covering both and
                      taking the taps meant for them. */}
                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleChatWithApplicant(interest)}
                        disabled={chatLoading}
                        className="inline-flex items-center gap-2 rounded-full border border-purple-200/70 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 shadow-sm transition-colors hover:bg-purple-100 disabled:opacity-60 dark:border-purple-700/50 dark:bg-purple-900/40 dark:text-purple-100 dark:hover:bg-purple-800/60"
                      >
                        {chatLoading ? (
                          <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
                        ) : (
                          <MessageCircle className="h-4 w-4" />
                        )}
                        <span>Chat</span>
                      </button>
                      <button
                        onClick={() => handleShortlistApplicant(interest)}
                        disabled={shortlistLoading || isShortlisted}
                        title={
                          isShortlisted
                            ? 'Already shortlisted'
                            : 'Keep them aside while you decide. They will be told.'
                        }
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors ${
                          isShortlisted
                            ? 'border-green-500 bg-green-500/90 text-white dark:bg-green-500/70'
                            : 'border-purple-300 bg-white text-purple-700 hover:bg-purple-50 disabled:hover:bg-white dark:border-purple-700/40 dark:bg-purple-900/40 dark:text-purple-100 dark:hover:bg-purple-800/60'
                        } disabled:opacity-60`}
                      >
                        {shortlistLoading ? (
                          <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
                        ) : (
                          <Heart className={`h-4 w-4 ${isShortlisted ? 'fill-current' : ''}`} />
                        )}
                        <span>{isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                      </button>
                      {isHired && (
                        <>
                          <button
                            onClick={() => openReview(interest)}
                            title="Leave a review for this person"
                            className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm transition-colors hover:bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200 dark:hover:bg-amber-500/20"
                          >
                            <Star className="h-4 w-4" />
                            <span>Leave a review</span>
                          </button>
                          <button
                            onClick={() => setTerminating(interest)}
                            disabled={shortlistLoading}
                            title="End this engagement"
                            className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                          >
                            <Ban className="h-4 w-4" />
                            <span>End engagement</span>
                          </button>
                        </>
                      )}
                      {!isClosed && (
                        <button
                          onClick={() => handleRejectApplicant(interest)}
                          disabled={shortlistLoading}
                          title="Let them know you are not going ahead"
                          className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200 dark:hover:bg-red-500/20"
                        >
                          <UserX className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      )}
                      {canActOnInterest ? (
                        <>
                          <button
                            onClick={() =>
                              interest.status === 'accepted'
                                ? createContractFromApplication(interest)
                                : handleAcceptInterest(interest)
                            }
                            disabled={contractCreating === interest.id}
                            className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-green-600"
                          >
                            <UserCheck className="h-4 w-4" />
                            {advanceLabel}
                          </button>
                        </>
                      ) : null}
                    </div>

                    <div className="flex items-center gap-3">
                      {!canActOnInterest && (
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-300">
                          Status: {statusLabel}
                        </p>
                      )}
                      <button
                        onClick={() => handleViewInterest(interest)}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 px-5 py-1.5 text-xs font-semibold text-white shadow-lg transition-colors hover:from-purple-700 hover:via-pink-700 hover:to-rose-500"
                      >
                        <Eye className="h-4 w-4" />
                        View profile
                      </button>
                    </div>
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

{/* Rejecting somebody, with the chance to say why.
    The reason is optional so a household is never stuck, and asked for because
    it is the only thing the applicant will get: "we went with someone else" is
    worth more to a person looking for work than silence. */}
{/* Ending a job that is under way.
    The reason is required, unlike a rejection: somebody is losing work they
    had, and it has to hold up if either of them ever needs to say what
    happened. */}
{terminating && (
  <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <div className="w-full max-w-md rounded-t-3xl border border-red-200 bg-white p-6 shadow-2xl dark:border-red-500/30 dark:bg-[#1b1524] sm:rounded-3xl">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        End the engagement with {terminating.househelp?.first_name || 'this person'}?
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        The contract ends today. They will be told, with the reason you give here.
      </p>

      <label className="mt-4 block">
        <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Why is it ending? <span className="font-normal text-red-500">(required)</span>
        </span>
        <textarea
          value={terminateReason}
          onChange={(event) => setTerminateReason(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="We are moving house and no longer need help."
          className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 dark:border-purple-500/30 dark:bg-[#0d0d14] dark:text-white"
        />
      </label>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => { setTerminating(null); setTerminateReason(''); }}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmTermination}
          disabled={!terminateReason.trim()}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-red-700 disabled:opacity-50"
        >
          <Ban className="h-4 w-4" />
          End engagement
        </button>
      </div>
    </div>
  </div>
)}

{rejecting && (
  <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
    <div className="w-full max-w-md rounded-t-3xl border border-purple-200 bg-white p-6 shadow-2xl dark:border-purple-500/30 dark:bg-[#1b1524] sm:rounded-3xl">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">
        Not going ahead with {rejecting.househelp?.first_name || 'this applicant'}?
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        They will be told, and the application moves to Closed.
      </p>

      <label className="mt-4 block">
        <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
          Anything you would like to tell them?{' '}
          <span className="font-normal text-gray-400">(optional)</span>
        </span>
        <textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder="We went with someone closer to us, but thank you for applying."
          className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 dark:border-purple-500/30 dark:bg-[#0d0d14] dark:text-white"
        />
      </label>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setRejecting(null);
            setRejectReason('');
          }}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={confirmRejection}
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-red-700"
        >
          <UserX className="h-4 w-4" />
          Reject application
        </button>
      </div>
    </div>
  </div>
)}
</div>
  );
}
