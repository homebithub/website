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
  const [frequency, setFrequency] = useState<BudgetFrequency>('Monthly');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
          if (data.salary_frequency) {
            const freq = data.salary_frequency.charAt(0).toUpperCase() + data.salary_frequency.slice(1);
            setFrequency(freq as BudgetFrequency);
          }
          if (data.budget_min || data.budget_max) {
            // Try to match to a range
            const ranges = BUDGET_RANGES[frequency];
            const matchedRange = ranges.find(range => {
              if (range === 'Negotiable') return data.budget_min === 0 && data.budget_max === 0;
              const parts = range.split('-');
              if (parts.length === 2) {
                const min = parseInt(parts[0].replace(/,/g, ''));
                const max = parseInt(parts[1].replace(/,/g, '').replace('KES', '').replace('+', ''));
                return data.budget_min === min && data.budget_max === max;
              }
              return false;
            });
            if (matchedRange) setSelectedRange(matchedRange);
          }
        }
      } catch (err) {
        console.error('Failed to load budget:', err);
      }
    };
    loadData();
  }, [frequency]);

  // Save budget to household profile
  const saveBudget = async () => {
    if (!selectedRange) {
      setError('Please select a budget range');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      
      // Parse budget range
      let budgetMin = 0;
      let budgetMax = 0;
      
      if (selectedRange !== 'Negotiable') {
        const parts = selectedRange.split('-');
        if (parts.length === 2) {
          budgetMin = parseInt(parts[0].replace(/,/g, '').replace(/\s+/g, ''));
          budgetMax = parseInt(parts[1].replace(/,/g, '').replace(/\s+/g, '').replace('KES', '').replace('+', ''));
        } else if (selectedRange.includes('+')) {
          budgetMin = parseInt(selectedRange.replace(/,/g, '').replace(/\s+/g, '').replace('KES', '').replace('+', ''));
          budgetMax = budgetMin * 2; // Set max to double for open-ended ranges
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          budget_min: budgetMin,
          budget_max: budgetMax,
          salary_frequency: frequency.toLowerCase(),
          _step_metadata: {
            step_id: "budget",
            step_number: 5,
            is_completed: true
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save budget preferences');
      }

      setSuccess('Budget saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
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
                  onChange={() => setSelectedRange(range)}
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

        {success && (
          <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
            ✓ {success}
          </div>
        )}

        {/* Save Button */}
        <button
          type="button"
          onClick={saveBudget}
          disabled={isSubmitting || !selectedRange}
          className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              💾 Save Budget
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Budget;
