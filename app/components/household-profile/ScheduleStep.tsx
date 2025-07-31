import React, { useState } from 'react';
import { HouseholdProfileData } from '../HouseholdProfileModal';

interface ScheduleStepProps {
  data: HouseholdProfileData;
  onUpdate: (data: Partial<HouseholdProfileData>) => void;
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export function ScheduleStep({ data, onUpdate, onNext }: ScheduleStepProps) {
  const [startDate, setStartDate] = useState(data.schedule.startDate);
  const [selectedDays, setSelectedDays] = useState<string[]>(data.schedule.days || []);
  const [showDaySelection, setShowDaySelection] = useState(false);

  const isDayburg = data.nannyType === 'dayburg';
  const isSleepIn = data.nannyType === 'sleep-in';

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    onUpdate({
      schedule: {
        ...data.schedule,
        startDate: date
      }
    });
  };

  const handleDayToggle = (day: string) => {
    const updatedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(updatedDays);
    onUpdate({
      schedule: {
        ...data.schedule,
        days: updatedDays
      }
    });
  };

  const handleNext = () => {
    if (startDate) {
      if (isDayburg && selectedDays.length === 0) {
        return; // Dayburg requires day selection
      }
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">When do you need your househelp?</h3>
        <p className="text-gray-600">
          {isDayburg 
            ? 'Select the days you need help and when you want to start'
            : 'Choose when you want your sleep-in househelp to start'
          }
        </p>
      </div>

      <div className="space-y-6">
        {/* Start Date Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When do you want to start?
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            Select a date at least 3 days from today to allow time for matching
          </p>
        </div>

        {/* Day Selection for Dayburg */}
        {isDayburg && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Which days do you need help?
              </label>
              <button
                type="button"
                onClick={() => setShowDaySelection(!showDaySelection)}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                {showDaySelection ? 'Hide' : 'Customize'}
              </button>
            </div>

            {showDaySelection ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedDays.includes(day.value)}
                      onChange={() => handleDayToggle(day.value)}
                      className="text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {selectedDays.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedDays.map((day) => (
                      <span
                        key={day}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                      >
                        {DAYS_OF_WEEK.find(d => d.value === day)?.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No days selected</p>
                )}
              </div>
            )}

            {/* Quick Selection Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
                  setSelectedDays(weekdays);
                  onUpdate({
                    schedule: {
                      ...data.schedule,
                      days: weekdays
                    }
                  });
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Weekdays
              </button>
              <button
                type="button"
                onClick={() => {
                  const allDays = DAYS_OF_WEEK.map(d => d.value);
                  setSelectedDays(allDays);
                  onUpdate({
                    schedule: {
                      ...data.schedule,
                      days: allDays
                    }
                  });
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Every Day
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedDays([]);
                  onUpdate({
                    schedule: {
                      ...data.schedule,
                      days: []
                    }
                  });
                }}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        {/* Sleep-in Information */}
        {isSleepIn && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Sleep-in Househelp
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Your househelp will be available 24/7 starting from the selected date. They will live with your family and provide round-the-clock support.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {startDate && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">
                  Schedule Summary
                </p>
                <p className="text-sm text-green-700 mt-1">
                  Start Date: {new Date(startDate).toLocaleDateString()}
                  {isDayburg && selectedDays.length > 0 && (
                    <span>
                      <br />
                      Days: {selectedDays.map(day => DAYS_OF_WEEK.find(d => d.value === day)?.label).join(', ')}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!startDate || (isDayburg && selectedDays.length === 0)}
          className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
} 