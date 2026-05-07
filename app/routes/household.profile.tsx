import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from '~/config/api';
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { profileService as grpcProfileService, householdKidsService, petsService, documentService, householdMemberService, jobService } from '~/services/grpc/authServices';
import profileSetupService from '~/services/grpc/profileSetup.service';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import ConfirmDialog from '~/components/ConfirmDialog';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Eye } from 'lucide-react';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import EditSectionModal from '~/components/ui/EditSectionModal';
import Location from '~/components/Location';
import Children from '~/components/Children';
import NannyType from '~/components/NanyType';
import Chores from '~/components/Chores';
import Pets from '~/components/Pets';
import Budget from '~/components/Budget';
import HouseSize from '~/components/HouseSize';
import Bio from '~/components/Bio';
import Religion from '~/components/Religion';
import ProfileViewsAnalytics from '~/components/ProfileViewsAnalytics';
import { useProfileViewTracking } from '~/hooks/useProfileViewTracking';
import { formatOnboardingBudgetRange } from '~/utils/onboardingCompensation';
import { getStoredUserId } from '~/utils/authStorage';
import JobPostModal from '~/components/modals/JobPostModal';

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
  location_ref?: any;
  town?: string;
  photos?: string[];
}

interface JobSalaryRange {
  min?: number;
  max?: number;
  currency?: string;
  frequency?: string;
}

interface JobLocation {
  place_type?: string;
  latitude?: number;
  longitude?: number;
  mapbox_id?: string;
  name?: string;
  place?: string;
}

interface JobPosting {
  id: string;
  title?: string;
  description?: string;
  location?: string | JobLocation;
  job_types?: string[];
  start_date?: string;
  max_applicants?: number;
  status?: string;
  created_at?: string;
  salary_range?: JobSalaryRange;
}

const formatJobLocation = (location?: string | JobLocation): string => {
  if (!location) return 'Location not specified';
  if (typeof location === 'string') return location;
  return location.name || location.place || 'Location not specified';
};

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function HouseholdProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HouseholdData | null>(null);
  const [kids, setKids] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  
  // Track profile views (own profile)
  useProfileViewTracking({
    profileId: profile?.id || '',
    profileType: 'household',
    viewerUserId: profile?.user_id,
    enabled: !!profile?.id,
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [setupRedirectLoading, setSetupRedirectLoading] = useState(false);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [jobsSuccess, setJobsSuccess] = useState<string | null>(null);
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
  const [jobToDelete, setJobToDelete] = useState<JobPosting | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  // Household invitation code state
  const [invitationCode, setInvitationCode] = useState<string | null>(null);
  const [invitationExpiresAt, setInvitationExpiresAt] = useState<string | null>(null);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationError, setInvitationError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [, setTimeUpdate] = useState(0); // Force re-render for countdown
  const [memberActionSuccess, setMemberActionSuccess] = useState<string | null>(null);
  
  // Household members state
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [memberToRemove, setMemberToRemove] = useState<{ userId: string } | null>(null);

  // Update countdown every minute
  useEffect(() => {
    if (!invitationExpiresAt) return;
    
    const interval = setInterval(() => {
      setTimeUpdate(prev => prev + 1);
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [invitationExpiresAt]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      setHasError(false);
      try {
        // Fetch household profile via gRPC
        const profileData = await grpcProfileService.getCurrentHouseholdProfile('');
        setProfile(profileData);

        const [inviteResult, kidsResult, petsResult, docsResult] = await Promise.allSettled([
          householdMemberService.getOrCreateInvitationCode(profileData.id),
          householdKidsService.listHouseholdKids(''),
          petsService.listMyPets(''),
          documentService.getUserDocuments('', 'profile_photo'),
        ]);

        if (inviteResult.status === 'fulfilled') {
          const extracted = inviteResult.value?.data || inviteResult.value;
          setInvitationCode(extracted.invite_code);
          setInvitationExpiresAt(extracted.expires_at);
        } else if (inviteResult.status === 'rejected') {
          console.error("No existing invitation code or error loading it:", inviteResult.reason);
        }

        if (kidsResult.status === 'fulfilled') {
          const kidsData = kidsResult.value;
          const kidsArray = Array.isArray(kidsData?.data || kidsData) ? (kidsData?.data || kidsData) : [];
          setKids(Array.isArray(kidsArray) ? kidsArray : []);
        } else if (kidsResult.status === 'rejected') {
          console.error("Error loading kids:", kidsResult.reason);
        }

        if (petsResult.status === 'fulfilled') {
          const petsData = petsResult.value;
          const petsArray = Array.isArray(petsData?.data || petsData) ? (petsData?.data || petsData) : [];
          setPets(Array.isArray(petsArray) ? petsArray : []);
        } else if (petsResult.status === 'rejected') {
          console.error("Error loading pets:", petsResult.reason);
        }

        if (docsResult.status === 'fulfilled') {
          const docsData = docsResult.value;
          const docs = docsData?.data || docsData?.documents || docsData || [];
          const documentsArray = Array.isArray(docs) ? docs : [];
          const photoUrls = documentsArray.map((doc: any) => doc.public_url || doc.signed_url || doc.url).filter(Boolean);
          setProfile(prev => prev ? { ...prev, photos: photoUrls } : null);
        } else if (docsResult.status === 'rejected') {
          console.error("Error loading photos:", docsResult.reason);
        }
      } catch (err: any) {
        console.error("Error loading profile:", err);
        setError(err.message || "Failed to load profile");
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    
    try {
      fetchAllData();
    } catch (err) {
      console.error("Critical error:", err);
      setHasError(true);
      setLoading(false);
    }
  }, [retryKey]);

  // Fetch members when profile loads
  useEffect(() => {
    if (profile) {
      fetchMembers();
    }
  }, [profile]);

  const fetchJobs = async (userId: string) => {
    setJobsLoading(true);
    setJobsError(null);
    try {
      const raw = await jobService.getJobsByUserId(userId);
      const payload = raw?.data || raw || [];
      const items = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      setJobs(items as JobPosting[]);
    } catch (err: any) {
      setJobsError(err.message || 'Failed to load job postings');
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    const userId = profile?.user_id || getStoredUserId();
    if (!userId) return;
    fetchJobs(userId);
  }, [profile?.user_id]);

  const handleJobSaved = () => {
    const userId = profile?.user_id || getStoredUserId();
    if (userId) {
      fetchJobs(userId);
    }
    setJobsSuccess('Job posting updated.');
  };

  const handleToggleJobStatus = async (job: JobPosting) => {
    if (!job?.id) return;
    setJobsError(null);
    setJobsSuccess(null);
    try {
      if (job.status === 'closed') {
        await jobService.reopenJob(job.id, '');
        setJobsSuccess('Job reopened.');
      } else {
        await jobService.closeJob(job.id, '');
        setJobsSuccess('Job closed.');
      }
      const userId = profile?.user_id || getStoredUserId();
      if (userId) await fetchJobs(userId);
    } catch (err: any) {
      setJobsError(err.message || 'Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete?.id) return;
    setJobsError(null);
    setJobsSuccess(null);
    try {
      await jobService.deleteJob(jobToDelete.id, '');
      setJobsSuccess('Job deleted.');
      const userId = profile?.user_id || getStoredUserId();
      if (userId) await fetchJobs(userId);
    } catch (err: any) {
      setJobsError(err.message || 'Failed to delete job');
    } finally {
      setJobToDelete(null);
    }
  };

  const formatJobDate = (value?: string) => {
    if (!value) return 'Flexible';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'Flexible';
    return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatJobSalary = (range?: JobPosting['salary_range']) => {
    if (!range) return 'Not specified';
    const currencyCode = range.currency || 'KES';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    });

    const min = range.min != null ? formatter.format(range.min) : '';
    const max = range.max != null ? formatter.format(range.max) : '';
    const base = min && max ? `${min} - ${max}` : (min || max || 'Not specified');
    const freqLabel = range.frequency ? ` / ${range.frequency}` : '';
    return `${base}${freqLabel}`;
  };

  const handleContinueSetup = async () => {
    if (setupRedirectLoading) return;
    setSetupRedirectLoading(true);

    try {
      const progressData = await profileSetupService.getProgress('', 'household');
      const totalSteps = progressData?.total_steps || 0;
      const lastStep = progressData?.last_completed_step || 0;
      const status = progressData?.status || '';
      const isComplete = status === 'completed' || (totalSteps > 0 && lastStep >= totalSteps);

      if (isComplete) {
        navigate('/household/profile', { replace: true });
        return;
      }

      if (lastStep <= 0) {
        navigate('/household-choice', { replace: true });
        return;
      }

      navigate(`/profile-setup/household?step=${lastStep + 1}`, { replace: true });
    } catch {
      navigate('/household-choice', { replace: true });
    } finally {
      setSetupRedirectLoading(false);
    }
  };

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [showViewsModal, setShowViewsModal] = useState(false);

  const EDIT_SECTIONS: Record<string, { title: string; component: React.FC }> = {
    location: { title: '📍 Edit Location', component: Location },
    housesize: { title: '🏠 Edit House Size', component: HouseSize },
    nannytype: { title: '👥 Edit Service Type', component: NannyType },
    children: { title: '👶 Edit Children', component: Children },
    pets: { title: '🐾 Edit Pets', component: Pets },
    chores: { title: '🧹 Edit Chores & Duties', component: Chores },
    budget: { title: '💰 Edit Budget', component: Budget },
    religion: { title: '🙏 Edit Religion & Beliefs', component: Religion },
    bio: { title: '✍️ Edit About', component: Bio },
  };

  const handleEditSection = (section: string) => {
    setEditingSection(section);
  };

  const handleCloseEditModal = () => {
    setEditingSection(null);
    // Refresh profile data after editing
    const refresh = async () => {
      try {
        const profileData = await grpcProfileService.getCurrentHouseholdProfile('');
        setProfile(profileData);
        const kidsData = await householdKidsService.listHouseholdKids('');
        const kidsArr = kidsData?.data?.data || kidsData?.data || kidsData;
        setKids(Array.isArray(kidsArr) ? kidsArr : []);
        const petsData = await petsService.listMyPets('');
        const petsArr = petsData?.data?.data || petsData?.data || petsData;
        setPets(Array.isArray(petsArr) ? petsArr : []);
      } catch (err) {
        console.error('Failed to refresh profile after edit:', err);
      }
    };
    refresh();
  };

  const fetchInvitationCode = async () => {
    if (!profile) return;
    
    setInvitationLoading(true);
    setInvitationError(null);
    
    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error("Not authenticated");
      
      const householdId = profile?.id;
      if (!householdId) throw new Error("No household ID");
      
      // Get or create invitation code via gRPC
      const inviteData = await householdMemberService.getOrCreateInvitationCode(householdId);
      const extractedInviteData = inviteData?.data || inviteData;
      setInvitationCode(extractedInviteData.invite_code);
      setInvitationExpiresAt(extractedInviteData.expires_at);
    } catch (err: any) {
      console.error("Error fetching invitation code:", err);
      setInvitationError(err.message || "Failed to load invitation code");
    } finally {
      setInvitationLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (invitationCode) {
      navigator.clipboard.writeText(invitationCode);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const getTimeRemaining = () => {
    if (!invitationExpiresAt) return null;
    
    const now = new Date();
    const expiresAt = new Date(invitationExpiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  const fetchMembers = async () => {
    if (!profile?.id) return;
    
    setMembersLoading(true);
    try {
      const token = getAccessTokenFromCookies();
      if (!token) return;
      
      const membersData = await householdMemberService.listMembers(profile.id);
      const extracted = membersData?.data || membersData?.members || membersData;
      const membersArray = Array.isArray(extracted) ? extracted : [];
      setMembers(membersArray);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setMembersLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!profile?.id) return;
    
    setRemovingMemberId(userId);
    setError(null);
    setMemberActionSuccess(null);
    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error("Not authenticated");
      
      await householdMemberService.removeMember(profile.id, userId, '');
      
      // Refresh members list
      await fetchMembers();
      setMemberActionSuccess('Member removed successfully.');
    } catch (err: any) {
      console.error("Error removing member:", err);
      setError(err.message || "Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentPhotoCount = profile?.photos?.length || 0;
    if (currentPhotoCount >= MAX_PHOTOS) {
      setUploadError(`Maximum of ${MAX_PHOTOS} photos allowed`);
      return;
    }

    const file = files[0];
    
    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP, and GIF files are allowed');
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error('Not authenticated');

      // Upload to documents service with progress tracking
      const formData = new FormData();
      formData.append('files', file);
      formData.append('document_type', 'profile_photo');
      formData.append('is_public', 'true');
      formData.append('description', 'Household profile photo');

      // Use XMLHttpRequest for upload progress tracking
      const uploadData = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(percentComplete);
          }
        });
        
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (err) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });
        
        xhr.addEventListener('error', () => {
          reject(new Error('Network error during upload'));
        });
        
        xhr.open('POST', `${API_BASE_URL}/api/v1/documents/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.send(formData);
      });
      const docs = uploadData.data || uploadData.documents || [];
      const firstDoc = Array.isArray(docs) ? docs[0] : null;
      const imageUrl = firstDoc?.public_url || firstDoc?.signed_url || firstDoc?.url;

      if (!imageUrl) throw new Error('No image URL returned');

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
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      setUploadError(err.message || 'Failed to upload photo');
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

      // Step 3: Refetch photos from documents table via gRPC
      setDeleteStatus('Refreshing photos...');
      try {
        const refreshData = await documentService.getUserDocuments('', 'profile_photo');
        const refreshDocs = refreshData?.data || refreshData?.documents || refreshData || [];
        const docsArray = Array.isArray(refreshDocs) ? refreshDocs : [];
        const photoUrls = docsArray.map((doc: any) => doc.public_url || doc.signed_url || doc.url).filter(Boolean);
        setProfile(prev => prev ? { ...prev, photos: photoUrls } : null);
      } catch (err) {
        console.warn('Failed to refetch photos after delete:', err);
      }
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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
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
            <button
              onClick={handleContinueSetup}
              disabled={setupRedirectLoading}
              className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {setupRedirectLoading ? 'Opening Setup...' : 'Continue Profile Setup'}
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
          <p className="text-gray-700 dark:text-gray-300 mb-4">You haven't completed your household profile yet.</p>
          <button
            onClick={handleContinueSetup}
            disabled={setupRedirectLoading}
            className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {setupRedirectLoading ? 'Opening Setup...' : 'Continue Profile Setup'}
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
      {memberActionSuccess && <SuccessAlert message={memberActionSuccess} className="mb-4" />}
      {/* Header */}
      <div className="rounded-2xl p-4 sm:p-6 bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30 mb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">🏠 My Household Profile</h1>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">View and manage your household information</p>
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
              onClick={() => navigate(`/household/public-profile?userId=${profile?.user_id || ''}`)}
              className="px-4 py-1.5 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all shadow-lg whitespace-nowrap"
              disabled={!profile?.user_id}
            >
              View Public Profile
            </button>
          </div>
        </div>
      </div>

      {/* Job Postings */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">📋 Job Postings</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Manage the roles you are hiring for and keep them updated.
            </p>
          </div>
          <button
            onClick={() => { setEditingJob(null); setShowJobModal(true); }}
            className="px-4 py-1.5 text-xs rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            New Job
          </button>
        </div>

        {jobsSuccess ? <SuccessAlert message={jobsSuccess ?? ""} className="mb-3" /> : null}
        {jobsError ? <ErrorAlert message={jobsError ?? ""} className="mb-3" /> : null}

        {jobsLoading ? (
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
            Loading job postings...
          </div>
        ) : jobs.length > 0 ? (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="rounded-xl border border-gray-200 dark:border-purple-500/30 p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{job.title || 'Untitled role'}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">📍 {formatJobLocation(job.location)}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${job.status === 'closed'
                    ? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                    : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'}`}>
                    {job.status || 'open'}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(job.job_types || []).length > 0 ? (
                    job.job_types?.map((type) => (
                      <span key={type} className="px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200">
                        {type.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300">
                      Flexible role
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
                    Start {formatJobDate(job.start_date)}
                  </span>
                  {job.max_applicants ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      Max {job.max_applicants} applicants
                    </span>
                  ) : null}
                </div>

                <div className="mt-3 text-xs text-gray-600 dark:text-gray-300">
                  Salary: {formatJobSalary(job.salary_range)}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => { setEditingJob(job); setShowJobModal(true); }}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-purple-300 text-purple-700 dark:text-purple-200 dark:border-purple-500/40 hover:bg-purple-50 dark:hover:bg-purple-500/10"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleJobStatus(job)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-gray-300 text-gray-600 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5"
                  >
                    {job.status === 'closed' ? 'Reopen' : 'Close'}
                  </button>
                  <button
                    onClick={() => setJobToDelete(job)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg border border-red-300 text-red-600 dark:text-red-300 dark:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-purple-200 dark:border-purple-500/30 p-4 text-xs text-gray-600 dark:text-gray-400">
            You have not published any job postings yet.
          </div>
        )}
      </div>

      {/* Location */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">📍 Location</h2>
          <button
            onClick={() => handleEditSection('location')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
          {typeof profile.location === 'string'
            ? (profile.location || profile.town || 'Not specified')
            : (profile.location?.place || profile.location?.name || profile.location_ref?.place || profile.town || 'Not specified')}
        </p>
      </div>

      {/* Household Invitation Code */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">🔑 Household Code</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              Share this code with your partner to give them access to this household profile
            </p>
          </div>
          <button
            onClick={() => navigate('/household/requests')}
            className="relative px-4 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold rounded-xl hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            View Requests
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>
        </div>

        {!invitationCode && !invitationLoading && (
          <button
            onClick={fetchInvitationCode}
            className="px-8 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Generate Household Code
          </button>
        )}

        {invitationLoading && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <svg className="animate-spin h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-gray-600 dark:text-gray-400">Generating code...</span>
          </div>
        )}

        {invitationError && (
          <ErrorAlert message={invitationError} />
        )}

        {invitationCode && (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-500/30 rounded-xl">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Your Household Code:</p>
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-100 tracking-wider font-mono">
                    {invitationCode}
                  </p>
                  {invitationExpiresAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      ⏰ Expires in: <span className="font-semibold text-purple-600 dark:text-purple-400">{getTimeRemaining()}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  {codeCopied ? (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Code
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 rounded-xl">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>ℹ️ How it works:</strong>
              </p>
              <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-300 list-disc list-inside">
                <li>Share this code with your partner</li>
                <li>They'll use it to request access to this household</li>
                <li>You'll receive a notification to approve their request</li>
                <li>Once approved, they'll have full access to manage this household</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Household Members */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">👥 Household Members</h2>
        </div>

        {membersLoading ? (
          <div className="flex items-center justify-center py-8">
            <svg className="animate-spin h-8 w-8 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">No members yet. Share your household code to invite members!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member: any) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-base">
                    {member.user?.first_name?.[0] || member.user?.email?.[0] || "M"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {member.user?.first_name && member.user?.last_name
                        ? `${member.user.first_name} ${member.user.last_name}`
                        : member.user?.email || "Unknown Member"}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        member.role === 'owner' 
                          ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                          : member.role === 'admin'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {member.role}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Joined {new Date(member.joined_at || member.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {member.role !== 'owner' && (
                  <button
                    onClick={() => setMemberToRemove({ userId: member.user_id })}
                    disabled={removingMemberId === member.user_id}
                    className="px-4 py-1 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {removingMemberId === member.user_id ? (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Profile Photos */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">📸 Home Photos</h2>
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
              <svg className="animate-spin h-4 w-4 text-orange-600 dark:text-orange-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
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
              accept="image/jpeg,image/png,image/webp,image/gif"
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
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <PlusIcon className="h-4 w-4" />
                  Add Photo
                </>
              )}
            </button>
          </div>
        )}

        {/* Photos Grid */}
        {profile.photos && profile.photos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-200 dark:bg-gray-800">
                {/* Blur placeholder */}
                {!loadedImages.has(photo) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 animate-pulse" />
                    <div className="absolute">
                      <svg className="animate-spin h-8 w-8 text-purple-600 dark:text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  </div>
                )}
                <img
                  src={photo}
                  alt={`Home photo ${idx + 1}`}
                  className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                    loadedImages.has(photo) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => {
                    setLoadedImages(prev => new Set(prev).add(photo));
                  }}
                  onError={(e) => {
                    e.currentTarget.src = '/assets/placeholder-image.png';
                    setLoadedImages(prev => new Set(prev).add(photo));
                  }}
                />
                <div className={`absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2 ${
                  !loadedImages.has(photo) ? 'pointer-events-none' : ''
                }`}>
                  <button
                    onClick={() => setSelectedImage(photo)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-white text-purple-600 rounded-xl text-xs font-semibold hover:bg-purple-50"
                  >
                    View Full
                  </button>
                  <button
                    onClick={() => confirmDeletePhoto(photo)}
                    disabled={deleteLoading === photo}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
                    title="Delete photo"
                  >
                    {deleteLoading === photo ? (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
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
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Add photos of your home to attract qualified househelps!</p>
          </div>
        )}
      </div>

      {/* House Size & Notes */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">🏠 House Information</h2>
          <button
            onClick={() => handleEditSection('housesize')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">House Size</span>
            <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.house_size || 'Not specified'}</p>
          </div>
          {profile.household_notes && (
            <div className="md:col-span-2">
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Additional Notes</span>
              <p className="text-xs text-gray-900 dark:text-gray-100 mt-1">{profile.household_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Service Type */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">👥 Service Type Needed</h2>
          <button
            onClick={() => handleEditSection('nannytype')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        <div className="space-y-3">
          {profile.needs_live_in && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-100">🌙 Live-in Help</p>
              {profile.live_in_off_days && profile.live_in_off_days.length > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Off days: {profile.live_in_off_days.join(', ')}</p>
              )}
            </div>
          )}
          {profile.needs_day_worker && (
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-xs font-semibold text-purple-900 dark:text-purple-100">☀️ Day Worker</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Schedule configured</p>
            </div>
          )}
          {!profile.needs_live_in && !profile.needs_day_worker && (
            <p className="text-gray-500 dark:text-gray-400">No service type specified</p>
          )}
          {profile.available_from && (
            <div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">Available From</span>
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(profile.available_from).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">👶 Children</h2>
          <button
            onClick={() => handleEditSection('children')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        {kids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {kids.map((kid, idx) => (
              <div key={kid.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="font-semibold text-purple-900 dark:text-purple-100">
                  {kid.is_expecting ? '🤰 Expecting' : `👶 Child ${idx + 1}`}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Gender: {kid.gender}</p>
                {kid.date_of_birth && <p className="text-xs text-gray-600 dark:text-gray-400">DOB: {new Date(kid.date_of_birth).toLocaleDateString()}</p>}
                {kid.expected_date && <p className="text-xs text-gray-600 dark:text-gray-400">Expected: {new Date(kid.expected_date).toLocaleDateString()}</p>}
                {kid.traits && kid.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {kid.traits.map((trait: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full">{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No children added</p>
        )}
      </div>

      {/* Pets */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">🐾 Pets</h2>
          <button
            onClick={() => handleEditSection('pets')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        {pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((pet, idx) => (
              <div key={pet.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="font-semibold text-purple-900 dark:text-purple-100 capitalize">🐾 {pet.pet_type}</p>
                {pet.requires_care && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">⚠️ Requires care</p>}
                {pet.care_details && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{pet.care_details}</p>}
                {pet.traits && pet.traits.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pet.traits.map((trait: string, i: number) => (
                      <span key={i} className="text-xs px-2 py-1 bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100 rounded-full capitalize">{trait}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No pets added</p>
        )}
      </div>

      {/* Chores */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">🧹 Chores & Duties</h2>
          <button
            onClick={() => handleEditSection('chores')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        {profile.chores && profile.chores.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {profile.chores.map((chore, idx) => (
              <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-xl font-medium">
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">💰 Budget</h2>
          <button
            onClick={() => handleEditSection('budget')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        {profile.budget_min || profile.budget_max ? (
          <div className="space-y-2">
            <p className="text-xs font-bold text-purple-900 dark:text-purple-100">
              {formatOnboardingBudgetRange(profile.budget_min, profile.budget_max, profile.salary_frequency)}
            </p>
            {profile.salary_frequency && (
              <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">Per {profile.salary_frequency.replace('ly', '')}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">No budget specified</p>
        )}
      </div>

      {/* Religion */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">🙏 Religion & Beliefs</h2>
          <button
            onClick={() => handleEditSection('religion')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{profile.religion || 'Not specified'}</p>
      </div>

      {/* Bio */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 rounded-b-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">✍️ About Your Household</h2>
          <button
            onClick={() => handleEditSection('bio')}
            className="px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            Edit
          </button>
        </div>
        <p className="text-xs text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{profile.bio || 'No bio added yet'}</p>
      </div>
    </div>
      </main>
      </PurpleThemeWrapper>
      <Footer />
      
      {/* Image View Modal */}
      {selectedImage && (
        <ImageViewModal
          imageUrl={selectedImage}
          altText="Home photo"
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

      <ConfirmDialog
        isOpen={memberToRemove !== null}
        title="Remove Member"
        message="Are you sure you want to remove this member from your household?"
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={() => {
          if (!memberToRemove) return;
          void handleRemoveMember(memberToRemove.userId);
          setMemberToRemove(null);
        }}
        onCancel={() => setMemberToRemove(null)}
      />

      <ConfirmDialog
        isOpen={jobToDelete !== null}
        title="Delete Job Posting"
        message="Are you sure you want to delete this job posting?"
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleDeleteJob}
        onCancel={() => setJobToDelete(null)}
      />

      {/* Edit Section Modal */}
      {editingSection && EDIT_SECTIONS[editingSection] && (
        <EditSectionModal
          isOpen={true}
          onClose={handleCloseEditModal}
          title={EDIT_SECTIONS[editingSection].title}
          profileType="household"
        >
          {React.createElement(EDIT_SECTIONS[editingSection].component)}
        </EditSectionModal>
      )}

      {/* Profile Views Modal */}
      {profile?.id && (
        <ProfileViewsAnalytics
          profileId={profile.id}
          profileType="household"
          isOpen={showViewsModal}
          onClose={() => setShowViewsModal(false)}
        />
      )}

      <JobPostModal
        isOpen={showJobModal}
        onClose={() => {
          setShowJobModal(false);
          setEditingJob(null);
        }}
        job={editingJob}
        onSaved={handleJobSaved}
      />
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
