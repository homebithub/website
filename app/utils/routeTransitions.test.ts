import { describe, expect, it } from 'vitest';

import { isFullPageNavigation, shouldRevalidateRootEnvironment } from './routeTransitions';

describe('route transitions', () => {
  it('does not reload root environment data for local tab and filter changes', () => {
    expect(shouldRevalidateRootEnvironment({
      currentUrl: new URL('https://homebit.co.ke/household/hiring?tab=jobs'),
      nextUrl: new URL('https://homebit.co.ke/household/hiring?tab=applicants'),
      formMethod: undefined,
      defaultShouldRevalidate: true,
    })).toBe(false);
  });

  it('keeps normal route and mutation revalidation behavior', () => {
    expect(shouldRevalidateRootEnvironment({
      currentUrl: new URL('https://homebit.co.ke/'),
      nextUrl: new URL('https://homebit.co.ke/household/hiring'),
      formMethod: undefined,
      defaultShouldRevalidate: true,
    })).toBe(true);

    expect(shouldRevalidateRootEnvironment({
      currentUrl: new URL('https://homebit.co.ke/household/hiring?tab=jobs'),
      nextUrl: new URL('https://homebit.co.ke/household/hiring?tab=applicants'),
      formMethod: 'POST',
      defaultShouldRevalidate: true,
    })).toBe(true);
  });

  it('only uses the page veil for a loading navigation to another pathname', () => {
    expect(isFullPageNavigation('/', '/household/hiring', 'loading')).toBe(true);
    expect(isFullPageNavigation('/household/hiring', '/household/hiring', 'loading')).toBe(false);
    expect(isFullPageNavigation('/', '/household/hiring', 'submitting')).toBe(false);
    expect(isFullPageNavigation('/', undefined, 'idle')).toBe(false);
  });
});
