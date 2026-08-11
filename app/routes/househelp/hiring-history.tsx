import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router";
import { hireRequestService, hireContractService, employmentContractService, employmentService, jobService, listingApplicationService, profileService as grpcProfileService } from '~/services/grpc/authServices';
import { ConfirmDialog } from '~/components/ui/ConfirmDialog';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { ListingDetails, listingSalary } from '~/components/listing/ListingDetails';
import { ApplicationHistory } from '~/components/hiring/ApplicationHistory';
import { getStoredProfileType, getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';
import { formatOnboardingAmountWithFrequency } from '~/utils/onboardingCompensation';
import { buildIdentifierMap, findByAnyIdentifier, getHouseholdCandidateIds } from '~/utils/hiringIdentifiers';
import { ListPageSkeleton } from "~/components/ShimmerLoader";
import { 
  Clock, CheckCircle, XCircle, MessageCircle, Briefcase, 
  Eye, HandHeart, Building2, Star, Ban, X, Calendar, DollarSign, MapPin, User, FileText
} from 'lucide-react';

interface HireRequest {
  id: string;
  household_id: string;
  job_type?: string;
  start_date?: string;
  salary_offered: number;
  salary_frequency: string;
  status?: string;
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
  job_type?: string;
  start_date?: string;
  end_date?: string;
  salary: number;
  salary_frequency: string;
  status?: string;
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
  /** The job this application is against, as the household posted it. */
  listing?: Record<string, any> | null;
  salary_expectation: number;
  salary_frequency: string;
  available_from?: string;
  job_type?: string;
  comments?: string;
  status?: string;
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

interface EmploymentContract {
  id: string;
  household_id: string;
  househelp_id: string;
  status?: string;
  job_title?: string;
  salary: number;
  salary_frequency: string;
  start_date?: string;
  household_signed_at?: string;
  househelp_signed_at?: string;
  household_signer_name: string;
  househelp_signer_name: string;
  created_at: string;
  household?: {
    id: string;
    household_name?: string;
    avatar_url?: string;
    town?: string;
    user?: { first_name: string; last_name: string; };
    user_id?: string;
  };
}

type TabType = 'requests' | 'work-history' | 'employment-contracts' | 'interests';
type HiringProfileRole = 'service-provider' | 'client';

function normalizeHiringProfileRole(profileType?: string | null): HiringProfileRole {
  const normalized = String(profileType || '').trim().toUpperCase();
  if (normalized === 'CLT' || normalized === 'CLIENT' || normalized === 'HOUSEHOLD') {
    return 'client';
  }
  return 'service-provider';
}

const getHouseholdName = (household?: HireRequest['household'] | HireContract['household'] | Interest['household']) => {
  if (!household) return 'Household';
  if (household.household_name) return household.household_name;
  if (household.user) {
    const name = `${household.user.first_name || ''} ${household.user.last_name || ''}`.trim();
    if (name) return name;
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

const formatJobType = (record?: Record<string, any> | null): string => {
  if (!record) return 'Not specified';
  const nestedJob = record.job && typeof record.job === 'object' ? record.job : {};
  const nestedListing = record.listing && typeof record.listing === 'object' ? record.listing : {};
  const raw =
    record.job_type ||
    record.job_type_name ||
    record.job_title ||
    record.service_type ||
    record.title ||
    nestedJob.job_type ||
    nestedJob.title ||
    nestedListing.job_type ||
    nestedListing.title ||
    (Array.isArray(record.job_types) ? record.job_types[0] : '');
  const label = String(raw || '').trim();
  return label ? label.replace(/[-_]+/g, ' ') : 'Not specified';
};

const normalizeStatus = (status?: string | null): string => {
  const value = String(status || '').trim().toLowerCase();
  return value || 'pending';
};

const formatStatus = (status?: string | null): string => {
  const value = normalizeStatus(status).replace(/[-_]+/g, ' ');
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

function buildHouseholdProfileLink(options: {
  household?: { id?: string; user_id?: string } | null;
  fallbackProfileId?: string;
  backTo: string;
  backLabel: string;
}) {
  const { household, fallbackProfileId, backTo, backLabel } = options;
  const userId = household?.user_id || '';
  const profileId = household?.id || fallbackProfileId || '';
  const base = userId
    ? `/household/public-profile?userId=${encodeURIComponent(userId)}`
    : `/household/public-profile?profileId=${encodeURIComponent(profileId)}`;

  return `${base}&from=hiring&backTo=${encodeURIComponent(backTo)}&backLabel=${encodeURIComponent(backLabel)}`;
}

export default function HousehelpHiringHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentProfileType = (getStoredUser() as any)?.profile_type || getStoredProfileType();
  const profileRole = normalizeHiringProfileRole(currentProfileType);
  const isClientProfile = profileRole === 'client';
  // Both roles land on their own requests. What is on offer in the market is
  // the home page's job; this page is about one person's hiring over time.
  const defaultTab: TabType = 'requests';
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const tabParam = searchParams.get('tab');
    const validTabs: TabType[] = ['requests', 'work-history', 'employment-contracts', 'interests'];
    return validTabs.includes(tabParam as TabType) ? (tabParam as TabType) : defaultTab;
  });
  
  const [hireRequests, setHireRequests] = useState<HireRequest[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsLoading, setRequestsLoading] = useState(true);
  
  const [contracts, setContracts] = useState<HireContract[]>([]);
  const [contractsTotal, setContractsTotal] = useState(0);
  const [contractsLoading, setContractsLoading] = useState(true);
  
  const [interests, setInterests] = useState<Interest[]>([]);
  const [interestsTotal, setInterestsTotal] = useState(0);
  const [interestsLoading, setInterestsLoading] = useState(true);

  const [employmentContracts, setEmploymentContracts] = useState<EmploymentContract[]>([]);
  const [employmentContractsTotal, setEmploymentContractsTotal] = useState(0);
  const [employmentContractsLoading, setEmploymentContractsLoading] = useState(true);
  // Map all known household identifiers to the matching employment contract.
  const [employmentContractMap, setEmploymentContractMap] = useState<Record<string, EmploymentContract>>({});
  
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedInterest, setSelectedInterest] = useState<Interest | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Confirmation dialog states
  const [showAcceptConfirm, setShowAcceptConfirm] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const limit = 20;
  const backToPath = `${location.pathname}${location.search || ''}`;

  const handleTabChange = (tab: TabType) => {

    setActiveTab(tab);
    setOffset(0);

    const nextSearchParams = new URLSearchParams(searchParams);
    nextSearchParams.set('tab', tab);
    setSearchParams(nextSearchParams, { replace: true });
  };

  useEffect(() => {
    const fetchPendingCount = async () => {
      try {
        const raw = await hireRequestService.listHireRequests('', 'househelp', 'pending');
        const items = raw?.data || raw || [];
        setPendingCount(Array.isArray(items) ? items.length : 0);
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
    } else if (activeTab === 'employment-contracts') {
      fetchEmploymentContracts();
    } else if (activeTab === 'interests') {
      fetchInterests();
    }
  }, [activeTab, offset, isClientProfile]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const validTabs: TabType[] = ['requests', 'work-history', 'employment-contracts', 'interests'];

    if (tabParam && validTabs.includes(tabParam as TabType) && tabParam !== activeTab) {
      setActiveTab(tabParam as TabType);
      setOffset(0);
    }
  }, [activeTab, defaultTab, isClientProfile, searchParams]);

  const fetchHireRequests = async () => {
    setRequestsLoading(true);
    setError(null);
    try {
      const raw = await hireRequestService.listHireRequests('', 'househelp');
      const items = extractEnvelopeArray<HireRequest>(raw);
      setHireRequests(items);
      setRequestsTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load hire requests');
    } finally {
      setRequestsLoading(false);
    }
  };

  // Work history: every job this person has actually done.
  //
  // This read hire contracts alone — the legacy record, which the current flow
  // no longer creates. So a job taken through an application, worked, and ended
  // left no trace here: somebody could finish months of work and their history
  // would show nothing. Engagements are what the current flow writes and what
  // termination marks, so they are read too.
  const fetchContracts = async () => {
    setContractsLoading(true);
    setError(null);
    try {
      const [legacy, engagements] = await Promise.all([
        hireContractService
          .listHireContracts('', 'househelp')
          .then((raw) => extractEnvelopeArray<HireContract>(raw))
          .catch(() => [] as HireContract[]),
        employmentService
          .listByHousehelp(getStoredUserId() || '', 100, 0)
          .then((raw) => {
            const rows = raw?.data?.data ?? raw?.data ?? raw ?? [];
            return (Array.isArray(rows) ? rows : []).map((row: any): HireContract => ({
              id: String(row?.id ?? ''),
              household_id: String(row?.household_profile_id ?? ''),
              job_type: row?.engagement_type || row?.job_type,
              start_date: row?.start_date,
              end_date: row?.end_date || row?.ended_at,
              salary: Number(row?.salary ?? 0),
              salary_frequency: String(row?.salary_frequency ?? ''),
              status: String(row?.status ?? ''),
              created_at: String(row?.created_at ?? ''),
            }));
          })
          .catch(() => [] as HireContract[]),
      ]);

      // An engagement and a legacy contract can describe the same job, so the
      // newer record wins and the older one is only kept when nothing else
      // covers it.
      const seen = new Set(engagements.map((row) => row.id));
      const items = [...engagements, ...legacy.filter((row) => !seen.has(row.id))];
      setContracts(items);
      setContractsTotal(items.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load work history');
    } finally {
      setContractsLoading(false);
    }
  };

  // Fetch employment contracts for this househelp
  const fetchEmploymentContracts = async () => {
    setEmploymentContractsLoading(true);
    setError(null);
    try {
      const raw = await employmentContractService.listEmploymentContracts('', undefined, limit, offset);
      const items = extractEnvelopeArray<EmploymentContract>(raw);
      setEmploymentContracts(items);
      setEmploymentContractsTotal(extractTotal(raw, items.length));
    } catch (err: any) {
      setError(err.message || 'Failed to load employment contracts');
    } finally {
      setEmploymentContractsLoading(false);
    }
  };

  // Also fetch employment contracts on mount to build the lookup map for request cards
  useEffect(() => {
    const fetchECMap = async () => {
      try {
        const raw = await employmentContractService.listEmploymentContracts('', undefined, 50, 0);
        const items = extractEnvelopeArray<EmploymentContract>(raw);
        setEmploymentContractMap(buildIdentifierMap(items, getHouseholdCandidateIds));
      } catch (err) {
        // Non-critical
      }
    };
    fetchECMap();
  }, []);

  // The provider's own applications.
  //
  // This tab used to list "interests sent" — a record that existed alongside the
  // application and held one row per household, so a second application to the
  // same household was never recorded. Applications are per job, so this now shows
  // every job they actually applied to.
  const fetchInterests = async () => {
    setInterestsLoading(true);
    setError(null);
    try {
      const applicantProfileId = getStoredUserProfileId();
      if (!applicantProfileId) {
        setInterests([]);
        setInterestsTotal(0);
        return;
      }
      const raw = await listingApplicationService.listApplications({ applicantProfileId, limit: 200 });
      const rows = extractEnvelopeArray<any>(raw);
      // The rows render the household behind each application, which an
      // application only names indirectly through its listing. Resolve the
      // listings once each, then the households they belong to, so the tab shows
      // who the job was with rather than a blank card.
      const listingIds = Array.from(new Set(
        rows.map((application) => String(application.listing_id ?? application.listingId ?? ''))
            .filter(Boolean),
      ));

      const listings = await Promise.all(
        listingIds.map(async (listingId) => {
          try {
            const listing = await jobService.getJob(listingId);
            return [listingId, listing?.data ?? listing] as const;
          } catch {
            // One unreadable listing must not empty the whole tab.
            return [listingId, null] as const;
          }
        }),
      );
      const listingById = new Map(listings);

      const householdProfileIds = Array.from(new Set(
        listings
          .map(([, listing]) => String((listing as any)?.user_profile_id ?? ''))
          .filter(Boolean),
      ));

      let householdById = new Map<string, any>();
      if (householdProfileIds.length > 0) {
        try {
          const raw = await grpcProfileService.searchMultipleWithUser('', 'household', {
            profile_ids: householdProfileIds,
          });
          for (const profile of extractEnvelopeArray<any>(raw)) {
            const id = profile?.id || profile?.profile_id;
            if (id) householdById.set(String(id), profile);
          }
        } catch (err) {
          // Names are a nicety; the applications themselves still list.
          console.error('Failed to resolve households for applications:', err);
        }
      }

      // The listing is kept, not just its title.
      //
      // Every one of these was fetched above and then thrown away except for the
      // name: the salary the household posted, the chores, when it starts, how
      // often, how long, day worker or live-in — all discarded on the way into
      // the row. So the person deciding whether to take the work was shown their
      // own covering message and "Salary Expected: Not specified", while the
      // household looked at the full advert. Nothing was missing from the API;
      // it was being dropped here.
      const items: Interest[] = rows.map((application) => {
        const listingId = String(application.listing_id ?? application.listingId ?? '');
        const listing = listingById.get(listingId) as any;
        const householdProfileId = String(listing?.user_profile_id ?? '');
        return {
          id: String(application.id ?? ''),
          househelp_id: applicantProfileId,
          household_id: householdProfileId,
          salary_expectation: 0,
          salary_frequency: '',
          status: String(application.status ?? 'initiated'),
          comments: application.message ? String(application.message) : undefined,
          created_at: String(application.created_at ?? application.createdAt ?? ''),
          household: householdById.get(householdProfileId),
          job_type: listing?.title ? String(listing.title) : undefined,
          listing,
        } as Interest;
      });
      setInterests(items);
      setInterestsTotal(items.length);
    } catch (err: any) {
      setError(err.message || 'Failed to load your applications');
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
    setError(null);
    setSuccessMessage(null);
    try {
      await hireRequestService.acceptHireRequest(pendingActionId);
      fetchHireRequests();
      window.dispatchEvent(new Event('hiring-updated'));
      setSuccessMessage('Hire request accepted.');
    } catch (err: any) {
      setError(err.message || 'Failed to accept hire request');
    } finally {
      setActionLoading(null);
      setShowAcceptConfirm(false);
      setPendingActionId(null);
    }
  };

  // Answering an offer on an application.
  //
  // The accept and decline above act on hire requests, a separate legacy record.
  // An application had no answer at all on this side: a household could invite
  // somebody and they could only look at it. The offer sat at "initiated" and
  // the household waited for a reply that the page gave no way to send.
  const [answeringInterest, setAnsweringInterest] = useState<any | null>(null);
  const [declineNote, setDeclineNote] = useState('');

  const answerInterest = async (
    interest: any,
    response: 'accepted' | 'declined',
    note = '',
  ) => {
    const actorProfileId = getStoredUserProfileId();
    if (!actorProfileId) {
      setError('We could not tell which profile you are. Please sign in again.');
      return;
    }
    setActionLoading(interest.id);
    setError(null);
    setSuccessMessage(null);
    try {
      await listingApplicationService.respondToApplication(
        interest.id,
        actorProfileId,
        response,
        note,
      );
      await fetchInterests();
      window.dispatchEvent(new Event('hiring-updated'));
      setSuccessMessage(
        response === 'accepted'
          ? 'Accepted. The household will send you a contract to sign.'
          : 'Declined. The household has been told.',
      );
    } catch (err: any) {
      setError(err?.message || 'We could not send your answer. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDeclineInterest = async () => {
    if (!answeringInterest) return;
    const interest = answeringInterest;
    const note = declineNote.trim();
    setAnsweringInterest(null);
    setDeclineNote('');
    await answerInterest(interest, 'declined', note);
  };

  const handleDeclineRequest = async () => {
    if (!selectedRequest) {
      return;
    }
    setActionLoading(selectedRequest);
    setError(null);
    setSuccessMessage(null);
    try {
      await hireRequestService.declineHireRequest(selectedRequest);
      fetchHireRequests();
      setShowDeclineModal(false);
      setSelectedRequest(null);
      window.dispatchEvent(new Event('hiring-updated'));
      setSuccessMessage('Hire request declined.');
    } catch (err: any) {
      setError(err.message || 'Failed to decline hire request');
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
      // Unshortlist is the withdraw path on an application. deleteInterest would
      // have been given an application id and found nothing.
      await listingApplicationService.unshortlistApplication(pendingActionId, getStoredUserProfileId() || '');
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return 'Not specified';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatSalary = (amount?: number | null, frequency?: string) =>
    formatOnboardingAmountWithFrequency(amount, frequency, 'Not specified');

  const getStatusColor = (status?: string | null) => {
    switch (normalizeStatus(status)) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'accepted': case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'declined': case 'terminated': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'viewed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getStatusIcon = (status?: string | null) => {
    switch (normalizeStatus(status)) {
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
    { key: 'requests', label: 'Requests', count: pendingCount > 0 ? pendingCount : undefined },
    { key: 'employment-contracts', label: 'Contracts' },
    { key: 'work-history', label: 'Work History' },
    { key: 'interests', label: 'Applications' },
  ];

  const pageTitle = 'Hiring';
  const pageEyebrow = isClientProfile ? 'Client • Hiring' : 'Service Provider • Hiring';
  const pageDescription = isClientProfile
    ? 'Manage your hiring activity and view its status'
    : 'Manage your requests, contracts, work history and applications';

  const loading = activeTab === 'requests' ? requestsLoading : activeTab === 'work-history' ? contractsLoading : activeTab === 'employment-contracts' ? employmentContractsLoading : interestsLoading;

  return (
    <div>
      {/* Main Card Container */}
      <div className="bg-white dark:bg-purple-950/40 rounded-2xl shadow-lg border border-purple-100 dark:border-purple-800/40 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
                {pageEyebrow}
              </p>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{pageTitle}</h1>
              <p className="text-gray-600 dark:text-gray-400 text-xs">{pageDescription}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 sm:px-6 border-b border-gray-200 dark:border-purple-800/40">
          {/* Four tabs with long names do not fit a phone, so this strip
              scrolls. Tightened at narrow widths so more of it is reachable
              without scrolling at all. */}
          <nav className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`relative flex shrink-0 items-center gap-1.5 sm:gap-2 py-1.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'border-purple-500 text-gray-900 dark:text-white'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.key === 'requests' && <MessageCircle className="w-4 h-4" />}
                {tab.key === 'employment-contracts' && <FileText className="w-4 h-4" />}
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
        {successMessage && (
          <div className="mx-6 mt-4">
            <SuccessAlert message={successMessage} />
          </div>
        )}
        {error && (
          <div className="mx-6 mt-4">
            <ErrorAlert message={error} className="mb-4" />
            <button
              onClick={() => {
                if (activeTab === 'requests') {
                  fetchHireRequests();

                } else if (activeTab === 'work-history') {
                  fetchContracts();
                } else if (activeTab === 'employment-contracts') {
                  fetchEmploymentContracts();
                } else {
                  fetchInterests();
                }
              }}
              className="rounded-xl border border-purple-500/50 px-4 py-2 text-xs font-medium text-purple-600 transition-colors hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-900/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="py-6">
            <ListPageSkeleton items={4} />
          </div>
        )}

        {/* Job Listings Tab Content */}
        {activeTab === 'requests' && !loading && (
          <>
            {!Array.isArray(hireRequests) || hireRequests.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No hire requests yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">When households send you hire requests, they'll appear here</p>
                <button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Browse Households
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-purple-800/40">
                {(Array.isArray(hireRequests) ? hireRequests : []).map((request) => {
                  const matchingEmploymentContract = findByAnyIdentifier(
                    employmentContractMap,
                    getHouseholdCandidateIds(request),
                  );

                  return (
                  <div key={request.id} className="p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                          {request.household?.avatar_url ? (
                            <img src={request.household.avatar_url} alt={getHouseholdName(request.household)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">{getHouseholdInitials(request.household)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{getHouseholdName(request.household)}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              {formatStatus(request.status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div><span className="text-gray-500 dark:text-purple-300">Job Type</span><p className="font-medium text-gray-900 dark:text-white capitalize">{formatJobType(request as any)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Salary</span><p className="font-medium text-gray-900 dark:text-white">{formatSalary(request.salary_offered, request.salary_frequency)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Start Date</span><p className="font-medium text-gray-900 dark:text-white">{request.start_date ? formatDate(request.start_date) : 'Not specified'}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Requested</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(request.created_at)}</p></div>
                          </div>
                          {request.special_requirements && (
                            <div className="mt-3"><span className="text-gray-500 dark:text-purple-300 text-xs">Special Requirements:</span><p className="text-xs text-gray-700 dark:text-purple-200">{request.special_requirements}</p></div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:self-end">
                        <button onClick={() => navigate(buildHouseholdProfileLink({ household: request.household, fallbackProfileId: request.household_id, backTo: backToPath, backLabel: 'Back to Hiring' }), { state: { profileId: request.household?.id || request.household_id, backTo: backToPath, backLabel: 'Back to Hiring' } })} className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                          View Profile
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button onClick={() => openAcceptConfirm(request.id)} disabled={actionLoading === request.id} className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50">
                              <CheckCircle className="w-4 h-4" /> Accept
                            </button>
                            <button onClick={() => { setSelectedRequest(request.id); setShowDeclineModal(true); }} disabled={actionLoading === request.id} className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50">
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </>
                        )}
                        {request.status === 'accepted' && (
                          matchingEmploymentContract ? (
                            <button
                              onClick={() => {
                                const params = new URLSearchParams({
                                  id: matchingEmploymentContract.id,
                                  backTo: backToPath,
                                  backLabel: 'Back to Hiring',
                                });
                                navigate(`/household/employment-contract?${params.toString()}`);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                              <FileText className="w-4 h-4" /> View Contract
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/40 rounded-xl">
                              <CheckCircle className="w-4 h-4" /> Awaiting Contract
                            </span>
                          )
                        )}
                        {request.status === 'finalized' && (
                          matchingEmploymentContract ? (
                            <button
                              onClick={() => {
                                const params = new URLSearchParams({
                                  id: matchingEmploymentContract.id,
                                  backTo: backToPath,
                                  backLabel: 'Back to Hiring',
                                });
                                navigate(`/household/employment-contract?${params.toString()}`);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all"
                            >
                              <FileText className="w-4 h-4" /> View Contract
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700/40 rounded-xl">
                              <FileText className="w-4 h-4" /> Finalized
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )})}
              </div>
            )}
          </>
        )}

        {/* Employment Contracts Tab Content */}
        {activeTab === 'employment-contracts' && !loading && (
          <>
            {employmentContracts.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No employment contracts yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">When a household creates a formal employment contract, it will appear here for you to review and sign</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-purple-800/40">
                {employmentContracts.map((ec) => {
                  const getECStatusBadge = () => {
                    if (ec.status === 'signed_by_both') return { label: 'Fully Signed', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: <CheckCircle className="w-4 h-4" /> };
                    if (ec.status === 'pending_househelp') return { label: 'Awaiting Your Signature', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: <Clock className="w-4 h-4" /> };
                    if (ec.status === 'draft') return { label: 'Draft', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: <FileText className="w-4 h-4" /> };
                    return { label: ec.status, color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" /> };
                  };
                  const badge = getECStatusBadge();
                  return (
                    <div key={ec.id} className="p-6 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-colors">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex-shrink-0">
                            {ec.household?.avatar_url ? (
                              <img src={ec.household.avatar_url} alt={getHouseholdName(ec.household)} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">{getHouseholdInitials(ec.household)}</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold text-gray-900 dark:text-white">{ec.job_title}</h3>
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                                {badge.icon} {badge.label}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                              {getHouseholdName(ec.household)} &bull; {formatSalary(ec.salary, ec.salary_frequency)}
                              {ec.start_date && ` • From ${formatDate(ec.start_date)}`}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">Created {formatDate(ec.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:self-end">
                          <button
                            onClick={() => {
                              const params = new URLSearchParams({
                                id: ec.id,
                                backTo: backToPath,
                                backLabel: 'Back to Hiring',
                              });
                              navigate(`/household/employment-contract?${params.toString()}`);
                            }}
                            className={`inline-flex items-center gap-2 px-4 py-1 text-xs font-medium rounded-xl transition-all ${
                              ec.status === 'pending_househelp'
                                ? 'text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                                : 'text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                            }`}
                          >
                            <FileText className="w-4 h-4" />
                            {ec.status === 'pending_househelp' ? 'Review & Sign' : 'View Contract'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">No work history yet</h3>
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
                            <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">{getHouseholdInitials(contract.household)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{getHouseholdName(contract.household)}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                              {getStatusIcon(contract.status)}
                              {formatStatus(contract.status)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            <div><span className="text-gray-500 dark:text-purple-300">Job Type</span><p className="font-medium text-gray-900 dark:text-white capitalize">{formatJobType(contract as any)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Salary</span><p className="font-medium text-gray-900 dark:text-white">{formatSalary(contract.salary, contract.salary_frequency)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">Start Date</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(contract.start_date)}</p></div>
                            <div><span className="text-gray-500 dark:text-purple-300">End Date</span><p className="font-medium text-gray-900 dark:text-white">{contract.end_date ? formatDate(contract.end_date) : 'Ongoing'}</p></div>
                          </div>
                          {contract.household?.town && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-purple-300">
                              <Building2 className="w-4 h-4" /> {contract.household.town}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:self-end">
                        <button onClick={() => navigate(buildHouseholdProfileLink({ household: contract.household, fallbackProfileId: contract.household_id, backTo: backToPath, backLabel: 'Back to Hiring' }), { state: { profileId: contract.household?.id || contract.household_id, backTo: backToPath, backLabel: 'Back to Hiring' } })} className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
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
                <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">You haven't applied to anything yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Jobs you apply to will appear here, with where each one has got to.</p>
                <button onClick={() => navigate('/')} className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
                  Browse jobs
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
                            <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">{getHouseholdInitials(interest.household)}</div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{getHouseholdName(interest.household)}</h3>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interest.status)}`}>
                              {getStatusIcon(interest.status)}
                              {formatStatus(interest.status)}
                            </span>
                            {interest.viewed_at && interest.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                <Eye className="w-3 h-3" /> Viewed
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                            {interest.job_type && <div><span className="text-gray-500 dark:text-purple-300">Job Type</span><p className="font-medium text-gray-900 dark:text-white capitalize">{interest.job_type.replace('-', ' ')}</p></div>}
                            {/* What the job pays, as the household wrote it.
                                This said "Salary Expected" and read a field an
                                application does not carry, so it always showed
                                "Not specified" — on the same job whose advert
                                states a range. */}
                            <div>
                              <span className="text-gray-500 dark:text-purple-300">Salary</span>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {listingSalary(interest.listing) || 'Not specified'}
                              </p>
                            </div>
                            {interest.available_from && <div><span className="text-gray-500 dark:text-purple-300">Available From</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(interest.available_from)}</p></div>}
                            <div><span className="text-gray-500 dark:text-purple-300">Sent</span><p className="font-medium text-gray-900 dark:text-white">{formatDate(interest.created_at)}</p></div>
                          </div>
                          {interest.comments && (
                            <div className="mt-3"><span className="text-gray-500 dark:text-purple-300 text-xs">Your message:</span><p className="text-xs text-gray-700 dark:text-purple-200">{interest.comments}</p></div>
                          )}
                          {interest.household?.town && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-purple-300">
                              <Building2 className="w-4 h-4" /> {interest.household.town}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                        <button onClick={() => { setSelectedInterest(interest); setShowInterestModal(true); }} className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                          View Details
                        </button>
                        {/* An offer is waiting for an answer. "initiated" is
                            reached both by applying and by a household inviting
                            you; either way the next word is yours. */}
                        {interest.status === 'initiated' && (
                          <>
                            <button
                              onClick={() => answerInterest(interest, 'accepted')}
                              disabled={actionLoading === interest.id}
                              className="inline-flex items-center gap-2 px-4 py-1 text-xs font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" /> Accept
                            </button>
                            <button
                              onClick={() => setAnsweringInterest(interest)}
                              disabled={actionLoading === interest.id}
                              className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" /> Decline
                            </button>
                          </>
                        )}
                        {interest.status === 'pending' && (
                          <button onClick={() => openWithdrawConfirm(interest.id)} disabled={actionLoading === interest.id} className="inline-flex items-center gap-2 px-4 py-1 text-xs font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50">
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
          (activeTab === 'employment-contracts' && employmentContractsTotal > limit) ||
          (activeTab === 'interests' && interestsTotal > limit)
        ) && (
          <div className="p-6 border-t border-gray-200 dark:border-purple-800/40 flex justify-center gap-2">
            <button onClick={() => setOffset(Math.max(0, offset - limit))} disabled={offset === 0} className="px-4 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-purple-900/30 rounded-xl hover:bg-gray-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <button onClick={() => setOffset(offset + limit)} disabled={(activeTab === 'requests' && offset + limit >= requestsTotal) || (activeTab === 'work-history' && offset + limit >= contractsTotal) || (activeTab === 'employment-contracts' && offset + limit >= employmentContractsTotal) || (activeTab === 'interests' && offset + limit >= interestsTotal)} className="px-4 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-purple-900/30 rounded-xl hover:bg-gray-200 dark:hover:bg-purple-900/50 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      <ConfirmDialog
        isOpen={showDeclineModal}
        onClose={() => {
          if (actionLoading) return;
          setShowDeclineModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleDeclineRequest}
        title="Decline Hire Request"
        message="Decline this hire request?"
        confirmText={actionLoading ? 'Declining...' : 'Decline Request'}
        cancelText="Cancel"
        variant="warning"
      />

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
                      <div className="w-full h-full flex items-center justify-center text-white text-xl font-bold">
                        {getHouseholdInitials(selectedInterest.household)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{getHouseholdName(selectedInterest.household)}</h3>
                    {selectedInterest.household?.town && (
                      <p className="text-white/80 flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" /> {selectedInterest.household.town}
                      </p>
                    )}
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedInterest.status)}`}>
                      {getStatusIcon(selectedInterest.status)}
                      {formatStatus(selectedInterest.status)}
                      {selectedInterest.viewed_at && selectedInterest.status === 'pending' && (
                        <span className="ml-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Viewed</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* The job itself, first.
                    This modal opened on the covering message the applicant had
                    written and nothing else — so the one screen for deciding
                    whether to take a job showed them their own words back and
                    none of the household's. What the work is comes first now;
                    what they said about it comes after. */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-purple-400 uppercase tracking-wider mb-3">
                    The job
                  </h4>
                  {selectedInterest.job_type && (
                    <p className="mb-3 text-base font-semibold text-gray-900 dark:text-white">
                      {selectedInterest.job_type}
                    </p>
                  )}
                  <ListingDetails
                    listing={selectedInterest.listing}
                    emptyMessage="The household has not filled in the details for this job yet."
                  />
                </div>

                {/* How it got here. */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-purple-400 uppercase tracking-wider mb-3">
                    History
                  </h4>
                  <ApplicationHistory
                    applicationId={selectedInterest.id}
                    actorProfileId={getStoredUserProfileId() || ''}
                    viewer="househelp"
                  />
                </div>

                {/* Interest Details */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-purple-400 uppercase tracking-wider mb-3">Your application</h4>
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
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-purple-400 uppercase tracking-wider mb-3">Your Message</h4>
                    <div className="bg-gray-50 dark:bg-purple-900/20 rounded-xl p-4">
                      <p className="text-gray-700 dark:text-gray-300">{selectedInterest.comments}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => navigate(buildHouseholdProfileLink({ household: selectedInterest.household, fallbackProfileId: selectedInterest.household_id, backTo: backToPath, backLabel: 'Back to Hiring' }), { state: { profileId: selectedInterest.household?.id || selectedInterest.household_id, backTo: backToPath, backLabel: 'Back to Hiring' } })}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all"
                  >
                    <User className="w-4 h-4" /> View Household Profile
                  </button>
                  {selectedInterest.status === 'pending' && (
                    <button 
                      onClick={() => openWithdrawConfirm(selectedInterest.id)}
                      disabled={actionLoading === selectedInterest.id}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-1.5 text-xs font-medium text-red-600 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
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

      {/* Declining an offer, with the chance to say why.
          Optional, and asked for: a household left with silence learns nothing,
          and "the hours do not work for me" is what stops them offering the
          same thing again. */}
      {answeringInterest && (
        <div className="fixed inset-0 z-[95] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl border border-purple-200 bg-white p-6 shadow-2xl dark:border-purple-500/30 dark:bg-[#1b1524] sm:rounded-3xl">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">
              Decline this offer?
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              The household will be told. You can still apply to their other jobs.
            </p>

            <label className="mt-4 block">
              <span className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Anything you would like to tell them?{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </span>
              <textarea
                value={declineNote}
                onChange={(event) => setDeclineNote(event.target.value)}
                rows={3}
                maxLength={500}
                placeholder="The hours do not work for me, but thank you for the offer."
                className="mt-2 w-full rounded-xl border border-purple-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 dark:border-purple-500/30 dark:bg-[#0d0d14] dark:text-white"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setAnsweringInterest(null); setDeclineNote(''); }}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeclineInterest}
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg hover:bg-red-700"
              >
                <XCircle className="h-4 w-4" />
                Decline offer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
