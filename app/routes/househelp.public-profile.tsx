import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_BASE_URL, API_ENDPOINTS, NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import { apiClient } from '~/utils/apiClient';
import { MessageCircle, Heart, Briefcase } from 'lucide-react';
import HireRequestModal from '~/components/modals/HireRequestModal';

interface UserData {
  id?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  email_verified?: boolean;
  country?: string;
  role?: string;
  status?: string;
  auth_provider?: string;
  profile_type?: string;
  created_at?: string;
  updated_at?: string;
}

interface LocationData {
  place?: string;
  latitude?: number;
  longitude?: number;
}

interface AvailabilitySchedule {
  monday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
  tuesday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
  wednesday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
  thursday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
  friday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
  saturday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
  sunday?: { morning?: boolean; afternoon?: boolean; evening?: boolean };
}

interface HousehelpData {
  id?: string;
  user_id?: string;
  profile_id?: string;
  user?: UserData;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  years_of_experience?: number;
  can_work_with_kid?: boolean;
  can_work_with_pets?: boolean;
  children_age_range?: string;
  my_child_preference?: string;
  number_of_concurrent_children?: number;
  pets?: string[];
  can_drive?: boolean;
  first_aid_certificate?: boolean;
  certificate_of_good_conduct?: boolean;
  languages?: string[];
  certifications?: string;
  can_help_with?: string;
  pet_types?: string;
  salary_expectation?: number;
  salary_frequency?: string;
  bio?: string;
  location?: LocationData;
  address?: string;
  town?: string;
  available_from?: string;
  offers_live_in?: boolean;
  off_days?: string[];
  offers_day_worker?: boolean;
  availability?: AvailabilitySchedule;
  skills?: string[];
  traits?: string[];
  talent_with_kids?: string[];
  religion?: string;
  marital_status?: string;
  education_level?: string;
  has_kids?: boolean;
  needs_accommodation?: boolean;
  preferred_household_size?: string;
  preferred_location_type?: string;
  preferred_family_type?: string;
  work_environment_notes?: string;
  photos?: string[];
  avatar_url?: string;
  'househelp-type'?: string;
  status?: string;
  verified?: boolean;
  premium?: boolean;
  rating?: number;
  review_count?: number;
  reference?: string;
  national_id_no?: string;
  next_of_kin?: string;
  next_of_kin_tel?: string;
  background_check_consent?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ProfileResponse {
  data?: {
    Househelp?: HousehelpData;
    User?: UserData;
  };
  // For backward compatibility with direct response
  id?: string;
  user?: UserData;
  [key: string]: any;
}

export default function HousehelpPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const isEmbed = params.get('embed') === '1' || params.get('embed') === 'true';
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isViewingOther, setIsViewingOther] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [viewerProfileType, setViewerProfileType] = useState<string | null>(null);
  const navigationState = (location.state ?? {}) as {
    backTo?: string;
    backLabel?: string;
    fromInbox?: boolean;
    fromShortlist?: boolean;
    fromHireRequests?: boolean;
  };

  const currentUser = useMemo(() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem('user_object');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);
  const currentUserId: string | undefined = currentUser?.id;
  const currentProfileType: string | undefined = currentUser?.profile_type;
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

  useEffect(() => {
    setViewerProfileType(currentProfileType || null);
    
    // Fetch household profile ID if current user is a household
    const fetchHouseholdProfileId = async () => {
      if (currentProfileType?.toLowerCase() === 'household' && currentUserId) {
        try {
          const token = localStorage.getItem("token");
          if (!token) return;
          
          const res = await fetch(`${API_BASE_URL}/api/v1/profile/household/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setCurrentHouseholdProfileId(data?.id || data?.profile_id || null);
          }
        } catch (err) {
          console.error('Failed to fetch household profile ID:', err);
        }
      }
    };
    
    fetchHouseholdProfileId();
  }, [currentProfileType, currentUserId]);

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
      navigate('/household/shortlist');
      return;
    }
    navigate('/');
  };

  const backButtonLabel =
    navigationState.backLabel ||
    (navigationState.fromInbox
      ? 'Back to Inbox'
      : navigationState.fromShortlist
      ? 'Back to Shortlist'
      : navigationState.fromHireRequests
      ? 'Back to Hiring'
      : 'Back');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        
        // Get profileId from query string (for iframe modal) or navigation state fallback
        const profileId = new URLSearchParams(location.search).get('profileId') || (location.state as any)?.profileId;
        
        // Store the profileId we're viewing
        setViewingProfileId(profileId || null);
        
        // If profileId is provided, fetch that specific profile, otherwise fetch own profile
        const endpoint = profileId 
          ? `${API_BASE_URL}/api/v1/househelps/${profileId}/profile_with_user`
          : `${API_BASE_URL}/api/v1/profile/househelp/me`;
        
        const profileRes = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData: ProfileResponse = await profileRes.json();
        
        // Handle nested response structure (data.Househelp and data.User)
        if (profileData.data?.Househelp) {
          setProfile(profileData.data.Househelp);
          setUser(profileData.data.User || null);
        } else {
          // Fallback for direct response format
          setProfile(profileData as HousehelpData);
          setUser(profileData.user || null);
        }
        setIsViewingOther(!!profileId); // Set to true if viewing someone else's profile
        
        // Check if profile is shortlisted (only if viewing someone else's profile)
        if (profileId) {
          try {
            const shortlistRes = await fetch(`${API_ENDPOINTS.shortlists.exists(profileId)}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (shortlistRes.ok) {
              const shortlistData = await shortlistRes.json();
              setIsShortlisted(shortlistData.exists || false);
            }
          } catch (err) {
            console.error('Error checking shortlist status:', err);
          }
        }
      } catch (err: any) {
        console.error("Error loading househelp profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [location.state, location.search]);

  const targetProfileId = viewingProfileId || profile?.profile_id || profile?.id;

  const handleChat = async () => {
    if (!targetProfileId || !currentUserId || !user?.id) return;
    setActionLoading('chat');
    try {
      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = currentUserId;
      let househelpId = user.id as string;

      // If viewer is househelp and this profile belongs to a household (unlikely here), flip roles
      if (profileType === 'househelp') {
        householdId = user.id as string;
        househelpId = currentUserId;
      }

      const payload: Record<string, any> = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
        househelp_profile_id: targetProfileId,
      };
      
      // Include household_profile_id if current user is household
      if (profileType === 'household' && currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const res = await apiClient.auth(`${NOTIFICATIONS_API_BASE_URL}/api/v1/inbox/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to start conversation');

      let convId: string | undefined;
      try {
        const data = await apiClient.json<any>(res);
        convId = data?.id || data?.ID || data?.conversation_id;
      } catch {
        convId = undefined;
      }

      if (convId) navigate(`/inbox?conversation=${convId}`);
      else navigate('/inbox');
    } catch (e) {
      console.error('Failed to start chat:', e);
      navigate('/inbox');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShortlistToggle = async () => {
    if (!targetProfileId) return;
    setActionLoading('shortlist');
    try {
      if (isShortlisted) {
        const res = await apiClient.auth(`${API_ENDPOINTS.shortlists.byId(targetProfileId)}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          const errorData = await res.text();
          console.error('Delete failed:', errorData);
          throw new Error('Failed to remove from shortlist');
        }
        setIsShortlisted(false);
      } else {
        const res = await apiClient.auth(`${API_ENDPOINTS.shortlists.base}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile_id: targetProfileId, profile_type: 'househelp' }),
        });
        if (!res.ok) {
          const errorData = await res.text();
          console.error('Add failed:', errorData);
          throw new Error('Failed to add to shortlist');
        }
        setIsShortlisted(true);
      }
    } catch (e) {
      console.error('Failed to update shortlist:', e);
      alert(e instanceof Error ? e.message : 'Failed to update shortlist');
    } finally {
      setActionLoading(null);
    }
  };

  const showOwnerBackButton = !isViewingOther && (viewerProfileType?.toLowerCase() === 'househelp');
  const shouldShowBackButton = isViewingOther || showOwnerBackButton;
  const backButtonText = isViewingOther ? backButtonLabel : 'Back to My Profile';

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
        <main className="flex-1">
          <div className={`max-w-6xl mx-auto px-4 pb-6 ${isEmbed ? 'pt-4' : 'pt-6 sm:pt-8'}`}>
            {/* Header (hidden in embed) */}
            {!isEmbed && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-gray-800 dark:to-gray-900 text-white rounded-t-3xl p-4 sm:p-8 shadow-lg border border-white/10 dark:border-purple-500/20">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-4">
                    {shouldShowBackButton && (
                      <button
                        onClick={isViewingOther ? handleBackNavigation : () => navigate('/househelp/profile')}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold transition-colors text-sm sm:text-base"
                      >
                        ← {backButtonText}
                      </button>
                    )}
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                        {((profile.user?.first_name || profile.first_name) || (profile.user?.last_name || profile.last_name))
                          ? `${profile.user?.first_name || profile.first_name || ''} ${profile.user?.last_name || profile.last_name || ''}`.trim()
                          : 'Househelp Profile'}
                      </h1>
                      {profile['househelp-type'] && (
                        <p className="text-white/80 capitalize">{profile['househelp-type']}</p>
                      )}
                    </div>
                  </div>

                  {isViewingOther && (
                    <div className="flex items-center gap-3 sm:gap-4 self-start lg:self-auto">
                      <button
                        onClick={handleShortlistToggle}
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
                      <button
                        onClick={handleChat}
                        disabled={actionLoading === 'chat'}
                        aria-label="Chat"
                        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all bg-white text-purple-600 ${
                          actionLoading === 'chat' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                      >
                        <MessageCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setIsHireModalOpen(true)}
                        className="px-4 py-1 rounded-full bg-green-500 text-white font-semibold shadow-lg hover:bg-green-600 transition-all flex items-center gap-2"
                      >
                        <Briefcase className="w-5 h-5" />
                        Hire
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}

            {/* Photo Gallery */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📸 Photo Gallery</h2>
              {profile.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {profile.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-purple-200/40 dark:border-purple-500/30"
                      onClick={() => setSelectedImage(photo)}
                    >
                      {!imageLoaded[`photo-${idx}`] && (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 via-purple-200 to-purple-100 dark:from-purple-900/20 dark:via-purple-800/30 dark:to-purple-900/20 animate-pulse" />
                      )}
                      <img
                        src={photo}
                        alt={`Profile photo ${idx + 1}`}
                        className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                          imageLoaded[`photo-${idx}`] ? 'opacity-100' : 'opacity-0'
                        }`}
                        onLoad={() => setImageLoaded((prev) => ({ ...prev, [`photo-${idx}`]: true }))}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          setImageLoaded((prev) => ({ ...prev, [`photo-${idx}`]: true }));
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1 bg-white text-purple-600 rounded-xl text-sm font-semibold">
                          View Full
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900/20 rounded-lg p-8 text-center text-gray-500 dark:text-gray-400">No photos uploaded yet</div>
              )}
            </div>

            {/* Personal Information */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👤 Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</span>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.gender || 'Not specified'}</p>
                </div>
                {profile.date_of_birth && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Age</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {Math.floor(
                        (new Date().getTime() - new Date(profile.date_of_birth ?? '').getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                      )}{' '}
                      years old
                    </p>
                  </div>
                )}
                {profile.religion && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Religion</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.religion}</p>
                  </div>
                )}
                {profile.marital_status && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Marital Status</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.marital_status}</p>
                  </div>
                )}
                {profile.education_level && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Education Level</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.education_level}</p>
                  </div>
                )}
                {profile.has_kids !== undefined && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Has Children</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.has_kids ? 'Yes' : 'No'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Location & Contact Area */}
            {(profile.location || profile.address || profile.town) && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📍 Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.location?.place && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Area</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.location.place}</p>
                    </div>
                  )}
                  {profile.town && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Town</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.town}</p>
                    </div>
                  )}
                  {profile.address && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Address</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.address}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Experience & Skills */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">💼 Experience & Skills</h2>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Years of Experience</span>
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                    {profile.years_of_experience ? `${profile.years_of_experience} years` : 'Not specified'}
                  </p>
                </div>
                {profile.certifications && profile.certifications.trim() && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Certifications</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.certifications.split(',').map((cert, idx) => (
                        <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-xl font-medium">
                          ✓ {cert.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.languages && Array.isArray(profile.languages) && profile.languages.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Languages</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.languages.map((lang, idx) => (
                        <span key={idx} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-xl font-medium">
                          🗣️ {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-xl font-medium">
                          ⭐ {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.traits && Array.isArray(profile.traits) && profile.traits.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Personal Traits</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.traits.map((trait, idx) => (
                        <span key={idx} className="px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100 rounded-xl font-medium">
                          💫 {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {profile.can_help_with && profile.can_help_with.trim() && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Can Help With</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.can_help_with.split(',').map((item, idx) => (
                        <span key={idx} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 rounded-xl font-medium">
                          🛠️ {item.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Certifications & Abilities */}
            {(profile.first_aid_certificate || profile.certificate_of_good_conduct || profile.can_drive) && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📜 Certifications & Abilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.first_aid_certificate && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
                      <p className="font-semibold text-green-900 dark:text-green-100">✅ First Aid Certificate</p>
                    </div>
                  )}
                  {profile.certificate_of_good_conduct && (
                    <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-2 border-green-500">
                      <p className="font-semibold text-green-900 dark:text-green-100">✅ Certificate of Good Conduct</p>
                    </div>
                  )}
                  {profile.can_drive && (
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500">
                      <p className="font-semibold text-blue-900 dark:text-blue-100">✅ Can Drive</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work with Children Details */}
            {profile.can_work_with_kid && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👶 Working with Children</h2>
                <div className="space-y-4">
                  {profile.children_age_range && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Children Age Range</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.children_age_range}</p>
                    </div>
                  )}
                  {profile.number_of_concurrent_children !== undefined && profile.number_of_concurrent_children > 0 && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Can Handle</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.number_of_concurrent_children} children at once</p>
                    </div>
                  )}
                  {profile.my_child_preference && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Child Preference</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.my_child_preference}</p>
                    </div>
                  )}
                  {profile.talent_with_kids && Array.isArray(profile.talent_with_kids) && profile.talent_with_kids.length > 0 && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Special Talents with Kids</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.talent_with_kids.map((talent, idx) => (
                          <span key={idx} className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 rounded-xl font-medium">
                            🌟 {talent}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Work with Pets Details */}
            {profile.can_work_with_pets && profile.pet_types && profile.pet_types.trim() && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🐾 Working with Pets</h2>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Comfortable with</span>
                  <div className="flex flex-wrap gap-2">
                    {profile.pet_types.split(',').map((pet, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-xl font-medium">
                        🐕 {pet.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Household Preferences */}
            {(profile.preferred_household_size || profile.preferred_location_type || profile.preferred_family_type || profile.needs_accommodation) && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🏠 Household Preferences</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.preferred_household_size && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Household Size</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.preferred_household_size}</p>
                    </div>
                  )}
                  {profile.preferred_location_type && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Location Type</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.preferred_location_type}</p>
                    </div>
                  )}
                  {profile.preferred_family_type && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Family Type</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.preferred_family_type}</p>
                    </div>
                  )}
                  {profile.needs_accommodation !== undefined && (
                    <div>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Needs Accommodation</span>
                      <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.needs_accommodation ? 'Yes' : 'No'}</p>
                    </div>
                  )}
                </div>
                {profile.work_environment_notes && (
                  <div className="mt-4">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Additional Notes</span>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{profile.work_environment_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Work Preferences */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">⚙️ Work Preferences</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl ${profile.can_work_with_kid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
                    <p className={`font-semibold ${profile.can_work_with_kid ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      👶 Work with Kids
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {profile.can_work_with_kid ? 'Yes, comfortable with children' : 'No'}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl ${profile.can_work_with_pets ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
                    <p className={`font-semibold ${profile.can_work_with_pets ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>
                      🐾 Work with Pets
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {profile.can_work_with_pets ? 'Yes, comfortable with pets' : 'No'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.offers_live_in && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="font-semibold text-purple-900 dark:text-purple-100">🌙 Available for Live-in</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Can live with the family</p>
                    </div>
                  )}
                  {profile.offers_day_worker && (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="font-semibold text-yellow-900 dark:text-yellow-100">☀️ Available as Day Worker</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Works during the day</p>
                    </div>
                  )}
                </div>
                {profile.available_from && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">They are available from</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                      {new Date(profile.available_from).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {profile.off_days && profile.off_days.length > 0 && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Off Days</span>
                    <div className="flex flex-wrap gap-2">
                      {profile.off_days.map((day, idx) => (
                        <span key={idx} className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100 rounded-xl font-medium">
                          📅 {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability Schedule */}
            {profile.availability && Object.keys(profile.availability).length > 0 && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📅 Weekly Availability</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(profile.availability).map(([day, times]) => {
                    const dayTimes = times as { morning?: boolean; afternoon?: boolean; evening?: boolean };
                    const availableTimes = [];
                    if (dayTimes.morning) availableTimes.push('Morning');
                    if (dayTimes.afternoon) availableTimes.push('Afternoon');
                    if (dayTimes.evening) availableTimes.push('Evening');
                    return (
                      <div key={day} className={`p-3 rounded-xl border-2 ${availableTimes.length > 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-500' : 'bg-gray-50 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700'}`}>
                        <p className={`font-semibold capitalize mb-1 ${availableTimes.length > 0 ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>{day}</p>
                        {availableTimes.length > 0 ? (
                          <p className="text-xs text-gray-600 dark:text-gray-400">{availableTimes.join(', ')}</p>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-gray-500">Not available</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Salary Expectations */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">💰 Salary Expectations</h2>
              {profile.salary_expectation ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    KES {profile.salary_expectation.toLocaleString()}
                  </p>
                  {profile.salary_frequency && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      Per {profile.salary_frequency === 'daily' ? 'Day' : profile.salary_frequency === 'weekly' ? 'Week' : profile.salary_frequency === 'monthly' ? 'Month' : profile.salary_frequency === 'yearly' ? 'Year' : profile.salary_frequency}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Salary expectation not specified</p>
              )}
            </div>

            {/* References */}
            {profile.reference && profile.reference.trim() && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📝 References</h2>
                {(() => {
                  try {
                    const parsedOnce = JSON.parse(profile.reference);
                    const references = typeof parsedOnce === 'string' ? JSON.parse(parsedOnce) : parsedOnce;
                    if (Array.isArray(references) && references.length > 0) {
                      return (
                        <div className="space-y-4">
                          {references.map((ref: any, idx: number) => (
                            <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ref.name && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Name</span>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ref.name}</p>
                                  </div>
                                )}
                                {ref.relationship && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Relationship</span>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ref.relationship}</p>
                                  </div>
                                )}
                                {ref.duration && (
                                  <div>
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Duration</span>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{ref.duration} years</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                  } catch (e) {
                    console.error('Error parsing references:', e);
                  }
                  return <p className="text-gray-500 dark:text-gray-400">No references provided</p>;
                })()}
              </div>
            )}

            {/* Status & Verification */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">✅ Status & Verification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.status && (
                  <div className={`p-4 rounded-xl ${profile.status === 'active' ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-300'}`}>
                    <p className={`font-semibold ${profile.status === 'active' ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>Profile Status</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">{profile.status}</p>
                  </div>
                )}
                {profile.verified !== undefined && (
                  <div className={`p-4 rounded-xl ${profile.verified ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' : 'bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-300'}`}>
                    <p className={`font-semibold ${profile.verified ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>{profile.verified ? '✅' : '❌'} Verified Profile</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.verified ? 'Identity verified' : 'Not verified'}</p>
                  </div>
                )}
                {profile.premium !== undefined && (
                  <div className={`p-4 rounded-lg ${profile.premium ? 'bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500' : 'bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-300'}`}>
                    <p className={`font-semibold ${profile.premium ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-900 dark:text-gray-100'}`}>{profile.premium ? '⭐' : '○'} Premium Member</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.premium ? 'Premium account' : 'Standard account'}</p>
                  </div>
                )}
                {profile.background_check_consent !== undefined && (
                  <div className={`p-4 rounded-xl ${profile.background_check_consent ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-900/20 border-2 border-gray-300'}`}>
                    <p className={`font-semibold ${profile.background_check_consent ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>{profile.background_check_consent ? '✅' : '❌'} Background Check</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{profile.background_check_consent ? 'Consented to check' : 'Not consented'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 rounded-b-3xl">
                <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">✍️ About This Person</h2>
                <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />

      {selectedImage && (
        <ImageViewModal
          imageUrl={selectedImage}
          altText="Profile photo"
          onClose={() => setSelectedImage(null)}
        />
      )}

      {isViewingOther && profile && (
        <HireRequestModal
          isOpen={isHireModalOpen}
          onClose={() => setIsHireModalOpen(false)}
          househelpId={profile.id || ''}
          househelpName={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
          househelpSalaryExpectation={profile.salary_expectation}
          househelpSalaryFrequency={profile.salary_frequency}
        />
      )}
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
