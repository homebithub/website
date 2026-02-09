import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { API_BASE_URL } from "~/config/api";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";

interface HouseholdData {
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
}

export default function HouseholdPublicProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user_id } = useParams();
  const [profile, setProfile] = useState<HouseholdData | null>(null);
  const [kids, setKids] = useState<any[]>([]);
  const [pets, setPets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigationState = (location.state ?? {}) as {
    backTo?: string;
    backLabel?: string;
    fromInbox?: boolean;
    fromHireRequests?: boolean;
  };

  const handleBackNavigation = () => {
    if (navigationState.backTo) {
      navigate(navigationState.backTo);
      return;
    }
    if (navigationState.fromInbox) {
      navigate('/inbox');
      return;
    }
    navigate(-1);
  };

  const backLabel =
    navigationState.backLabel ||
    (navigationState.fromInbox ? 'Back to Inbox' : navigationState.fromHireRequests ? 'Back to Hiring' : 'Back');

  const API_BASE = useMemo(
    () => (typeof window !== 'undefined' && (window as any).ENV?.AUTH_API_BASE_URL) || API_BASE_URL,
    []
  );

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        if (!user_id) throw new Error("Missing user id");

        // Fetch target household profile by user ID
        const profileRes = await fetch(`${API_BASE}/api/v1/profile/household/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        const profileData = await profileRes.json();
        setProfile(profileData);

        // Fetch pets for the target user (publicly viewable within auth)
        try {
          const petsRes = await fetch(`${API_BASE}/api/v1/pets/user/${user_id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (petsRes.ok) {
            const petsData = await petsRes.json();
            setPets(petsData || []);
          }
        } catch {}

        // Fetch kids only if viewing own profile (route param equals current user)
        try {
          const meStr = localStorage.getItem("user_object");
          const me = meStr ? JSON.parse(meStr) : null;
          if (me?.id && me.id === user_id) {
            const kidsRes = await fetch(`${API_BASE}/api/v1/household_kids`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (kidsRes.ok) {
              const kidsData = await kidsRes.json();
              setKids(kidsData || []);
            }
          }
        } catch {}
      } catch (err: any) {
        console.error("Error loading household profile:", err);
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [API_BASE, user_id]);

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
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low">
        <main className="flex-1 py-8">
          <div className="max-w-5xl mx-auto px-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-gray-800 dark:to-gray-900 p-4 sm:p-8 text-white rounded-t-3xl dark:border-b dark:border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold mb-2">🏠 Household Profile</h1>
                  <p className="text-purple-100 dark:text-purple-300 text-sm sm:text-base">Public view - This is how others see this profile</p>
                </div>
                <button
                  onClick={handleBackNavigation}
                  className="px-4 sm:px-6 py-1 sm:py-1.5 bg-white text-purple-600 font-bold rounded-xl hover:bg-purple-50 hover:scale-105 transition-all shadow-lg text-sm sm:text-base whitespace-nowrap self-start"
                >
                  ← {backLabel}
                </button>
              </div>
            </div>

            {/* House Size & Notes */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🏠 House Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">House Size</span>
                  <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{profile.house_size || 'Not specified'}</p>
                </div>
                {profile.household_notes && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Additional Notes</span>
                    <p className="text-base text-gray-900 dark:text-gray-100 mt-1">{profile.household_notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Type */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">👥 Service Type Needed</h2>
              <div className="space-y-3">
                {profile.needs_live_in && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <p className="font-semibold text-purple-900 dark:text-purple-100">🌙 They need Live-in Help</p>
                    {profile.live_in_off_days && profile.live_in_off_days.length > 0 && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Off days: {profile.live_in_off_days.join(', ')}</p>
                    )}
                  </div>
                )}
                {profile.needs_day_worker && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">☀️ They need Day Worker</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Schedule configured</p>
                  </div>
                )}
                {profile.available_from && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">They need your availability from</span>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">{new Date(profile.available_from).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pets */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🐾 Pets</h2>
              {pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet, idx) => (
                    <div key={pet.id || idx} className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <p className="font-semibold text-purple-900 dark:text-purple-100 capitalize">🐾 {pet.pet_type}</p>
                      {pet.requires_care && <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">⚠️ Requires care</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No pets</p>
              )}
            </div>

            {/* Chores */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🧹 Chores & Duties</h2>
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
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">💰 Budget</h2>
              {profile.budget_min || profile.budget_max ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                    {profile.budget_min && profile.budget_max ? `KES ${profile.budget_min.toLocaleString()} - ${profile.budget_max.toLocaleString()}` : profile.budget_min ? `KES ${profile.budget_min.toLocaleString()}+` : 'Negotiable'}
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
                <p className="text-gray-500 dark:text-gray-400">Budget not specified</p>
              )}
            </div>

            {/* Religion */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">🙏 Religion & Beliefs</h2>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">{profile.religion || 'Not specified'}</p>
            </div>

            {/* Bio */}
            <div className="bg-white dark:bg-[#13131a] p-6 border-t border-purple-200/40 dark:border-purple-500/30 rounded-b-3xl">
              <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-4">✍️ About This Household</h2>
              <p className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{profile.bio || 'No bio added yet'}</p>
            </div>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
