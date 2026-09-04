import { SERVICE_PROVIDER_PROFILE_TYPE } from '~/utils/profileType';

export type SignupProfileOption = {
  id: string;
  value: string;
  label: string;
  description: string;
  type?: string;
  slug?: string;
};

export const signupProfileDescriptions = {
  household: 'Find and hire trusted service providers',
  service_provider: 'Offer your skills and services to households',
} as const;

export const fallbackSignupProfileOptions: SignupProfileOption[] = [
  {
    id: '11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1',
    value: 'household',
    label: 'Household',
    description: signupProfileDescriptions.household,
    type: 'CLT',
    slug: 'household',
  },
  {
    id: '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff',
    value: SERVICE_PROVIDER_PROFILE_TYPE,
    label: 'Service provider',
    description: signupProfileDescriptions.service_provider,
    type: 'SVC_PVD',
    slug: 'service-provider',
  },
];

function normalizeProfileRole(profile: any): 'household' | 'service_provider' | '' {
  const type = String(profile?.type || profile?.profile_type || profile?.profileType || '').toUpperCase();
  const slug = String(profile?.slug || '').toLowerCase();
  const name = String(profile?.name || '').toLowerCase();

  if (type === 'CLT' || slug.includes('household') || name.includes('household')) return 'household';
  if (
    type === 'SVC_PVD'
    || slug.includes('service-provider')
    || slug.includes('service_provider')
    // Read legacy catalogue identifiers during rolling deployments, but never
    // present that old occupation-specific wording to a person signing up.
    || slug.includes('househelp')
    || slug.includes('house-help')
    || name.includes('service provider')
    || name.includes('househelp')
    || name.includes('house help')
  ) {
    return SERVICE_PROVIDER_PROFILE_TYPE;
  }
  return '';
}

function normalizeProfileLabel(profile: any, role: 'household' | 'service_provider') {
  const label = String(profile?.name || '').trim();
  if (role === SERVICE_PROVIDER_PROFILE_TYPE) return 'Service provider';
  return label || 'Household';
}

export function normalizeSignupProfileOptions(rawProfiles: any[]): SignupProfileOption[] {
  const byRole = new Map<string, SignupProfileOption>();

  for (const profile of rawProfiles) {
    const role = normalizeProfileRole(profile);
    const id = String(profile?.id || profile?.profile_id || profile?.profileId || '').trim();
    if (!role || !id || byRole.has(role)) continue;

    byRole.set(role, {
      id,
      value: role,
      label: normalizeProfileLabel(profile, role),
      // Catalogue descriptions are content, not identity. Use inclusive copy
      // here so an older database cannot make plumbers, electricians, or other
      // professionals think this option is only for domestic workers.
      description: signupProfileDescriptions[role],
      type: String(profile?.type || ''),
      slug: String(profile?.slug || ''),
    });
  }

  const ordered = ['household', SERVICE_PROVIDER_PROFILE_TYPE]
    .map((role) => byRole.get(role))
    .filter(Boolean) as SignupProfileOption[];

  return ordered.length ? ordered : fallbackSignupProfileOptions;
}
