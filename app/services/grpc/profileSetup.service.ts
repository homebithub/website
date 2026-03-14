/**
 * Profile Setup Service - gRPC-Web Client
 * 
 * Provides profile setup progress methods using gRPC-Web protocol
 */

import { ProfileSetupServiceClient } from '~/grpc/generated/auth/auth_grpc_web_pb';
import auth_pb_module from '~/grpc/generated/auth/auth_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// @ts-ignore - Generated protobuf code
const auth_pb = auth_pb_module as any;

const profileSetupClient = new ProfileSetupServiceClient(GRPC_WEB_BASE_URL, null, null);

function getMetadata(): { [key: string]: string } {
  const token = getAccessTokenFromCookies();
  if (token) {
    return { 'authorization': `Bearer ${token}` };
  }
  return {};
}

// ── Helper: convert JS object to google.protobuf.Struct ────────────────
function toStruct(obj: Record<string, any>): any {
  const Struct = auth_pb.google?.protobuf?.Struct;
  if (Struct && Struct.fromJavaScript) {
    return Struct.fromJavaScript(obj);
  }
  try {
    const { Struct: PbStruct } = require('google-protobuf/google/protobuf/struct_pb');
    return PbStruct.fromJavaScript(obj);
  } catch {
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
  async getSteps(userId: string): Promise<any> {
    const request = new auth_pb.UserIdRequest();
    request.setUserId(userId);
    const res = await grpcCall((cb) => profileSetupClient.getSteps(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  /**
   * Get profile setup progress for a user.
   */
  async getProgress(userId: string): Promise<any> {
    const request = new auth_pb.UserIdRequest();
    request.setUserId(userId);
    const res = await grpcCall((cb) => profileSetupClient.getProgress(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },

  /**
   * Update profile setup progress (saves current_step, last_completed_step, etc.)
   */
  async updateProgress(userId: string, data: Record<string, any>): Promise<any> {
    const request = new auth_pb.JsonPayload();
    request.setUserId(userId);
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
    request.setUserId(userId);
    const struct = toStruct(data);
    if (struct) request.setData(struct);
    const res = await grpcCall((cb) => profileSetupClient.updateStep(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

export default profileSetupService;
