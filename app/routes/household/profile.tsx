import React, { useEffect, useState } from "react";
import { API_ENDPOINTS } from '~/config/api';

export default function HouseholdProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Not authenticated");
        const res = await fetch(API_ENDPOINTS.profile.employer.me, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        setProfile(data);
        setForm(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleEdit = () => {
    setEditMode(true);
    setForm({ ...profile });
    setSuccess(null);
    setError(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setForm({});
    setSuccess(null);
    setError(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Not authenticated");
      const res = await fetch(API_ENDPOINTS.profile.employer.me, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const updated = await res.json();
      setProfile(updated);
      setEditMode(false);
      setSuccess("Profile updated successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12">Loading...</div>;
  if (error) return <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-5 shadow-md mt-6"><div className="flex items-center justify-center"><span className="text-2xl mr-3">⚠️</span><p className="text-base font-semibold text-red-800">{error}</p></div></div>;
  if (!profile) return null;

  return (
    <div className="w-full bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-2xl border-2 border-purple-200 p-6 sm:p-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Household Profile 🏠</h1>
        {!editMode && (
          <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all" onClick={handleEdit}>
            ✏️ Edit
          </button>
        )}
      </div>
      <div className="text-center text-gray-500 dark:text-gray-300 mb-6">Your employer profile details</div>
      <div className="space-y-4">
        {editMode ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-sm font-semibold mb-2 text-purple-700">Address</label>
              <textarea
                name="address"
                value={form.address || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2 text-purple-700">Bio</label>
              <textarea
                name="bio"
                value={form.bio || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <div className="flex-1">
                <label className="block text-sm font-semibold mb-2 text-purple-700">House Size</label>
                <input
                  name="house_size"
                  type="text"
                  value={form.house_size || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Number of Kids</label>
                <input
                  name="number_of_kids"
                  type="number"
                  value={form.number_of_kids || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 bg-white text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Newborns Under 1</label>
                <input
                  name="new_borns_under_one"
                  type="number"
              <div className="flex-1">
                <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">House Size</span>
                <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.house_size}</span>
              </div>
              <div className="flex-1">
                <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Number of Kids</span>
                <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.number_of_kids}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <div className="flex-1">
                <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Newborns Under 1</span>
                <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.new_borns_under_one}</span>
              </div>
              <div className="flex-1">
                <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Max Househelps</span>
                <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.max_househelps}</span>
              </div>
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
          </>
        )}
      </div>
    </div>
  );
}



// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
