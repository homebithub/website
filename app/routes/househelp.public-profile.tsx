import { getAccessTokenFromCookies } from '~/utils/cookie';
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { profileService as grpcProfileService, documentService, openForWorkService, shortlistService } from '~/services/grpc/authServices';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import ImageViewModal from '~/components/ImageViewModal';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import { MessageCircle, Heart, Briefcase } from 'lucide-react';
import HireRequestModal from '~/components/modals/HireRequestModal';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { getStoredProfileType, getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { useSubscription } from '~/hooks/useSubscription';
import { SubscriptionRequiredModal } from '~/components/subscriptions/SubscriptionRequiredModal';
import { ProfilePageSkeleton } from "~/components/ShimmerLoader";
import ProfileReviews from "~/components/ProfileReviews";
import { useProfileViewTracking } from "~/hooks/useProfileViewTracking";
import { ProfileChoicesSection } from '~/components/profile/ProfileChoicesSection';

interface UserData {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
}

interface LocationData {
  name?: string;
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
  years_of_experience?: number;
  languages?: string[];
  salary_expectation?: number;
  salary_frequency?: string;
  location?: LocationData;
  town?: string;
  available_from?: string;
  offers_live_in?: boolean;
  offers_day_worker?: boolean;
  availability?: AvailabilitySchedule;
  skills?: string[];
  photos?: string[];
}

function normalizeHousehelpData(raw: any): HousehelpData {
  if (!raw) return {} as HousehelpData;
  const user = raw.user || raw.User || {};
  return {
    ...raw,
    first_name: raw.first_name || user.first_name || '',
    last_name: raw.last_name || user.last_name || '',
    offers_live_in: raw.offers_live_in ?? raw.live_in ?? false,
    offers_day_worker: raw.offers_day_worker ?? raw.day_worker ?? false,
    years_of_experience: raw.years_of_experience ?? raw.experience_years ?? undefined,
    salary_expectation: raw.salary_expectation ?? raw.salary_min ?? undefined,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    availability: (() => {
      const sched = raw.availability || raw.availability_schedule;
      if (!sched) return undefined;
      if (typeof sched === 'string') {
        try { return JSON.parse(sched); } catch { return undefined; }
      }
      return sched;
    })(),
  };
}

export default function HousehelpPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryOpenForWorkId = params.get('openForWorkId') || params.get('open_for_work_id');
  const isEmbed = params.get('embed') === '1' || params.get('embed') === 'true';
  const queryProfileId = params.get('profileId');
  const queryBackTo = params.get('backTo');
  const queryBackLabel = params.get('backLabel');
  const querySource = params.get('from');
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isViewingOther, setIsViewingOther] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [openForWorkId, setOpenForWorkId] = useState<string | null>(queryOpenForWorkId);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isHireModalOpen, setIsHireModalOpen] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionActionLabel, setSubscriptionActionLabel] = useState('unlock full profile information');
  const navigationState = (location.state ?? {}) as {
    profileId?: string;
    backTo?: string;
    backLabel?: string;
    fromInbox?: boolean;
    fromShortlist?: boolean;
    fromHireRequests?: boolean;
  };
  const stateSource =
    navigationState.fromInbox ? 'inbox' :
    navigationState.fromShortlist ? 'shortlist' :
    navigationState.fromHireRequests ? 'hiring' :
    undefined;

  useEffect(() => {
    const nextParams = new URLSearchParams(params);
    let changed = false;

    if (navigationState.profileId && !nextParams.get('profileId')) {
      nextParams.set('profileId', navigationState.profileId);
      changed = true;
    }
    if (navigationState.backTo && !nextParams.get('backTo')) {
      nextParams.set('backTo', navigationState.backTo);
      changed = true;
    }
    if (navigationState.backLabel && !nextParams.get('backLabel')) {
      nextParams.set('backLabel', navigationState.backLabel);
      changed = true;
    }
    if (stateSource && !nextParams.get('from')) {
      nextParams.set('from', stateSource);
      changed = true;
    }

    if (changed) {
      navigate(`/househelp/public-profile?${nextParams.toString()}`, { replace: true, state: location.state });
    }
  }, [location.state, navigate, navigationState.backLabel, navigationState.backTo, navigationState.profileId, params, stateSource]);

  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId: string | undefined = currentUser?.user_id || currentUser?.id || getStoredUserId() || undefined;
  const currentProfileType: string | undefined = currentUser?.profile_type || getStoredProfileType() || undefined;
  useProfileViewTracking({
    profileId: viewingProfileId || profile?.id || '',
    profileType: 'househelp',
    viewerUserId: currentUserId,
    enabled: Boolean((viewingProfileId || profile?.id) && isViewingOther),
  });
  const { isActive: hasActiveSubscription, status: subscriptionStatus, loading: subscriptionLoading } = useSubscription(currentUserId);
  const [currentHouseholdProfileId, setCurrentHouseholdProfileId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch household profile ID if current user is a household
    const fetchHouseholdProfileId = async () => {
      if (currentProfileType?.toLowerCase() === 'household' && currentUserId) {
        try {
          const token = getAccessTokenFromCookies();
          if (!token) return;
          
          const profileData = await grpcProfileService.getCurrentHouseholdProfile('');
          setCurrentHouseholdProfileId(profileData?.id || profileData?.profile_id || null);
        } catch (err) {
          console.error('Failed to fetch household profile ID:', err);
        }
      }
    };
    
    fetchHouseholdProfileId();
  }, [currentProfileType, currentUserId]);

  const handleBackNavigation = () => {
    const resolvedBackTo = navigationState.backTo || queryBackTo;
    const resolvedSource =
      navigationState.fromInbox ? 'inbox' :
      navigationState.fromShortlist ? 'shortlist' :
      navigationState.fromHireRequests ? 'hiring' :
      querySource;

    if (resolvedBackTo) {
      navigate(resolvedBackTo);
      return;
    }
    if (resolvedSource === 'inbox') {
      navigate('/inbox');
      return;
    }
    if (resolvedSource === 'shortlist') {
      navigate('/household/shortlist');
      return;
    }
    if (resolvedSource === 'hiring') {
      navigate('/household/hiring');
      return;
    }
    navigate('/');
  };

  const backButtonLabel =
    navigationState.backLabel ||
    queryBackLabel ||
    ((navigationState.fromInbox ? 'inbox' :
      navigationState.fromShortlist ? 'shortlist' :
      navigationState.fromHireRequests ? 'hiring' :
      querySource) === 'inbox'
      ? 'Back to Inbox'
      : (navigationState.fromInbox ? 'inbox' :
        navigationState.fromShortlist ? 'shortlist' :
        navigationState.fromHireRequests ? 'hiring' :
        querySource) === 'shortlist'
      ? 'Back to Shortlist'
      : (navigationState.fromInbox ? 'inbox' :
        navigationState.fromShortlist ? 'shortlist' :
        navigationState.fromHireRequests ? 'hiring' :
        querySource) === 'hiring'
      ? 'Back to Hiring'
      : 'Back');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessTokenFromCookies();
        if (!token) throw new Error("Not authenticated");
        
        // Get profileId from query string (for iframe modal) or navigation state fallback
        const profileId = queryProfileId || navigationState.profileId;
        
        // Store the profileId we're viewing
        setViewingProfileId(profileId || null);
        
        // If profileId is provided, fetch that specific profile, otherwise fetch own profile
        let profileData: any;
        if (profileId) {
          profileData = await grpcProfileService.getHousehelpByID(profileId);
        } else {
          profileData = await grpcProfileService.getCurrentHousehelpProfile('');
        }
        
        // Handle nested response structure
        let rawProfile: any;
        let rawUser: UserData | null = null;
        
        if (profileData?.Househelp) {
          // profile_with_user response: { Househelp: {...}, User: {...} }
          rawProfile = profileData.Househelp;
          rawUser = profileData.User || null;
        } else if (profileData?.data?.Househelp) {
          rawProfile = profileData.data.Househelp;
          rawUser = profileData.data.User || null;
        } else if (profileData && typeof profileData === 'object' && !Array.isArray(profileData)) {
          rawProfile = profileData?.data || profileData;
          rawUser = profileData?.user || profileData?.User || null;
        } else {
          rawProfile = profileData;
          rawUser = null;
        }
        
        const normalizedProfile = normalizeHousehelpData(rawProfile);
        if (rawUser && !normalizedProfile.user) {
          normalizedProfile.user = rawUser;
        }
        setUser(rawUser);
        setIsViewingOther(!!profileId); // Set to true if viewing someone else's profile

        // Fetch photos from documents table for this user
        const targetUserId = rawUser?.id || rawProfile?.user_id;
        if (targetUserId) {
          try {
            const docsData = await documentService.getUserDocuments(targetUserId, 'profile_photo');
            const docs = docsData?.data || docsData?.documents || docsData || [];
            const documentsArray = Array.isArray(docs) ? docs : [];
            const photoUrls = documentsArray.map((doc: any) => doc.public_url || doc.signed_url || doc.url).filter(Boolean);
            if (photoUrls.length > 0) {
              normalizedProfile.photos = photoUrls;
            }
          } catch (err) {
            console.error('Failed to fetch profile photos:', err);
          }
        }

        setProfile(normalizedProfile);

        let shortlistTargetId = queryOpenForWorkId;
        if (!shortlistTargetId && normalizedProfile.id) {
          try {
            const listing = await openForWorkService.getOpenForWorkByHousehelp(normalizedProfile.id, '');
            shortlistTargetId = listing?.id || listing?.data?.id || null;
          } catch {
            shortlistTargetId = null;
          }
        }
        setOpenForWorkId(shortlistTargetId || null);

        // Check if the open-for-work listing is shortlisted (only if viewing someone else's profile)
        if (profileId) {
          try {
            const res = shortlistTargetId ? await shortlistService.shortlistExists('', shortlistTargetId) : null;
            const exists = res?.getExists?.() ?? res?.exists ?? false;
            setIsShortlisted(exists);
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
  }, [navigationState.profileId, queryOpenForWorkId, queryProfileId]);

  const targetProfileId = viewingProfileId || profile?.profile_id || profile?.id;
  const shortlistTargetId = openForWorkId || queryOpenForWorkId || null;

  const handleChat = async () => {
    const househelpUserId = user?.user_id || user?.id || profile?.user_id;
    if (!targetProfileId || !currentUserId || !househelpUserId) return;
    if (!hasActiveSubscription && !subscriptionLoading) {
      setSubscriptionActionLabel('message househelps');
      setShowSubscriptionModal(true);
      return;
    }
    setActionLoading('chat');
    try {
      const profileType = (currentProfileType || '').toLowerCase();
      let householdId = currentUserId;
      let househelpId = househelpUserId;

      // If viewer is househelp and this profile belongs to a household (unlikely here), flip roles
      if (profileType === 'househelp') {
        householdId = househelpUserId;
        househelpId = currentUserId;
      }

      const payload: StartConversationPayload = {
        household_user_id: householdId,
        househelp_user_id: househelpId,
        househelp_profile_id: targetProfileId,
      };
      
      // Include household_profile_id if current user is household
      if (profileType === 'household' && currentHouseholdProfileId) {
        payload.household_profile_id = currentHouseholdProfileId;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (e) {
      console.error('Failed to start chat:', e);
      setError('Could not open conversation. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleShortlistToggle = async () => {
    if (!shortlistTargetId) {
      setActionError('This househelp has not published an open-for-work listing yet.');
      return;
    }
    setActionLoading('shortlist');
    setActionError(null);
    setActionSuccess(null);
    try {
      if (isShortlisted) {
        await shortlistService.deleteShortlist(shortlistTargetId);
        setIsShortlisted(false);
        setActionSuccess('Removed from shortlist.');
      } else {
        await shortlistService.createShortlist('', 'household', { profile_id: shortlistTargetId, profile_type: 'open_for_work' });
        setIsShortlisted(true);
        setActionSuccess('Added to shortlist.');
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (e) {
      console.error('Failed to update shortlist:', e);
      setActionError(e instanceof Error ? e.message : 'Failed to update shortlist');
    } finally {
      setActionLoading(null);
    }
  };

  const showOwnerBackButton = !isViewingOther && (currentProfileType?.toLowerCase() === 'househelp');
  const shouldShowBackButton = isViewingOther || showOwnerBackButton;
  const backButtonText = isViewingOther ? backButtonLabel : 'Back to My Profile';

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        {isEmbed ? null : <Navigation />}
        <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
          <main className="flex-1 py-8">
            <div className="max-w-6xl mx-auto px-4">
              <ProfilePageSkeleton />
            </div>
          </main>
        </PurpleThemeWrapper>
        {isEmbed ? null : <Footer />}
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-6 rounded-xl">
          <ErrorAlert message={error || "Profile not found"} />
        </div>
      </div>
    );
  }

  const resolvedFirstName = profile?.first_name || profile?.user?.first_name || user?.first_name;
  const resolvedLastName = profile?.last_name || profile?.user?.last_name || user?.last_name;
  const displayName = [resolvedFirstName, resolvedLastName].filter(Boolean).join(' ').trim();

  return (
    <div className="min-h-screen flex flex-col">
      {isEmbed ? null : <Navigation />}
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
        <main className="flex-1">
          <div className={`max-w-6xl mx-auto px-4 pb-6 ${isEmbed ? 'pt-4' : 'pt-6 sm:pt-8'}`}>
            {actionSuccess && <SuccessAlert message={actionSuccess} className="mb-4" />}
            {actionError && <ErrorAlert message={actionError} className="mb-4" />}
            {/* Header (hidden in embed) */}
            {!isEmbed && (
            <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 mb-4">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    {shouldShowBackButton && (
                      <button
                        onClick={isViewingOther ? handleBackNavigation : () => navigate('/househelp/profile')}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold transition-colors text-xs"
                      >
                        ← {backButtonText}
                      </button>
                    )}
                    <div>
                      <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                        {displayName || 'Househelp Profile'}
                      </h1>
                    </div>
                  </div>

                  {isViewingOther && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start lg:self-auto">
                      <button
                        onClick={handleShortlistToggle}
                        disabled={actionLoading === 'shortlist'}
                        aria-label={isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow transition-all ${
                          isShortlisted
                            ? 'bg-pink-500 border-pink-200 text-white hover:bg-pink-600'
                            : 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 hover:bg-purple-200'
                        } ${actionLoading === 'shortlist' ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleChat}
                        disabled={actionLoading === 'chat'}
                        aria-label="Chat"
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center shadow transition-all bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 ${
                          actionLoading === 'chat' ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (!hasActiveSubscription && !subscriptionLoading) {
                            setSubscriptionActionLabel('send hire requests');
                            setShowSubscriptionModal(true);
                            return;
                          }
                          setIsHireModalOpen(true);
                        }}
                        className="px-4 py-1.5 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all shadow-lg flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
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
              <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-4">📸 Photo Gallery</h2>
              {profile.photos && profile.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {profile.photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer border border-purple-200/40 dark:border-purple-500/30"
                      onClick={() => setSelectedImage(photo)}
                    >
                      {!imageLoaded[`photo-${idx}`] && (
                        <div className="hb-shimmer-piece absolute inset-0" />
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
                      <div className="absolute inset-0 bg-black/30 sm:bg-black/20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1 bg-white text-purple-600 rounded-xl text-xs font-semibold">
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

            <ProfileChoicesSection
              profile={profile as Record<string, any>}
              fallbackProfileId="6dbd5104-d314-4ef1-a7d3-37d7eb26ddff"
              profileType="househelp"
              title="Profile Details"
            />

            {(profile.user_id || user?.id || user?.user_id) && (
              <section className="mt-6">
                <h2 className="mb-4 text-sm font-semibold text-purple-300">Ratings & reviews</h2>
                <ProfileReviews
                  profileId={profile.user_id || user?.id || user?.user_id || ''}
                  profileType="househelp"
                  isOwnProfile={!isViewingOther}
                />
              </section>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
      {isEmbed ? null : <Footer />}

      {selectedImage && (
        <ImageViewModal
          imageUrl={selectedImage}
          altText="Profile photo"
          onClose={() => setSelectedImage(null)}
        />
      )}

      <SubscriptionRequiredModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        status={subscriptionStatus}
        actionLabel={subscriptionActionLabel}
        plansHref="/plans"
      />

      {isViewingOther && profile && (
        <HireRequestModal
          isOpen={isHireModalOpen}
          onClose={() => setIsHireModalOpen(false)}
          househelpId={profile.id || ''}
          househelpName={`${profile.first_name || ''} ${profile.last_name || ''}`.trim()}
          househelpSalaryExpectation={profile.salary_expectation}
          househelpSalaryFrequency={profile.salary_frequency}
          househelpOffersLiveIn={profile.offers_live_in}
          househelpOffersDayWorker={profile.offers_day_worker}
          househelpAvailability={profile.availability}
          househelpAvailableFrom={profile.available_from}
          househelpLocation={profile.town || profile.location?.name}
          househelpSkills={profile.skills}
          househelpLanguages={profile.languages}
          househelpYearsOfExperience={profile.years_of_experience}
        />
      )}
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
