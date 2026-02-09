import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '~/utils/apiClient';
import { API_ENDPOINTS } from '~/config/api';
import CustomSelect from '~/components/ui/CustomSelect';

interface HireRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  househelpId: string;
  househelpName: string;
  househelpSalaryExpectation?: number;
  househelpSalaryFrequency?: string;
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

type DayKey = typeof DAYS[number];
type TimeSlotKey = typeof TIME_SLOTS[number];
type DayScheduleState = WorkSchedule[DayKey];

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const HireRequestModal: React.FC<HireRequestModalProps> = ({
  isOpen,
  onClose,
  househelpId,
  househelpName,
  househelpSalaryExpectation,
  househelpSalaryFrequency,
}) => {
  const [jobType, setJobType] = useState<string>('live-in');
  const [startDate, setStartDate] = useState('');
  const [salaryOffered, setSalaryOffered] = useState<string>(
    househelpSalaryExpectation ? String(househelpSalaryExpectation) : ''
  );
  const [salaryFrequency, setSalaryFrequency] = useState(househelpSalaryFrequency || 'monthly');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [workSchedule, setWorkSchedule] = useState<WorkSchedule>({
    monday: { morning: true, afternoon: true, evening: false },
    tuesday: { morning: true, afternoon: true, evening: false },
    wednesday: { morning: true, afternoon: true, evening: false },
    thursday: { morning: true, afternoon: true, evening: false },
    friday: { morning: true, afternoon: true, evening: false },
    saturday: { morning: false, afternoon: false, evening: false },
    sunday: { morning: false, afternoon: false, evening: false },
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setJobType('live-in');
      setStartDate('');
      setSalaryOffered(househelpSalaryExpectation ? String(househelpSalaryExpectation) : '');
      setSalaryFrequency(househelpSalaryFrequency || 'monthly');
      setSpecialRequirements('');
      setError('');
      setSuccess(false);
    }
  }, [isOpen, househelpSalaryExpectation, househelpSalaryFrequency]);

  const toggleTimeSlot = (day: DayKey, slot: TimeSlotKey) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot],
      },
    }));
  };

  const toggleDaySlots = (day: DayKey) => {
    const allSelected = TIME_SLOTS.every(slot => workSchedule[day][slot]);
    setWorkSchedule(prev => ({
      ...prev,
      [day]: TIME_SLOTS.reduce((acc, slot) => {
        acc[slot] = !allSelected;
        return acc;
      }, { ...prev[day] } as DayScheduleState),
    }));
  };

  const toggleTimeColumn = (slot: TimeSlotKey) => {
    const allSelected = DAYS.every(day => workSchedule[day][slot]);
    setWorkSchedule(prev => {
      const updated = { ...prev };
      DAYS.forEach(day => {
        updated[day] = {
          ...updated[day],
          [slot]: !allSelected,
        };
      });
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    const salaryValue = parseFloat(salaryOffered);
    if (Number.isNaN(salaryValue) || salaryValue <= 0) {
      setError('Salary offered must be greater than zero');
      return;
    }

    setLoading(true);

    try {
      const response = await apiClient.auth(API_ENDPOINTS.hiring.requests.base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          househelp_id: househelpId,
          job_type: jobType,
          start_date: startDate || null,
          salary_offered: salaryValue,
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

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to send hire request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Send Hire Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✅ Hire request sent successfully to {househelpName}!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Househelp Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hiring</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{househelpName}</p>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                Job Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['live-in', 'day-worker', 'part-time'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJobType(type)}
                    className={`px-4 py-1.5 rounded-xl border-2 font-semibold capitalize transition-all ${
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

            {/* Start Date */}
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

            {/* Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                  Salary Offered (KES) *
                </label>
                <input
                  type="number"
                  value={salaryOffered}
                  onChange={(e) => setSalaryOffered(e.target.value)}
                  min="0"
                  step="100"
                  required
                  className="w-full h-12 text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all"
                />
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
            </div>

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">
                Special Requirements (Optional)
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={4}
                placeholder="Any specific requirements or expectations..."
                className="w-full text-base px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white border-purple-200 dark:border-purple-500/30 shadow-sm dark:shadow-inner-glow focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Hire Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default HireRequestModal;
