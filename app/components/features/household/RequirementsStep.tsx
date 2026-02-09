import React, { useState } from 'react';
import { HouseholdProfileData } from '../../../types/household-profile';

interface RequirementsStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function RequirementsStep({ data, onUpdate, onNext }: RequirementsStepProps) {
  const [hasPets, setHasPets] = useState(data.requirements.hasPets);
  const [petDetails, setPetDetails] = useState(data.requirements.petDetails || '');
  const [otherRequirements, setOtherRequirements] = useState(data.requirements.otherRequirements || '');

  const handlePetToggle = (hasPets: boolean) => {
    setHasPets(hasPets);
    if (!hasPets) {
      setPetDetails('');
    }
    onUpdate({
      requirements: {
        ...data.requirements,
        hasPets,
        petDetails: hasPets ? petDetails : ''
      }
    });
  };

  const handlePetDetailsChange = (details: string) => {
    setPetDetails(details);
    onUpdate({
      requirements: {
        ...data.requirements,
        petDetails: details
      }
    });
  };

  const handleOtherRequirementsChange = (requirements: string) => {
    setOtherRequirements(requirements);
    onUpdate({
      requirements: {
        ...data.requirements,
        otherRequirements: requirements
      }
    });
  };

  const handleNext = () => {
    // If they have pets, ensure pet details are provided
    if (hasPets && !petDetails.trim()) {
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Additional Requirements</h3>
        <p className="text-gray-600">Tell us about any special requirements or considerations</p>
      </div>

      <div className="space-y-6">
        {/* Pet Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Do you have pets?
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hasPets"
                  checked={hasPets === true}
                  onChange={() => handlePetToggle(true)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Yes, I have pets</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hasPets"
                  checked={hasPets === false}
                  onChange={() => handlePetToggle(false)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">No pets</span>
              </label>
            </div>
          </div>

          {hasPets && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Tell us about your pets
              </label>
              <textarea
                value={petDetails}
                onChange={(e) => handlePetDetailsChange(e.target.value)}
                placeholder="e.g., 2 dogs (Golden Retriever and German Shepherd), 1 cat, all friendly and well-trained. Househelp should be comfortable with pets and help with feeding and basic pet care."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
              <p className="text-sm text-gray-500">
                Include the type, number, and any special care requirements for your pets
              </p>
            </div>
          )}
        </div>

        {/* Other Requirements */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Other special requirements or preferences
          </label>
          <textarea
            value={otherRequirements}
            onChange={(e) => handleOtherRequirementsChange(e.target.value)}
            placeholder="e.g., Non-smoker preferred, must speak English, experience with special needs children, dietary restrictions (vegetarian cooking), specific cleaning products to use..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500">
            Any other important requirements, preferences, or considerations we should know about
          </p>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Help us find the perfect match
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Language preferences (English, Swahili, etc.)</li>
                <li>• Religious or cultural considerations</li>
                <li>• Experience level requirements</li>
                <li>• Health or dietary restrictions</li>
                <li>• Specific household rules or routines</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary */}
        {(hasPets || otherRequirements) && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Requirements Summary
                </p>
                {hasPets && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>Pets:</strong> {petDetails}
                  </p>
                )}
                {otherRequirements && (
                  <p className="text-sm text-green-700 mt-1">
                    <strong>Other:</strong> {otherRequirements}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={hasPets && !petDetails.trim()}
          className="px-6 py-1 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 