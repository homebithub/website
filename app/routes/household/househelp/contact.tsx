import React, {useEffect, useState} from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router";
import {ArrowLeftIcon, HeartIcon, TrashIcon, LockClosedIcon, LockOpenIcon} from "@heroicons/react/24/outline";
import ReadOnlyUserImageCarousel from "~/components/features/household/househelp/ReadOnlyUserImageCarousel";
import ImageLightbox from "~/components/features/household/househelp/ImageLightbox";
import { profileService as grpcProfileService, profileViewService, shortlistService, imageService } from '~/services/grpc/authServices';
import { formatTimeAgo } from "~/utils/timeAgo";
import { ErrorAlert } from "~/components/ui/ErrorAlert";
import { SuccessAlert } from "~/components/ui/SuccessAlert";

export default function HousehelpProfile() {
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [shortlistLoading, setShortlistLoading] = useState(false);
    const [shortlistDisabled, setShortlistDisabled] = useState(false);
    const [shortlistDisabledReason, setShortlistDisabledReason] = useState<string | null>(null);
    const [shortlisted, setShortlisted] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleShortlist = async () => {
        if (!profileId) return;
        setShortlistLoading(true);
        setActionError(null);
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
            if (!shortlistDisabled) setActionError(err.message || 'Failed to shortlist');
        } finally {
            setShortlistLoading(false);
        }
    };

    const [searchParams] = useSearchParams();
    const location = useLocation();
    const locationState = (location.state || {}) as {
      profileId?: string;
      backTo?: string;
      backLabel?: string;
    };
    const profileId =
      searchParams.get("profileId") ||
      searchParams.get("profile_id") ||
      locationState.profileId ||
      "";
    const tabParam = searchParams.get("tab");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [unlockedContact, setUnlockedContact] = useState<{ phone?: string; email?: string } | null>(null);
    const [retryKey, setRetryKey] = useState(0);
    const navigate = useNavigate();
    const backTo =
      searchParams.get("backTo") ||
      locationState.backTo ||
      (tabParam === 'shortlist' ? '/household/employment?tab=shortlist' : '/household/employment');
    const backLabel =
      searchParams.get("backLabel") ||
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
      navigate(`/household/househelp/contact?${nextParams.toString()}`, {
        replace: true,
        state: location.state,
      });
    }, [location.state, locationState.backLabel, locationState.backTo, locationState.profileId, navigate, searchParams]);

    const refreshUnlockedContact = React.useCallback(async () => {
      if (!profileId) return;
      const contact = await shortlistService.getUnlockedContact('', profileId);
      if (contact.unlocked && (contact.phone || contact.email)) {
        setUnlockedContact(contact);
        return;
      }
      setUnlockedContact(null);
    }, [profileId]);

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
                try {
                    await refreshUnlockedContact();
                } catch (err) {
                    console.warn('Failed to fetch unlocked contact:', err);
                }
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
    }, [profileId, refreshUnlockedContact, retryKey]);

    // Carousel state (must be above any early returns)
    const [images, setImages] = useState<any[]>([]);
    const [carouselIdx, setCarouselIdx] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIdx, setLightboxIdx] = useState(0);

    // Only fetch images once data is loaded
    useEffect(() => {
      if (!data || !data.User || !data.User.id) return;
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
      fetchImages(data.User.id);
    }, [data && data.User && data.User.id]);

    if (loading) return <div className="flex justify-center py-12">Loading...</div>;
    if (error) {
      return (
        <div className="flex justify-center py-12 px-4">
          <div className="max-w-xl w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-center text-red-700">
            <p>{error}</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setRetryKey((prev) => prev + 1)}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={handleBackNavigation}
                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
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
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700"
              >
                Try Again
              </button>
              <button
                onClick={handleBackNavigation}
                className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100"
              >
                {backLabel}
              </button>
            </div>
          </div>
        </div>
      );
    }

    const {User, Househelp} = data;

    return (
      <>
        {showUnlockModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-3 sm:p-4">
              <div 
                className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-md"
                onClick={() => setShowUnlockModal(false)}
              />
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 sm:p-6 w-full max-w-[calc(100%-1.5rem)] sm:max-w-md">
              <h2 className="text-base sm:text-lg font-bold mb-2 text-center text-primary-700 dark:text-primary-300">Unlock Contact</h2>
              <p className="mb-3 text-xs sm:text-sm text-gray-700 dark:text-gray-200 text-center">
                You can keep up to 3 profiles unlocked at the same time. Unlock this shortlisted profile to reveal the latest phone number and email for a limited period.
              </p>
              <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                This only works for profiles already in your shortlist.
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  className="px-4 py-1 text-sm rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  onClick={() => setShowUnlockModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex items-center justify-center gap-2 px-4 py-1 text-sm rounded-xl bg-green-600 hover:bg-green-700 text-white font-bold shadow transition-colors"
                  onClick={async () => {
                    try {
                      if (!profileId) throw new Error('No profile selected');
                      const data = await shortlistService.unlockShortlist('', profileId);
                      if (!data.unlocked) throw new Error('Contact is still locked');
                      setUnlockedContact(data);
                      setShowUnlockModal(false);
                      setActionError(null);
                      setSuccessMessage('Contact unlocked successfully.');
                    } catch (err: any) {
                      setActionError(err.message || 'Failed to unlock contact');
                    }
                  }}
                >
                  <span>Unlock Contact</span>
                </button>
              </div>
            </div>
            </div>
          </div>
        )}

        {/* User Information Section */}
        <div className="bg-white  rounded-2xl shadow-lg border border-gray-100  p-8 sm:p-12 md:px-24 relative w-full mx-2 sm:mx-6 md:mx-16 max-w-4xl flex flex-col items-center mb-8">
          {successMessage && <SuccessAlert message={successMessage} className="w-full mb-4" />}
          {actionError && <ErrorAlert message={actionError} className="w-full mb-4" />}
          {/* Back button and action buttons */}
          <div className="flex flex-row items-center justify-between gap-4 w-full mb-4">
            <button
              onClick={handleBackNavigation}
              className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition"
              aria-label={backLabel}
              type="button"
            >
              <ArrowLeftIcon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
            </button>
            {shortlisted ? (
              <>
                <button
                  className={`flex items-center justify-center gap-1 px-4 py-1 min-w-[130px] rounded-full font-semibold shadow transition bg-red-600 hover:bg-red-700 text-white text-xs ${shortlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  aria-label="Reject"
                  onClick={async () => {
                      setShortlistLoading(true);
                      try {
                        await shortlistService.deleteShortlist(profileId!);
                        setShortlisted(false);
                        setShortlistDisabled(false);
                        setShortlistDisabledReason(null);
                        setActionError(null);
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
                        setActionError(err.message || 'Failed to remove from shortlist');
                      } finally {
                        setShortlistLoading(false);
                      }
                    }}
                    disabled={shortlistLoading}
                    tabIndex={0}
                  >
                    <span>{shortlistLoading ? 'Removing...' : 'Reject'}</span>
                    <TrashIcon className="w-4 h-4 ml-1" />
                  </button>
                  <button
                    className="flex items-center justify-center gap-1 px-4 py-1 min-w-[130px] rounded-full font-semibold shadow transition bg-purple-600 hover:bg-purple-700 text-white dark:bg-purple-500 dark:hover:bg-purple-400 text-xs"
                    aria-label="Unlock Contact"
                    onClick={() => setShowUnlockModal(true)}
                    tabIndex={0}
                  >
                    <span>View Contact</span>
                    {unlockedContact ? (
                      <LockOpenIcon className="w-4 h-4 ml-1" />
                    ) : (
                      <LockClosedIcon className="w-4 h-4 ml-1" />
                    )}
                  </button>
                </>
              ) : (
                <>
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
                  {shortlistDisabled && shortlistDisabledReason && (
                    <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-56 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 text-xs rounded px-3 py-1 shadow-lg z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                      {shortlistDisabledReason}
                    </div>
                  )}
                </>
              )}
            </div>
          <div className="flex flex-col items-center w-full mb-6 mt-2 gap-2">
            <img
              src={Househelp.avatar_url || "https://placehold.co/96x96?text=HH"}
              alt={User.first_name}
              className="w-24 h-24 rounded-full object-cover bg-gray-200 mb-3"
            />
            {/* Name and KE badge */}
            <div className="flex flex-col items-center mb-2">
              <div className="text-2xl font-bold text-slate-900 ">{User.first_name} {User.last_name}</div>
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


          </div>

          {/* Verified + Country */}
          <div className="flex gap-2 mb-4">
            {Househelp.verified && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Verified</span>
            )}
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">{User.country}</span>
          </div>

          {/* Unlocked contact info */}
          {unlockedContact && (
            <div className="mt-2 flex flex-col items-center">
              <div className="text-lg font-bold text-purple-600">Phone: {unlockedContact.phone}</div>
              {unlockedContact.email && (
                <div className="text-lg font-bold text-purple-600">Email: {unlockedContact.email}</div>
              )}
            </div>
          )}

          {/* User details */}
          <div className="w-full mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-2 text-sm">
              {/* User fields */}
              <div>
                <div className="text-gray-400 ">First Name</div>
                <div className="text-sm text-slate-900  font-medium">{User.first_name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Last Name</div>
                <div className="text-sm text-slate-900  font-medium">{User.last_name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Email</div>
                <div className="text-sm text-slate-900  font-medium">{unlockedContact?.email || 'Unlock to view'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Phone</div>
                <div className="text-sm text-slate-900  font-medium">{unlockedContact?.phone || 'Unlock to view'}</div>
              </div>


              <div>
                <div className="text-gray-400 ">User Created At</div>
                <div className="text-sm text-slate-900  font-medium">{User.created_at ? formatTimeAgo(User.created_at) : '-'}</div>
              </div>


              {/* Househelp fields */}
              <div>
                <div className="text-gray-400 ">Bio</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.bio || '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Address</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.address || '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Status</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.status || '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Verified</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.verified ? 'Yes' : 'No'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Rating</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.rating} ({Househelp.review_count} reviews)</div>
              </div>
              <div>
                <div className="text-gray-400 ">Skills</div>
                <div className="text-sm text-slate-900  font-medium">{Array.isArray(Househelp.skills) && Househelp.skills.length > 0 ? Househelp.skills.join(', ') : '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Experience</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.experience || 0} years</div>
              </div>

              <div>
                <div className="text-gray-400 ">Languages</div>
                <div className="text-sm text-slate-900  font-medium">{Array.isArray(Househelp.languages) && Househelp.languages.length > 0 ? Househelp.languages.join(', ') : '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Specialities</div>
                <div className="text-sm text-slate-900  font-medium">{Array.isArray(Househelp.specialities) && Househelp.specialities.length > 0 ? Househelp.specialities.join(', ') : '-'}</div>
              </div>



              <div>
                <div className="text-gray-400 ">Salary Expectation</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.salary_expectation ? `KES ${Househelp.salary_expectation}` : '-'}</div>
              </div>
              <div>
                <div className="text-gray-400 ">Salary Frequency</div>
                <div className="text-sm text-slate-900  font-medium">{Househelp.salary_frequency || '-'}</div>
              </div>

            </div>
          </div>
        </div>
      </>


      );
    }

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
