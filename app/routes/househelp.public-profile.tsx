import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { API_BASE_URL } from '~/config/api';
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import ImageViewModal from '~/components/ImageViewModal';
import { apiClient } from '~/utils/apiClient';
import { API_ENDPOINTS } from '~/config/api';
import { MessageCircle, Heart } from 'lucide-react';

interface UserData {
  first_name?: string;
  last_name?: string;
}

interface HousehelpData {
  id?: string;
  profile_id?: string;
  user?: UserData;
  first_name?: string;
  last_name?: string;
  gender?: string;
  date_of_birth?: string;
  years_of_experience?: number;
  can_work_with_kid?: boolean;
  can_work_with_pets?: boolean;
  children_age_range?: string;
  my_child_preference?: string;
  number_of_concurrent_children?: number;
  pets?: string[];
  can_drive?: boolean;
  first_aid_certificate?: boolean;
  certificate_of_good_conduct?: boolean;
  languages?: string[];
  certifications?: string;
  can_help_with?: string;
  pet_types?: string;
  salary_expectation?: number;
  salary_frequency?: string;
  bio?: string;
  location?: any;
  available_from?: string;
  offers_live_in?: boolean;
  off_days?: string[];
  offers_day_worker?: boolean;
  availability_schedule?: any;
  skills?: string[];
  traits?: string[];
  talent_with_kids?: string[];
  religion?: string;
  marital_status?: string;
  education_level?: string;
  has_kids?: boolean;
  needs_accommodation?: boolean;
  preferred_household_size?: string;
  preferred_location_type?: string;
  preferred_family_type?: string;
  work_environment_notes?: string;
  photos?: string[];
  avatar_url?: string;
  'househelp-type'?: string;
}

export default function HousehelpPublicProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isViewingOther, setIsViewingOther] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        
        // Get profileId from navigation state
        const profileId = (location.state as any)?.profileId;
        
        // If profileId is provided, fetch that specific profile, otherwise fetch own profile
        const endpoint = profileId 
          ? `${API_BASE_URL}/api/v1/househelps/${profileId}/profile_with_user`
          : `${API_BASE_URL}/api/v1/profile/househelp/me`;
        
        const profileRes = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);
        setIsViewingOther(!!profileId); // Set to true if viewing someone else's profile
      } catch (err: any) {
        console.error("Error loading househelp profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [location.state]);

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
      <main className="py-8">
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 text-white rounded-t-3xl dark:border-b dark:border-purple-500/20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">👤 Househelp Profile</h1>
            <p className="text-purple-100 dark:text-purple-300 text-sm sm:text-base">
              {isViewingOther ? 'View this househelp\'s profile' : 'Public view - This is how others see this profile'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {isViewingOther ? (
              <>
                <button
                  onClick={() => {
                    // Check if coming from inbox
                    if (location.state?.fromInbox) {
                      navigate('/inbox');
                    } else {
                      navigate('/');
                    }
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap flex items-center gap-2"
                >
                  ← {location.state?.fromInbox ? 'Back to Inbox' : 'Back to Home'}
                </button>
                <button
                  onClick={async () => {
                    setActionLoading('chat');
                    try {
                      const res = await apiClient.auth(`${API_BASE_URL}/api/v1/inbox/start/househelp/${profile?.profile_id || profile?.id}`, {
                        method: 'POST',
                      });
                      if (!res.ok) throw new Error('Failed to start conversation');
                      const data = await apiClient.json<any>(res);
                      const convId = (data && (data.id || data.ID || data.conversation_id)) as string | undefined;
                      if (convId) navigate(`/inbox/${convId}`);
                      else navigate('/inbox');
                    } catch (e) {
                      console.error('Failed to start chat:', e);
                      navigate('/inbox');
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  disabled={actionLoading === 'chat'}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                >
                  <MessageCircle className="w-5 h-5" />
                  {actionLoading === 'chat' ? 'Starting...' : 'Chat'}
                </button>
                <button
                  onClick={async () => {
                    setActionLoading('shortlist');
                    try {
                      const res = await apiClient.auth(`${API_ENDPOINTS.shortlists.base}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profile_id: profile?.profile_id || profile?.id, profile_type: 'househelp' }),
                      });
                      if (!res.ok) throw new Error('Failed to shortlist');
                      navigate('/household/employment?tab=shortlist');
                    } catch (e) {
                      console.error('Failed to shortlist:', e);
                    } finally {
                      setActionLoading(null);
                    }
                  }}
                  disabled={actionLoading === 'shortlist'}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-pink-500 text-white font-bold rounded-xl hover:bg-pink-600 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap flex items-center gap-2 disabled:opacity-50"
                >
                  <Heart className="w-5 h-5" />
                  {actionLoading === 'shortlist' ? 'Adding...' : 'Shortlist'}
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate('/househelp/profile')}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap self-start"
              >
                ← Back to My Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Image & Photos */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <div className="flex flex-col items-center mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-500 shadow-xl mb-4 relative bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            {(profile.avatar_url || (profile.photos && profile.photos.length > 0)) ? (
              <>
                {/* Skeleton loader for main profile image */}
                {!imageLoaded['main'] && (
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                )}
                <img
                  src={profile.avatar_url || profile.photos![0]}
                  alt="Profile"
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded['main'] ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => setImageLoaded(prev => ({ ...prev, main: true }))}
                  onError={() => {
                    setImageLoaded(prev => ({ ...prev, main: true }));
                  }}
                />
              </>
            ) : null}
            {/* Always show initials as fallback or when no image */}
            {(!profile.avatar_url && !(profile.photos && profile.photos.length > 0)) && (
              <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                {(profile.user?.first_name || profile.first_name || '?')[0]?.toUpperCase()}{(profile.user?.last_name || profile.last_name || '')[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {profile.user?.first_name || profile.first_name || 'Not specified'} {profile.user?.last_name || profile.last_name || ''}
          </h2>
          {profile['househelp-type'] && (
            <p className="text-purple-600 dark:text-purple-400 font-semibold capitalize">{profile['househelp-type']}</p>
          )}
        </div>
        
        {profile.photos && profile.photos.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-3">📸 Photo Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {profile.photos.map((photo, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer" onClick={() => setSelectedImage(photo)}>
                  {/* Skeleton loader for gallery images */}
                  {!imageLoaded[`photo-${idx}`] && (
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-shimmer bg-[length:200%_100%]" />
                  )}
                  <img
                    src={photo}
                    alt={`Profile photo ${idx + 1}`}
                    className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                      imageLoaded[`photo-${idx}`] ? 'opacity-100' : 'opacity-0'
                    }`}
                    onLoad={() => setImageLoaded(prev => ({ ...prev, [`photo-${idx}`]: true }))}
                    onError={(e) => {
                      e.currentTarget.src = '/assets/placeholder-image.png';
                      setImageLoaded(prev => ({ ...prev, [`photo-${idx}`]: true }));
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
      </div>

      {/* Personal Information */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👤 Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</span>
            <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.gender || 'Not specified'}</p>
          </div>
          {profile.date_of_birth && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Age</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {Math.floor((new Date().getTime() - new Date(profile.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old
              </p>
            </div>
          )}
          {profile.religion && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Religion</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.religion}</p>
            </div>
          )}
          {profile.marital_status && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Marital Status</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.marital_status}</p>
            </div>
          )}
          {profile.education_level && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Education Level</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.education_level}</p>
            </div>
          )}
          {profile.has_kids !== undefined && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Has Children</span>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.has_kids ? 'Yes' : 'No'}</p>
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
          {profile.skills && Array.isArray(profile.skills) && profile.skills.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Skills</span>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-900 dark:text-green-100 rounded-lg font-medium">
                    ⭐ {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.traits && Array.isArray(profile.traits) && profile.traits.length > 0 && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Personal Traits</span>
              <div className="flex flex-wrap gap-2">
                {profile.traits.map((trait, idx) => (
                  <span key={idx} className="px-3 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-900 dark:text-pink-100 rounded-lg font-medium">
                    💫 {trait}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.can_help_with && profile.can_help_with.trim() && (
            <div>
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Can Help With</span>
              <div className="flex flex-wrap gap-2">
                {profile.can_help_with.split(',').map((item, idx) => (
                  <span key={idx} className="px-3 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-900 dark:text-orange-100 rounded-lg font-medium">
                    🛠️ {item.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Certifications & Abilities */}
      <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
        <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">📜 Certifications & Abilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profile.first_aid_certificate !== undefined && (
            <div className={`p-4 rounded-lg ${profile.first_aid_certificate ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <p className={`font-semibold ${profile.first_aid_certificate ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>
                {profile.first_aid_certificate ? '✅' : '❌'} First Aid Certificate
              </p>
            </div>
          )}
          {profile.certificate_of_good_conduct !== undefined && (
            <div className={`p-4 rounded-lg ${profile.certificate_of_good_conduct ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <p className={`font-semibold ${profile.certificate_of_good_conduct ? 'text-green-900 dark:text-green-100' : 'text-gray-900 dark:text-gray-100'}`}>
                {profile.certificate_of_good_conduct ? '✅' : '❌'} Certificate of Good Conduct
              </p>
            </div>
          )}
          {profile.can_drive !== undefined && (
            <div className={`p-4 rounded-lg ${profile.can_drive ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <p className={`font-semibold ${profile.can_drive ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
                {profile.can_drive ? '✅' : '❌'} Can Drive
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Work with Children Details */}
      {profile.can_work_with_kid && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👶 Working with Children</h2>
          <div className="space-y-4">
            {profile.children_age_range && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Children Age Range</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.children_age_range}</p>
              </div>
            )}
            {profile.number_of_concurrent_children !== undefined && profile.number_of_concurrent_children > 0 && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Can Handle</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.number_of_concurrent_children} children at once</p>
              </div>
            )}
            {profile.my_child_preference && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Child Preference</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.my_child_preference}</p>
              </div>
            )}
            {profile.talent_with_kids && Array.isArray(profile.talent_with_kids) && profile.talent_with_kids.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Special Talents with Kids</span>
                <div className="flex flex-wrap gap-2">
                  {profile.talent_with_kids.map((talent, idx) => (
                    <span key={idx} className="px-3 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100 rounded-lg font-medium">
                      🌟 {talent}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Work with Pets Details */}
      {profile.can_work_with_pets && profile.pet_types && profile.pet_types.trim() && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🐾 Working with Pets</h2>
          <div>
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Comfortable with</span>
            <div className="flex flex-wrap gap-2">
              {profile.pet_types.split(',').map((pet, idx) => (
                <span key={idx} className="px-3 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 rounded-lg font-medium">
                  🐕 {pet.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Household Preferences */}
      {(profile.preferred_household_size || profile.preferred_location_type || profile.preferred_family_type || profile.needs_accommodation) && (
        <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
          <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🏠 Household Preferences</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.preferred_household_size && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Household Size</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.preferred_household_size}</p>
              </div>
            )}
            {profile.preferred_location_type && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Location Type</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.preferred_location_type}</p>
              </div>
            )}
            {profile.preferred_family_type && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Preferred Family Type</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1 capitalize">{profile.preferred_family_type}</p>
              </div>
            )}
            {profile.needs_accommodation !== undefined && (
              <div>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Needs Accommodation</span>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.needs_accommodation ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
          {profile.work_environment_notes && (
            <div className="mt-4">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Additional Notes</span>
              <p className="text-base text-gray-900 dark:text-gray-100 mt-1 whitespace-pre-wrap">{profile.work_environment_notes}</p>
            </div>
          )}
        </div>
      )}

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
