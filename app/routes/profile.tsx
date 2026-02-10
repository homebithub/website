import React from "react";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { API_ENDPOINTS } from '~/config/api';
import { formatTimeAgo } from "~/utils/timeAgo";
import { ErrorAlert } from '~/components/ui/ErrorAlert';

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
        const res = await fetch(API_ENDPOINTS.auth.me, {
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
      const res = await fetch(API_ENDPOINTS.auth.me, {
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
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-3xl bg-gradient-to-br from-purple-50 to-white dark:from-[#020617] dark:to-[#020617] rounded-3xl shadow-2xl dark:shadow-glow-md border-2 border-purple-200 dark:border-purple-500/30 p-8 transition-colors duration-300">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 text-center">My Profile 👤</h1>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">Manage your profile information. Only email, name and phone are editable.</p>

            {error && <ErrorAlert message={error} className="mb-4" />}
            {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-emerald-500/40 p-4 shadow-md mb-4 transition-colors duration-300"><div className="flex items-center justify-center"><span className="text-xl mr-2">🎉</span><p className="text-sm font-bold text-green-800 dark:text-green-200">{success}</p></div></div>}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-700">First Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full h-12 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/40 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      autoComplete="given-name"
                    />
                  ) : (
                    <div className="text-base text-gray-900 dark:text-gray-100 font-medium">
                      {form.first_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-purple-700">Last Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full h-12 px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/40 bg-white dark:bg-[#020617] text-gray-900 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
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
                <label className="block text-sm font-semibold mb-2 text-purple-700">Email</label>
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
                <label className="block text-sm font-semibold mb-2 text-purple-700">Phone</label>
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
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.created_at ? formatTimeAgo(profile.created_at) : '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Updated At</span>
                  <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile?.updated_at ? formatTimeAgo(profile.updated_at) : '-'}</span>
                </div>
              </div>
              <div className="flex justify-center gap-3 mt-6">
                {!editMode && (
                  <button
                    type="button"
                    className="px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all"
                    onClick={handleEdit}
                  >
                    ✏️ Edit Profile
                  </button>
                )}
                {editMode && (
                  <>
                    <button
                      type="button"
                      className="px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? '✨ Saving...' : '🚀 Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="px-6 py-1.5 rounded-xl border-2 border-purple-200 dark:border-purple-500/40 bg-white dark:bg-transparent text-purple-600 dark:text-purple-300 font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-400 transition-all"
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
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
