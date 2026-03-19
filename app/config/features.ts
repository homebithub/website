/**
 * Feature Flags Configuration
 * 
 * Centralized configuration for feature toggles across the application.
 * Update these flags to enable/disable features without code changes.
 */

export const FEATURE_FLAGS = {
  /**
   * Show Sign Up and Login buttons in the navbar for non-authenticated users
   * When false, auth buttons will be hidden from the navbar
   */
  showAuthButtons: true,
} as const;

export default FEATURE_FLAGS;
