import { useMemo } from "react";
import { useOnboardingProgress } from "~/hooks/useOnboardingProgress";

type SupportedProfileType = "household" | "househelp";

const FALLBACK_TOTAL_STEPS: Record<SupportedProfileType, number> = {
  household: 10,
  househelp: 13,
};

type ReminderCopy = {
  title: string;
  description: string;
  ctaLabel: string;
};

const REMINDER_COPY: Record<SupportedProfileType, ReminderCopy> = {
  household: {
    title: "Finish your household profile",
    description:
      "You can keep browsing, but completing your profile helps househelps understand your location, service needs, and budget before you reach out.",
    ctaLabel: "Continue household setup",
  },
  househelp: {
    title: "Finish your househelp profile",
    description:
      "You can keep browsing, but completing your profile helps households review your experience, availability, and verification details with confidence.",
    ctaLabel: "Continue profile setup",
  },
};

export interface ProfileCompletionReminderState {
  loading: boolean;
  shouldShow: boolean;
  destination: string;
  completedSteps: number;
  totalSteps: number;
  nextStep: number;
  progressValue: number;
  title: string;
  description: string;
  ctaLabel: string;
}

export function useProfileCompletionReminder(
  userId: string,
  profileType: SupportedProfileType
): ProfileCompletionReminderState {
  const { progress, loading } = useOnboardingProgress(userId, profileType);

  return useMemo(() => {
    const fallbackTotalSteps = FALLBACK_TOTAL_STEPS[profileType];
    const totalSteps = Math.max(Number(progress?.total_steps || fallbackTotalSteps), fallbackTotalSteps);
    const completedSteps = Math.min(Math.max(Number(progress?.last_completed_step || 0), 0), totalSteps);
    const status = String(progress?.status || "");
    const isComplete = status === "completed" || completedSteps >= totalSteps;
    const nextStep = Math.min(Math.max(completedSteps + 1, 1), totalSteps);
    const destination =
      profileType === "household"
        ? completedSteps <= 0
          ? "/household-choice"
          : `/profile-setup/household?step=${nextStep}`
        : `/profile-setup/househelp?step=${nextStep}`;
    const progressValue = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    const copy = REMINDER_COPY[profileType];

    return {
      loading,
      shouldShow: !loading && !isComplete,
      destination,
      completedSteps,
      totalSteps,
      nextStep,
      progressValue,
      title: copy.title,
      description: copy.description,
      ctaLabel: copy.ctaLabel,
    };
  }, [loading, profileType, progress]);
}
