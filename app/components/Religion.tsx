import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useOnboardingOptionsContext } from '~/contexts/OnboardingOptionsContext';

// Religions are now fetched from backend via context

interface ReligionProps {
  userType?: 'househelp' | 'household';
}

const Religion: React.FC<ReligionProps> = ({ userType = 'househelp' }) => {
  const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
  const { options, loading: optionsLoading } = useOnboardingOptionsContext();
  const [selectedReligion, setSelectedReligion] = useState<string>('');
  const [customReligion, setCustomReligion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const RELIGIONS = options?.religions.map(r => r.name) || [];

  // Populate from context (instant on back-nav)
  useEffect(() => {
    const cached = profileData.religion;
    if (cached) {
      const val = typeof cached === 'string' ? cached : cached.religion;
      if (val) {
        if (RELIGIONS.includes(val)) { setSelectedReligion(val); }
        else { setSelectedReligion('Other'); setCustomReligion(val); }
      }
    }
  }, [profileData.religion]);

  // Load existing data from backend (fallback)
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAccessTokenFromCookies();
        if (!token) return;

        const data = await grpcProfileService.getCurrentHouseholdProfile('');
        if (data?.religion) {
          if (RELIGIONS.includes(data.religion)) {
            setSelectedReligion(data.religion);
          } else {
            setSelectedReligion('Other');
            setCustomReligion(data.religion);
          }
        }
      } catch (err) {
        console.error('Failed to load religion:', err);
      }
    };
    loadData();
  }, []);

  const handleReligionChange = async (religion: string) => {
    setSelectedReligion(religion);
    markDirty();
    if (religion !== 'Other') {
      setCustomReligion('');
      // Auto-save if it's not 'Other'
      await saveReligion(religion);
    }
    setError('');
  };

  const saveReligion = async (religionValue: string) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getAccessTokenFromCookies();

      await grpcProfileService.updateHouseholdProfile('', 'household', {
        religion: religionValue,
        _step_metadata: {
          step_id: 'religion',
          step_number: 6,
          is_completed: true
        }
      });

      markClean();
      updateStepData('religion', religionValue);
      setSuccess('Religion preferences saved automatically!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(handleApiError(err, 'religion', 'Failed to save religion preferences. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReligion) {
      setError('Please select your religion or belief system');
      return;
    }

    if (selectedReligion === 'Other' && !customReligion.trim()) {
      setError('Please specify your religion or belief system');
      return;
    }

    const finalReligion = selectedReligion === 'Other' ? customReligion.trim() : selectedReligion;
    await saveReligion(finalReligion);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🙏 Religion & Beliefs</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Please select your religion or belief system. This information helps us provide better matching and ensures cultural compatibility.
      </p>

      <div className="space-y-8">
        {/* Religion Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">
            Select your religion or belief system <span className="text-red-500">*</span>
          </h3>
          <div className="space-y-3">
            {RELIGIONS.map((religion) => (
              <label
                key={religion}
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  selectedReligion === religion 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <input
                  type="radio"
                  name="religion"
                  value={religion}
                  checked={selectedReligion === religion}
                  onChange={() => handleReligionChange(religion)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedReligion === religion 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  {selectedReligion === religion && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="flex-1">{religion}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Religion Input */}
        {selectedReligion === 'Other' && (
          <div className="space-y-3 p-5 bg-purple-50 dark:bg-purple-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-500/30">
            <label htmlFor="customReligion" className="block text-sm font-semibold text-purple-700 dark:text-purple-400">
              ✏️ Specify your religion or belief system <span className="text-red-500">*</span>
            </label>
            <input
              id="customReligion"
              type="text"
              value={customReligion}
              onChange={(e) => { setCustomReligion(e.target.value); markDirty(); }}
              placeholder="Enter your religion or belief system..."
              className="w-full h-10 px-4 py-2 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30"
              maxLength={100}
            />
            <div className="text-sm text-gray-500 dark:text-gray-400 text-right">
              {customReligion.length}/100 characters
            </div>
          </div>
        )}

        {error && <ErrorAlert message={error} />}

        {success && <SuccessAlert message={success} />}

        {selectedReligion === 'Other' && (
          <form onSubmit={handleSubmit}>
            <button
              type="submit"
              disabled={isSubmitting || !customReligion.trim()}
              className="w-full px-8 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Religion Preferences
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Religion;
