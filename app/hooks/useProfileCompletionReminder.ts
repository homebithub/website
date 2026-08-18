import { useCallback, useEffect, useMemo, useState } from "react";
import { useOnboardingProgress } from "~/hooks/useOnboardingProgress";
import { profileSetupService } from "~/services/grpc/profileSetup.service";
import { notifyProfileProgressChanged } from "~/utils/profileProgress";

type SupportedProfileType = "household" | "househelp";

type ReminderCopy = {
  title: string;
  description: string;
  ctaLabel: string;
};

type CelebrationCopy = {
  title: string;
  description: string;
  steps: Array<{ title: string; description: string; action: string; href: string }>;
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

const CELEBRATION_COPY: Record<SupportedProfileType, CelebrationCopy> = {
  household: {
    title: "Your household profile is complete!",
    description: "You’re ready to find the right help and make your home run smoothly.",
    steps: [
      { title: "Browse househelps", description: "See people who are open to work and start a conversation.", action: "Browse househelps", href: "/" },
      { title: "Post a job listing", description: "Share what you need so suitable househelps can apply.", action: "Open hiring", href: "/household/hiring" },
      { title: "Choose a plan", description: "Unlock the tools you need when you’re ready to hire.", action: "View subscriptions", href: "/subscriptions" },
    ],
  },
  househelp: {
    title: "Your househelp profile is complete!",
    description: "You’re ready to be discovered and find work that fits your skills and schedule.",
    steps: [
      { title: "Browse open jobs", description: "Explore current opportunities and apply to a role that fits.", action: "Browse jobs", href: "/" },
      { title: "Manage your availability", description: "Keep your open-for-work status and preferences up to date.", action: "Open hiring", href: "/househelp/hiring" },
      { title: "Make your profile stand out", description: "Add experience and documents any time to build trust.", action: "View profile", href: "/househelp/profile" },
    ],
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
  shouldShowCelebration: boolean;
  celebration: CelebrationCopy;
  markCelebrationSeen: () => Promise<void>;
}

export function useProfileCompletionReminder(
  userId: string,
  profileType: SupportedProfileType
): ProfileCompletionReminderState {
  const { progress, loading, error } = useOnboardingProgress(userId, profileType);
  const [celebrationSeenOverride, setCelebrationSeenOverride] = useState(false);

  useEffect(() => {
    setCelebrationSeenOverride(false);
  }, [profileType, userId]);

  const markCelebrationSeen = useCallback(async () => {
    if (celebrationSeenOverride || progress?.completion_celebration_seen) return;
    // Set this before the network request so a slow connection cannot make
    // the modal flash back into view or be acknowledged multiple times.
    setCelebrationSeenOverride(true);
    try {
      await profileSetupService.markCompletionCelebrationSeen(userId, profileType);
      notifyProfileProgressChanged();
    } catch (err) {
      // The modal has still been seen locally. The next progress refresh will
      // retry if the durable acknowledgement did not reach the server.
      console.warn("Unable to persist profile completion acknowledgement", err);
    }
  }, [celebrationSeenOverride, profileType, progress?.completion_celebration_seen, userId]);

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
    const celebration = CELEBRATION_COPY[profileType];
    const celebrationSeen = celebrationSeenOverride || Boolean(progress?.completion_celebration_seen);

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
      shouldShowCelebration: !loading && !error && Boolean(progress) && isComplete && !celebrationSeen,
      celebration,
      markCelebrationSeen,
    };
  }, [celebrationSeenOverride, error, loading, markCelebrationSeen, profileType, progress]);
}
