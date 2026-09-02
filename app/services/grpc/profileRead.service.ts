import * as profileGrpcModule from '~/grpc/lite/profile/profile_grpc_web_pb';
import * as profilePbModule from '~/grpc/lite/profile/profile_pb';
import structPb from 'google-protobuf/google/protobuf/struct_pb.js';

import { GRPC_WEB_BASE_URL, callWithAuthRetry } from './client';
import { getStoredAccessToken, getStoredCanonicalProfileType, getStoredUserId } from '~/utils/authStorage';
import { normalizeProfileType } from '~/utils/profileType';

const profilePb = (profilePbModule as any).default ?? profilePbModule;
const { ProfileServiceClient } = profileGrpcModule as any;
const StructClass: any = (structPb as any).Struct ?? (structPb as any).default?.Struct;
const client = new ProfileServiceClient(GRPC_WEB_BASE_URL, null, null);

function metadata(): Record<string, string> {
  const result: Record<string, string> = {};
  const token = getStoredAccessToken();
  if (token) result.authorization = `Bearer ${token}`;
  const profileType = getStoredCanonicalProfileType();
  if (profileType) result['x-profile-type'] = profileType;
  return result;
}

function userRequest(userId = ''): any {
  const request = new profilePb.UserIdRequest();
  request.setUserId(userId || getStoredUserId());
  return request;
}

function idRequest(id: string, userId = ''): any {
  const request = new profilePb.IdRequest();
  request.setId(id);
  const caller = userId || getStoredUserId();
  if (caller) request.setUserId(caller);
  return request;
}

function searchRequest(userId: string, profileType: string, filters: Record<string, any> = {}, limit?: number, offset?: number): any {
  const request = new profilePb.SearchRequest();
  request.setUserId(userId || getStoredUserId());
  request.setProfileType(normalizeProfileType(profileType));
  const values = { ...filters, ...(limit === undefined ? {} : { limit }), ...(offset === undefined ? {} : { offset }) };
  if (Object.keys(values).length) request.setFilters(StructClass.fromJavaScript(values));
  return request;
}

function responseData(response: any): any {
  return response?.getData?.()?.toJavaScript?.() ?? response;
}

function call(start: (callback: (error: any, response?: any) => void) => void): Promise<any> {
  return callWithAuthRetry(start).then(responseData);
}

export const profileReadService = {
  getCurrentHouseholdProfile(userId = '') {
    return call(callback => client.getCurrentHouseholdProfile(userRequest(userId), metadata(), callback));
  },
  getHouseholdByUserID(userId: string) {
    return call(callback => client.getHouseholdByUserID(userRequest(userId), metadata(), callback));
  },
  searchHouseholds(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number) {
    return call(callback => client.searchHouseholds(searchRequest(userId, profileType, filters, limit, offset), metadata(), callback));
  },
  getCurrentServiceProviderProfile(userId = '') {
    return call(callback => client.getCurrentServiceProviderProfile(userRequest(userId), metadata(), callback));
  },
  getServiceProviderByID(id: string, userId = '') {
    return call(callback => client.getServiceProviderByID(idRequest(id, userId), metadata(), callback));
  },
  getServiceProviderByUserID(userId: string) {
    return call(callback => client.getServiceProviderByUserID(userRequest(userId), metadata(), callback));
  },
  getServiceProviderProfileWithUser(id: string, userId = '') {
    return call(callback => client.getServiceProviderProfileWithUser(idRequest(id, userId), metadata(), callback));
  },
  searchServiceProviders(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number) {
    return call(callback => client.searchServiceProviders(searchRequest(userId, profileType, filters, limit, offset), metadata(), callback));
  },
};
