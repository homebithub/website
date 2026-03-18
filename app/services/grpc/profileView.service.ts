import { GrpcWebFetchTransport } from "@protobuf-ts/grpcweb-transport";
import { ProfileViewServiceClient } from "@homebithub/homebit-pkg/proto/generated/ts/auth.client";

const transport = new GrpcWebFetchTransport({
  baseUrl: process.env.REACT_APP_GRPC_GATEWAY_URL || "http://localhost:8080",
});

const client = new ProfileViewServiceClient(transport);

// Generate device fingerprint for tracking
function getDeviceFingerprint(): string {
  const stored = localStorage.getItem('device_fingerprint');
  if (stored) return stored;
  
  // Create a semi-unique fingerprint based on device characteristics
  const fingerprint = `${navigator.userAgent}-${screen.width}x${screen.height}-${navigator.language}-${new Date().getTimezoneOffset()}`;
  const hash = btoa(fingerprint).substring(0, 32);
  localStorage.setItem('device_fingerprint', hash);
  return hash;
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
}

export const profileViewService = {
  /**
   * Record a profile view with YouTube-style deduplication
   * @param profileId - ID of the profile being viewed
   * @param profileType - Type of profile (household or househelp)
   * @param viewerUserId - Optional user ID of the viewer (null for anonymous)
   * @returns Object with viewId and isUnique flag
   */
  async recordView(profileId: string, profileType: string, viewerUserId?: string) {
    try {
      const response = await client.recordView({
        profileId,
        profileType,
        viewerUserId: viewerUserId || '',
        viewerIp: '', // Backend will extract from request headers
        viewerDeviceId: getDeviceFingerprint(),
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
      });
      
      return {
        viewId: response.response.viewId,
        isUnique: response.response.isUnique,
      };
    } catch (error) {
      console.error('Failed to record profile view:', error);
      throw error;
    }
  },

  /**
   * Get analytics for a profile (owner only)
   * @param profileId - ID of the profile
   * @param profileType - Type of profile
   * @returns Analytics object with view statistics
   */
  async getAnalytics(profileId: string, profileType: string) {
    try {
      const response = await client.getAnalytics({
        profileId,
        profileType,
      });
      
      return JSON.parse(response.response.json);
    } catch (error) {
      console.error('Failed to get profile analytics:', error);
      throw error;
    }
  },

  /**
   * Update the duration of a view (called on page unload)
   * @param viewId - ID of the view record
   * @param duration - Duration in seconds
   */
  async updateViewDuration(viewId: string, duration: number) {
    try {
      await client.updateViewDuration({
        viewId,
        duration,
      });
    } catch (error) {
      console.error('Failed to update view duration:', error);
      // Don't throw - this is a best-effort update
    }
  },

  /**
   * Get paginated list of profile views (owner only)
   * @param profileId - ID of the profile
   * @param limit - Number of views to fetch
   * @param offset - Offset for pagination
   * @returns Array of profile view records
   */
  async getProfileViews(profileId: string, limit: number = 20, offset: number = 0) {
    try {
      const response = await client.getProfileViews({
        profileId,
        limit,
        offset,
      });
      
      const data = JSON.parse(response.response.json);
      return data.data || [];
    } catch (error) {
      console.error('Failed to get profile views:', error);
      throw error;
    }
  },
};
