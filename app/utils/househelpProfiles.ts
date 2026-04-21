import { profileService as grpcProfileService } from '~/services/grpc/authServices';

export type HousehelpProfileLike = {
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

export function resolveHousehelpProfileId(profile: HousehelpProfileLike | null | undefined): string {
  return profile?.profile_id || (profile?.id != null ? String(profile.id) : '');
}

export function resolveHousehelpUserId(profile: HousehelpProfileLike | null | undefined): string {
  if (!profile) return '';
  if (profile.user_id) return profile.user_id;
  if (profile.user?.id) return profile.user.id;
  // Search/list payloads often use `id` for the owner user ID and `profile_id` for the profile record.
  if (profile.profile_id && profile.id != null) return String(profile.id);
  return '';
}

function pickHousehelpSearchMatch(raw: any, profileId: string): HousehelpProfileLike | null {
  const payload = raw?.data || raw?.profiles || raw?.househelps || raw || [];
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

  const match = items.find((item: any) =>
    item?.profile_id === profileId ||
    item?.id === profileId
  );

  return match || null;
}

export async function resolveHousehelpProfile(identifier: string, options?: {
  identifierType?: 'userId' | 'profileId' | 'auto';
}): Promise<HousehelpProfileLike | null> {
  const identifierType = options?.identifierType || 'auto';

  if (!identifier) {
    return null;
  }

  if (identifierType === 'userId') {
    return grpcProfileService.getHousehelpByUserID(identifier);
  }

  if (identifierType === 'profileId') {
    try {
      return await grpcProfileService.getHousehelpProfileWithUser(identifier);
    } catch {
      try {
        return await grpcProfileService.getHousehelpByID(identifier);
      } catch {
        const searchResult = await grpcProfileService.searchHousehelps('', '', { profile_id: identifier }, 1, 0);
        return pickHousehelpSearchMatch(searchResult, identifier);
      }
    }
  }

  try {
    return await grpcProfileService.getHousehelpByUserID(identifier);
  } catch {
    try {
      return await grpcProfileService.getHousehelpProfileWithUser(identifier);
    } catch {
      try {
        return await grpcProfileService.getHousehelpByID(identifier);
      } catch {
        const searchResult = await grpcProfileService.searchHousehelps('', '', { profile_id: identifier }, 1, 0);
        return pickHousehelpSearchMatch(searchResult, identifier);
      }
    }
  }
}
