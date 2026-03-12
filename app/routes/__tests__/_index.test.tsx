import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '~/test/utils/test-utils';
import Index from '../_index';
import useScrollFadeIn from '~/hooks/useScrollFadeIn';

let loaderData = { isAuthenticated: false, userType: null as string | null };

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useLoaderData: () => loaderData,
  };
});

vi.mock('~/components/AuthenticatedHome', () => ({
  default: () => <div data-testid="authenticated-home">Authenticated Home</div>,
}));

vi.mock('~/components/HousehelpHome', () => ({
  default: () => <div data-testid="househelp-home">Househelp Home</div>,
}));

vi.mock('~/routes/landing', () => ({
  default: () => <div data-testid="landing-page">Landing Page</div>,
}));

vi.mock('~/hooks/useScrollFadeIn', () => ({
  default: vi.fn(),
}));

describe('Index route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    loaderData = { isAuthenticated: false, userType: null };
  });

  it('renders landing page for unauthenticated users', async () => {
    renderWithRouter(<Index />);
    expect(await screen.findByTestId('landing-page')).toBeInTheDocument();
  });

  it('renders authenticated household home by default', async () => {
    loaderData = { isAuthenticated: true, userType: 'household' };
    renderWithRouter(<Index />);
    expect(await screen.findByTestId('authenticated-home')).toBeInTheDocument();
    expect(screen.queryByTestId('househelp-home')).not.toBeInTheDocument();
  });

  it('renders househelp home for househelp users', async () => {
    loaderData = { isAuthenticated: true, userType: 'househelp' };
    renderWithRouter(<Index />);
    expect(await screen.findByTestId('househelp-home')).toBeInTheDocument();
    expect(screen.queryByTestId('authenticated-home')).not.toBeInTheDocument();
  });

  it('invokes scroll fade hook on render', () => {
    renderWithRouter(<Index />);
    expect(useScrollFadeIn).toHaveBeenCalled();
  });
});
