import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API_BASE_URL } from '~/config/api';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';

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
}

export default function HousehelpProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);

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
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload Page
            </button>
            <button
              onClick={() => navigate('/profile-setup/househelp')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
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
      <PurpleThemeWrapper variant="gradient" bubbles={true} bubbleDensity="low">
      <main className="flex-1 py-8">
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 sm:p-8 text-white rounded-t-3xl">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">👤 My Househelp Profile</h1>
            <p className="text-purple-100 text-sm sm:text-base">View and manage your professional information</p>
          </div>
          <button
            onClick={() => navigate('/househelp/public-profile')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap self-start"
          >
            👁️ View Public Profile
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400">👤 Personal Information</h2>
          <button
            onClick={() => handleEditSection('gender')}
            className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
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
            className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
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
            className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
          >
            ✏️ Edit
          </button>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="font-semibold text-purple-900 dark:text-purple-100">👶 Work with Kids</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile.work_with_kids ? 'Yes' : 'No'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="font-semibold text-purple-900 dark:text-purple-100">🐾 Work with Pets</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {profile.work_with_pets ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.live_in && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <p className="font-semibold text-purple-900 dark:text-purple-100">🌙 Live-in Available</p>
              </div>
            )}
            {profile.day_worker && (
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
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
            className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
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
              className="px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:hover:text-white hover:scale-105 transition-all"
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
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
