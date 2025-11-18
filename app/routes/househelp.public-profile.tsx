import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from '~/config/api';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';

interface UserData {
  first_name?: string;
  last_name?: string;
}

interface HousehelpData {
  user?: UserData;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  years_of_experience?: number;
  can_work_with_kid?: boolean;
  can_work_with_pets?: boolean;
  languages?: string[];
  certifications?: string;
  salary_expectation?: number;
  salary_frequency?: string;
  bio?: string;
  location?: any;
  available_from?: string;
  offers_live_in?: boolean;
  offers_day_worker?: boolean;
  photos?: string[];
}

export default function HousehelpPublicProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        
        const profileRes = await fetch(`${API_BASE_URL}/api/v1/profile/househelp/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);
      } catch (err: any) {
        console.error("Error loading househelp profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, []);

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
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
      <main className="flex-1 py-8">
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-8 text-white rounded-t-3xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">👤 Househelp Profile</h1>
            <p className="text-purple-100 text-sm sm:text-base">Public view - This is how others see this profile</p>
          </div>
          <button
            onClick={() => navigate('/househelp/profile')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap self-start"
          >
            ← Back to My Profile
          </button>
        </div>
      </div>

      {/* Profile Photos */}
      {profile.photos && profile.photos.length > 0 && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📸 Profile Photos</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {profile.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(photo)}>
                <img
                  src={photo}
                  alt={`Profile photo ${idx + 1}`}
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

      {/* Personal Information */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👤 Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
              {profile.user?.first_name || profile.first_name || 'Not specified'} {profile.user?.last_name || profile.last_name || ''}
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.gender || 'Not specified'}</p>
          </div>
          {profile.date_of_birth && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Age</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
              </p>
            </div>
          )}
        </div>
      </div>

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
                  <span key={idx} className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-lg font-medium">
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
                  <span key={idx} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 rounded-lg font-medium">
                    🗣️ {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Work Preferences */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">⚙️ Work Preferences</h2>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg ${profile.can_work_with_kid ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <p className={`font-semibold ${profile.can_work_with_kid ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>
                👶 Work with Kids
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile.can_work_with_kid ? 'Yes, comfortable with children' : 'No'}
              </p>
            </div>
            <div className={`p-4 rounded-lg ${profile.can_work_with_pets ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
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
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
        </div>
      </div>

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
                Per {profile.salary_frequency === 'daily' ? 'Day' : 
                     profile.salary_frequency === 'weekly' ? 'Week' : 
                     profile.salary_frequency === 'monthly' ? 'Month' : 
                     profile.salary_frequency === 'yearly' ? 'Year' : 
                     profile.salary_frequency}
              </p>
            )}
          </div>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">Salary expectation not specified</p>
        )}
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
      
      {/* Image View Modal */}
      {selectedImage && (
        <ImageViewModal
          imageUrl={selectedImage}
          altText="Profile photo"
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
}

// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
