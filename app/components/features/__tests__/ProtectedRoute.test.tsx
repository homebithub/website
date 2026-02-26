import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProtectedRoute } from '../ProtectedRoute';
import { MemoryRouter } from 'react-router';

// Mock dependencies
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockUseLocation = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    Navigate: ({ to, state, replace }: any) => {
      mockNavigate(to, state, replace);
      return <div data-testid="navigate">Navigate to {to}</div>;
    },
    useLocation: () => mockUseLocation(),
  };
});

vi.mock('~/contexts/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('~/components/Loading', () => ({
  Loading: ({ text }: { text: string }) => <div data-testid="loading">{text}</div>,
}));

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocation.mockReturnValue({ pathname: '/dashboard', search: '', hash: '', state: null });
  });

  describe('Loading State', () => {
    it('shows loading component when auth is loading', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Checking authentication...')).toBeInTheDocument();
    });

    it('does not show children when loading', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('shows loading even if user exists but loading is true', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: true 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated User', () => {
    it('redirects to login when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    });

    it('passes current location as state when redirecting to login', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });
      const currentLocation = { pathname: '/dashboard', search: '?tab=settings', hash: '#section', state: null };
      mockUseLocation.mockReturnValue(currentLocation);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/login', { from: currentLocation }, true);
    });

    it('uses replace navigation when redirecting to login', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith(
        '/login',
        expect.any(Object),
        true // replace
      );
    });

    it('does not show children when user is not authenticated', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('Authenticated User', () => {
    it('renders children when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('does not show loading when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('does not redirect when user is authenticated', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('renders complex children', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>
              <h1>Dashboard</h1>
              <p>Welcome back!</p>
            </div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome back!')).toBeInTheDocument();
    });

    it('renders multiple children', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>First Child</div>
            <div>Second Child</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });
  });

  describe('Role-Based Access Control', () => {
    it('renders children when user has required role', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'admin@example.com', role: 'admin' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Admin Content')).toBeInTheDocument();
    });

    it('redirects to unauthorized when user lacks required role', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'user@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('Navigate to /unauthorized')).toBeInTheDocument();
    });

    it('uses replace navigation when redirecting to unauthorized', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'user@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(mockNavigate).toHaveBeenCalledWith('/unauthorized', undefined, true);
    });

    it('does not show children when user lacks required role', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'user@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    });

    it('allows access when no role is required', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'user@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Public Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Protected Content')).toBeInTheDocument();
    });

    it('checks role exactly (case-sensitive)', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'user@example.com', role: 'Admin' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('Navigate to /unauthorized')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined user gracefully', () => {
      mockUseAuth.mockReturnValue({ user: undefined, loading: false });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
    });

    it('handles null children', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>{null}</ProtectedRoute>
        </MemoryRouter>
      );

      expect(container.textContent).toBe('');
    });

    it('handles empty string as children', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: 'user' }, 
        loading: false 
      });

      const { container } = render(
        <MemoryRouter>
          <ProtectedRoute>{''}</ProtectedRoute>
        </MemoryRouter>
      );

      expect(container.textContent).toBe('');
    });

    it('handles user with missing role property', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com' } as any, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('navigate')).toBeInTheDocument();
      expect(screen.getByText('Navigate to /unauthorized')).toBeInTheDocument();
    });

    it('handles empty string as required role', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'test@example.com', role: '' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="">
            <div>Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('Priority of Checks', () => {
    it('checks loading before authentication', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: true });

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>Protected Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    });

    it('checks authentication before role', () => {
      mockUseAuth.mockReturnValue({ user: null, loading: false });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Navigate to /login')).toBeInTheDocument();
      expect(screen.queryByText('Navigate to /unauthorized')).not.toBeInTheDocument();
    });

    it('checks role after authentication', () => {
      mockUseAuth.mockReturnValue({ 
        user: { id: '1', email: 'user@example.com', role: 'user' }, 
        loading: false 
      });

      render(
        <MemoryRouter>
          <ProtectedRoute requiredRole="admin">
            <div>Admin Content</div>
          </ProtectedRoute>
        </MemoryRouter>
      );

      expect(screen.getByText('Navigate to /unauthorized')).toBeInTheDocument();
      expect(screen.queryByText('Navigate to /login')).not.toBeInTheDocument();
    });
  });
});
