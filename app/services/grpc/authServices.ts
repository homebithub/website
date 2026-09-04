/**
 * Auth Sub-Services - gRPC-Web Clients
 * 
 * Wrappers for all auth sub-services (profile, preferences, pets, kids, etc.)
 * Method names match the proto RPC definitions in auth.proto exactly (camelCase).
 */

import * as auth_grpc_web_module from '~/grpc/generated/auth/auth_grpc_web_pb';
import * as auth_pb_module from '~/grpc/generated/auth/auth_pb';
import * as client_profile_grpc_web_module from '~/grpc/generated/client_profile/client_profile_grpc_web_pb';
import * as client_profile_pb_module from '~/grpc/generated/client_profile/client_profile_pb';
import * as catalog_profile_grpc_web_module from '~/grpc/generated/profile/profile_grpc_web_pb';
import * as catalog_profile_pb_module from '~/grpc/generated/profile/profile_pb';
import * as user_profile_grpc_web_module from '~/grpc/generated/profile/user_profile_grpc_web_pb';
import * as user_profile_pb_module from '~/grpc/generated/profile/user_profile_pb';
import * as shared_pb_module from '~/grpc/generated/shared/shared_pb';
import * as empty_pb_module from 'google-protobuf/google/protobuf/empty_pb.js';
import * as struct_pb from 'google-protobuf/google/protobuf/struct_pb.js';
import * as grpcWeb from 'grpc-web';
import { AUTH_GRPC_WEB_BASE_URL, GRPC_WEB_BASE_URL, handleGrpcError, callWithAuthRetry } from './client';
import {
  getStoredAccessToken,
  getStoredCanonicalProfileType,
  getStoredUserId,
  getStoredUserProfileId,
} from '~/utils/authStorage';
import { notifyProfileProgressChanged } from '~/utils/profileProgress';
import { normalizeProfileType } from '~/utils/profileType';

const auth_pb = (auth_pb_module as any).default ?? auth_pb_module;
const client_profile_pb = (client_profile_pb_module as any).default ?? client_profile_pb_module;
const catalog_profile_pb = (catalog_profile_pb_module as any).default ?? catalog_profile_pb_module;
const user_profile_pb = (user_profile_pb_module as any).default ?? user_profile_pb_module;
const shared_pb = (shared_pb_module as any).default ?? shared_pb_module;
const empty_pb = (empty_pb_module as any).default ?? empty_pb_module;
const {
  ProfileServiceClient,
  ShortlistServiceClient,
  InterestServiceClient,
  ReviewServiceClient,
  LocationServiceClient,
  ImageServiceClient,
  DocumentServiceClient,
  PetsServiceClient,
  HouseholdKidsServiceClient,
  ServiceProviderPreferencesServiceClient,
  HouseholdPreferencesServiceClient,
  HouseholdMemberServiceClient,
  ProfileViewServiceClient,
  PreferencesServiceClient,
  TourServiceClient,
  OnboardingOptionsServiceClient,
  ContactServiceClient,
  KYCServiceClient,
  HireRequestServiceClient,
  HireContractServiceClient,
  HireNegotiationServiceClient,
  EmploymentServiceClient,
  EmploymentContractServiceClient,
  OpenForWorkServiceClient,
  BureauServiceClient,
  WaitlistServiceClient,
} = auth_grpc_web_module as any;
const { ClientProfileServiceClient } = client_profile_grpc_web_module as any;
const { ProfileServiceClient: CatalogProfileServiceClient } = catalog_profile_grpc_web_module as any;
const { UserProfileServiceClient } = user_profile_grpc_web_module as any;

function getMetadata(): { [key: string]: string } {
  const md: { [key: string]: string } = {};
  const token = getStoredAccessToken();
  if (token) md['authorization'] = `Bearer ${token}`;
  const profileType = normalizeProfileType(getStoredCanonicalProfileType());
  if (profileType) md['x-profile-type'] = profileType;
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

function genericResponseToJs(response: any): any {
  if (!response) return null;
  const struct = response.getBody?.();
  if (struct && struct.toJavaScript) {
    return struct.toJavaScript();
  }
  return response;
}

function dataEnvelope(response: any, ...arrayKeys: string[]): { data: any } {
  const payload = genericResponseToJs(response);
  if (!payload || typeof payload !== 'object') return { data: payload };
  if (Array.isArray(payload)) return { data: payload };

  const record = payload as Record<string, any>;
  for (const key of ['data', ...arrayKeys]) {
    if (Array.isArray(record[key])) return { data: record[key] };
  }
  return { data: record.data ?? payload };
}

function normalizeArray(value: unknown): Record<string, any>[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is Record<string, any> => Boolean(item) && typeof item === 'object');
  }
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, any>;
  for (const key of ['data', 'items', 'features', 'listings', 'applications', 'job_types']) {
    if (Array.isArray(record[key])) return normalizeArray(record[key]);
  }
  return [];
}

function extractListingId(value: unknown): number {
  if (!value || typeof value !== 'object') return 0;
  const record = value as Record<string, any>;
  const nested = record.data && typeof record.data === 'object' ? record.data as Record<string, any> : {};
  return Number(record.id || record.listing_id || record.listingId || nested.id || nested.listing_id || nested.listingId || 0);
}

function featureID(value: Record<string, any>): number {
  const feature = value.feature && typeof value.feature === 'object' ? value.feature as Record<string, any> : {};
  return Number(value.feature_id || value.featureId || feature.id || 0);
}

function propertyID(value: Record<string, any>): number {
  const property = value.property && typeof value.property === 'object' ? value.property as Record<string, any> : {};
  return Number(value.feature_property_id || value.featurePropertyId || value.property_id || value.propertyId || property.id || 0);
}

function displayName(value: unknown, fallback: string): string {
  if (!value || typeof value !== 'object') return fallback;
  const record = value as Record<string, any>;
  return String(record.name || record.title || record.description || fallback);
}

function groupListingFeatures(rows: Record<string, any>[], bundles: Record<string, any>[]) {
  const featureNames = new Map<number, string>();
  const propertyNames = new Map<number, string>();

  for (const bundle of bundles) {
    const id = featureID(bundle);
    if (id) featureNames.set(id, displayName(bundle.feature, displayName(bundle, `Feature #${id}`)));

    for (const property of normalizeArray(bundle.properties || bundle.feature_properties || bundle.options)) {
      const pid = propertyID(property);
      if (pid) propertyNames.set(pid, displayName(property, `Property #${pid}`));
    }
  }

  const groups = new Map<number, { feature_id: number; feature_name: string; properties: string[] }>();
  for (const row of rows) {
    const fid = featureID(row);
    const pid = propertyID(row);
    if (!fid && !pid && !row.value) continue;

    const rowFeature = row.feature && typeof row.feature === 'object' ? row.feature as Record<string, any> : null;
    const rowProperty = row.property && typeof row.property === 'object' ? row.property as Record<string, any> : null;
    const featureName = featureNames.get(fid) || displayName(rowFeature, fid ? `Feature #${fid}` : 'Feature');
    const propertyName = String(row.value || propertyNames.get(pid) || displayName(rowProperty, pid ? `Property #${pid}` : 'Value'));
    const group = groups.get(fid) || { feature_id: fid, feature_name: featureName, properties: [] };
    if (propertyName && !group.properties.includes(propertyName)) group.properties.push(propertyName);
    groups.set(fid, group);
  }
  return Array.from(groups.values()).filter((group) => group.properties.length > 0);
}

function buildFeaturePickInput(feature: Record<string, any>): any {
  const input = new client_profile_pb.FeaturePickInput();
  input.setFeatureId(Number(feature.feature_id || feature.featureId || 0));
  const propertyIds = Array.isArray(feature.property_ids)
    ? feature.property_ids
    : Array.isArray(feature.propertyIds)
      ? feature.propertyIds
      : [];
  input.setPropertyIdsList(propertyIds.map((id: unknown) => Number(id)).filter((id: number) => Number.isFinite(id) && id > 0));
  input.setWeight(Number(feature.weight || 1));
  input.setValue(String(feature.value || ''));
  return input;
}

function verificationInfoToJs(verification: any): any {
  if (!verification) return null;
  return {
    id: verification.getId?.() || '',
    user_id: verification.getUserId?.() || '',
    type: verification.getType?.() || '',
    status: verification.getStatus?.() || '',
    target: verification.getTarget?.() || '',
    expires_at: verification.getExpiresAt?.()?.toDate?.()?.toISOString?.() || '',
    next_resend_at: verification.getNextResendAt?.()?.toDate?.()?.toISOString?.() || '',
    attempts: verification.getAttempts?.() ?? 0,
    max_attempts: verification.getMaxAttempts?.() ?? 0,
    resends: verification.getResends?.() ?? 0,
    max_resends: verification.getMaxResends?.() ?? 0,
    created_at: verification.getCreatedAt?.()?.toDate?.()?.toISOString?.() || '',
    updated_at: verification.getUpdatedAt?.()?.toDate?.()?.toISOString?.() || '',
  };
}

function bureauResponseToJs(response: any): any {
  if (!response) return null;
  const struct = response.getData?.();
  if (struct && struct.toJavaScript) {
    return struct.toJavaScript();
  }
  return response;
}

function bureauServiceProviderLinkResponseToJs(response: any): any {
  if (!response) return null;

  const linkRequest = response.getLinkRequest?.();
  const serviceProvider = response.getServiceProvider?.() || response.getHousehelp?.();
  const serviceProviderUserId = linkRequest?.getServiceProviderUserId?.()
    || linkRequest?.getHousehelpUserId?.()
    || '';
  const serviceProviderProfileId = linkRequest?.getServiceProviderProfileId?.()
    || linkRequest?.getHousehelpProfileId?.()
    || '';
  const provider = serviceProvider ? {
    user_id: serviceProvider.getUserId?.() || '',
    profile_id: serviceProvider.getProfileId?.() || '',
    first_name: serviceProvider.getFirstName?.() || '',
    last_name: serviceProvider.getLastName?.() || '',
    phone: serviceProvider.getPhone?.() || '',
    bureau_id: serviceProvider.getBureauId?.() || '',
  } : null;

  return {
    message: response.getMessage?.() || '',
    link_request: linkRequest ? {
      id: linkRequest.getId?.() || '',
      bureau_id: linkRequest.getBureauId?.() || '',
      service_provider_user_id: serviceProviderUserId,
      service_provider_profile_id: serviceProviderProfileId,
      // Deprecated response aliases keep older bureau components deployable.
      househelp_user_id: serviceProviderUserId,
      househelp_profile_id: serviceProviderProfileId,
      phone: linkRequest.getPhone?.() || '',
      status: linkRequest.getStatus?.() || '',
      expires_at: linkRequest.getExpiresAt?.()?.toDate?.()?.toISOString?.() || '',
      verified_at: linkRequest.getVerifiedAt?.()?.toDate?.()?.toISOString?.() || '',
      created_at: linkRequest.getCreatedAt?.()?.toDate?.()?.toISOString?.() || '',
      updated_at: linkRequest.getUpdatedAt?.()?.toDate?.()?.toISOString?.() || '',
    } : null,
    verification: verificationInfoToJs(response.getVerification?.()),
    service_provider: provider,
    househelp: provider,
  };
}

// ── Helper: generic gRPC call wrapper ──────────────────────────────────
// Renews the session once and retries when the server says the token has
// expired, rather than surfacing "please sign in again" to somebody holding a
// perfectly good refresh token.
const grpcCall = callWithAuthRetry;

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
const serviceProviderPrefsClient = new ServiceProviderPreferencesServiceClient(GRPC_WEB_BASE_URL, null, null);
const householdPrefsClient = new HouseholdPreferencesServiceClient(GRPC_WEB_BASE_URL, null, null);
const householdMemberClient = new HouseholdMemberServiceClient(GRPC_WEB_BASE_URL, null, null);
const profileViewClient = new ProfileViewServiceClient(GRPC_WEB_BASE_URL, null, null);
const preferencesClient = new PreferencesServiceClient(GRPC_WEB_BASE_URL, null, null);
const tourClient = new TourServiceClient(GRPC_WEB_BASE_URL, null, null);
const onboardingOptionsClient = new OnboardingOptionsServiceClient(GRPC_WEB_BASE_URL, null, null);
const contactClient = new ContactServiceClient(GRPC_WEB_BASE_URL, null, null);
const kycClient = new KYCServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireRequestClient = new HireRequestServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireContractClient = new HireContractServiceClient(GRPC_WEB_BASE_URL, null, null);
const hireNegotiationClient = new HireNegotiationServiceClient(GRPC_WEB_BASE_URL, null, null);
const employmentClient = new EmploymentServiceClient(GRPC_WEB_BASE_URL, null, null);
const employmentContractClient = new EmploymentContractServiceClient(GRPC_WEB_BASE_URL, null, null);
const openForWorkClient = new OpenForWorkServiceClient(GRPC_WEB_BASE_URL, null, null);
const bureauClient = new BureauServiceClient(GRPC_WEB_BASE_URL, null, null);
const waitlistClient = new WaitlistServiceClient(GRPC_WEB_BASE_URL, null, null);
const clientProfileClient = new ClientProfileServiceClient(GRPC_WEB_BASE_URL, null, null);
const catalogProfileClient = new CatalogProfileServiceClient(AUTH_GRPC_WEB_BASE_URL, null, null);
const userProfileClient = new UserProfileServiceClient(AUTH_GRPC_WEB_BASE_URL, null, null);

const methodDescriptorProfileServiceListProfiles = new (grpcWeb as any).MethodDescriptor(
  '/profile.ProfileService/ListProfiles',
  (grpcWeb as any).MethodType.UNARY,
  empty_pb.Empty,
  shared_pb.GenericResponse,
  (request: any) => request.serializeBinary(),
  shared_pb.GenericResponse.deserializeBinary
);

// ── Helper: resolve userId from stored user data when not provided ────
function resolveUserId(userId: string): string {
  if (userId) return userId;
  return getStoredUserId();
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
  if (profileType) req.setProfileType(normalizeProfileType(profileType));
  return req;
}

function buildJsonPayload(userId: string, data: Record<string, any>, profileType?: string): any {
  const req = new auth_pb.JsonPayload();
  const resolved = resolveUserId(userId);
  if (resolved) req.setUserId(resolved);
  if (profileType) req.setProfileType(normalizeProfileType(profileType));
  const struct = toStruct(data);
  if (struct) req.setData(struct);

  console.groupCollapsed("[WAITLIST_DEBUG] JsonPayload build");
  console.log("[WAITLIST_DEBUG] input userId", userId);
  console.log("[WAITLIST_DEBUG] resolved userId", resolved);
  console.log("[WAITLIST_DEBUG] profileType", profileType);
  console.log("[WAITLIST_DEBUG] data", data);
  console.log("[WAITLIST_DEBUG] request object", typeof req.toObject === "function" ? req.toObject(false) : req);
  console.groupEnd();

  return req;
}

function buildPublicJsonPayload(data: Record<string, any>, profileType?: string): any {
  const req = new auth_pb.JsonPayload();
  const resolvedProfileType = normalizeProfileType(
    profileType || (typeof data?.profile_type === "string" ? data.profile_type : ""),
  );
  if (resolvedProfileType) req.setProfileType(resolvedProfileType);
  const struct = toStruct(data);
  if (struct) req.setData(struct);

  console.groupCollapsed("[WAITLIST_DEBUG] Public JsonPayload build");
  console.log("[WAITLIST_DEBUG] profileType", resolvedProfileType);
  console.log("[WAITLIST_DEBUG] data", data);
  console.log("[WAITLIST_DEBUG] request object", typeof req.toObject === "function" ? req.toObject(false) : req);
  console.groupEnd();

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
  req.setProfileType(normalizeProfileType(profileType));
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
  req.setProfileType(normalizeProfileType(profileType));
  
  // Merge limit and offset into filters
  const allFilters = {
    ...(filters || {}),
    ...(limit !== undefined ? { limit } : {}),
    ...(offset !== undefined ? { offset } : {}),
  };
  
  if (Object.keys(allFilters).length > 0) {
    const struct = toStruct(allFilters);
    if (struct) req.setFilters(struct);
  }
  return req;
}

function buildListRequest(limit = 20, offset = 0, userProfileId = '', status = ''): any {
  const req = new auth_pb.ListRequest();
  req.setLimit(limit);
  req.setOffset(offset);
  if (userProfileId && typeof req.setUserProfileId === 'function') req.setUserProfileId(userProfileId);
  if (status && typeof req.setStatus === 'function') req.setStatus(status);
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
    notifyProfileProgressChanged();
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
  async getCurrentServiceProviderProfile(userId: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getCurrentServiceProviderProfile(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getServiceProviderByID(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getServiceProviderByID(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getServiceProviderByUserID(userId: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getServiceProviderByUserID(buildUserIdRequest(userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getServiceProviderProfileWithUser(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getServiceProviderProfileWithUser(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchServiceProviderByPhone(phone: string): Promise<any> {
    const req = new auth_pb.PhoneRequest();
    req.setPhone(phone);
    const res = await grpcCall((cb) => profileClient.searchServiceProviderByPhone(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getServiceProvidersByBureau(bureauId: string, limit: number = 20, offset: number = 0): Promise<any> {
    const req = new auth_pb.GetByBureauRequest();
    req.setBureauId(bureauId);
    req.setLimit(limit);
    req.setOffset(offset);
    const res = await grpcCall((cb) => profileClient.getServiceProvidersByBureau(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchServiceProviders(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number): Promise<any> {
    const res = await grpcCall((cb) => profileClient.searchServiceProviders(buildSearchRequest(userId, profileType, filters, limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async countServiceProviders(userId: string, profileType: string, filters?: Record<string, any>): Promise<number> {
    const res: any = await grpcCall((cb) => profileClient.countServiceProviders(buildSearchRequest(userId, profileType, filters), getMetadata(), cb));
    return res?.getCount?.() ?? 0;
  },
  async getPopularServiceProviders(): Promise<any> {
    const res = await grpcCall((cb) => profileClient.getPopularServiceProviders(new empty_pb.Empty(), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchMultipleWithUser(userId: string, profileType: string, filters?: Record<string, any>, limit?: number, offset?: number): Promise<any> {
    const res = await grpcCall((cb) => profileClient.searchMultipleWithUser(buildSearchRequest(userId, profileType, filters, limit, offset), getMetadata(), cb));
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
  async updateServiceProviderFields(userId: string, profileType: string, updates: Record<string, any>, stepMetadata?: Record<string, any>): Promise<any> {
    const req = new auth_pb.UpdateServiceProviderFieldsRequest();
    req.setUserId(resolveUserId(userId || ''));
    req.setProfileType(normalizeProfileType(profileType));
    const updatesStruct = toStruct(updates);
    if (updatesStruct) req.setUpdates(updatesStruct);
    if (stepMetadata) {
      const metaStruct = toStruct(stepMetadata);
      if (metaStruct) req.setStepMetadata(metaStruct);
    }
    const res = await grpcCall((cb) => profileClient.updateServiceProviderFields(req, getMetadata(), cb));
    notifyProfileProgressChanged();
    return jsonResponseToJs(res);
  },
  async saveUserLocation(userId: string, data: Record<string, any>): Promise<any> {
    const req = new auth_pb.SaveUserLocationRequest();
    req.setUserId(resolveUserId(userId || ''));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => profileClient.saveUserLocation(req, getMetadata(), cb));
    notifyProfileProgressChanged();
    return jsonResponseToJs(res);
  },
  async getProfileDocuments(userId: string, profileType: string): Promise<any> {
    const req = new auth_pb.GetProfileDocumentsRequest();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(normalizeProfileType(profileType));
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
    req.setProfileType(normalizeProfileType(profileType));
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
    const res: any = await grpcCall((cb) => shortlistClient.shortlistExists(req, getMetadata(), cb));
    return {
      exists: !!(res?.getValue?.() ?? res?.getExists?.()),
      value: !!(res?.getValue?.() ?? res?.getExists?.()),
    };
  },
  // Legacy compatibility wrapper. Shortlists no longer enforce lock-based access.
  async unlockShortlist(userId: string, profileId: string): Promise<{ unlocked: boolean; phone?: string; email?: string }> {
    const req = new auth_pb.ShortlistUnlockReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileId(profileId);
    const res: any = await grpcCall((cb) => shortlistClient.unlockShortlist(req, getMetadata(), cb));
    return {
      unlocked: !!res?.getUnlocked?.(),
      phone: res?.getPhone?.() || undefined,
      email: res?.getEmail?.() || undefined,
    };
  },
  // Legacy compatibility wrapper. Shortlists no longer enforce lock-based access.
  async getUnlockedContact(userId: string, profileId: string): Promise<{ unlocked: boolean; phone?: string; email?: string }> {
    const req = new auth_pb.ShortlistUnlockReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileId(profileId);
    const res: any = await grpcCall((cb) => shortlistClient.getUnlockedContact(req, getMetadata(), cb));
    return {
      unlocked: !!res?.getUnlocked?.(),
      phone: res?.getPhone?.() || undefined,
      email: res?.getEmail?.() || undefined,
    };
  },
  async getShortlistCount(userId: string, profileType?: string): Promise<any> {
    const res: any = await grpcCall((cb) => shortlistClient.getShortlistCount(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return { count: Number(res?.getCount?.() ?? 0) };
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Interest Service (proto: createInterest, getInterest, deleteInterest,
//   listByHousehold, listByServiceProvider, interestExists, getInterestCount,
//   markViewed, acceptInterest, declineInterest)
// ══════════════════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════════
// Review Service
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
  async getServiceProviderReviews(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => reviewClient.getServiceProviderReviews(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHouseholdReviews(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => reviewClient.getHouseholdReviews(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getServiceProviderAverageRating(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => reviewClient.getServiceProviderAverageRating(buildIdRequest(id, userId), getMetadata(), cb));
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
  // Walking the hierarchy, for the cascading picker. Search alone assumed the
  // user knew the name of their ward; these let the UI lead them down from a
  // county, which everyone knows.
  async listCounties(): Promise<any> {
    const req = new auth_pb.LocationLevelReq();
    const res = await grpcCall((cb) => locationClient.listCounties(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listSubcounties(countyId: number): Promise<any> {
    const req = new auth_pb.LocationLevelReq();
    req.setCountyId(countyId);
    const res = await grpcCall((cb) => locationClient.listSubcounties(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listWards(subcountyId: number): Promise<any> {
    const req = new auth_pb.LocationLevelReq();
    req.setSubcountyId(subcountyId);
    const res = await grpcCall((cb) => locationClient.listWards(req, getMetadata(), cb));
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
// Service Provider Preferences Service
// ══════════════════════════════════════════════════════════════════════════
export const serviceProviderPreferencesService = {
  async createServiceProviderPreference(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.createServiceProviderPreference(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getServiceProviderPreference(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.getServiceProviderPreference(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listServiceProviderPreferences(userId: string, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.listServiceProviderPreferences(buildUserIdRequest(userId, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateServiceProviderPreference(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.updateServiceProviderPreference(buildUpdateByIdPayload(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteServiceProviderPreference(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => serviceProviderPrefsClient.deleteServiceProviderPreference(buildIdRequest(id, userId), getMetadata(), cb));
  },
  async addChores(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.addChores(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateBudget(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.updateBudget(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateAvailability(userId: string, data: Record<string, any>, profileType?: string): Promise<any> {
    const res = await grpcCall((cb) => serviceProviderPrefsClient.updateAvailability(buildJsonPayload(userId, data, profileType), getMetadata(), cb));
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
  async createInvitation(householdId: string, data: Record<string, any>, userId?: string): Promise<any> {
    const req = new auth_pb.CreateInvitationReq();
    req.setHouseholdId(householdId);
    req.setUserId(resolveUserId(userId || ''));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => householdMemberClient.createInvitation(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listInvitations(householdId: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => householdMemberClient.listInvitations(buildIdRequest(householdId, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async revokeInvitation(householdId: string, invitationId: string, userId: string): Promise<void> {
    const req = new auth_pb.RevokeInvitationReq();
    req.setHouseholdId(householdId);
    req.setInvitationId(invitationId);
    req.setUserId(resolveUserId(userId));
    await grpcCall((cb) => householdMemberClient.revokeInvitation(req, getMetadata(), cb));
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
  async updateMemberRole(householdId: string, memberUserId: string, role: string, userId: string): Promise<any> {
    const req = new auth_pb.UpdateMemberRoleReq();
    req.setHouseholdId(householdId);
    req.setMemberUserId(memberUserId);
    req.setRole(role);
    req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => householdMemberClient.updateMemberRole(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async removeMember(householdId: string, memberUserId: string, userId: string): Promise<void> {
    const req = new auth_pb.RemoveMemberReq();
    req.setHouseholdId(householdId);
    req.setMemberUserId(memberUserId);
    req.setUserId(resolveUserId(userId));
    await grpcCall((cb) => householdMemberClient.removeMember(req, getMetadata(), cb));
  },
  async transferOwnership(householdId: string, newOwnerUserId: string, userId: string): Promise<any> {
    const req = new auth_pb.TransferOwnershipReq();
    req.setHouseholdId(householdId);
    req.setNewOwnerUserId(newOwnerUserId);
    req.setUserId(resolveUserId(userId));
    const res = await grpcCall((cb) => householdMemberClient.transferOwnership(req, getMetadata(), cb));
    return jsonResponseToJs(res);
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
    req.setProfileType(normalizeProfileType(profileType));
    const res: any = await grpcCall((cb) => profileViewClient.recordView(req, getMetadata(), cb));
    return {
      viewId: res?.getViewId?.() ?? '',
      isUnique: res?.getIsUnique?.() ?? true,
    };
  },
  async getAnalytics(profileId: string, profileType: string): Promise<any> {
    const req = new auth_pb.GetAnalyticsReq();
    req.setProfileId(profileId);
    req.setProfileType(normalizeProfileType(profileType));
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
// Guided tour progress and analytics events
// ══════════════════════════════════════════════════════════════════════════
export type TourEventType = 'started' | 'step_viewed' | 'completed' | 'skipped';
export type TourProgress = {
  seen: boolean;
  status?: 'started' | 'completed' | 'skipped';
  last_step?: number;
  total_steps?: number;
};

export const tourService = {
  async getProgress(userId: string, tourId: string, tourVersion: number): Promise<TourProgress> {
    const req = new auth_pb.TourProgressRequest();
    req.setUserId(resolveUserId(userId));
    req.setTourId(tourId);
    req.setTourVersion(tourVersion);
    const res = await grpcCall((cb) => tourClient.getProgress(req, getMetadata(), cb));
    return jsonResponseToJs(res) as TourProgress;
  },
  async recordEvent(input: {
    userId: string;
    tourId: string;
    tourVersion: number;
    eventType: TourEventType;
    stepIndex: number;
    totalSteps: number;
    pagePath: string;
  }): Promise<TourProgress> {
    const req = new auth_pb.RecordTourEventRequest();
    req.setUserId(resolveUserId(input.userId));
    req.setTourId(input.tourId);
    req.setTourVersion(input.tourVersion);
    req.setEventType(input.eventType);
    req.setStepIndex(input.stepIndex);
    req.setTotalSteps(input.totalSteps);
    req.setPagePath(input.pagePath);
    const res = await grpcCall((cb) => tourClient.recordEvent(req, getMetadata(), cb));
    return jsonResponseToJs(res) as TourProgress;
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Onboarding Options Service (proto: getLanguages, getSkills, getChores,
//   getAllOptions, getSalaryRanges)
// ══════════════════════════════════════════════════════════════════════════
export const onboardingOptionsService = {
  async getAllOptions(profileType: string): Promise<any> {
    const req = new auth_pb.ProfileTypeRequest();
    req.setProfileType(normalizeProfileType(profileType));
    const res = await grpcCall((cb) => onboardingOptionsClient.getAllOptions(req, getMetadata(), cb));
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
  async getSmileIDToken(userId: string, data: Record<string, any> = {}): Promise<any> {
    const res = await grpcCall((cb) => kycClient.getSmileIDToken(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async confirmSmileIDSubmission(userId: string): Promise<any> {
    const res = await grpcCall((cb) => kycClient.confirmSmileIDSubmission(buildUserIdRequest(userId), getMetadata(), cb));
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
    req.setProfileType(normalizeProfileType(profileType));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => hireRequestClient.createHireRequest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getHireRequest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireRequestClient.getHireRequest(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateHireRequest(id: string, data: Record<string, any>, userId?: string): Promise<any> {
    const req = new auth_pb.UpdateHireRequestReq();
    req.setId(id);
    req.setUserId(resolveUserId(userId || ''));
    const struct = toStruct(data);
    if (struct) req.setData(struct);
    const res = await grpcCall((cb) => hireRequestClient.updateHireRequest(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listHireRequests(userId: string, profileType: string, status?: string): Promise<any> {
    const req = new auth_pb.ListHireRequestsReq();
    req.setUserId(resolveUserId(userId));
    req.setProfileType(normalizeProfileType(profileType));
    if (status) req.setStatus(status);
    req.setLimit(50);
    req.setOffset(0);
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
  async finalizeHireRequest(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => hireRequestClient.finalizeHireRequest(buildIdRequest(id, userId), getMetadata(), cb));
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
    req.setProfileType(normalizeProfileType(String(data.profile_type || getStoredCanonicalProfileType() || 'household')));
    req.setHireRequestId(String(data.hire_request_id || data.application_id || data.id || ''));
    if (data.notes) req.setNotes(String(data.notes));
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
    req.setProfileType(normalizeProfileType(profileType));
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
// Employment Service
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
  async listByServiceProvider(userId: string, limit = 20, offset = 0): Promise<any> {
    const req = new auth_pb.PaginatedUserRequest();
    req.setUserId(resolveUserId(userId));
    req.setLimit(limit);
    req.setOffset(offset);
    const res = await grpcCall((cb) => employmentClient.listByServiceProvider(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  /**
   * Ending an engagement early.
   *
   * Either party may do it — the reason goes to the other one, so a household
   * ending a job and a service provider leaving one both explain themselves.
   */
  async terminate(serviceProviderUserId: string, reason: string, userId?: string): Promise<void> {
    const req = new auth_pb.TerminateEmploymentReq();
    req.setUserId(resolveUserId(userId || ''));
    req.setServiceProviderUserId(String(serviceProviderUserId));
    req.setHousehelpUserId(String(serviceProviderUserId));
    req.setReason(String(reason || ''));
    await grpcCall((cb) => employmentClient.terminate(req, getMetadata(), cb));
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

export const clientProfileService = {
  async getHiringAttention(userProfileId = getStoredUserProfileId()): Promise<any> {
    const req = new client_profile_pb.HiringAttentionRequest();
    req.setUserProfileId(String(userProfileId || ''));
    const res = await grpcCall((cb) => clientProfileClient.getHiringAttention(req, getMetadata(), cb));
    return dataEnvelope(res, 'records');
  },

  async markHiringRecordAttended(payload: {
    userProfileId?: string;
    kind: string;
    recordId: string | number;
    version: string;
  }): Promise<any> {
    const req = new client_profile_pb.MarkHiringRecordAttendedRequest();
    req.setUserProfileId(String(payload.userProfileId || getStoredUserProfileId() || ''));
    req.setKind(String(payload.kind || ''));
    req.setRecordId(String(payload.recordId ?? ''));
    req.setVersion(String(payload.version || ''));
    const res = await grpcCall((cb) => clientProfileClient.markHiringRecordAttended(req, getMetadata(), cb));
    return dataEnvelope(res);
  },

  async listJobTypes(activeOnly = true): Promise<any> {
    const req = new client_profile_pb.ListJobTypesRequest();
    req.setActiveOnly(activeOnly);
    const res = await grpcCall((cb) => clientProfileClient.listJobTypes(req, getMetadata(), cb));
    return dataEnvelope(res, 'job_types');
  },

  async getJobTypeFeatureBundles(jobTypeId: number | string): Promise<any> {
    const req = new client_profile_pb.JobTypeIdRequest();
    req.setId(Number(jobTypeId || 0));
    const res = await grpcCall((cb) => clientProfileClient.getJobTypeFeatureBundles(req, getMetadata(), cb));
    return dataEnvelope(res, 'features');
  },

  async getListingFeatureProperties(listingId: number | string): Promise<any> {
    const req = new client_profile_pb.ListingIdRequest();
    req.setListingId(Number(listingId || 0));
    const res = await grpcCall((cb) => clientProfileClient.getListingFeatureProperties(req, getMetadata(), cb));
    return dataEnvelope(res, 'features');
  },
};

export const profileFeatureService = {
  async listProfiles(): Promise<any> {
    const req = new empty_pb.Empty();
    const client = catalogProfileClient as any;
    const res = await grpcCall((cb) => client.client_.rpcCall(
      client.hostname_ + '/profile.ProfileService/ListProfiles',
      req,
      getMetadata(),
      methodDescriptorProfileServiceListProfiles,
      cb
    ));
    return dataEnvelope(res, 'profiles', 'items');
  },

  async getProfileFeatures(profileId: string): Promise<any> {
    const req = new catalog_profile_pb.GetProfileFeature();
    req.setProfileId(profileId);
    const res = await grpcCall((cb) => catalogProfileClient.getProfileFeatures(req, getMetadata(), cb));
    return dataEnvelope(res, 'features');
  },
};

export const userProfilePicksService = {
  async listPicks(userProfileId: string): Promise<any> {
    const req = new user_profile_pb.UserProfileIdRequest();
    req.setId(userProfileId);
    const res = await grpcCall((cb) => userProfileClient.listPicks(req, getMetadata(), cb));
    return dataEnvelope(res);
  },

  async addPicks(userProfileId: string, picks: Array<{ feature_property_id?: number; featurePropertyId?: number; weight?: number }>): Promise<any> {
    const req = new user_profile_pb.PicksRequest();
    req.setUserProfileId(userProfileId);
    req.setPicksList((picks || []).map((pick) => {
      const next = new user_profile_pb.PickInput();
      next.setFeaturePropertyId(Number(pick.feature_property_id || pick.featurePropertyId || 0));
      next.setWeight(Number(pick.weight || 1));
      return next;
    }));
    const res = await grpcCall((cb) => userProfileClient.addPicks(req, getMetadata(), cb));
    notifyProfileProgressChanged();
    return dataEnvelope(res);
  },

  async replacePicks(
    userProfileId: string,
    picks: Array<{ feature_property_id?: number; featurePropertyId?: number; weight?: number; value?: string }>,
  ): Promise<any> {
    const req = new user_profile_pb.PicksRequest();
    req.setUserProfileId(userProfileId);
    req.setPicksList((picks || []).map((pick) => {
      const next = new user_profile_pb.PickInput();
      next.setFeaturePropertyId(Number(pick.feature_property_id || pick.featurePropertyId || 0));
      next.setWeight(Number(pick.weight || 1));
      // Only an "Other" property accepts text; auth rejects a value on any
      // other option, so send it exactly as typed and let the backend decide.
      if (pick.value) next.setValue(String(pick.value));
      return next;
    }));
    const res = await grpcCall((cb) => userProfileClient.replacePicks(req, getMetadata(), cb));
    notifyProfileProgressChanged();
    return dataEnvelope(res);
  },
};

async function enrichListingsWithFeatures(listings: Record<string, any>[]) {
  return Promise.all(listings.map(async (listing) => {
    const listingId = extractListingId(listing);
    if (!listingId) return listing;

    try {
      const rows = normalizeArray((await clientProfileService.getListingFeatureProperties(listingId)).data);
      const jobTypeId = Number(listing.job_type_id || listing.jobTypeId || 0);
      const bundles = jobTypeId
        ? normalizeArray((await clientProfileService.getJobTypeFeatureBundles(jobTypeId)).data)
        : [];
      return {
        ...listing,
        listing_features: rows,
        listing_feature_groups: groupListingFeatures(rows, bundles),
      };
    } catch {
      return {
        ...listing,
        listing_features: [],
        listing_feature_groups: [],
      };
    }
  }));
}

export const listingApplicationService = {
  /**
   * Open an application on a listing.
   *
   * Called by the service provider applying, and by a household inviting somebody to
   * its own job — the service allows either and refuses a third party. A second
   * call for the same pair is refused as a duplicate, which callers use as the
   * signal that an application already exists.
   */
  async applyToListing(listingId: string, serviceProviderId: string, message = ''): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'apply',
        id: String(listingId),
        service_provider_id: serviceProviderId,
        message,
      }),
    });
    return payload?.data ?? payload;
  },

  /**
   * Answering an application.
   *
   * The household shortlists or rejects; the applicant accepts or declines.
   * Auth decides which answers belong to which caller — the same call serves
   * both, and the note carries a reason when one was given.
   */
  async respondToApplication(
    applicationId: string | number,
    actorProfileId: string,
    response: 'shortlisted' | 'declined' | 'accepted',
    note = '',
  ): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'respond',
        application_id: applicationId,
        actor_profile_id: actorProfileId,
        response,
        note,
      }),
    });
    return payload?.data ?? payload;
  },

  /** Every status an application has held, and who moved it. */
  async listApplicationEvents(applicationId: string | number, actorProfileId: string): Promise<any[]> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'history',
        application_id: applicationId,
        actor_profile_id: actorProfileId,
      }),
    });
    const rows = payload?.data?.data ?? payload?.data ?? payload ?? [];
    return Array.isArray(rows) ? rows : [];
  },

  async shortlistListing(listingId: string, serviceProviderId: string, message = ''): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'shortlist',
        id: listingId,
        service_provider_id: serviceProviderId,
        message,
      }),
    });
    return payload.data ?? payload;
  },

  // The household's application transitions. actorProfileId is recorded against
  // the event, which is how the timeline attributes the action and how contact
  // visibility distinguishes a household advancing someone from someone applying.
  async promoteApplication(applicationId: string, actorProfileId: string): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'promote', application_id: applicationId, actor_profile_id: actorProfileId }),
    });
    return payload.data ?? payload;
  },

  async approveApplication(applicationId: string, actorProfileId: string): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'approve', application_id: applicationId, actor_profile_id: actorProfileId }),
    });
    return payload.data ?? payload;
  },

  async unshortlistApplication(applicationId: string, actorProfileId: string): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'unshortlist', application_id: applicationId, actor_profile_id: actorProfileId }),
    });
    return payload.data ?? payload;
  },

  async listApplications(options: {
    listingId?: string;
    applicantProfileId?: string;
    /** Every application across the listings this profile owns. */
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

// ══════════════════════════════════════════════════════════════════════════
// Job Listing Service
// ══════════════════════════════════════════════════════════════════════════
async function jobListingsApi(path = '', init?: RequestInit): Promise<any> {
  const res = await fetch(`/api/job-listings${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.message || 'Unable to process job listing request');
  }
  return payload;
}

export const jobService = {
  async createListing(userId: string, data: Record<string, any>): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        user_id: userId || data.user_id || data.userId || data.user_profile_id || data.userProfileId || '',
      }),
    });
    return payload.data ?? payload;
  },

  // Keeps a job open for another cycle. The action behind the renewal reminder;
  // listings lapse by default, so this is how a household says it is still hiring.
  async renewListing(listingId: string, userProfileId = getStoredUserProfileId()): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({ action: 'renew', id: listingId, user_profile_id: userProfileId }),
    });
    return payload.data ?? payload;
  },

  async createJob(userId: string, data: Record<string, any>): Promise<any> {
    return jobService.createListing(userId, data);
  },

  async updateJob(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'PATCH',
      body: JSON.stringify({
        ...data,
        id,
        user_id: userId || data.user_id || data.userId || '',
      }),
    });
    return payload.data ?? payload;
  },

  async deleteJob(id: string, userId?: string): Promise<void> {
    await jobListingsApi('', {
      method: 'DELETE',
      body: JSON.stringify({ id, user_id: userId || '' }),
    });
  },

  async getJob(id: string, userId?: string): Promise<any> {
    const params = new URLSearchParams({ id, hydrate: 'get' });
    const payload = await jobListingsApi(`?${params.toString()}`);
    return payload.data ?? payload;
  },

  async listJobs(limit = 20, offset = 0, userProfileId = getStoredUserProfileId(), status = '', matchCandidatesForProfile = '', ownerIsServiceProvider = false): Promise<any> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });
    if (userProfileId) params.set('user_profile_id', userProfileId);
    if (status) params.set('status', status);
    // A household browsing service providers scores them against its own job.
    if (matchCandidatesForProfile) params.set('match_candidates_for_profile', matchCandidatesForProfile);
    // Households browse people, not job posts. Without this the list comes back
    // as every listing in the table, their own job posts among them.
    if (ownerIsServiceProvider) params.set('owner', 'service_provider');
    const payload = await jobListingsApi(`?${params.toString()}`);
    return { data: normalizeArray(payload.data ?? payload) };
  },

  async searchJobs(filters: Record<string, any>, _userId?: string): Promise<any> {
    const params = new URLSearchParams({
      limit: String(filters?.limit ?? 20),
      offset: String(filters?.offset ?? 0),
    });
    const status = String(filters?.status || '');
    if (status) params.set('status', status === 'open' ? 'active' : status);
    if (filters?.user_profile_id) params.set('user_profile_id', String(filters.user_profile_id));

    // Only the most specific location level is sent, matching how the service
    // resolves them.
    if (filters?.ward_id) params.set('ward_id', String(filters.ward_id));
    else if (filters?.subcounty_id) params.set('subcounty_id', String(filters.subcounty_id));
    else if (filters?.county_id) params.set('county_id', String(filters.county_id));

    if (filters?.job_type_id) params.set('job_type_id', String(filters.job_type_id));

    // Chore, pet type, children age range, capacity and salary range are all
    // feature properties, so they travel as one list of catalogue ids rather
    // than a parameter each.
    const propertyIds = Array.isArray(filters?.property_ids)
      ? filters.property_ids.map(Number).filter((id: number) => Number.isFinite(id) && id > 0)
      : [];
    if (propertyIds.length > 0) params.set('property_ids', propertyIds.join(','));

    // Who is looking, so the service can score how well each job answers what
    // they asked for. Absent, the list comes back unranked rather than empty.
    if (filters?.match_for) params.set('match_for', String(filters.match_for));

    // The two the household board needs, which listJobs already had and this
    // did not: households browse people rather than job posts, and each person
    // is scored against the household's own job.
    if (filters?.owner) params.set('owner', String(filters.owner));
    if (filters?.match_candidates_for_profile) {
      params.set('match_candidates_for_profile', String(filters.match_candidates_for_profile));
    }

    const payload = await jobListingsApi(`?${params.toString()}`);
    return { data: normalizeArray(payload.data ?? payload) };
  },

  async getLatestJobs(limit = 10): Promise<any> {
    return jobService.listJobs(limit, 0, '', 'active');
  },

  async applyForJob(id: string, serviceProviderId?: string, message = ''): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'POST',
      body: JSON.stringify({
        action: 'apply',
        id,
        service_provider_id: serviceProviderId || '',
        message,
      }),
    });
    return payload.data ?? payload;
  },

  async closeJob(id: string, userId?: string, closureReason = '', closureFeedback = ''): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'DELETE',
      body: JSON.stringify({
        id,
        user_id: userId || '',
        action: 'close',
        closure_reason: closureReason,
        closure_feedback: closureFeedback,
      }),
    });
    return payload.data ?? payload;
  },

  async reopenJob(id: string, userId?: string): Promise<any> {
    const payload = await jobListingsApi('', {
      method: 'DELETE',
      body: JSON.stringify({ id, user_id: userId || '', action: 'reopen' }),
    });
    return payload.data ?? payload;
  },

  async getJobsByUserId(userId: string): Promise<any> {
    return jobService.listJobs(20, 0, getStoredUserProfileId());
  },

  async getJobsByStatus(status: string): Promise<any> {
    return jobService.listJobs(20, 0, getStoredUserProfileId(), status);
  },

  async getJobsByType(jobType: string): Promise<any> {
    return jobService.listJobs(20, 0, getStoredUserProfileId());
  },

  async getJobsByLocation(location: string): Promise<any> {
    return jobService.listJobs(20, 0, getStoredUserProfileId());
  },

  async getJobsBySkill(skill: string): Promise<any> {
    return jobService.listJobs(20, 0, getStoredUserProfileId());
  },

  async getJobsBySalaryRange(min: number, max: number): Promise<any> {
    return jobService.listJobs(20, 0, getStoredUserProfileId());
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Open For Work Service
// ══════════════════════════════════════════════════════════════════════════
export const openForWorkService = {
  async createOpenForWork(userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => openForWorkClient.createOpenForWork(buildJsonPayload(userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getOpenForWork(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => openForWorkClient.getOpenForWork(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getOpenForWorkByServiceProvider(serviceProviderId: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => openForWorkClient.getOpenForWorkByServiceProvider(buildIdRequest(serviceProviderId, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async searchOpenForWork(userId: string | undefined, filters: Record<string, any>): Promise<any> {
    const req = new auth_pb.SearchRequest();
    if (userId) req.setUserId(resolveUserId(userId));
    const struct = toStruct(filters || {});
    if (struct) req.setFilters(struct);
    const res = await grpcCall((cb) => openForWorkClient.searchOpenForWork(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async listOpenForWork(limit = 20, offset = 0): Promise<any> {
    const res = await grpcCall((cb) => openForWorkClient.listOpenForWork(buildListRequest(limit, offset), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async updateOpenForWork(id: string, userId: string, data: Record<string, any>): Promise<any> {
    const res = await grpcCall((cb) => openForWorkClient.updateOpenForWork(buildUpdateByIdPayload(id, userId, data), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async deleteOpenForWork(id: string, userId?: string): Promise<void> {
    await grpcCall((cb) => openForWorkClient.deleteOpenForWork(buildIdRequest(id, userId), getMetadata(), cb));
  },
};

// ══════════════════════════════════════════════════════════════════════════
// Employment Contract Service (proto: createEmploymentContract, getEmploymentContract,
//   updateEmploymentContract, deleteEmploymentContract, listEmploymentContracts,
//   signByHousehold, signByServiceProvider, forwardToServiceProvider, getDefaultClauses)
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
  async signByServiceProvider(id: string, userId: string, signature: string, signerName: string): Promise<any> {
    const req = new auth_pb.SignContractReq();
    req.setId(id);
    req.setUserId(resolveUserId(userId));
    req.setSignature(signature);
    req.setSignerName(signerName);
    const res = await grpcCall((cb) => employmentContractClient.signByServiceProvider(req, getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async forwardToServiceProvider(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => employmentContractClient.forwardToServiceProvider(buildIdRequest(id, userId), getMetadata(), cb));
    return jsonResponseToJs(res);
  },
  async getDefaultClauses(): Promise<any> {
    let req: any;
    // The module is imported at the top of this file; require() does not exist
    // in the browser bundle, so this threw, the catch handed the client a bare
    // {} where a proto message was expected, and the call failed. Callers that
    // swallow errors — the clause list does — then showed an empty panel and no
    // sign that anything had gone wrong.
    req = new empty_pb.Empty();
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
    console.groupCollapsed("[WAITLIST_DEBUG] waitlistService.createWaitlist");
    console.log("[WAITLIST_DEBUG] userId arg", userId);
    console.log("[WAITLIST_DEBUG] data arg", data);
    console.groupEnd();

    try {
      const res = await grpcCall((cb) => waitlistClient.createWaitlist(buildPublicJsonPayload(data), getMetadata(), cb));
      const parsed = jsonResponseToJs(res);
      console.log("[WAITLIST_DEBUG] createWaitlist response", parsed);
      return parsed;
    } catch (err: any) {
      console.error("[WAITLIST_DEBUG] createWaitlist grpc error", {
        error: err,
        message: err?.message,
        code: err?.code,
        metadata: err?.metadata,
        stack: err?.stack,
        data,
      });
      throw err;
    }
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
    const res = await grpcCall((cb) => bureauClient.getCurrentBureauProfile(buildUserIdRequest(userId), getMetadata(), cb));
    return bureauResponseToJs(res);
  },
  async getBureau(id: string, userId?: string): Promise<any> {
    const res = await grpcCall((cb) => bureauClient.getBureau(buildIdRequest(id, userId), getMetadata(), cb));
    return bureauResponseToJs(res);
  },
  async initiateServiceProviderLink(phone: string): Promise<any> {
    const req = new auth_pb.BureauServiceProviderLinkInitiateRequest();
    req.setPhone(phone);
    const res = await grpcCall((cb) => bureauClient.initiateServiceProviderLink(req, getMetadata(), cb));
    return bureauServiceProviderLinkResponseToJs(res);
  },
  async verifyServiceProviderLink(requestId: string, otp: string): Promise<any> {
    const req = new auth_pb.BureauServiceProviderLinkVerifyRequest();
    req.setRequestId(requestId);
    req.setOtp(otp);
    const res = await grpcCall((cb) => bureauClient.verifyServiceProviderLink(req, getMetadata(), cb));
    return bureauServiceProviderLinkResponseToJs(res);
  },
  async resendServiceProviderLinkOTP(requestId: string): Promise<any> {
    const req = new auth_pb.BureauServiceProviderLinkIdRequest();
    req.setRequestId(requestId);
    const res = await grpcCall((cb) => bureauClient.resendServiceProviderLinkOTP(req, getMetadata(), cb));
    return bureauServiceProviderLinkResponseToJs(res);
  },
};
