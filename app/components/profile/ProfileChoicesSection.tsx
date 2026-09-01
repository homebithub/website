import { useEffect, useMemo, useState } from 'react';
import { profileFeatureService, userProfilePicksService } from '~/services/grpc/authServices';
import { profileFeatureLabel } from '~/utils/profileFeatures';

type UnknownRecord = Record<string, unknown>;

type FeaturePropertyChoice = {
  id: number;
  name: string;
  description?: string;
  // Text the user typed against an "Other" option. Shown in place of the
  // generic "Other" label so the profile reads as their own answer.
  value?: string;
};

type SelectedFeatureGroup = {
  featureId: number;
  featureName: string;
  properties: FeaturePropertyChoice[];
};

type ProfileChoicesSectionProps = {
  profile: UnknownRecord;
  fallbackProfileId: string;
  profileType: 'household' | 'service_provider';
  title?: string;
  editable?: boolean;
  onEdit?: () => void;
  roundedBottom?: boolean;
};

const normalizeArray = (value: unknown): UnknownRecord[] => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as UnknownRecord;
    if (Array.isArray(record.data)) return record.data;
    if (Array.isArray(record.picks)) return record.picks;
    if (Array.isArray(record.items)) return record.items;
  }
  return [];
};

const nestedRecord = (value: unknown): UnknownRecord =>
  value && typeof value === 'object' ? value as UnknownRecord : {};

const pickPropertyId = (pick: UnknownRecord): number => {
  const featureProperty = nestedRecord(pick.feature_property || pick.featureProperty);
  const property = nestedRecord(pick.property);
  return Number(
    pick.feature_property_id ||
    pick.featurePropertyId ||
    pick.property_id ||
    pick.propertyId ||
    featureProperty.id ||
    property.id ||
    0,
  );
};

const buildSelectedFeatureGroups = (
  featuresPayload: unknown,
  picksPayload: unknown,
): SelectedFeatureGroup[] => {
  const features = normalizeArray(featuresPayload);
  const picks = normalizeArray(picksPayload);
  const propertiesById = new Map<
    number,
    { featureId: number; featureName: string; property: FeaturePropertyChoice }
  >();
  const groups = new Map<number, SelectedFeatureGroup>();

  features.forEach((bundle) => {
    const feature = nestedRecord(bundle.feature);
    const featureId = Number(bundle.feature_id || bundle.featureId || feature.id || 0);
    if (!featureId) return;

    const featureName = profileFeatureLabel(
      String(feature.name || bundle.name || `Feature ${featureId}`),
    );
    normalizeArray(bundle.properties).forEach((propertyRecord) => {
      const propertyId = Number(
        propertyRecord.id ||
        propertyRecord.feature_property_id ||
        propertyRecord.featurePropertyId ||
        0,
      );
      if (!propertyId) return;
      propertiesById.set(propertyId, {
        featureId,
        featureName,
        property: {
          id: propertyId,
          name: String(propertyRecord.name || propertyRecord.description || `Option ${propertyId}`),
          description: propertyRecord.description ? String(propertyRecord.description) : undefined,
        },
      });
    });
  });

  picks.forEach((pick) => {
    const propertyId = pickPropertyId(pick);
    if (!propertyId) return;

    const feature = nestedRecord(pick.feature);
    const featureProperty = nestedRecord(pick.feature_property || pick.featureProperty);
    const property = nestedRecord(pick.property);
    const mapped = propertiesById.get(propertyId);
    const featureId = Number(
      pick.feature_id ||
      pick.featureId ||
      feature.id ||
      featureProperty.feature_id ||
      featureProperty.featureId ||
      property.feature_id ||
      property.featureId ||
      mapped?.featureId ||
      0,
    );
    if (!featureId) return;

    const featureName = profileFeatureLabel(
      String(feature.name || mapped?.featureName || `Feature ${featureId}`),
    );
    const typedValue = String(pick.value ?? '').trim();
    const baseProperty: FeaturePropertyChoice = mapped?.property || {
      id: propertyId,
      name: String(featureProperty.name || property.name || pick.name || `Option ${propertyId}`),
      description: String(
        featureProperty.description ||
        property.description ||
        pick.description ||
        '',
      ),
    };
    const selectedProperty: FeaturePropertyChoice = typedValue
      ? { ...baseProperty, value: typedValue }
      : baseProperty;

    const group = groups.get(featureId) || {
      featureId,
      featureName,
      properties: [],
    };
    if (!group.properties.some((item) => item.id === selectedProperty.id)) {
      group.properties.push(selectedProperty);
    }
    groups.set(featureId, group);
  });

  return Array.from(groups.values());
};

export function ProfileChoicesSection({
  profile,
  fallbackProfileId,
  profileType,
  title = 'Profile Choices',
  editable = false,
  onEdit,
  roundedBottom = false,
}: ProfileChoicesSectionProps) {
  const [groups, setGroups] = useState<SelectedFeatureGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const profileRecord = useMemo(() => nestedRecord(profile.profile), [profile.profile]);
  const userProfileRecord = useMemo(
    () => nestedRecord(profile.user_profile || profile.userProfile),
    [profile.userProfile, profile.user_profile],
  );
  const catalogueProfileId = String(
    profile.profile_id ||
    profile.profileId ||
    profileRecord.id ||
    fallbackProfileId ||
    '',
  );
  const userProfileId = String(
    profile.user_profile_id ||
    profile.userProfileId ||
    userProfileRecord.id ||
    profile.id ||
    '',
  );

  useEffect(() => {
    let cancelled = false;

    const loadChoices = async () => {
      if (!catalogueProfileId || !userProfileId) {
        setGroups([]);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [featuresPayload, picksPayload] = await Promise.all([
          profileFeatureService.getProfileFeatures(catalogueProfileId),
          userProfilePicksService.listPicks(userProfileId),
        ]);
        if (!cancelled) {
          setGroups(
            buildSelectedFeatureGroups(
              featuresPayload?.data ?? featuresPayload,
              picksPayload?.data ?? picksPayload,
            ),
          );
        }
      } catch (requestError: unknown) {
        if (!cancelled) {
          console.error('Unable to load profile details', requestError);
          setGroups([]);
          setError('We couldn’t load your profile details. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadChoices();
    return () => {
      cancelled = true;
    };
  }, [catalogueProfileId, retryKey, userProfileId]);

  return (
    <section
      data-tour="profile-choices"
      className={`border-t border-purple-200/40 bg-white p-6 dark:border-purple-500/30 dark:bg-[#13131a] ${
        roundedBottom ? 'rounded-b-3xl' : ''
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            ✨ {title}
          </h2>
          <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
            Features and options selected for this {profileType} profile.
          </p>
        </div>
        {editable && onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 transition-all hover:scale-105 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white dark:bg-purple-900/30 dark:text-purple-300 dark:hover:text-white"
          >
            Edit
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="hb-shimmer-piece h-4 w-4 rounded-full" />
          Loading profile choices...
        </div>
      ) : error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-purple-300/50 bg-purple-50/70 p-4 text-xs text-purple-800 dark:border-purple-500/30 dark:bg-purple-950/20 dark:text-purple-200 sm:flex-row sm:items-center sm:justify-between">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setRetryKey((current) => current + 1)}
            className="self-start rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 font-semibold text-white shadow-md transition hover:from-purple-700 hover:to-pink-700 sm:self-auto"
          >
            Try again
          </button>
        </div>
      ) : groups.length > 0 ? (
        <div className="divide-y divide-purple-200/60 dark:divide-purple-500/30">
          {groups.map((group) => (
            <div key={group.featureId} className="py-5 first:pt-0 last:pb-0">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                {group.featureName}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.properties.map((property) => (
                  <span
                    key={property.id}
                    title={property.description}
                    className="inline-flex items-center gap-2 rounded-full border border-purple-300/70 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-100"
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white dark:bg-purple-500">
                      {(property.value || property.name).slice(0, 1).toUpperCase()}
                    </span>
                    {property.value || property.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-purple-200 p-4 dark:border-purple-500/30">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            No profile choices selected yet. Use Edit to choose the features and options that describe this profile.
          </p>
        </div>
      )}
    </section>
  );
}
