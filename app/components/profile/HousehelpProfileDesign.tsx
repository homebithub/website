import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { API_BASE_URL } from '~/config/api';
import { Navigation } from '~/components/Navigation';
import { Footer } from '~/components/Footer';
import { PurpleThemeWrapper } from '~/components/layout/PurpleThemeWrapper';

type Variant = 'v1' | 'v2' | 'v3';

type HousehelpData = Record<string, any>;

const variantStyles: Record<Variant, { panel: string; badge: string }> = {
  v1: {
    panel: 'bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
  v2: {
    panel: 'bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
  v3: {
    panel: 'bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30',
    badge: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  },
};

function parseList(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (!value) return [];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
      if (typeof parsed === 'string') {
        const nested = JSON.parse(parsed);
        if (Array.isArray(nested)) return nested.filter(Boolean).map(String);
      }
    } catch {
      return trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }
  return [];
}

function normalizeProfile(response: any): HousehelpData {
  const raw = response?.data || response || {};
  const user = raw.user || {};

  return {
    ...raw,
    first_name: raw.first_name || user.first_name || '',
    last_name: raw.last_name || user.last_name || '',
    can_work_with_kids: raw.can_work_with_kids ?? raw.can_work_with_kid,
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    languages: parseList(raw.languages),
    certifications_list: parseList(raw.certifications),
    skills_list: parseList(raw.skills),
    traits_list: parseList(raw.traits),
    references_list: parseList(raw.references || raw.reference),
    off_days_list: parseList(raw.off_days),
  };
}

function formatDate(value?: string) {
  if (!value) return 'Not specified';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return 'Not specified';
  return d.toLocaleDateString();
}

function formatMoney(value?: number, frequency?: string) {
  if (!value) return 'Not specified';
  const amount = `KES ${Number(value).toLocaleString()}`;
  return frequency ? `${amount} / ${frequency}` : amount;
}

function yesNo(value: any) {
  if (value === undefined || value === null) return 'Not specified';
  return value ? 'Yes' : 'No';
}

function availabilitySummary(availability: any): string {
  if (!availability || typeof availability !== 'object') return 'Not specified';
  const days = Object.entries(availability)
    .filter(([, slots]) => slots && typeof slots === 'object' && Object.values(slots as Record<string, boolean>).some(Boolean))
    .map(([day]) => day);
  return days.length ? days.join(', ') : 'No active slots selected';
}

export default function HousehelpProfileDesign({ variant }: { variant: Variant }) {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<HousehelpData | null>(null);
  const [loading, setLoading] = useState(true);

  const styles = variantStyles[variant];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login?redirect=' + encodeURIComponent(window.location.pathname));
          return;
        }

        const res = await fetch(`${API_BASE_URL}/api/v1/profile/househelp/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setProfile(normalizeProfile(data));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const fullName = useMemo(() => `${profile?.first_name || 'Househelp'} ${profile?.last_name || ''}`.trim(), [profile]);

  const editButton = 'px-3 py-0.5 text-xs rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-semibold hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white transition-all';
  const sectionCard = 'rounded-2xl p-4 bg-white dark:bg-[#13131a] border border-purple-200/40 dark:border-purple-500/30';
  const valueText = 'text-sm text-gray-900 dark:text-gray-100';
  const keyText = 'text-gray-500 dark:text-gray-400';

  const goEdit = (section: string) => navigate('/profile-setup/househelp', { state: { fromProfile: true, editSection: section } });

  const photosSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Photos ({profile?.photos?.length || 0})</h2>
        <button className={editButton} onClick={() => goEdit('photos')}>✏️ Edit</button>
      </div>
      {profile?.photos?.length ? (
        <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2'>
          {profile.photos.map((photo: string, idx: number) => (
            <img key={idx} src={photo} alt={`photo-${idx}`} className='h-24 w-full object-cover rounded-lg border border-purple-200 dark:border-purple-500/30' />
          ))}
        </div>
      ) : (
        <p className='text-xs text-gray-500 dark:text-gray-400'>No photos uploaded yet</p>
      )}
    </section>
  );

  const personalSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Personal Information</h2>
        <button className={editButton} onClick={() => goEdit('gender')}>✏️ Edit</button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        <p className={valueText}><span className={keyText}>Name:</span> {fullName}</p>
        <p className={valueText}><span className={keyText}>Gender:</span> {profile?.gender || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Date of Birth:</span> {formatDate(profile?.date_of_birth)}</p>
        <p className={valueText}><span className={keyText}>Religion:</span> {profile?.religion || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Marital Status:</span> {profile?.marital_status || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Education:</span> {profile?.education_level || 'Not specified'}</p>
      </div>
    </section>
  );

  const experienceSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Experience & Skills</h2>
        <button className={editButton} onClick={() => goEdit('experience')}>✏️ Edit</button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <p className={valueText}><span className={keyText}>Years of Experience:</span> {profile?.years_of_experience ?? 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Can Help With:</span> {profile?.can_help_with || 'Not specified'}</p>
        <p className={`${valueText} sm:col-span-2`}><span className={keyText}>Certifications:</span> {(profile?.certifications_list || []).join(', ') || 'Not specified'}</p>
        <p className={`${valueText} sm:col-span-2`}><span className={keyText}>Languages:</span> {(profile?.languages || []).join(', ') || 'Not specified'}</p>
        <p className={`${valueText} sm:col-span-2`}><span className={keyText}>Skills:</span> {(profile?.skills_list || []).join(', ') || 'Not specified'}</p>
        <p className={`${valueText} sm:col-span-2`}><span className={keyText}>Traits:</span> {(profile?.traits_list || []).join(', ') || 'Not specified'}</p>
      </div>
    </section>
  );

  const workSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Work Preferences</h2>
        <button className={editButton} onClick={() => goEdit('nannytype')}>✏️ Edit</button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        <p className={valueText}><span className={keyText}>Service Type:</span> {profile?.househelp_type || profile?.['househelp-type'] || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Work with Kids:</span> {yesNo(profile?.can_work_with_kids)}</p>
        <p className={valueText}><span className={keyText}>Work with Pets:</span> {yesNo(profile?.can_work_with_pets)}</p>
        <p className={valueText}><span className={keyText}>Live-in:</span> {yesNo(profile?.offers_live_in)}</p>
        <p className={valueText}><span className={keyText}>Day Worker:</span> {yesNo(profile?.offers_day_worker)}</p>
        <p className={valueText}><span className={keyText}>Off Days:</span> {(profile?.off_days_list || []).join(', ') || 'Not specified'}</p>
      </div>
    </section>
  );

  const compensationSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Compensation & Availability</h2>
        <button className={editButton} onClick={() => goEdit('salary')}>✏️ Edit</button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <p className={valueText}><span className={keyText}>Expected Salary:</span> {formatMoney(profile?.salary_expectation, profile?.salary_frequency)}</p>
        <p className={valueText}><span className={keyText}>Available From:</span> {formatDate(profile?.available_from)}</p>
        <p className={`${valueText} sm:col-span-2`}><span className={keyText}>Weekly Availability:</span> {availabilitySummary(profile?.availability)}</p>
      </div>
    </section>
  );

  const familySection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Family & Environment</h2>
        <button className={editButton} onClick={() => goEdit('workenvironment')}>✏️ Edit</button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
        <p className={valueText}><span className={keyText}>Has Kids:</span> {yesNo(profile?.has_kids)}</p>
        <p className={valueText}><span className={keyText}>Needs Accommodation:</span> {yesNo(profile?.needs_accommodation)}</p>
        <p className={valueText}><span className={keyText}>Concurrent Children:</span> {profile?.number_of_concurrent_children ?? 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Preferred Household:</span> {profile?.preferred_household_size || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Preferred Location:</span> {profile?.preferred_location_type || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Preferred Family:</span> {profile?.preferred_family_type || 'Not specified'}</p>
        <p className={`${valueText} sm:col-span-2 lg:col-span-3`}><span className={keyText}>Work Notes:</span> {profile?.work_environment_notes || 'Not specified'}</p>
      </div>
    </section>
  );

  const locationSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>Location & Verification</h2>
        <button className={editButton} onClick={() => goEdit('location')}>✏️ Edit</button>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
        <p className={valueText}><span className={keyText}>Town:</span> {profile?.town || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Address:</span> {profile?.address || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Mapbox ID:</span> {profile?.mapbox_id || 'Not specified'}</p>
        <p className={valueText}><span className={keyText}>Background Check Consent:</span> {yesNo(profile?.background_check_consent)}</p>
        <p className={valueText}><span className={keyText}>Verified:</span> {yesNo(profile?.verified)}</p>
        <p className={valueText}><span className={keyText}>Status:</span> {profile?.status || 'Not specified'}</p>
      </div>
    </section>
  );

  const referencesSection = (
    <section className={sectionCard}>
      <div className='flex justify-between items-center mb-3'>
        <h2 className='text-sm font-semibold text-purple-700 dark:text-purple-300'>References & Bio</h2>
        <div className='flex gap-2'>
          <button className={editButton} onClick={() => goEdit('references')}>✏️ References</button>
          <button className={editButton} onClick={() => goEdit('bio')}>✏️ Bio</button>
        </div>
      </div>
      <p className={valueText}><span className={keyText}>References:</span> {(profile?.references_list || []).join(', ') || 'Not specified'}</p>
      <p className={`${valueText} mt-3 leading-relaxed`}><span className={keyText}>Bio:</span> {profile?.bio || 'No bio provided yet.'}</p>
    </section>
  );

  const hero = (
    <section className={`rounded-2xl p-4 sm:p-6 ${styles.panel}`}>
      <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
        <div>
          <span className={`inline-flex text-[11px] px-2 py-1 rounded-full ${styles.badge}`}>Design {variant.slice(1)}</span>
          <h1 className='text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mt-2'>{fullName}</h1>
          <p className='text-xs text-gray-600 dark:text-gray-300 mt-1'>Same theme colors, different layout arrangement</p>
        </div>
        <button onClick={() => navigate('/househelp/public-profile')} className='px-3 py-1.5 text-xs rounded-lg bg-purple-600 text-white hover:bg-purple-700'>
          View Public Profile
        </button>
      </div>
    </section>
  );

  return (
    <div className='min-h-screen flex flex-col'>
      <Navigation />
      <PurpleThemeWrapper variant='gradient' bubbles={false} bubbleDensity='low' className='flex-1'>
        <main className='max-w-6xl mx-auto w-full px-4 py-6 sm:py-8'>
          {loading ? (
            <div className='text-sm text-gray-200'>Loading profile...</div>
          ) : (
            <div className='space-y-4'>
              {hero}

              {variant === 'v1' && (
                <>
                  {photosSection}
                  {personalSection}
                  {experienceSection}
                  {workSection}
                  {compensationSection}
                  {familySection}
                  {locationSection}
                  {referencesSection}
                </>
              )}

              {variant === 'v2' && (
                <div className='grid lg:grid-cols-12 gap-4'>
                  <div className='lg:col-span-7 space-y-4'>
                    {personalSection}
                    {workSection}
                    {familySection}
                    {referencesSection}
                  </div>
                  <div className='lg:col-span-5 space-y-4'>
                    {photosSection}
                    {experienceSection}
                    {compensationSection}
                    {locationSection}
                  </div>
                </div>
              )}

              {variant === 'v3' && (
                <>
                  <div className='grid md:grid-cols-3 gap-4'>
                    <div className='md:col-span-2'>{experienceSection}</div>
                    <div>{compensationSection}</div>
                  </div>
                  <div className='grid md:grid-cols-2 gap-4'>
                    {personalSection}
                    {workSection}
                  </div>
                  <div className='grid md:grid-cols-2 gap-4'>
                    {familySection}
                    {locationSection}
                  </div>
                  {photosSection}
                  {referencesSection}
                </>
              )}
            </div>
          )}
        </main>
      </PurpleThemeWrapper>
      <Footer />
    </div>
  );
}
