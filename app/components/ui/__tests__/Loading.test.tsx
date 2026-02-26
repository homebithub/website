import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithRouter, VIEWPORTS, setViewport } from '~/test/utils/test-utils';
import Loading from '../Loading';

describe('Loading Component', () => {
  describe('Rendering', () => {
    it('should render loading spinner', () => {
      renderWithRouter(<Loading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });

    it('should have accessible label', () => {
      renderWithRouter(<Loading />);
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Theme Consistency', () => {
    it('should use primary purple color', () => {
      const { container } = renderWithRouter(<Loading />);
      const spinner = container.querySelector('[class*="primary"]') || 
                     container.querySelector('[class*="purple"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should have proper animation', () => {
      const { container } = renderWithRouter(<Loading />);
      const spinner = container.querySelector('[class*="animate"]');
      expect(spinner).toBeInTheDocument();
    });

    it('should work in dark mode', () => {
      const { container } = renderWithRouter(<Loading />, { darkMode: true });
      expect(document.documentElement.classList.contains('dark')).toBe(true);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Mobile Responsiveness', () => {
    it('should be visible on mobile viewport', () => {
      setViewport(VIEWPORTS.mobile.width, VIEWPORTS.mobile.height);
      renderWithRouter(<Loading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeVisible();
    });

    it('should be visible on tablet viewport', () => {
      setViewport(VIEWPORTS.tablet.width, VIEWPORTS.tablet.height);
      renderWithRouter(<Loading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeVisible();
    });

    it('should be visible on desktop viewport', () => {
      setViewport(VIEWPORTS.desktop.width, VIEWPORTS.desktop.height);
      renderWithRouter(<Loading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toBeVisible();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithRouter(<Loading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).toHaveAttribute('aria-label');
    });

    it('should be keyboard accessible', () => {
      renderWithRouter(<Loading />);
      const spinner = screen.getByRole('status', { hidden: true });
      expect(spinner).not.toHaveAttribute('tabindex', '-1');
    });
  });
});
