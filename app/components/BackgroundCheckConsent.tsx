import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

const BackgroundCheckConsent: React.FC = () => {
  const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
  const [consent, setConsent] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Populate from context (instant on back-nav)
  useEffect(() => {
    const cached = profileData.backgroundcheck;
    if (cached?.consent !== undefined) {
      setConsent(cached.consent);
    }
  }, [profileData.backgroundcheck]);

  // Load existing data from backend (fallback)
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAccessTokenFromCookies();
        if (!token) return;

        const data = await grpcProfileService.getCurrentHousehelpProfile('');
        if (data?.background_check_consent !== undefined) {
          setConsent(data.background_check_consent);
        }
      } catch (err) {
        console.error('Failed to load background check data:', err);
      }
    };

    loadData();
  }, []);

  const saveConsent = async (value: boolean) => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getAccessTokenFromCookies();
      await grpcProfileService.updateHousehelpFields('', 'househelp',
        { background_check_consent: value },
        { step_id: 'backgroundcheck', step_number: 13, is_completed: true }
      );

      markClean();
      updateStepData('backgroundcheck', { consent: value });
      setSuccess('Your preference has been saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(handleApiError(err, 'backgroundCheck', 'Failed to save your preference. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsentChange = async (value: boolean) => {
    setConsent(value);
    markDirty();
    await saveConsent(value);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🔍 Background Check Consent</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Are you willing to undergo a background verification check? (Optional)
      </p>
      
      <div className="space-y-6">
        {/* Information Box */}
        <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-500/30">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What is a background check?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
              <span>Verification of your identity and credentials</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
              <span>Confirmation of your work history and references</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
              <span>Criminal record check (if applicable)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 mt-0.5">✓</span>
              <span>Helps build trust with potential employers</span>
            </li>
          </ul>
          <p className="mt-4 text-sm text-blue-700 dark:text-blue-300 font-semibold">
            💡 Profiles with verified backgrounds are more likely to be hired
          </p>
        </div>

        {/* Consent Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Your Decision</h3>
          
          {/* Yes Option */}
          <label 
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer shadow-sm transition-all ${
              consent === true
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
          >
            <input
              type="radio"
              name="consent"
              value="yes"
              checked={consent === true}
              onChange={() => handleConsentChange(true)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              consent === true 
                ? 'border-purple-500 bg-purple-500' 
                : 'border-purple-300 dark:border-purple-500/50'
            }`}>
              {consent === true && (
                <div className="w-3 h-3 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-semibold">Yes, I consent</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                I am willing to undergo a background verification check. This will help build trust with potential employers and increase my chances of being hired.
              </p>
            </div>
          </label>

          {/* No Option */}
          <label 
            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer shadow-sm transition-all ${
              consent === false
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
            }`}
          >
            <input
              type="radio"
              name="consent"
              value="no"
              checked={consent === false}
              onChange={() => handleConsentChange(false)}
              className="sr-only"
            />
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
              consent === false 
                ? 'border-purple-500 bg-purple-500' 
                : 'border-purple-300 dark:border-purple-500/50'
            }`}>
              {consent === false && (
                <div className="w-3 h-3 rounded-full bg-white"></div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">⏸️</span>
                <span className="text-sm font-semibold">Not at this time</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                I prefer not to undergo a background check at this time. I understand this may affect my chances with some employers.
              </p>
            </div>
          </label>
        </div>

        {success && <SuccessAlert message={success} />}

        {error && <ErrorAlert message={error} />}

      </div>
    </div>
  );
};

export default BackgroundCheckConsent;
