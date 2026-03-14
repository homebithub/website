import { useState, useEffect, useCallback } from 'react';
import { profileSetupService } from '~/services/grpc/profileSetup.service';

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

      const data = await profileSetupService.getProgress(userId);
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
      const updatedData = await profileSetupService.updateProgress(userId, {
        ...data,
        profile_type: profileType,
      });
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
      return await profileSetupService.updateStep(userId, {
        step_id: stepId,
        is_completed: isCompleted,
        data: stepData,
        profile_type: profileType,
      });
    } catch (err) {
      console.error('Error updating step:', err);
      throw err;
    }
  }, [userId, profileType]);

  return { updateStep };
}
