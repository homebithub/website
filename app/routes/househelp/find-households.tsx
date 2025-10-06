import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

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
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || "http://localhost:8080",
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
      const res = await fetch(`${API_BASE}/api/v1/employers/search`, {
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
      const res = await fetch(`${API_BASE}/api/v1/employers/search`, {
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
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
      <h1 className="text-xl font-bold text-primary-700 dark:text-primary-300 mb-4">Find Households</h1>

      {/* Filters (dropdowns only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-4 mb-4">
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Town</label>
          <select name="town" value={filters.town} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            {TOWNS.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">House Size</label>
          <select name="house_size" value={filters.house_size} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            {HOUSE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Verified</label>
          <select name="verified" value={filters.verified} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <option value="">Any</option>
            <option value="true">Verified</option>
            <option value="false">Not verified</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Has Kids</label>
          <select name="has_kids" value={filters.has_kids} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Has Pets</label>
          <select name="has_pets" value={filters.has_pets} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            <option value="">Any</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Pet Type</label>
          <select name="pet_type" value={filters.pet_type} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            {PET_TYPES.map((p) => (
              <option key={p} value={p}>
                {p || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Nanny Type</label>
          <select name="type_of_househelp" value={filters.type_of_househelp} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            {NANNY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t || "Any"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Min Rating</label>
          <select name="min_rating" value={filters.min_rating} onChange={handleSelect} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100">
            {RATING_OPTS.map((r) => (
              <option key={r?.toString() || "any"} value={r?.toString() || ""}>
                {r ? `${r}+` : "Any"}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mb-6">
        <button onClick={search} className="bg-primary text-white py-2 px-4 rounded-lg font-semibold shadow-md bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400">
          Search
        </button>
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
            className="flex items-center gap-4 bg-slate-50 dark:bg-slate-700 rounded-lg p-4 shadow"
          >
            <img
              src={r.avatar_url || "https://placehold.co/56x56?text=HH"}
              alt={r.first_name}
              className="w-14 h-14 rounded-full object-cover bg-gray-200"
            />
            <div className="flex-1">
              <div className="font-bold text-lg text-primary-700 dark:text-primary-200">
                {r.first_name} {r.last_name}
              </div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">Town: {r.town || "-"}</div>
              <div className="text-gray-500 dark:text-gray-300 text-sm">House size: {r.house_size || "-"}</div>
              {r.verified && (
                <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Verified</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-1" />
    </div>
  );
}
