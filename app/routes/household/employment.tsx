import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import HousehelpFilters, { type HousehelpSearchFields } from "~/components/features/HousehelpFilters";
import { API_BASE_URL } from '~/config/api';
import { apiClient } from '~/utils/apiClient';

// Option constants now live within HousehelpFilters

const initialFields: HousehelpSearchFields = {
  status: "active",
  househelp_type: "",
  gender: "",
  experience: "",
  town: "",
  salary_frequency: "monthly",
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

export default function HouseholdEmployment() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<HousehelpSearchFields>(initialFields);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [shortlistCount, setShortlistCount] = useState<number>(0);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [shortlistProfiles, setShortlistProfiles] = useState<any[]>([]);
  const [shortlistProfilesLoading, setShortlistProfilesLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const API_BASE = useMemo(() => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL, []);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'find' | 'shortlist'>(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'shortlist' ? 'shortlist' : 'find';
  });

  // Keep tab in sync with query param
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam === 'shortlist' ? 'shortlist' : 'find');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);
  const timeAgo = (iso?: string) => {
    if (!iso) return '';
    const then = new Date(iso).getTime();
    const now = Date.now();
    const diff = Math.max(0, now - then);
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
  };

  const isNewHere = (iso?: string) => {
    if (!iso) return false;
    const then = new Date(iso).getTime();
    const days = (Date.now() - then) / (1000 * 60 * 60 * 24);
    return days < 7;
  };

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // No token - set empty shortlist for development
          setShortlistCount(0);
          setShortlist([]);
          return;
        }
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/household`, { method: 'GET' });
        if (!res.ok) throw new Error("Failed to fetch shortlist");
        const data = await apiClient.json<any[]>(res);
        setShortlistCount(Array.isArray(data) ? data.length : 0);
        setShortlist(Array.isArray(data) ? data : []);
      } catch (err) {
        // Gracefully handle errors - set empty state
        setShortlistCount(0);
        setShortlist([]);
      }
    };
    fetchShortlist();
  }, []);

  // Fetch full profiles when switching to shortlist tab
  useEffect(() => {
    const fetchProfiles = async () => {
      if (activeTab !== 'shortlist' || shortlist.length === 0) {
        setShortlistProfiles([]);
        return;
      }
      setShortlistProfilesLoading(true);
      try {
        const token = localStorage.getItem("token");
        const profile_ids = shortlist.map((s) => s.profile_id).filter(Boolean);
        if (!token || profile_ids.length === 0) {
          // No token or no profiles - set empty state
          setShortlistProfiles([]);
          setShortlistProfilesLoading(false);
          return;
        }
        const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/search_multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_type: "househelp", profile_ids }),
        });
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await apiClient.json<any[]>(res);
        setShortlistProfiles(Array.isArray(data) ? data : []);
      } catch (err) {
        // Gracefully handle errors - set empty state
        setShortlistProfiles([]);
      } finally {
        setShortlistProfilesLoading(false);
      }
    };
    fetchProfiles();
    // Only refetch when switching to shortlist tab or shortlist changes
  }, [activeTab, shortlist]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFields((prev: HousehelpSearchFields) => ({ ...prev, [name]: value }));
  };

  const handleFieldChange = (name: string, value: string) => {
    setFields((prev: HousehelpSearchFields) => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResults([]);
    setOffset(0);
    setHasMore(true);
    try {
      setHasSearched(true);
      const token = localStorage.getItem("token");
      
      // If no token, show a helpful message instead of error
      if (!token) {
        setError("Please log in to search for househelps");
        setLoading(false);
        return;
      }
      
      const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries({
              ...fields,
              experience: fields.experience ? Number(fields.experience) : undefined,
              min_rating: fields.min_rating ? Number(fields.min_rating) : undefined,
              salary_min: fields.salary_min ? Number(fields.salary_min) : undefined,
              salary_max: fields.salary_max ? Number(fields.salary_max) : undefined,
              can_work_with_kids: fields.can_work_with_kids === 'true' ? true : fields.can_work_with_kids === 'false' ? false : undefined,
              can_work_with_pets: fields.can_work_with_pets === 'true' ? true : fields.can_work_with_pets === 'false' ? false : undefined,
              offers_live_in: fields.offers_live_in === 'true' ? true : fields.offers_live_in === 'false' ? false : undefined,
              offers_day_worker: fields.offers_day_worker === 'true' ? true : fields.offers_day_worker === 'false' ? false : undefined,
              available_from: fields.available_from || undefined,
              limit,
              offset: 0,
            }).filter(([_, v]) => v !== undefined && v !== null && v !== "")
          )
        ),
      });
      if (!res.ok) throw new Error("Failed to fetch househelps");
      const data = await apiClient.json<{ data: any[] }>(res);
      const rows = data.data || [];
      setResults(rows);
      setHasMore(rows.length === limit);
    } catch (err: any) {
      setError(err.message || "Failed to search");
    } finally {
      setLoading(false);
    }
  };

  // Load more (infinite scroll)
  const loadMore = async () => {
    if (loading || !hasSearched || !hasMore) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const nextOffset = offset + limit;
      const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          Object.fromEntries(
            Object.entries({
              ...fields,
              experience: fields.experience ? Number(fields.experience) : undefined,
              min_rating: fields.min_rating ? Number(fields.min_rating) : undefined,
              salary_min: fields.salary_min ? Number(fields.salary_min) : undefined,
              salary_max: fields.salary_max ? Number(fields.salary_max) : undefined,
              can_work_with_kids: fields.can_work_with_kids === 'true' ? true : fields.can_work_with_kids === 'false' ? false : undefined,
              can_work_with_pets: fields.can_work_with_pets === 'true' ? true : fields.can_work_with_pets === 'false' ? false : undefined,
              offers_live_in: fields.offers_live_in === 'true' ? true : fields.offers_live_in === 'false' ? false : undefined,
              offers_day_worker: fields.offers_day_worker === 'true' ? true : fields.offers_day_worker === 'false' ? false : undefined,
              available_from: fields.available_from || undefined,
              limit,
              offset: nextOffset,
            }).filter(([_, v]) => v !== undefined && v !== null && v !== "")
          )
        ),
      });
      if (!res.ok) throw new Error("Failed to fetch more results");
      const data = await apiClient.json<{ data: any[] }>(res);
      const rows = data.data || [];
      setResults(prev => [...prev, ...rows]);
      setOffset(nextOffset);
      setHasMore(rows.length === limit);
    } catch (err) {
      // silently ignore
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Observe sentinel
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
  }, [sentinelRef.current, hasSearched, offset, loading, hasMore, fields]);

  return (
    <div className="w-full bg-white dark:bg-gradient-to-br dark:from-purple-900/20 dark:to-gray-800 rounded-3xl shadow-2xl shadow-purple-200/50 dark:shadow-purple-500/20 border-2 border-gray-200 dark:border-purple-500/30 p-6 sm:p-8">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-200 dark:border-slate-700 mb-6">
        <button
          className={`px-6 py-2 font-semibold text-base focus:outline-none transition border-b-2 ${activeTab === 'find' ? 'border-primary-600 text-primary-700 dark:text-primary-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-600'}`}
          onClick={() => setActiveTab('find')}
        >
          Find a househelp
        </button>
        <button
          className={`ml-2 px-6 py-2 font-semibold text-base focus:outline-none transition border-b-2 relative flex items-center ${activeTab === 'shortlist' ? 'border-primary-600 text-primary-700 dark:text-primary-300' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-primary-600'}`}
          onClick={() => setActiveTab('shortlist')}
        >
          My Shortlist
          <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-purple-600 rounded-full min-w-[1.5rem] min-h-[1.5rem]">
            {shortlistCount}
          </span>
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'find' && (
        <>
          <div className="flex gap-4 items-start">
            {/* Mobile open-filters button */}
            <div className="sm:hidden w-full">
              <button
                onClick={() => setFiltersOpen(true)}
                className="w-full mb-4 rounded-xl border-2 border-purple-300 text-purple-700 bg-purple-50 px-4 py-3 font-semibold"
              >
                Filter search
              </button>
            </div>

            {/* Sidebar (desktop) */}
            <div className="hidden sm:block shrink-0">
              <HousehelpFilters
                fields={fields}
                onChange={handleFieldChange}
                onSearch={() => handleSearch()}
                onClear={() => setFields(initialFields)}
              />
            </div>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {loading && <div className="text-center py-8">Loading...</div>}
              {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>}
              <div className="space-y-4">
                {!hasSearched && !loading && <div className="text-center text-gray-500">Customize your search to find househelps.</div>}
                {hasSearched && results.length === 0 && !loading && <div className="text-center text-gray-500">No househelps found.</div>}
                {results.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 rounded-lg p-4 shadow cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 transition"
                    onClick={() => navigate('/household/househelp/profile', { state: { profileId: h.profile_id } })}
                    role="button"
                    tabIndex={0}
                    onKeyPress={e => { if (e.key === 'Enter') navigate('/household/househelp/profile', { state: { profile: h.profile_id } }); }}
                    aria-label={`View profile of ${h.first_name} ${h.last_name}`}
                  >
                    <img src={h.avatar_url || "https://placehold.co/56x56?text=HH"} alt={h.first_name} className="w-14 h-14 rounded-full object-cover bg-gray-200" />
                    <div className="flex-1">
                      <div className="font-bold text-lg text-primary-700 dark:text-primary-200">{h.first_name} {h.last_name}</div>
                      <div className="text-gray-500 dark:text-gray-300 text-sm">
                        Salary: {h.salary_expectation && Number(h.salary_expectation) > 0 
                          ? `${h.salary_expectation} ${h.salary_frequency || ''}` 
                          : 'No salary expectations specified'}
                      </div>
                      <div className="text-gray-500 dark:text-gray-300 text-sm">Location: {h.county_of_residence || 'N/A'}</div>
                      <div className="text-xs text-gray-900 dark:text-gray-300 flex items-center gap-2">
                        <span>Joined: {timeAgo(h.created_at)}</span>
                        {isNewHere(h.created_at) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                            New here
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-1" />
            </div>
          </div>

          {/* Mobile drawer */}
          {filtersOpen && (
            <div className="fixed inset-0 z-40 sm:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
              <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs p-4">
                <HousehelpFilters
                  fields={fields}
                  onChange={handleFieldChange}
                  onSearch={() => { setFiltersOpen(false); handleSearch(); }}
                  onClose={() => setFiltersOpen(false)}
                  onClear={() => setFields(initialFields)}
                />
              </div>
            </div>
          )}
        </>
      )}
      {activeTab === 'shortlist' && (
        <div className="space-y-4">
          {shortlistProfilesLoading && <div className="text-center text-gray-500">Loading shortlist profiles...</div>}
          {!shortlistProfilesLoading && shortlist.length === 0 && (
            <div className="text-center py-12">
              <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">Your shortlist is empty</div>
              <div className="text-gray-400 text-sm">Start browsing househelps and add them to your shortlist to see them here.</div>
            </div>
          )}
          {!shortlistProfilesLoading && shortlistProfiles.length === 0 && shortlist.length > 0 && (
            <div className="text-center py-12">
              <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
              <div className="text-gray-500 text-lg mb-2">No profiles found</div>
              <div className="text-gray-400 text-sm">The househelps in your shortlist may no longer be available.</div>
            </div>
          )}
          {shortlistProfiles.map((h) => (
            <div
              key={h.id}
              className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 rounded-lg p-4 shadow cursor-pointer hover:bg-primary-50 dark:hover:bg-primary-900 transition"
              onClick={() => navigate(`/household/househelp/contact?profile_id=${h.profile_id}&tab=shortlist`)}
              role="button"
              tabIndex={0}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  navigate(`/household/househelp/contact?profile_id=${h.profile_id}&tab=shortlist`);
                }
              }}
              aria-label={`View profile of ${h.first_name} ${h.last_name}`}
            >
              <img src={h.avatar_url || "https://placehold.co/56x56?text=HH"} alt={h.first_name} className="w-14 h-14 rounded-full object-cover bg-gray-200" />
              <div className="flex-1">
                <div className="font-bold text-lg text-primary-700 dark:text-primary-200">{h.first_name} {h.last_name}</div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">
                  Salary: {h.salary_expectation && Number(h.salary_expectation) > 0 
                    ? `${h.salary_expectation} ${h.salary_frequency || ''}` 
                    : 'No salary expectations specified'}
                </div>
                <div className="text-gray-500 dark:text-gray-300 text-sm">Location: {h.county_of_residence || 'N/A'}</div>
              <div className="text-xs text-gray-900 dark:text-gray-300 flex items-center gap-2">
                <span>Joined: {timeAgo(h.created_at)}</span>
                {isNewHere(h.created_at) && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
                    New here
                  </span>
                )}
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
