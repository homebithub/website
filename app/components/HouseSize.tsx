import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';

type HouseSizeOption = string;

const HOUSE_SIZE_OPTIONS: HouseSizeOption[] = [
  'Single room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedrooms'
];

const HouseSize: React.FC = () => {
  const { markDirty, markClean } = useProfileSetup();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const submit = useSubmit();

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.house_size) setSelectedSize(data.house_size);
          if (data.household_notes) setAdditionalDetails(data.household_notes);
        }
      } catch (err) {
        console.error('Failed to load house size:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Save house size to household profile
  const saveHouseSize = async (size?: string) => {
    const sizeToSave = size || selectedSize;
    if (!sizeToSave) {
      setError('Please select a house size');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          house_size: sizeToSave,
          household_notes: additionalDetails.trim() || "",
          _step_metadata: {
            step_id: "housesize",
            step_number: 1,
            is_completed: true
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save house size');
      }

      markClean();
      setSuccess('House size saved automatically!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(handleApiError(err, 'houseSize', 'Failed to save house size. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSizeChange = async (size: string) => {
    setSelectedSize(size);
    markDirty();
    await saveHouseSize(size);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">🏠 House Size</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Tell us about your home size
      </p>
      
      <div className="space-y-8">
        {/* House Size Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">
            Select your house size <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This helps us match you with the right help
          </p>
          <div className="space-y-3">
            {HOUSE_SIZE_OPTIONS.map((size) => (
              <label 
                key={size} 
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
                  selectedSize === size 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <input
                  type="radio"
                  name="houseSize"
                  value={size}
                  checked={selectedSize === size}
                  onChange={() => handleSizeChange(size)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedSize === size 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  {selectedSize === size && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="flex-1">{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details Text Area */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">
            📝 Additional Details (Optional)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Any special details about your home?
          </p>
          <div className="mt-1">
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              rows={4}
              value={additionalDetails}
              onChange={(e) => { setAdditionalDetails(e.target.value); markDirty(); }}
              className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
              placeholder="e.g., House has stairs, large garden, pets, specific cleaning requirements, etc."
              maxLength={500}
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
              {additionalDetails.length}/500 characters
            </div>
          </div>
        </div>

        {error && <ErrorAlert message={error} />}

        {success && <SuccessAlert message={success} />}

        {/* Save Button */}
        <button
          type="button"
          onClick={saveHouseSize}
          disabled={isSubmitting || !selectedSize}
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
              💾 Save House Size
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HouseSize;
