import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";
import HousehelpFilters, { type HousehelpSearchFields } from "~/components/features/HousehelpFilters";
import { API_BASE_URL } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MapPinIcon, 
  BriefcaseIcon,
  StarIcon,
  HeartIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";

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
};

export default function Employment() {
  const navigate = useNavigate();
  const [fields, setFields] = useState<HousehelpSearchFields>(initialFields);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [shortlistCount, setShortlistCount] = useState<number>(0);
  const [shortlist, setShortlist] = useState<any[]>([]);
  const [shortlistProfiles, setShortlistProfiles] = useState<any[]>([]);
  const [shortlistProfilesLoading, setShortlistProfilesLoading] = useState(false);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
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

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // No token - set empty shortlist for development
          setShortlistCount(0);
          setShortlist([]);
          setShortlistedIds(new Set());
          return;
        }
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/household`, { method: 'GET' });
        if (!res.ok) throw new Error("Failed to fetch shortlist");
        const data = await apiClient.json<any[]>(res);
        setShortlistCount(Array.isArray(data) ? data.length : 0);
        setShortlist(Array.isArray(data) ? data : []);
        // Create a Set of shortlisted profile IDs for quick lookup
        const ids = new Set(Array.isArray(data) ? data.map(s => s.profile_id) : []);
        setShortlistedIds(ids);
      } catch (err) {
        // Gracefully handle errors - set empty state
        setShortlistCount(0);
        setShortlist([]);
        setShortlistedIds(new Set());
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

  // Handle shortlist toggle
  const handleShortlistToggle = async (profileId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to use shortlist feature");
      return;
    }

    const isShortlisted = shortlistedIds.has(profileId);

    try {
      if (isShortlisted) {
        // Remove from shortlist
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/${profileId}`, {
          method: 'DELETE',
        });
        if (!res.ok) throw new Error("Failed to remove from shortlist");
        
        // Update state
        setShortlistedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        setShortlistCount(prev => prev - 1);
        setShortlist(prev => prev.filter(s => s.profile_id !== profileId));
      } else {
        // Add to shortlist
        const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile_id: profileId,
            profile_type: 'househelp',
          }),
        });
        if (!res.ok) throw new Error("Failed to add to shortlist");
        
        // Update state
        setShortlistedIds(prev => new Set([...prev, profileId]));
        setShortlistCount(prev => prev + 1);
        setShortlist(prev => [...prev, { profile_id: profileId }]);
      }
    } catch (err: any) {
      console.error("Shortlist error:", err);
      alert(err.message || "Failed to update shortlist");
    }
  };

  return (
    <div className="w-full">
      {/* Header with Tabs */}
      <div className="bg-white dark:bg-[#13131a] rounded-t-2xl border-2 border-purple-200 dark:border-purple-500/20 px-6 py-4 shadow-lg mb-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4 flex-wrap">
            <button
              className={`px-6 py-2 font-semibold text-base rounded-lg transition-all ${
                activeTab === 'find' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
              onClick={() => setActiveTab('find')}
            >
              🔍 Find Househelps
            </button>
            <button
              className={`px-6 py-2 font-semibold text-base rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'shortlist' 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
              }`}
              onClick={() => setActiveTab('shortlist')}
            >
              <HeartSolidIcon className="w-5 h-5" />
              My Shortlist
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none bg-white text-purple-600 rounded-full min-w-[1.5rem]">
                {shortlistCount}
              </span>
            </button>
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setFiltersOpen(true)}
            className="lg:hidden px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold shadow-lg hover:bg-purple-700 transition-colors"
          >
            🔍 Filters
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex gap-0 bg-white dark:bg-[#13131a] border-x-2 border-b-2 border-purple-200 dark:border-purple-500/20 rounded-b-2xl shadow-xl overflow-hidden">
        {/* Collapsible Filter Sidebar - Desktop */}
        <aside 
          className={`
            hidden lg:flex flex-col bg-gradient-to-br from-purple-50 to-white dark:from-[#0a0a0f] dark:to-[#13131a] border-r-2 border-purple-200 dark:border-purple-500/20 
            transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-80 opacity-100'}
          `}
        >
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">
                  🔍 Filters
                </h2>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                  aria-label="Collapse sidebar"
                >
                  <ChevronLeftIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              <HousehelpFilters
                fields={fields}
                onChange={handleFieldChange}
                onSearch={() => handleSearch()}
                onClear={() => setFields(initialFields)}
              />
            </div>
          )}
        </aside>

        {/* Collapsed Sidebar Toggle Button */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="hidden lg:flex items-center justify-center w-12 bg-purple-600 hover:bg-purple-700 text-white transition-colors"
            aria-label="Expand sidebar"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-h-[600px] max-h-[calc(100vh-250px)]">
          {/* Content Area with Scroll */}
          <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-purple-50/30 via-white to-blue-50/30 dark:from-[#0a0a0f] dark:via-[#13131a] dark:to-[#0a0a0f]">
          {activeTab === 'find' && (
            <>
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl mb-6 text-center font-semibold">
                  {error}
                </div>
              )}

              {loading && !hasSearched && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold">Searching for househelps...</p>
                </div>
              )}

              {!hasSearched && !loading && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Start Your Search</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Use the filters to find the perfect househelp for your household</p>
                  <button
                    onClick={() => handleSearch()}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Search All Househelps
                  </button>
                </div>
              )}

              {hasSearched && results.length === 0 && !loading && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">😔</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Results Found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Try adjusting your filters to see more results</p>
                  <button
                    onClick={() => {
                      setFields(initialFields);
                      handleSearch();
                    }}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Clear Filters & Search Again
                  </button>
                </div>
              )}

              {/* Househelp Cards Grid */}
              {results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {results.map((h) => {
                    const isShortlisted = shortlistedIds.has(h.profile_id);
                    return (
                      <div
                        key={h.id}
                        className="group relative bg-white dark:bg-[#13131a] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
                        onClick={() => navigate('/household/househelp/profile', { state: { profileId: h.profile_id } })}
                      >
                        {/* Profile Image */}
                        <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden">
                          <img 
                            src={h.avatar_url || "https://placehold.co/400x300?text=Profile"} 
                            alt={`${h.first_name} ${h.last_name}`}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {/* Shortlist Button */}
                          <button
                            onClick={(e) => handleShortlistToggle(h.profile_id, e)}
                            className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-all ${
                              isShortlisted 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-white hover:bg-purple-50 text-gray-600'
                            }`}
                            aria-label={isShortlisted ? "Remove from shortlist" : "Add to shortlist"}
                          >
                            {isShortlisted ? (
                              <HeartSolidIcon className="w-6 h-6" />
                            ) : (
                              <HeartIcon className="w-6 h-6" />
                            )}
                          </button>
                        </div>

                        {/* Card Content */}
                        <div className="p-5">
                          {/* Name & Rating */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                                {h.first_name} {h.last_name}
                              </h3>
                              <div className="flex items-center gap-1">
                                <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                  {h.rating || '4.5'} ({h.review_count || 0} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Location & Experience */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                              <span className="text-sm">{h.county_of_residence || h.town || 'Location not specified'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <BriefcaseIcon className="w-5 h-5 flex-shrink-0" />
                              <span className="text-sm">{h.experience || 0} years experience</span>
                            </div>
                          </div>

                          {/* Salary */}
                          <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Salary Expectation</div>
                            <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                              KES {h.salary_expectation ? Number(h.salary_expectation).toLocaleString() : 'N/A'}
                              <span className="text-sm font-normal text-gray-600 dark:text-gray-400"> / {h.salary_frequency || 'month'}</span>
                            </div>
                          </div>

                          {/* Skills Tags */}
                          {h.skills && h.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {h.skills.slice(0, 3).map((skill: string, idx: number) => (
                                <span
                                  key={idx}
                                  className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {h.skills.length > 3 && (
                                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-full">
                                  +{h.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          )}

                          {/* View Profile Button */}
                          <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg">
                            View Full Profile
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loading More Indicator */}
              {loading && hasSearched && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">Loading more...</p>
                </div>
              )}

              {/* Infinite scroll sentinel */}
              <div ref={sentinelRef} className="h-4" />
            </>
          )}

          {activeTab === 'shortlist' && (
            <>
              {shortlistProfilesLoading && (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading your shortlist...</p>
                </div>
              )}

              {!shortlistProfilesLoading && shortlist.length === 0 && (
                <div className="text-center py-20">
                  <div className="mb-6">
                    <ShortlistPlaceholderIcon className="w-32 h-32 mx-auto text-purple-300 dark:text-purple-700" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">Your Shortlist is Empty</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Start browsing househelps and add them to your shortlist to see them here</p>
                  <button
                    onClick={() => setActiveTab('find')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Browse Househelps
                  </button>
                </div>
              )}

              {!shortlistProfilesLoading && shortlistProfiles.length === 0 && shortlist.length > 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No Profiles Found</h3>
                  <p className="text-gray-500 dark:text-gray-400">The househelps in your shortlist may no longer be available</p>
                </div>
              )}

              {/* Shortlist Cards Grid */}
              {shortlistProfiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {shortlistProfiles.map((h) => (
                    <div
                      key={h.id}
                      className="group relative bg-white dark:bg-[#13131a] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-purple-100 dark:border-purple-500/20 hover:border-purple-300 dark:hover:border-purple-500 cursor-pointer"
                      onClick={() => navigate(`/household/househelp/contact?profile_id=${h.profile_id}&tab=shortlist`)}
                    >
                      {/* Profile Image */}
                      <div className="relative h-48 bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden">
                        <img 
                          src={h.avatar_url || "https://placehold.co/400x300?text=Profile"} 
                          alt={`${h.first_name} ${h.last_name}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Remove from Shortlist Button */}
                        <button
                          onClick={(e) => handleShortlistToggle(h.profile_id, e)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
                          aria-label="Remove from shortlist"
                        >
                          <XMarkIcon className="w-6 h-6" />
                        </button>
                        {/* Shortlisted Badge */}
                        <div className="absolute top-3 left-3 px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                          ⭐ Shortlisted
                        </div>
                      </div>

                      {/* Card Content */}
                      <div className="p-5">
                        {/* Name & Rating */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                              {h.first_name} {h.last_name}
                            </h3>
                            <div className="flex items-center gap-1">
                              <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {h.rating || '4.5'} ({h.review_count || 0} reviews)
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Location & Experience */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <MapPinIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{h.county_of_residence || h.town || 'Location not specified'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <BriefcaseIcon className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{h.experience || 0} years experience</span>
                          </div>
                        </div>

                        {/* Salary */}
                        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Salary Expectation</div>
                          <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                            KES {h.salary_expectation ? Number(h.salary_expectation).toLocaleString() : 'N/A'}
                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400"> / {h.salary_frequency || 'month'}</span>
                          </div>
                        </div>

                        {/* Contact Button */}
                        <button className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg">
                          Contact Now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          </div>
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            onClick={() => setFiltersOpen(false)} 
          />
          
          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white dark:bg-[#13131a] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-[#13131a] border-b border-purple-200 dark:border-purple-500/20 p-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">
                🔍 Filters
              </h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-2 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="p-4">
              <HousehelpFilters
                fields={fields}
                onChange={handleFieldChange}
                onSearch={() => { 
                  setFiltersOpen(false); 
                  handleSearch(); 
                }}
                onClose={() => setFiltersOpen(false)}
                onClear={() => setFields(initialFields)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
