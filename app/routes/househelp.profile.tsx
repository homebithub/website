import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { profileService as grpcProfileService, documentService } from '~/services/grpc/authServices';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import ConfirmDialog from '~/components/ConfirmDialog';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Eye } from 'lucide-react';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { ReferralCodeCard } from '~/components/referrals/ReferralCodeCard';
import ProfileViewsAnalytics from '~/components/ProfileViewsAnalytics';
import ProfileReviews from '~/components/ProfileReviews';
import { useProfileViewTracking } from '~/hooks/useProfileViewTracking';
import { ProfilePageSkeleton } from "~/components/ShimmerLoader";
import { ProfileAccountSummary } from '~/components/ProfileAccountSummary';
import { ProfileChoicesSection } from '~/components/profile/ProfileChoicesSection';
import { ProfileRequirementsChecklist } from '~/components/profile/ProfileRequirementsChecklist';
import { useOnboardingProgress } from '~/hooks/useOnboardingProgress';
import type { MissingRequirement } from '~/hooks/useOnboardingProgress';
import EditSectionModal from '~/components/ui/EditSectionModal';
import Location from '~/components/Location';
import { getStoredCanonicalProfileType, getStoredUser, getStoredUserId } from '~/utils/authStorage';
import { notifyProfileProgressChanged } from '~/utils/profileProgress';
import { IdentityVerificationPrompt } from '~/components/verification/IdentityVerificationPrompt';
import { useIdentityVerification } from '~/hooks/useIdentityVerification';
import { VerifiedBadge } from '~/components/VerifiedBadge';
import { CertificationDocuments } from '~/components/profile/CertificationDocuments';
import { PHOTO_ACCEPT_ATTRIBUTE, selectPhotosForUpload, uploadDocuments } from '~/utils/documentUploads';

interface HousehelpData {
  id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  years_of_experience?: number;
  work_with_kids?: boolean;
  work_with_pets?: boolean;
  languages?: string[];
  certifications?: string[];
  salary_expectation?: number;
  salary_frequency?: string;
  bio?: string;
  location?: any;
  available_from?: string;
  live_in?: boolean;
  day_worker?: boolean;
  photos?: string[];
  // Additional fields from onboarding
  children_age_range?: string;
  my_child_preference?: string;
  number_of_concurrent_children?: number;
  talent_with_kids?: string[];
  pet_types?: string;
  can_help_with?: string;
  can_drive?: boolean;
  first_aid_certificate?: boolean;
  certificate_of_good_conduct?: boolean;
  skills?: string[];
  traits?: string[];
  religion?: string;
  marital_status?: string;
  education_level?: string;
  has_kids?: boolean;
  needs_accommodation?: boolean;
  preferred_household_size?: string;
  preferred_location_type?: string;
  preferred_family_type?: string;
  work_environment_notes?: string;
  off_days?: string[];
  availability?: any;
  reference?: string;
  background_check_consent?: boolean;
  'househelp-type'?: string;
  status?: string;
  verified?: boolean;
  premium?: boolean;
  rating?: number;
  review_count?: number;
}

function normalizeHousehelpProfileResponse(response: any): HousehelpData {
  const raw = response?.data || response || {};
  const user = raw.user || {};

  const certifications = Array.isArray(raw.certifications)
    ? raw.certifications
    : (typeof raw.certifications === 'string' && raw.certifications.trim() !== ''
      ? [raw.certifications]
      : []);

  return {
    ...raw,
    first_name: raw.first_name || user.first_name || '',
    last_name: raw.last_name || user.last_name || '',
    work_with_kids: raw.work_with_kids ?? raw.can_work_with_kids ?? raw.can_work_with_kid ?? false,
    work_with_pets: raw.work_with_pets ?? raw.can_work_with_pets ?? false,
    live_in: raw.live_in ?? raw.offers_live_in ?? false,
    day_worker: raw.day_worker ?? raw.offers_day_worker ?? false,
    certifications,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    languages: Array.isArray(raw.languages) ? raw.languages : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
    traits: Array.isArray(raw.traits) ? raw.traits : [],
    off_days: Array.isArray(raw.off_days) ? raw.off_days : [],
    talent_with_kids: Array.isArray(raw.talent_with_kids) ? raw.talent_with_kids : [],
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

const MAX_PHOTOS = 5;

export default function HousehelpProfile() {
  const navigate = useNavigate();
  const identityVerification = useIdentityVerification(getStoredUserId());
  const { progress, refetch: refetchProgress } = useOnboardingProgress(getStoredUserId() || '', 'househelp');
  const [editingLocation, setEditingLocation] = useState(false);

  // Each outstanding requirement opens whatever satisfies it. Location has no
  // permanent section on this page, so it opens in a modal from the checklist.
  const handleResolveRequirement = (requirement: MissingRequirement) => {
    switch (requirement.action) {
      case 'features':
        handleCompleteFeaturePicks();
        break;
      case 'location':
        setEditingLocation(true);
        break;
      case 'photo':
        document.getElementById('profile-photos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        break;
      case 'verification':
        identityVerification.openModal();
        break;
      default:
        break;
    }
  };
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  
  // Track profile views (own profile)
  useProfileViewTracking({
    profileId: profile?.id || '',
    profileType: 'househelp',
    viewerUserId: profile?.user_id,
    enabled: false,
  });
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const canonicalProfileType = getStoredCanonicalProfileType();
    if (canonicalProfileType === 'household') {
      navigate('/household/profile', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      setHasError(false);
      try {
        const token = getAccessTokenFromCookies();
        if (!token) {
          navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }

        const canonicalProfileType = getStoredCanonicalProfileType();
        if (canonicalProfileType === 'household') {
          navigate('/household/profile', { replace: true });
          return;
        }

        const [profileResult, docsResult] = await Promise.allSettled([
          grpcProfileService.getCurrentHousehelpProfile(''),
          documentService.getUserDocuments('', 'profile_photo'),
        ]);

        const normalized = profileResult.status === 'fulfilled'
          ? normalizeHousehelpProfileResponse(profileResult.value)
          : normalizeHousehelpProfileResponse({
              id: (getStoredUser() || {}).user_profile_id || (getStoredUser() || {}).userProfileId || (getStoredUser() || {}).profile_id || '',
              user_id: (getStoredUser() || {}).user_id || (getStoredUser() || {}).id || getStoredUserId() || '',
              user: getStoredUser() || {},
            });

        if (docsResult.status === 'fulfilled') {
          const docs = docsResult.value?.data || docsResult.value?.documents || docsResult.value || [];
          const documentsArray = Array.isArray(docs) ? docs : [];
          const photoUrls = documentsArray.map((doc: any) => doc.public_url || doc.signed_url || doc.url).filter(Boolean);
          if (photoUrls.length > 0) {
            normalized.photos = photoUrls;
          }
        } else if (docsResult.status === 'rejected') {
          console.error('Failed to fetch profile photos:', docsResult.reason);
        }

        setProfile(normalized);
      } catch (err: any) {
        console.error("Error loading househelp profile:", err);
        setError(err.message || "Failed to load profile");
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate, retryKey]);

  const handleCompleteFeaturePicks = () => {
    const storedProfileId = typeof window !== 'undefined' ? window.localStorage.getItem('profile_id') || '' : '';
    const storedUserProfileId = typeof window !== 'undefined' ? window.localStorage.getItem('user_profile_id') || '' : '';

    navigate('/onboarding/features', {
      state: {
        profileId: storedProfileId || '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff',
        userProfileId: storedUserProfileId,
        profileType: 'househelp',
        returnTo: '/househelp/profile',
      },
    });
  };

  const [showViewsModal, setShowViewsModal] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files: selectedFiles, error: selectionError } = selectPhotosForUpload(
      e.target.files,
      profile?.photos?.length || 0,
      MAX_PHOTOS,
    );
    // Clear the input either way, so re-picking the same files fires onChange.
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (selectionError) {
      setUploadError(selectionError);
      return;
    }
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(1);

    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error('Not authenticated');

      const uploadData = await uploadDocuments({
        files: selectedFiles,
        documentType: 'profile_photo',
        profileId: profile?.id,
        description: 'Profile photo',
        onProgress: setUploadProgress,
      });
      const uploadedDocs = uploadData.data || uploadData.documents || [];
      if (!Array.isArray(uploadedDocs) || uploadedDocs.length === 0) {
        throw new Error('The upload completed, but no photos were returned.');
      }

      // Refetch photos from documents table via gRPC
      try {
        const docsData = await documentService.getUserDocuments('', 'profile_photo');
        const docs = docsData?.data || docsData?.documents || docsData || [];
        const documentsArray = Array.isArray(docs) ? docs : [];
        const photoUrls = documentsArray.map((doc: any) => doc.public_url || doc.signed_url || doc.url).filter(Boolean);
        setProfile(prev => prev ? { ...prev, photos: photoUrls } : null);
      } catch (err) {
        console.warn('Failed to refetch photos after upload:', err);
      }
      notifyProfileProgressChanged();
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setUploadError(err.message || 'We couldn’t upload your photo. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const confirmDeletePhoto = (photoUrl: string) => {
    setPhotoToDelete(photoUrl);
  };

  const handleDeletePhoto = async () => {
    if (!photoToDelete) return;

    const photoUrl = photoToDelete;
    setPhotoToDelete(null);
    setDeleteLoading(photoUrl);
    setUploadError(null);
    setDeleteStatus('Finding document...');

    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error('Not authenticated');

      // Step 1: Find the document by URL via gRPC
      try {
        const docsData = await documentService.getUserDocuments('', 'profile_photo');
        const allDocs = docsData?.data || docsData?.documents || docsData || [];
        const documentsArray = Array.isArray(allDocs) ? allDocs : [];
        const document = documentsArray.find((doc: any) => (doc.public_url || doc.signed_url || doc.url) === photoUrl);

        // Step 2: Delete from documents table and S3 via gRPC
        if (document?.id) {
          setDeleteStatus('Deleting from storage...');
          try {
            await documentService.deleteDocument(document.id, '');
          } catch (err) {
            console.warn('Failed to delete document from storage, but will remove from profile');
          }
        }
      } catch (err) {
        console.warn('Failed to fetch documents, will only remove from profile');
      }

      // Step 3: Update profile photos via gRPC
      setDeleteStatus('Updating profile...');
      const updatedPhotos = (profile?.photos || []).filter(p => p !== photoUrl);
      try {
        await grpcProfileService.updateHousehelpFields('', 'househelp', { photos: updatedPhotos });
      } catch (err) {
        console.warn('Failed to update profile fields via gRPC:', err);
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, photos: updatedPhotos } : null);
    } catch (err: any) {
      console.error('Error deleting photo:', err);
      setUploadError(err.message || 'Failed to delete photo');
    } finally {
      setDeleteLoading(null);
      setDeleteStatus(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
          <main className="flex-1 py-8">
            <div className="max-w-5xl mx-auto px-4">
              <ProfilePageSkeleton />
            </div>
          </main>
        </PurpleThemeWrapper>
        <Footer />
      </div>
    );
  }

  if (error || hasError) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-6 rounded-xl">
          <ErrorAlert message={error || "Something went wrong"} />
          <div className="flex gap-3">
            <button
              onClick={() => setRetryKey((prev) => prev + 1)}
              className="px-6 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-500/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xl">📝</span>
            <p className="font-semibold text-yellow-800 dark:text-yellow-400">No profile found</p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">You haven't completed your househelp profile yet.</p>
          <button
            onClick={() => setRetryKey((prev) => prev + 1)}
            className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Reload Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
      <main className="flex-1 py-8">
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-2 flex items-center gap-2">
              {profile.first_name} {profile.last_name}
              {/* Read from the verification hook this page already loads, not
                  from the profile payload, so what somebody is told about their
                  own status here and in the verification panel below cannot
                  disagree. Only "approved" shows it: under review and
                  resubmission are explained in that panel, not hedged here. */}
              {identityVerification.status === 'approved' && <VerifiedBadge showLabel />}
            </h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">View and manage your professional information</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {profile?.id && (
              <button
                onClick={() => setShowViewsModal(true)}
                className="h-8 w-8 rounded-xl flex items-center justify-center border border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-500/10 hover:scale-105 transition-all"
                aria-label="Profile Views"
                title="Profile Views"
              >
                <Eye className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => navigate('/househelp/public-profile')}
              className="px-4 py-1.5 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
            >
              View Public Profile
            </button>
          </div>
        </div>
      </div>

      <IdentityVerificationPrompt verification={identityVerification} className="mb-4" />

      <ProfileAccountSummary
        profile={profile as Record<string, unknown>}
        fallbackProfileId="6dbd5104-d314-4ef1-a7d3-37d7eb26ddff"
        fallbackProfileType="househelp"
      />

      {/* Profile Photos */}
      <div id="profile-photos" className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">📸 Profile Photos</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {profile.photos?.length || 0}/{MAX_PHOTOS} photos
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {uploadError && (
          <ErrorAlert message={uploadError} className="mb-4" />
        )}

        {/* Upload Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-400">
                Uploading photo...
              </span>
              <span className="text-xs font-bold text-blue-800 dark:text-blue-400">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-900/40 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Delete Status Message */}
        {deleteStatus && (
          <div className="mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30">
            <div className="flex items-center gap-2">
              <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
              <span className="text-xs font-semibold text-orange-800 dark:text-orange-400">
                {deleteStatus}
              </span>
            </div>
          </div>
        )}

        {/* Upload Button */}
        {(!profile.photos || profile.photos.length < MAX_PHOTOS) && (
          <div className="mb-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={PHOTO_ACCEPT_ATTRIBUTE}
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading ? (
                <>
                  <span className="hb-shimmer-piece h-5 w-5 rounded-full" />
                  Uploading...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Add Photos
                </>
              )}
            </button>
          </div>
        )}

        {/* Photos Grid */}
        {profile.photos && profile.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={photo}
                  alt={`Profile photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/placeholder-image.png';
                  }}
                />
                <div className="absolute inset-0 bg-black/35 sm:bg-black sm:bg-opacity-0 sm:group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedImage(photo)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-white text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-50"
                  >
                    View Full
                  </button>
                  <button
                    onClick={() => confirmDeletePhoto(photo)}
                    disabled={deleteLoading === photo}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                    title="Delete photo"
                  >
                    {deleteLoading === photo ? (
                      <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">No photos uploaded yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add photos to make your profile stand out!</p>
          </div>
        )}
      </div>

      <ProfileChoicesSection
        profile={profile as Record<string, any>}
        fallbackProfileId="6dbd5104-d314-4ef1-a7d3-37d7eb26ddff"
        profileType="househelp"
        editable
        onEdit={handleCompleteFeaturePicks}
      />

      <CertificationDocuments profileId={profile.id} />

      <ProfileRequirementsChecklist
        missing={progress?.missing || []}
        completedItems={progress?.completed_items}
        totalItems={progress?.total_items}
        percentage={progress?.completion_percentage}
        onResolve={handleResolveRequirement}
      />

      {profile.user_id && (
        <section className="border-t border-purple-200/40 bg-white p-6 dark:border-purple-500/30 dark:bg-[#13131a]">
          <h2 className="mb-4 text-sm font-semibold text-purple-700 dark:text-purple-300">
            Ratings & reviews
          </h2>
          <ProfileReviews
            profileId={profile.user_id}
            profileType="househelp"
            isOwnProfile
          />
        </section>
      )}

      <ReferralCodeCard className="rounded-2xl border border-purple-200/40 dark:border-purple-500/30" />

      <EditSectionModal
        isOpen={editingLocation}
        onClose={() => {
          setEditingLocation(false);
          void refetchProgress();
        }}
        title="📍 Edit Location"
        profileType="househelp"
      >
        <Location />
      </EditSectionModal>
    </div>
      </main>
      </PurpleThemeWrapper>
      <Footer />
      
      {/* Image View Modal */}
      {selectedImage && (
        <ImageViewModal
          imageUrl={selectedImage}
          altText="Profile photo"
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={photoToDelete !== null}
        title="Delete Photo"
        message="Are you sure you want to delete this photo? This will permanently remove it from storage."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeletePhoto}
        onCancel={() => setPhotoToDelete(null)}
      />

      {/* Profile Views Modal */}
      {profile?.id && (
        <ProfileViewsAnalytics
          profileId={profile.id}
          profileType="househelp"
          isOpen={showViewsModal}
          onClose={() => setShowViewsModal(false)}
        />
      )}

    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
