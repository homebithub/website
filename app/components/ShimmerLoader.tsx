import React from "react";
import { useNavigation } from "react-router";

const WIDTH_PRESETS = ["96%", "82%", "74%", "88%", "68%"];

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
      className={`hb-shimmer-surface rounded-2xl border border-white/10 dark:border-white/5 p-5 shadow-light-glow-sm dark:shadow-glow-sm ${className}`}
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
          className="hb-shimmer-surface rounded-2xl border border-white/10 dark:border-white/5 p-4 shadow-light-glow-sm dark:shadow-glow-sm"
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
          className="hb-shimmer-surface flex flex-col gap-4 rounded-2xl border border-white/10 p-4 shadow-light-glow-sm dark:border-white/5 dark:shadow-glow-sm sm:flex-row"
        >
          <div className="hb-shimmer-piece h-20 w-20 rounded-2xl sm:h-24 sm:w-24" />
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
      className={`hb-shimmer-surface rounded-[28px] border border-white/10 dark:border-white/5 p-6 md:p-8 shadow-light-glow-md dark:shadow-glow-md ${className}`}
    >
      <div className="space-y-4">
        <ShimmerLine width="48%" height={20} className="rounded-xl" />
        <ShimmerLine width="72%" height={14} className="rounded-xl" />
        <ShimmerLine width="64%" height={14} className="rounded-xl" />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <ShimmerLine width="80%" height={12} className="rounded-xl" />
          <ShimmerLine width="60%" height={12} className="rounded-xl" />
          <div className="flex gap-3">
            <ShimmerLine width="42%" height={10} />
            <ShimmerLine width="28%" height={10} />
          </div>
        </div>
        <div className="hb-shimmer-piece rounded-2xl" style={{ minHeight: 140 }} />
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
        <div className="mb-4 flex flex-col gap-1 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-gray-500 dark:text-white/50">
          <span>{statusCopy}</span>
          <span className="text-primary-500 dark:text-primary-300">{state}</span>
        </div>
        <div className="hb-loader-grid">
          <div className="flex flex-col gap-6">
            <ShimmerHeroPanel />
            <ShimmerTileRow items={3} />
          </div>
          <div className="flex flex-col gap-4">
            <ShimmerSection lines={4} showAction />
            <ShimmerSection lines={3} showTitle={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
