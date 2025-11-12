import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { API_BASE_URL } from '~/config/api';
import { apiClient } from '~/utils/apiClient';
import HousehelpFilters, { type HousehelpSearchFields } from "~/components/features/HousehelpFilters";

interface HousehelpProfile {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  years_of_experience?: number;
  experience?: number;
  salary_expectation?: string;
  salary_frequency?: string;
  location?: string;
  county_of_residence?: string;
  bio?: string;
}

export default function AuthenticatedHome() {
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
  const [fields, setFields] = useState<HousehelpSearchFields>(initialFields);
  const [househelps, setHousehelps] = useState<HousehelpProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const lastSetQueryRef = useRef<string | null>(null);

  // Initialize from URL params on mount
  useEffect(() => {
    const fromParams = paramsToFields(searchParams, initialFields);
    setFields(fromParams);
    // Kick off initial search with params
    handleSearch(undefined, fromParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleSearch = async (e?: React.FormEvent, overrideFields?: HousehelpSearchFields) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const f = overrideFields || fields;
      setHasSearched(true);
      setOffset(0);
      setHasMore(true);

      // Persist filters to URL
      const qs = new URLSearchParams(
        Object.fromEntries(
          Object.entries(f).filter(([, v]) => v !== undefined && v !== null && v !== "")
        )
      ).toString();
      lastSetQueryRef.current = qs;
      setSearchParams(qs);

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
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-6 sm:p-8 mb-8 shadow-lg">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                Find Your Perfect Househelp
              </h1>
              <p className="text-purple-100">Use the filters below to refine your search.</p>
            </div>

            <div className="mb-8">
              <HousehelpFilters
                fields={fields}
                onChange={handleFieldChange}
                onSearch={() => handleSearch()}
                onClear={handleClear}
              />
            </div>

            {/* Househelp Profiles Section */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Available Househelps
              </h2>

              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
                </div>
              ) : error ? (
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30 rounded-xl p-6 text-center">
                  <p className="text-red-600 dark:text-red-400">{error}</p>
                </div>
              ) : househelps.length === 0 ? (
                <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl p-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    No househelps available at the moment. Check back soon!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {househelps.map((househelp) => (
                    <div
                      key={househelp.id}
                      className="bg-white dark:bg-[#13131a] rounded-2xl shadow-light-glow-md dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-6 hover:scale-105 transition-all duration-300 cursor-pointer"
                    >
                      {/* Profile Picture */}
                      <div className="flex justify-center mb-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                          {househelp.profile_picture ? (
                            <img
                              src={househelp.profile_picture}
                              alt={`${househelp.first_name} ${househelp.last_name}`}
                              className="w-full h-full rounded-full object-cover"
                            />
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
                      {(househelp.years_of_experience ?? househelp.experience) && (
                        <p className="text-sm text-purple-600 dark:text-purple-400 text-center mb-3">
                          ⭐ {househelp.years_of_experience ?? househelp.experience} years experience
                        </p>
                      )}

                      {/* Salary */}
                      {househelp.salary_expectation && (
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 text-center mb-3">
                          💰 {househelp.salary_expectation}
                          {househelp.salary_frequency && ` per ${househelp.salary_frequency.replace('ly', '')}`}
                        </p>
                      )}

                      {/* Bio Preview */}
                      {househelp.bio && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 text-center line-clamp-2 mb-4">
                          {househelp.bio}
                        </p>
                      )}

                      {/* View Profile Button */}
                      <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all">
                        View Profile
                      </button>
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
