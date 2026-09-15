import { profileReadService } from '~/services/grpc/profileRead.service';
import { cachedRequest } from '~/utils/requestCache';

export type ServiceProviderProfileLike = {
  id?: string | number;
  profile_id?: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  user?: {
    id?: string;
    first_name?: string;
    last_name?: string;
  };
};

export function resolveServiceProviderProfileId(profile: ServiceProviderProfileLike | null | undefined): string {
  return profile?.profile_id || (profile?.id != null ? String(profile.id) : '');
}

export function resolveServiceProviderUserId(profile: ServiceProviderProfileLike | null | undefined): string {
  if (!profile) return '';
  if (profile.user_id) return profile.user_id;
  if (profile.user?.id) return profile.user.id;
  if (profile.profile_id && profile.id != null) return String(profile.id);
  return '';
}

function pickServiceProviderSearchMatch(raw: any, profileId: string): ServiceProviderProfileLike | null {
  const payload = raw?.data || raw?.profiles || raw?.service_providers || raw?.househelps || raw || [];
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  return items.find((item: any) => item?.profile_id === profileId || item?.id === profileId) || null;
}

export async function resolveServiceProviderProfile(identifier: string, options?: {
  identifierType?: 'userId' | 'profileId' | 'auto';
}): Promise<ServiceProviderProfileLike | null> {
  const identifierType = options?.identifierType || 'auto';
  if (!identifier) return null;

  return cachedRequest(
    `profile:service-provider:${identifierType}:${identifier}`,
    () => fetchServiceProviderProfile(identifier, identifierType),
    { maxAgeMs: 5 * 60_000 },
  );
}

async function fetchServiceProviderProfile(
  identifier: string,
  identifierType: 'userId' | 'profileId' | 'auto',
): Promise<ServiceProviderProfileLike | null> {
  if (identifierType === 'userId') {
    return profileReadService.getServiceProviderByUserID(identifier);
  }

  if (identifierType === 'profileId') {
    try {
      return await profileReadService.getServiceProviderProfileWithUser(identifier);
    } catch {
      try {
        return await profileReadService.getServiceProviderByID(identifier);
      } catch {
        const searchResult = await profileReadService.searchServiceProviders('', '', { profile_id: identifier }, 1, 0);
        return pickServiceProviderSearchMatch(searchResult, identifier);
      }
    }
  }

  try {
    return await profileReadService.getServiceProviderByUserID(identifier);
  } catch {
    try {
      return await profileReadService.getServiceProviderProfileWithUser(identifier);
    } catch {
      try {
        return await profileReadService.getServiceProviderByID(identifier);
      } catch {
        const searchResult = await profileReadService.searchServiceProviders('', '', { profile_id: identifier }, 1, 0);
        return pickServiceProviderSearchMatch(searchResult, identifier);
      }
    }
  }
}
