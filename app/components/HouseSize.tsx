import React, { useState } from 'react';
import { useSubmit } from 'react-router';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../utils/errorMessages';

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
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submit = useSubmit();

  // Auto-save when house size is selected
  const saveHouseSize = async (size: string) => {
    if (!size) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/v1/household-preferences/house-size`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          house_size: size.toLowerCase().replace(' ', '_'),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save house size');
      }

      console.log('House size saved successfully');
    } catch (err: any) {
      setError(handleApiError(err, 'houseSize', 'Failed to save house size. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">🏠 House Size</h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        Tell us about your home size
      </p>
      
      <div className="space-y-8">
        {/* House Size Selection */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-purple-700 dark:text-purple-400">
            Select your house size <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This helps us match you with the right help
          </p>
          <div className="space-y-3">
            {HOUSE_SIZE_OPTIONS.map((size) => (
              <label 
                key={size} 
                className={`flex items-center p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
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
                  onChange={() => {
                    setSelectedSize(size);
                    saveHouseSize(size);
                  }}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
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
          <h3 className="text-base font-bold text-purple-700 dark:text-purple-400">
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
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 placeholder-gray-500 dark:placeholder-gray-400 resize-vertical"
              placeholder="e.g., House has stairs, large garden, pets, specific cleaning requirements, etc."
              maxLength={500}
            />
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-right">
              {additionalDetails.length}/500 characters
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseSize;
