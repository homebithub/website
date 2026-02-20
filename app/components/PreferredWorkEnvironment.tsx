import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

const HOUSEHOLD_SIZES = [
  { value: 'small', label: 'Small (1-2 people)', icon: '👤' },
  { value: 'medium', label: 'Medium (3-4 people)', icon: '👥' },
  { value: 'large', label: 'Large (5+ people)', icon: '👨‍👩‍👧‍👦' },
  { value: 'any', label: 'Any size', icon: '✨' }
];

const LOCATION_TYPES = [
  { value: 'urban', label: 'Urban/City', icon: '🏙️' },
  { value: 'suburban', label: 'Suburban', icon: '🏘️' },
  { value: 'rural', label: 'Rural/Countryside', icon: '🌾' },
  { value: 'any', label: 'Any location', icon: '🌍' }
];

const FAMILY_TYPES = [
  { value: 'single', label: 'Single person', icon: '👤' },
  { value: 'couple', label: 'Couple (no kids)', icon: '💑' },
  { value: 'young_family', label: 'Young family (with kids)', icon: '👨‍👩‍👧' },
  { value: 'elderly', label: 'Elderly care', icon: '👴' },
  { value: 'any', label: 'Any family type', icon: '❤️' }
];

const PreferredWorkEnvironment: React.FC = () => {
  const { markDirty, markClean } = useProfileSetup();
  const [householdSize, setHouseholdSize] = useState<string>('');
  const [locationType, setLocationType] = useState<string>('');
  const [familyType, setFamilyType] = useState<string>('');
  const [additionalPreferences, setAdditionalPreferences] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.preferred_household_size) setHouseholdSize(data.preferred_household_size);
          if (data.preferred_location_type) setLocationType(data.preferred_location_type);
          if (data.preferred_family_type) setFamilyType(data.preferred_family_type);
          if (data.work_environment_notes) setAdditionalPreferences(data.work_environment_notes);
        }
      } catch (err) {
        console.error('Failed to load work environment data:', err);
      }
    };

    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          updates: {
            preferred_household_size: householdSize,
            preferred_location_type: locationType,
            preferred_family_type: familyType,
            work_environment_notes: additionalPreferences,
          },
          _step_metadata: {
            step_id: "workenvironment",
            step_number: 11,
            is_completed: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save preferences');
      }

      markClean();
      setSuccess('Work environment preferences saved successfully!');
    } catch (err: any) {
      setError(handleApiError(err, 'workEnvironment', 'Failed to save your preferences. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🏡 Preferred Work Environment</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        What type of household would you prefer to work with? (Optional)
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Household Size */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Household Size</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {HOUSEHOLD_SIZES.map((size) => (
              <label 
                key={size.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  householdSize === size.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <input
                  type="radio"
                  name="householdSize"
                  value={size.value}
                  checked={householdSize === size.value}
                  onChange={(e) => { setHouseholdSize(e.target.value); markDirty(); }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  householdSize === size.value 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  {householdSize === size.value && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-lg">{size.icon}</span>
                <span className="flex-1">{size.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Location Type */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Location Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {LOCATION_TYPES.map((location) => (
              <label 
                key={location.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  locationType === location.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <input
                  type="radio"
                  name="locationType"
                  value={location.value}
                  checked={locationType === location.value}
                  onChange={(e) => { setLocationType(e.target.value); markDirty(); }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  locationType === location.value 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  {locationType === location.value && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-lg">{location.icon}</span>
                <span className="flex-1">{location.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Family Type */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">Family Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {FAMILY_TYPES.map((family) => (
              <label 
                key={family.value}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  familyType === family.value
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <input
                  type="radio"
                  name="familyType"
                  value={family.value}
                  checked={familyType === family.value}
                  onChange={(e) => { setFamilyType(e.target.value); markDirty(); }}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  familyType === family.value 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  {familyType === family.value && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-lg">{family.icon}</span>
                <span className="flex-1">{family.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Preferences */}
        <div className="space-y-3">
          <label htmlFor="additionalPreferences" className="block text-sm font-semibold text-purple-700 dark:text-purple-400">
            📝 Additional Preferences (Optional)
          </label>
          <textarea
            id="additionalPreferences"
            value={additionalPreferences}
            onChange={(e) => { setAdditionalPreferences(e.target.value); markDirty(); }}
            placeholder="Any other preferences about your ideal work environment? (e.g., quiet household, active family, specific requirements)"
            rows={4}
            className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 resize-none"
          />
        </div>

        {success && <SuccessAlert message={success} />}

        {error && <ErrorAlert message={error} />}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
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
                💾 Save
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PreferredWorkEnvironment;
