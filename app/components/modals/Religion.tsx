import React, { useState } from 'react';

const RELIGIONS = [
  'Christianity',
  'Islam',
  'Hinduism',
  'Buddhism',
  'Judaism',
  'African Traditional Religions',
  'Atheism/Agnosticism',
  'Other',
  'Prefer not to say'
];

interface ReligionProps {
  userType?: 'househelp' | 'household';
}

const Religion: React.FC<ReligionProps> = ({ userType = 'househelp' }) => {
  const [selectedReligion, setSelectedReligion] = useState<string>('');
  const [customReligion, setCustomReligion] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReligion) {
      setError('Please select your religion or belief system');
      return;
    }

    if (selectedReligion === 'Other' && !customReligion.trim()) {
      setError('Please specify your religion or belief system');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically save the data to your backend
      const finalReligion = selectedReligion === 'Other' ? customReligion.trim() : selectedReligion;
      console.log({ religion: finalReligion, userType });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Religion preferences saved successfully!');
      
      // Reset form after success
      setTimeout(() => {
        setSelectedReligion('');
        setCustomReligion('');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Failed to save religion preferences. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReligionChange = (religion: string) => {
    setSelectedReligion(religion);
    if (religion !== 'Other') {
      setCustomReligion('');
    }
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Religion & Beliefs</h1>
      <p className="text-gray-600 mb-6">
        Please select your religion or belief system. This information helps us provide better matching and ensures cultural compatibility.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Religion Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Select your religion or belief system
          </h2>
          <div className="space-y-3">
            {RELIGIONS.map((religion) => (
              <label 
                key={religion} 
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedReligion === religion 
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="religion"
                  value={religion}
                  checked={selectedReligion === religion}
                  onChange={() => handleReligionChange(religion)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedReligion === religion 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedReligion === religion && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-900 font-medium">{religion}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Custom Religion Input */}
        {selectedReligion === 'Other' && (
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-900">
              Please specify your religion or belief system
            </h2>
            <input
              type="text"
              value={customReligion}
              onChange={(e) => setCustomReligion(e.target.value)}
              placeholder="Enter your religion or belief system..."
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500"
              maxLength={100}
            />
            <div className="text-sm text-gray-500 text-right">
              {customReligion.length}/100 characters
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-xl text-sm">
            {success}
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
            ) : 'Save Religion Preferences'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Religion;
