import React, { useEffect, useState } from "react";

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
        const res = await fetch("http://localhost:8080/api/v1/profile/employer/me", {
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
      const res = await fetch("http://localhost:8080/api/v1/profile/employer/me", {
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
  if (error) return <div className="bg-red-100 text-red-700 px-4 py-2 rounded mt-6 text-center">{error}</div>;
  if (!profile) return null;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary dark:text-primary-300">Household Profile</h1>
        {!editMode && (
          <button className="btn-primary" onClick={handleEdit}>
            Edit 
          </button>
        )}
      </div>
      <div className="text-center text-gray-500 dark:text-gray-300 mb-6">Your employer profile details</div>
      <div className="space-y-4">
        {editMode ? (
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Address</label>
              <textarea
                name="address"
                value={form.address || ''}
                onChange={handleChange}
                className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</label>
              <textarea
                name="bio"
                value={form.bio || ''}
                onChange={handleChange}
                className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">House Size</label>
                <input
                  name="house_size"
                  type="text"
                  value={form.house_size || ''}
                  onChange={handleChange}
                  className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Number of Kids</label>
                <input
                  name="number_of_kids"
                  type="number"
                  value={form.number_of_kids || ''}
                  onChange={handleChange}
                  className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Newborns Under 1</label>
                <input
                  name="new_borns_under_one"
                  type="number"
                  value={form.new_borns_under_one || ''}
                  onChange={handleChange}
                  className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Max Househelps</label>
                <input
                  name="max_househelps"
                  type="number"
                  value={form.max_househelps || ''}
                  onChange={handleChange}
                  className="w-full rounded p-2 bg-slate-800 text-white border border-slate-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn-secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </button>
            </div>
            {error && <div className="text-red-600 mt-2">{error}</div>}
            {success && <div className="text-green-600 mt-2">{success}</div>}
          </form>
        ) : (
          <>
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


