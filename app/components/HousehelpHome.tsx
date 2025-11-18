import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import HouseholdFilters, { type HouseholdSearchFields } from "~/components/features/HouseholdFilters";
import { ChatBubbleLeftRightIcon, HeartIcon } from '@heroicons/react/24/outline';

interface HouseholdItem {
  id?: string; // household user id
  profile_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  town?: string;
  house_size?: string;
  verified?: boolean;
  created_at?: string;
}

export default function HousehelpHome() {
  type FilterState = HouseholdSearchFields & { town: string; house_size: string; verified: string };
  const [filters, setFilters] = useState<FilterState>({
    town: "",
    house_size: "",
    verified: "",
    has_kids: "",
    has_pets: "",
    type_of_househelp: "",
    available_from: "",
  });
  const [results, setResults] = useState<HouseholdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const countTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const API_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );
  const navigate = useNavigate();

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Actions
  const handleViewMore = (item: HouseholdItem) => {
    if (item?.id) {
      navigate(`/household/public-profile/${item.id}`);
    }
  };

  const handleStartChat = async (householdUserId?: string) => {
    try {
      if (!householdUserId) throw new Error('Missing user id');
      const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/start/household/${householdUserId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start conversation');
      const data = await apiClient.json<any>(res);
      const convId = (data && (data.id || data.ID || data.conversation_id)) as string | undefined;
      if (convId) navigate(`/inbox/${convId}`); else navigate('/inbox');
    } catch {
      navigate('/inbox');
    }
  };

  const handleShortlist = async (profileId: string) => {
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, profile_type: 'household' }),
      });
      if (res.ok) {
        alert('Added to shortlist');
      } else {
        alert('Shortlist for households will be available soon.');
      }
    } catch {
      alert('Shortlist for households will be available soon.');
    }
  };

  

  const handleFieldChange = (name: keyof HouseholdSearchFields, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toPayload = () => {
    const base: Record<string, any> = {
      town: filters.town || undefined,
      house_size: filters.house_size || undefined,
      verified: filters.verified === "true" ? true : filters.verified === "false" ? false : undefined,
      has_kids: filters.has_kids === "true" ? true : filters.has_kids === "false" ? false : undefined,
      has_pets: filters.has_pets === "true" ? true : filters.has_pets === "false" ? false : undefined,
      type_of_househelp: filters.type_of_househelp || undefined,
      available_from: filters.available_from || undefined,
      limit: 12,
      offset: 0,
    };
    return Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
  };

  const buildCountPayload = () => {
    const base: Record<string, any> = {
      town: filters.town || undefined,
      house_size: filters.house_size || undefined,
      verified: filters.verified === "true" ? true : filters.verified === "false" ? false : undefined,
      has_kids: filters.has_kids === "true" ? true : filters.has_kids === "false" ? false : undefined,
      has_pets: filters.has_pets === "true" ? true : filters.has_pets === "false" ? false : undefined,
      type_of_househelp: filters.type_of_househelp || undefined,
      available_from: filters.available_from || undefined,
    };
    return Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
  };

  const search = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/households/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toPayload()),
      });
      const data = await apiClient.json<any>(res);
      setResults((data?.data as HouseholdItem[]) || []);
    } catch (err: any) {
      setError(err.message || "Failed to load households");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced count updates on filter changes
  useEffect(() => {
    if (countTimerRef.current) clearTimeout(countTimerRef.current);
    const payload = buildCountPayload();
    countTimerRef.current = setTimeout(async () => {
      try {
        const res = await apiClient.auth(`${API_BASE}/api/v1/households/search/count`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await apiClient.json<{ count: number }>(res);
        setTotalCount(typeof data.count === "number" ? data.count : 0);
      } catch (e) {
        setTotalCount(null);
      }
    }, 400);
    return () => {
      if (countTimerRef.current) clearTimeout(countTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 mb-8 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Find Households</h1>
                <button
                  onClick={() => setShowMoreFilters(true)}
                  className="px-4 py-2 bg-white/15 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/25 transition"
                >
                  More filters
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 md:grid-cols-7 gap-4">
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">Town</label>
                  <select
                    name="town"
                    value={filters.town}
                    onChange={handleSelect}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  >
                    {['', 'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret', 'Thika'].map((t) => (
                      <option key={t} value={t}>
                        {t || 'Any'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">House Size</label>
                  <select
                    name="house_size"
                    value={filters.house_size}
                    onChange={handleSelect}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  >
                    {['', 'bedsitter', '1br', '2br', '3br+', 'mansion'].map((s) => (
                      <option key={s} value={s}>
                        {s || 'Any'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">Verified</label>
                  <select
                    name="verified"
                    value={filters.verified}
                    onChange={handleSelect}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  >
                    <option value="">Any</option>
                    <option value="true">Verified</option>
                    <option value="false">Not verified</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">Has Kids</label>
                  <select
                    name="has_kids"
                    value={filters.has_kids}
                    onChange={handleSelect}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">Has Pets</label>
                  <select
                    name="has_pets"
                    value={filters.has_pets}
                    onChange={handleSelect}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  >
                    <option value="">Any</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">Type of Househelp</label>
                  <select
                    name="type_of_househelp"
                    value={filters.type_of_househelp}
                    onChange={handleSelect}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  >
                    <option value="">Any</option>
                    <option value="live_in">Live-in</option>
                    <option value="day_worker">Day worker</option>
                  </select>
                </div>
                <div className="flex flex-col">
                  <label className="mb-2 text-sm font-semibold text-white">Available From</label>
                  <input
                    type="date"
                    name="available_from"
                    value={filters.available_from}
                    onChange={(e) => setFilters(prev => ({ ...prev, available_from: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-purple-300 shadow-md"
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-3">
                {totalCount !== null && (
                  <span className="text-white font-semibold">{totalCount} results</span>
                )}
                <button
                  onClick={search}
                  className="px-6 py-3 rounded-xl font-bold bg-white text-purple-700 border border-white/20 shadow-lg hover:bg-purple-50 transition-all dark:bg-white/90 dark:text-purple-700 dark:hover:bg-white focus:outline-none focus:ring-2 focus:ring-white/70 dark:shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                >
                  Search
                </button>
              </div>
            </div>

            {/* Slide-over Drawer for full filters */}
            {showMoreFilters && (
              <div className="fixed inset-0 z-50">
                <div className="absolute inset-0 bg-black/40" onClick={() => setShowMoreFilters(false)} />
                <div className="absolute right-0 top-24 sm:top-28 bottom-20 sm:bottom-24 w-full max-w-md bg-white dark:bg-[#13131a] shadow-xl rounded-l-3xl p-6 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">More Filters</h2>
                    <button onClick={() => setShowMoreFilters(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">✕</button>
                  </div>
                  <HouseholdFilters
                    fields={filters}
                    onChange={handleFieldChange}
                    onSearch={() => { setShowMoreFilters(false); search(); }}
                    onClear={() => setFilters((prev) => ({ ...prev, has_kids: "", has_pets: "", type_of_househelp: "", available_from: "" }))}
                  />
                </div>
              </div>
            )}

            <div className="mt-6 sm:mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Households</h2>
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : results.length === 0 ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">No households found. Try adjusting filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((r) => (
                    <div
                      key={r.profile_id}
                      onClick={() => handleViewMore(r)}
                      className="relative bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      {/* Top-right actions */}
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStartChat(r.id); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-purple-700 dark:text-purple-200 shadow"
                          aria-label="Chat"
                          title="Chat"
                        >
                          <ChatBubbleLeftRightIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleShortlist(r.profile_id); }}
                          className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-purple-200/60 dark:border-purple-500/30 hover:bg-white text-pink-600 dark:text-pink-300 shadow"
                          aria-label="Shortlist"
                          title="Shortlist"
                        >
                          <HeartIcon className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Avatar */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt={(r.first_name || 'H') + ' ' + (r.last_name || 'H')} className="w-full h-full object-cover" />
                          ) : (
                            `${r.first_name?.[0] || 'H'}${r.last_name?.[0] || 'H'}`
                          )}
                        </div>
                      </div>

                      {/* Name */}
                      <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                        {r.first_name} {r.last_name}
                      </h3>

                      {/* Town */}
                      {r.town && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-3">📍 {r.town}</p>
                      )}

                      {/* House size */}
                      {r.house_size && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-3">🏠 {r.house_size}</p>
                      )}

                      {/* Verified */}
                      {r.verified && (
                        <div className="text-center"><span className="inline-block text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Verified</span></div>
                      )}

                      {/* Bottom actions */}
                      <div className="mt-4 flex items-center justify-between">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleViewMore(r); }}
                          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition"
                        >
                          View more
                        </button>
                        <div className="text-xs text-gray-400">
                          {r.created_at ? new Date(r.created_at).toLocaleDateString() : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </div>
          </div>
          
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
