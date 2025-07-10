import React, { useEffect, useState } from "react";
import {useSearchParams, useNavigate, useLocation} from "@remix-run/react";
import { ArrowLeftIcon, HeartIcon, TrashIcon } from "@heroicons/react/24/outline";
import ReadOnlyUserImageCarousel from "~/components/househelp/ReadOnlyUserImageCarousel";
import ImageLightbox from "~/components/househelp/ImageLightbox";

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

  const handleShortlist = async () => {
    if (!profileId) return;
    setShortlistLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(`http://localhost:8080/api/v1/shortlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          profile_id: profileId,
          profile_type: 'househelp',
        }),
      });
      if (!res.ok) {
        let errData;
        try {
          errData = await res.json();
        } catch {
          throw new Error('Failed to shortlist');
        }
        if (
          res.status === 400 &&
          errData.message === 'profile is currently unlocked and not expired'
        ) {
          setShortlistDisabled(true);
          setShortlisted(false);
          setShortlistDisabledReason('This profile is currently unlocked and cannot be shortlisted until it expires.');
          return;
        }
        throw new Error(errData.message || 'Failed to shortlist');
      }
      // Optionally, show success or update UI
      setShortlisted(true);
      setShortlistDisabled(true);
      setShortlistDisabledReason('You have already shortlisted this profile.');
    } catch (err: any) {
      if (!shortlistDisabled) alert(err.message || 'Failed to shortlist');
    } finally {
      setShortlistLoading(false);
    }
  };


  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch images after data is loaded and User.id is available
  useEffect(() => {
    async function fetchImages(userId: string) {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:8080/api/v1/images/user/${userId}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : undefined }
      );
      if (res.ok) {
        const data = await res.json();
        setImages(Array.isArray(data.images) ? data.images : []);
        setCarouselIdx(0);
      } else {
        setImages([]);
      }
    }
    if (data && data.User && data.User.id) {
      fetchImages(data.User.id);
    }
  }, [data && data.User && data.User.id]);

  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as { profileId?: string };
  const profileId = locationState.profileId

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        if (!profileId) throw new Error("No profile ID provided");
        // Check if already shortlisted
        const shortlistRes = await fetch(`http://localhost:8080/api/v1/shortlists/exists/${profileId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (shortlistRes.ok) {
          const shortlistData = await shortlistRes.json();
          setShortlisted(!!shortlistData.exists);
          if (shortlistData.exists) {
            setShortlistDisabled(true);
            setShortlistDisabledReason('You have already shortlisted this profile.');
          } else {
            setShortlistDisabled(false);
            setShortlistDisabledReason(null);
          }
        }
        // Track profile view
        await fetch(`http://localhost:8080/api/v1/profile-view/record`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile_id: profileId,
            profile_type: 'househelp',
          }),
        });
        // Fetch profile
        const res = await fetch(`http://localhost:8080/api/v1/househelps/${profileId}/profile_with_user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch househelp profile");
        const data = await res.json();
        setData(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [profileId]);

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-6 text-center">{error}</div>;
  if (!data) return null;

  const { User, Househelp } = data;


  return (
    <div className="w-full flex justify-center bg-transparent mt-4 sm:mt-2">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-8 sm:p-12 px-8 sm:px-16 md:px-24 relative w-full mx-2 sm:mx-6 md:mx-16 max-w-5xl">
      
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-primary-100 dark:hover:bg-primary-900 transition" aria-label="Back">
          <ArrowLeftIcon className="w-6 h-6 text-primary-700 dark:text-primary-300" />
        </button>
        <span className="text-xl font-bold text-primary dark:text-primary-300">Househelp Profile</span>
        <div className="relative inline-block group">
          {shortlisted ? (
            <>
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-400 ${shortlistLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
                aria-label="Reject"
                onClick={async () => {
                  setShortlistLoading(true);
                  try {
                    const token = localStorage.getItem('token');
                    if (!token) throw new Error('Not authenticated');
                    const res = await fetch(`http://localhost:8080/api/v1/shortlists/${profileId}`, {
                      method: 'DELETE',
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) {
                      const errData = await res.json();
                      throw new Error(errData.message || 'Failed to remove from shortlist');
                    }
                    // After removal, re-check shortlist status and unlock logic
                    setShortlisted(false);
                    setShortlistDisabled(false);
                    setShortlistDisabledReason(null);
                    // Optionally, re-run the shortlist check
                    const shortlistRes = await fetch(`http://localhost:8080/api/v1/shortlists/exists/${profileId}`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (shortlistRes.ok) {
                      const shortlistData = await shortlistRes.json();
                      setShortlisted(!!shortlistData.exists);
                      if (shortlistData.exists) {
                        setShortlistDisabled(true);
                        setShortlistDisabledReason('You have already shortlisted this profile.');
                      } else {
                        setShortlistDisabled(false);
                        setShortlistDisabledReason(null);
                      }
                    }
                  } catch (err: any) {
                    alert(err.message || 'Failed to remove from shortlist');
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
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 w-56 bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900 text-xs rounded px-3 py-2 shadow-lg z-10 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                  {shortlistDisabledReason}
                </div>
              )}
            </>
          ) : (
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold shadow transition
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
          <div className="text-2xl font-bold text-primary-900 dark:text-primary-100">{User.first_name} {User.last_name}</div>
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
                onExpand={(idx) => {
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
          <div><span className="font-semibold">Salary Expectation:</span> {Househelp.salary_expectation ? `${Househelp.salary_expectation} (${Househelp.salary_frequency})` : '-'}</div>

          <div><span className="font-semibold">Rating:</span> {Househelp.rating} ({Househelp.review_count} reviews)</div>
          <div><span className="font-semibold">References:</span> {Househelp.references ? Househelp.references : '-'}</div>
          <div><span className="font-semibold">Images:</span> {Househelp.images ? JSON.stringify(Househelp.images) : '-'}</div>
          <div><span className="font-semibold">Created At:</span> {Househelp.created_at ? new Date(Househelp.created_at).toLocaleString() : '-'}</div>

        </div>
      </div>

          {/* All fields already rendered above in grid sections. No further rendering needed. */}
        </div>
      </div>

  );
}
