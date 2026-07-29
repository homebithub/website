import React from "react";
import { useNavigation } from "react-router";

const WIDTH_PRESETS = ["96%", "82%", "74%", "88%", "68%"];
const SHIMMER_SURFACE =
  "hb-shimmer-surface rounded-2xl border border-purple-200/35 dark:border-purple-500/15";

type ShimmerLineProps = {
  width?: string;
  height?: number;
  className?: string;
};

export function ShimmerLine({ width = "100%", height = 12, className = "" }: ShimmerLineProps) {
  return (
    <div className={`hb-shimmer-piece rounded-full ${className}`} style={{ width, height }} />
  );
}

type ShimmerSectionProps = {
  lines?: number;
  showTitle?: boolean;
  showAction?: boolean;
  className?: string;
};

export function ShimmerSection({
  lines = 4,
  showTitle = true,
  showAction = false,
  className = "",
}: ShimmerSectionProps) {
  const contentWidths = React.useMemo(
    () => Array.from({ length: lines }, (_, index) => WIDTH_PRESETS[index % WIDTH_PRESETS.length]),
    [lines]
  );

  return (
    <div
      className={`${SHIMMER_SURFACE} p-4 sm:p-5 ${className}`}
    >
      {showTitle && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <ShimmerLine width="38%" height={18} className="rounded-xl" />
          {showAction && <ShimmerLine width="24%" height={36} className="rounded-full" />}
        </div>
      )}
      <div className="space-y-3">
        {contentWidths.map((width, index) => (
          <ShimmerLine key={`section-line-${index}`} width={width} height={14} className="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

type PageSkeletonProps = {
  className?: string;
};

export function ProfilePageSkeleton({ className = "" }: PageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ShimmerSection lines={2} showAction />
      <div className={`${SHIMMER_SURFACE} p-4 sm:p-5`}>
        <div className="flex items-start gap-3">
          <div className="hb-shimmer-piece h-11 w-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <ShimmerLine width="28%" height={10} />
            <ShimmerLine width="52%" height={16} />
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <ShimmerLine height={54} className="w-full rounded-xl" />
          <ShimmerLine height={54} className="w-full rounded-xl" />
          <ShimmerLine height={54} className="w-full rounded-xl" />
        </div>
      </div>
      <ShimmerSection lines={4} showAction />
      <ShimmerSection lines={3} />
    </div>
  );
}

export function ListPageSkeleton({ className = "", items = 4 }: { className?: string; items?: number }) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-4 lg:grid-cols-2">
        <ShimmerSection lines={2} showAction />
        <ShimmerSection lines={3} />
      </div>
      <ShimmerTileRow items={3} />
      <ShimmerListPlaceholder items={items} />
    </div>
  );
}

export function FormPageSkeleton({ className = "" }: PageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ShimmerHeroPanel />
      <ShimmerSection lines={4} showAction />
      <ShimmerSection lines={3} showTitle={false} />
    </div>
  );
}

export function DetailPageSkeleton({ className = "" }: PageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ShimmerHeroPanel />
      <div className="grid gap-4 lg:grid-cols-2">
        <ShimmerSection lines={4} showAction />
        <ShimmerSection lines={4} />
      </div>
      <ShimmerTileRow items={2} />
      <ShimmerSection lines={4} showTitle={false} />
    </div>
  );
}

export function PricingPageSkeleton({ className = "" }: PageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ShimmerHeroPanel />
      <ShimmerTileRow items={3} />
      <div className="grid gap-4 lg:grid-cols-2">
        <ShimmerSection lines={4} showAction />
        <ShimmerSection lines={4} />
      </div>
    </div>
  );
}

export function SettingsPageSkeleton({ className = "" }: PageSkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <ShimmerSection lines={2} showAction />
      <ShimmerTileRow items={3} />
      <ShimmerSection lines={4} />
    </div>
  );
}

export function InboxPageSkeleton({ className = "" }: PageSkeletonProps) {
  return (
    <div className={`grid gap-6 lg:grid-cols-[1.1fr_1.9fr] ${className}`}>
      <div className="space-y-4">
        <ShimmerSection lines={2} showAction />
        <ShimmerListPlaceholder items={5} />
      </div>
      <div className="space-y-4">
        <ShimmerSection lines={2} showAction />
        <ShimmerSection lines={4} showTitle={false} />
        <ShimmerSection lines={3} showTitle={false} />
      </div>
    </div>
  );
}

type ShimmerTileRowProps = {
  items?: number;
  className?: string;
};

export function ShimmerTileRow({ items = 3, className = "" }: ShimmerTileRowProps) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`tile-${index}`}
          className={`${SHIMMER_SURFACE} p-4`}
        >
          <ShimmerLine width="60%" height={16} className="rounded-xl" />
          <ShimmerLine width="80%" height={12} className="mt-2 rounded-xl" />
          <div className="mt-4 flex items-center gap-2">
            <ShimmerLine width="32%" height={10} />
            <ShimmerLine width="20%" height={10} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerListPlaceholder({ items = 3, className = "" }: { items?: number; className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={`list-placeholder-${index}`}
          className={`${SHIMMER_SURFACE} flex flex-col gap-4 p-4 sm:flex-row`}
        >
          <div className="hb-shimmer-piece h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
          <div className="flex-1 space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ShimmerLine width="45%" height={16} className="rounded-xl" />
              <ShimmerLine width="28%" height={12} className="rounded-full" />
            </div>
            <ShimmerLine width="70%" height={12} className="rounded-xl" />
            <ShimmerLine width="60%" height={12} className="rounded-xl" />
            <div className="flex flex-wrap gap-2">
              <ShimmerLine width="18%" height={10} />
              <ShimmerLine width="22%" height={10} />
              <ShimmerLine width="26%" height={10} />
            </div>
            <div className="flex items-center justify-between">
              <ShimmerLine width="30%" height={10} />
              <ShimmerLine width="18%" height={28} className="rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ShimmerHeroPanel({ className = "" }: { className?: string }) {
  return (
    <div
      className={`${SHIMMER_SURFACE} p-5 sm:p-6 ${className}`}
    >
      <div className="space-y-4">
        <ShimmerLine width="48%" height={20} className="rounded-xl" />
        <ShimmerLine width="72%" height={14} className="rounded-xl" />
        <ShimmerLine width="64%" height={14} className="rounded-xl" />
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <ShimmerLine width="80%" height={12} className="rounded-xl" />
          <ShimmerLine width="60%" height={12} className="rounded-xl" />
          <div className="flex gap-3">
            <ShimmerLine width="42%" height={10} />
            <ShimmerLine width="28%" height={10} />
          </div>
        </div>
        <div className="hb-shimmer-piece h-24 rounded-xl" />
      </div>
    </div>
  );
}

const STATUS_COPY: Record<"loading" | "submitting", string> = {
  loading: "Loading the next experience…",
  submitting: "Saving your update securely…",
};

export function GlobalLoaderOverlay() {
  const navigation = useNavigation();
  const isTransitioning = navigation.state === "loading" || navigation.state === "submitting";
  const [shouldRender, setShouldRender] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    if (isTransitioning) {
      setShouldRender(true);
      showTimer = setTimeout(() => setIsVisible(true), 120);
    } else {
      setIsVisible(false);
      hideTimer = setTimeout(() => setShouldRender(false), 260);
    }

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [isTransitioning]);

  React.useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    if (isTransitioning) {
      setProgress(12);
      timers.push(
        setTimeout(() => setProgress(32), 120),
        setTimeout(() => setProgress(58), 260),
        setTimeout(() => setProgress(76), 520),
        setTimeout(() => setProgress(92), 900)
      );
    } else {
      setProgress(100);
      timers.push(setTimeout(() => setProgress(0), 360));
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [isTransitioning]);

  if (!shouldRender) {
    return null;
  }

  const state = navigation.state === "idle" ? "loading" : navigation.state;
  const statusCopy = STATUS_COPY[state as "loading" | "submitting"];

  return (
    <div
      className={`hb-loader-overlay ${isVisible ? "hb-loader-overlay--visible" : ""}`}
      aria-live="assertive"
      aria-busy={isTransitioning}
      role="status"
    >
      <div className="hb-loader-shell">
        <div
          className="hb-loader-progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className={`hb-loader-progress-bar ${isTransitioning ? "" : "hb-loader-progress-bar--complete"}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-white/45">
              HomeBit
            </p>
            <p className="mt-1 text-sm font-medium text-white/85">{statusCopy}</p>
          </div>
          <span className="rounded-full bg-purple-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-purple-200">
            {state}
          </span>
        </div>
        <div className="mt-5 space-y-2.5">
          <ShimmerLine width="92%" height={10} />
          <ShimmerLine width="72%" height={10} />
          <ShimmerLine width="48%" height={10} />
        </div>
      </div>
    </div>
  );
}
