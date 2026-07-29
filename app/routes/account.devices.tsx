import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Laptop,
  LoaderCircle,
  MapPin,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
} from "lucide-react";
import { Navigation } from "~/components/Navigation";
import { Footer } from "~/components/Footer";
import { Loading } from "~/components/Loading";
import { PurpleThemeWrapper } from "~/components/layout/PurpleThemeWrapper";
import { PurpleCard } from "~/components/ui/PurpleCard";
import { useAuth } from "~/contexts/useAuth";
import { deviceService } from "~/services/grpc/device.service";
import { getDeviceId } from "~/utils/deviceFingerprint";

export const meta = () => [
  { title: "Trusted Devices - HomeBit" },
  { name: "description", content: "Review and revoke devices that can access your HomeBit account." },
];

function timestampToDate(value: any): Date | null {
  if (!value) return null;
  if (typeof value === "string") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  const seconds = Number(value.seconds ?? value.secondsLow ?? 0);
  return seconds ? new Date(seconds * 1000) : null;
}

function deviceIcon(type: string) {
  return /mobile|tablet/i.test(type) ? Smartphone : Laptop;
}

export default function DevicesPage() {
  const { user, loading: authLoading } = useAuth();
  const currentUser = ((user as any)?.user || user) as any;
  const userId = currentUser?.id || currentUser?.user_id || "";
  const navigate = useNavigate();
  const [devices, setDevices] = useState<any[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState({ total: 0, active: 0, pending: 0 });
  const [activityDeviceId, setActivityDeviceId] = useState<string | null>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login?redirect=%2Faccount%2Fdevices");
  }, [authLoading, user, navigate]);

  const loadDevices = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const fingerprint = await getDeviceId();
      setCurrentDeviceId(fingerprint);
      const response = await deviceService.getUserDevices(userId, fingerprint);
      setDevices(response.devices);
      setCounts({
        total: response.totalCount,
        active: response.activeCount,
        pending: response.pendingCount,
      });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load trusted devices.");
    } finally {
      setLoading(false);
    }
  }, [user, userId]);

  useEffect(() => {
    void loadDevices();
  }, [loadDevices]);

  const revoke = async (device: any) => {
    if (device.deviceId === currentDeviceId || device.isCurrentDevice) return;
    if (!window.confirm(`Revoke access for ${device.deviceName || "this device"}?`)) return;
    setBusyId(device.id || device.deviceId);
    setError(null);
    try {
      await deviceService.revokeDevice(
        device.id || device.deviceId,
        userId,
        "Revoked by account owner",
      );
      await loadDevices();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not revoke device.");
    } finally {
      setBusyId(null);
    }
  };

  const revokeOthers = async () => {
    if (!window.confirm("Revoke every other active device? Your current browser will remain signed in.")) {
      return;
    }
    setBusyId("all");
    setError(null);
    try {
      await deviceService.revokeAllDevices(
        userId,
        currentDeviceId,
        "Other devices revoked by account owner",
      );
      await loadDevices();
    } catch (revokeError) {
      setError(revokeError instanceof Error ? revokeError.message : "Could not revoke devices.");
    } finally {
      setBusyId(null);
    }
  };

  const toggleActivity = async (device: any) => {
    const id = device.id || device.deviceId;
    if (activityDeviceId === id) {
      setActivityDeviceId(null);
      setActivities([]);
      return;
    }
    setActivityDeviceId(id);
    setActivities([]);
    setActivityLoading(true);
    setError(null);
    try {
      const response = await deviceService.getDeviceActivity(id, userId, 20);
      setActivities(response.activities);
    } catch (activityError) {
      setError(activityError instanceof Error ? activityError.message : "Could not load device activity.");
      setActivityDeviceId(null);
    } finally {
      setActivityLoading(false);
    }
  };

  if (authLoading) return <Loading text="Checking authentication..." />;
  if (!user) return <Loading text="Redirecting to login..." />;

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} className="flex-1">
        <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <Link to="/settings" className="text-xs font-medium text-purple-500 hover:text-purple-400">
                ← Back to settings
              </Link>
              <h1 className="mt-3 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-white">
                <ShieldCheck className="h-6 w-6 text-purple-500" />
                Trusted devices
              </h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Review browsers and devices that have accessed your account.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void loadDevices()}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-purple-300 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
              <button
                type="button"
                onClick={revokeOthers}
                disabled={busyId !== null || counts.active <= 1}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-2 text-xs font-semibold text-white shadow disabled:opacity-50"
              >
                Revoke other devices
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-red-400/40 bg-red-950/20 px-4 py-3 text-xs text-red-700 dark:text-red-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-5 grid grid-cols-3 gap-3">
            {[
              ["Total", counts.total],
              ["Active", counts.active],
              ["Pending", counts.pending],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-purple-200/50 bg-white p-4 text-center dark:border-purple-500/30 dark:bg-[#13131a]"
              >
                <div className="text-xl font-bold text-purple-600 dark:text-purple-300">{value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          {loading ? (
            <PurpleCard hover={false} glow className="flex items-center justify-center p-12">
              <LoaderCircle className="h-7 w-7 animate-spin text-purple-500" />
            </PurpleCard>
          ) : devices.length === 0 ? (
            <PurpleCard hover={false} glow className="p-10 text-center">
              <Laptop className="mx-auto mb-3 h-10 w-10 text-purple-400" />
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">No devices recorded</h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                A device is recorded after a successful sign-in.
              </p>
            </PurpleCard>
          ) : (
            <div className="space-y-3">
              {devices.map((device) => {
                const Icon = deviceIcon(device.deviceType || "");
                const current = device.deviceId === currentDeviceId || device.isCurrentDevice;
                const revoked = device.status === "revoked";
                const lastActive = timestampToDate(device.lastActivityAt);
                return (
                  <PurpleCard
                    key={device.id || device.deviceId}
                    hover={false}
                    glow={current}
                    className="p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                              {device.deviceName || "Unknown device"}
                            </h2>
                            {current && (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                This device
                              </span>
                            )}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                revoked
                                  ? "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300"
                                  : device.status === "pending"
                                    ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                                    : "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300"
                              }`}
                            >
                              {device.status || "active"}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1">
                              <Activity className="h-3.5 w-3.5" />
                              {lastActive ? `Active ${lastActive.toLocaleString()}` : "Activity unavailable"}
                            </span>
                            {(device.city || device.country || device.ipAddress) && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {[device.city, device.country, device.ipAddress].filter(Boolean).join(" · ")}
                              </span>
                            )}
                            {device.isTrusted && (
                              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-300">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Trusted
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => void toggleActivity(device)}
                          disabled={activityLoading && activityDeviceId === (device.id || device.deviceId)}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-300 px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10"
                        >
                          {activityLoading && activityDeviceId === (device.id || device.deviceId) ? (
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                          ) : (
                            <Activity className="h-4 w-4" />
                          )}
                          {activityDeviceId === (device.id || device.deviceId) ? "Hide activity" : "View activity"}
                        </button>
                        {!current && !revoked && (
                          <button
                            type="button"
                            onClick={() => void revoke(device)}
                            disabled={busyId !== null}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-400/40 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-300 dark:hover:bg-red-500/10"
                          >
                            {busyId === (device.id || device.deviceId) ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                    {activityDeviceId === (device.id || device.deviceId) && !activityLoading && (
                      <div className="mt-4 border-t border-purple-200/50 pt-4 dark:border-purple-500/20">
                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                          Recent activity
                        </h3>
                        {activities.length === 0 ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400">No activity has been recorded for this device.</p>
                        ) : (
                          <div className="space-y-2">
                            {activities.map((item, index) => {
                              const occurredAt = timestampToDate(item.createdAt || item.occurredAt || item.timestamp);
                              return (
                                <div
                                  key={item.id || `${device.id || device.deviceId}-${index}`}
                                  className="flex flex-col justify-between gap-1 rounded-xl bg-purple-50/70 px-3 py-2 text-xs dark:bg-purple-500/10 sm:flex-row"
                                >
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {item.activityType || item.action || item.eventType || "Account activity"}
                                  </span>
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {[occurredAt?.toLocaleString(), item.ipAddress, item.location].filter(Boolean).join(" · ")}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </PurpleCard>
                );
              })}
            </div>
          )}
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}

export { ErrorBoundary } from "~/components/ErrorBoundary";
