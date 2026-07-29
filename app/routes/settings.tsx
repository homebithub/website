import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  Bell,
  Eye,
  Laptop,
  LockKeyhole,
  Mail,
  MessageSquareText,
  Settings2,
  Smartphone,
  UserRound,
  Star,
} from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Loading } from "~/components/Loading";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { useAuth } from "~/contexts/useAuth";
import {
  fetchPreferences,
  updatePreferences,
  type UserPreferences,
} from "~/utils/preferencesApi";
import { notificationsService } from "~/services/grpc/notifications.service";

interface NotificationPreferences {
  email_enabled: boolean;
  sms_enabled: boolean;
  push_enabled: boolean;
  email_frequency: string;
  sms_frequency: string;
  push_frequency: string;
  timezone: string;
}

const defaultNotifications: NotificationPreferences = {
  email_enabled: true,
  sms_enabled: true,
  push_enabled: true,
  email_frequency: "immediate",
  sms_frequency: "immediate",
  push_frequency: "immediate",
  timezone: "Africa/Nairobi",
};

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <label className="inline-flex items-center cursor-pointer" aria-label={label}>
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="relative h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 dark:bg-gray-700">
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-purple-200/50 bg-white p-5 shadow-sm dark:border-purple-500/30 dark:bg-[#13131a]">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-xl bg-purple-100 p-2 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function SettingsPage() {
  const { user, loading } = useAuth();
  const currentUser = ((user as any)?.user || user) as any;
  const userId = currentUser?.id || currentUser?.user_id || "";
  const navigate = useNavigate();
  const location = useLocation();
  const [preferences, setPreferences] = useState<UserPreferences>({});
  const [notifications, setNotifications] =
    useState<NotificationPreferences>(defaultNotifications);
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [savingApp, setSavingApp] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!loading && !user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
    }
  }, [user, loading, navigate, location.pathname]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setPrefsLoading(true);
    Promise.all([
      fetchPreferences(),
      notificationsService.getUserPreferences(userId),
    ])
      .then(([app, delivery]) => {
        if (cancelled) return;
        setPreferences(app?.settings || {});
        setNotifications({ ...defaultNotifications, ...(delivery || {}) });
      })
      .catch((error) => {
        if (!cancelled) {
          setMessage({
            type: "error",
            text: error instanceof Error ? error.message : "Could not load settings.",
          });
        }
      })
      .finally(() => {
        if (!cancelled) setPrefsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, userId]);

  if (loading) return <Loading text="Checking authentication..." />;
  if (!user) return <Loading text="Redirecting to login..." />;

  const saveApplicationPreferences = async () => {
    setSavingApp(true);
    setMessage(null);
    try {
      const response = await updatePreferences(preferences);
      setPreferences(response?.settings || preferences);
      setMessage({ type: "success", text: "App preferences saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save app preferences.",
      });
    } finally {
      setSavingApp(false);
    }
  };

  const saveNotificationPreferences = async () => {
    setSavingNotifications(true);
    setMessage(null);
    try {
      const response = await notificationsService.updateUserPreferences(
        userId,
        notifications,
      );
      setNotifications({ ...defaultNotifications, ...(response || notifications) });
      setMessage({ type: "success", text: "Notification preferences saved." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Could not save notifications.",
      });
    } finally {
      setSavingNotifications(false);
    }
  };

  const profilePath =
    String(currentUser?.profile_type || currentUser?.profileType || "").toLowerCase() === "househelp"
      ? "/househelp/profile"
      : "/household/profile";

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-7">
            <h1 className="text-xl font-bold text-purple-700 dark:text-purple-300">
              Settings
            </h1>
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
              Manage your account, trusted devices, and communication choices.
            </p>
          </div>

          {message && (
            <div
              role="status"
              className={`mb-5 rounded-xl border px-4 py-3 text-xs ${
                message.type === "success"
                  ? "border-emerald-400/40 bg-emerald-950/20 text-emerald-700 dark:text-emerald-200"
                  : "border-red-400/40 bg-red-950/20 text-red-700 dark:text-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to={profilePath}
              className="rounded-2xl border border-purple-200/50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-purple-400 dark:border-purple-500/30 dark:bg-[#13131a]"
            >
              <UserRound className="mb-3 h-5 w-5 text-purple-600 dark:text-purple-300" />
              <div className="text-xs font-semibold text-gray-900 dark:text-white">Account</div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Update your profile and public information.
              </p>
            </Link>
            <Link
              to="/change-password"
              className="rounded-2xl border border-purple-200/50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-purple-400 dark:border-purple-500/30 dark:bg-[#13131a]"
            >
              <LockKeyhole className="mb-3 h-5 w-5 text-purple-600 dark:text-purple-300" />
              <div className="text-xs font-semibold text-gray-900 dark:text-white">Password</div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Change the password used to sign in.
              </p>
            </Link>
            <Link
              to="/account/devices"
              className="rounded-2xl border border-purple-200/50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-purple-400 dark:border-purple-500/30 dark:bg-[#13131a]"
            >
              <Laptop className="mb-3 h-5 w-5 text-purple-600 dark:text-purple-300" />
              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                Trusted devices
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Review sessions and revoke devices you do not recognise.
              </p>
            </Link>
            <Link
              to="/account/reviews"
              className="rounded-2xl border border-purple-200/50 bg-white p-5 transition hover:-translate-y-0.5 hover:border-purple-400 dark:border-purple-500/30 dark:bg-[#13131a]"
            >
              <Star className="mb-3 h-5 w-5 text-purple-600 dark:text-purple-300" />
              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                My reviews
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                See reviews you have submitted and owner responses.
              </p>
            </Link>
          </div>

          <div className="space-y-5">
            <Section
              icon={<Bell className="h-4 w-4" />}
              title="Notification preferences"
              description="These choices are saved by the Notifications service and apply on every device."
            >
              <div className="divide-y divide-purple-100 dark:divide-purple-500/15">
                {[
                  {
                    key: "email_enabled" as const,
                    icon: <Mail className="h-4 w-4" />,
                    label: "Email",
                    detail: "Account, hiring, contract, and message updates.",
                  },
                  {
                    key: "sms_enabled" as const,
                    icon: <MessageSquareText className="h-4 w-4" />,
                    label: "SMS",
                    detail: "Time-sensitive OTP and marketplace updates.",
                  },
                  {
                    key: "push_enabled" as const,
                    icon: <Smartphone className="h-4 w-4" />,
                    label: "Push",
                    detail: "Browser and mobile alerts when a device supports them.",
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-5 py-4 first:pt-0">
                    <div className="flex gap-3">
                      <span className="mt-0.5 text-purple-500">{item.icon}</span>
                      <div>
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {item.label}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.detail}</p>
                      </div>
                    </div>
                    <Toggle
                      label={`${item.label} notifications`}
                      checked={notifications[item.key]}
                      onChange={(value) =>
                        setNotifications((current) => ({ ...current, [item.key]: value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={saveNotificationPreferences}
                  disabled={prefsLoading || savingNotifications}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {savingNotifications ? "Saving..." : "Save notifications"}
                </button>
              </div>
            </Section>

            <Section
              icon={<Settings2 className="h-4 w-4" />}
              title="App preferences"
              description="Personalise how HomeBit looks and guides you through the product."
            >
              <div className="divide-y divide-purple-100 dark:divide-purple-500/15">
                {[
                  {
                    key: "show_onboarding" as const,
                    label: "Show onboarding tips",
                    detail: "Keep contextual guidance visible while you explore.",
                    icon: <Eye className="h-4 w-4" />,
                  },
                  {
                    key: "compact_view" as const,
                    label: "Compact view",
                    detail: "Use denser cards and tighter spacing in result lists.",
                    icon: <Settings2 className="h-4 w-4" />,
                  },
                  {
                    key: "accessibility_mode" as const,
                    label: "Accessibility mode",
                    detail: "Increase contrast and improve legibility in key screens.",
                    icon: <Eye className="h-4 w-4" />,
                  },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-5 py-4 first:pt-0">
                    <div className="flex gap-3">
                      <span className="mt-0.5 text-purple-500">{item.icon}</span>
                      <div>
                        <div className="text-xs font-medium text-gray-900 dark:text-gray-100">
                          {item.label}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.detail}</p>
                      </div>
                    </div>
                    <Toggle
                      label={item.label}
                      checked={Boolean(preferences[item.key])}
                      onChange={(value) =>
                        setPreferences((current) => ({ ...current, [item.key]: value }))
                      }
                    />
                  </div>
                ))}
              </div>
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={saveApplicationPreferences}
                  disabled={prefsLoading || savingApp}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-2 text-xs font-semibold text-white shadow transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
                >
                  {savingApp ? "Saving..." : "Save app preferences"}
                </button>
              </div>
            </Section>
          </div>
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
