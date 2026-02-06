import React, { useState } from 'react';
import { apiClient } from '~/utils/apiClient';
import { API_ENDPOINTS } from '~/config/api';
import { ChevronLeft, ChevronRight, Check, Briefcase, DollarSign, Calendar, Clock, FileText } from 'lucide-react';
import CustomSelect from '~/components/ui/CustomSelect';

interface ConversationHireWizardProps {
  househelpId: string;
  househelpName: string;
  househelpSalaryExpectation?: number;
  househelpSalaryFrequency?: string;
  onClose: () => void;
  onSuccess: (hireRequestId: string) => void;
}

interface WorkSchedule {
  monday: { morning: boolean; afternoon: boolean; evening: boolean };
  tuesday: { morning: boolean; afternoon: boolean; evening: boolean };
  wednesday: { morning: boolean; afternoon: boolean; evening: boolean };
  thursday: { morning: boolean; afternoon: boolean; evening: boolean };
  friday: { morning: boolean; afternoon: boolean; evening: boolean };
  saturday: { morning: boolean; afternoon: boolean; evening: boolean };
  sunday: { morning: boolean; afternoon: boolean; evening: boolean };
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
const TIME_SLOTS = ['morning', 'afternoon', 'evening'] as const;

export default function ConversationHireWizard({
  househelpId,
  househelpName,
  househelpSalaryExpectation,
  househelpSalaryFrequency,
  onClose,
  onSuccess,
}: ConversationHireWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Job Type
  const [jobType, setJobType] = useState<string>('live-in');

  // Step 2: Salary & Schedule
  const [salaryOffered, setSalaryOffered] = useState<number | ''>(househelpSalaryExpectation || '');
  const [salaryFrequency, setSalaryFrequency] = useState(househelpSalaryFrequency || 'monthly');
  const [startDate, setStartDate] = useState('');

  // Step 3: Work Schedule
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    monday: { morning: true, afternoon: true, evening: false },
    tuesday: { morning: true, afternoon: true, evening: false },
    wednesday: { morning: true, afternoon: true, evening: false },
    thursday: { morning: true, afternoon: true, evening: false },
    friday: { morning: true, afternoon: true, evening: false },
    saturday: { morning: false, afternoon: false, evening: false },
    sunday: { morning: false, afternoon: false, evening: false },
  });

  // Step 4: Requirements & Review
  const [specialRequirements, setSpecialRequirements] = useState('');

  const totalSteps = 4;

  const toggleTimeSlot = (day: typeof DAYS[number], slot: typeof TIME_SLOTS[number]) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot],
      },
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (typeof salaryOffered !== 'number' || salaryOffered <= 0) {
      setError('Salary offered must be greater than zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.auth(API_ENDPOINTS.hiring.requests.base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          househelp_id: househelpId,
          job_type: jobType,
          start_date: startDate || null,
          salary_offered: salaryOffered,
          salary_frequency: salaryFrequency,
          work_schedule: workSchedule,
          special_requirements: specialRequirements,
          terms_accepted: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send hire request');
      }

      const data = await response.json();
      onSuccess(data.id);
    } catch (err: any) {
      setError(err.message || 'Failed to send hire request');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {[1, 2, 3, 4].map((step) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                step < currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : step === currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}
            >
              {step < currentStep ? <Check className="w-5 h-5" /> : step}
            </div>
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-400">
              {step === 1 && 'Job Type'}
              {step === 2 && 'Details'}
              {step === 3 && 'Schedule'}
              {step === 4 && 'Review'}
            </span>
          </div>
          {step < 4 && (
            <div
              className={`flex-1 h-1 mx-2 ${
                step < currentStep ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Job Type
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Choose the type of employment you're offering to {househelpName}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {['live-in', 'day-worker', 'part-time', 'full-time'].map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setJobType(type)}
            className={`px-4 py-4 rounded-lg border-2 font-semibold capitalize transition-all ${
              jobType === type
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent shadow-lg'
                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-purple-400'
            }`}
          >
            {type.replace('-', ' ')}
          </button>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Salary & Start Date
        </h3>
      </div>

      <div>
        <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Salary Offered (KES) *
        </label>
        <input
          type="number"
          value={salaryOffered}
          onChange={(e) => setSalaryOffered(e.target.value === '' ? '' : Number(e.target.value))}
          min="0"
          step="100"
          required
          placeholder="Enter salary amount"
          className="w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
        />
        {househelpSalaryExpectation && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Expected: KES {househelpSalaryExpectation.toLocaleString()}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Frequency *
        </label>
        <CustomSelect
          value={salaryFrequency}
          onChange={(value) => setSalaryFrequency(value)}
          options={[
            { value: 'daily', label: 'Daily' },
            { value: 'weekly', label: 'Weekly' },
            { value: 'monthly', label: 'Monthly' },
            { value: 'yearly', label: 'Yearly' },
          ]}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Preferred Start Date (Optional)
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
          className="w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Work Schedule
        </h3>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Select the days and times you need help
      </p>
      <div className="space-y-2">
        {DAYS.map((day) => (
          <div key={day} className="flex items-center gap-3">
            <span className="w-24 text-sm font-medium text-purple-700 dark:text-purple-400 capitalize">
              {day}
            </span>
            <div className="flex gap-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => toggleTimeSlot(day, slot)}
                  className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                    workSchedule[day][slot]
                      ? 'bg-purple-700 text-white'
                      : 'bg-white dark:bg-gray-700 border border-purple-400 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Review & Submit
        </h3>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Hiring:</span>
          <p className="font-medium text-gray-900 dark:text-white">{househelpName}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Job Type:</span>
          <p className="font-medium text-gray-900 dark:text-white capitalize">{jobType.replace('-', ' ')}</p>
        </div>
        <div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Salary:</span>
          <p className="font-medium text-gray-900 dark:text-white">
            KES {salaryOffered.toLocaleString()} / {salaryFrequency}
          </p>
        </div>
        {startDate && (
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Start Date:</span>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(startDate).toLocaleDateString()}
            </p>
          </div>
        )}
      </div>

      {/* Special Requirements */}
      <div>
        <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
          Special Requirements (Optional)
        </label>
        <textarea
          value={specialRequirements}
          onChange={(e) => setSpecialRequirements(e.target.value)}
          rows={3}
          placeholder="Any specific requirements or expectations..."
          className="w-full text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
        />
      </div>

      {/* Terms */}
      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          By sending this hire request, you agree to our{' '}
          <a
            href="/terms/hiring"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-600 dark:text-purple-400 hover:underline"
          >
            hiring terms and conditions
          </a>.
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-2xl w-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Send Hire Request
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Step Indicator */}
      {renderStepIndicator()}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="mb-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        {currentStep === 4 && renderStep4()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        {currentStep > 1 && (
          <button
            onClick={handleBack}
            disabled={loading}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
        )}
        
        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? 'Sending...' : 'Send Hire Request'}
            <Check className="w-5 h-5" />
          </button>
        )}

        <button
          onClick={onClose}
          disabled={loading}
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
