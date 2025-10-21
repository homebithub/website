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
        const res = await fetch(API_ENDPOINTS.profile.household.me, {
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
      const res = await fetch(API_ENDPOINTS.profile.household.me, {
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
      
      {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 shadow-md mb-4"><div className="flex items-center justify-center"><span className="text-xl mr-2">🎉</span><p className="text-sm font-bold text-green-800">{success}</p></div></div>}
      
      <div className="text-center text-gray-600 mb-6">Your household profile details</div>
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
            <div className="flex justify-end gap-2 mt-4">
              <button type="submit" className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100" disabled={saving}>
                {saving ? "✨ Saving..." : "🚀 Save"}
              </button>
              <button type="button" className="px-6 py-3 rounded-xl border-2 border-purple-200 bg-white text-purple-600 font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="space-y-3">
              <div>
                <span className="block text-sm font-semibold mb-1 text-purple-700">Address</span>
                <span className="text-base text-gray-900 font-medium">{profile.address || '-'}</span>
              </div>
              <div>
                <span className="block text-sm font-semibold mb-1 text-purple-700">Bio</span>
                <span className="text-base text-gray-900 font-medium">{profile.bio || '-'}</span>
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
