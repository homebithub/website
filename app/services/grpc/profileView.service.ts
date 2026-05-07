/**
 * Profile View Service - gRPC-Web Client
 *
 * Tracks profile views with YouTube-style deduplication.
 * Uses the standard grpc-web client pattern matching the rest of the codebase.
 */

import * as auth_grpc_web_module from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import {
  getStoredAccessToken,
  getStoredProfileType,
  getStoredUserId,
} from '~/utils/authStorage';

// @ts-ignore - Generated protobuf code
const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;
const { ProfileViewServiceClient } = auth_grpc_web_module as any;

const profileViewClient = new ProfileViewServiceClient(GRPC_WEB_BASE_URL, null, null);

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getStoredAccessToken();
  if (token) md['authorization'] = `Bearer ${token}`;
  const profileType = getStoredProfileType();
  if (profileType) md['x-profile-type'] = profileType;
  return md;
}

function grpcCall<T>(fn: (cb: (err: any, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, res) => {
      if (err) reject(handleGrpcError(err));
      else resolve(res);
    });
  });
}

function jsonResponseToJs(res: any): any {
  const struct = res?.getData?.();
  if (struct && struct.toJavaScript) return struct.toJavaScript();
  return null;
}

function resolveUserId(userId?: string): string {
  if (userId) return userId;
  return getStoredUserId();
}

export const profileViewService = {
  /**
   * Record a profile view with YouTube-style deduplication
   */
  async recordView(profileId: string, profileType: string, viewerUserId?: string) {
    try {
      const req = new auth_pb.RecordViewReq();
      req.setViewerUserId(resolveUserId(viewerUserId));
      req.setProfileId(profileId);
      req.setProfileType(profileType);
      const res: any = await grpcCall((cb) => profileViewClient.recordView(req, getMetadata(), cb));
      return {
        viewId: res?.getViewId?.() ?? '',
        isUnique: res?.getIsUnique?.() ?? true,
      };
    } catch (error) {
      console.error('Failed to record profile view:', error);
      throw error;
    }
  },

  /**
   * Get analytics for a profile (owner only)
   */
  async getAnalytics(profileId: string, profileType: string) {
    try {
      const req = new auth_pb.GetAnalyticsReq();
      req.setProfileId(profileId);
      req.setProfileType(profileType);
      const res: any = await grpcCall((cb) => profileViewClient.getAnalytics(req, getMetadata(), cb));
      const data = jsonResponseToJs(res);
      if (data) return data;
      return {
        profile_id: profileId,
        profile_type: profileType,
        total_views: 0,
        unique_views: 0,
        views_today: 0,
        views_this_week: 0,
        views_this_month: 0,
        average_view_duration: 0,
      };
    } catch (error) {
      console.error('Failed to get profile analytics:', error);
      throw error;
    }
  },

  /**
   * Update the duration of a view (called on page unload)
   */
  async updateViewDuration(viewId: string, duration: number) {
    try {
      const req = new auth_pb.UpdateViewDurationReq();
      req.setViewId(viewId);
      req.setDuration(duration);
      await grpcCall((cb) => profileViewClient.updateViewDuration(req, getMetadata(), cb));
    } catch (error) {
      // Best-effort — don't throw on duration updates
      console.error('Failed to update view duration:', error);
    }
  },

  /**
   * Get paginated list of profile views (owner only)
   */
  async getProfileViews(profileId: string, limit: number = 20, offset: number = 0) {
    try {
      const req = new auth_pb.GetProfileViewsReq();
      req.setProfileId(profileId);
      req.setLimit(limit);
      req.setOffset(offset);
      const res: any = await grpcCall((cb) => profileViewClient.getProfileViews(req, getMetadata(), cb));
      const data = jsonResponseToJs(res);
      return data?.data || [];
    } catch (error) {
      console.error('Failed to get profile views:', error);
      throw error;
    }
  },
};
