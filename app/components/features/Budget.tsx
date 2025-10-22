import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../../utils/errorMessages';

type BudgetFrequency = 'Daily' | 'Weekly' | 'Monthly';
type BudgetRange = string;

const BUDGET_RANGES: Record<BudgetFrequency, BudgetRange[]> = {
  Daily: [
    '500-1,000 KES',
    '1,000-1,500 KES',
    '1,500-2,000 KES',
    '2,000+ KES',
    'Negotiable'
  ],
  Weekly: [
    '2,000-3,000 KES',
    '3,000-5,000 KES',
    '5,000-7,500 KES',
    '7,500+ KES',
    'Negotiable'
  ],
  Monthly: [
    '5,000-10,000 KES',
    '10,000-15,000 KES',
    '15,000-25,000 KES',
    '25,000+ KES',
    'Negotiable'
  ]
};

const Budget: React.FC = () => {
  const [frequency, setFrequency] = useState<BudgetFrequency>('Daily');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submit = useSubmit();

  // Auto-save when budget range is selected
  const saveBudget = async (range: string) => {
    if (!range) return;

    setIsSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const [min, max] = range.split('-').map(v => parseInt(v.replace(/,/g, '')));
      
      const response = await fetch(`${API_BASE_URL}/api/v1/household-preferences/budget`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          budget_min: min,
          budget_max: max,
          salary_frequency: frequency.toLowerCase(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save budget preferences');
      }

      console.log('Budget saved successfully');
    } catch (err: any) {
      setError(handleApiError(err, 'budget', 'Failed to save budget preferences. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">💰 Budget</h2>
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        What's your budget range for household help?
      </p>
      
      <div className="space-y-8">
        {/* Budget Frequency Dropdown */}
        <div className="space-y-3">
          <label htmlFor="frequency" className="block text-base font-bold text-purple-700 dark:text-purple-400">
            📅 Payment Frequency <span className="text-red-500">*</span>
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => {
              setFrequency(e.target.value as BudgetFrequency);
              setSelectedRange(''); // Reset selected range when frequency changes
            }}
            className="block w-full h-14 px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 text-base font-medium"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* Budget Range Radio Group */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 mb-3">
            Select Budget Range <span className="text-red-500">*</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select the amount you're willing to pay
          </p>
          <div className="space-y-3">
            {BUDGET_RANGES[frequency].map((range) => (
              <label 
                key={range} 
                className={`flex items-center p-5 rounded-xl border-2 cursor-pointer shadow-sm text-base font-semibold transition-all ${
                  selectedRange === range 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 scale-105' 
                    : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-[#13131a] text-gray-900 dark:text-gray-100 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                }`}
              >
                <input
                  type="radio"
                  name="budgetRange"
                  value={range}
                  checked={selectedRange === range}
                  onChange={() => {
                    setSelectedRange(range);
                    saveBudget(range);
                  }}
                  className="sr-only"
                />
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 flex-shrink-0 ${
                  selectedRange === range 
                    ? 'border-purple-500 bg-purple-500' 
                    : 'border-purple-300 dark:border-purple-500/50'
                }`}>
                  {selectedRange === range && (
                    <div className="w-3 h-3 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="flex-1">{range}</span>
              </label>
            ))}
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

export default Budget;
