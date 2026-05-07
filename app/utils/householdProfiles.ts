import { profileService as grpcProfileService } from '~/services/grpc/authServices';

export type HouseholdProfileLike = {
  id?: string;
  profile_id?: string;
  user_id?: string;
  owner_user_id?: string;
  display_name?: string;
  household_name?: string;
  name?: string;
  owner?: { id?: string };
};

export function resolveHouseholdOwnerUserId(profile: HouseholdProfileLike | null | undefined): string {
  return profile?.user_id || profile?.owner_user_id || profile?.owner?.id || '';
}

function pickHouseholdSearchMatch(raw: any, profileId: string): HouseholdProfileLike | null {
  const payload = raw?.data || raw?.profiles || raw?.households || raw || [];
  const items = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];

  const match = items.find((item: any) =>
    item?.profile_id === profileId ||
    item?.id === profileId
  );

  return match || null;
}

export async function resolveHouseholdProfile(identifier: string, options?: {
  identifierType?: 'userId' | 'profileId' | 'auto';
}): Promise<HouseholdProfileLike | null> {
  const identifierType = options?.identifierType || 'auto';

  if (!identifier) {
    return null;
  }

  if (identifierType === 'userId') {
    return grpcProfileService.getHouseholdByUserID(identifier);
  }

  if (identifierType === 'profileId') {
    try {
      return await grpcProfileService.getHouseholdByUserID(identifier);
    } catch {
      const searchResult = await grpcProfileService.searchHouseholds('', '', { profile_id: identifier }, 1, 0);
      return pickHouseholdSearchMatch(searchResult, identifier);
    }
  }

  try {
    return await grpcProfileService.getHouseholdByUserID(identifier);
  } catch {
    const searchResult = await grpcProfileService.searchHouseholds('', '', { profile_id: identifier }, 1, 0);
    return pickHouseholdSearchMatch(searchResult, identifier);
  }
}
