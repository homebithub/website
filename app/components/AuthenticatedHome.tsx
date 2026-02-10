import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useLocation, useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { API_BASE_URL, API_ENDPOINTS, NOTIFICATIONS_API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import { type HousehelpSearchFields } from "~/components/features/HousehelpFilters";
import HousehelpMoreFilters from "~/components/features/HousehelpMoreFilters";
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { TOWNS, SKILLS, EXPERIENCE_LEVELS } from '~/constants/profileOptions';
import OnboardingTipsBanner from "~/components/OnboardingTipsBanner";
import { fetchPreferences } from "~/utils/preferencesApi";

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
  created_at?: string;
}

export default function AuthenticatedHome() {
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
          const token = localStorage.getItem("token");
          if (!token) return;
          
          const res = await fetch(`${API_BASE_URL}/api/v1/profile/household/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            if (!cancelled) {
              setCurrentHouseholdProfileId(data?.id || data?.profile_id || null);
            }
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

      const payload: Record<string, any> = {
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

      const res = await apiClient.auth(`${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start conversation');

      let convId: string | undefined;
      try {
        const data = await apiClient.json<any>(res);
        convId = data?.id || data?.ID || data?.conversation_id;
      } catch {
        convId = undefined;
      }

      if (convId) {
        navigate(`/inbox?conversation=${convId}`);
      } else {
        navigate('/inbox');
      }
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
        const res = await apiClient.auth(`${API_ENDPOINTS.shortlists.base}/${profileId}`, {
          method: 'DELETE',
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to remove from shortlist' }));
          console.error('Remove shortlist error:', errorData);
          alert(errorData.message || 'Failed to remove from shortlist. Please try again.');
          return;
        }
        
        console.log('Successfully removed from shortlist');
        setShortlistedProfiles(prev => {
          const next = new Set(prev);
          next.delete(profileId);
          return next;
        });
      } else {
        // Add to shortlist
        const res = await apiClient.auth(`${API_ENDPOINTS.shortlists.base}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, profile_type: 'househelp' }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to add to shortlist' }));
          console.error('Shortlist error:', errorData);
          alert(errorData.message || 'Failed to add to shortlist. Please try again.');
          return;
        }
        
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
  const [showSkillsDropdown, setShowSkillsDropdown] = useState(false);
  const [skillSearchTerm, setSkillSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [showExperienceDropdown, setShowExperienceDropdown] = useState(false);
  const skillsDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const experienceDropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (skillsDropdownRef.current && !skillsDropdownRef.current.contains(event.target as Node)) {
        setShowSkillsDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
      if (experienceDropdownRef.current && !experienceDropdownRef.current.contains(event.target as Node)) {
        setShowExperienceDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFieldChange = (name: string, value: string) => {
    setFields(prev => ({ ...prev, [name]: value }));
  };

  // Helper to derive type value from offers_live_in and offers_day_worker
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

  // Filter skills based on search term
  const filteredSkills = SKILLS.filter(skill =>
    skill.toLowerCase().includes(skillSearchTerm.toLowerCase())
  );

  // Toggle skill selection
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const newSkills = prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      
      // Update the skill field with comma-separated values
      handleFieldChange('skill', newSkills.join(', '));
      return newSkills;
    });
  };

  // Initialize selected skills from fields.skill
  useEffect(() => {
    if (fields.skill) {
      const skills = fields.skill.split(',').map(s => s.trim()).filter(Boolean);
      setSelectedSkills(skills);
    } else {
      setSelectedSkills([]);
    }
  }, [fields.skill]);

  const buildCountPayload = (f: HousehelpSearchFields) => {
    return Object.fromEntries(
      Object.entries({
        ...f,
        experience: f.experience ? Number(f.experience) : undefined,
        min_rating: f.min_rating ? Number(f.min_rating) : undefined,
        salary_min: f.salary_min ? Number(f.salary_min) : undefined,
        salary_max: f.salary_max ? Number(f.salary_max) : undefined,
        can_work_with_kids: f.can_work_with_kids === 'true' ? true : f.can_work_with_kids === 'false' ? false : undefined,
        can_work_with_pets: f.can_work_with_pets === 'true' ? true : f.can_work_with_pets === 'false' ? false : undefined,
        offers_live_in: f.offers_live_in === 'true' ? true : f.offers_live_in === 'false' ? false : undefined,
        offers_day_worker: f.offers_day_worker === 'true' ? true : f.offers_day_worker === 'false' ? false : undefined,
        available_from: f.available_from || undefined,
      }).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
  };

  useEffect(() => {
    if (countTimerRef.current) clearTimeout(countTimerRef.current);
    const payload = buildCountPayload(fields);
    countTimerRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.auth(`${API_BASE_URL}/api/v1/househelps/search/count`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await apiClient.json<{ count: number }>(res);
        setTotalCount(typeof data.count === 'number' ? data.count : 0);
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
              const res = await apiClient.auth(API_ENDPOINTS.shortlists.exists(profileId));
              if (!res.ok) {
                console.log(`Profile ${profileId} not shortlisted (status: ${res.status})`);
                return { profileId, exists: false };
              }
              const data = await apiClient.json<{ exists: boolean }>(res);
              console.log(`Profile ${profileId} shortlist status:`, data.exists);
              return { profileId, exists: data.exists };
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
          experience: f.experience ? Number(f.experience) : undefined,
          min_rating: f.min_rating ? Number(f.min_rating) : undefined,
          salary_min: f.salary_min ? Number(f.salary_min) : undefined,
          salary_max: f.salary_max ? Number(f.salary_max) : undefined,
          can_work_with_kids: f.can_work_with_kids === 'true' ? true : f.can_work_with_kids === 'false' ? false : undefined,
          can_work_with_pets: f.can_work_with_pets === 'true' ? true : f.can_work_with_pets === 'false' ? false : undefined,
          offers_live_in: f.offers_live_in === 'true' ? true : f.offers_live_in === 'false' ? false : undefined,
          offers_day_worker: f.offers_day_worker === 'true' ? true : f.offers_day_worker === 'false' ? false : undefined,
          available_from: f.available_from || undefined,
          limit,
          offset: 0,
        }).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      const res = await apiClient.auth(`${API_BASE_URL}/api/v1/househelps/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await apiClient.json<{ data: HousehelpProfile[] }>(res);
      const rows = data.data || [];
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
          experience: f.experience ? Number(f.experience) : undefined,
          min_rating: f.min_rating ? Number(f.min_rating) : undefined,
          salary_min: f.salary_min ? Number(f.salary_min) : undefined,
          salary_max: f.salary_max ? Number(f.salary_max) : undefined,
          can_work_with_kids: f.can_work_with_kids === 'true' ? true : f.can_work_with_kids === 'false' ? false : undefined,
          can_work_with_pets: f.can_work_with_pets === 'true' ? true : f.can_work_with_pets === 'false' ? false : undefined,
          offers_live_in: f.offers_live_in === 'true' ? true : f.offers_live_in === 'false' ? false : undefined,
          offers_day_worker: f.offers_day_worker === 'true' ? true : f.offers_day_worker === 'false' ? false : undefined,
          available_from: f.available_from || undefined,
          limit,
          offset: nextOffset,
        }).filter(([, v]) => v !== undefined && v !== null && v !== "")
      );
      const res = await apiClient.auth(`${API_BASE_URL}/api/v1/househelps/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await apiClient.json<{ data: HousehelpProfile[] }>(res);
      const rows = data.data || [];
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
      'status','househelp_type','gender','experience','town','salary_frequency','skill','traits','min_rating','salary_min','salary_max','can_work_with_kids','can_work_with_pets','offers_live_in','offers_day_worker','available_from'
    ];
    const obj: Record<string, string> = {};
    keys.forEach(k => {
      const v = sp.get(k);
      if (v !== null) obj[k] = v;
    });
    return { ...base, ...obj } as HousehelpSearchFields;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className={`flex-1 py-8 ${accessibilityMode ? 'text-base sm:text-lg' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {showTips && <OnboardingTipsBanner role="household" onDismiss={handleDismissTips} />}
            {/* Compact Filters Section */}
            <div className={`bg-white dark:bg-gradient-to-r dark:from-gray-800 dark:to-gray-900 rounded-3xl ${compactView ? 'p-4 sm:p-6' : 'p-6 sm:p-8'} mb-8 shadow-lg shadow-purple-200/50 dark:shadow-purple-500/20 border-2 border-gray-200 dark:border-gray-700/50`}>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Find Househelps</h1>
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className="px-4 py-1 bg-gray-100 dark:bg-purple-600/30 text-gray-700 dark:text-white font-semibold rounded-xl border border-gray-300 dark:border-purple-500/30 hover:bg-gray-200 dark:hover:bg-purple-600/50 transition"
                >
                  More filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col relative" ref={typeDropdownRef}>
                  <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Type of Househelp</label>
                  <div className="relative">
                    <div
                      onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                      className="w-full h-12 px-4 py-1.5 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
                    >
                      <span className={getTypeValue() ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                        {getTypeValue() === 'live_in' ? 'Live-in' : getTypeValue() === 'day_worker' ? 'Day worker' : 'Any'}
                      </span>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showTypeDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg overflow-hidden">
                        {[
                          { value: '', label: 'Any' },
                          { value: 'live_in', label: 'Live-in' },
                          { value: 'day_worker', label: 'Day worker' }
                        ].map((option) => (
                          <div
                            key={option.value}
                            onClick={() => {
                              setTypeValue(option.value);
                              setShowTypeDropdown(false);
                            }}
                            className="px-4 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          >
                            {option.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col relative" ref={experienceDropdownRef}>
                  <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Experience</label>
                  <div className="relative">
                    <div
                      onClick={() => setShowExperienceDropdown(!showExperienceDropdown)}
                      className="w-full h-12 px-4 py-1.5 rounded-xl text-base bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 border-2 border-transparent focus-within:border-purple-500 shadow-md cursor-pointer flex items-center justify-between"
                    >
                      <span className={fields.experience ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-300'}>
                        {fields.experience ? EXPERIENCE_LEVELS.find(l => l.value === fields.experience)?.label : 'Any'}
                      </span>
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    {showExperienceDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        <div
                          onClick={() => {
                            handleFieldChange('experience', '');
                            setShowExperienceDropdown(false);
                          }}
                          className="px-4 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800"
                        >
                          Any
                        </div>
                        {EXPERIENCE_LEVELS.map((level) => (
                          <div
                            key={level.value}
                            onClick={() => {
                              handleFieldChange('experience', level.value);
                              setShowExperienceDropdown(false);
                            }}
                            className="px-4 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                          >
                            {level.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col relative" ref={skillsDropdownRef}>
                  <label className="mb-2 text-sm font-semibold text-gray-700 dark:text-white">Skills / Can Help With</label>
                  <div className="relative">
                    <div
                      onClick={() => setShowSkillsDropdown(!showSkillsDropdown)}
                      className="w-full min-h-[48px] px-4 py-1 rounded-xl text-base bg-white dark:bg-[#13131a] border-2 border-transparent focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-300 shadow-md cursor-pointer"
                    >
                      {selectedSkills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {selectedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-xl text-sm font-medium"
                            >
                              {skill}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSkill(skill);
                                }}
                                className="hover:text-purple-900 dark:hover:text-purple-100"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">Select skills...</span>
                      )}
                    </div>
                    {showSkillsDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#13131a] border-2 border-purple-200 dark:border-purple-500/30 rounded-xl shadow-lg max-h-60 overflow-hidden flex flex-col">
                        {/* Search input */}
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <input
                            type="text"
                            value={skillSearchTerm}
                            onChange={(e) => setSkillSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1a1a1f] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            placeholder="Search skills..."
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        {/* Skills list */}
                        <div className="overflow-y-auto max-h-48">
                          {filteredSkills.length > 0 ? (
                            filteredSkills.map((skill) => (
                              <label
                                key={skill}
                                className="flex items-center gap-3 px-4 py-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedSkills.includes(skill)}
                                  onChange={() => toggleSkill(skill)}
                                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span>{skill}</span>
                              </label>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                              No skills found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div className="sm:col-span-2 flex items-center">
                  {totalCount !== null && (
                    <span className="text-gray-700 dark:text-white font-semibold">{totalCount} results</span>
                  )}
                </div>
                <button
                  onClick={() => handleSearch()}
                  className="w-full px-8 py-1.5 rounded-xl font-bold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-500"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Slide-over Drawer for full filters */}
            {showMoreFilters && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowMoreFilters(false)} />
                <div className="absolute right-0 top-24 sm:top-28 bottom-20 sm:bottom-24 w-full max-w-md bg-white dark:bg-gradient-to-br dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f] shadow-xl rounded-l-3xl p-6 overflow-y-auto border-2 border-gray-200 dark:border-purple-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">More Filters</h2>
                    <button onClick={() => setShowMoreFilters(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">✕</button>
                  </div>
                  <HousehelpMoreFilters
                    fields={fields}
                    onChange={handleFieldChange}
                    onSearch={() => { setShowMoreFilters(false); handleSearch(); }}
                    onClear={handleClear}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 sm:mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Available Househelps
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <ErrorAlert message={error} />
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
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
                    No househelps found matching your criteria.
                  </p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">
                    Try adjusting your filters or search again.
                  </p>
                </div>
              ) : (
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compactView ? 'gap-4' : 'gap-6'}`}>
                  {househelps.map((househelp) => (
                    <div
                      key={househelp.id}
                      onClick={() => househelp.profile_id && handleViewProfile(String(househelp.profile_id))}
                      className={`househelp-card relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 ${compactView ? 'p-4' : 'p-6'} hover:scale-105 transition-all duration-300 cursor-pointer`}
                    >
                      {/* Top-right actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const targetUserId = househelp.user_id || househelp.id;
                            if (targetUserId && househelp.profile_id) {
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
                      {/* Profile Picture */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg overflow-hidden relative">
                          {househelp.avatar_url || househelp.profile_picture || (househelp.photos && househelp.photos.length > 0) ? (
                            <>
                              {/* Skeleton loader - shows while image is loading */}
                              {imageLoadingStates[househelp.profile_id] !== false && (
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                              )}
                              <img
                                src={
                                  (househelp.avatar_url as string) || 
                                  (househelp.profile_picture as string) || 
                                  (househelp.photos && househelp.photos[0]) || 
                                  ''
                                }
                                alt={`${househelp.first_name} ${househelp.last_name}`}
                                className={`w-full h-full object-cover transition-opacity duration-300 ${
                                  imageLoadingStates[househelp.profile_id] === false ? 'opacity-100' : 'opacity-0'
                                }`}
                                onLoad={() => {
                                  setImageLoadingStates(prev => ({ ...prev, [househelp.profile_id]: false }));
                                }}
                                onError={(e) => {
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

                      {/* Name */}
                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {househelp.first_name} {househelp.last_name}
                      </h3>

                      {/* Location */}
                      {(househelp.county_of_residence || househelp.location) && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">
                          📍 {househelp.county_of_residence || househelp.location}
                        </p>
                      )}

                      {/* Experience */}
                      {((househelp.years_of_experience ?? househelp.experience) as number) > 0 && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-3">
                          ⭐ {househelp.years_of_experience ?? househelp.experience} years experience
                        </p>
                      )}

                      {/* Salary */}
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-3">
                        💰 {househelp.salary_expectation && Number(househelp.salary_expectation) > 0 
                          ? `${househelp.salary_expectation}${househelp.salary_frequency ? ` per ${
                              househelp.salary_frequency === 'daily' ? 'day' :
                              househelp.salary_frequency === 'weekly' ? 'week' :
                              househelp.salary_frequency === 'monthly' ? 'month' :
                              househelp.salary_frequency
                            }` : ''}`
                          : 'No salary expectations specified'}
                      </p>

                      {/* Bio Preview */}
                      {househelp.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-2 mb-4">
                          {househelp.bio}
                        </p>
                      )}

                      {/* Bottom actions */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-xs text-gray-400">
                          {househelp.created_at ? new Date(househelp.created_at).toLocaleDateString() : ''}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); if (househelp.profile_id) handleViewProfile(String(househelp.profile_id)); }}
                          className="px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
                        >
                          View more
                        </button>
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
