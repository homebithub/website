import { useLocation } from 'react-router';

interface AccountChoiceStatus {
  isInSetupMode: boolean;
}

const ACCOUNT_CHOICE_ROUTES = [
  '/household-choice',
  '/join-household',
  '/pending-approval',
];

/**
 * Navigation and the footer are hidden only while a household user is choosing
 * or joining a household. Profile completion now happens on the normal profile
 * pages, so incomplete profiles no longer create a separate application mode.
 */
export function useAccountChoiceStatus(): AccountChoiceStatus {
  const { pathname } = useLocation();
  return {
    isInSetupMode: ACCOUNT_CHOICE_ROUTES.some((route) => pathname.startsWith(route)),
  };
}
