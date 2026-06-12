import { useEffect, useMemo, useState } from 'react';
import { Phone, UserRound } from 'lucide-react';
import { getStoredUser } from '~/utils/authStorage';
import { profileFeatureService, userProfilePicksService } from '~/services/grpc/authServices';

type UnknownRecord = Record<string, unknown>;

type ProfileAccountSummaryProps = {
  profile: UnknownRecord;
  fallbackProfileId: string;
  fallbackProfileType: 'househelp' | 'household';
};

type FeatureProperty = {
  id?: number;
  feature_id?: number;
  featureId?: number;
};

type FeatureBundle = {
  feature_id?: number;
  featureId?: number;
  feature?: {
    id?: number;
    name?: string;
  };
  properties?: FeatureProperty[];
};

type CompletionState = {
  loading: boolean;
  selectedFeatures: number;
  selectedProperties: number;
  totalFeatures: number;
};

const PROFILE_TYPES: Record<string, string> = {
  '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff': 'HouseHelp',
  '11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1': 'Household',
  househelp: 'HouseHelp',
  household: 'Household',
};

function getStoredValue(key: string) {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(key) || '';
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function getNestedRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? value as UnknownRecord : {};
}

function getNestedUser(profile: UnknownRecord) {
  return getNestedRecord(profile.user);
}

function resolveProfileId(profile: UnknownRecord, fallbackProfileId: string) {
  const profileRecord = getNestedRecord(profile.profile);
  return String(
    profile.profile_id ||
    profile.profileId ||
    profileRecord.id ||
    getStoredValue('profile_id') ||
    fallbackProfileId ||
    '',
  );
}

function resolveUserProfileId(profile: UnknownRecord) {
  const userProfile = getNestedRecord(profile.user_profile);
  return String(
    profile.user_profile_id ||
    profile.userProfileId ||
    userProfile.id ||
    getStoredValue('user_profile_id') ||
    profile.id ||
    '',
  );
}

function formatProfileType(profileId: string, fallbackProfileType: string) {
  return PROFILE_TYPES[profileId] || PROFILE_TYPES[fallbackProfileType] || fallbackProfileType;
}

function formatDate(value: unknown) {
  if (!value) return 'Not available';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return 'Not available';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function normalizeArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.picks)) return record.picks;
    if (Array.isArray(record.items)) return record.items;
  }
  return [];
}

function featureIdOf(bundle: FeatureBundle) {
  return Number(bundle.feature_id || bundle.featureId || bundle.feature?.id || 0);
}

function buildPropertyToFeature(features: FeatureBundle[]) {
  const out = new Map<number, number>();
  features.forEach((feature) => {
    const featureId = featureIdOf(feature);
    (feature.properties || []).forEach((property) => {
      const propertyId = Number(property.id || 0);
      if (featureId && propertyId) out.set(propertyId, featureId);
    });
  });
  return out;
}

function pickPropertyId(pick: UnknownRecord) {
  const featureProperty = getNestedRecord(pick.feature_property);
  const property = getNestedRecord(pick.property);
  return Number(
    pick.feature_property_id ||
    pick.featurePropertyId ||
    pick.property_id ||
    pick.propertyId ||
    featureProperty.id ||
    property.id ||
    0,
  );
}

export function ProfileAccountSummary({
  profile,
  fallbackProfileId,
  fallbackProfileType,
}: ProfileAccountSummaryProps) {
  const storedUser = getStoredUser() || {};
  const user = getNestedUser(profile);
  const profileId = resolveProfileId(profile, fallbackProfileId);
  const userProfileId = resolveUserProfileId(profile);
  const userProfile = getNestedRecord(profile.user_profile);
  const firstName = getString(user.first_name) || getString(user.firstName) || getString(profile.first_name) || getString(storedUser.first_name);
  const lastName = getString(user.last_name) || getString(user.lastName) || getString(profile.last_name) || getString(storedUser.last_name);
  const phone = getString(user.phone) || getString(profile.phone) || getString(storedUser.phone) || 'Not available';
  const memberSince = formatDate(
    userProfile.created_at ||
    profile.user_profile_created_at ||
    profile.userProfileCreatedAt ||
    profile.created_at ||
    profile.createdAt,
  );
  const profileType = formatProfileType(profileId, fallbackProfileType);
  const [completion, setCompletion] = useState<CompletionState>({
    loading: true,
    selectedFeatures: 0,
    selectedProperties: 0,
    totalFeatures: 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function loadCompletion() {
      if (!profileId || !userProfileId) {
        setCompletion({
          loading: false,
          selectedFeatures: 0,
          selectedProperties: 0,
          totalFeatures: 0,
        });
        return;
      }

      try {
        const [featuresPayload, picksPayload] = await Promise.all([
          profileFeatureService.getProfileFeatures(profileId),
          userProfilePicksService.listPicks(userProfileId),
        ]);

        const features = normalizeArray(featuresPayload.data) as FeatureBundle[];
        const picks = normalizeArray(picksPayload.data);
        const propertyToFeature = buildPropertyToFeature(features);
        const selectedFeatureIds = new Set<number>();
        const selectedPropertyIds = new Set<number>();

        picks.forEach((pick) => {
          const propertyId = pickPropertyId(pick);
          if (!propertyId) return;
          selectedPropertyIds.add(propertyId);
          const feature = getNestedRecord(pick.feature);
          const featureProperty = getNestedRecord(pick.feature_property);
          const property = getNestedRecord(pick.property);
          const featureId = Number(
            pick.feature_id ||
            pick.featureId ||
            feature.id ||
            featureProperty.feature_id ||
            property.feature_id ||
            propertyToFeature.get(propertyId) ||
            0,
          );
          if (featureId) selectedFeatureIds.add(featureId);
        });

        if (!cancelled) {
          setCompletion({
            loading: false,
            selectedFeatures: selectedFeatureIds.size,
            selectedProperties: selectedPropertyIds.size,
            totalFeatures: features.length,
          });
        }
      } catch {
        if (!cancelled) {
          setCompletion((prev) => ({ ...prev, loading: false }));
        }
      }
    }

    loadCompletion();
    return () => {
      cancelled = true;
    };
  }, [profileId, userProfileId]);

  const completionPercent = useMemo(() => {
    if (!completion.totalFeatures) return 0;
    return Math.min(100, Math.round((completion.selectedFeatures / completion.totalFeatures) * 100));
  }, [completion.selectedFeatures, completion.totalFeatures]);

  const details = [
    { label: 'First name', value: firstName || 'Not available' },
    { label: 'Last name', value: lastName || 'Not available' },
    { label: 'Phone', value: phone, icon: Phone },
    { label: 'Profile type', value: profileType },
    { label: 'Member since', value: memberSince },
  ];

  return (
    <section className="rounded-2xl bg-white dark:bg-[#13131a] p-4 sm:p-6 border border-purple-200/40 dark:border-purple-500/30 mb-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">My Account</p>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {[firstName, lastName].filter(Boolean).join(' ') || 'Account details'}
            </h2>
          </div>
        </div>

        <div className="min-w-[220px]">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
            <span>Profile completion</span>
            <span>{completion.loading ? '...' : `${completionPercent}%`}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {completion.selectedFeatures} of {completion.totalFeatures} features, {completion.selectedProperties} properties
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {details.map((detail) => {
          const Icon = detail.icon;
          return (
            <div key={detail.label} className="rounded-xl border border-purple-100 bg-purple-50/60 p-3 dark:border-purple-500/20 dark:bg-purple-950/20">
              <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                {detail.label}
              </div>
              <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">{detail.value}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ProfileAccountSummary;
