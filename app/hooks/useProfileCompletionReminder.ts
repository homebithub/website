import { useMemo } from "react";
import { useOnboardingProgress } from "~/hooks/useOnboardingProgress";

type SupportedProfileType = "household" | "househelp";

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
    ctaLabel: "Complete your profile",
  },
  househelp: {
    title: "Finish your househelp profile",
    description:
      "You can keep browsing, but completing your profile helps households review your experience, availability, and verification details with confidence.",
    ctaLabel: "Complete your profile",
  },
};

export interface ProfileCompletionReminderState {
  loading: boolean;
  shouldShow: boolean;
  destination: string;
  completedItems: number;
  totalItems: number;
  progressValue: number;
  title: string;
  description: string;
  ctaLabel: string;
}

export function useProfileCompletionReminder(
  userId: string,
  profileType: SupportedProfileType
): ProfileCompletionReminderState {
  const { progress, loading, error } = useOnboardingProgress(userId, profileType);

  return useMemo(() => {
    const totalItems = Math.max(Number(progress?.total_items || progress?.total_steps || 1), 1);
    const completedItems = Math.min(
      Math.max(Number(progress?.completed_items ?? progress?.last_completed_step ?? 0), 0),
      totalItems,
    );
    const status = String(progress?.status || "");
    const isComplete = status === "completed" || completedItems >= totalItems;
    const destination =
      profileType === "household" ? "/household/profile" : "/househelp/profile";
    const progressValue = Number(progress?.completion_percentage ?? Math.round((completedItems / totalItems) * 100));
    const copy = REMINDER_COPY[profileType];

    return {
      loading,
      shouldShow: !loading && !error && Boolean(progress) && !isComplete,
      destination,
      completedItems,
      totalItems,
      progressValue,
      title: copy.title,
      description: copy.description,
      ctaLabel: copy.ctaLabel,
    };
  }, [error, loading, profileType, progress]);
}
