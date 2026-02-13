import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_BASE_URL, API_ENDPOINTS, NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import ShowInterestModal from '~/components/modals/ShowInterestModal';
import { MessageCircle, Heart, HandHeart } from "lucide-react";

interface HouseholdData {
  id?: string;
  user_id?: string;
  owner_user_id?: string;
  owner?: { id?: string; first_name?: string; last_name?: string; avatar_url?: string };
  // From embedded Profile
  town?: string;
  address?: string;
  bio?: string;
  status?: string;
  avatar_url?: string;
  location?: any;
  verified?: boolean;
  premium?: boolean;
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
  // Household-specific
  house_size?: string;
  household_notes?: string;
  is_shared?: boolean;
  member_count?: number;
  // Service Requirements
  needs_live_in?: boolean;
  live_in_off_days?: string[];
  needs_day_worker?: boolean;
  day_worker_schedule?: any;
  available_from?: string;
  chores?: string[];
  househelp_ids?: string[];
  // Budget
  budget_min?: number;
  budget_max?: number;
  salary_frequency?: string;
  // Preferences
  religion?: string;
  photos?: string[];
}

export default function HouseholdPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isEmbed = params.get("embed") === "1" || params.get("embed") === "true";
  const navigationState = (location.state ?? {}) as {
    profileId?: string;
    backTo?: string;
    backLabel?: string;
    fromInbox?: boolean;
    fromShortlist?: boolean;
    fromHireRequests?: boolean;
  };
  const currentUserId = useMemo(() => {
    try {
      const raw = localStorage.getItem("user_object");
      return raw ? JSON.parse(raw)?.id ?? null : null;
    } catch {
      return null;
    }
  }, []);
  const [viewerProfileType, setViewerProfileType] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user_object");
      if (raw) {
        const parsed = JSON.parse(raw);
        setViewerProfileType(parsed?.profile_type || null);
      }
    } catch {
      setViewerProfileType(null);
    }
  }, []);
  const resolvedUserId =
    params.get("user_id") ||
    params.get("profile_id") ||
    params.get("profileId") ||
    navigationState.profileId ||
    currentUserId;
  const [profile, setProfile] = useState<HouseholdData | null>(null);
  const [kids, setKids] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [isInterestModalOpen, setIsInterestModalOpen] = useState(false);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        if (!resolvedUserId) throw new Error("Missing household user id");

        const profileRes = await fetch(`${API_BASE_URL}/api/v1/profile/household/${resolvedUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileRaw = await profileRes.json();
        const profileData = profileRaw?.data?.data || profileRaw?.data || profileRaw;
        setProfile(profileData);

        try {
          const petsRes = await fetch(`${API_BASE_URL}/api/v1/pets/user/${resolvedUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (petsRes.ok) {
            const petsRaw = await petsRes.json();
            const petsData = petsRaw?.data?.data || petsRaw?.data || petsRaw;
            setPets(Array.isArray(petsData) ? petsData : []);
          }
        } catch (err) {
          console.error("Failed to fetch pets:", err);
        }

        try {
          const kidsRes = await fetch(`${API_BASE_URL}/api/v1/household_kids/user/${resolvedUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (kidsRes.ok) {
            const kidsRaw = await kidsRes.json();
            const kidsData = kidsRaw?.data?.data || kidsRaw?.data || kidsRaw;
            setKids(Array.isArray(kidsData) ? kidsData : []);
          }
        } catch (err) {
          console.error("Failed to fetch kids:", err);
        }
      } catch (err: any) {
        console.error("Error loading household profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [resolvedUserId, currentUserId]);

  const isViewingOwn = !!currentUserId && resolvedUserId === currentUserId;
  const viewerType = viewerProfileType?.toLowerCase();
  const canInteract = viewerType === "househelp" && !isViewingOwn;
  const canShortlist = canInteract && !!profile?.id;
  const canChat = canInteract && !!resolvedUserId;

  useEffect(() => {
    if (!canShortlist || !profile?.id) {
      setIsShortlisted(false);
      return;
    }

    let cancelled = false;
    const checkShortlist = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/v1/shortlists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.ok) {
          const raw = await res.json();
          const items = raw?.data?.data || raw?.data || raw || [];
          const ids = new Set(
            (Array.isArray(items) ? items : []).map((s: any) => s.profile_id).filter(Boolean)
          );
          setIsShortlisted(ids.has(profile.id));
        }
      } catch (err) {
        console.error("Failed to fetch shortlist status", err);
      }
    };
    checkShortlist();
    return () => {
      cancelled = true;
    };
  }, [canShortlist, profile?.id]);

  // Check if househelp has already expressed interest
  useEffect(() => {
    if (!canInteract || !profile?.id) {
      setHasExpressedInterest(false);
      return;
    }

    let cancelled = false;
    const checkInterest = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await fetch(API_ENDPOINTS.interests.exists(profile.id!), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setHasExpressedInterest(Boolean(data?.exists));
        }
      } catch (err) {
        console.error("Failed to check interest status", err);
      }
    };
    checkInterest();
    return () => {
      cancelled = true;
    };
  }, [canInteract, profile?.id]);

  const handleBackNavigation = () => {
    if (navigationState.backTo) {
      navigate(navigationState.backTo);
      return;
    }
    if (navigationState.fromInbox) {
      navigate('/inbox');
      return;
    }
    if (navigationState.fromShortlist) {
      navigate('/shortlist');
      return;
    }
    if (navigationState.fromHireRequests) {
      navigate('/househelp/hire-requests');
      return;
    }
    if (isViewingOwn) {
      navigate('/household/profile');
      return;
    }
    navigate(-1);
  };

  const backLabel =
    navigationState.backLabel ||
    (navigationState.fromInbox
      ? 'Back to Inbox'
      : navigationState.fromShortlist
      ? 'Back to Shortlist'
      : navigationState.fromHireRequests
      ? 'Back to Hiring'
      : isViewingOwn
      ? 'Back to My Profile'
      : 'Back');

  const handleToggleShortlist = async () => {
    if (!profile?.id) return;
    setActionLoading('shortlist');
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      if (isShortlisted) {
        const res = await fetch(`${API_BASE_URL}/api/v1/shortlists/${profile.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to remove from shortlist');
        setIsShortlisted(false);
      } else {
        const res = await fetch(`${API_BASE_URL}/api/v1/shortlists`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profile_id: profile.id, profile_type: 'household' }),
        });
        if (!res.ok) throw new Error('Failed to add to shortlist');
        setIsShortlisted(true);
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err) {
      console.error('Failed to update shortlist', err);
      alert(err instanceof Error ? err.message : 'Failed to update shortlist');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = async () => {
    if (!resolvedUserId || !currentUserId) return;
    setActionLoading('chat');
    try {
      // In this view, the current user is typically a househelp viewing a household profile.
      const payload: StartConversationPayload = {
        household_user_id: resolvedUserId,
        househelp_user_id: currentUserId,
      };
      if (profile?.id) {
        payload.household_profile_id = profile.id;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (err) {
      console.error('Failed to start chat', err);
      navigate('/inbox');
    } finally {
      setActionLoading(null);
    }
  };

  const shouldShowBackButton = true;
  const showActions = canShortlist || canChat;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30">
          <p className="font-semibold text-red-800 dark:text-red-400">{error || "Profile not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {isEmbed ? null : <Navigation />}
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header (hidden in embed mode) */}
            {!isEmbed && (
              <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 mb-4">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      {shouldShowBackButton && (
                        <button
                          onClick={handleBackNavigation}
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold transition-colors text-xs"
                        >
                          ← {backLabel}
                        </button>
                      )}
                      <div>
                        <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                          🏠 {profile.owner ? `${profile.owner.first_name || ''} ${profile.owner.last_name || ''}`.trim() || 'Household Profile' : 'Household Profile'}
                        </h1>
                        {profile.town && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📍 {profile.town}</p>}
                      </div>
                    </div>

                    {showActions && (
                      <div className="flex items-center gap-2 sm:gap-3 self-start lg:self-auto">
                        {canShortlist && (
                          <button
                            onClick={handleToggleShortlist}
                            disabled={actionLoading === 'shortlist'}
                            aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow transition-all ${
                              isShortlisted
                                ? 'bg-pink-500 border-pink-200 text-white hover:bg-pink-600'
                                : 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200'
                            } ${actionLoading === 'shortlist' ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            <Heart className="w-4 h-4" fill={isShortlisted ? 'currentColor' : 'none'} />
                          </button>
                        )}
                        {canChat && (
                          <button
                            onClick={handleStartChat}
                            disabled={actionLoading === 'chat'}
                            aria-label="Chat"
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow transition-all bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 ${
                              actionLoading === 'chat' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                            }`}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        )}
                        {canInteract && (
                          <button
                            onClick={() => setIsInterestModalOpen(true)}
                            disabled={hasExpressedInterest}
                            className={`px-4 py-1.5 text-xs rounded-xl font-semibold shadow-lg transition-all flex items-center gap-2 ${
                              hasExpressedInterest
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 hover:scale-105'
                            }`}
                          >
                            <HandHeart className="w-4 h-4" />
                            {hasExpressedInterest ? 'Interest Sent' : 'Show Interest'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

      {/* Quick Info Badges */}
      <div className="bg-white dark:bg-[#13131a] p-4 sm:p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex flex-wrap gap-2">
          {profile.verified && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-xs font-semibold">✅ Verified</span>
          )}
          {profile.premium && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-semibold">⭐ Premium</span>
          )}
          {profile.is_shared && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-xs font-semibold">👨‍👩‍👧 Shared Household ({profile.member_count || 1} members)</span>
          )}
          {profile.house_size && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-xs font-semibold">🏠 {profile.house_size}</span>
          )}
          {profile.rating && profile.rating > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-xs font-semibold">⭐ {profile.rating}/5 ({profile.review_count || 0} reviews)</span>
          )}
          {profile.needs_live_in && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-xs font-semibold">🌙 Needs Live-in</span>
          )}
          {profile.needs_day_worker && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full text-xs font-semibold">☀️ Needs Day Worker</span>
          )}
          {profile.religion && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">🙏 {profile.religion}</span>
          )}
          {profile.created_at && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs">Member since {new Date(profile.created_at).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
          )}
        </div>
      </div>

      {/* Profile Photos */}
      {profile.photos && profile.photos.length > 0 && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">📸 Home Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(photo)}>
                <img
                  src={photo}
                  alt={`Home photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => { e.currentTarget.src = '/assets/placeholder-image.png'; }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-white text-purple-600 rounded-xl text-sm font-semibold">View Full</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About / Bio */}
      {profile.bio && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">✍️ About This Household</h2>
          <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
        </div>
      )}

      {/* Location & House Info */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">📍 Location & House</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Location</span>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">
              {typeof profile.location === 'string'
                ? (profile.location || profile.town || 'Not specified')
                : (profile.location?.place || profile.location?.name || profile.town || 'Not specified')}
            </p>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">House Size</span>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.house_size || 'Not specified'}</p>
          </div>
          {profile.address && (
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Address</span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.address}</p>
            </div>
          )}
        </div>
        {profile.household_notes && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Household Notes</span>
            <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{profile.household_notes}</p>
          </div>
        )}
      </div>

      {/* Service Type & Schedule */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">👥 Service Requirements</h2>
        {!profile.needs_live_in && !profile.needs_day_worker && !profile.available_from ? (
          <p className="text-gray-500 dark:text-gray-400">No service requirements specified yet</p>
        ) : (
          <div className="space-y-4">
            {profile.needs_live_in && (
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-500/20">
                <p className="font-semibold text-indigo-900 dark:text-indigo-100 mb-1">🌙 Live-in Help Needed</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This household needs a househelp who can live on the premises.</p>
                {profile.live_in_off_days && profile.live_in_off_days.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Off days:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {profile.live_in_off_days.map((day, i) => (
                        <span key={i} className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-800/40 text-indigo-800 dark:text-indigo-200 rounded-full text-xs capitalize">{day}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {profile.needs_day_worker && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-500/20">
                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">☀️ Day Worker Needed</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">This household needs a househelp for daytime work.</p>
                {profile.day_worker_schedule && (() => {
                  try {
                    const schedule = typeof profile.day_worker_schedule === 'string' ? JSON.parse(profile.day_worker_schedule) : profile.day_worker_schedule;
                    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
                    const activeDays = days.filter(d => schedule[d]?.morning || schedule[d]?.afternoon || schedule[d]?.evening);
                    if (activeDays.length === 0) return null;
                    return (
                      <div className="mt-3">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Weekly Schedule</span>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {activeDays.map(day => {
                            const d = schedule[day];
                            const slots = [d?.morning && 'Morning', d?.afternoon && 'Afternoon', d?.evening && 'Evening'].filter(Boolean);
                            return (
                              <div key={day} className="p-2 bg-amber-100/60 dark:bg-amber-800/20 rounded-lg">
                                <p className="text-xs font-bold text-amber-900 dark:text-amber-200 capitalize">{day}</p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{slots.join(', ')}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
            )}
            {profile.available_from && (
              <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Service Needed From</span>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(profile.available_from).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Budget & Compensation */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">� Budget & Compensation</h2>
        {profile.budget_min || profile.budget_max ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200/50 dark:border-green-500/20 sm:col-span-2">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Salary Range</span>
              <p className="text-lg font-bold text-green-800 dark:text-green-200 mt-1">
                {profile.budget_min && profile.budget_max
                  ? `KES ${profile.budget_min.toLocaleString()} – ${profile.budget_max.toLocaleString()}`
                  : profile.budget_min
                    ? `KES ${profile.budget_min.toLocaleString()}+`
                    : profile.budget_max
                      ? `Up to KES ${profile.budget_max.toLocaleString()}`
                      : 'Negotiable'}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Pay Frequency</span>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">
                {profile.salary_frequency === 'daily' ? 'Daily'
                  : profile.salary_frequency === 'weekly' ? 'Weekly'
                  : profile.salary_frequency === 'monthly' ? 'Monthly'
                  : profile.salary_frequency === 'yearly' ? 'Yearly'
                  : profile.salary_frequency || 'Monthly'}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Budget not specified yet — you can discuss compensation directly.</p>
        )}
      </div>

      {/* Chores & Duties */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">🧹 Chores & Duties</h2>
        {profile.chores && profile.chores.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.chores.map((chore, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-xl text-sm font-medium">{chore}</span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No specific chores listed — duties can be discussed.</p>
        )}
      </div>

      {/* Children */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">� Children ({kids.length})</h2>
        {kids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {kids.map((kid, idx) => (
              <div key={kid.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200/30 dark:border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{kid.is_expecting ? '🤰' : '👶'}</span>
                  <p className="font-semibold text-purple-900 dark:text-purple-100">
                    {kid.is_expecting ? 'Expecting a child' : `Child ${idx + 1}`}
                  </p>
                  {kid.gender && <span className="text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200 rounded-full capitalize">{kid.gender}</span>}
                </div>
                {kid.date_of_birth && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Born: {new Date(kid.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                )}
                {kid.is_expecting && kid.expected_date && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">Expected: {new Date(kid.expected_date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
                )}
                {kid.notes && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{kid.notes}</p>}
                {kid.traits && kid.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {kid.traits.map((trait: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full capitalize">{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No children in this household</p>
        )}
      </div>

      {/* Pets */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">🐾 Pets ({pets.length})</h2>
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pets.map((pet, idx) => (
              <div key={pet.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200/30 dark:border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🐾</span>
                  <p className="font-semibold text-purple-900 dark:text-purple-100 capitalize">{pet.pet_type}</p>
                  {pet.requires_care && <span className="text-xs px-2 py-0.5 bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full">Needs care</span>}
                </div>
                {pet.care_details && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{pet.care_details}</p>}
                {pet.traits && pet.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.traits.map((trait: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full capitalize">{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No pets in this household</p>
        )}
      </div>

      {/* Religion */}
      {profile.religion && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">🙏 Religion & Beliefs</h2>
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{profile.religion}</p>
        </div>
      )}

      {/* Currently Employed Househelps */}
      {profile.househelp_ids && profile.househelp_ids.length > 0 && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">👤 Current Staff</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">This household currently has {profile.househelp_ids.length} househelp{profile.househelp_ids.length > 1 ? 's' : ''} employed.</p>
        </div>
      )}

      {/* No Bio placeholder at bottom */}
      {!profile.bio && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 rounded-b-3xl">
          <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-4">✍️ About This Household</h2>
          <p className="text-gray-500 dark:text-gray-400">No bio added yet</p>
        </div>
      )}
    </div>
      </main>
      </PurpleThemeWrapper>
      {isEmbed ? null : <Footer />}
      
      {/* Image View Modal */}
      {selectedImage && (
        <ImageViewModal
          imageUrl={selectedImage}
          altText="Home photo"
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Show Interest Modal */}
      {canInteract && profile && (
        <ShowInterestModal
          isOpen={isInterestModalOpen}
          onClose={() => {
            setIsInterestModalOpen(false);
            setHasExpressedInterest(true);
          }}
          householdId={profile.id || ''}
          householdName="this household"
        />
      )}
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
