/**
 * Profile Setup Service - gRPC-Web Client
 * 
 * Reads completion computed from canonical profile data.
 */

import * as auth_grpc_web_module from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import * as struct_pb_module from 'google-protobuf/google/protobuf/struct_pb';
import { GRPC_WEB_BASE_URL, handleGrpcError, callWithAuthRetry } from './client';
import {
  getStoredAccessToken,
  getStoredProfileType,
  getStoredUserId,
} from '~/utils/authStorage';

// @ts-ignore - Generated protobuf code
const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;
const { ProfileSetupServiceClient } = auth_grpc_web_module as any;
const struct_pb: any = (struct_pb_module as any).default ?? struct_pb_module;
const StructClass: any = struct_pb.Struct;

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

function jsonResponseToJs(response: any): any {
  if (!response) return null;
  const struct = response.getData?.();
  if (struct && struct.toJavaScript) {
    return struct.toJavaScript();
  }
  return response;
}

// Renews the session once and retries when the server says the token has
// expired, rather than surfacing "please sign in again" to somebody holding a
// perfectly good refresh token.
const grpcCall = callWithAuthRetry;

export const profileSetupService = {
  async getProgress(userId: string, profileType?: string): Promise<any> {
    const request = new auth_pb.UserIdRequest();
    request.setUserId(resolveUserId(userId));
    const resolvedProfileType = profileType || getStoredProfileType();
    if (resolvedProfileType) request.setProfileType(resolvedProfileType);
    const res = await grpcCall((cb) => profileSetupClient.getProgress(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async markCompletionCelebrationSeen(userId: string, profileType?: string): Promise<any> {
    const request = new auth_pb.JsonPayload();
    request.setUserId(resolveUserId(userId));
    const resolvedProfileType = profileType || getStoredProfileType();
    if (resolvedProfileType) request.setProfileType(resolvedProfileType);
    if (StructClass?.fromJavaScript) {
      request.setData(StructClass.fromJavaScript({ completion_celebration_seen: true }));
    }
    const res = await grpcCall((cb) => profileSetupClient.updateProgress(request, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

export default profileSetupService;
