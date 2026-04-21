/**
 * Profile Setup Service - gRPC-Web Client
 * 
 * Provides profile setup progress methods using gRPC-Web protocol
 */

import * as auth_grpc_web_module from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import * as struct_pb from 'google-protobuf/google/protobuf/struct_pb.js';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import {
  getStoredAccessToken,
  getStoredProfileType,
  getStoredUserId,
} from '~/utils/authStorage';

// @ts-ignore - Generated protobuf code
const auth_pb = auth_pb_module as any;
const { ProfileSetupServiceClient } = auth_grpc_web_module as any;

const profileSetupClient = new ProfileSetupServiceClient(GRPC_WEB_BASE_URL, null, null);

function resolveUserId(userId: string): string {
  if (userId) return userId;
  return getStoredUserId();
}

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getStoredAccessToken();
  if (token) md['authorization'] = `Bearer ${token}`;
  const profileType = getStoredProfileType();
  if (profileType) md['x-profile-type'] = profileType;
  return md;
}

// ── Helper: convert JS object to google.protobuf.Struct ────────────────
const _StructClass: any =
  struct_pb.Struct ?? (struct_pb as any).default?.Struct ?? null;

// Strip undefined values recursively — Struct.fromJavaScript throws on undefined
function stripUndefined(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (Array.isArray(obj)) return obj.map(stripUndefined);
  if (typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) clean[k] = stripUndefined(v);
    }
    return clean;
  }
  return obj;
}

function toStruct(obj: Record<string, any>): any {
  if (!obj || typeof obj !== 'object') return null;
  try {
    if (!_StructClass || typeof _StructClass.fromJavaScript !== 'function') {
      console.error('[toStruct] Struct class not available. struct_pb keys:', Object.keys(struct_pb));
      return null;
    }
    return _StructClass.fromJavaScript(stripUndefined(obj));
  } catch (e) {
    console.error('[toStruct] fromJavaScript threw:', e);
    return null;
  }
}

function jsonResponseToJs(response: any): any {
  if (!response) return null;
  const struct = response.getData?.();
  if (struct && struct.toJavaScript) {
    return struct.toJavaScript();
  }
  return response;
}

function grpcCall<T>(fn: (cb: (err: any, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, res) => {
      if (err) reject(handleGrpcError(err));
      else resolve(res);
    });
  });
}

export const profileSetupService = {
  /**
   * Get profile setup steps for a user.
   */
  async getSteps(userId: string, profileType?: string): Promise<any> {
    const request = new auth_pb.UserIdRequest();
    request.setUserId(resolveUserId(userId));
    if (profileType) {
      request.setProfileType(profileType);
    } else {
      const pt = getStoredProfileType();
      if (pt) request.setProfileType(pt);
    }
    const res = await grpcCall((cb) => profileSetupClient.getSteps(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  /**
   * Get profile setup progress for a user.
   */
  async getProgress(userId: string, profileType?: string): Promise<any> {
    const request = new auth_pb.UserIdRequest();
    request.setUserId(resolveUserId(userId));
    if (profileType) {
      request.setProfileType(profileType);
    } else {
      const pt = getStoredProfileType();
      if (pt) request.setProfileType(pt);
    }
    const res = await grpcCall((cb) => profileSetupClient.getProgress(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  /**
   * Update profile setup progress (saves current_step, last_completed_step, etc.)
   */
  async updateProgress(userId: string, data: Record<string, any>): Promise<any> {
    const request = new auth_pb.JsonPayload();
    request.setUserId(resolveUserId(userId));
    const profileType = data.profile_type || getStoredProfileType();
    if (profileType) request.setProfileType(profileType);
    const struct = toStruct(data);
    if (struct) request.setData(struct);
    const res = await grpcCall((cb) => profileSetupClient.updateProgress(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  /**
   * Update a specific profile setup step (marks step as completed/skipped)
   */
  async updateStep(userId: string, data: Record<string, any>): Promise<any> {
    const request = new auth_pb.JsonPayload();
    request.setUserId(resolveUserId(userId));
    const profileType = data.profile_type || getStoredProfileType();
    if (profileType) request.setProfileType(profileType);
    const struct = toStruct(data);
    if (struct) request.setData(struct);
    const res = await grpcCall((cb) => profileSetupClient.updateStep(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

export default profileSetupService;
