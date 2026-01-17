import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_BASE_URL, API_ENDPOINTS, NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import ShowInterestModal from '~/components/modals/ShowInterestModal';
import { MessageCircle, Heart, HandHeart } from "lucide-react";

interface HouseholdData {
  id?: string;
  user_id?: string;
  house_size?: string;
  household_notes?: string;
  needs_live_in?: boolean;
  live_in_off_days?: string[];
  needs_day_worker?: boolean;
  day_worker_schedule?: any;
  available_from?: string;
  chores?: string[];
  budget_min?: number;
  budget_max?: number;
  salary_frequency?: string;
  religion?: string;
  bio?: string;
  address?: string;
  location?: any;
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
    params.get("user_id") || params.get("profileId") || navigationState.profileId || currentUserId;
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
        const profileData = await profileRes.json();
        setProfile(profileData);

        try {
          const petsRes = await fetch(`${API_BASE_URL}/api/v1/pets/user/${resolvedUserId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (petsRes.ok) {
            const petsData = await petsRes.json();
            setPets(petsData || []);
          }
        } catch (err) {
          console.error("Failed to fetch pets:", err);
        }

        try {
          if (currentUserId && resolvedUserId === currentUserId) {
            const kidsRes = await fetch(`${API_BASE_URL}/api/v1/household_kids`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (kidsRes.ok) {
              const kidsData = await kidsRes.json();
              setKids(kidsData || []);
            }
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
        if (!token) throw new Error("Not authenticated");
        const res = await fetch(`${API_BASE_URL}/api/v1/shortlists/exists/${profile.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setIsShortlisted(Boolean(data?.exists));
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
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");

      // In this view, the current user is typically a househelp viewing a household profile.
      const payload: Record<string, any> = {
        household_user_id: resolvedUserId,
        househelp_user_id: currentUserId,
      };
      if (profile?.id) {
        payload.household_profile_id = profile.id;
      }

      const res = await fetch(`${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start conversation');

      let convId: string | undefined;
      try {
        const data = await res.json();
        convId = data?.id || data?.ID || data?.conversation_id;
      } catch {
        convId = undefined;
      }

      if (convId) navigate(`/inbox?conversation=${convId}`);
      else navigate('/inbox');
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
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header (hidden in embed mode) */}
            {!isEmbed && (
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 text-white rounded-t-3xl shadow-lg border border-white/10 dark:border-purple-500/20">
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-4">
                      {shouldShowBackButton && (
                        <button
                          onClick={handleBackNavigation}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold transition-colors text-sm sm:text-base"
                        >
                          ← {backLabel}
                        </button>
                      )}
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                          🏠 Household Profile
                        </h1>
                      </div>
                    </div>

                    {showActions && (
                      <div className="flex items-center gap-3 sm:gap-4 self-start lg:self-auto">
                        {canShortlist && (
                          <button
                            onClick={handleToggleShortlist}
                            disabled={actionLoading === 'shortlist'}
                            aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all ${
                              isShortlisted
                                ? 'bg-pink-500 border-pink-200 text-white hover:bg-pink-600'
                                : 'bg-white/20 border-white/40 text-white hover:bg-white/30'
                            } ${actionLoading === 'shortlist' ? 'opacity-70 cursor-not-allowed' : ''}`}
                          >
                            <Heart className="w-5 h-5" />
                          </button>
                        )}
                        {canChat && (
                          <button
                            onClick={handleStartChat}
                            disabled={actionLoading === 'chat'}
                            aria-label="Chat"
                            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all bg-white text-purple-600 ${
                              actionLoading === 'chat' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                            }`}
                          >
                            <MessageCircle className="w-5 h-5" />
                          </button>
                        )}
                        {canInteract && (
                          <button
                            onClick={() => setIsInterestModalOpen(true)}
                            disabled={hasExpressedInterest}
                            className={`px-4 py-2 rounded-full font-semibold shadow-lg transition-all flex items-center gap-2 ${
                              hasExpressedInterest
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600 hover:scale-105'
                            }`}
                          >
                            <HandHeart className="w-5 h-5" />
                            {hasExpressedInterest ? 'Interest Sent' : 'Show Interest'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

      {/* Profile Photos */}
      {profile.photos && profile.photos.length > 0 && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📸 Home Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(photo)}>
                <img
                  src={photo}
                  alt={`Home photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/placeholder-image.png';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-white text-purple-600 rounded-lg text-sm font-semibold">
                    View Full
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* House Size & Notes */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🏠 House Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">House Size</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.house_size || 'Not specified'}</p>
          </div>
          {profile.household_notes && (
            <div className="md:col-span-2">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Additional Notes</span>
              <p className="text-base text-gray-900 dark:text-gray-100 mt-1">{profile.household_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Type */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👥 Service Type Needed</h2>
        <div className="space-y-3">
          {profile.needs_live_in && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="font-semibold text-purple-900 dark:text-purple-100">🌙 They need Live-in Help</p>
              {profile.live_in_off_days && profile.live_in_off_days.length > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Off days: {profile.live_in_off_days.join(', ')}</p>
              )}
            </div>
          )}
          {profile.needs_day_worker && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">☀️ They need Day Worker</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Schedule configured</p>
            </div>
          )}
          {profile.available_from && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">They need your availability from</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(profile.available_from).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👶 Children</h2>
        {kids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kids.map((kid, idx) => (
              <div key={kid.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  {kid.is_expecting ? '🤰 Expecting a child' : `👶 Child ${idx + 1}`}
                </p>
                {kid.age_years !== undefined && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Age: {kid.age_years} {kid.age_years === 1 ? 'year' : 'years'} {kid.age_months ? `and ${kid.age_months} months` : ''}
                  </p>
                )}
                {kid.special_needs && <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">⚠️ Has special needs</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No children</p>
        )}
      </div>

      {/* Pets */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🐾 Pets</h2>
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet, idx) => (
              <div key={pet.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="font-semibold text-purple-900 dark:text-purple-100 capitalize">🐾 {pet.pet_type}</p>
                {pet.requires_care && <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">⚠️ Requires care</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No pets</p>
        )}
      </div>

      {/* Chores */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🧹 Chores & Duties</h2>
        {profile.chores && profile.chores.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.chores.map((chore, idx) => (
              <span key={idx} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-lg font-medium">
                {chore}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No chores specified</p>
        )}
      </div>

      {/* Budget */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">💰 Budget</h2>
        {profile.budget_min || profile.budget_max ? (
          <div className="space-y-2">
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
              {profile.budget_min && profile.budget_max ? `KES ${profile.budget_min.toLocaleString()} - ${profile.budget_max.toLocaleString()}` : profile.budget_min ? `KES ${profile.budget_min.toLocaleString()}+` : 'Negotiable'}
            </p>
            {profile.salary_frequency && (
              <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                Per {profile.salary_frequency === 'daily' ? 'Day' : 
                     profile.salary_frequency === 'weekly' ? 'Week' : 
                     profile.salary_frequency === 'monthly' ? 'Month' : 
                     profile.salary_frequency === 'yearly' ? 'Year' : 
                     profile.salary_frequency}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Budget not specified</p>
        )}
      </div>

      {/* Religion */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🙏 Religion & Beliefs</h2>
        <p className="text-base font-medium text-gray-900 dark:text-gray-100">{profile.religion || 'Not specified'}</p>
      </div>

      {/* Bio */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 rounded-b-3xl">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">✍️ About This Household</h2>
        <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{profile.bio || 'No bio added yet'}</p>
      </div>
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
