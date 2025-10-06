import React, { useEffect } from "react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";
import { useAuth } from "~/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  bio: string;
}


export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);
  const [success, setSuccess] = React.useState<string|null>(null);
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [showPhoneModal, setShowPhoneModal] = React.useState(false);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  // Fetch profile from /api/v1/auth/me
  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        setError(null);
        setSuccess(null);
        const res = await fetch('http://localhost:8080/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(data);
        setForm({
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleEdit = () => setEditMode(true);
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      email: profile?.email || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
    });
    setError(null);
    setSuccess(null);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');
      const res = await fetch('http://localhost:8080/api/v1/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          first_name: form.first_name,
          last_name: form.last_name,
          phone: form.phone,
        }),
      });
      if (!res.ok) throw new Error('Failed to update profile');
      setSuccess('Profile updated!');
      setEditMode(false);
      setProfile((p: any) => ({ ...p, ...form }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading || (!profile && user)) {
    return <Loading text="Loading profile..." />;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col w-full bg-slate-950">
      <Navigation />
      <div className="min-h-screen flex flex-col w-full bg-slate-950">
        <div className="mx-auto w-full max-w-md sm:max-w-lg flex flex-col items-center">
          <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 p-6 mt-4">
            <h1 className="text-3xl font-bold text-primary mb-4 text-center dark:text-primary-300">Profile</h1>
            <p className="text-center text-gray-500 dark:text-gray-300 mb-6">Manage your profile information. Only email, name and phone are editable.</p>

            {error && <div className="bg-red-100 text-red-700 px-3 py-2 rounded mb-3 text-center">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 px-3 py-2 rounded mb-3 text-center">{success}</div>}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">First Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="input input-bordered w-full rounded-lg px-3 py-2 text-base border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900"
                      autoComplete="given-name"
                    />
                  ) : (
                    <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      {form.first_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Last Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="input input-bordered w-full rounded-lg px-3 py-2 text-base border-primary-300 dark:border-primary-600 bg-white dark:bg-slate-900"
                      autoComplete="family-name"
                    />
                  ) : (
                    <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      {form.last_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Email</label>
                <div className="flex items-center">
                  <div className="flex-1 text-base text-gray-900 dark:text-gray-100 font-medium">
                    {form.email || <span className="text-gray-400">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    aria-label="Edit Email"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Phone</label>
                <div className="flex items-center">
                  <div className="flex-1 text-base text-gray-900 dark:text-gray-100 font-medium">
                    {form.phone || <span className="text-gray-400">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    aria-label="Edit Phone"
                    onClick={() => setShowPhoneModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>

              {/* Email/Phone Modals (placeholders) */}
              {showEmailModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
                    <h3 className="text-lg font-semibold mb-4">Change Email</h3>
                    {/* TODO: User will advise on modal logic here */}
                    <button className="btn-secondary mt-4 w-full" onClick={() => setShowEmailModal(false)}>Close</button>
                  </div>
                </div>
              )}
              {showPhoneModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-sm">
                    <h3 className="text-lg font-semibold mb-4">Change Phone</h3>
                    {/* TODO: User will advise on modal logic here */}
                    <button className="btn-secondary mt-4 w-full" onClick={() => setShowPhoneModal(false)}>Close</button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Profile Type</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.profile_type || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Role</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.role || '-'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Status</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.status || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Email Verified</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.email_verified ? 'Yes' : 'No'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Auth Provider</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.auth_provider || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Country</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.country || '-'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Created At</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleString() : '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Updated At</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.updated_at ? new Date(profile.updated_at).toLocaleString() : '-'}</span>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                {!editMode && (
                  <button
                    type="button"
                    className="btn-primary px-6 py-2 rounded-lg font-semibold"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      type="button"
                      className="btn-primary px-6 py-2 rounded-lg font-semibold disabled:opacity-60"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary px-6 py-2 rounded-lg font-semibold"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}