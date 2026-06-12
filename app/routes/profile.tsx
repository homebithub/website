import React from "react";
import { Navigation } from "~/components/Navigation";
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';
import { Footer } from "~/components/Footer";
import { useAuth } from "~/contexts/useAuth";
import { useNavigate, useLocation } from "react-router";
import { Loading } from "~/components/Loading";
import { getAccessTokenFromCookies } from '~/utils/cookie';
import { authService } from '~/services/grpc/auth.service';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { Button, Input, BaseModal } from '~/components/ui';
import { cacheAuthSession, getStoredProfileType, getStoredUser, getStoredUserId } from "~/utils/authStorage";
import { profileFeatureService, userProfilePicksService } from '~/services/grpc/authServices';

const PROFILE_IDS_BY_TYPE: Record<string, string> = {
  househelp: '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff',
  household: '11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1',
};

const PROFILE_LABELS_BY_ID: Record<string, string> = {
  '6dbd5104-d314-4ef1-a7d3-37d7eb26ddff': 'HouseHelp',
  '11d1c188-33fa-4eef-b1e7-2e09a2e8d2f1': 'Household',
};

type CompletionState = {
  loading: boolean;
  selectedFeatures: number;
  selectedProperties: number;
  totalFeatures: number;
};

type UnknownRecord = Record<string, unknown>;

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
  properties?: FeatureProperty[];
};

function getStoredValue(key: string) {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(key) || '';
}

function setStoredValue(key: string, value: string) {
  if (typeof window === 'undefined' || !value) return;
  window.localStorage.setItem(key, value);
}

function resolveProfileId(profileType?: string) {
  const storedProfileId = getStoredValue('profile_id');
  if (storedProfileId) return storedProfileId;
  return PROFILE_IDS_BY_TYPE[String(profileType || '').toLowerCase()] || '';
}

function resolveUserProfileId(...sources: unknown[]) {
  for (const source of sources) {
    const record = asRecord(source);
    const value = String(record.user_profile_id || record.userProfileId || '');
    if (value) return value;
  }
  return getStoredValue('user_profile_id');
}

function resolveProfileLabel(profileId?: string, profileType?: string) {
  if (profileId && PROFILE_LABELS_BY_ID[profileId]) return PROFILE_LABELS_BY_ID[profileId];
  const normalized = String(profileType || '').toLowerCase();
  if (normalized === 'househelp') return 'HouseHelp';
  if (normalized === 'household') return 'Household';
  return profileType || '-';
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? value as UnknownRecord : {};
}

function normalizeArray(value: unknown): UnknownRecord[] {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (Array.isArray(record.data)) return record.data as UnknownRecord[];
    if (Array.isArray(record.picks)) return record.picks as UnknownRecord[];
    if (Array.isArray(record.items)) return record.items as UnknownRecord[];
  }
  return [];
}

function getFeatureId(feature: UnknownRecord) {
  const nestedFeature = asRecord(feature.feature);
  return Number(feature.feature_id || feature.featureId || nestedFeature.id || 0);
}

function getFeatureName(feature: FeatureBundle) {
  return feature.feature?.name || `Feature ${feature.feature_id}`;
}

function normalizeFeaturePayload(payload: unknown): FeatureBundle[] {
  const envelope = asRecord(payload);
  const nestedData = asRecord(envelope.data);
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
    .map((bundle) => {
      const record = asRecord(bundle);
      const feature = asRecord(record.feature);
      const properties = Array.isArray(record.properties) ? record.properties : [];
      return {
        feature_id: Number(record.feature_id || record.featureId || feature.id || 0),
        feature: {
          id: Number(feature.id || record.feature_id || record.featureId || 0),
          name: String(feature.name || ''),
          display_order: Number(feature.display_order || feature.displayOrder || 0),
        },
        display_order: Number(record.display_order || record.displayOrder || feature.display_order || 0),
        properties: properties
          .map((property) => {
            const propertyRecord = asRecord(property);
            return {
              id: Number(propertyRecord.id || 0),
              name: String(propertyRecord.name || ''),
              description: String(propertyRecord.description || ''),
              display_order: Number(propertyRecord.display_order || propertyRecord.displayOrder || 0),
            };
          })
          .filter((property) => property.id && property.name)
          .sort((a, b) => Number(a.display_order || 0) - Number(b.display_order || 0)),
      };
    })
    .filter((bundle) => bundle.feature_id && (bundle.properties || []).length > 0)
    .sort((a, b) => Number(a.display_order || a.feature?.display_order || 0) - Number(b.display_order || b.feature?.display_order || 0));
}

function getPickPropertyId(pick: UnknownRecord) {
  const featureProperty = asRecord(pick.feature_property);
  const property = asRecord(pick.property);
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

function formatMemberSince(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function buildCachedProfile(contextUser: unknown) {
  const authUser = asRecord(asRecord(contextUser).user || contextUser);
  const storedUser = getStoredUser() || {};
  const profileType = String(authUser.profile_type || storedUser.profile_type || getStoredProfileType() || '');
  const profileId = resolveProfileId(profileType);
  const createdAt = storedUser.user_profile_created_at || getStoredValue('user_profile_created_at') || authUser.created_at || storedUser.created_at;

  return {
    id: String(authUser.user_id || authUser.id || storedUser.user_id || storedUser.id || getStoredUserId() || ''),
    email: String(authUser.email || storedUser.email || ''),
    first_name: String(authUser.first_name || authUser.firstName || storedUser.first_name || storedUser.firstName || ''),
    last_name: String(authUser.last_name || authUser.lastName || storedUser.last_name || storedUser.lastName || ''),
    phone: String(authUser.phone || storedUser.phone || ''),
    profile_type: profileType,
    profile_id: profileId,
    user_profile_id: resolveUserProfileId(authUser, storedUser),
    user_profile_created_at: formatMemberSince(createdAt),
    is_verified: Boolean(authUser.is_verified ?? authUser.isVerified ?? storedUser.is_verified ?? storedUser.isVerified ?? false),
    profile_image: String(authUser.profile_image || authUser.profileImage || storedUser.profile_image || storedUser.profileImage || ''),
    country: String(authUser.country || storedUser.country || 'Kenya'),
    created_at: formatMemberSince(authUser.created_at || storedUser.created_at || createdAt),
  };
}

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = React.useState<any>(null);
  const [editMode, setEditMode] = React.useState(false);
  const [form, setForm] = React.useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
  });
  const [profileLoading, setProfileLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string|null>(null);
  const [success, setSuccess] = React.useState<string|null>(null);
  const [completionRefreshKey, setCompletionRefreshKey] = React.useState(0);
  const [completion, setCompletion] = React.useState<CompletionState>({
    loading: true,
    selectedFeatures: 0,
    selectedProperties: 0,
    totalFeatures: 0,
  });
  const [showFeatureModal, setShowFeatureModal] = React.useState(false);
  const [featureLoading, setFeatureLoading] = React.useState(false);
  const [featureSaving, setFeatureSaving] = React.useState(false);
  const [featureError, setFeatureError] = React.useState<string | null>(null);
  const [features, setFeatures] = React.useState<FeatureBundle[]>([]);
  const [selectedFeatureProperties, setSelectedFeatureProperties] = React.useState<Record<number, number[]>>({});

  // OTP Modal States
  const [showEmailModal, setShowEmailModal] = React.useState(false);
  const [showPhoneModal, setShowPhoneModal] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const [newPhone, setNewPhone] = React.useState('');
  const [otpCode, setOtpCode] = React.useState('');
  const [currentVerificationType, setCurrentVerificationType] = React.useState<'email' | 'phone' | null>(null);
  const [otpLoading, setOtpLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = React.useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = React.useState(60);
  const [canResend, setCanResend] = React.useState(false);

  const resolveCurrentUserId = React.useCallback(() => {
    return profile?.id || user?.user?.user_id || getStoredUserId();
  }, [profile?.id, user]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      const returnUrl = encodeURIComponent(location.pathname);
      navigate(`/login?redirect=${returnUrl}`);
    }
  }, [user, loading, navigate, location.pathname]);

  React.useEffect(() => {
    const fetchProfile = async () => {
      const token = getAccessTokenFromCookies();
      if (!token) { setProfileLoading(false); return; }
      try {
        setError(null);
        setSuccess(null);
        const data = buildCachedProfile(user);
        setStoredValue('user_profile_id', data.user_profile_id);
        setStoredValue('profile_id', data.profile_id);

        setProfile(data);
        setForm({
          email: data.email || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    };
    if (user) fetchProfile();
    else setProfileLoading(false);
  }, [user]);

  React.useEffect(() => {
    let cancelled = false;

    async function loadCompletion() {
      const profileId = profile?.profile_id || resolveProfileId(profile?.profile_type);
      const userProfileId = profile?.user_profile_id || getStoredValue('user_profile_id');

      if (!profileId || !userProfileId) {
        setCompletion({
          loading: false,
          selectedFeatures: 0,
          selectedProperties: 0,
          totalFeatures: 0,
        });
        return;
      }

      setCompletion((prev) => ({ ...prev, loading: true }));

      try {
        const [featuresPayload, picksPayload] = await Promise.all([
          profileFeatureService.getProfileFeatures(profileId),
          userProfilePicksService.listPicks(userProfileId),
        ]);

        const features = normalizeArray(featuresPayload.data);
        const picks = normalizeArray(picksPayload.data);
        const propertyToFeature = new Map<number, number>();

        features.forEach((feature) => {
          const featureId = getFeatureId(feature);
          const properties = Array.isArray(feature.properties) ? feature.properties : [];
          properties.forEach((property) => {
            const propertyRecord = asRecord(property);
            const propertyId = Number(propertyRecord.id || 0);
            if (featureId && propertyId) propertyToFeature.set(propertyId, featureId);
          });
        });

        const selectedPropertyIds = new Set<number>();
        const selectedFeatureIds = new Set<number>();

        picks.forEach((pick) => {
          const propertyId = getPickPropertyId(pick);
          if (!propertyId) return;
          selectedPropertyIds.add(propertyId);
          const feature = asRecord(pick.feature);
          const featureProperty = asRecord(pick.feature_property);
          const property = asRecord(pick.property);

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

    if (profile) loadCompletion();
    return () => {
      cancelled = true;
    };
  }, [profile, completionRefreshKey]);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (resendSeconds <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setResendSeconds(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendSeconds]);

  const selectedFeatureCount = React.useMemo(
    () => features.filter((feature) => (selectedFeatureProperties[feature.feature_id] || []).length > 0).length,
    [features, selectedFeatureProperties],
  );
  const featureProgress = features.length ? Math.round((selectedFeatureCount / features.length) * 100) : 0;
  const selectedPropertyIds = React.useMemo(
    () => Object.values(selectedFeatureProperties).flat(),
    [selectedFeatureProperties],
  );
  const canSaveFeaturePicks = selectedPropertyIds.length > 0;

  const loadFeaturePicker = React.useCallback(async () => {
    const resolvedProfileId = profile?.profile_id || resolveProfileId(profile?.profile_type);
    const userProfileId = profile?.user_profile_id || getStoredValue('user_profile_id');

    if (!resolvedProfileId) {
      setFeatureError('Profile information is missing. Please sign in again.');
      return;
    }

    setFeatureLoading(true);
    setFeatureError(null);

    try {
      const [featuresPayload, picksPayload] = await Promise.all([
        profileFeatureService.getProfileFeatures(resolvedProfileId),
        userProfileId
          ? userProfilePicksService.listPicks(userProfileId)
          : Promise.resolve(null),
      ]);

      const nextFeatures = normalizeFeaturePayload(featuresPayload);
      const nextSelected: Record<number, number[]> = {};

      if (picksPayload) {
        const propertyToFeature = new Map<number, number>();
        nextFeatures.forEach((feature) => {
          (feature.properties || []).forEach((property) => propertyToFeature.set(property.id, feature.feature_id));
        });

        normalizeArray(picksPayload.data).forEach((pick) => {
          const propertyId = getPickPropertyId(pick);
          const featureId = Number(pick.feature_id || pick.featureId || propertyToFeature.get(propertyId) || 0);
          if (!propertyId || !featureId) return;
          nextSelected[featureId] = Array.from(new Set([...(nextSelected[featureId] || []), propertyId]));
        });
      }

      setFeatures(nextFeatures);
      setSelectedFeatureProperties(nextSelected);
    } catch (err: unknown) {
      setFeatureError(err instanceof Error ? err.message : 'Unable to load profile features');
    } finally {
      setFeatureLoading(false);
    }
  }, [profile?.profile_id, profile?.profile_type, profile?.user_profile_id]);

  const handleEdit = () => {
    setShowFeatureModal(true);
    void loadFeaturePicker();
  };
  const handleCancel = () => {
    setEditMode(false);
    setForm({
      email: profile?.email || '',
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
    });
    setError(null);
    setSuccess(null);
  };

  const toggleFeatureProperty = (featureId: number, propertyId: number) => {
    setSelectedFeatureProperties((prev) => {
      const current = prev[featureId] || [];
      const next = current.includes(propertyId)
        ? current.filter((id) => id !== propertyId)
        : [...current, propertyId];
      return { ...prev, [featureId]: next };
    });
  };

  const saveFeaturePicks = async () => {
    const userProfileId = profile?.user_profile_id || getStoredValue('user_profile_id');
    if (!userProfileId) {
      setFeatureError('User profile information is missing. Please sign in again.');
      return;
    }

    setFeatureSaving(true);
    setFeatureError(null);

    try {
      await userProfilePicksService.addPicks(userProfileId, selectedPropertyIds.map((featurePropertyId) => ({
        feature_property_id: featurePropertyId,
        weight: 1,
      })));

      setSuccess('Profile choices saved.');
      setShowFeatureModal(false);
      setCompletionRefreshKey((prev) => prev + 1);
    } catch (err: unknown) {
      setFeatureError(err instanceof Error ? err.message : 'Unable to save profile picks');
    } finally {
      setFeatureSaving(false);
    }
  };

  // Handle email change - send OTP
  const handleEmailChange = async () => {
    if (!newEmail || newEmail === profile?.email) {
      setOtpError('Please enter a different email address');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const result = await authService.updateEmail(resolveCurrentUserId(), newEmail);
      const verification = result.getVerification?.();

      if (verification?.getId?.()) {
        setCurrentVerificationType('email');
        const nextResendAt = verification.getNextResendAt?.()?.toDate?.()?.getTime?.() || null;
        const waitSeconds = nextResendAt ? Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000)) : 60;
        setResendSeconds(waitSeconds);
        setCanResend(waitSeconds <= 0);
        setOtpSuccess('OTP sent to your new email address');
      } else {
        await fetchProfile();
        setOtpSuccess('Email updated successfully!');
        setTimeout(() => {
          setShowEmailModal(false);
          resetOtpState();
        }, 2000);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to update email');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle phone change - send OTP
  const handlePhoneChange = async () => {
    if (!newPhone || newPhone === profile?.phone) {
      setOtpError('Please enter a different phone number');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const result = await authService.updatePhone(resolveCurrentUserId(), newPhone);
      const verification = result.getVerification?.();

      if (verification?.getId?.()) {
        setCurrentVerificationType('phone');
        const nextResendAt = verification.getNextResendAt?.()?.toDate?.()?.getTime?.() || null;
        const waitSeconds = nextResendAt ? Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000)) : 60;
        setResendSeconds(waitSeconds);
        setCanResend(waitSeconds <= 0);
        setOtpSuccess('OTP sent to your new phone number');
      } else {
        await fetchProfile();
        setOtpSuccess('Phone updated successfully!');
        setTimeout(() => {
          setShowPhoneModal(false);
          resetOtpState();
        }, 2000);
      }
    } catch (err: any) {
      setOtpError(err.message || 'Failed to update phone');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify OTP and complete email/phone change
  const handleVerifyOtp = async () => {
    if (!otpCode || !currentVerificationType) {
      setOtpError('Please enter the OTP code');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const verifyResponse = await authService.verifyOTP(resolveCurrentUserId(), currentVerificationType, otpCode);
      const userProto = verifyResponse?.getUser?.();
      const token = verifyResponse?.getToken?.();
      const refreshToken = verifyResponse?.getRefreshToken?.();

      if (token && userProto) {
        cacheAuthSession({
          token,
          refreshToken,
          user: {
            id: userProto.getId?.() || "",
            user_id: userProto.getId?.() || "",
            email: userProto.getEmail?.() || "",
            phone: userProto.getPhone?.() || "",
            first_name: userProto.getFirstName?.() || "",
            last_name: userProto.getLastName?.() || "",
            profile_type: userProto.getProfileType?.() || "",
            is_verified: userProto.getIsVerified?.() || false,
            profile_image: userProto.getProfileImage?.() || "",
          },
        });
      }

      await fetchProfile();
      setOtpSuccess(`${currentVerificationType === 'email' ? 'Email' : 'Phone'} updated successfully!`);

      setTimeout(() => {
        setShowEmailModal(false);
        setShowPhoneModal(false);
        resetOtpState();
      }, 2000);

    } catch (err: any) {
      setOtpError(err.message || 'Failed to verify OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!currentVerificationType) return;

    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccess(null);

    try {
      const response = await authService.resendOTP(resolveCurrentUserId(), currentVerificationType);
      const verification = response?.getVerification?.();

      setOtpCode('');
      const nextResendAt = verification?.getNextResendAt?.()?.toDate?.()?.getTime?.() || null;
      const waitSeconds = nextResendAt ? Math.max(0, Math.ceil((nextResendAt - Date.now()) / 1000)) : 60;
      setResendSeconds(waitSeconds);
      setCanResend(waitSeconds <= 0);
      setOtpSuccess('OTP resent successfully');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  // Reset OTP state
  const resetOtpState = () => {
    setNewEmail('');
    setNewPhone('');
    setOtpCode('');
    setCurrentVerificationType(null);
    setOtpError(null);
    setOtpSuccess(null);
    setResendSeconds(60);
    setCanResend(false);
  };

  // Refetch profile function
  const fetchProfile = async () => {
    const token = getAccessTokenFromCookies();
    if (!token) return;

    try {
      const data = buildCachedProfile(user);
      setStoredValue('user_profile_id', data.user_profile_id);
      setStoredValue('profile_id', data.profile_id);
      setProfile(data);
      setForm({
        email: data.email || '',
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
      });
    } catch (err) {
      console.error('Failed to refetch profile:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const token = getAccessTokenFromCookies();
      if (!token) throw new Error('No auth token');
      await authService.updateUser('', {
        email: form.email,
        firstName: form.first_name,
        lastName: form.last_name,
        phone: form.phone,
      });
      setSuccess('Profile updated!');
      setEditMode(false);
      setProfile((p: any) => ({ ...p, ...form }));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const profileId = profile?.profile_id || resolveProfileId(profile?.profile_type);
  const profileLabel = resolveProfileLabel(profileId, profile?.profile_type);
  const memberSince = profile?.user_profile_created_at || profile?.created_at || '-';
  const completionPercent = completion.totalFeatures
    ? Math.min(100, Math.round((completion.selectedFeatures / completion.totalFeatures) * 100))
    : 0;

  if (loading || profileLoading) {
    return <Loading text="Loading profile..." />;
  }
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
          <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="max-w-xl w-full rounded-3xl border-2 border-red-200/60 dark:border-red-500/30 bg-white dark:bg-[#13131a] p-6 text-center shadow-xl">
              <p className="text-red-700 dark:text-red-300 font-semibold">
                Account data could not be loaded. Please refresh and try again.
              </p>
            </div>
          </main>
        </PurpleThemeWrapper>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <PurpleThemeWrapper variant="light" bubbles={false} bubbleDensity="low" className="flex-1">
        <main className="flex-1 flex flex-col justify-center items-center px-4 py-8">
          <div className="w-full max-w-3xl">
            <a href="/settings" className="inline-flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mb-4 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              Back to Settings
            </a>
          </div>
          <div className="w-full max-w-3xl bg-white dark:bg-[#13131a] rounded-3xl shadow-2xl dark:shadow-glow-md border-2 border-purple-200/40 dark:border-purple-500/30 p-8 transition-colors duration-300">
            <h1 className="text-lg sm:text-xl font-bold text-purple-700 dark:text-purple-300 mb-2 text-center">My Account</h1>
            <p className="text-center text-xs text-gray-600 dark:text-gray-400 mb-6">Manage your account information. Only email, name and phone are editable.</p>

            {error && <ErrorAlert message={error} className="mb-4" />}
            {success && <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-950/40 border-2 border-green-200 dark:border-emerald-500/40 p-4 shadow-md mb-4 transition-colors duration-300"><div className="flex items-center justify-center"><span className="text-lg mr-2">🎉</span><p className="text-xs font-bold text-green-800 dark:text-green-200">{success}</p></div></div>}

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">First Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleChange}
                      className="w-full h-10 px-4 py-2 rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      autoComplete="given-name"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {form.first_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">Last Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      className="w-full h-10 px-4 py-2 rounded-xl border border-purple-200/40 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-xs text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                      autoComplete="family-name"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                      {form.last_name || <span className="text-gray-400">-</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">Email</label>
                <div className="flex items-center">
                  <div className="flex-1 text-xs text-gray-900 dark:text-gray-100 font-medium">
                    {form.email || <span className="text-gray-500">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    aria-label="Edit Email"
                    onClick={() => setShowEmailModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>
              <div className="relative">
                <label className="block text-xs font-semibold mb-2 text-purple-700 dark:text-purple-400">Phone</label>
                <div className="flex items-center">
                  <div className="flex-1 text-xs text-gray-900 dark:text-gray-100 font-medium">
                    {form.phone || <span className="text-gray-500">-</span>}
                  </div>
                  <button
                    type="button"
                    className="ml-2 p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    aria-label="Edit Phone"
                    onClick={() => setShowPhoneModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3h3z" /></svg>
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-purple-200/40 dark:border-purple-500/20">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Profile Type</span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 font-medium">{profileLabel}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Email Verified</span>
                    <span className={`text-xs font-medium ${profile?.is_verified ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{profile?.is_verified ? 'Yes' : 'No'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Country</span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 font-medium">{profile?.country || '-'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold mb-1 text-gray-500 dark:text-gray-500">Member Since</span>
                    <span className="text-xs text-gray-900 dark:text-gray-100 font-medium">{memberSince}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-2xl border border-purple-200/40 dark:border-purple-500/20 bg-purple-50/60 dark:bg-purple-950/20 p-4">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div>
                      <span className="block text-xs font-semibold text-purple-700 dark:text-purple-300">Profile Completed</span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        {completion.loading
                          ? 'Loading feature selections...'
                          : `${completion.selectedFeatures} of ${completion.totalFeatures} features, ${completion.selectedProperties} properties selected`}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-purple-700 dark:text-purple-300">
                      {completion.loading ? '...' : `${completionPercent}%`}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white dark:bg-[#0a0a0f] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                </div>
              </div>
              {!editMode && (
                <Button
                  type="button"
                  onClick={handleEdit}
                  leftIcon={<span>✏️</span>}
                >
                  Edit Profile
                </Button>
              )}
              {editMode && (
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={handleSave}
                    isLoading={saving}
                    className="flex-1"
                    leftIcon={<span>🚀</span>}
                  >
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </form>
          </div>
        </main>
      </PurpleThemeWrapper>

      <BaseModal
        isOpen={showFeatureModal}
        onClose={() => {
          if (!featureSaving) setShowFeatureModal(false);
        }}
        title="Edit Profile"
        description="Choose the profile options that match you."
        size="full"
      >
        <div className="space-y-5">
          {featureError && <ErrorAlert message={featureError} />}

          {featureLoading ? (
            <div className="min-h-[360px] flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin" />
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">Loading profile features...</p>
              </div>
            </div>
          ) : features.length === 0 ? (
            <div className="rounded-2xl border border-purple-200/50 dark:border-purple-500/30 p-6 text-center">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">No profile features configured.</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-purple-200/50 bg-purple-50/70 p-4 dark:border-purple-500/30 dark:bg-purple-950/20">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-purple-700 dark:text-purple-300">
                  <span>{selectedFeatureCount} of {features.length} features</span>
                  <span>{featureProgress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white dark:bg-[#0a0a0f]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
                    style={{ width: `${featureProgress}%` }}
                  />
                </div>
              </div>

              <div className="max-h-[58vh] space-y-4 overflow-y-auto pr-1">
                {features.map((feature) => {
                  const properties = feature.properties || [];
                  const visibleProperties = properties.slice(0, 10);
                  const hiddenCount = Math.max(0, properties.length - visibleProperties.length);
                  const selectedCount = (selectedFeatureProperties[feature.feature_id] || []).length;

                  return (
                    <section
                      key={feature.feature_id}
                      className="rounded-2xl border border-purple-200/50 bg-white p-4 dark:border-purple-500/25 dark:bg-[#13131a]"
                    >
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-base font-extrabold text-gray-950 dark:text-white">
                          {getFeatureName(feature)}
                        </h2>
                        <span className="shrink-0 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-200">
                          {selectedCount} selected
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {visibleProperties.map((property) => {
                          const active = (selectedFeatureProperties[feature.feature_id] || []).includes(Number(property.id));
                          return (
                            <button
                              key={property.id}
                              type="button"
                              onClick={() => toggleFeatureProperty(feature.feature_id, Number(property.id))}
                              className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-left text-[11px] font-semibold transition-all ${
                                active
                                  ? 'border-purple-500 bg-purple-600 text-white shadow-sm'
                                  : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50 dark:border-gray-700 dark:bg-gray-950/40 dark:text-gray-200 dark:hover:border-purple-500/60'
                              }`}
                            >
                              <span
                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${
                                  active
                                    ? 'bg-white text-purple-700'
                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200'
                                }`}
                              >
                                {active ? '✓' : property.name.slice(0, 1).toUpperCase()}
                              </span>
                              <span className="truncate">
                                {property.name}
                              </span>
                            </button>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <button
                            type="button"
                            disabled
                            className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-purple-300 bg-purple-50 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 disabled:cursor-default dark:border-purple-500/50 dark:bg-purple-950/30 dark:text-purple-200"
                          >
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-[10px] dark:bg-purple-900">
                              +
                            </span>
                            {hiddenCount} more
                          </button>
                        )}
                      </div>
                    </section>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 border-t border-purple-200/40 pt-4 dark:border-purple-500/20 sm:flex-row">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowFeatureModal(false)}
                  disabled={featureSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={saveFeaturePicks}
                  isLoading={featureSaving}
                  disabled={!canSaveFeaturePicks}
                  className="flex-1"
                >
                  Save Choices
                </Button>
              </div>
            </>
          )}
        </div>
      </BaseModal>

      {/* Email Change Modal */}
      <BaseModal
        isOpen={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          resetOtpState();
        }}
        title="Change Email"
      >
        <div className="space-y-6">
          {!currentVerificationType ? (
            // Step 1: Enter new email
            <div className="space-y-4">
              <Input
                label="New Email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email address"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handleEmailChange}
                  isLoading={otpLoading}
                  disabled={!newEmail}
                  className="flex-1"
                >
                  Send OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEmailModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Enter OTP
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enter the OTP sent to {newEmail}
              </p>

              <Input
                label="OTP Code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center tracking-widest text-xl h-14"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  isLoading={otpLoading}
                  disabled={!otpCode}
                  className="flex-1"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowEmailModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-xs font-semibold hover:underline transition-colors"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    Resend available in {resendSeconds}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </BaseModal>

      {/* Phone Change Modal */}
      <BaseModal
        isOpen={showPhoneModal}
        onClose={() => {
          setShowPhoneModal(false);
          resetOtpState();
        }}
        title="Change Phone"
      >
        <div className="space-y-6">
          {!currentVerificationType ? (
            // Step 1: Enter new phone
            <div className="space-y-4">
              <Input
                label="New Phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter new phone number"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handlePhoneChange}
                  isLoading={otpLoading}
                  disabled={!newPhone}
                  className="flex-1"
                >
                  Send OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPhoneModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            // Step 2: Enter OTP
            <div className="space-y-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Enter the OTP sent to {newPhone}
              </p>

              <Input
                label="OTP Code"
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="text-center tracking-widest text-xl h-14"
              />

              {otpError && <ErrorAlert message={otpError} />}
              {otpSuccess && <SuccessAlert message={otpSuccess} />}

              <div className="flex gap-3">
                <Button
                  onClick={handleVerifyOtp}
                  isLoading={otpLoading}
                  disabled={!otpCode}
                  className="flex-1"
                >
                  Verify OTP
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowPhoneModal(false);
                    resetOtpState();
                  }}
                >
                  Cancel
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                {canResend ? (
                  <button
                    onClick={handleResendOtp}
                    disabled={otpLoading}
                    className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-xs font-semibold hover:underline transition-colors"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    Resend available in {resendSeconds}s
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </BaseModal>

      <Footer />
    </div>
  );
}
// Error boundary for better error handling
export { ErrorBoundary } from "~/components/ErrorBoundary";
