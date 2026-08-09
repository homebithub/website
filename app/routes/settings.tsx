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
  reverting = false,
  busy = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  /** Slides back slowly, so a refused change is seen rather than guessed at. */
  reverting?: boolean;
  busy?: boolean;
}) {
  return (
    <label
      className={`inline-flex items-center ${busy ? "cursor-progress" : "cursor-pointer"}`}
      aria-label={label}
    >
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        disabled={busy}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span
        className={`relative h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 dark:bg-gray-700 ${
          reverting ? "duration-700" : "duration-200"
        }`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 ${
            reverting ? "duration-700 ease-in-out" : "duration-200"
          }`}
        />
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
  const [busyKeys, setBusyKeys] = useState<Set<string>>(new Set());
  const [revertingKeys, setRevertingKeys] = useState<Set<string>>(new Set());
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
    // Settled rather than all: account, password and device settings must stay
    // usable when only one of these reads fails. Delivery preferences in
    // particular are secondary, and a single failure previously discarded the
    // whole load and replaced the page with the raw backend message.
    Promise.allSettled([
      fetchPreferences(),
      notificationsService.getUserPreferences(userId),
    ])
      .then(([appResult, deliveryResult]) => {
        if (cancelled) return;

        if (appResult.status === "fulfilled") {
          setPreferences(appResult.value?.settings || {});
        }
        if (deliveryResult.status === "fulfilled") {
          setNotifications({ ...defaultNotifications, ...(deliveryResult.value || {}) });
        }

        const failed: string[] = [];
        if (appResult.status === "rejected") {
          console.error("Unable to load application preferences", appResult.reason);
          failed.push("app preferences");
        }
        if (deliveryResult.status === "rejected") {
          console.error("Unable to load notification preferences", deliveryResult.reason);
          // Defaults are already in state, so the toggles stay usable and
          // saving writes a real record.
          failed.push("notification preferences");
        }
        if (failed.length > 0) {
          setMessage({
            type: "error",
            text: `We couldn’t load your ${failed.join(" or ")}. Everything else on this page still works, and saving will store your choices.`,
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

  // A toggle writes itself.
  //
  // The Save buttons were a second step for a single boolean, and they made a
  // failure ambiguous: nothing distinguished "not saved yet" from "saved" from
  // "the save failed". The switch now IS the state — it moves, the write
  // happens, and if the write is refused it moves back slowly enough to be
  // seen, with the reason.
  //
  // Optimistic on purpose: waiting for the round trip before moving the switch
  // makes every toggle feel broken on a slow connection, and the revert is the
  // honest correction when it is needed.
  const commit = async (
    key: string,
    apply: () => void,
    undo: () => void,
    write: () => Promise<unknown>,
    label: string,
  ) => {
    apply();
    setMessage(null);
    setBusyKeys((current) => new Set(current).add(key));

    try {
      await write();
      setMessage({ type: "success", text: `${label} saved.` });
    } catch (error) {
      undo();
      // Marked reverting only after the value is back, so the slow slide is
      // the correction itself rather than a delay before it.
      setRevertingKeys((current) => new Set(current).add(key));
      window.setTimeout(() => {
        setRevertingKeys((current) => {
          const next = new Set(current);
          next.delete(key);
          return next;
        });
      }, 800);
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : `Could not save ${label.toLowerCase()}.`,
      });
    } finally {
      setBusyKeys((current) => {
        const next = new Set(current);
        next.delete(key);
        return next;
      });
    }
  };

  const commitPreference = (key: keyof UserPreferences, value: boolean, label: string) => {
    const previous = preferences[key];
    return commit(
      String(key),
      () => setPreferences((current) => ({ ...current, [key]: value })),
      () => setPreferences((current) => ({ ...current, [key]: previous })),
      () => updatePreferences({ [key]: value }),
      label,
    );
  };

  const commitNotification = (key: keyof NotificationPreferences, value: boolean, label: string) => {
    const previous = notifications[key];
    return commit(
      String(key),
      () => setNotifications((current) => ({ ...current, [key]: value })),
      () => setNotifications((current) => ({ ...current, [key]: previous })),
      () => notificationsService.updateUserPreferences(userId, { ...notifications, [key]: value }),
      label,
    );
  };

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

          {/* Three cards, not four: Account led back to the profile page, which
              the navigation already reaches directly. */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                      busy={busyKeys.has(String(item.key))}
                      reverting={revertingKeys.has(String(item.key))}
                      onChange={(value) => void commitNotification(item.key, value, item.label)}
                    />
                  </div>
                ))}
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
                      busy={busyKeys.has(String(item.key))}
                      reverting={revertingKeys.has(String(item.key))}
                      onChange={(value) => void commitPreference(item.key, value, item.label)}
                    />
                  </div>
                ))}
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
