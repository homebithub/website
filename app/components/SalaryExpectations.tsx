import { getAccessTokenFromCookies } from '~/utils/cookie';
import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router';
import { profileService as grpcProfileService } from '~/services/grpc/authServices';
import { handleApiError } from '../utils/errorMessages';
import { ErrorAlert } from '~/components/ui/ErrorAlert';
import { SuccessAlert } from '~/components/ui/SuccessAlert';
import { useProfileSetup } from '~/contexts/ProfileSetupContext';
import { useSalaryRanges } from '~/hooks/useOnboardingOptions';

type SalaryFrequency = 'daily' | 'weekly' | 'monthly';
type SalaryRange = string;

function parseSalaryRangeToNumber(range: string): number | null {
  const trimmed = (range || '').trim();
  if (!trimmed || trimmed.toLowerCase() === 'negotiable') {
    return null;
  }

  // Remove currency labels and commas, then parse first numeric bound.
  const normalized = trimmed.replace(/KES/gi, '').replace(/,/g, '').trim();
  const firstPart = normalized.split('-')[0].replace('+', '').trim();
  const parsed = Number(firstPart);
  return Number.isFinite(parsed) ? parsed : null;
}

const SalaryExpectations: React.FC = () => {
  const { markDirty, markClean } = useProfileSetup();
  const [frequency, setFrequency] = useState<SalaryFrequency>('monthly');
  const { ranges: salaryRanges, loading: rangesLoading } = useSalaryRanges(frequency);
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const submit = useSubmit();
  
  const SALARY_RANGES: Record<SalaryFrequency, SalaryRange[]> = {
    daily: salaryRanges.map(r => r.label),
    weekly: salaryRanges.map(r => r.label),
    monthly: salaryRanges.map(r => r.label)
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRange) {
      setError('Please select a salary range');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = getAccessTokenFromCookies();
      const normalizedExpectation = parseSalaryRangeToNumber(selectedRange);
      const updates: Record<string, string | number> = {
        salary_frequency: frequency.toLowerCase(),
      };

      if (normalizedExpectation !== null) {
        updates.salary_expectation = normalizedExpectation;
      }

      await grpcProfileService.updateHousehelpFields('', 'househelp', updates,
        { step_id: 'salary', step_number: 6, is_completed: true }
      );

      markClean();
      setSuccess('Salary expectations saved successfully!');
      console.log('Salary expectations saved successfully');
    } catch (err: any) {
      setError(handleApiError(err, 'salary', 'Failed to save salary expectations. Please try again.'));
      console.error(err);
    } finally{
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-2">💰 Salary Expectations</h2>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        What are your salary requirements?
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Salary Frequency Dropdown */}
        <div className="space-y-3">
          <label htmlFor="frequency" className="block text-sm font-semibold text-purple-700 dark:text-purple-400">
            📅 Payment Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => {
              setFrequency(e.target.value as SalaryFrequency);
              setSelectedRange('');
              markDirty();
            }}
            className="block w-full h-10 px-4 py-1.5 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all border-purple-200 dark:border-purple-500/30 text-sm font-medium"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* Salary Range Radio Group */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-purple-700 dark:text-purple-400">
            Your {frequency} Salary (KES)
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Select your expected salary range
          </p>
          <div className="space-y-3">
            {SALARY_RANGES[frequency].map((range) => (
              <label 
                key={range} 
                className={`flex items-center p-3 rounded-xl border-2 cursor-pointer shadow-sm text-sm font-medium transition-all ${
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
                  onChange={() => { setSelectedRange(range); markDirty(); }}
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

        <button
          type="submit"
          disabled={isSubmitting || !selectedRange}
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
              💾 Save
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SalaryExpectations;
