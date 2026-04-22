import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect, useRef } from 'react';
import { useSubmit } from 'react-router';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { handleApiError } from '../../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useSalaryRanges, type SalaryRange } from '~/hooks/useOnboardingOptions';
import CustomSelect from '~/components/ui/CustomSelect';

type BudgetFrequency = 'daily' | 'weekly' | 'monthly';
type BudgetRange = string;

const Budget: React.FC = () => {
  const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
  const [frequency, setFrequency] = useState<BudgetFrequency>('monthly');
  const { ranges: budgetRanges, loading: rangesLoading } = useSalaryRanges(frequency);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const submit = useSubmit();
  const initialLoadDone = useRef(false);
  
  const BUDGET_RANGES: Record<BudgetFrequency, BudgetRange[]> = {
    daily: budgetRanges.map(r => r.label),
    weekly: budgetRanges.map(r => r.label),
    monthly: budgetRanges.map(r => r.label)
  };

  const currentRanges = BUDGET_RANGES[frequency] || [];
  const findRangeByLabel = (label: string): SalaryRange | undefined =>
    budgetRanges.find((range) => range.label === label);
  const findRangeByAmounts = (min: number, max: number): SalaryRange | undefined =>
    budgetRanges.find((range) => {
      if (range.is_negotiable) {
        return min === 0 && max === 0;
      }
      return range.min_amount === min && range.max_amount === max;
    });

  // Populate from context (instant on back-nav)
  useEffect(() => {
    const cached = profileData.budget;
    if (cached) {
      if (cached.rangeLabel) {
        setSelectedRange(cached.rangeLabel);
      } else if (cached.min !== undefined && cached.max !== undefined) {
        const matchedRange = findRangeByAmounts(Number(cached.min), Number(cached.max));
        if (matchedRange) {
          setSelectedRange(matchedRange.label);
        }
      }
      const freq = cached.frequency || cached.salary_frequency;
      if (freq) setFrequency(freq.toLowerCase() as BudgetFrequency);
    }
  }, [budgetRanges, profileData.budget]);

  // Load existing data from backend (only once on mount)
  useEffect(() => {
    if (initialLoadDone.current) return;
    
    const loadData = async () => {
      try {
        const token = getAccessTokenFromCookies();
        if (!token) return;
        
        const data = await grpcProfileService.getCurrentHouseholdProfile('');
        if (data) {
          if (data.salary_frequency) {
            setFrequency(data.salary_frequency.toLowerCase() as BudgetFrequency);
          }
          if (data.budget_min !== undefined || data.budget_max !== undefined) {
            const matchedRange = findRangeByAmounts(Number(data.budget_min || 0), Number(data.budget_max || 0));
            if (matchedRange) {
              setSelectedRange(matchedRange.label);
            }
          }
          initialLoadDone.current = true;
        }
      } catch (err) {
        console.error('Failed to load budget:', err);
      }
    };
    loadData();
  }, [budgetRanges]);

  const handleRangeSelect = async (range: string) => {
    setSelectedRange(range);
    markDirty();
    await saveBudget(range);
  };

  // Save budget to household profile
  const saveBudget = async (rangeToSave?: string) => {
    const range = rangeToSave || selectedRange;
    if (!range) {
      setError('Please select a budget range');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getAccessTokenFromCookies();
      const selectedBudgetRange = findRangeByLabel(range);
      const budgetMin = selectedBudgetRange?.min_amount ?? 0;
      const budgetMax = selectedBudgetRange?.max_amount ?? 0;
      
      await grpcProfileService.updateHouseholdProfile('', 'household', {
        budget_min: budgetMin,
        budget_max: budgetMax,
        salary_frequency: frequency.toLowerCase(),
        _step_metadata: {
          step_id: 'budget',
          step_number: 5,
          is_completed: true
        }
      });

      markClean();
      updateStepData('budget', {
        min: budgetMin,
        max: budgetMax,
        frequency,
        rangeLabel: selectedBudgetRange?.label || range,
        is_negotiable: selectedBudgetRange?.is_negotiable ?? false,
      });
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
      <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">💰 Budget</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        What's your budget range for household help?
      </p>
      
      <div className="space-y-8">
        {/* Budget Frequency Dropdown */}
        <div className="space-y-3">
          <label htmlFor="frequency" className="block text-xs font-semibold text-purple-700 dark:text-purple-400">
            📅 Payment Frequency <span className="text-red-500">*</span>
          </label>
          <CustomSelect
            value={frequency}
            onChange={(val) => {
              setFrequency(val as BudgetFrequency);
              setSelectedRange('');
              markDirty();
            }}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
            placeholder="Select frequency"
          />
        </div>

        {/* Budget Range Radio Group */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">
            Select Budget Range <span className="text-red-500">*</span>
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Select the amount you're willing to pay
          </p>
          <div className="space-y-3">
            {currentRanges.map((range) => (
              <label 
                key={range} 
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer shadow-sm text-xs font-medium transition-all ${
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
                  onChange={() => handleRangeSelect(range)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
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

        {error && <ErrorAlert message={error} />}

        {success && <SuccessAlert message={success} />}

      </div>
    </div>
  );
};

export default Budget;
