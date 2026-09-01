export const HOUSEHOLD_PROFILE_TYPE = "household";
export const SERVICE_PROVIDER_PROFILE_TYPE = "service_provider";
export const BUREAU_PROFILE_TYPE = "bureau";

export type CanonicalProfileType =
  | typeof HOUSEHOLD_PROFILE_TYPE
  | typeof SERVICE_PROVIDER_PROFILE_TYPE
  | typeof BUREAU_PROFILE_TYPE;

const compactProfileType = (profileType: string | null | undefined): string =>
  String(profileType || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

export const isServiceProviderProfileType = (
  profileType: string | null | undefined,
): boolean => {
  const compact = compactProfileType(profileType);
  return compact === "househelp" || compact === "serviceprovider" || compact === "svcpvd" || compact === "svdpdd";
};

export const normalizeProfileType = (
  profileType: string | null | undefined,
): string => {
  const compact = compactProfileType(profileType);
  if (compact === "clt" || compact === "client" || compact === "household") {
    return HOUSEHOLD_PROFILE_TYPE;
  }
  if (isServiceProviderProfileType(profileType)) {
    return SERVICE_PROVIDER_PROFILE_TYPE;
  }
  if (compact === BUREAU_PROFILE_TYPE) {
    return BUREAU_PROFILE_TYPE;
  }
  return String(profileType || "").trim().toLowerCase();
};

export const profileTypesMatch = (
  left: string | null | undefined,
  right: string | null | undefined,
): boolean => normalizeProfileType(left) === normalizeProfileType(right);
