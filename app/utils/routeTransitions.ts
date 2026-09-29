import type { ShouldRevalidateFunctionArgs } from 'react-router';

/**
 * The root loader publishes deployment configuration and blog availability. Query-string
 * changes (tabs, filters, and opened cards) do not need to refresh these values,
 * so sending them back through the server only leaves the old screen visible
 * while the navigation waits.
 */
export function shouldRevalidateRootEnvironment({
  currentUrl,
  nextUrl,
  formMethod,
  defaultShouldRevalidate,
}: Pick<
  ShouldRevalidateFunctionArgs,
  'currentUrl' | 'nextUrl' | 'formMethod' | 'defaultShouldRevalidate'
>): boolean {
  const isQueryOnlyNavigation =
    !formMethod &&
    currentUrl.pathname === nextUrl.pathname &&
    currentUrl.search !== nextUrl.search;

  return isQueryOnlyNavigation ? false : defaultShouldRevalidate;
}

export function isFullPageNavigation(
  currentPathname: string,
  nextPathname: string | undefined,
  navigationState: 'idle' | 'loading' | 'submitting',
): boolean {
  return navigationState === 'loading' && Boolean(nextPathname) && nextPathname !== currentPathname;
}
