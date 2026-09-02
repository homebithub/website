import { getAccessTokenFromCookies } from '~/utils/cookie';
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSubscription } from '~/hooks/useSubscription';
import { NOTIFICATIONS_API_BASE_URL } from '~/config/api';
import { documentService, shortlistService, listingApplicationService } from '~/services/grpc/authServices';
import { getInboxRoute, startOrGetConversation, type StartConversationPayload } from '~/utils/conversationLauncher';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import { MessageCircle, Heart } from "lucide-react";
import { getStoredProfileType, getStoredUser, getStoredUserId, getStoredUserProfileId } from '~/utils/authStorage';
import { isServiceProviderProfileType } from '~/utils/profileType';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { resolveHouseholdOwnerUserId, resolveHouseholdProfile } from '~/utils/householdProfiles';
import { SubscriptionRequiredModal } from '~/components/subscriptions/SubscriptionRequiredModal';
import { ProfilePageSkeleton } from "~/components/ShimmerLoader";
import ProfileReviews from "~/components/ProfileReviews";
import { useProfileViewTracking } from "~/hooks/useProfileViewTracking";
import { ProfileChoicesSection } from '~/components/profile/ProfileChoicesSection';
import { FullPageError } from '~/components/FullPageError';

interface HouseholdData {
  id?: string;
  profile_id?: string;
  user_profile_id?: string;
  user_id?: string;
  owner_user_id?: string;
  owner?: { id?: string; first_name?: string; last_name?: string };
  first_name?: string;
  last_name?: string;
  owner_first_name?: string;
  owner_last_name?: string;
  photos?: string[];
}

export default function HouseholdPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isEmbed = params.get("embed") === "1" || params.get("embed") === "true";
  const queryBackTo = params.get("backTo");
  const queryBackLabel = params.get("backLabel");
  const querySource = params.get("from");
  const queryJobId = params.get("jobId") || params.get("job_id");
  const navigationState = (location.state ?? {}) as {
    profileId?: string;
    backTo?: string;
    backLabel?: string;
    fromInbox?: boolean;
    fromShortlist?: boolean;
    fromHireRequests?: boolean;
  };
  const currentUser = useMemo(() => getStoredUser(), []);
  const currentUserId = currentUser?.user_id || currentUser?.id || getStoredUserId() || null;
  const viewerProfileType = currentUser?.profile_type || getStoredProfileType() || null;
  const stateSource =
    navigationState.fromInbox ? 'inbox' :
    navigationState.fromShortlist ? 'shortlist' :
    navigationState.fromHireRequests ? 'hiring' :
    undefined;
  const resolvedUserId =
    params.get("userId") ||
    params.get("user_id") ||
    params.get("profileId") ||
    params.get("profile_id") ||
    navigationState.profileId ||
    currentUserId;
  const [profile, setProfile] = useState<HouseholdData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isShortlisted, setIsShortlisted] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [subscriptionActionLabel, setSubscriptionActionLabel] = useState('unlock full profile information');
  const { isActive: hasActiveSubscription, status: subscriptionStatus, loading: subscriptionLoading } = useSubscription(currentUserId);
  const profileOwnerUserId = resolveHouseholdOwnerUserId(profile);

  useEffect(() => {
    const nextParams = new URLSearchParams(params);
    let changed = false;

    if (navigationState.profileId && !nextParams.get('profileId') && !nextParams.get('profile_id') && !nextParams.get('userId') && !nextParams.get('user_id')) {
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

    if (!changed) return;
    navigate(`/household/public-profile?${nextParams.toString()}`, {
      replace: true,
      state: location.state,
    });
  }, [location.state, navigate, navigationState.backLabel, navigationState.backTo, navigationState.profileId, params, stateSource]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = getAccessTokenFromCookies();
        if (!token) throw new Error("Not authenticated");
        if (!resolvedUserId) throw new Error("Missing household user id");

        // Application and marketplace payloads do not use `id` consistently:
        // some expose the owner user id and others the user_profile id. Resolve
        // both shapes instead of trusting the query parameter's label.
        const profileData = await resolveHouseholdProfile(resolvedUserId, {
          identifierType: 'auto',
        }) as HouseholdData | null;

        if (!profileData) {
          throw new Error("Failed to load profile");
        }

        const ownerUserId = resolveHouseholdOwnerUserId(profileData) || resolvedUserId;

        // The page is released on the profile, not on the photos. Everything
        // written on it — the name, the location, what they are hiring for —
        // arrived in the call above, and holding all of it behind a second
        // request for pictures made the whole page as slow as its least
        // important part.
        setProfile(profileData);
        setLoading(false);

        try {
          const docsData = await documentService.getUserDocuments(ownerUserId, 'profile_photo');
          const docs = docsData?.data || docsData?.documents || docsData || [];
          const documentsArray = Array.isArray(docs) ? docs : [];
          const photoUrls = documentsArray.map((doc: any) => doc.public_url || doc.signed_url || doc.url).filter(Boolean);
          if (photoUrls.length > 0) {
            setProfile((current) => (current ? { ...current, photos: photoUrls } : current));
          }
        } catch (err) {
          console.error("Failed to fetch profile photos:", err);
        }
      } catch (err: any) {
        console.error("Error loading household profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [resolvedUserId, currentUserId, retryKey]);

  const isViewingOwn = !!currentUserId && !!profileOwnerUserId && profileOwnerUserId === currentUserId;
  useProfileViewTracking({
    profileId: profile?.id || '',
    profileType: 'household',
    viewerUserId: currentUserId || undefined,
    enabled: Boolean(profile?.id && !isViewingOwn),
  });
  const viewerType = viewerProfileType?.toLowerCase();
  const canInteract = isServiceProviderProfileType(viewerType) && !isViewingOwn;
  const canShortlist = canInteract && !!queryJobId;
  const canChat = canInteract && !!profileOwnerUserId;

  useEffect(() => {
    if (!canShortlist || !queryJobId) {
      setIsShortlisted(false);
      return;
    }

    let cancelled = false;
    const checkShortlist = async () => {
      try {
        const token = getAccessTokenFromCookies();
        if (!token) return;
        const raw = await shortlistService.listByHousehold('');
        const items = raw?.data || raw || [];
        if (!cancelled) {
          const ids = new Set(
            (Array.isArray(items) ? items : [])
              .filter((s: any) => s.profile_type === 'job')
              .map((s: any) => s.profile_id)
              .filter(Boolean)
          );
          setIsShortlisted(ids.has(queryJobId));
        }
      } catch (err) {
        console.error("Failed to fetch shortlist status", err);
      }
    };
    checkShortlist();
    return () => {
      cancelled = true;
    };
  }, [canShortlist, queryJobId]);

  // Check whether the service provider has already expressed interest.
  
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
      navigate('/shortlist');
      return;
    }
    if (resolvedSource === 'hiring') {
      navigate('/service-provider/hire-requests');
      return;
    }
    if (isViewingOwn) {
      navigate('/household/profile');
      return;
    }
    navigate('/', { replace: true });
  };

  const backLabel =
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
      : isViewingOwn
      ? 'Back to My Profile'
      : 'Back');

  const handleToggleShortlist = async () => {
    if (!queryJobId) {
      setActionError('Open a specific job before adding it to your shortlist.');
      return;
    }
    setActionLoading('shortlist');
    setActionError(null);
    setActionSuccess(null);
    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error("Not authenticated");
      if (isShortlisted) {
        await shortlistService.deleteShortlist(queryJobId);
        setIsShortlisted(false);
        setActionSuccess('Removed from shortlist.');
      } else {
        const serviceProviderId = getStoredUserProfileId();
        if (!serviceProviderId) {
          throw new Error('User profile information is missing. Please sign in again.');
        }

        await listingApplicationService.shortlistListing(queryJobId, serviceProviderId);
        setIsShortlisted(true);
        setActionSuccess('Job added to shortlist.');
      }
      window.dispatchEvent(new CustomEvent('shortlist-updated'));
    } catch (err) {
      console.error('Failed to update shortlist', err);
      setActionError(err instanceof Error ? err.message : 'Failed to update shortlist');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartChat = async () => {
    if (!profileOwnerUserId || !currentUserId) return;
    if (!hasActiveSubscription && !subscriptionLoading) {
      setSubscriptionActionLabel('message households');
      setShowSubscriptionModal(true);
      return;
    }
    setActionLoading('chat');
    try {
      // In this view, the current user is typically a service provider viewing a household profile.
      const payload: StartConversationPayload = {
        household_user_id: profileOwnerUserId,
        service_provider_user_id: currentUserId,
      };
      if (profile?.id) {
        payload.household_profile_id = profile.id;
      }

      const convId = await startOrGetConversation(NOTIFICATIONS_API_BASE_URL, payload);
      navigate(getInboxRoute(convId));
    } catch (err) {
      console.error('Failed to start chat', err);
      setError('Could not open conversation. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const shouldShowBackButton = true;
  const showActions = canShortlist || canChat;

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
    return <FullPageError title="Household profile unavailable" message="We couldn't load this household profile. It may have changed, or the connection may have been interrupted." onRetry={() => setRetryKey((value) => value + 1)} backTo={navigationState.backTo || queryBackTo} backLabel={backLabel} embed={isEmbed} />;
  }

  const ownerFirstName = profile.owner?.first_name || profile.owner_first_name || profile.first_name;
  const ownerLastName = profile.owner?.last_name || profile.owner_last_name || profile.last_name;
  const householdDisplayName = [ownerFirstName, ownerLastName].filter(Boolean).join(' ').trim();

  return (
    <div className="min-h-screen flex flex-col">
      {isEmbed ? null : <Navigation />}
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4">
            {actionSuccess && <SuccessAlert message={actionSuccess} className="mb-4" />}
            {actionError && <ErrorAlert message={actionError} className="mb-4" />}
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
                        <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                          🏠 {householdDisplayName || 'Household Profile'}
                        </h1>
                      </div>
                    </div>

                    {showActions && (
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 self-start lg:self-auto">
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
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

      {/* Profile Photos */}
      {profile.photos && profile.photos.length > 0 && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-4">📸 Home Photos</h2>
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
                  <span className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-white text-purple-600 rounded-xl text-xs font-semibold">View Full</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ProfileChoicesSection
        profile={profile as Record<string, any>}
        fallbackProfileId="11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1"
        profileType="household"
        title="Profile Details"
      />

      {profile.id && (
        <section className="mt-6">
          <h2 className="mb-4 text-sm font-semibold text-purple-300">Ratings & reviews</h2>
          <ProfileReviews
            profileId={profile.id}
            profileType="household"
            isOwnProfile={isViewingOwn}
          />
        </section>
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

      {/* Subscription Gate Modal */}
      <SubscriptionRequiredModal
        open={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        status={subscriptionStatus}
        actionLabel={subscriptionActionLabel}
        plansHref="/plans"
      />

    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
