import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router";
import { ArrowLeftIcon, HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import ReadOnlyUserImageCarousel from "~/components/features/household/househelp/ReadOnlyUserImageCarousel";
import ImageLightbox from "~/components/features/household/househelp/ImageLightbox";
import { profileService as grpcProfileService, profileViewService, shortlistService, imageService } from '~/services/grpc/authServices';
import { formatTimeAgo } from "~/utils/timeAgo";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";
import { formatOnboardingAmountWithFrequency } from "~/utils/onboardingCompensation";

export default function HousehelpProfile() {
  // Carousel state (ALWAYS at the top)
  const [images, setImages] = useState<any[]>([]);
  const [carouselIdx, setCarouselIdx] = useState(0);
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [shortlistDisabled, setShortlistDisabled] = useState(false);
  const [shortlistDisabledReason, setShortlistDisabledReason] = useState<string | null>(null);
  const [shortlisted, setShortlisted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleShortlist = async () => {
    if (!profileId) return;
    setShortlistLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      await shortlistService.createShortlist('', 'househelp', {
        profile_id: profileId,
        profile_type: 'househelp',
      });
      setShortlisted(true);
      setShortlistDisabled(true);
      setShortlistDisabledReason('You have already shortlisted this profile.');
      setSuccessMessage('Added to shortlist.');
    } catch (err: any) {
      if (!shortlistDisabled) setError(err.message || 'Failed to shortlist');
    } finally {
      setShortlistLoading(false);
    }
  };


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  // Fetch images after data is loaded and User.id is available
  useEffect(() => {
    async function fetchImages(userId: string) {
      try {
        const imgData = await imageService.getImagesByUserID(userId);
        const imgs = imgData?.images || imgData?.data?.images || imgData?.data || [];
        setImages(Array.isArray(imgs) ? imgs : []);
        setCarouselIdx(0);
      } catch {
        setImages([]);
      }
    }
    if (data && data.User && data.User.id) {
      fetchImages(data.User.id);
    }
  }, [data && data.User && data.User.id]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as {
    profileId?: string;
    backTo?: string;
    backLabel?: string;
  };
  const profileId =
    searchParams.get('profileId') ||
    searchParams.get('profile_id') ||
    locationState.profileId ||
    '';
  const tabParam = searchParams.get('tab');
  const backTo =
    searchParams.get('backTo') ||
    locationState.backTo ||
    (tabParam === 'shortlist' ? '/household/employment?tab=shortlist' : '/household/employment');
  const backLabel =
    searchParams.get('backLabel') ||
    locationState.backLabel ||
    (tabParam === 'shortlist' ? 'Back to Shortlist' : 'Back');

  const handleBackNavigation = () => {
    navigate(backTo, { replace: true });
  };

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    let changed = false;

    if (locationState.profileId && !nextParams.get('profileId') && !nextParams.get('profile_id')) {
      nextParams.set('profileId', locationState.profileId);
      changed = true;
    }
    if (locationState.backTo && !nextParams.get('backTo')) {
      nextParams.set('backTo', locationState.backTo);
      changed = true;
    }
    if (locationState.backLabel && !nextParams.get('backLabel')) {
      nextParams.set('backLabel', locationState.backLabel);
      changed = true;
    }

    if (!changed) return;
    navigate(`/household/househelp/profile?${nextParams.toString()}`, {
      replace: true,
      state: location.state,
    });
  }, [location.state, locationState.backLabel, locationState.backTo, locationState.profileId, navigate, searchParams]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!profileId) throw new Error("No profile ID provided");
        // Check if already shortlisted
        try {
          const shortlistData = await shortlistService.shortlistExists('', profileId);
          const exists = !!(shortlistData?.getExists?.() ?? shortlistData?.exists);
          setShortlisted(exists);
          if (exists) {
            setShortlistDisabled(true);
            setShortlistDisabledReason('You have already shortlisted this profile.');
          } else {
            setShortlistDisabled(false);
            setShortlistDisabledReason(null);
          }
        } catch { /* ignore */ }
        // Track profile view via gRPC
        try {
          await profileViewService.recordView('', profileId, 'househelp');
        } catch (err) {
          console.warn('Failed to record profile view:', err);
        }
        // Fetch profile via gRPC
        const profileData = await grpcProfileService.getHousehelpProfileWithUser(profileId);
        setData(profileData);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId, retryKey]);

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error && !data) {
    return (
      <div className="flex justify-center py-12 px-4">
        <div className="max-w-xl w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center text-red-700">
          <p>{error}</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setRetryKey((prev) => prev + 1)}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={handleBackNavigation}
              className="rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex justify-center py-12 px-4">
        <div className="max-w-xl w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center text-red-700">
          <p>Profile data is unavailable right now. Please try again.</p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setRetryKey((prev) => prev + 1)}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700"
            >
              Try Again
            </button>
            <button
              onClick={handleBackNavigation}
              className="rounded-xl border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
            >
              {backLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { User, Househelp } = data;
  const profileName = [User?.first_name, User?.last_name].filter(Boolean).join(' ') || 'Househelp';


  return (
    <div className="w-full flex justify-center bg-transparent mt-4 sm:mt-2">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 sm:p-12 px-8 sm:px-16 md:px-24 relative w-full mx-2 sm:mx-6 md:mx-16 max-w-5xl">
        {successMessage && <SuccessAlert message={successMessage} className="mt-6 mb-0" />}
        {error && <ErrorAlert message={error} className="mt-6 mb-0" />}

        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
        <button onClick={handleBackNavigation} className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition" aria-label={backLabel}>
          <ArrowLeftIcon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
        </button>
        <div className="flex items-center">
          <span className="text-lg font-bold text-primary dark:text-primary-300">{profileName}</span>
        </div>
        <div className="relative inline-block group">
          {shortlisted ? (
            <>
              <button
                className={`flex items-center gap-2 px-4 py-1 rounded-full font-semibold shadow transition bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400 ${shortlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-label="Reject"
                onClick={async () => {
                  setShortlistLoading(true);
                  try {
                    await shortlistService.deleteShortlist(profileId!);
                    setShortlisted(false);
                    setShortlistDisabled(false);
                    setShortlistDisabledReason(null);
                    setError(null);
                    setSuccessMessage('Removed from shortlist.');
                    try {
                      const shortlistData = await shortlistService.shortlistExists('', profileId!);
                      const exists = !!(shortlistData?.getExists?.() ?? shortlistData?.exists);
                      setShortlisted(exists);
                      if (exists) {
                        setShortlistDisabled(true);
                        setShortlistDisabledReason('You have already shortlisted this profile.');
                      } else {
                        setShortlistDisabled(false);
                        setShortlistDisabledReason(null);
                      }
                    } catch { /* ignore */ }
                  } catch (err: any) {
                    setError(err.message || 'Failed to remove from shortlist');
                  } finally {
                    setShortlistLoading(false);
                  }
                }}
                disabled={shortlistLoading}
                tabIndex={0}
              >
                <span>{shortlistLoading ? 'Removing...' : 'Reject'}</span>
                <TrashIcon className="w-6 h-6" />
              </button>
              {shortlistDisabled && shortlistDisabledReason && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-56 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 text-xs rounded px-3 py-1 shadow-lg z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                  {shortlistDisabledReason}
                </div>
              )}
            </>
          ) : (
            <button
              className={`flex items-center gap-2 px-4 py-1 rounded-full font-semibold shadow transition
                ${shortlistDisabled ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 text-white dark:bg-primary-500 dark:hover:bg-primary-400'}
                ${shortlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
              aria-label="Shortlist"
              onClick={shortlistDisabled ? undefined : handleShortlist}
              disabled={shortlistLoading || shortlistDisabled}
              tabIndex={0}
            >
              <span>{shortlistLoading ? 'Shortlisting...' : 'Shortlist'}</span>
              <HeartIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
      {/* User Information Section */}
      <div className="flex flex-col items-center mb-8">
        <img
          src={Househelp.avatar_url || "https://placehold.co/96x96?text=HH"}
          alt={User.first_name}
          className="w-24 h-24 rounded-full object-cover bg-gray-200 mb-3"
        />
        {/* Name and KE badge BELOW AVATAR */}
        <div className="flex flex-col items-center mb-2">
          <div className="text-xl font-bold text-primary-900 dark:text-primary-100">{User.first_name} {User.last_name}</div>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs mt-1">{User.country}</span>
        </div>
        {/* User Images Carousel BELOW NAME */}
        {images.length > 0 && (
          <>
            <div className="w-full max-w-xs mb-4">
              <ReadOnlyUserImageCarousel
                images={images}
                carouselIdx={carouselIdx}
                setCarouselIdx={setCarouselIdx}
                onExpand={(idx: number) => {
                  setLightboxOpen(true);
                  setLightboxIdx(idx);
                }}
              />
            </div>
            <ImageLightbox
              images={images}
              open={lightboxOpen}
              index={lightboxIdx}
              onClose={() => setLightboxOpen(false)}
              onPrev={() => setLightboxIdx((i) => Math.max(0, i - 1))}
              onNext={() => setLightboxIdx((i) => Math.min(images.length - 1, i + 1))}
            />
          </>
        )}
        {/* Optionally, show Verified badge below carousel if needed */}

      </div>
      {/* Househelp Profile Information Section */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full max-w-2xl mx-auto text-xs text-left">
          {/* <div><span className="font-semibold">Bureau ID:</span> {Househelp.bureau_id}</div> */}
          <div><span className="font-semibold">Bio:</span> {Househelp.bio || '-'}</div>
          <div><span className="font-semibold">Address:</span> {Househelp.address || '-'}</div>
          <div><span className="font-semibold">Experience:</span> {Househelp.experience} years</div>
          <div><span className="font-semibold">Skills:</span> {Househelp.skills && Househelp.skills.length ? Househelp.skills.join(', ') : '-'}</div>
          <div><span className="font-semibold">Specialities:</span> {Househelp.specialities && Househelp.specialities.length ? Househelp.specialities.join(', ') : '-'}</div>
          <div><span className="font-semibold">Languages:</span> {Househelp.languages && Househelp.languages.length ? Househelp.languages.join(', ') : '-'}</div>
          <div><span className="font-semibold">Hourly Rate:</span> {Househelp.hourly_rate ? Househelp.hourly_rate : '-'}</div>
          <div>
            <span className="font-semibold">Salary Expectation:</span>{' '}
            {formatOnboardingAmountWithFrequency(Househelp.salary_expectation, Househelp.salary_frequency, '-')}
          </div>

          <div><span className="font-semibold">Rating:</span> {Househelp.rating} ({Househelp.review_count} reviews)</div>
          <div><span className="font-semibold">References:</span> {Househelp.references ? Househelp.references : '-'}</div>
          <div><span className="font-semibold">Images:</span> {Househelp.images ? JSON.stringify(Househelp.images) : '-'}</div>
          <div><span className="font-semibold">Created At:</span> {Househelp.created_at ? formatTimeAgo(Househelp.created_at) : '-'}</div>

        </div>
      </div>

          {/* All fields already rendered above in grid sections. No further rendering needed. */}
        </div>
      </div>

  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
