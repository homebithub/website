import React from "react";

import { useEffect, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { API_BASE_URL } from '~/config/api';
import { formatTimeAgo } from "~/utils/timeAgo";

export default function BureauProfile() {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        company_name: '',
        license_number: '',
        founded_year: '',
        staff_count: '',
        service_areas: '',
        email: '',
        address: '',
        bio: '',
    });

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem("token");
                if (!token) throw new Error("Not authenticated");
                const res = await fetch(`${API_BASE_URL}/api/v1/profile/bureau/me`, {
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

    // When entering edit mode, populate form state from profile
    useEffect(() => {
        if (editMode && profile) {
            setForm({
                company_name: profile.company_name || '',
                license_number: profile.license_number || '',
                founded_year: profile.founded_year || '',
                staff_count: profile.staff_count || '',
                service_areas: Array.isArray(profile.service_areas) ? profile.service_areas.join(', ') : (profile.service_areas || ''),
                email: profile.email || '',
                address: profile.address || '',
                bio: profile.bio || '',
            });
        }
    }, [editMode, profile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdit = () => {
        // For now, just update the local profile state and exit edit mode
        setProfile((prev: any) => ({
            ...prev,
            company_name: form.company_name,
            license_number: form.license_number,
            founded_year: form.founded_year,
            staff_count: form.staff_count,
            service_areas: form.service_areas.split(',').map((s) => s.trim()).filter(Boolean),
            email: form.email,
            address: form.address,
            bio: form.bio,
        }));
        setEditMode(false);
    };

    const cancelEdit = () => {
        setEditMode(false);
    };

    if (loading) return <div className="flex justify-center py-12">Loading...</div>;
    if (error) return <div className="rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 p-5 shadow-md mt-6"><div className="flex items-center justify-center"><span className="text-2xl mr-3">⚠️</span><p className="text-base font-semibold text-red-800">{error}</p></div></div>;
    if (!profile) return null;

    return (
        <>
            <Navigation />
            <div className="min-h-screen w-full bg-slate-950">
                <div className="mx-auto w-full max-w-2xl flex flex-col items-center">
                    <div className="w-full bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-2xl border-2 border-purple-200 p-6 sm:p-8 relative">
                        {/* Edit button */}
                        {!editMode && (
                            <button
                                className="absolute top-4 right-4 px-4 py-1 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold"
                                onClick={() => setEditMode(true)}
                                type="button"
                            >
                                Edit
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-primary mb-2 text-center dark:text-primary-300">Bureau Profile</h1>
                        <div className="text-center text-gray-500 dark:text-gray-300 mb-6">Your bureau profile details</div>
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <div className="flex-1">
                                    <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Profile Status</span>
                                    <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.profile_status}</span>
                                </div>
                                <div className="flex-1">
                                    <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Profile Type</span>
                                    <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.profile_type}</span>
                                </div>
                            </div>
                            {/* Editable fields */}
                            {editMode ? (
                                <>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="company_name">Company Name</label>
                                        <input
                                            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                            type="text"
                                            name="company_name"
                                            id="company_name"
                                            value={form.company_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="license_number">License Number</label>
                                        <input
                                            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                            type="text"
                                            name="license_number"
                                            id="license_number"
                                            value={form.license_number}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="founded_year">Founded Year</label>
                                            <input
                                                className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                                type="number"
                                                name="founded_year"
                                                id="founded_year"
                                                value={form.founded_year}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="staff_count">Staff Count</label>
                                            <input
                                                className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                                type="number"
                                                name="staff_count"
                                                id="staff_count"
                                                value={form.staff_count}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="service_areas">Service Areas (comma-separated)</label>
                                        <input
                                            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                            type="text"
                                            name="service_areas"
                                            id="service_areas"
                                            value={form.service_areas}
                                            onChange={handleChange}
                                            placeholder="e.g. Nairobi, Mombasa"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="email">Email</label>
                                        <input
                                            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                            type="email"
                                            name="email"
                                            id="email"
                                            value={form.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="address">Address</label>
                                        <input
                                            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                            type="text"
                                            name="address"
                                            id="address"
                                            value={form.address}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200" htmlFor="bio">Bio</label>
                                        <textarea
                                            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-900 dark:text-gray-100"
                                            name="bio"
                                            id="bio"
                                            rows={3}
                                            value={form.bio}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="flex gap-4 mt-4">
                                        <button
                                            className="px-5 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 font-semibold"
                                            onClick={saveEdit}
                                            type="button"
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="px-5 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-800 font-semibold"
                                            onClick={cancelEdit}
                                            type="button"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Company Name</span>
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.company_name || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">License Number</span>
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.license_number || '-'}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:gap-4">
                                        <div className="flex-1">
                                            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Founded Year</span>
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.founded_year || '-'}</span>
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Staff Count</span>
                                            <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.staff_count || '-'}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Service Areas</span>
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{Array.isArray(profile.service_areas) ? profile.service_areas.join(', ') : '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Email</span>
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.email || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Address</span>
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.address || '-'}</span>
                                    </div>
                                    <div>
                                        <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Bio</span>
                                        <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.bio || '-'}</span>
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col sm:flex-row sm:gap-4">
                                <div className="flex-1">
                                    <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Verified</span>
                                    <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.verified ? 'Yes' : 'No'}</span>
                                </div>
                                <div className="flex-1">
                                    <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Created At</span>
                                    <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.created_at ? formatTimeAgo(profile.created_at) : '-'}</span>
                                </div>
                            </div>
                            <div>
                                <span className="block text-xs font-semibold mb-1 text-gray-700 dark:text-gray-200">Updated At</span>
                                <span className="text-base text-gray-900 dark:text-gray-100 font-medium">{profile.updated_at ? formatTimeAgo(profile.updated_at) : '-'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}


// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
