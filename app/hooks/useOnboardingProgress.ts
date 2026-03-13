import { useState, useEffect, useCallback } from 'react';
import { AUTH_API_BASE_URL, getAuthHeaders } from '~/config/api';

export interface OnboardingProgress {
  user_id: string;
  profile_type: string;
  current_step: number;
  last_completed_step: number;
  total_steps?: number;
  completion_percentage?: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_steps?: number[];
}

interface UseOnboardingProgressResult {
  progress: OnboardingProgress | null;
  loading: boolean;
  error: string | null;
  updateProgress: (data: Partial<OnboardingProgress>) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Hook to manage onboarding progress tracking
 * Fetches current progress and provides method to update it
 */
export function useOnboardingProgress(
  userId: string,
  profileType: 'househelp' | 'household'
): UseOnboardingProgressResult {
  const [progress, setProgress] = useState<OnboardingProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${AUTH_API_BASE_URL}/auth.ProfileSetupService/GetProgress`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/grpc-web+json',
          },
          body: JSON.stringify({
            user_id: userId,
            profile_type: profileType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch progress: ${response.statusText}`);
      }

      const data = await response.json();
      setProgress(data);
    } catch (err) {
      console.error('Error fetching onboarding progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
    } finally {
      setLoading(false);
    }
  }, [userId, profileType]);

  const updateProgress = useCallback(async (data: Partial<OnboardingProgress>) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${AUTH_API_BASE_URL}/auth.ProfileSetupService/UpdateProgress`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/grpc-web+json',
          },
          body: JSON.stringify({
            user_id: userId,
            profile_type: profileType,
            data: {
              ...data,
              profile_type: profileType,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update progress: ${response.statusText}`);
      }

      const updatedData = await response.json();
      setProgress(updatedData);
    } catch (err) {
      console.error('Error updating onboarding progress:', err);
      throw err;
    }
  }, [userId, profileType]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    updateProgress,
    refetch: fetchProgress,
  };
}

/**
 * Hook to update individual step completion
 */
export function useStepCompletion(userId: string, profileType: 'househelp' | 'household') {
  const updateStep = useCallback(async (stepId: string, stepData: any, isCompleted: boolean = true) => {
    if (!userId) return;

    try {
      const response = await fetch(
        `${AUTH_API_BASE_URL}/auth.ProfileSetupService/UpdateStep`,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/grpc-web+json',
          },
          body: JSON.stringify({
            user_id: userId,
            profile_type: profileType,
            data: {
              step_id: stepId,
              is_completed: isCompleted,
              data: stepData,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update step: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error updating step:', err);
      throw err;
    }
  }, [userId, profileType]);

  return { updateStep };
}
