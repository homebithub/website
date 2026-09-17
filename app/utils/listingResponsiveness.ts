type ResponsivenessBadge = {
  tone: "fast" | "steady" | "slow";
  label: string;
  detail?: string;
};

export const RESPONSIVENESS_BADGE_STYLES: Record<ResponsivenessBadge["tone"], string> = {
  fast: "bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/30",
  steady: "bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/30",
  slow: "bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/30",
};

const toNumericMetric = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
};

const minutesSince = (value?: string): number | null => {
  if (!value) return null;
  const ts = Date.parse(value);
  if (Number.isNaN(ts)) return null;
  return Math.max(0, Math.round((Date.now() - ts) / 60000));
};

const describeResponseRate = (rate: number) => `${Math.round(rate * 100)}% response rate`;
const describeAvgMinutes = (minutes: number) => {
  if (minutes < 60) return `~${Math.max(1, Math.round(minutes))} min avg reply`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `~${hours} hr response`;
  const days = Math.round(hours / 24);
  return `~${Math.max(1, days)} day response`;
};
const describeActivity = (minutes: number) => {
  if (minutes < 60) return "Active this hour";
  if (minutes < 360) return "Active today";
  if (minutes < 1440) return "Active this week";
  const days = Math.floor(minutes / 1440);
  return days <= 14 ? `Active ${days}d ago` : `Inactive ${days}d`;
};

export const deriveHouseholdResponsivenessBadge = (profile?: Record<string, any> | null): ResponsivenessBadge | null => {
  if (!profile) return null;
  const anyProfile = profile as Record<string, any>;
  const responseRate = toNumericMetric(anyProfile?.response_rate ?? anyProfile?.responseRate);
  const avgMinutes = toNumericMetric(
    anyProfile?.average_response_minutes ?? anyProfile?.avg_response_minutes ?? anyProfile?.response_minutes_avg,
  );
  const lastActiveMinutes = minutesSince(
    (anyProfile?.last_active_at as string) ?? anyProfile?.lastActiveAt ?? anyProfile?.updated_at ?? anyProfile?.updatedAt,
  );

  if (responseRate != null) {
    if (responseRate >= 0.85) return { tone: "fast", label: "Replies super fast", detail: describeResponseRate(responseRate) };
    if (responseRate >= 0.6) return { tone: "steady", label: "Usually replies", detail: describeResponseRate(responseRate) };
    return { tone: "slow", label: "Limited reply data", detail: describeResponseRate(responseRate) };
  }

  if (avgMinutes != null) {
    if (avgMinutes <= 60) return { tone: "fast", label: "Replies in under 1h", detail: describeAvgMinutes(avgMinutes) };
    if (avgMinutes <= 240) return { tone: "steady", label: "Replies same day", detail: describeAvgMinutes(avgMinutes) };
    return { tone: "slow", label: "Replies in a day+", detail: describeAvgMinutes(avgMinutes) };
  }

  if (lastActiveMinutes != null) {
    if (lastActiveMinutes <= 180) return { tone: "fast", label: "Active recently", detail: describeActivity(lastActiveMinutes) };
    if (lastActiveMinutes <= 1440) return { tone: "steady", label: "Active this week", detail: describeActivity(lastActiveMinutes) };
    return { tone: "slow", label: "Quiet lately", detail: describeActivity(lastActiveMinutes) };
  }

  const rating = toNumericMetric(anyProfile?.rating);
  const reviewCount = toNumericMetric(anyProfile?.review_count);
  if (rating != null && reviewCount != null && rating >= 4 && reviewCount >= 3) {
    return { tone: "steady", label: "Highly rated household", detail: `${rating.toFixed(1)}★ • ${reviewCount} reviews` };
  }

  return null;
};

export const deriveServiceProviderResponsivenessBadge = (profile?: Record<string, any> | null): ResponsivenessBadge | null => {
  if (!profile) return null;
  const badge = deriveHouseholdResponsivenessBadge({ ...profile, updated_at: undefined, updatedAt: undefined });
  return badge?.label === 'Highly rated household' ? { ...badge, label: 'Highly rated' } : badge;
};
