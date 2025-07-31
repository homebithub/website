import React, { useState } from 'react';
import { HouseholdProfileData } from '../HouseholdProfileModal';

interface BudgetStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const BUDGET_TYPES = [
  { value: 'daily', label: 'Per Day', description: 'Daily rate' },
  { value: 'weekly', label: 'Per Week', description: 'Weekly rate' },
  { value: 'monthly', label: 'Per Month', description: 'Monthly rate' },
];

const HOUSE_SIZES = [
  { value: 'bedsitter', label: 'Bedsitter' },
  { value: '1-bedroom', label: '1 Bedroom' },
  { value: '2-bedroom', label: '2 Bedroom' },
  { value: '3-bedroom', label: '3 Bedroom' },
  { value: '4+bedroom', label: '4+ Bedroom' },
];

export function BudgetStep({ data, onUpdate, onNext }: BudgetStepProps) {
  const [budgetType, setBudgetType] = useState(data.budget.type);
  const [budgetAmount, setBudgetAmount] = useState(data.budget.amount);
  const [houseSize, setHouseSize] = useState(data.houseDetails.size);
  const [hasSeparateSQ, setHasSeparateSQ] = useState(data.houseDetails.hasSeparateSQ);

  const handleBudgetTypeChange = (type: 'daily' | 'weekly' | 'monthly') => {
    setBudgetType(type);
    onUpdate({
      budget: {
        ...data.budget,
        type
      }
    });
  };

  const handleBudgetAmountChange = (amount: number) => {
    setBudgetAmount(amount);
    onUpdate({
      budget: {
        ...data.budget,
        amount
      }
    });
  };

  const handleHouseSizeChange = (size: string) => {
    setHouseSize(size as any);
    onUpdate({
      houseDetails: {
        ...data.houseDetails,
        size: size as any
      }
    });
  };

  const handleSeparateSQChange = (hasSQ: boolean) => {
    setHasSeparateSQ(hasSQ);
    onUpdate({
      houseDetails: {
        ...data.houseDetails,
        hasSeparateSQ: hasSQ
      }
    });
  };

  const handleNext = () => {
    if (budgetAmount > 0 && houseSize) {
      onNext();
    }
  };

  const getBudgetRange = () => {
    switch (budgetType) {
      case 'daily':
        return 'KSh 500 - 2,000 per day';
      case 'weekly':
        return 'KSh 3,500 - 14,000 per week';
      case 'monthly':
        return 'KSh 15,000 - 60,000 per month';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Budget & House Details</h3>
        <p className="text-gray-600">Help us understand your budget and house setup</p>
      </div>

      <div className="space-y-6">
        {/* Budget Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Your Budget</h4>
          
          {/* Budget Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              How would you like to pay?
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {BUDGET_TYPES.map((type) => (
                <label
                  key={type.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    budgetType === type.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value={type.value}
                    checked={budgetType === type.value}
                    onChange={() => handleBudgetTypeChange(type.value as any)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900">{type.label}</div>
                    <div className="text-sm text-gray-600">{type.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Budget Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your budget? (KSh)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                KSh
              </span>
              <input
                type="number"
                value={budgetAmount || ''}
                onChange={(e) => handleBudgetAmountChange(parseInt(e.target.value) || 0)}
                placeholder="Enter amount"
                min="0"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Typical range: {getBudgetRange()}
            </p>
          </div>
        </div>

        {/* House Details Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">House Details</h4>
          
          {/* House Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What's your house size?
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {HOUSE_SIZES.map((size) => (
                <label
                  key={size.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    houseSize === size.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="houseSize"
                    value={size.value}
                    checked={houseSize === size.value}
                    onChange={() => handleHouseSizeChange(size.value)}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-lg font-medium text-gray-900">{size.label}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Separate SQ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Do you have a separate servant's quarter (SQ)?
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hasSeparateSQ"
                  checked={hasSeparateSQ === true}
                  onChange={() => handleSeparateSQChange(true)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">Yes, we have a separate SQ</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="hasSeparateSQ"
                  checked={hasSeparateSQ === false}
                  onChange={() => handleSeparateSQChange(false)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <span className="text-gray-700">No separate SQ</span>
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              This helps us understand accommodation arrangements for sleep-in househelp
            </p>
          </div>
        </div>

        {/* Budget Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-800">
                Budget Guidelines
              </p>
              <ul className="text-sm text-blue-700 mt-1 space-y-1">
                <li>• Dayburg: KSh 500-2,000 per day</li>
                <li>• Sleep-in: KSh 15,000-60,000 per month</li>
                <li>• Rates vary based on experience and responsibilities</li>
                <li>• Additional benefits may include food and transport</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary */}
        {budgetAmount > 0 && houseSize && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Summary
                </p>
                <p className="text-sm text-green-700 mt-1">
                  <strong>Budget:</strong> KSh {budgetAmount.toLocaleString()} per {budgetType}
                  <br />
                  <strong>House:</strong> {HOUSE_SIZES.find(s => s.value === houseSize)?.label}
                  {hasSeparateSQ && <span> with separate SQ</span>}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!budgetAmount || !houseSize}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Complete Profile
        </button>
      </div>
    </div>
  );
} 