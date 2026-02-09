import React, { useState } from 'react';
import { useSubmit } from 'react-router';

type HouseSizeOption = string;

const HOUSE_SIZE_OPTIONS: HouseSizeOption[] = [
  'Single room',
  'Bedsitter',
  '1 Bedroom',
  '2 Bedroom',
  '3 Bedroom',
  '4+ Bedrooms'
];

const HouseSize: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [additionalDetails, setAdditionalDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const submit = useSubmit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSize) {
      setError('Please select your house size');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Here you would typically save the data to your backend
      // For now, we'll just log it and show a success message
      console.log({ houseSize: selectedSize, additionalDetails });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Show success message
      alert('House size preferences saved successfully!');
      
      // Reset form
      setSelectedSize('');
      setAdditionalDetails('');
    } catch (err) {
      setError('Failed to save house size preferences. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">What is your house size?</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* House Size Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Select your house size (Optional)
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            This helps us match you with househelps who have experience with similar home sizes.
          </p>
          <div className="space-y-3">
            {HOUSE_SIZE_OPTIONS.map((size) => (
              <label 
                key={size} 
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedSize === size 
                    ? 'border-primary-500 bg-primary-50 text-primary-900' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="houseSize"
                  value={size}
                  checked={selectedSize === size}
                  onChange={() => setSelectedSize(size)}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 flex-shrink-0 ${
                  selectedSize === size 
                    ? 'border-primary-500 bg-primary-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedSize === size && (
                    <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-gray-900 font-medium">{size}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Details Text Area */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Additional Details (Optional)
          </h2>
          <p className="text-sm text-gray-600">
            Share any additional details about your house that might be helpful for househelps to know.
          </p>
          <div className="mt-1">
            <textarea
              id="additionalDetails"
              name="additionalDetails"
              rows={4}
              value={additionalDetails}
              onChange={(e) => setAdditionalDetails(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors text-gray-900 placeholder-gray-500 resize-vertical"
              placeholder="e.g., House has stairs, large garden, pets, specific cleaning requirements, etc."
              maxLength={500}
            />
            <div className="mt-2 text-sm text-gray-500 text-right">
              {additionalDetails.length}/500 characters
            </div>
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
            ) : 'Save House Size'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HouseSize;
