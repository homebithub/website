import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useSalaryRanges, type SalaryRange } from '~/hooks/useOnboardingOptions';
import CustomSelect from '~/components/ui/CustomSelect';

type SalaryFrequency = 'daily' | 'weekly' | 'monthly';

const SalaryExpectations: React.FC = () => {
  const { markDirty, markClean, updateStepData, profileData } = useProfileSetup();
  const [frequency, setFrequency] = useState<SalaryFrequency>('monthly');
  const { ranges: salaryRanges, loading: rangesLoading } = useSalaryRanges(frequency);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const submit = useSubmit();
  
  const currentRanges = (salaryRanges || []).map(r => r.label);
  const findRangeByLabel = (label: string): SalaryRange | undefined =>
    (salaryRanges || []).find((range) => range.label === label);
  const findRangeByAmount = (amount: number): SalaryRange | undefined =>
    (salaryRanges || []).find((range) => {
      if (range.is_negotiable) {
        return amount === 0;
      }
      return range.min_amount === amount;
    });

  // Populate from context (instant on back-nav)
  useEffect(() => {
    const cached = profileData.salary;
    if (cached) {
      if (cached.expectation) setSelectedRange(cached.expectation);
      if (cached.frequency) setFrequency(cached.frequency as SalaryFrequency);
      if (cached.salary_frequency) setFrequency(cached.salary_frequency as SalaryFrequency);
    }
  }, [profileData.salary]);

  // Load existing data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = getAccessTokenFromCookies();
        if (!token) return;
        
        const data = await grpcProfileService.getCurrentHousehelpProfile('');
        if (data) {
          if (data.salary_frequency) {
            const freq = data.salary_frequency.toLowerCase() as SalaryFrequency;
            setFrequency(freq);
          }
          if (data.salary_expectation !== undefined && data.salary_expectation !== null) {
            const matchedRange = findRangeByAmount(Number(data.salary_expectation));
            if (matchedRange) {
              setSelectedRange(matchedRange.label);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load salary expectations:', err);
      }
    };
    loadData();
  }, [salaryRanges]);

  const autoSave = async (freq: SalaryFrequency, range: string) => {
    if (!range) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getAccessTokenFromCookies();
      const selectedSalaryRange = findRangeByLabel(range);
      const normalizedExpectation = selectedSalaryRange?.is_negotiable
        ? 0
        : selectedSalaryRange?.min_amount;
      const updates: Record<string, string | number> = {
        salary_frequency: freq.toLowerCase(),
      };

      if (normalizedExpectation !== undefined && normalizedExpectation !== null) {
        updates.salary_expectation = normalizedExpectation;
      }

      await grpcProfileService.updateHousehelpFields('', 'househelp', updates,
        { step_id: 'salary', step_number: 6, is_completed: true }
      );

      markClean();
      updateStepData('salary', {
        expectation: range,
        amount: normalizedExpectation ?? 0,
        min_amount: selectedSalaryRange?.min_amount ?? 0,
        max_amount: selectedSalaryRange?.max_amount ?? 0,
        is_negotiable: selectedSalaryRange?.is_negotiable ?? false,
        frequency: freq,
      });
      setSuccess('Salary expectations saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(handleApiError(err, 'salary', 'Failed to save salary expectations. Please try again.'));
      console.error(err);
    } finally{
      setIsSubmitting(false);
    }
  };

  const handleRangeSelect = async (range: string) => {
    setSelectedRange(range);
    markDirty();
    await autoSave(frequency, range);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">💰 Salary Expectations</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        What are your salary requirements?
      </p>
      
      <div className="space-y-8">
        {/* Salary Frequency Dropdown */}
        <div className="space-y-3">
          <label htmlFor="frequency" className="block text-xs font-semibold text-purple-700 dark:text-purple-400">
            📅 Payment Frequency
          </label>
          <CustomSelect
            value={frequency}
            onChange={(val) => {
              setFrequency(val as SalaryFrequency);
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

        {/* Salary Range Radio Group */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            Your {frequency.charAt(0).toUpperCase() + frequency.slice(1)} Salary (KES)
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Select your expected salary range
          </p>
          {rangesLoading && (
            <div className="text-xs text-gray-500 dark:text-gray-400 animate-pulse">Loading salary ranges...</div>
          )}
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
                  name="salaryRange"
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

        {success && <SuccessAlert message={success} />}

        {error && <ErrorAlert message={error} />}

      </div>
    </div>
  );
};

export default SalaryExpectations;
