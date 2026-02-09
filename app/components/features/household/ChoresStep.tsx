import React, { useState } from 'react';
import type { HouseholdProfileData } from '../../../types/household-profile';

interface ChoresStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const CHORE_OPTIONS = [
  {
    id: 'cleaning',
    label: 'Cleaning',
    description: 'General house cleaning, dusting, vacuuming, mopping',
    icon: '🧹'
  },
  {
    id: 'cooking',
    label: 'Cooking',
    description: 'Meal preparation, cooking breakfast, lunch, and dinner',
    icon: '👨‍🍳'
  },
  {
    id: 'childcare',
    label: 'Child Care',
    description: 'Looking after children, feeding, bathing, playing',
    icon: '👶'
  },
  {
    id: 'laundry',
    label: 'Laundry',
    description: 'Washing, ironing, and organizing clothes',
    icon: '👕'
  }
];

export function ChoresStep({ data, onUpdate, onNext }: ChoresStepProps) {
  const [chores, setChores] = useState(data.chores);
  const [otherChores, setOtherChores] = useState(data.chores.other);

  const handleChoreToggle = (choreId: string) => {
    const updatedChores = {
      ...chores,
      [choreId]: !chores[choreId as keyof typeof chores]
    };
    setChores(updatedChores);
    onUpdate({
      chores: updatedChores
    });
  };

  const handleOtherChoresChange = (value: string) => {
    setOtherChores(value);
    onUpdate({
      chores: {
        ...chores,
        other: value
      }
    });
  };

  const handleNext = () => {
    // At least one chore should be selected
    const hasSelectedChores = Object.values(chores).some(chore => 
      typeof chore === 'boolean' ? chore : false
    );
    
    if (hasSelectedChores) {
      onNext();
    }
  };

  const selectedChoresCount = Object.values(chores).filter(chore => 
    typeof chore === 'boolean' ? chore : false
  ).length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">What chores do you need help with?</h3>
        <p className="text-gray-600">Select all the tasks you'd like your househelp to handle</p>
      </div>

      <div className="space-y-4">
        {/* Main Chores */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CHORE_OPTIONS.map((chore) => (
            <div
              key={chore.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                chores[chore.id as keyof typeof chores]
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleChoreToggle(chore.id)}
            >
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={chores[chore.id as keyof typeof chores] as boolean}
                  onChange={() => handleChoreToggle(chore.id)}
                  className="mt-1 text-primary-600 focus:ring-primary-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{chore.icon}</span>
                    <h4 className="text-lg font-medium text-gray-900">{chore.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{chore.description}</p>
                </div>
              </label>
            </div>
          ))}
        </div>

        {/* Other Chores */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Other requirements or specific tasks
          </label>
          <textarea
            value={otherChores}
            onChange={(e) => handleOtherChoresChange(e.target.value)}
            placeholder="e.g., Pet care, gardening, running errands, specific dietary requirements..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <p className="text-sm text-gray-500">
            Let us know about any specific requirements or additional tasks you need help with
          </p>
        </div>

        {/* Selection Summary */}
        {selectedChoresCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Selected Chores ({selectedChoresCount})
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {CHORE_OPTIONS.map((chore) => (
                    chores[chore.id as keyof typeof chores] && (
                      <span
                        key={chore.id}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800"
                      >
                        {chore.icon} {chore.label}
                      </span>
                    )
                  ))}
                </div>
                {otherChores && (
                  <p className="text-sm text-green-700 mt-2">
                    <strong>Additional:</strong> {otherChores}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

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
                Tips for better matching
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Be specific about your requirements</li>
                <li>• Mention any special dietary needs or restrictions</li>
                <li>• Include pet care if you have pets</li>
                <li>• Specify any language preferences</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={selectedChoresCount === 0}
          className="px-6 py-1 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 