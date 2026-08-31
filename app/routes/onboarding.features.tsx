import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { AlertCircle, BriefcaseBusiness, ClipboardCheck } from 'lucide-react';
import { Navigation } from '~/components/Navigation';
import { Loading } from '~/components/Loading';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { profileFeatureService, userProfilePicksService } from '~/services/grpc/authServices';
import { profileFeatureLabel } from '~/utils/profileFeatures';
import { INPUT_CLASS, RequiredMark } from '~/components/ui/formStyles';
import { FeatureOptionPicker } from '~/components/preferences/FeatureOptionPicker';
import { PreferenceAccordion } from '~/components/preferences/PreferenceAccordion';
import { isSingleSelectFeature } from '~/utils/preferenceRules';
import { notifyProfileProgressChanged } from '~/utils/profileProgress';

// Mirrors MaxPickValueLength in the auth service, so the field cannot submit
// something the backend will reject.
const MAX_OTHER_LENGTH = 120;

type FeatureProperty = {
  id: number;
  name: string;
  description?: string;
  display_order?: number;
  // Set on a feature's "Other" option, which accepts an answer the catalogue
  // does not list. Backends send snake_case; the camelCase form is tolerated
  // in case a client is regenerated with different casing.
  allows_free_text?: boolean;
  allowsFreeText?: boolean;
};

type FeatureBundle = {
  feature_id: number;
  feature?: {
    id?: number;
    name?: string;
    display_order?: number;
  };
  display_order?: number;
  is_required?: boolean;
  properties?: FeatureProperty[];
};

type LocationState = {
  profileId?: string;
  userProfileId?: string;
  profileType?: string;
  returnTo?: string;
};

const JOB_ELIGIBILITY_THRESHOLD = 70;
const REMOVED_PROFILE_FEATURES = new Set([
  'PetTraitOption',
  'FamilyTypePreference',
  'ReferenceRelationship',
]);

function getFeatureName(bundle: FeatureBundle, profileType?: string) {
  return profileFeatureLabel(bundle.feature?.name || '', profileType) || `Feature ${bundle.feature_id}`;
}

function getStoredValue(key: string) {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(key) || '';
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function normalizeFeaturePayload(payload: unknown): FeatureBundle[] {
  const envelope = payload && typeof payload === 'object' ? payload as Record<string, unknown> : {};
  const nestedData = envelope.data && typeof envelope.data === 'object'
    ? envelope.data as Record<string, unknown>
    : {};
  const raw = Array.isArray(envelope.data)
    ? envelope.data
    : Array.isArray(nestedData.data)
      ? nestedData.data
      : Array.isArray(envelope.features)
        ? envelope.features
        : Array.isArray(payload)
          ? payload
          : [];

  return raw
    .map((bundle: FeatureBundle) => ({
      ...bundle,
      properties: [...(bundle.properties || [])].sort(
        (a, b) => Number(a.display_order || 0) - Number(b.display_order || 0),
      ),
    }))
    .filter((bundle: FeatureBundle) => (bundle.properties || []).length > 0)
    .sort((a: FeatureBundle, b: FeatureBundle) => (
      Number(a.display_order || a.feature?.display_order || 0) -
      Number(b.display_order || b.feature?.display_order || 0)
    ));
}

function normalizePicks(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  if (!payload || typeof payload !== 'object') return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.data)) return record.data as Array<Record<string, unknown>>;
  if (Array.isArray(record.picks)) return record.picks as Array<Record<string, unknown>>;
  return [];
}

function pickPropertyId(pick: Record<string, unknown>) {
  const nested = pick.feature_property && typeof pick.feature_property === 'object'
    ? pick.feature_property as Record<string, unknown>
    : {};
  return Number(pick.feature_property_id || pick.featurePropertyId || nested.id || 0);
}

export default function OnboardingFeaturesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;
  const [profileId] = useState(locationState.profileId || getStoredValue('profile_id'));
  const [userProfileId] = useState(locationState.userProfileId || getStoredValue('user_profile_id'));
  const [profileType] = useState(locationState.profileType || getStoredValue('profile_type'));
  const [features, setFeatures] = useState<FeatureBundle[]>([]);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  // Typed answers keyed by the "Other" property they belong to.
  const [otherValues, setOtherValues] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [openFeatures, setOpenFeatures] = useState<Set<number>>(() => new Set());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (profileId) window.localStorage.setItem('profile_id', profileId);
    if (userProfileId) window.localStorage.setItem('user_profile_id', userProfileId);
    if (profileType) window.localStorage.setItem('profile_type', profileType);
  }, [profileId, profileType, userProfileId]);

  useEffect(() => {
    let cancelled = false;

    async function loadFeatures() {
      if (!profileId) {
        setError('Profile information is missing. Please sign in again.');
        setLoading(false);
        return;
      }

      try {
        const [payload, picksPayload] = await Promise.all([
          profileFeatureService.getProfileFeatures(profileId),
          userProfileId
            ? userProfilePicksService.listPicks(userProfileId)
            : Promise.resolve(null),
        ]);

        if (!cancelled) {
          // Keep removed questions out during a rolling deploy even if this
          // browser briefly talks to an auth instance that has not migrated.
          const nextFeatures = normalizeFeaturePayload(payload).filter(
            (feature) => !REMOVED_PROFILE_FEATURES.has(String(feature.feature?.name || '')),
          );
          const propertyToFeature = new Map<number, number>();
          nextFeatures.forEach((feature) => {
            (feature.properties || []).forEach((property) => {
              propertyToFeature.set(property.id, feature.feature_id);
            });
          });
          const nextSelected: Record<number, number[]> = {};
          const nextOtherValues: Record<number, string> = {};
          normalizePicks(picksPayload?.data).forEach((pick) => {
            const propertyId = pickPropertyId(pick);
            const featureId = Number(pick.feature_id || pick.featureId || propertyToFeature.get(propertyId) || 0);
            if (!propertyId || !featureId) return;
            nextSelected[featureId] = Array.from(new Set([...(nextSelected[featureId] || []), propertyId]));
            const typed = String(pick.value ?? '');
            if (typed) nextOtherValues[propertyId] = typed;
          });
          setFeatures(nextFeatures);
          setOpenFeatures((current) => current.size > 0 || nextFeatures.length === 0
            ? current
            : new Set([nextFeatures[0].feature_id]));
          setSelected(nextSelected);
          setOtherValues(nextOtherValues);
        }
      } catch (err: unknown) {
        if (!cancelled) setError(getErrorMessage(err, 'Unable to load profile features'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadFeatures();
    return () => {
      cancelled = true;
    };
  }, [profileId, userProfileId]);

  const selectedCount = useMemo(
    () => features.filter((feature) => (selected[feature.feature_id] || []).length > 0).length,
    [features, selected],
  );
  const progress = features.length ? Math.round((selectedCount / features.length) * 100) : 0;
  const selectedPropertyIds = useMemo(
    () => Object.values(selected).flat(),
    [selected],
  );
  const allowsFreeText = useMemo(() => {
    const ids = new Set<number>();
    features.forEach((feature) => {
      (feature.properties || []).forEach((property) => {
        if (property.allows_free_text ?? property.allowsFreeText) ids.add(Number(property.id));
      });
    });
    return ids;
  }, [features]);
  const canSave = selectedPropertyIds.length > 0;
  const isJobEligible = progress >= JOB_ELIGIBILITY_THRESHOLD;
  const remainingEligibilityPercent = Math.max(0, JOB_ELIGIBILITY_THRESHOLD - progress);
  const nextDestination = locationState.returnTo ||
    (profileType === 'household' ? '/household/profile' : '/househelp/profile');

  // Clearing the text when an "Other" option is deselected stops a stale
  // answer being resubmitted if the user selects it again later.
  const setOtherValue = (propertyId: number, value: string) => {
    setSaved(false);
    setOtherValues((prev) => ({ ...prev, [propertyId]: value }));
  };

  const toggleProperty = (featureId: number, propertyId: number) => {
    setSaved(false);
    setSelected((prev) => {
      const current = prev[featureId] || [];
      const feature = features.find((item) => item.feature_id === featureId);
      const single = feature ? isSingleSelectFeature(String(feature.feature?.name || '')) : false;
      const next = current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : single ? [propertyId] : [...current, propertyId];
      if (!next.includes(propertyId)) {
        setOtherValues((values) => {
          const { [propertyId]: _removed, ...rest } = values;
          return rest;
        });
      }
      return { ...prev, [featureId]: next };
    });
  };

  const savePicks = async () => {
    if (!userProfileId) {
      setError('Your account was verified, but the user profile id was not returned. Please sign in again before choosing features.');
      return;
    }

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const missingOther = selectedPropertyIds.find(
        (id) => allowsFreeText.has(id) && !(otherValues[id] || '').trim(),
      );
      if (missingOther) {
        setError('Please describe your "Other" choice, or deselect it.');
        return;
      }

      await userProfilePicksService.replacePicks(userProfileId, selectedPropertyIds.map((featurePropertyId) => ({
        feature_property_id: featurePropertyId,
        weight: 1,
        value: allowsFreeText.has(featurePropertyId)
          ? (otherValues[featurePropertyId] || '').trim()
          : undefined,
      })));

      setSaved(true);
      notifyProfileProgressChanged();
      navigate(nextDestination, { replace: true });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to save your choices'));
    } finally {
      setSaving(false);
    }
  };

  const skipPicks = () => {
    navigate(nextDestination, { replace: true });
  };

  if (loading) {
    return <Loading text="Loading your profile options..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="gradient" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-6xl">
            {error && <ErrorAlert message={error} className="mb-4" />}

            {saved && <SuccessAlert message="Profile choices saved." className="mb-4" />}

            {features.length === 0 ? (
              <PurpleCard hover={false} className="p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile ready</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                  There are no feature choices configured for this profile yet.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg"
                >
                  Continue
                </button>
              </PurpleCard>
            ) : (
              <PurpleCard hover={false} className="overflow-hidden">
                <div className="sticky top-0 z-20 border-b border-purple-100 bg-white/95 p-5 backdrop-blur dark:border-purple-500/20 dark:bg-[#13131a]/95 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
                          Profile features
                        </p>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                          Complete your profile choices
                        </h1>
                      </div>
                    </div>

                    <div className="min-w-[220px]">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
                        <span>{selectedCount} of {features.length} features</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-purple-100 dark:bg-purple-950">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-purple-900 dark:border-purple-500/30 dark:bg-purple-950/30 dark:text-purple-100">
                    <div className="flex gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 text-white shadow-sm shadow-purple-500/30">
                        {isJobEligible ? <BriefcaseBusiness className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {isJobEligible
                            ? 'You are eligible to receive job matches'
                            : `Complete ${JOB_ELIGIBILITY_THRESHOLD}% of your profile choices to unlock job eligibility`}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed opacity-85">
                          {isJobEligible
                            ? 'Households can use your profile choices to match you with better opportunities.'
                            : `You can skip this for now, but add ${remainingEligibilityPercent}% more profile choices to become eligible for stronger job matching.`}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-4 py-4 sm:px-5">
                  <div className="grid gap-3">
                    {features.map((feature) => {
                      const featureSelections = selected[feature.feature_id] || [];
                      const featureComplete = featureSelections.length > 0;
                      const open = openFeatures.has(feature.feature_id);

                      return (
                        <PreferenceAccordion
                          key={feature.feature_id}
                          title={getFeatureName(feature, profileType)}
                          summary={featureComplete
                            ? `${featureSelections.length} selected`
                            : `${(feature.properties || []).length} options`}
                          complete={featureComplete}
                          open={open}
                          onToggle={() => setOpenFeatures((current) => {
                            const next = new Set(current);
                            if (next.has(feature.feature_id)) next.delete(feature.feature_id);
                            else next.add(feature.feature_id);
                            return next;
                          })}
                        >
                          <FeatureOptionPicker
                            options={(feature.properties || []).map((property) => ({
                              id: Number(property.id),
                              label: property.name,
                              description: property.description,
                            }))}
                            selected={featureSelections}
                            multiple={!isSingleSelectFeature(String(feature.feature?.name || ''))}
                            onToggle={(propertyId) => toggleProperty(feature.feature_id, propertyId)}
                          />
                          {(feature.properties || []).filter((property) =>
                            featureSelections.includes(Number(property.id)) && allowsFreeText.has(Number(property.id))
                          ).map((property) => (
                                  <label key={property.id} className="mt-3 block">
                                    <span className="mb-1.5 block text-xs font-semibold text-purple-700 dark:text-purple-300">
                                      Tell us what it is
                                      <RequiredMark />
                                    </span>
                                    <input
                                      value={otherValues[Number(property.id)] || ''}
                                      onChange={(event) => setOtherValue(Number(property.id), event.target.value)}
                                      maxLength={MAX_OTHER_LENGTH}
                                      required
                                      aria-required="true"
                                      placeholder={`Add a ${getFeatureName(feature, profileType).toLowerCase()} not listed above`}
                                      className={INPUT_CLASS}
                                    />
                                    <span className="mt-1 block text-[11px] text-gray-500 dark:text-gray-400">
                                      Shown on your profile. It is not used for matching yet.
                                    </span>
                                  </label>
                          ))}
                        </PreferenceAccordion>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-purple-100 bg-white/95 p-5 backdrop-blur dark:border-purple-500/20 dark:bg-[#13131a]/95 sm:p-6">
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={skipPicks}
                      disabled={saving}
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-purple-200 px-5 font-semibold text-purple-700 transition-colors hover:bg-purple-50 disabled:opacity-50 dark:border-purple-500/30 dark:text-purple-200 dark:hover:bg-purple-950/30"
                    >
                      Skip for now
                    </button>
                    <button
                      type="button"
                      onClick={savePicks}
                      disabled={!canSave || saving}
                      className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 font-semibold text-white shadow-lg transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : `Save ${selectedPropertyIds.length} choices`}
                    </button>
                  </div>
                </div>
              </PurpleCard>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
    </div>
  );
}
