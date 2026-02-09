import React, { useState, useEffect } from 'react';
import { useSubmit } from 'react-router';

type SalaryFrequency = 'Daily' | 'Weekly' | 'Monthly';
type SalaryRange = string;

const SALARY_RANGES: Record<SalaryFrequency, SalaryRange[]> = {
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

const SalaryExpectations: React.FC = () => {
  const [frequency, setFrequency] = useState<SalaryFrequency>('Daily');
  const [selectedRange, setSelectedRange] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submit = useSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRange) {
      setError('Please select a salary range');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically save the data to your backend
      // For now, we'll just log it and show a success message
      console.log({ frequency, salaryRange: selectedRange });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('Salary expectations saved successfully!');
      
      // Reset form
      setSelectedRange('');
    } catch (err) {
      setError('Failed to save salary expectations. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Salary Expectations</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Salary Frequency Dropdown */}
        <div className="space-y-2">
          <label htmlFor="frequency" className="block text-lg font-medium text-gray-900">
            Salary Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => {
              setFrequency(e.target.value as SalaryFrequency);
              setSelectedRange(''); // Reset selected range when frequency changes
            }}
            className="block w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors text-gray-900"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>

        {/* Salary Range Radio Group */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Expected {frequency} Salary (KES)
          </h2>
          <div className="space-y-3">
            {SALARY_RANGES[frequency].map((range) => (
              <label 
                key={range} 
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedRange === range 
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="salaryRange"
                  value={range}
                  checked={selectedRange === range}
                  onChange={() => setSelectedRange(range)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedRange === range 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedRange === range && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-900">{range}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary-600 text-white px-6 py-1.5 rounded-xl font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Salary Expectations'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalaryExpectations;
