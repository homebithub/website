import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { OptimizedImage } from "~/components/ui/OptimizedImage";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { profileService as grpcProfileService, shortlistService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import { type HousehelpSearchFields } from "~/components/features/HousehelpFilters";
import HousehelpMoreFilters from "~/components/features/HousehelpMoreFilters";
import { SidePanel } from '~/components/SidePanel';
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import OnboardingTipsBanner from "~/components/OnboardingTipsBanner";
import { fetchPreferences } from "~/utils/preferencesApi";
import SearchableTownSelect from "~/components/ui/SearchableTownSelect";
import CustomSelect from "~/components/ui/CustomSelect";
import { useProfilePhotos } from '~/hooks/useProfilePhotos';

interface HousehelpProfile {
  id: number | string;
  user_id?: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  profile_picture?: string;
  photos?: string[];
  years_of_experience?: number;
  experience?: number;
  salary_expectation?: string | number;
  salary_frequency?: string;
  location?: string;
  county_of_residence?: string;
  bio?: string;
  househelp_type?: string;
  skills?: string[];
  languages?: string[];
  can_work_with_kids?: boolean;
  can_work_with_pets?: boolean;
  rating?: number;
  review_count?: number;
  availability?: string;
  is_available?: boolean;
  verified?: boolean;
  created_at?: string;
}

type HouseholdHomeVariant = 'default' | 'home1' | 'home2' | 'home3';

interface AuthenticatedHomeProps {
  variant?: HouseholdHomeVariant;
}

const EXPERIENCE_MIN_OPTIONS = [
  { value: "", label: "Any" },
  { value: "1", label: "1+ years" },
  { value: "2", label: "2+ years" },
  { value: "5", label: "5+ years" },
  { value: "10", label: "10+ years" },
];

export default function AuthenticatedHome({ variant = 'default' }: AuthenticatedHomeProps) {
  const initialFields: HousehelpSearchFields = {
    status: "",
    househelp_type: "",
    gender: "",
    experience: "",
    town: "",
    salary_frequency: "",
    skill: "",
    traits: "",
    min_rating: "",
    salary_min: "",
    salary_max: "",
    can_work_with_kids: "",
    can_work_with_pets: "",
    offers_live_in: "",
    offers_day_worker: "",
    available_from: "",
    language: "",
    min_age: "",
    max_age: "",
  };

  // Track image loading state for each profile
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [showTips, setShowTips] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  // Current user (used for chat payloads)
  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user_object');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const currentUserId: string | undefined = currentUser?.id;
  const currentProfileType: string | undefined = currentUser?.profile_type;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

  // Fetch household profile ID if current user is a household
  useEffect(() => {
    let cancelled = false;

    const fetchHouseholdProfileId = async () => {
      if (currentProfileType?.toLowerCase() === 'household' && currentUserId) {
        try {
          const token = getAccessTokenFromCookies();
          if (!token) return;
          
          const profile = await grpcProfileService.getCurrentHouseholdProfile('');
          if (profile && !cancelled) {
            setCurrentHouseholdProfileId(profile?.id || profile?.profile_id || null);
          }
        } catch (err) {
          console.error('Failed to fetch household profile ID:', err);
        }
      }
    };

    fetchHouseholdProfileId();

    return () => {
      cancelled = true;
    };
  }, [currentProfileType, currentUserId]);

  // Card actions
  const handleViewProfile = (profileId: string) => {
    navigate('/househelp/public-profile', { state: { profileId } });
  };

  const handleStartChat = async (targetUserId?: string, househelpProfileId?: string) => {
    if (!targetUserId || !currentUserId) return;
    try {
      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = currentUserId;
      let househelpId = targetUserId;

      // If somehow a househelp is browsing this view, flip roles
      if (profileType === 'househelp') {
        householdId = targetUserId;
        househelpId = currentUserId;
      }

      const payload: StartConversationPayload = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
      };
      if (househelpProfileId) {
        payload.househelp_profile_id = househelpProfileId;
      }
      
      // Include household_profile_id if current user is household
      if (profileType === 'household' && currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (e) {
      console.error('Failed to start chat from househelps search', e);
      navigate('/inbox');
    }
  };

  const handleShortlist = async (profileId: string, event: React.MouseEvent<HTMLButtonElement>) => {
    try {
      const isShortlisted = shortlistedProfiles.has(profileId);
      console.log(isShortlisted ? 'Removing from shortlist:' : 'Adding to shortlist:', profileId);
      
      // Get the button element and shortlist link
      const button = event.currentTarget;
      const card = button.closest('.househelp-card');
      const shortlistLink = document.getElementById('shortlist-link');
      
      if (isShortlisted) {
        // Remove from shortlist
        await shortlistService.deleteShortlist(profileId);
        
        console.log('Successfully removed from shortlist');
        setShortlistedProfiles(prev => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      } else {
        // Add to shortlist
        await shortlistService.createShortlist('', 'household', { profile_id: profileId, profile_type: 'househelp' });
        
        console.log('Successfully added to shortlist');
        setShortlistedProfiles(prev => new Set(prev).add(profileId));
        
        // Animate after successful API call
        if (card && shortlistLink) {
          // Get positions
          const cardRect = card.getBoundingClientRect();
          const linkRect = shortlistLink.getBoundingClientRect();
          
          // Create clone for animation
          const clone = card.cloneNode(true) as HTMLElement;
          clone.style.position = 'fixed';
          clone.style.top = `${cardRect.top}px`;
          clone.style.left = `${cardRect.left}px`;
          clone.style.width = `${cardRect.width}px`;
          clone.style.height = `${cardRect.height}px`;
          clone.style.zIndex = '9999';
          clone.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
          clone.style.pointerEvents = 'none';
          document.body.appendChild(clone);
          
          // Trigger animation
          requestAnimationFrame(() => {
            clone.style.top = `${linkRect.top + linkRect.height / 2}px`;
            clone.style.left = `${linkRect.left + linkRect.width / 2}px`;
            clone.style.width = '0px';
            clone.style.height = '0px';
            clone.style.opacity = '0';
            clone.style.transform = 'scale(0)';
          });
          
          // Remove clone after animation
          setTimeout(() => {
            if (document.body.contains(clone)) {
              document.body.removeChild(clone);
            }
          }, 600);
        }
      }
      
      // Trigger a custom event to update the shortlist count in Navigation
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (e) {
      console.error('Failed to toggle shortlist:', e);
      alert('Failed to update shortlist. Please check your connection and try again.');
    }
  };
  const [fields, setFields] = useState<HousehelpSearchFields>(initialFields);
  const [househelps, setHousehelps] = useState<HousehelpProfile[]>([]);

  // Fetch profile photos from documents table for all househelps
  const househelpUserIds = useMemo(() => househelps.map(h => h.user_id || String(h.id)).filter(Boolean), [househelps]);
  const profilePhotos = useProfilePhotos(househelpUserIds);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [shortlistedProfiles, setShortlistedProfiles] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const lastSetQueryRef = useRef<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  // Initialize from URL params on mount
  useEffect(() => {
    const fromParams = paramsToFields(searchParams, initialFields);
    setFields(fromParams);
    // Only search if there are URL params (user navigated with filters)
    if (searchParams.toString()) {
      handleSearch(undefined, fromParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load display preferences (onboarding, compact view, accessibility)
  useEffect(() => {
    let cancelled = false;

    const loadPrefs = async () => {
      try {
        const hiddenForSession = typeof window !== 'undefined' && sessionStorage.getItem("hide_onboarding_tips") === "1";
        const prefs = await fetchPreferences();
        if (cancelled) return;
        const settings = prefs?.settings || {};
        setCompactView(Boolean(settings.compact_view));
        setAccessibilityMode(Boolean(settings.accessibility_mode));
        if (!hiddenForSession) {
          setShowTips(Boolean(settings.show_onboarding));
        } else {
          setShowTips(false);
        }
      } catch {
        if (!cancelled) {
          setShowTips(false);
          setCompactView(false);
          setAccessibilityMode(false);
        }
      }
    };

    loadPrefs();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleDismissTips = () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem("hide_onboarding_tips", "1");
      }
    } catch {
      // ignore storage errors
    }
    setShowTips(false);
  };

  // React to back/forward changes in query params
  useEffect(() => {
    const currentQs = searchParams.toString();
    if (lastSetQueryRef.current === currentQs) {
      // Skip self-triggered updates
      lastSetQueryRef.current = null;
      return;
    }
    const fromParams = paramsToFields(searchParams, initialFields);
    setFields(fromParams);
    handleSearch(undefined, fromParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const handleFieldChange = (name: string, value: string) => {
    setFields(prev => ({ ...prev, [name]: value }));
  };

  const getTypeValue = () => {
    const liveIn = fields.offers_live_in === "true";
    const dayWorker = fields.offers_day_worker === "true";
    if (liveIn && !dayWorker) return "live_in";
    if (dayWorker && !liveIn) return "day_worker";
    return "";
  };

  const setTypeValue = (val: string) => {
    if (val === "live_in") {
      setFields(prev => ({ ...prev, offers_live_in: "true", offers_day_worker: "" }));
    } else if (val === "day_worker") {
      setFields(prev => ({ ...prev, offers_live_in: "", offers_day_worker: "true" }));
    } else {
      setFields(prev => ({ ...prev, offers_live_in: "", offers_day_worker: "" }));
    }
  };

  const parseExperienceMin = (val?: string) => {
    if (!val) return undefined;
    const parsed = parseInt(val, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  const deriveHousehelpType = (f: HousehelpSearchFields) => {
    const liveIn = f.offers_live_in === "true";
    const dayWorker = f.offers_day_worker === "true";
    if (liveIn && !dayWorker) return "live_in";
    if (dayWorker && !liveIn) return "day_worker";
    return f.househelp_type || undefined;
  };

  const buildCountPayload = (f: HousehelpSearchFields) => {
    return Object.fromEntries(
      Object.entries({
        ...f,
        experience: parseExperienceMin(f.experience),
        min_rating: f.min_rating ? Number(f.min_rating) : undefined,
        salary_min: f.salary_min ? Number(f.salary_min) : undefined,
        salary_max: f.salary_max ? Number(f.salary_max) : undefined,
        salary_expectation_min: f.salary_min ? Number(f.salary_min) : undefined,
        salary_expectation_max: f.salary_max ? Number(f.salary_max) : undefined,
        househelp_type: deriveHousehelpType(f),
        can_work_with_kids: f.can_work_with_kids === 'true' ? true : f.can_work_with_kids === 'false' ? false : undefined,
        can_work_with_pets: f.can_work_with_pets === 'true' ? true : f.can_work_with_pets === 'false' ? false : undefined,
        offers_live_in: f.offers_live_in === 'true' ? true : f.offers_live_in === 'false' ? false : undefined,
        offers_day_worker: f.offers_day_worker === 'true' ? true : f.offers_day_worker === 'false' ? false : undefined,
        available_from: f.available_from || undefined,
        min_age: f.min_age ? Number(f.min_age) : undefined,
        max_age: f.max_age ? Number(f.max_age) : undefined,
      }).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
  };

  useEffect(() => {
    if (countTimerRef.current) clearTimeout(countTimerRef.current);
    const payload = buildCountPayload(fields);
    countTimerRef.current = setTimeout(async () => {
      try {
        const count = await grpcProfileService.countHousehelps('', 'household', payload);
        setTotalCount(typeof count === 'number' ? count : 0);
      } catch (e) {
        setTotalCount(null);
      }
    }, 400);
    return () => {
      if (countTimerRef.current) clearTimeout(countTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // Fetch shortlist status for loaded profiles
  useEffect(() => {
    if (househelps.length === 0) return;
    
    const fetchShortlistStatus = async () => {
      try {
        const profileIds = househelps.map(h => h.profile_id).filter(Boolean);
        console.log('Fetching shortlist status for profiles:', profileIds);
        
        const results = await Promise.all(
          profileIds.map(async (profileId) => {
            try {
              const res = await shortlistService.shortlistExists('', profileId);
              const exists = res?.getExists?.() ?? res?.exists ?? false;
              console.log(`Profile ${profileId} shortlist status:`, exists);
              return { profileId, exists };
            } catch (err) {
              console.error(`Error checking shortlist for ${profileId}:`, err);
              return { profileId, exists: false };
            }
          })
        );
        
        const shortlisted = results.filter(r => r.exists).map(r => r.profileId);
        console.log('Shortlisted profiles:', shortlisted);
        
        setShortlistedProfiles(new Set(shortlisted));
      } catch (e) {
        console.error('Failed to fetch shortlist status:', e);
      }
    };
    
    fetchShortlistStatus();
  }, [househelps]);

  const handleSearch = async (e?: React.FormEvent, overrideFields?: HousehelpSearchFields) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const f = overrideFields || fields;
      setHasSearched(true);
      setOffset(0);
      setHasMore(true);

      // Persist filters to URL (only if there are actual filters)
      const filteredEntries = Object.entries(f).filter(([, v]) => v !== undefined && v !== null && v !== "");
      if (filteredEntries.length > 0) {
        const qs = new URLSearchParams(Object.fromEntries(filteredEntries)).toString();
        lastSetQueryRef.current = qs;
        setSearchParams(qs);
      } else {
        // No filters - clear URL params completely
        lastSetQueryRef.current = '';
        setSearchParams({});
      }

      const payload = Object.fromEntries(
        Object.entries({
          ...f,
          experience: parseExperienceMin(f.experience),
          min_rating: f.min_rating ? Number(f.min_rating) : undefined,
          salary_min: f.salary_min ? Number(f.salary_min) : undefined,
          salary_max: f.salary_max ? Number(f.salary_max) : undefined,
          salary_expectation_min: f.salary_min ? Number(f.salary_min) : undefined,
          salary_expectation_max: f.salary_max ? Number(f.salary_max) : undefined,
          househelp_type: deriveHousehelpType(f),
          can_work_with_kids: f.can_work_with_kids === 'true' ? true : f.can_work_with_kids === 'false' ? false : undefined,
          can_work_with_pets: f.can_work_with_pets === 'true' ? true : f.can_work_with_pets === 'false' ? false : undefined,
          offers_live_in: f.offers_live_in === 'true' ? true : f.offers_live_in === 'false' ? false : undefined,
          offers_day_worker: f.offers_day_worker === 'true' ? true : f.offers_day_worker === 'false' ? false : undefined,
          available_from: f.available_from || undefined,
          min_age: f.min_age ? Number(f.min_age) : undefined,
          max_age: f.max_age ? Number(f.max_age) : undefined,
          limit,
          offset: 0,
        }).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      const data = await grpcProfileService.searchHousehelps('', 'household', payload, limit, 0);
      console.log('Search househelps response:', data);
      const inner = data?.data || data;
      const rows: HousehelpProfile[] = Array.isArray(inner) ? inner : Array.isArray(inner?.data) ? inner.data : [];
      setHousehelps(rows);
      setHasMore(rows.length === limit);
    } catch (err) {
      console.error('Error loading househelps:', err);
      setError('Failed to load househelps');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFields(initialFields);
  };

  // Load more (infinite scroll)
  const loadMore = async () => {
    if (loading || !hasSearched || !hasMore) return;
    setLoading(true);
    try {
      const f = fields;
      const nextOffset = offset + limit;
      const payload = Object.fromEntries(
        Object.entries({
          ...f,
          experience: parseExperienceMin(f.experience),
          min_rating: f.min_rating ? Number(f.min_rating) : undefined,
          salary_min: f.salary_min ? Number(f.salary_min) : undefined,
          salary_max: f.salary_max ? Number(f.salary_max) : undefined,
          salary_expectation_min: f.salary_min ? Number(f.salary_min) : undefined,
          salary_expectation_max: f.salary_max ? Number(f.salary_max) : undefined,
          househelp_type: deriveHousehelpType(f),
          can_work_with_kids: f.can_work_with_kids === 'true' ? true : f.can_work_with_kids === 'false' ? false : undefined,
          can_work_with_pets: f.can_work_with_pets === 'true' ? true : f.can_work_with_pets === 'false' ? false : undefined,
          offers_live_in: f.offers_live_in === 'true' ? true : f.offers_live_in === 'false' ? false : undefined,
          offers_day_worker: f.offers_day_worker === 'true' ? true : f.offers_day_worker === 'false' ? false : undefined,
          available_from: f.available_from || undefined,
          min_age: f.min_age ? Number(f.min_age) : undefined,
          max_age: f.max_age ? Number(f.max_age) : undefined,
          limit,
          offset: nextOffset,
        }).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      const data = await grpcProfileService.searchHousehelps('', 'household', payload, limit, nextOffset);
      const inner = data?.data || data;
      const rows: HousehelpProfile[] = Array.isArray(inner) ? inner : Array.isArray(inner?.data) ? inner.data : [];
      setHousehelps(prev => [...prev, ...rows]);
      setOffset(nextOffset);
      setHasMore(rows.length === limit);
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Observe sentinel for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting) {
        loadMore();
      }
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, hasSearched, offset, loading, hasMore, fields]);

  // Helper: map URLSearchParams to fields
  function paramsToFields(sp: URLSearchParams, base: HousehelpSearchFields): HousehelpSearchFields {
    const keys = [
      'status','househelp_type','gender','experience','town','salary_frequency','skill','traits','min_rating','salary_min','salary_max','can_work_with_kids','can_work_with_pets','offers_live_in','offers_day_worker','available_from','language','min_age','max_age'
    ];
    const obj: Record<string, string> = {};
    keys.forEach(k => {
      const v = sp.get(k);
      if (v !== null) obj[k] = v;
    });
    return { ...base, ...obj } as HousehelpSearchFields;
  }

  const isHome1 = variant === 'home1';
  const isHome2 = variant === 'home2';
  const isHome3 = variant === 'home3';

  const gridClass = isHome2
    ? 'grid grid-cols-1 gap-4'
    : isHome3
      ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'
      : isHome1
        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'
        : `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compactView ? 'gap-4' : 'gap-6'}`;

  const cardTitleClass = isHome3 ? 'text-base' : isHome1 ? 'text-lg' : 'text-xl';
  const cardTextClass = isHome3 ? 'text-xs' : 'text-sm';
  const filterSectionClass = isHome1
    ? 'bg-white dark:bg-gradient-to-r dark:from-slate-900 dark:via-[#161625] dark:to-slate-900 rounded-3xl p-5 sm:p-7 mb-8 border border-purple-300/40 dark:border-purple-400/30 shadow-xl shadow-purple-300/25 dark:shadow-purple-500/20'
    : isHome2
      ? 'bg-white dark:bg-gradient-to-br dark:from-[#0f1020] dark:to-[#18182a] rounded-3xl p-5 sm:p-8 mb-8 border-2 border-purple-200/70 dark:border-purple-500/30 shadow-[0_20px_60px_rgba(26,26,46,0.35)]'
      : isHome3
        ? 'bg-white dark:bg-[#11131f]/95 rounded-2xl p-4 sm:p-5 mb-7 border border-purple-200/50 dark:border-purple-500/25 shadow-lg'
        : `bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 rounded-3xl ${compactView ? 'p-4 sm:p-6' : 'p-6 sm:p-8'} mb-8 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20 border-2 border-gray-200 dark:border-gray-700/50`;
  const controlsRowClass = isHome2
    ? 'mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end'
    : isHome3
      ? 'mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end'
      : 'mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end';
  const quickFilterGridClass = isHome2
    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4'
    : isHome3
      ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3'
      : 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4';
  const quickInputClass = isHome3
    ? 'w-full h-10 px-3 rounded-lg text-sm bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border border-purple-200/60 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
    : 'w-full h-12 px-4 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border border-purple-200/60 dark:border-purple-500/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500';
  const quickLabelClass = isHome3
    ? 'mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300'
    : 'mb-2 text-sm font-semibold text-gray-700 dark:text-white';

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 ${isHome3 ? 'py-6' : 'py-8'} ${accessibilityMode ? 'text-base sm:text-lg' : ''}`}>
          <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${isHome1 ? 'max-w-[88rem]' : isHome2 ? 'max-w-6xl' : 'max-w-7xl'}`}>
            {showTips && <OnboardingTipsBanner role="household" onDismiss={handleDismissTips} />}
            {/* Compact Filters Section */}
            <div className={filterSectionClass}>
              <div className={`flex ${isHome2 ? 'flex-col sm:flex-row sm:items-end' : 'items-center'} justify-between gap-3 mb-4`}>
                <div>
                  <h1 className={`${isHome3 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-bold text-gray-900 dark:text-white`}>Find Househelps</h1>
                  {(isHome1 || isHome2 || isHome3) && (
                    <p className={`${isHome3 ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-400 mt-1`}>
                      {isHome1 && 'Card grid style filter: wider controls and quick-action flow.'}
                      {isHome2 && 'Editorial style filter: guided search with roomy controls.'}
                      {isHome3 && 'Compact style filter: smaller type and dense arrangement.'}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className={`px-4 py-1 ${isHome3 ? 'text-xs rounded-lg' : 'rounded-xl'} bg-gray-100 dark:bg-purple-600/30 text-gray-700 dark:text-white font-semibold border border-gray-300 dark:border-purple-500/30 hover:bg-gray-200 dark:hover:bg-purple-600/50 transition`}
                >
                  More filters
                  </button>
                </div>
              <div className={quickFilterGridClass}>
                <div className="flex flex-col">
                  <label className={quickLabelClass}>Town</label>
                  <SearchableTownSelect
                    value={fields.town || ""}
                    onChange={(value) => handleFieldChange("town", value)}
                    target="househelps"
                    buttonClassName={quickInputClass}
                  />
                </div>
                <div className="flex flex-col">
                  <label className={quickLabelClass}>Type of Househelp</label>
                  <CustomSelect
                    value={getTypeValue()}
                    onChange={(val) => setTypeValue(val)}
                    options={[
                      { value: "", label: "Any" },
                      { value: "live_in", label: "Live-in" },
                      { value: "day_worker", label: "Day worker" },
                    ]}
                    placeholder="Any"
                  />
                </div>
                <div className="flex flex-col">
                  <label className={quickLabelClass}>Experience</label>
                  <CustomSelect
                    value={fields.experience || ""}
                    onChange={(val) => handleFieldChange('experience', val)}
                    options={EXPERIENCE_MIN_OPTIONS}
                    placeholder="Any"
                  />
                </div>
                <div className="flex flex-col">
                  <label className={quickLabelClass}>Skills / Can Help With</label>
                  <input
                    value={fields.skill || ""}
                    onChange={(e) => handleFieldChange('skill', e.target.value)}
                    className={quickInputClass}
                    placeholder="e.g. cooking, childcare"
                  />
                </div>
              </div>
              <div className={controlsRowClass}>
                <div className={`${isHome2 ? 'md:col-span-2' : 'sm:col-span-2'} flex items-center ${isHome3 ? 'text-sm' : ''}`}>
                  <span className="text-gray-700 dark:text-white font-medium">
                    Use quick filters above or open <span className="font-semibold">More filters</span> for advanced options.
                    {totalCount !== null ? ` ${totalCount} results` : ''}
                  </span>
                </div>
                <button
                  onClick={() => handleSearch()}
                  className={`w-full ${isHome3 ? 'px-4 py-2 text-sm rounded-lg' : 'px-8 py-1.5 rounded-xl'} font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl ${isHome3 ? '' : 'hover:scale-105'} focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-500`}
                >
                  Search
                </button>
              </div>
            </div>

            {/* Slide-over Drawer for full filters */}
            <SidePanel isOpen={showMoreFilters} onClose={() => setShowMoreFilters(false)} title="More Filters">
              <HousehelpMoreFilters
                fields={fields}
                onChange={handleFieldChange}
                onSearch={() => { setShowMoreFilters(false); handleSearch(); }}
                onClear={handleClear}
              />
            </SidePanel>

            <div className="mt-6 sm:mt-8">
              <h2 className={`${isHome3 ? 'text-xl' : 'text-2xl'} font-bold text-gray-900 dark:text-white mb-6`}>
                Available Househelps
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                  <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-1.053M18 8.25a3 3 0 11-6 0 3 3 0 016 0zM3.75 9.75a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Househelps Available</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                    We couldn't load househelp profiles right now. Please try again in a moment.
                  </p>
                  <button
                    onClick={() => handleSearch()}
                    className="mt-6 inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg text-sm"
                  >
                    Try Again
                  </button>
                </div>
              ) : !hasSearched ? (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-12 text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Ready to find your perfect househelp?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                    Use the filters above to search for househelps, or click Search to see all available profiles.
                  </p>
                  <button
                    onClick={() => handleSearch()}
                    className="inline-flex items-center px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Show All Househelps
                  </button>
                </div>
              ) : househelps.length === 0 ? (
                <div className="bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-2xl p-10 sm:p-14 text-center">
                  <div className="mx-auto mb-5 flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800">
                    <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Results Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
                    No househelps match your current filters. Try adjusting your search criteria or clear filters to see all profiles.
                  </p>
                </div>
              ) : (
                <div className={gridClass}>
                  {househelps.map((househelp) => (
                    <div
                      key={househelp.id}
                      onClick={() => househelp.profile_id && handleViewProfile(String(househelp.profile_id))}
                      className={`househelp-card relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 ${isHome2 ? 'p-4 sm:p-5' : isHome3 ? 'p-4' : compactView ? 'p-4' : 'p-6'} ${isHome2 ? 'hover:-translate-y-0.5' : 'hover:scale-105'} transition-all duration-300 cursor-pointer`}
                    >
                      {/* Top-right actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetUserId = househelp.user_id;
                            if (targetUserId) {
                              handleStartChat(String(targetUserId), househelp.profile_id);
                            }
                          }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-purple-700 dark:text-purple-200 shadow"
                          aria-label="Chat"
                          title="Chat"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (househelp.profile_id) handleShortlist(String(househelp.profile_id), e); }}
                          className={`inline-flex items-center justify-center w-9 h-9 rounded-full border shadow transition-all ${
                            shortlistedProfiles.has(househelp.profile_id)
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white hover:from-purple-700 hover:to-pink-700'
                              : 'bg-white/80 dark:bg-white/10 border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-pink-600 dark:text-pink-300'
                          }`}
                          aria-label={shortlistedProfiles.has(househelp.profile_id) ? "Remove from shortlist" : "Add to shortlist"}
                          title={shortlistedProfiles.has(househelp.profile_id) ? "Remove from shortlist" : "Add to shortlist"}
                        >
                          {shortlistedProfiles.has(househelp.profile_id) ? (
                            <HeartIconSolid className="w-5 h-5" />
                          ) : (
                            <HeartIcon className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      <div className={isHome2 ? 'flex items-start gap-4' : ''}>
                        {/* Profile Picture */}
                        <div className={`flex ${isHome2 ? 'justify-start' : 'justify-center'} ${isHome2 ? 'mb-0' : 'mb-4'} ${isHome2 ? 'shrink-0' : ''}`}>
                          <div className={`${isHome2 ? 'w-20 h-20' : isHome3 ? 'w-20 h-20' : 'w-24 h-24'} rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white ${isHome3 ? 'text-lg' : 'text-xl'} font-bold shadow-lg overflow-hidden relative`}>
                            {househelp.avatar_url || househelp.profile_picture || (househelp.photos && househelp.photos.length > 0) || profilePhotos[househelp.user_id || String(househelp.id)] ? (
                              <>
                                {imageLoadingStates[househelp.profile_id] !== false && (
                                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                                )}
                                <OptimizedImage
                                  path={
                                    (househelp.avatar_url as string) ||
                                    (househelp.profile_picture as string) ||
                                    (househelp.photos && househelp.photos[0]) ||
                                    profilePhotos[househelp.user_id || String(househelp.id)] ||
                                    ''
                                  }
                                  thumbnailPath={(househelp as any).thumbnail_path}
                                  mediumPath={(househelp as any).medium_path}
                                  alt={`${househelp.first_name} ${househelp.last_name}`}
                                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                                    imageLoadingStates[househelp.profile_id] === false ? 'opacity-100' : 'opacity-0'
                                  }`}
                                  onLoad={() => {
                                    setImageLoadingStates(prev => ({ ...prev, [househelp.profile_id]: false }));
                                  }}
                                  onError={(e: any) => {
                                    setImageLoadingStates(prev => ({ ...prev, [househelp.profile_id]: false }));
                                    e.currentTarget.style.display = 'none';
                                  }}
                                />
                              </>
                            ) : (
                              `${househelp.first_name?.[0] || ''}${househelp.last_name?.[0] || ''}`
                            )}
                          </div>
                        </div>

                        <div className={`min-w-0 ${isHome2 ? 'flex-1 pr-8' : ''}`}>
                          {/* Name */}
                          <h3 className={`${cardTitleClass} font-bold ${isHome2 ? 'text-left' : 'text-center'} text-gray-900 dark:text-white mb-2`}>
                            {househelp.first_name} {househelp.last_name}
                          </h3>

                          {(househelp.county_of_residence || househelp.location) && (
                            <p className={`${cardTextClass} text-gray-600 dark:text-gray-400 ${isHome2 ? 'text-left' : 'text-center'} mb-2`}>
                              📍 {househelp.county_of_residence || househelp.location}
                            </p>
                          )}

                          {((househelp.years_of_experience ?? househelp.experience) as number) > 0 && (
                            <p className={`${cardTextClass} text-purple-600 dark:text-purple-400 ${isHome2 ? 'text-left' : 'text-center'} mb-2`}>
                              ⭐ {househelp.years_of_experience ?? househelp.experience} years experience
                            </p>
                          )}

                          <p className={`${cardTextClass} font-semibold text-gray-700 dark:text-gray-300 ${isHome2 ? 'text-left' : 'text-center'} mb-2`}>
                            💰 {househelp.salary_expectation && Number(househelp.salary_expectation) > 0
                              ? `${househelp.salary_expectation}${househelp.salary_frequency ? ` per ${
                                  househelp.salary_frequency === 'daily' ? 'day' :
                                  househelp.salary_frequency === 'weekly' ? 'week' :
                                  househelp.salary_frequency === 'monthly' ? 'month' :
                                  househelp.salary_frequency
                                }` : ''}`
                              : 'Salary not yet specified'}
                          </p>

                          <div className={`flex flex-wrap gap-2 ${isHome2 ? 'justify-start' : 'justify-center'} mb-3`}>
                            {househelp.househelp_type && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                {househelp.househelp_type}
                              </span>
                            )}
                            {typeof househelp.can_work_with_kids === 'boolean' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                {househelp.can_work_with_kids ? 'Works with kids' : 'No kids'}
                              </span>
                            )}
                            {typeof househelp.can_work_with_pets === 'boolean' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                {househelp.can_work_with_pets ? 'Pet friendly' : 'No pets'}
                              </span>
                            )}
                            {(househelp.rating || househelp.review_count) && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300">
                                ★ {househelp.rating ? Number(househelp.rating).toFixed(1) : 'New'}{househelp.review_count ? ` (${househelp.review_count})` : ''}
                              </span>
                            )}
                            {typeof househelp.is_available === 'boolean' && (
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                {househelp.is_available ? 'Available now' : 'Busy'}
                              </span>
                            )}
                          </div>

                          {househelp.bio && (
                            <p className={`${cardTextClass} text-gray-600 dark:text-gray-400 ${isHome2 ? 'text-left' : 'text-center'} ${isHome3 ? 'line-clamp-2' : 'line-clamp-3'} mb-4`}>
                              {househelp.bio}
                            </p>
                          )}

                          <div className={`mt-3 flex items-center ${isHome2 ? 'justify-between' : 'justify-between'} gap-2`}>
                            <div className="text-xs text-gray-400">
                              {househelp.created_at ? `Joined ${new Date(househelp.created_at).toLocaleDateString()}` : ''}
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); if (househelp.profile_id) handleViewProfile(String(househelp.profile_id)); }}
                              className={`px-4 py-1 ${isHome3 ? 'text-xs' : 'text-sm'} bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition`}
                            >
                              View more
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
