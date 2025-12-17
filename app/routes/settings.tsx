import { useNavigate, useLocation } from "react-router";
import React, { useEffect, useState } from "react";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { Footer } from "~/components/Footer";
import { Error } from "~/components/Error";
import { useAuth } from "~/contexts/useAuth";
import { Loading } from "~/components/Loading";
import { fetchPreferences, updatePreferences, type UserPreferences } from "~/utils/preferencesApi";

export default function SettingsPage() {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [preferences, setPreferences] = useState<UserPreferences | null>(null);
	const [prefsLoading, setPrefsLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);

	useEffect(() => {
		// If not loading and no user, redirect to login
		if (!loading && !user) {
			const returnUrl = encodeURIComponent(location.pathname);
			navigate(`/login?redirect=${returnUrl}`);
		}
	}, [user, loading, navigate, location.pathname]);

	useEffect(() => {
		if (!user) return;
		let cancelled = false;
		const loadPrefs = async () => {
			setPrefsLoading(true);
			setErrorMessage(null);
			try {
				const res = await fetchPreferences();
				if (!cancelled) {
					if (res?.settings) {
						setPreferences(res.settings);
					} else {
						setPreferences({});
					}
				}
			} catch (err: any) {
				if (!cancelled) {
					setErrorMessage(err?.message || "Failed to load preferences");
				}
			} finally {
				if (!cancelled) setPrefsLoading(false);
			}
		};
		loadPrefs();
		return () => {
			cancelled = true;
		};
	}, [user]);

	// Show loading while checking authentication
	if (loading) {
		return <Loading text="Checking authentication..." />;
	}

	// Don't render anything if not authenticated (will redirect)
	if (!user) {
		return null;
	}

	const handlePrefChange = (key: keyof UserPreferences, value: any) => {
		setPreferences((prev) => ({ ...(prev || {}), [key]: value }));
	};

	const handleSavePreferences = async () => {
		if (!preferences) return;
		setSaving(true);
		setErrorMessage(null);
		setSuccessMessage(null);
		try {
			const res = await updatePreferences(preferences);
			if (!res) {
				setErrorMessage("Failed to save preferences");
				return;
			}
			setSuccessMessage("Preferences updated successfully");
			setPreferences(res.settings);
		} catch (err: any) {
			setErrorMessage(err?.message || "Failed to save preferences");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="min-h-screen flex flex-col">
			<Navigation />
			<PurpleThemeWrapper variant="light" bubbles={true} bubbleDensity="low" className="flex-1">
			<main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
				<div className="w-full max-w-3xl bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-2xl border-2 border-purple-200 p-8">
					<h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
						⚙️ Settings
					</h1>
					<p className="text-lg text-gray-600 mb-8">Manage your account settings and app preferences.</p>
					
					{errorMessage && (
						<div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm text-left">
							{errorMessage}
						</div>
					)}
					{successMessage && (
						<div className="mb-4 rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3 text-sm text-left">
							{successMessage}
						</div>
					)}
					
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6 hover:border-purple-200 transition-all">
							<div className="font-bold text-purple-700 text-xl mb-2">👤 Account Settings</div>
							<div className="text-gray-600 text-sm mb-4">Update your account information and profile details.</div>
							<a href="/profile" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all">Edit Account</a>
						</div>
						
						<div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6 hover:border-purple-200 transition-all">
							<div className="font-bold text-purple-700 text-xl mb-2">🔒 Security Settings</div>
							<div className="text-gray-600 text-sm mb-4">Change your password and manage security options.</div>
							<a href="/change-password" className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all">Change Password</a>
						</div>
					</div>
					
					<div className="mt-8 bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-6 text-left">
						<div className="flex items-center justify-between mb-4">
							<div>
								<div className="font-bold text-purple-700 text-xl mb-1">🎛 App Preferences</div>
								<p className="text-gray-600 text-sm">Control how Homebit looks and behaves for you.</p>
							</div>
							{prefsLoading && (
								<span className="text-xs text-gray-500">Loading preferences...</span>
							)}
						</div>
						
						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-gray-900">Theme</div>
									<p className="text-sm text-gray-500">Choose how the app theme behaves.</p>
								</div>
								<select
									className="mt-1 block w-40 rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50"
									value={preferences?.theme || "system"}
									onChange={(e) => handlePrefChange("theme", e.target.value as UserPreferences["theme"])}
								>
									<option value="system">System default</option>
									<option value="light">Light</option>
									<option value="dark">Dark</option>
								</select>
							</div>
							
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-gray-900">Email notifications</div>
									<p className="text-sm text-gray-500">Receive important updates about matches and hires.</p>
								</div>
								<label className="inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={Boolean(preferences?.email_notifs)}
										onChange={(e) => handlePrefChange("email_notifs", e.target.checked)}
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:bg-purple-600 transition-all relative">
										<span className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-5" />
									</div>
								</label>
							</div>
							
							<div className="flex items-center justify-between">
								<div>
									<div className="font-medium text-gray-900">Show onboarding tips</div>
									<p className="text-sm text-gray-500">Keep helpful guidance visible while you explore.</p>
								</div>
								<label className="inline-flex items-center cursor-pointer">
									<input
										type="checkbox"
										className="sr-only peer"
										checked={Boolean(preferences?.show_onboarding)}
										onChange={(e) => handlePrefChange("show_onboarding", e.target.checked)}
									/>
									<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-500 rounded-full peer peer-checked:bg-purple-600 transition-all relative">
										<span className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full shadow transform transition-transform peer-checked:translate-x-5" />
									</div>
								</label>
							</div>
						</div>
						
						<div className="mt-6 flex justify-end">
							<button
								type="button"
								className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
								onClick={handleSavePreferences}
								disabled={saving || prefsLoading}
							>
								{saving ? "Saving..." : "Save Preferences"}
							</button>
						</div>
					</div>
				</div>
			</main>
			</PurpleThemeWrapper>
			<Footer />
		</div>
  );
} 
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
