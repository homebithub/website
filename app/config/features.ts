/**
 * Feature Flags Configuration
 * 
 * Centralized configuration for feature toggles across the application.
 * Update these flags to enable/disable features without code changes.
 */

export const FEATURE_FLAGS = {
  /**
   * Show Sign Up and Login buttons in the navbar for non-authenticated users
   * When false, only the "Join Waitlist" button will be shown
   */
  showAuthButtons: true,
} as const;

export default FEATURE_FLAGS;
