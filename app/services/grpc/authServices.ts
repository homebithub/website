/**
 * Auth Sub-Services - gRPC-Web Clients
 * 
 * Wrappers for all auth sub-services (profile, preferences, pets, kids, etc.)
 * Method names match the proto RPC definitions in auth.proto exactly (camelCase).
 */

import {
  ProfileServiceClient,
  ShortlistServiceClient,
  InterestServiceClient,
  ReviewServiceClient,
  LocationServiceClient,
  ImageServiceClient,
  DocumentServiceClient,
  PetsServiceClient,
  HouseholdKidsServiceClient,
  HousehelpPreferencesServiceClient,
  HouseholdPreferencesServiceClient,
  HouseholdMemberServiceClient,
  ProfileViewServiceClient,
  PreferencesServiceClient,
  OnboardingOptionsServiceClient,
  ContactServiceClient,
  KYCServiceClient,
  HireRequestServiceClient,
  HireContractServiceClient,
  HireNegotiationServiceClient,
  EmploymentServiceClient,
  EmploymentContractServiceClient,
  JobServiceClient,
  BureauServiceClient,
  WaitlistServiceClient,
} from '~/grpc/generated/auth/auth_grpc_web_pb';
import auth_pb_module from '~/grpc/generated/auth/auth_pb';
import * as struct_pb from 'google-protobuf/google/protobuf/struct_pb.js';
import { GRPC_WEB_BASE_URL, handleGrpcError } from './client';
import { getAccessTokenFromCookies } from '~/utils/cookie';

// @ts-ignore - Generated protobuf code
const auth_pb = auth_pb_module as any;

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getAccessTokenFromCookies();
  if (token) md['authorization'] = `Bearer ${token}`;
  try {
    if (typeof window !== 'undefined') {
      const profileType = localStorage.getItem('profile_type');
      if (profileType) md['x-profile-type'] = profileType;
    }
  } catch {}
  return md;
}

// ── Helper: convert JS object to google.protobuf.Struct ────────────────
// Resolve the Struct class once — handles both ESM named export and CJS default interop
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
  if (!obj || typeof obj !== 'object') {
    console.warn('[toStruct] invalid input:', typeof obj);
    return null;
  }
  try {
    if (!_StructClass || typeof _StructClass.fromJavaScript !== 'function') {
      console.error('[toStruct] Struct class not available. struct_pb keys:', Object.keys(struct_pb));
      return null;
    }
    const s = _StructClass.fromJavaScript(stripUndefined(obj));
    return s;
  } catch (e) {
    console.error('[toStruct] fromJavaScript threw:', e, 'input keys:', Object.keys(obj));
    return null;
  }
}

// ── Helper: convert JsonResponse to plain JS object ────────────────────
function jsonResponseToJs(response: any): any {
  if (!response) return null;
  const struct = response.getData?.();
  if (struct && struct.toJavaScript) {
    return struct.toJavaScript();
  }
  return response;
}

// ── Helper: generic gRPC call wrapper ──────────────────────────────────
function grpcCall<T>(fn: (cb: (err: any, res: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    fn((err, res) => {
      if (err) reject(handleGrpcError(err));
      else resolve(res);
    });
  });
}

// ══════════════════════════════════════════════════════════════════════════
// Singleton clients
// ══════════════════════════════════════════════════════════════════════════
const profileClient = new ProfileServiceClient(GRPC_WEB_BASE_URL, null, null);
const shortlistClient = new ShortlistServiceClient(GRPC_WEB_BASE_URL, null, null);
const interestClient = new InterestServiceClient(GRPC_WEB_BASE_URL, null, null);
const reviewClient = new ReviewServiceClient(GRPC_WEB_BASE_URL, null, null);
const locationClient = new LocationServiceClient(GRPC_WEB_BASE_URL, null, null);
const imageClient = new ImageServiceClient(GRPC_WEB_BASE_URL, null, null);
const documentClient = new DocumentServiceClient(GRPC_WEB_BASE_URL, null, null);
const petsClient = new PetsServiceClient(GRPC_WEB_BASE_URL, null, null);
const householdKidsClient = new HouseholdKidsServiceClient(GRPC_WEB_BASE_URL, null, null);
const househelpPrefsClient = new HousehelpPreferencesServiceClient(GRPC_WEB_BASE_URL, null, null);
const householdPrefsClient = new HouseholdPreferencesServiceClient(GRPC_WEB_BASE_URL, null, null);
const householdMemberClient = new HouseholdMemberServiceClient(GRPC_WEB_BASE_URL, null, null);
const profileViewClient = new ProfileViewServiceClient(GRPC_WEB_BASE_URL, null, null);
const preferencesClient = new PreferencesServiceClient(GRPC_WEB_BASE_URL, null, null);
const onboardingOptionsClient = new OnboardingOptionsServiceClient(GRPC_WEB_BASE_URL, null, null);
const contactClient = new ContactServiceClient(GRPC_WEB_BASE_URL, null, null);
const kycClient = new KYCServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireRequestClient = new HireRequestServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireContractClient = new HireContractServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireNegotiationClient = new HireNegotiationServiceClient(GRPC_WEB_BASE_URL, null, null);
const employmentClient = new EmploymentServiceClient(GRPC_WEB_BASE_URL, null, null);
const employmentContractClient = new EmploymentContractServiceClient(GRPC_WEB_BASE_URL, null, null);
const jobClient = new JobServiceClient(GRPC_WEB_BASE_URL, null, null);
const bureauClient = new BureauServiceClient(GRPC_WEB_BASE_URL, null, null);
const waitlistClient = new WaitlistServiceClient(GRPC_WEB_BASE_URL, null, null);

// ── Helper: resolve userId from stored user data when not provided ────
function resolveUserId(userId: string): string {
  if (userId) return userId;
  try {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('user_object');
      if (raw) {
        const user = JSON.parse(raw);
        return user.user_id || user.id || '';
      }
    }
  } catch {}
  return '';
}

// ── Request builders ───────────────────────────────────────────────────
function buildIdRequest(id: string, userId?: string): any {
  const req = new auth_pb.IdRequest();
  req.setId(id);
  const resolved = resolveUserId(userId || '');
  if (resolved) req.setUserId(resolved);
  return req;
}

function buildUserIdRequest(userId: string, profileType?: string): any {
  const req = new auth_pb.UserIdRequest();
  req.setUserId(resolveUserId(userId));
  if (profileType) req.setProfileType(profileType);
  return req;
}

function buildJsonPayload(userId: string, data: Record<string, any>, profileType?: string): any {
  const req = new auth_pb.JsonPayload();
  req.setUserId(resolveUserId(userId));
  if (profileType) req.setProfileType(profileType);
  const struct = toStruct(data);
  if (struct) req.setData(struct);
  return req;
}

function buildUpdateByIdPayload(id: string, userId: string, data: Record<string, any>): any {
  const req = new auth_pb.UpdateByIdPayload();
  req.setId(id);
  req.setUserId(resolveUserId(userId));
  const struct = toStruct(data);
  if (struct) req.setData(struct);
  return req;
}

function buildUpdateProfileRequest(userId: string, profileType: string, data: Record<string, any>): any {
  const req = new auth_pb.UpdateProfileRequest();
  req.setUserId(resolveUserId(userId));
  req.setProfileType(profileType);
  const struct = toStruct(data);
  if (struct) req.setData(struct);
  return req;
}

function buildUpdateProfileFieldRequest(id: string, userId: string, data: Record<string, any>): any {
  const req = new auth_pb.UpdateProfileFieldRequest();
  req.setId(id);
  req.setUserId(resolveUserId(userId));
  const struct = toStruct(data);
  if (struct) req.setData(struct);
  return req;
}

function buildSearchRequest(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number): any {
  const req = new auth_pb.SearchRequest();
  req.setUserId(resolveUserId(userId));
  req.setProfileType(profileType);
  if (filters) {
    const struct = toStruct(filters);
    if (struct) req.setFilters(struct);
  }
  if (limit !== undefined) req.setLimit(limit);
  if (offset !== undefined) req.setOffset(offset);
  return req;
}

function buildListRequest(limit = 20, offset = 0): any {
  const req = new auth_pb.ListRequest();
  req.setLimit(limit);
  req.setOffset(offset);
  return req;
}

// ══════════════════════════════════════════════════════════════════════════
// Profile Service
// ══════════════════════════════════════════════════════════════════════════
export const profileService = {
  async getCurrentHouseholdProfile(userId: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getCurrentHouseholdProfile(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateHouseholdProfile(userId: string, profileType: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => profileClient.updateHouseholdProfile(buildUpdateProfileRequest(userId, profileType, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHouseholdByUserID(userId: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getHouseholdByUserID(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchHouseholds(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number): Promise<any> {
    const res = await grpcCall((cb) => profileClient.searchHouseholds(buildSearchRequest(userId, profileType, filters, limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async countHouseholds(userId: string, profileType: string, filters?: Record<string, any>): Promise<number> {
    const res: any = await grpcCall((cb) => profileClient.countHouseholds(buildSearchRequest(userId, profileType, filters), getMetadata(), cb));
    return res?.getCount?.() ?? 0;
  },
  async getCurrentHousehelpProfile(userId: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getCurrentHousehelpProfile(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getHousehelpByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpByUserID(userId: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getHousehelpByUserID(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpProfileWithUser(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getHousehelpProfileWithUser(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpsByBureau(bureauId: string, userId?: string): Promise<any> {
    const req = new auth_pb.GetByBureauRequest();
    req.setBureauId(bureauId);
    if (userId) req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => profileClient.getHousehelpsByBureau(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchHousehelps(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number): Promise<any> {
    const res = await grpcCall((cb) => profileClient.searchHousehelps(buildSearchRequest(userId, profileType, filters, limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async countHousehelps(userId: string, profileType: string, filters?: Record<string, any>): Promise<number> {
    const res: any = await grpcCall((cb) => profileClient.countHousehelps(buildSearchRequest(userId, profileType, filters), getMetadata(), cb));
    return res?.getCount?.() ?? 0;
  },
  async searchMultipleWithUser(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number): Promise<any> {
    const res = await grpcCall((cb) => profileClient.searchMultipleWithUser(buildSearchRequest(userId, profileType, filters, limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getPopularHousehelps(): Promise<any> {
    // google.protobuf.Empty - just pass an empty request object
    let req: any;
    try { const { Empty } = require('google-protobuf/google/protobuf/empty_pb'); req = new Empty(); } catch { req = {}; }
    const res = await grpcCall((cb) => profileClient.getPopularHousehelps(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateProfileOverview(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => profileClient.updateProfileOverview(buildUpdateProfileFieldRequest(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updatePersonalDetails(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => profileClient.updatePersonalDetails(buildUpdateProfileFieldRequest(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateFamilyContacts(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => profileClient.updateFamilyContacts(buildUpdateProfileFieldRequest(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateEducationHealth(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => profileClient.updateEducationHealth(buildUpdateProfileFieldRequest(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateEmploymentSalary(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => profileClient.updateEmploymentSalary(buildUpdateProfileFieldRequest(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateHousehelpFields(userId: string, profileType: string, updates: Record<string, any>, stepMetadata?: Record<string, any>): Promise<any> {
    const req = new auth_pb.UpdateHousehelpFieldsRequest();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    const updatesStruct = toStruct(updates);
    if (updatesStruct) req.setUpdates(updatesStruct);
    if (stepMetadata) {
      const metaStruct = toStruct(stepMetadata);
      if (metaStruct) req.setStepMetadata(metaStruct);
    }
    const res = await grpcCall((cb) => profileClient.updateHousehelpFields(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async saveUserLocation(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.SaveUserLocationRequest();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => profileClient.saveUserLocation(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getProfileDocuments(userId: string, profileType: string): Promise<any> {
    const req = new auth_pb.GetProfileDocumentsRequest();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    const res = await grpcCall((cb) => profileClient.getProfileDocuments(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Shortlist Service (proto: createShortlist, getShortlist, updateShortlist,
//   deleteShortlist, listByHousehold, listByProfile, getShortlistCount, shortlistExists)
// ══════════════════════════════════════════════════════════════════════════
export const shortlistService = {
  async createShortlist(userId: string, profileType: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateShortlistReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => shortlistClient.createShortlist(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getShortlist(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => shortlistClient.getShortlist(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteShortlist(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => shortlistClient.deleteShortlist(buildIdRequest(id, userId), getMetadata(), cb));
  },
  async listByHousehold(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => shortlistClient.listByHousehold(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listByProfile(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => shortlistClient.listByProfile(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async shortlistExists(userId: string, profileId: string): Promise<any> {
    const req = new auth_pb.ShortlistExistsReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileId(profileId);
    return grpcCall((cb) => shortlistClient.shortlistExists(req, getMetadata(), cb));
  },
  async getShortlistCount(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => shortlistClient.getShortlistCount(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    // CountResponse has getCount() method
    return { count: (res as any)?.getCount?.() || 0 };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Interest Service (proto: createInterest, getInterest, deleteInterest,
//   listByHousehold, listByHousehelp, interestExists, getInterestCount,
//   markViewed, acceptInterest, declineInterest)
// ══════════════════════════════════════════════════════════════════════════
export const interestService = {
  async createInterest(userId: string, profileType: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateInterestReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => interestClient.createInterest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getInterest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => interestClient.getInterest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteInterest(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => interestClient.deleteInterest(buildIdRequest(id, userId), getMetadata(), cb));
  },
  async listByHousehold(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => interestClient.listByHousehold(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listByHousehelp(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => interestClient.listByHousehelp(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async interestExists(userId: string, householdId: string): Promise<any> {
    const req = new auth_pb.InterestExistsReq();
    req.setUserId(resolveUserId(userId));
    req.setHouseholdId(householdId);
    return grpcCall((cb) => interestClient.interestExists(req, getMetadata(), cb));
  },
  async acceptInterest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => interestClient.acceptInterest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async declineInterest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => interestClient.declineInterest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async markViewed(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => interestClient.markViewed(buildIdRequest(id, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Review Service (proto: createReview, getHousehelpReviews, getHouseholdReviews,
//   verifyReview, rejectReview, getHousehelpAverageRating)
// ══════════════════════════════════════════════════════════════════════════
export const reviewService = {
  async createReview(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateReviewReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => reviewClient.createReview(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpReviews(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => reviewClient.getHousehelpReviews(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHouseholdReviews(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => reviewClient.getHouseholdReviews(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpAverageRating(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => reviewClient.getHousehelpAverageRating(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Location Service (proto: createLocation, getLocationSuggestions,
//   searchLocations, getLocationByID, getLocationByMapboxID, updateLocation, deleteLocation)
// ══════════════════════════════════════════════════════════════════════════
export const locationService = {
  async createLocation(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateLocationReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => locationClient.createLocation(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getLocationSuggestions(query: string, userId?: string): Promise<any> {
    const req = new auth_pb.LocationQueryReq();
    req.setQuery(query);
    if (userId) req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => locationClient.getLocationSuggestions(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchLocations(query: string, userId?: string): Promise<any> {
    const req = new auth_pb.LocationQueryReq();
    req.setQuery(query);
    if (userId) req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => locationClient.searchLocations(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getLocationByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => locationClient.getLocationByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getLocationByMapboxID(mapboxId: string): Promise<any> {
    const req = new auth_pb.StringFieldRequest();
    req.setValue(mapboxId);
    const res = await grpcCall((cb) => locationClient.getLocationByMapboxID(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteLocation(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => locationClient.deleteLocation(buildIdRequest(id, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Image Service (proto: getImagesByUser, getImagesByUserID)
// Note: uploads still go through multipart HTTP proxy
// ══════════════════════════════════════════════════════════════════════════
export const imageService = {
  async getImagesByUser(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => imageClient.getImagesByUser(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getImagesByUserID(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => imageClient.getImagesByUserID(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Document Service (proto: getUserDocuments, getDocumentByID, deleteDocument,
//   getDocumentDownloadURL)
// Note: uploads still go through multipart HTTP proxy
// ══════════════════════════════════════════════════════════════════════════
export const documentService = {
  async getUserDocuments(userId: string, documentType?: string): Promise<any> {
    const req = new auth_pb.GetUserDocumentsReq();
    req.setUserId(resolveUserId(userId));
    if (documentType) req.setDocumentType(documentType);
    const res = await grpcCall((cb) => documentClient.getUserDocuments(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getDocumentByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => documentClient.getDocumentByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteDocument(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => documentClient.deleteDocument(buildIdRequest(id, userId), getMetadata(), cb));
  },
  async getDocumentDownloadURL(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => documentClient.getDocumentDownloadURL(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Pets Service (proto: createPet, getPetByID, listMyPets, updatePet, deletePet, listPetsByUserID)
// ══════════════════════════════════════════════════════════════════════════
export const petsService = {
  async createPet(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreatePetReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => petsClient.createPet(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getPetByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => petsClient.getPetByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listMyPets(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => petsClient.listMyPets(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updatePet(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.UpdatePetReq();
    req.setId(id);
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => petsClient.updatePet(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deletePet(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => petsClient.deletePet(buildIdRequest(id, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Household Kids Service (proto: createHouseholdKid, getHouseholdKid,
//   listHouseholdKids, updateHouseholdKid, deleteHouseholdKid)
// ══════════════════════════════════════════════════════════════════════════
export const householdKidsService = {
  async createHouseholdKid(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateHouseholdKidReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => householdKidsClient.createHouseholdKid(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHouseholdKid(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => householdKidsClient.getHouseholdKid(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listHouseholdKids(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => householdKidsClient.listHouseholdKids(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateHouseholdKid(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.UpdateHouseholdKidReq();
    req.setId(id);
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => householdKidsClient.updateHouseholdKid(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteHouseholdKid(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => householdKidsClient.deleteHouseholdKid(buildIdRequest(id, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Househelp Preferences Service (proto: createHousehelpPreference,
//   getHousehelpPreference, listHousehelpPreferences, updateHousehelpPreference,
//   deleteHousehelpPreference, addChores, updateBudget, updateAvailability)
// ══════════════════════════════════════════════════════════════════════════
export const househelpPreferencesService = {
  async createHousehelpPreference(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.createHousehelpPreference(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHousehelpPreference(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.getHousehelpPreference(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listHousehelpPreferences(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.listHousehelpPreferences(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateHousehelpPreference(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.updateHousehelpPreference(buildUpdateByIdPayload(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteHousehelpPreference(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => househelpPrefsClient.deleteHousehelpPreference(buildIdRequest(id, userId), getMetadata(), cb));
  },
  async addChores(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.addChores(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateBudget(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.updateBudget(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateAvailability(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => househelpPrefsClient.updateAvailability(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Household Preferences Service (proto: updateBudget, updateHouseSize)
// ══════════════════════════════════════════════════════════════════════════
export const householdPreferencesService = {
  async updateBudget(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.HouseholdPrefReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => householdPrefsClient.updateBudget(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateHouseSize(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.HouseholdPrefReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => householdPrefsClient.updateHouseSize(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Household Member Service (proto: validateInviteCode, getOrCreateInvitationCode,
//   createInvitation, listInvitations, revokeInvitation, joinHousehold,
//   getJoinRequestStatus, listPendingRequests, approveRequest, rejectRequest,
//   listMembers, updateMemberRole, removeMember, transferOwnership,
//   getUserHouseholds, leaveHousehold)
// ══════════════════════════════════════════════════════════════════════════
export const householdMemberService = {
  async validateInviteCode(code: string): Promise<any> {
    const req = new auth_pb.StringFieldRequest();
    req.setValue(code);
    const res = await grpcCall((cb) => householdMemberClient.validateInviteCode(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getOrCreateInvitationCode(householdId: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => householdMemberClient.getOrCreateInvitationCode(buildIdRequest(householdId, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async joinHousehold(userId: string, inviteCode: string, message?: string): Promise<any> {
    const req = new auth_pb.JoinHouseholdReq();
    req.setUserId(resolveUserId(userId));
    req.setInviteCode(inviteCode);
    if (message) req.setMessage(message);
    const res = await grpcCall((cb) => householdMemberClient.joinHousehold(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getJoinRequestStatus(userId: string): Promise<any> {
    const res = await grpcCall((cb) => householdMemberClient.getJoinRequestStatus(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listPendingRequests(householdId: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => householdMemberClient.listPendingRequests(buildIdRequest(householdId, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async approveRequest(householdId: string, requestId: string, userId: string): Promise<any> {
    const req = new auth_pb.ApproveRejectReq();
    req.setHouseholdId(householdId);
    req.setRequestId(requestId);
    req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => householdMemberClient.approveRequest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async rejectRequest(householdId: string, requestId: string, userId: string): Promise<any> {
    const req = new auth_pb.ApproveRejectReq();
    req.setHouseholdId(householdId);
    req.setRequestId(requestId);
    req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => householdMemberClient.rejectRequest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listMembers(householdId: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => householdMemberClient.listMembers(buildIdRequest(householdId, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async removeMember(householdId: string, memberUserId: string, userId: string): Promise<void> {
    const req = new auth_pb.RemoveMemberReq();
    req.setHouseholdId(householdId);
    req.setMemberUserId(memberUserId);
    req.setUserId(resolveUserId(userId));
    await grpcCall((cb) => householdMemberClient.removeMember(req, getMetadata(), cb));
  },
  async getUserHouseholds(userId: string): Promise<any> {
    const res = await grpcCall((cb) => householdMemberClient.getUserHouseholds(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async leaveHousehold(householdId: string, userId?: string): Promise<void> {
    await grpcCall((cb) => householdMemberClient.leaveHousehold(buildIdRequest(householdId, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Profile View Service (proto: recordView, getAnalytics, updateViewDuration, getProfileViews)
// ══════════════════════════════════════════════════════════════════════════
export const profileViewService = {
  async recordView(userId: string, profileId: string, profileType: string): Promise<any> {
    const req = new auth_pb.RecordViewReq();
    req.setViewerUserId(resolveUserId(userId));
    req.setProfileId(profileId);
    req.setProfileType(profileType);
    const res: any = await grpcCall((cb) => profileViewClient.recordView(req, getMetadata(), cb));
    return {
      viewId: res?.getViewId?.() ?? '',
      isUnique: res?.getIsUnique?.() ?? true,
    };
  },
  async getAnalytics(profileId: string, profileType: string): Promise<any> {
    const req = new auth_pb.GetAnalyticsReq();
    req.setProfileId(profileId);
    req.setProfileType(profileType);
    const res = await grpcCall((cb) => profileViewClient.getAnalytics(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateViewDuration(viewId: string, duration: number): Promise<void> {
    const req = new auth_pb.UpdateViewDurationReq();
    req.setViewId(viewId);
    req.setDuration(duration);
    await grpcCall((cb) => profileViewClient.updateViewDuration(req, getMetadata(), cb));
  },
  async getProfileViews(profileId: string, limit = 20, offset = 0): Promise<any> {
    const req = new auth_pb.GetProfileViewsReq();
    req.setProfileId(profileId);
    req.setLimit(limit);
    req.setOffset(offset);
    const res = await grpcCall((cb) => profileViewClient.getProfileViews(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Preferences Service (proto: getPreferences, updatePreferences, deletePreferences)
// ══════════════════════════════════════════════════════════════════════════
export const preferencesService = {
  async getPreferences(userId: string, sessionId?: string): Promise<any> {
    const req = new auth_pb.PreferencesReq();
    req.setUserId(resolveUserId(userId));
    if (sessionId) req.setSessionId(sessionId);
    const res = await grpcCall((cb) => preferencesClient.getPreferences(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updatePreferences(userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => preferencesClient.updatePreferences(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deletePreferences(userId: string, sessionId?: string): Promise<void> {
    const req = new auth_pb.PreferencesReq();
    req.setUserId(resolveUserId(userId));
    if (sessionId) req.setSessionId(sessionId);
    await grpcCall((cb) => preferencesClient.deletePreferences(req, getMetadata(), cb));
  },
  async migrateAnonymousToUser(userId: string, sessionId: string): Promise<any> {
    const req = new auth_pb.MigratePrefsReq();
    req.setUserId(resolveUserId(userId));
    req.setSessionId(sessionId);
    const res = await grpcCall((cb) => preferencesClient.migrateAnonymousToUser(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Onboarding Options Service (proto: getLanguages, getSkills, getChores,
//   getAllOptions, getOnboardingSteps, etc.)
// ══════════════════════════════════════════════════════════════════════════
export const onboardingOptionsService = {
  async getAllOptions(profileType: string): Promise<any> {
    const req = new auth_pb.ProfileTypeRequest();
    req.setProfileType(profileType);
    const res = await grpcCall((cb) => onboardingOptionsClient.getAllOptions(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getOnboardingSteps(profileType: string): Promise<any> {
    const req = new auth_pb.ProfileTypeRequest();
    req.setProfileType(profileType);
    const res = await grpcCall((cb) => onboardingOptionsClient.getOnboardingSteps(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getSalaryRanges(frequency: string): Promise<any> {
    const req = new auth_pb.SalaryFrequencyRequest();
    req.setFrequency(frequency);
    const res = await grpcCall((cb) => onboardingOptionsClient.getSalaryRanges(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Contact Service (proto: createContactMessage, getContactMessages, getContactMessageByID)
// ══════════════════════════════════════════════════════════════════════════
export const contactService = {
  async createContactMessage(userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => contactClient.createContactMessage(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getContactMessages(limit = 20, offset = 0): Promise<any> {
    const res = await grpcCall((cb) => contactClient.getContactMessages(buildListRequest(limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getContactMessageByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => contactClient.getContactMessageByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// KYC Service (proto: submitKYC, getMyKYC, getKYCByID)
// ══════════════════════════════════════════════════════════════════════════
export const kycService = {
  async submitKYC(userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => kycClient.submitKYC(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getMyKYC(userId: string): Promise<any> {
    const res = await grpcCall((cb) => kycClient.getMyKYC(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Hire Request Service
// ══════════════════════════════════════════════════════════════════════════
export const hireRequestService = {
  async createHireRequest(userId: string, profileType: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateHireRequestReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => hireRequestClient.createHireRequest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHireRequest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireRequestClient.getHireRequest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listHireRequests(userId: string, profileType: string, status?: string): Promise<any> {
    const req = new auth_pb.ListHireRequestsReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    if (status) req.setStatus(status);
    const res = await grpcCall((cb) => hireRequestClient.listHireRequests(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async acceptHireRequest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireRequestClient.acceptHireRequest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async declineHireRequest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireRequestClient.declineHireRequest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async cancelHireRequest(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => hireRequestClient.cancelHireRequest(buildIdRequest(id, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Hire Contract Service
// ══════════════════════════════════════════════════════════════════════════
export const hireContractService = {
  async createFromHireRequest(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.CreateContractReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => hireContractClient.createFromHireRequest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHireContract(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireContractClient.getHireContract(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listHireContracts(userId: string, profileType: string, status?: string): Promise<any> {
    const req = new auth_pb.ListHireContractsReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(profileType);
    if (status) req.setStatus(status);
    const res = await grpcCall((cb) => hireContractClient.listHireContracts(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async completeHireContract(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireContractClient.completeHireContract(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async terminateHireContract(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireContractClient.terminateHireContract(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Employment Service (proto: listByHousehold, listByHousehelp, hire, terminate, etc.)
// ══════════════════════════════════════════════════════════════════════════
export const employmentService = {
  async listByHousehold(userId: string, limit = 20, offset = 0): Promise<any> {
    const req = new auth_pb.PaginatedUserRequest();
    req.setUserId(resolveUserId(userId));
    req.setLimit(limit);
    req.setOffset(offset);
    const res = await grpcCall((cb) => employmentClient.listByHousehold(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listByHousehelp(userId: string, limit = 20, offset = 0): Promise<any> {
    const req = new auth_pb.PaginatedUserRequest();
    req.setUserId(resolveUserId(userId));
    req.setLimit(limit);
    req.setOffset(offset);
    const res = await grpcCall((cb) => employmentClient.listByHousehelp(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getCurrentStatus(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => employmentClient.getCurrentStatus(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getLatestByProfileID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => employmentClient.getLatestByProfileID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Hire Negotiation Service (proto: addNegotiationMessage, listNegotiations)
// ══════════════════════════════════════════════════════════════════════════
export const hireNegotiationService = {
  async addNegotiationMessage(userId: string, data: Record<string, any>): Promise<void> {
    const req = new auth_pb.AddNegotiationReq();
    req.setUserId(resolveUserId(userId));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    await grpcCall((cb) => hireNegotiationClient.addNegotiationMessage(req, getMetadata(), cb));
  },
  async listNegotiations(userId: string, hireRequestId: string): Promise<any> {
    const req = new auth_pb.ListNegotiationsReq();
    req.setUserId(resolveUserId(userId));
    req.setHireRequestId(hireRequestId);
    const res = await grpcCall((cb) => hireNegotiationClient.listNegotiations(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Employment Contract Service (proto: createEmploymentContract, getEmploymentContract,
//   updateEmploymentContract, deleteEmploymentContract, listEmploymentContracts,
//   signByHousehold, signByHousehelp, forwardToHousehelp, getDefaultClauses)
// ══════════════════════════════════════════════════════════════════════════
export const employmentContractService = {
  async createEmploymentContract(userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => employmentContractClient.createEmploymentContract(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getEmploymentContract(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => employmentContractClient.getEmploymentContract(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateEmploymentContract(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => employmentContractClient.updateEmploymentContract(buildUpdateByIdPayload(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteEmploymentContract(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => employmentContractClient.deleteEmploymentContract(buildIdRequest(id, userId), getMetadata(), cb));
  },
  async listEmploymentContracts(userId: string, status?: string, limit = 20, offset = 0): Promise<any> {
    const req = new auth_pb.ListEmploymentContractsReq();
    req.setUserId(resolveUserId(userId));
    if (status) req.setStatus(status);
    req.setLimit(limit);
    req.setOffset(offset);
    const res = await grpcCall((cb) => employmentContractClient.listEmploymentContracts(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async signByHousehold(id: string, userId: string, signature: string, signerName: string): Promise<any> {
    const req = new auth_pb.SignContractReq();
    req.setId(id);
    req.setUserId(resolveUserId(userId));
    req.setSignature(signature);
    req.setSignerName(signerName);
    const res = await grpcCall((cb) => employmentContractClient.signByHousehold(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async signByHousehelp(id: string, userId: string, signature: string, signerName: string): Promise<any> {
    const req = new auth_pb.SignContractReq();
    req.setId(id);
    req.setUserId(resolveUserId(userId));
    req.setSignature(signature);
    req.setSignerName(signerName);
    const res = await grpcCall((cb) => employmentContractClient.signByHousehelp(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async forwardToHousehelp(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => employmentContractClient.forwardToHousehelp(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getDefaultClauses(): Promise<any> {
    let req: any;
    try { const { Empty } = require('google-protobuf/google/protobuf/empty_pb'); req = new Empty(); } catch { req = {}; }
    const res = await grpcCall((cb) => employmentContractClient.getDefaultClauses(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Bureau Service
// ══════════════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════════════
// Waitlist Service (proto: createWaitlist, getAllWaitlists, getWaitlistByID)
// ══════════════════════════════════════════════════════════════════════════
export const waitlistService = {
  async createWaitlist(userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => waitlistClient.createWaitlist(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getAllWaitlists(limit = 20, offset = 0): Promise<any> {
    const res = await grpcCall((cb) => waitlistClient.getAllWaitlists(buildListRequest(limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getWaitlistByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => waitlistClient.getWaitlistByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
};

export const bureauService = {
  async getCurrentBureauProfile(userId: string): Promise<any> {
    return grpcCall((cb) => bureauClient.getCurrentBureauProfile(buildUserIdRequest(userId), getMetadata(), cb));
  },
  async getBureau(id: string, userId?: string): Promise<any> {
    return grpcCall((cb) => bureauClient.getBureau(buildIdRequest(id, userId), getMetadata(), cb));
  },
};
