import React, { useState } from 'react';
import { HouseholdProfileData } from '../../../types/household-profile';

interface NannyTypeStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function NannyTypeStep({ data, onUpdate, onNext }: NannyTypeStepProps) {
  const [nannyType, setNannyType] = useState<'dayburg' | 'sleep-in' | null>(data.nannyType);

  const handleNannyTypeChange = (type: 'dayburg' | 'sleep-in') => {
    setNannyType(type);
    onUpdate({
      nannyType: type
    });
  };

  const handleNext = () => {
    if (nannyType) {
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">What type of househelp do you need?</h3>
        <p className="text-gray-600">Choose the arrangement that works best for your family</p>
      </div>

      <div className="space-y-4">
        {/* Dayburg Option */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors cursor-pointer">
          <label className="flex items-start space-x-4 cursor-pointer">
            <input
              type="radio"
              name="nannyType"
              value="dayburg"
              checked={nannyType === 'dayburg'}
              onChange={() => handleNannyTypeChange('dayburg')}
              className="mt-1 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Dayburg</h4>
                <span className="text-sm text-gray-500">Most Popular</span>
              </div>
              <p className="text-gray-600 mt-1">
                Househelp works during the day and goes home in the evening. Perfect for families who need help during working hours.
              </p>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Flexible schedule (choose specific days)
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Usually 8-10 hours per day
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Lower cost compared to sleep-in
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Sleep-in Option */}
        <div className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors cursor-pointer">
          <label className="flex items-start space-x-4 cursor-pointer">
            <input
              type="radio"
              name="nannyType"
              value="sleep-in"
              checked={nannyType === 'sleep-in'}
              onChange={() => handleNannyTypeChange('sleep-in')}
              className="mt-1 text-primary-600 focus:ring-primary-500"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-gray-900">Sleep-in</h4>
                <span className="text-sm text-gray-500">Full-time</span>
              </div>
              <p className="text-gray-600 mt-1">
                Househelp lives with your family and provides 24/7 support. Ideal for families needing constant assistance.
              </p>
              <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 availability
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accommodation provided
                </div>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Higher cost but comprehensive care
                </div>
              </div>
            </div>
          </label>
        </div>

        {/* Additional Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Need help deciding?
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Dayburg is great for working families who need help during the day. Sleep-in is perfect for families needing round-the-clock support or with very young children.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!nannyType}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 