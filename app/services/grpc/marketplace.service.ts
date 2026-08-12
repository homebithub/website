import * as marketplaceGrpcModule from '~/grpc/lite/marketplace/marketplace_grpc_web_pb';
import * as marketplacePbModule from '~/grpc/lite/marketplace/marketplace_pb';
import structPb from 'google-protobuf/google/protobuf/struct_pb.js';

import { GRPC_WEB_BASE_URL, callWithAuthRetry } from './client';
import { getStoredAccessToken, getStoredProfileType, getStoredUserId } from '~/utils/authStorage';

const pb = (marketplacePbModule as any).default ?? marketplacePbModule;
const grpc = (marketplaceGrpcModule as any).default ?? marketplaceGrpcModule;
const StructClass: any = (structPb as any).Struct ?? (structPb as any).default?.Struct;
const shortlistClient = new grpc.ShortlistServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireRequestClient = new grpc.HireRequestServiceClient(GRPC_WEB_BASE_URL, null, null);

function metadata(): Record<string, string> {
  const result: Record<string, string> = {};
  const token = getStoredAccessToken();
  if (token) result.authorization = `Bearer ${token}`;
  const profileType = getStoredProfileType();
  if (profileType) result['x-profile-type'] = profileType;
  return result;
}

function resolveUserId(userId = ''): string {
  return userId || getStoredUserId();
}

function responseData(response: any): any {
  return response?.getData?.()?.toJavaScript?.() ?? response;
}

function call(start: (callback: (error: any, response?: any) => void) => void): Promise<any> {
  return callWithAuthRetry(start);
}

function userRequest(userId = '', profileType = ''): any {
  const request = new pb.UserIdRequest();
  request.setUserId(resolveUserId(userId));
  if (profileType) request.setProfileType(profileType);
  return request;
}

async function jobListingsApi(path = '', init?: RequestInit): Promise<any> {
  const response = await fetch(`/api/job-listings${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'Unable to process job listing request');
  return payload;
}

function normalizeArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  if (Array.isArray(value?.listings)) return value.listings;
  return [];
}

export const marketplaceShortlistService = {
  async createShortlist(userId: string, profileType: string, data: Record<string, any>): Promise<any> {
    const request = new pb.CreateShortlistReq();
    request.setUserId(resolveUserId(userId));
    request.setProfileType(profileType);
    request.setData(StructClass.fromJavaScript(data));
    return responseData(await call(callback => shortlistClient.createShortlist(request, metadata(), callback)));
  },
  async deleteShortlist(id: string, userId = ''): Promise<void> {
    const request = new pb.IdRequest();
    request.setId(id);
    request.setUserId(resolveUserId(userId));
    await call(callback => shortlistClient.deleteShortlist(request, metadata(), callback));
  },
  async listByHousehold(userId: string, profileType = ''): Promise<any> {
    return responseData(await call(callback => shortlistClient.listByHousehold(userRequest(userId, profileType), metadata(), callback)));
  },
  async getShortlistCount(userId: string, profileType = ''): Promise<{ count: number }> {
    const response: any = await call(callback => shortlistClient.getShortlistCount(userRequest(userId, profileType), metadata(), callback));
    return { count: Number(response?.getCount?.() ?? 0) };
  },
};

export const marketplaceHireRequestService = {
  async listHireRequests(userId = '', profileType = '', status = ''): Promise<any> {
    const request = new pb.ListHireRequestsReq();
    request.setUserId(resolveUserId(userId));
    request.setProfileType(profileType);
    if (status) request.setStatus(status);
    request.setLimit(50);
    request.setOffset(0);
    return responseData(await call(callback => hireRequestClient.listHireRequests(request, metadata(), callback)));
  },
};

export const marketplaceJobService = {
  async searchJobs(filters: Record<string, any>, _userId?: string): Promise<any> {
    const params = new URLSearchParams({
      limit: String(filters?.limit ?? 20),
      offset: String(filters?.offset ?? 0),
    });
    const status = String(filters?.status || '');
    if (status) params.set('status', status === 'open' ? 'active' : status);
    if (filters?.user_profile_id) params.set('user_profile_id', String(filters.user_profile_id));
    if (filters?.ward_id) params.set('ward_id', String(filters.ward_id));
    else if (filters?.subcounty_id) params.set('subcounty_id', String(filters.subcounty_id));
    else if (filters?.county_id) params.set('county_id', String(filters.county_id));
    if (filters?.job_type_id) params.set('job_type_id', String(filters.job_type_id));
    const propertyIds = Array.isArray(filters?.property_ids)
      ? filters.property_ids.map(Number).filter((id: number) => Number.isFinite(id) && id > 0)
      : [];
    if (propertyIds.length) params.set('property_ids', propertyIds.join(','));
    if (filters?.match_for) params.set('match_for', String(filters.match_for));
    if (filters?.owner) params.set('owner', String(filters.owner));
    if (filters?.match_candidates_for_profile) {
      params.set('match_candidates_for_profile', String(filters.match_candidates_for_profile));
    }
    const payload = await jobListingsApi(`?${params.toString()}`);
    return { data: normalizeArray(payload.data ?? payload) };
  },
  async applyForJob(id: string, serviceProviderId = '', message = ''): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'apply', id, service_provider_id: serviceProviderId, message }),
    });
    return payload.data ?? payload;
  },
};

export const marketplaceListingApplicationService = {
  async shortlistListing(listingId: string, serviceProviderId: string, message = ''): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'shortlist', id: listingId, service_provider_id: serviceProviderId, message }),
    });
    return payload.data ?? payload;
  },
  async listApplications(options: {
    listingId?: string;
    applicantProfileId?: string;
    ownerProfileId?: string;
    statuses?: string[];
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const params = new URLSearchParams({ action: 'applications' });
    if (options.listingId) params.set('listing_id', options.listingId);
    if (options.applicantProfileId) params.set('applicant_profile_id', options.applicantProfileId);
    if (options.ownerProfileId) params.set('owner_profile_id', options.ownerProfileId);
    if (options.statuses?.length) params.set('statuses', options.statuses.join(','));
    params.set('limit', String(options.limit ?? 20));
    params.set('offset', String(options.offset ?? 0));
    const payload = await jobListingsApi(`?${params.toString()}`);
    return { data: normalizeArray(payload.data ?? payload) };
  },
};
