import { useCallback, useEffect, useMemo, useState } from "react";
import { useSSESubscriptionSafe } from "~/hooks/useSSESubscription";
import { profileSetupService } from "~/services/grpc/profileSetup.service";
import { getStoredProfileType, getStoredUserId } from "~/utils/authStorage";
import { PROFILE_PROGRESS_UPDATED_EVENT } from "~/utils/profileProgress";
import { SUBSCRIPTION_CHANGED_EVENT } from "~/utils/subscriptionEvents";
import { marketplaceReadinessErrorMessage } from "~/utils/marketplaceReadinessError";

export const MARKETPLACE_READINESS_CHANGED_EVENT = "homebit:marketplace-readiness-changed";

export interface MarketplaceReadinessStep {
  id: string;
  label: string;
  description: string;
  action_path: string;
  status: string;
  completed: boolean;
}

export interface MarketplaceReadiness {
  loading: boolean;
  interactionAllowed: boolean;
  message: string;
  profileType: string;
  steps: MarketplaceReadinessStep[];
  error: string;
  refresh: () => Promise<void>;
}

export function useMarketplaceReadiness(userIdInput?: string, profileTypeInput?: string): MarketplaceReadiness {
  const userId = useMemo(() => userIdInput || getStoredUserId(), [userIdInput]);
  const profileType = useMemo(() => profileTypeInput || getStoredProfileType(), [profileTypeInput]);
  const [state, setState] = useState<Omit<MarketplaceReadiness, "refresh">>({
    loading: true,
    interactionAllowed: false,
    message: "",
    profileType,
    steps: [],
    error: "",
  });

  const refresh = useCallback(async () => {
    if (!userId) {
      setState((current) => ({ ...current, loading: false, error: "Please sign in again." }));
      return;
    }
    try {
      const response = await profileSetupService.getMarketplaceReadiness(userId, profileType);
      const data = response?.data ?? response ?? {};
      setState({
        loading: false,
        interactionAllowed: Boolean(data.interaction_allowed),
        message: String(data.message || ""),
        profileType: String(data.profile_type || profileType),
        steps: Array.isArray(data.steps) ? data.steps : [],
        error: "",
      });
    } catch (error: any) {
      setState((current) => ({
        ...current,
        loading: false,
        interactionAllowed: false,
        error: marketplaceReadinessErrorMessage(error, profileType),
      }));
    }
  }, [profileType, userId]);

  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    const onChanged = () => void refresh();
    for (const eventName of [PROFILE_PROGRESS_UPDATED_EVENT, SUBSCRIPTION_CHANGED_EVENT,
      MARKETPLACE_READINESS_CHANGED_EVENT, "homebit:identity-verification-changed"]) {
      window.addEventListener(eventName, onChanged);
    }
    const interval = window.setInterval(onChanged, 30_000);
    return () => {
      for (const eventName of [PROFILE_PROGRESS_UPDATED_EVENT, SUBSCRIPTION_CHANGED_EVENT,
        MARKETPLACE_READINESS_CHANGED_EVENT, "homebit:identity-verification-changed"]) {
        window.removeEventListener(eventName, onChanged);
      }
      window.clearInterval(interval);
    };
  }, [refresh]);

  const refreshFromRealtime = useCallback(() => void refresh(), [refresh]);
  useSSESubscriptionSafe("notifications.created", refreshFromRealtime, Boolean(userId));
  useSSESubscriptionSafe("notifications.snapshot", refreshFromRealtime, Boolean(userId));

  return { ...state, refresh };
}
