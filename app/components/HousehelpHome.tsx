import React, { useEffect, useMemo, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";

interface HouseholdItem {
  profile_id: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  town?: string;
  house_size?: string;
  verified?: boolean;
}

export default function HousehelpHome() {
  const [filters, setFilters] = useState({
    town: "",
    house_size: "",
    verified: "",
  });
  const [results, setResults] = useState<HouseholdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const toPayload = () => {
    const base: Record<string, any> = {
      town: filters.town || undefined,
      house_size: filters.house_size || undefined,
      verified: filters.verified === "true" ? true : filters.verified === "false" ? false : undefined,
      limit: 12,
      offset: 0,
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 mb-8 shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">Find Households</h1>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={search}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  Search
                </button>
              </div>
            </div>

            <div>
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
                      className="bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-6 hover:scale-105 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                          {r.avatar_url ? (
                            <img src={r.avatar_url} alt={(r.first_name || "H") + " " + (r.last_name || "H")} className="w-full h-full object-cover" />
                          ) : (
                            `${r.first_name?.[0] || 'H'}${r.last_name?.[0] || 'H'}`
                          )}
                        </div>
                        <div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            {r.first_name} {r.last_name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">{r.town || '-'}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">House size: {r.house_size || '-'}</div>
                      {r.verified && (
                        <span className="inline-block text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">Verified</span>
                      )}
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
