import React, { useEffect, useState } from "react";

export default function HouseholdProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const res = await fetch("http://localhost:8080/api/v1/profile/employer/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-6 text-center">{error}</div>;
  if (!profile) return null;

  return (
      <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
        <h1 className="text-2xl font-bold text-primary mb-2 text-center dark:text-primary-300">Household Profile</h1>
        <div className="text-center text-gray-500 dark:text-gray-300 mb-6">Your employer profile details</div>
        <div className="space-y-4">

          <div>
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Address</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.address || '-'}</span>
          </div>
          <div>
            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</span>
            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.bio || '-'}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Verified</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.verified ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">House Size</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.house_size}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Number of Kids</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.number_of_kids}</span>
            </div>
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Newborns Under 1</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.new_borns_under_one}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Max Househelps</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.max_househelps}</span>
            </div>
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Created At</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-4">
            <div className="flex-1">
              <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Updated At</span>
              <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.updated_at ? new Date(profile.updated_at).toLocaleString() : '-'}</span>
            </div>
          </div>
        </div>
      </div>
  );
}


