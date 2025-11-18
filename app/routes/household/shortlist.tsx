import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { API_BASE_URL } from "~/config/api";
import { apiClient } from "~/utils/apiClient";
import ShortlistPlaceholderIcon from "~/components/features/ShortlistPlaceholderIcon";

// Types
type ShortlistItem = {
  id: string;
  profile_id: string;
  profile_type: string;
  household_id: string;
  user_id: string;
  is_locked: boolean;
  expires_at?: string | null;
  created_at: string;
};

export default function HouseholdShortlistPage() {
  const navigate = useNavigate();
  const API_BASE = useMemo(
    () => (typeof window !== "undefined" && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );

  const [items, setItems] = useState<ShortlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Map of profile_id -> househelp profile data
  const [profilesById, setProfilesById] = useState<Record<string, any>>({});
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [unlockStatus, setUnlockStatus] = useState<Record<string, { unlocked: boolean; unlocked_by_me: boolean }>>({});
  const [contactInfo, setContactInfo] = useState<Record<string, { phone?: string; email?: string }>>({});

  // Load shortlist entries (mine)
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.auth(
          `${API_BASE}/api/v1/shortlists/mine?offset=${offset}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Failed to load shortlist");
        const data = await apiClient.json<ShortlistItem[]>(res);
        if (cancelled) return;
        setItems((prev) => (offset === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === limit);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load shortlist");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [API_BASE, offset]);

  // Load househelp profiles for shortlist entries (only where profile_type === 'househelp')
  useEffect(() => {
    const missingIds = items
      .filter((s) => s.profile_type === "househelp")
      .map((s) => s.profile_id)
      .filter((pid) => pid && !(pid in profilesById));
    if (missingIds.length === 0) return;

    let cancelled = false;
    async function loadProfiles() {
      try {
        setLoadingProfiles(true);
        const res = await apiClient.auth(`${API_BASE}/api/v1/househelps/search_multiple`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_type: "househelp", profile_ids: missingIds }),
        });
        if (!res.ok) throw new Error("Failed to fetch profiles");
        const data = await apiClient.json<any[]>(res);
        if (cancelled) return;
        const next: Record<string, any> = { ...profilesById };
        for (const h of data || []) {
          if (h.profile_id) next[h.profile_id] = h;
        }
        setProfilesById(next);
      } catch {
        // noop; show empty
      } finally {
        if (!cancelled) setLoadingProfiles(false);
      }
    }
    loadProfiles();
    return () => {
      cancelled = true;
    };
  }, [items, API_BASE, profilesById]);

  // Fetch unlock status for each shortlisted househelp profile
  useEffect(() => {
    const pids = items
      .filter((s) => s.profile_type === "househelp")
      .map((s) => s.profile_id)
      .filter((pid) => pid && !(pid in unlockStatus));
    if (pids.length === 0) return;
    let cancelled = false;
    async function fetchStatuses() {
      try {
        const results = await Promise.all(
          pids.map(async (pid) => {
            const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/unlock-status/${pid}`);
            if (!res.ok) return { pid, data: { unlocked: false, unlocked_by_me: false } };
            const data = await apiClient.json<{ unlocked: boolean; unlocked_by_me: boolean }>(res);
            return { pid, data };
          })
        );
        if (cancelled) return;
        setUnlockStatus((prev) => {
          const next = { ...prev } as Record<string, { unlocked: boolean; unlocked_by_me: boolean }>;
          for (const r of results) next[r.pid] = { unlocked: !!(r as any).data.unlocked, unlocked_by_me: !!(r as any).data.unlocked_by_me };
          return next;
        });
      } catch {
        // ignore
      }
    }
    fetchStatuses();
    return () => { cancelled = true; };
  }, [items, API_BASE, unlockStatus]);

  async function handleRemove(profileId: string) {
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/${profileId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove from shortlist');
      setItems((prev) => prev.filter((s) => s.profile_id !== profileId));
    } catch {}
  }

  async function handleChatWithHousehelp(profileId?: string) {
    if (!profileId) return;
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/inbox/start/househelp/${profileId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to start chat');
      navigate('/inbox');
    } catch {}
  }

  async function handleUnlock(profileId?: string) {
    if (!profileId) return;
    try {
      const res = await apiClient.auth(`${API_BASE}/api/v1/shortlists/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId }),
      });
      if (!res.ok) throw new Error('Failed to unlock');
      const data = await apiClient.json<{ status: string; phone?: string; email?: string }>(res);
      setUnlockStatus((prev) => ({ ...prev, [profileId]: { unlocked: true, unlocked_by_me: true } }));
      setContactInfo((prev) => ({ ...prev, [profileId]: { phone: data.phone, email: data.email } }));
    } catch {}
  }

  // Infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;
    const el = sentinelRef.current;
    const io = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && !loading && hasMore) {
        setOffset((o) => o + limit);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low" className="flex-1 flex flex-col">
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6">My Shortlist</h1>

            {items.length === 0 && !loading && !error && (
              <div className="rounded-2xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-8 text-center">
                <ShortlistPlaceholderIcon className="w-20 h-20 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 text-lg">No shortlisted househelps yet.</p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300 mb-4">{error}</div>
            )}

            <ul className="space-y-3">
              {items
                .filter((s) => s.profile_type === "househelp")
                .map((s) => {
                  const h = profilesById[s.profile_id];
                  const us = unlockStatus[s.profile_id];
                  return (
                    <li
                      key={s.id}
                      className="rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] p-4 hover:bg-primary-50/40 dark:hover:bg-primary-900/20 transition"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={(h && h.avatar_url) || "https://placehold.co/56x56?text=HH"}
                          alt={(h && `${h.first_name || ""} ${h.last_name || ""}`) || "Househelp"}
                          className="w-14 h-14 rounded-full object-cover bg-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-lg text-primary-700 dark:text-primary-200 truncate">
                            {(h && `${h.first_name || ""} ${h.last_name || ""}`) || "Househelp"}
                          </div>
                          <div className="text-gray-500 dark:text-gray-300 text-sm">
                            Salary: {(h && h.salary_expectation) || "N/A"} {h && h.salary_frequency}
                          </div>
                          <div className="text-gray-500 dark:text-gray-300 text-sm">
                            Location: {(h && h.county_of_residence) || "N/A"}
                          </div>
                          <div className="mt-1 flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full border ${us && us.unlocked ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20' : 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20'}`}>
                              {us && us.unlocked ? 'Unlocked' : 'Locked'}
                            </span>
                            {us && us.unlocked && contactInfo[s.profile_id] && (
                              <span className="text-xs text-gray-600 dark:text-gray-300">
                                {contactInfo[s.profile_id].phone ? `Phone: ${contactInfo[s.profile_id].phone}` : ''}
                                {contactInfo[s.profile_id].email ? `${contactInfo[s.profile_id].phone ? ' • ' : ''}Email: ${contactInfo[s.profile_id].email}` : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 whitespace-nowrap">
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/household/househelp/contact?profile_id=${s.profile_id}`); }} className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700">View</button>
                          <button onClick={(e) => { e.stopPropagation(); handleChatWithHousehelp(s.profile_id); }} className="px-3 py-2 text-sm rounded-lg border-2 border-purple-300 text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300">Chat</button>
                          {!(us && us.unlocked) && (
                            <button onClick={(e) => { e.stopPropagation(); handleUnlock(s.profile_id); }} className="px-3 py-2 text-sm rounded-lg border-2 border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300">Unlock</button>
                          )}
                          <button onClick={(e) => { e.stopPropagation(); handleRemove(s.profile_id); }} className="px-3 py-2 text-sm rounded-lg border-2 border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-300">Remove</button>
                        </div>
                      </div>
                    </li>
                  );
                })}
            </ul>

            <div ref={sentinelRef} className="h-8" />
            {(loading || loadingProfiles) && (
              <div className="mt-4 text-center text-gray-600 dark:text-gray-300">Loading...</div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
