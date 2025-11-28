import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from '~/config/api';

// Dropdown-only options (no text inputs)
const TOWNS = ["", "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"];
const HOUSE_SIZES = ["", "bedsitter", "1br", "2br", "3br+", "mansion"];
const RATING_OPTS = ["", 5, 4, 3, 2, 1];
const NANNY_TYPES = ["", "dayburg", "sleeper"];
const PET_TYPES = ["", "cat", "dog", "bird", "fish", "other"];

export default function HousehelpFindHouseholds() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    town: "",
    house_size: "",
    verified: "",
    has_kids: "",
    has_pets: "",
    type_of_househelp: "",
    pet_type: "",
    min_rating: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const API_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toPayload = (offsetVal: number) => {
    const base: Record<string, any> = {
      town: filters.town || undefined,
      house_size: filters.house_size || undefined,
      verified: filters.verified === "true" ? true : filters.verified === "false" ? false : undefined,
      has_kids: filters.has_kids === "true" ? true : filters.has_kids === "false" ? false : undefined,
      has_pets: filters.has_pets === "true" ? true : filters.has_pets === "false" ? false : undefined,
      pet_type: filters.pet_type || undefined,
      type_of_househelp: filters.type_of_househelp || undefined,
      min_rating: filters.min_rating ? Number(filters.min_rating) : undefined,
      limit,
      offset: offsetVal,
    };
    // Remove undefined
    return Object.fromEntries(Object.entries(base).filter(([_, v]) => v !== undefined && v !== null && v !== ""));
  };

  const search = async () => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setOffset(0);
    setHasMore(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/api/v1/households/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(toPayload(0)),
      });
      if (!res.ok) throw new Error("Failed to fetch households");
      const data = await res.json();
      const rows = data.data || [];
      setResults(rows);
      setHasMore(rows.length === limit);
    } catch (err: any) {
      setError(err.message || "Failed to search");
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loading || !hasSearched || !hasMore) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const nextOffset = offset + limit;
      const res = await fetch(`${API_BASE}/api/v1/households/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(toPayload(nextOffset)),
      });
      if (!res.ok) throw new Error("Failed to fetch more results");
      const data = await res.json();
      const rows = data.data || [];
      setResults((prev) => [...prev, ...rows]);
      setOffset(nextOffset);
      setHasMore(rows.length === limit);
    } catch (err) {
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentinelRef.current, hasSearched, offset, loading, hasMore, filters]);

  return (
    <div className="w-full">
      {/* Filters header with gradient theme to match household page */}
      <div className="rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-pink-500 p-6 sm:p-8 shadow-2xl shadow-purple-500/30 mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">Find Households</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Town</label>
          <select name="town" value={filters.town} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">House Size</label>
          <select name="house_size" value={filters.house_size} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            {HOUSE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Verified</label>
          <select name="verified" value={filters.verified} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            <option value="">Any</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Has Kids</label>
          <select name="has_kids" value={filters.has_kids} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Has Pets</label>
          <select name="has_pets" value={filters.has_pets} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Pet Type</label>
          <select name="pet_type" value={filters.pet_type} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            {PET_TYPES.map((p) => (
              <option key={p} value={p}>
                {p || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Type of Househelp</label>
          <select name="type_of_househelp" value={filters.type_of_househelp} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            {NANNY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-white/90">Min Rating</label>
          <select name="min_rating" value={filters.min_rating} onChange={handleSelect} className="w-full h-12 px-4 py-3 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-inner backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition">
            {RATING_OPTS.map((r) => (
              <option key={r?.toString() || "any"} value={r?.toString() || ""}>
                {r ? `${r}+` : "Any"}
              </option>
            ))}
          </select>
        </div>
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={search} className="inline-flex items-center px-6 py-2.5 rounded-xl bg-white text-purple-700 font-semibold shadow hover:bg-purple-50 transition">
            Search
          </button>
        </div>
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}
      {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">{error}</div>}

      <div className="space-y-4">
        {!hasSearched && !loading && (
          <div className="text-center text-gray-500">Use the filters to find households.</div>
        )}
        {hasSearched && results.length === 0 && !loading && (
          <div className="text-center text-gray-500">No households found.</div>
        )}

        {results.map((r) => (
          <div
            key={r.profile_id}
            className="bg-black/60 dark:bg-[#0d0d15] border border-purple-800/40 rounded-2xl p-6 shadow-2xl shadow-purple-900/40 hover:shadow-purple-700 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                {r.avatar_url ? (
                  <img src={r.avatar_url} alt={`${r.first_name} ${r.last_name}`} className="w-full h-full object-cover" />
                ) : (
                  getInitials(r.first_name, r.last_name)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-white">{r.first_name} {r.last_name}</h3>
                  {r.verified && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      Verified
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm text-purple-100">
                  <div><span className="text-purple-300">Town</span><p className="font-medium text-white">{r.town || "-"}</p></div>
                  <div><span className="text-purple-300">House Size</span><p className="font-medium text-white">{r.house_size || "-"}</p></div>
                  <div><span className="text-purple-300">Kids</span><p className="font-medium text-white">{r.has_kids ? 'Yes' : 'No'}</p></div>
                </div>
              </div>
              <button
                onClick={() => navigate(`/household/public-profile?profile_id=${r.profile_id}`, {
                  state: { backTo: '/househelp/find-households', backLabel: 'Back to results' }
                })}
                className="ml-4 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                View more
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
