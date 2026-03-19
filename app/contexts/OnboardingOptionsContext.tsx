import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useOnboardingOptions } from '~/hooks/useOnboardingOptions';
import type { OnboardingOptions } from '~/hooks/useOnboardingOptions';

interface OnboardingOptionsContextValue {
  options: OnboardingOptions | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const OnboardingOptionsContext = createContext<OnboardingOptionsContextValue | undefined>(undefined);

interface OnboardingOptionsProviderProps {
  children: ReactNode;
  profileType: 'househelp' | 'household';
}

/**
 * Provider component that fetches and caches onboarding options
 * Should wrap the profile setup flow to avoid refetching on every component
 */
export function OnboardingOptionsProvider({ children, profileType }: OnboardingOptionsProviderProps) {
  const { options, loading, error, refetch } = useOnboardingOptions(profileType);

  return (
    <OnboardingOptionsContext.Provider value={{ options, loading, error, refetch }}>
      {children}
    </OnboardingOptionsContext.Provider>
  );
}

/**
 * Hook to access onboarding options from context
 * Must be used within OnboardingOptionsProvider
 */
export function useOnboardingOptionsContext() {
  const context = useContext(OnboardingOptionsContext);
  if (context === undefined) {
    throw new Error('useOnboardingOptionsContext must be used within OnboardingOptionsProvider');
  }
  return context;
}
