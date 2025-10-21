/**
 * User Tracking Utilities
 * 
 * Provides robust user identification for both anonymous and authenticated users.
 * Uses browser fingerprinting combined with session IDs to accurately track individual users.
 */

/**
 * Generate a browser fingerprint based on available browser characteristics
 * This helps identify the same user even if they clear localStorage
 */
export const generateBrowserFingerprint = async (): Promise<string> => {
  const components: string[] = [];

  // Screen resolution
  components.push(`${window.screen.width}x${window.screen.height}`);
  components.push(`${window.screen.colorDepth}`);

  // Timezone
  components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

  // Language
  components.push(navigator.language);

  // Platform
  components.push(navigator.platform);

  // User agent (simplified to avoid too much specificity)
  const ua = navigator.userAgent;
  const browser = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || 'Unknown';
  components.push(browser);

  // Hardware concurrency (CPU cores)
  components.push(String(navigator.hardwareConcurrency || 0));

  // Device memory (if available)
  if ('deviceMemory' in navigator) {
    components.push(String((navigator as any).deviceMemory));
  }

  // Canvas fingerprint (lightweight version)
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Homebit', 2, 2);
      const canvasData = canvas.toDataURL();
      components.push(canvasData.slice(-50)); // Last 50 chars for uniqueness
    }
  } catch (e) {
    // Canvas fingerprinting might be blocked
    components.push('canvas-blocked');
  }

  // Combine all components and hash
  const fingerprint = components.join('|');
  return await simpleHash(fingerprint);
};

/**
 * Simple hash function for fingerprint
 */
const simpleHash = async (str: string): Promise<string> => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for older browsers
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

/**
 * Generate or retrieve a persistent user ID
 * Combines browser fingerprint with a random component for uniqueness
 */
export const getOrCreateUserId = async (): Promise<string> => {
  const USER_ID_KEY = 'homebit_user_id';
  const FINGERPRINT_KEY = 'homebit_fingerprint';

  // Check if we have a stored user ID
  let userId = localStorage.getItem(USER_ID_KEY);
  let storedFingerprint = localStorage.getItem(FINGERPRINT_KEY);

  // Generate current fingerprint
  const currentFingerprint = await generateBrowserFingerprint();

  // If user ID exists and fingerprint matches, return it
  if (userId && storedFingerprint === currentFingerprint) {
    return userId;
  }

  // If fingerprint changed but we have a user ID, keep the user ID
  // (user might have changed screen resolution, etc.)
  if (userId && storedFingerprint) {
    // Update fingerprint
    localStorage.setItem(FINGERPRINT_KEY, currentFingerprint);
    return userId;
  }

  // Generate new user ID
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 11);
  const fingerprintShort = currentFingerprint.substring(0, 8);
  userId = `user_${timestamp}_${fingerprintShort}_${random}`;

  // Store user ID and fingerprint
  localStorage.setItem(USER_ID_KEY, userId);
  localStorage.setItem(FINGERPRINT_KEY, currentFingerprint);

  return userId;
};

/**
 * Generate or retrieve session ID
 * Session ID is more temporary and can be used for short-term tracking
 */
export const getOrCreateSessionId = (): string => {
  const SESSION_KEY = 'homebit_session_id';
  const SESSION_TIMESTAMP_KEY = 'homebit_session_timestamp';
  const SESSION_DURATION = 30 * 60 * 1000; // 30 minutes

  let sessionId = sessionStorage.getItem(SESSION_KEY);
  const sessionTimestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);

  // Check if session is still valid
  if (sessionId && sessionTimestamp) {
    const elapsed = Date.now() - parseInt(sessionTimestamp, 10);
    if (elapsed < SESSION_DURATION) {
      // Update timestamp
      sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
      return sessionId;
    }
  }

  // Generate new session ID
  sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  sessionStorage.setItem(SESSION_KEY, sessionId);
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());

  return sessionId;
};

/**
 * Clear user tracking data (call on logout)
 */
export const clearUserTracking = (): void => {
  // Keep fingerprint and user_id for continuity
  // Only clear session
  sessionStorage.removeItem('homebit_session_id');
  sessionStorage.removeItem('homebit_session_timestamp');
};

/**
 * Get comprehensive user identifier
 * Returns both persistent user ID and session ID
 */
export const getUserIdentifiers = async (): Promise<{
  userId: string;
  sessionId: string;
  fingerprint: string;
}> => {
  const userId = await getOrCreateUserId();
  const sessionId = getOrCreateSessionId();
  const fingerprint = await generateBrowserFingerprint();

  return {
    userId,
    sessionId,
    fingerprint,
  };
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};

/**
 * Get authenticated user ID from token
 */
export const getAuthenticatedUserId = (): string | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // Decode JWT token (simple base64 decode)
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.user_id || decoded.sub || null;
  } catch (e) {
    return null;
  }
};
