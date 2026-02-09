import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from '~/config/api';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import ConfirmDialog from '~/components/ConfirmDialog';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface HousehelpData {
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
}

const MAX_PHOTOS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function HousehelpProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }
        
        const profileRes = await fetch(`${API_BASE_URL}/api/v1/profile/househelp/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);
      } catch (err: any) {
        console.error("Error loading househelp profile:", err);
        setError(err.message || "Failed to load profile");
        setHasError(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

  const handleEditSection = (section: string) => {
    // Navigate to the specific setup step for editing
    navigate('/profile-setup/househelp', { 
      state: { fromProfile: true, editSection: section }
    });
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // Upload to documents service with progress tracking
      const formData = new FormData();
      formData.append('files', file);
      formData.append('document_type', 'profile_photo');
      formData.append('is_public', 'true');
      formData.append('description', 'Profile photo');

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
      const imageUrl = uploadData.documents?.[0]?.url || uploadData.documents?.[0]?.public_url;

      if (!imageUrl) throw new Error('No image URL returned');

      // Update profile with new photo
      const updatedPhotos = [...(profile?.photos || []), imageUrl];
      
      const updateRes = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          updates: {
            photos: updatedPhotos,
          },
        }),
      });

      if (!updateRes.ok) throw new Error('Failed to update profile');

      // Update local state
      setProfile(prev => prev ? { ...prev, photos: updatedPhotos } : null);
      
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
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Not authenticated');

      // Step 1: Find the document by URL
      const docsRes = await fetch(`${API_BASE_URL}/api/v1/documents?document_type=profile_photo`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!docsRes.ok) {
        console.warn('Failed to fetch documents, will only remove from profile');
      } else {
        const docsData = await docsRes.json();
        const document = docsData.documents?.find((doc: any) => doc.url === photoUrl);

        // Step 2: Delete from documents table and S3
        if (document?.id) {
          setDeleteStatus('Deleting from storage...');
          const deleteRes = await fetch(`${API_BASE_URL}/api/v1/documents/${document.id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!deleteRes.ok) {
            console.warn('Failed to delete document from storage, but will remove from profile');
          }
        }
      }

      // Step 3: Remove from profile photos array
      setDeleteStatus('Updating profile...');
      const updatedPhotos = (profile?.photos || []).filter(p => p !== photoUrl);

      const updateRes = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          updates: {
            photos: updatedPhotos,
          },
        }),
      });

      if (!updateRes.ok) throw new Error('Failed to update profile');

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
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600 dark:text-gray-400">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || hasError) {
    return (
      <div className="max-w-2xl mx-auto mt-8">
        <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-500/30">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⚠️</span>
            <p className="font-semibold text-red-800 dark:text-red-400">{error || "Something went wrong"}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-1.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-semibold hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Reload Page
            </button>
            <button
              onClick={() => navigate('/profile-setup/househelp')}
              className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Complete Profile Setup
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
            <span className="text-2xl">📝</span>
            <p className="font-semibold text-yellow-800 dark:text-yellow-400">No profile found</p>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-4">You haven't completed your househelp profile yet.</p>
          <button
            onClick={() => navigate('/profile-setup/househelp')}
            className="px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Complete Profile Setup
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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 text-white rounded-t-3xl dark:border-b dark:border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">👤 My Househelp Profile</h1>
            <p className="text-purple-100 dark:text-purple-300 text-sm sm:text-base">View and manage your professional information</p>
          </div>
          <button
            onClick={() => navigate('/househelp/public-profile')}
            className="px-4 sm:px-6 py-1 sm:py-1.5 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap self-start"
          >
            👁️ View Public Profile
          </button>
        </div>
      </div>

      {/* Profile Photos */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">📸 Profile Photos</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {profile.photos?.length || 0}/{MAX_PHOTOS} photos
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {uploadError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
            <p className="text-sm text-red-600 dark:text-red-400">⚠️ {uploadError}</p>
          </div>
        )}

        {/* Upload Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-400">
                Uploading photo...
              </span>
              <span className="text-sm font-bold text-blue-800 dark:text-blue-400">
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
              <span className="text-sm font-semibold text-orange-800 dark:text-orange-400">
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
              className="flex items-center gap-2 px-4 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
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
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group">
                <img
                  src={photo}
                  alt={`Profile photo ${idx + 1}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = '/assets/placeholder-image.png';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setSelectedImage(photo)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 px-3 py-1 bg-white text-purple-600 rounded-xl text-sm font-semibold hover:bg-purple-50"
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
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Add photos to make your profile stand out!</p>
          </div>
        )}
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">👤 Personal Information</h2>
          <button
            onClick={() => handleEditSection('gender')}
            className="px-4 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
              {profile.first_name} {profile.last_name}
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.gender || 'Not specified'}</p>
          </div>
          {profile.date_of_birth && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Date of Birth</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {new Date(profile.date_of_birth).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Experience & Skills */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">💼 Experience & Skills</h2>
          <button
            onClick={() => handleEditSection('experience')}
            className="px-4 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Years of Experience</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
              {profile.years_of_experience ? `${profile.years_of_experience} years` : 'Not specified'}
            </p>
          </div>
          {profile.certifications && Array.isArray(profile.certifications) && profile.certifications.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Certifications</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.certifications.map((cert, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                    {cert}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.languages && Array.isArray(profile.languages) && profile.languages.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Languages</span>
              <div className="flex flex-wrap gap-2 mt-2">
                {profile.languages.map((lang, idx) => (
                  <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm">
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Work Preferences */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">⚙️ Work Preferences</h2>
          <button
            onClick={() => handleEditSection('nannytype')}
            className="px-4 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="font-semibold text-purple-900 dark:text-purple-100">👶 Work with Kids</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile.work_with_kids ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="font-semibold text-purple-900 dark:text-purple-100">🐾 Work with Pets</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile.work_with_pets ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.live_in && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="font-semibold text-purple-900 dark:text-purple-100">🌙 Live-in Available</p>
              </div>
            )}
            {profile.day_worker && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <p className="font-semibold text-purple-900 dark:text-purple-100">☀️ Day Worker Available</p>
              </div>
            )}
          </div>
          {profile.available_from && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Available From</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {new Date(profile.available_from).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Salary Expectations */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">💰 Salary Expectations</h2>
          <button
            onClick={() => handleEditSection('salary')}
            className="px-4 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Expected Salary</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
              {profile.salary_expectation ? `KES ${profile.salary_expectation.toLocaleString()}` : 'Not specified'}
            </p>
          </div>
          {profile.salary_frequency && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Frequency</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">
                {profile.salary_frequency}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 rounded-b-3xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">📝 About Me</h2>
            <button
              onClick={() => handleEditSection('bio')}
              className="px-4 py-1 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
            >
              ✏️ Edit
            </button>
          </div>
          <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{profile.bio}</p>
        </div>
      )}
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
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
