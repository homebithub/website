import { useCallback, useEffect, useRef, useState } from "react";

type CompletionSnapshot = {
  identity: string;
  percentage: number;
};

const COMPLETION_BASELINE_PREFIX = "homebit:profile-completion-baseline:";

function normalizedPercentage(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const percentage = Number(value);
  return Number.isFinite(percentage) ? percentage : null;
}

/** True only when a known incomplete percentage becomes complete. */
export function crossedProfileCompletionThreshold(
  previousPercentage: unknown,
  currentPercentage: unknown,
): boolean {
  const previous = normalizedPercentage(previousPercentage);
  const current = normalizedPercentage(currentPercentage);

  return previous !== null && current !== null && previous < 100 && current >= 100;
}

/** Preserve the incomplete value while a requirement is edited on another route. */
export function rememberProfileCompletionBaseline(identity: string, percentage: unknown) {
  const normalized = normalizedPercentage(percentage);
  if (typeof window === "undefined" || normalized === null || normalized >= 100) return;
  window.sessionStorage.setItem(`${COMPLETION_BASELINE_PREFIX}${identity}`, String(normalized));
}

function takeRememberedBaseline(identity: string): number | null {
  if (typeof window === "undefined") return null;
  const key = `${COMPLETION_BASELINE_PREFIX}${identity}`;
  const remembered = window.sessionStorage.getItem(key);
  window.sessionStorage.removeItem(key);
  return normalizedPercentage(remembered);
}

/**
 * Detects completion during the current profile-page visit.
 *
 * The first response establishes a baseline, so opening an already-complete
 * profile never produces a false celebration. A later progress refresh must
 * cross from below 100 to 100 for the success message to appear.
 */
export function useProfileCompletionTransition(
  identity: string,
  completionPercentage: unknown,
) {
  const previousSnapshot = useRef<CompletionSnapshot | null>(null);
  const [completedNow, setCompletedNow] = useState(false);

  useEffect(() => {
    const percentage = normalizedPercentage(completionPercentage);
    if (percentage === null) return;

    let previous = previousSnapshot.current;
    if (!previous || previous.identity !== identity) {
      const remembered = takeRememberedBaseline(identity);
      previous = remembered === null ? null : { identity, percentage: remembered };
    }
    previousSnapshot.current = { identity, percentage };

    if (!previous) {
      setCompletedNow(false);
      return;
    }

    if (crossedProfileCompletionThreshold(previous.percentage, percentage)) {
      setCompletedNow(true);
    }
  }, [completionPercentage, identity]);

  const dismiss = useCallback(() => setCompletedNow(false), []);

  return { completedNow, dismiss };
}
