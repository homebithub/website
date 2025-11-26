import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { apiClient } from '~/utils/apiClient';
import { API_ENDPOINTS } from '~/config/api';

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
  const [salaryOffered, setSalaryOffered] = useState(househelpSalaryExpectation || 0);
  const [salaryFrequency, setSalaryFrequency] = useState(househelpSalaryFrequency || 'monthly');
  const [specialRequirements, setSpecialRequirements] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
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
      setSalaryOffered(househelpSalaryExpectation || 0);
      setSalaryFrequency(househelpSalaryFrequency || 'monthly');
      setSpecialRequirements('');
      setTermsAccepted(false);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, househelpSalaryExpectation, househelpSalaryFrequency]);

  const toggleTimeSlot = (day: typeof DAYS[number], slot: typeof TIME_SLOTS[number]) => {
    setWorkSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]: !prev[day][slot],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    if (salaryOffered <= 0) {
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
          salary_offered: salaryOffered,
          salary_frequency: salaryFrequency,
          work_schedule: workSchedule,
          special_requirements: specialRequirements,
          terms_accepted: termsAccepted,
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
            <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✅ Hire request sent successfully to {househelpName}!
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Househelp Info */}
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Hiring</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{househelpName}</p>
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['live-in', 'day-worker', 'part-time', 'full-time'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setJobType(type)}
                    className={`px-4 py-3 rounded-lg border-2 font-medium capitalize transition-colors ${
                      jobType === type
                        ? 'bg-purple-600 text-white border-purple-600'
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preferred Start Date (Optional)
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Salary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Salary Offered (KES) *
                </label>
                <input
                  type="number"
                  value={salaryOffered}
                  onChange={(e) => setSalaryOffered(Number(e.target.value))}
                  min="0"
                  step="100"
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Frequency *
                </label>
                <select
                  value={salaryFrequency}
                  onChange={(e) => setSalaryFrequency(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
            </div>

            {/* Work Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Work Schedule
              </label>
              <div className="space-y-2">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-3">
                    <span className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
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
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
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

            {/* Special Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Special Requirements (Optional)
              </label>
              <textarea
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
                rows={4}
                placeholder="Any specific requirements or expectations..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>

            {/* Terms & Conditions */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  I accept the{' '}
                  <a
                    href="/terms/hiring"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    terms and conditions of hiring
                  </a>
                  {' '}and understand that this is a formal hire request.
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !termsAccepted}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
