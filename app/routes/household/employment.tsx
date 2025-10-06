import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import ShortlistPlaceholderIcon from "../components/features/ShortlistPlaceholderIcon";
import { API_BASE_URL } from '~/config/api';

// Curated options to avoid free-text inputs
const TOWNS = ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Thika"];
const SKILLS = ["cooking", "cleaning", "babysitting", "laundry", "elderly care"];
const TRAITS = ["honest", "patient", "punctual", "organized", "friendly"];
const EXPERIENCES = Array.from({ length: 11 }, (_, i) => i); // 0..10
const GENDERS = ["", "male", "female"];
const NANNY_TYPES = ["", "dayburg", "sleeper"];

const initialFields = {
  status: "active",
  househelp_type: "",
  gender: "",
  experience: "",
  town: "",
  salary_frequency: "monthly",
  skill: "",
  traits: "",
  min_rating: "",
  sort: "popular",
  limit: 12,
};

export default function HouseholdEmployment() {
  const navigate = useNavigate();
  const [fields, setFields] = useState(initialFields);
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

  useEffect(() => {
    const fetchShortlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE}/api/v1/shortlists/employer`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch shortlist");
        const data = await res.json();
        setShortlistCount(Array.isArray(data) ? data.length : 0);
        setShortlist(Array.isArray(data) ? data : []);
      } catch (err) {
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
          setShortlistProfiles([]);
          setShortlistProfilesLoading(false);
          return;
        }
        const res = await fetch(`${API_BASE}/api/v1/househelps/search_multiple`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile_type: "househelp", profile_ids }),
        });
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await res.json();
        setShortlistProfiles(Array.isArray(data) ? data : []);
      } catch (err) {
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
    setFields((prev) => ({ ...prev, [name]: value }));
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
      const res = await fetch(`${API_BASE}/api/v1/househelps/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
      const data = await res.json();
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
      const res = await fetch(`${API_BASE}/api/v1/househelps/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
      const data = await res.json();
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
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
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
          <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-4 mb-8 w-full">
            <div className="flex flex-col">
              <label htmlFor="status" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Status</label>
              <select id="status" name="status" value={fields.status} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="househelp_type" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Nanny Type</label>
              <select id="househelp_type" name="househelp_type" value={fields.househelp_type} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                {NANNY_TYPES.map((t) => (<option key={t} value={t}>{t || 'Any'}</option>))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="gender" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Gender</label>
              <select id="gender" name="gender" value={fields.gender} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                {GENDERS.map((g) => (<option key={g} value={g}>{g || 'Any'}</option>))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="experience" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Experience (min)</label>
              <select id="experience" name="experience" value={fields.experience} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                {EXPERIENCES.map((y) => (<option key={y} value={y}>{y}</option>))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="town" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Town</label>
              <select id="town" name="town" value={fields.town} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                <option value="">Any</option>
                {TOWNS.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="salary_frequency" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Salary Frequency</label>
              <select id="salary_frequency" name="salary_frequency" value={fields.salary_frequency} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            {/* Advanced (collapsible in future) */}
            <div className="flex flex-col">
              <label htmlFor="skill" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Skill</label>
              <select id="skill" name="skill" value={fields.skill} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                <option value="">Any</option>
                {SKILLS.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="traits" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Trait</label>
              <select id="traits" name="traits" value={fields.traits} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                <option value="">Any</option>
                {TRAITS.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="min_rating" className="mb-1 text-sm font-medium text-gray-700 dark:text-gray-200">Min Rating</label>
              <select id="min_rating" name="min_rating" value={fields.min_rating} onChange={handleChange} className="w-full rounded-lg px-3 py-2 text-base border border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-400 transition">
                <option value="">Any</option>
                {[5,4,3,2,1].map((r) => (<option key={r} value={r}>{r}+</option>))}
              </select>
            </div>
            <div className="flex flex-col col-span-1 md:col-span-3 lg:col-span-4 justify-end">
              <label className="sr-only">Search</label>
              <button type="submit" className="bg-primary text-white py-2 rounded-lg font-semibold shadow-md bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-400 transition mt-auto">Search</button>
            </div>
          </form>
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
                  <div className="text-gray-500 dark:text-gray-300 text-sm">Salary: {h.salary_expectation || 'N/A'} {h.salary_frequency}</div>
                  <div className="text-gray-500 dark:text-gray-300 text-sm">Location: {h.county_of_residence || 'N/A'}</div>
                  <div className="text-gray-400 text-xs">Joined: {h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-1" />
        </>
      )}
      {activeTab === 'shortlist' && (
        <div className="space-y-4">
          {shortlistProfilesLoading && <div className="text-center text-gray-500">Loading shortlist profiles...</div>}
          {!shortlistProfilesLoading && shortlist.length === 0 && <div className="text-center text-gray-500">You have no househelps in your shortlist yet.</div>}
          {!shortlistProfilesLoading && shortlistProfiles.length === 0 && shortlist.length > 0 && (
            <div className="text-center text-gray-500">No profiles found for your shortlist.</div>
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
      <div className="text-gray-500 dark:text-gray-300 text-sm">Salary: {h.salary_expectation || 'N/A'} {h.salary_frequency}</div>
      <div className="text-gray-500 dark:text-gray-300 text-sm">Location: {h.county_of_residence || 'N/A'}</div>
      <div className="text-gray-400 text-xs">Joined: {h.created_at ? new Date(h.created_at).toLocaleDateString() : ''}</div>
    </div>
  </div>
))}

        </div>
      )}
    </div>
  );
}

