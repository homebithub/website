type ProfileRecord = Record<string, any>;

function isProfile(value: unknown): value is ProfileRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && !!((value as ProfileRecord).user_profile_id || (value as ProfileRecord).id);
}

/** Prefer the current flat response over legacy attribute objects with the
 * same names as the old response envelopes (which can legitimately be empty).
 */
export function readServiceProviderProfile(response: unknown): ProfileRecord {
  const envelope = response as ProfileRecord | null;
  for (const payload of [envelope, envelope?.data]) {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) continue;
    const profile = [payload, payload.ServiceProvider, payload.service_provider, payload.Househelp]
      .find(isProfile);
    if (!profile) continue;
    return {
      ...profile,
      id: profile.user_profile_id || profile.id,
      user: profile.user || profile.User || payload.user || payload.User || envelope?.user || envelope?.User,
    };
  }
  throw new Error('We couldn’t load this service provider’s profile. Please try again.');
}
