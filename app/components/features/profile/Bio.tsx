import React, { useState, useEffect } from 'react';

const MIN_CHARACTERS = 25;
const MAX_CHARACTERS = 2000;

interface BioProps {
  userType?: 'househelp' | 'household';
}

const Bio: React.FC<BioProps> = ({ userType = 'househelp' }) => {
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [characterCount, setCharacterCount] = useState(0);
  
  const remainingCharacters = MAX_CHARACTERS - characterCount;
  const isBioValid = characterCount>0 &&characterCount >= MIN_CHARACTERS;

  // Dynamic content based on user type
  const content = {
    househelp: {
      title: 'Tell Us About Yourself',
      description: 'Introduce yourself to potential households. A well-written bio can significantly increase your chances of getting hired. Share your experience, skills, and what makes you the perfect fit for the job.',
      placeholder: 'Share your experience, skills, and what makes you the perfect fit...'
    },
    household: {
      title: 'Tell Us About Your Household',
      description: "Describe your household and what you're looking for in a househelp. This helps potential candidates understand your family's needs and determine if they're a good fit.",
      placeholder: "Describe your household, family dynamics, expectations, and what you're looking for in a househelp..."
    }
  };

  const currentContent = content[userType];

  useEffect(() => {
    setCharacterCount(bio.length);
  }, [bio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isBioValid) {
      setError(`Please write at least ${MIN_CHARACTERS} characters`);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Here you would typically save the bio to your backend
      console.log({ bio });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Your bio has been saved successfully!');
      // Reset form after successful submission if needed
      // setBio('');
    } catch (err) {
      setError('Failed to save your bio. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{currentContent.title}</h1>
      
      <p className="text-gray-600 mb-6">
        {currentContent.description}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Your Bio (Optional)
          </label>
          <div className="mt-1 relative">
            <textarea
              id="bio"
              rows={8}
              className={`block w-full px-4 py-3 rounded-lg border-2 ${
                error && !isBioValid && bio.length > 0 
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500'
              } shadow-sm placeholder-gray-400 focus:outline-none transition-colors`}
              placeholder={currentContent.placeholder}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={MAX_CHARACTERS}
            />
            <div className="mt-2 flex justify-between text-sm">
              <div>
                {error && !isBioValid && bio.length > 0 && (
                  <span className="text-red-600">{error}</span>
                )}
              </div>
              <div className={`${remainingCharacters < 100 ? 'text-amber-600' : 'text-gray-500'}`}>
                {remainingCharacters} characters remaining
              </div>
            </div>
            {!isBioValid && bio.length > 0 && (
              <p className="mt-2 text-sm text-amber-600">
                Minimum {MIN_CHARACTERS} characters required
              </p>
            )}
          </div>
        </div>

        {success && (
          <div className="p-4 bg-green-50 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={!isBioValid || isSubmitting}
            className={`w-full px-6 py-3 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isBioValid 
                ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500' 
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Bio'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Bio;
