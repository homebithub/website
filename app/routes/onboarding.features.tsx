import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Check, ClipboardCheck } from 'lucide-react';
import { Navigation } from '~/components/Navigation';
import { Loading } from '~/components/Loading';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { PurpleCard } from '~/components/ui/PurpleCard';
import { profileFeatureService, userProfilePicksService } from '~/services/grpc/authServices';

type FeatureProperty = {
  id: number;
  name: string;
  description?: string;
  display_order?: number;
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
};

function getFeatureName(bundle: FeatureBundle) {
  return bundle.feature?.name || `Feature ${bundle.feature_id}`;
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

export default function OnboardingFeaturesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;
  const [profileId] = useState(locationState.profileId || getStoredValue('profile_id'));
  const [userProfileId] = useState(locationState.userProfileId || getStoredValue('user_profile_id'));
  const [profileType] = useState(locationState.profileType || getStoredValue('profile_type'));
  const [features, setFeatures] = useState<FeatureBundle[]>([]);
  const [selected, setSelected] = useState<Record<number, number[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
        const payload = await profileFeatureService.getProfileFeatures(profileId);

        if (!cancelled) {
          setFeatures(normalizeFeaturePayload(payload));
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
  }, [profileId]);

  const selectedCount = useMemo(
    () => features.filter((feature) => (selected[feature.feature_id] || []).length > 0).length,
    [features, selected],
  );
  const progress = features.length ? Math.round((selectedCount / features.length) * 100) : 0;
  const canFinish = useMemo(
    () => features.length > 0 && features.every((feature) => (selected[feature.feature_id] || []).length > 0),
    [features, selected],
  );
  const selectedPropertyIds = useMemo(
    () => Object.values(selected).flat(),
    [selected],
  );

  const toggleProperty = (featureId: number, propertyId: number) => {
    setSaved(false);
    setSelected((prev) => {
      const current = prev[featureId] || [];
      const next = current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId];
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
      await userProfilePicksService.addPicks(userProfileId, selectedPropertyIds.map((featurePropertyId) => ({
        feature_property_id: featurePropertyId,
        weight: 1,
      })));

      setSaved(true);
      navigate(profileType === 'household' ? '/household-choice' : '/profile-setup/househelp?step=1', {
        replace: true,
      });
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Unable to save your choices'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading text="Loading your profile options..." />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
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
                </div>

                <div className="max-h-[calc(100vh-250px)] overflow-y-auto px-5 py-5 sm:px-6">
                  <div className="grid gap-5">
                    {features.map((feature, featureIndex) => {
                      const featureSelections = selected[feature.feature_id] || [];
                      const featureComplete = featureSelections.length > 0;

                      return (
                        <section
                          key={feature.feature_id}
                          className={`rounded-2xl border-2 bg-white/80 p-4 transition-colors dark:bg-gray-900/40 sm:p-5 ${
                            featureComplete
                              ? 'border-purple-300 dark:border-purple-500/60'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              <span
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                                  featureComplete
                                    ? 'border-purple-600 bg-purple-600 text-white'
                                    : 'border-purple-200 text-purple-600 dark:border-purple-500/40 dark:text-purple-300'
                                }`}
                              >
                                {featureComplete ? <Check className="h-4 w-4" /> : featureIndex + 1}
                              </span>
                              <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {getFeatureName(feature)}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {(feature.properties || []).length} options
                                </p>
                              </div>
                            </div>
                            <span
                              className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                featureComplete
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-200'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                              }`}
                            >
                              {featureComplete ? `${featureSelections.length} selected` : 'Pending'}
                            </span>
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {(feature.properties || []).map((property) => {
                              const active = featureSelections.includes(Number(property.id));
                              return (
                                <button
                                  key={property.id}
                                  type="button"
                                  onClick={() => toggleProperty(feature.feature_id, Number(property.id))}
                                  className={`group relative min-h-[104px] rounded-2xl border-2 p-4 text-left transition-all ${
                                    active
                                      ? 'border-purple-500 bg-purple-50 shadow-md dark:bg-purple-900/40'
                                      : 'border-gray-200 bg-white/80 hover:border-purple-300 hover:bg-purple-50/70 dark:border-gray-700 dark:bg-gray-950/30 dark:hover:border-purple-500/60 dark:hover:bg-purple-950/20'
                                  }`}
                                >
                                  <span
                                    className={`absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border transition-all ${
                                      active
                                        ? 'border-purple-600 bg-purple-600 text-white'
                                        : 'border-gray-300 text-transparent group-hover:border-purple-400 dark:border-gray-600'
                                    }`}
                                  >
                                    <Check className="h-4 w-4" />
                                  </span>
                                  <span className="block pr-9 text-base font-semibold leading-snug text-gray-900 dark:text-white">
                                    {property.name}
                                  </span>
                                  {property.description && property.description !== property.name && (
                                    <span className="mt-2 block text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                      {property.description}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-purple-100 bg-white/95 p-5 backdrop-blur dark:border-purple-500/20 dark:bg-[#13131a]/95 sm:p-6">
                  <button
                    type="button"
                    onClick={savePicks}
                    disabled={!canFinish || saving}
                    className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-5 font-semibold text-white shadow-lg transition-opacity disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : `Save ${selectedPropertyIds.length} choices`}
                  </button>
                </div>
              </PurpleCard>
            )}
          </div>
        </main>
      </PurpleThemeWrapper>
    </div>
  );
}
