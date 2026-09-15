import { useState, useEffect, useCallback } from 'react';
import { profileSetupService } from '~/services/grpc/profileSetup.service';
import {
  getProfileProgressRevision,
  PROFILE_PROGRESS_UPDATED_EVENT,
} from '~/utils/profileProgress';

/** One outstanding requirement, named by the backend. */
export interface MissingRequirement {
  id: string;
  label: string;
  /** Which editor completes this: features, location, photo or verification. */
  action: 'features' | 'location' | 'photo' | 'verification' | string;
  feature_id?: number;
}

export interface OnboardingProgress {
  user_id: string;
  profile_type: string;
  current_step: number;
  last_completed_step: number;
  total_steps?: number;
  completed_items?: number;
  total_items?: number;
  completion_percentage?: number;
  completion_celebration_seen?: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_steps?: number[];
  /** Everything still required for 100%, so the UI can list it. */
  missing?: MissingRequirement[];
}

interface UseOnboardingProgressResult {
  progress: OnboardingProgress | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type ProgressCacheEntry = {
  progress: OnboardingProgress;
  fetchedAt: number;
  revision: number;
};

type ProgressRequestEntry = {
  request: Promise<OnboardingProgress>;
  revision: number;
};

const PROGRESS_CACHE_TTL_MS = 30_000;
const progressCache = new Map<string, ProgressCacheEntry>();
const progressRequests = new Map<string, ProgressRequestEntry>();

function progressCacheKey(userId: string, profileType: string) {
  return `${userId}:${profileType}`;
}

/**
 * Reads completion computed from canonical profile data.
 */
export function useOnboardingProgress(
  userId: string,
  profileType: 'service_provider' | 'household'
): UseOnboardingProgressResult {
  const key = progressCacheKey(userId, profileType);
  const initialCacheEntry = progressCache.get(key);
  const initialProgress = initialCacheEntry?.revision === getProfileProgressRevision()
    ? initialCacheEntry.progress
    : null;
  const [progress, setProgress] = useState<OnboardingProgress | null>(initialProgress);
  const [loading, setLoading] = useState(!initialProgress);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async (force = false) => {
    if (!userId) {
      setProgress(null);
      setLoading(false);
      return;
    }

    const cached = progressCache.get(key);
    if (
      !force &&
      cached &&
      cached.revision === getProfileProgressRevision() &&
      Date.now() - cached.fetchedAt < PROGRESS_CACHE_TTL_MS
    ) {
      setProgress(cached.progress);
      setError(null);
      setLoading(false);
      return;
    }

    try {
      if (!cached) setLoading(true);
      setError(null);

      const requestRevision = getProfileProgressRevision();
      let requestEntry = progressRequests.get(key);
      if (!requestEntry || requestEntry.revision !== requestRevision) {
        const request = profileSetupService
          .getProgress(userId, profileType)
          .then((data) => data as OnboardingProgress)
          .finally(() => {
            if (progressRequests.get(key)?.request === request) {
              progressRequests.delete(key);
            }
          });
        requestEntry = { request, revision: requestRevision };
        progressRequests.set(key, requestEntry);
      }
      const data = await requestEntry.request;
      progressCache.set(key, {
        progress: data,
        fetchedAt: Date.now(),
        revision: requestEntry.revision,
      });
      setProgress(data);
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [key, profileType, userId]);

  useEffect(() => {
    void fetchProgress();
  }, [fetchProgress]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const refresh = () => {
      void fetchProgress(true);
    };
    window.addEventListener(PROFILE_PROGRESS_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener(PROFILE_PROGRESS_UPDATED_EVENT, refresh);
    };
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refetch: () => fetchProgress(true),
  };
}
