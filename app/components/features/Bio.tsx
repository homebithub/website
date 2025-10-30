import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '~/config/api';
import { handleApiError } from '../../utils/errorMessages';

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
      title: '✍️ About You',
      description: 'Share your story, experience, and what makes you special',
      placeholder: 'Tell households about your experience, skills, personality, and why you\'re the perfect fit...'
    },
    household: {
      title: '✍️ About Your Household',
      description: 'Help candidates understand your family and what you need',
      placeholder: "Describe your household, family dynamics, expectations, and what you're looking for..."
    }
  };

  const currentContent = content[userType];

  // Load existing bio data
  useEffect(() => {
    const loadBio = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.bio) {
            setBio(data.bio);
          }
        }
      } catch (err) {
        console.error('Failed to load bio:', err);
      }
    };
    loadBio();
  }, []);

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
      const token = localStorage.getItem('token');
      
      if (userType === 'household') {
        // For household, use household profile PUT with step metadata
        const response = await fetch(`${API_BASE_URL}/api/v1/household/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            bio,
            _step_metadata: {
              step_id: "bio",
              step_number: 7,
              is_completed: true
            }
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to save bio');
        }
      } else {
        // For househelp, use the fields endpoint with step tracking
        const response = await fetch(`${API_BASE_URL}/api/v1/househelps/me/fields`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ 
            updates: {
              bio
            },
            _step_metadata: {
              step_id: "bio",
              step_number: 14,
              is_completed: true
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to save bio');
        }
      }

      setSuccess('Your bio has been saved successfully!');
    } catch (err: any) {
      setError(handleApiError(err, 'bio', 'Failed to save your bio. Please try again.'));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-purple-700 dark:text-purple-400 mb-2">{currentContent.title}</h2>
      
      <p className="text-base text-gray-600 dark:text-gray-400 mb-6">
        {currentContent.description}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="bio" className="block text-base font-bold text-purple-700 dark:text-purple-400 mb-3">
            Your Bio <span className="text-red-500">*</span>
          </label>
          <div className="mt-1 relative">
            <textarea
              id="bio"
              rows={8}
              className={`block w-full px-4 py-3 rounded-xl border-2 bg-white dark:bg-[#13131a] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                error && !isBioValid && bio.length > 0 
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-purple-200 dark:border-purple-500/30 focus:ring-purple-500 focus:border-purple-400'
              }`}
              placeholder={currentContent.placeholder}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={MAX_CHARACTERS}
            />
            <div className="mt-2 flex justify-between text-sm">
              <div>
                {error && !isBioValid && bio.length > 0 && (
                  <span className="text-red-600 dark:text-red-400 font-semibold">{error}</span>
                )}
              </div>
              <div className={`font-medium ${remainingCharacters < 100 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {remainingCharacters} characters remaining
              </div>
            </div>
            {!isBioValid && bio.length > 0 && (
              <p className="mt-2 text-sm text-amber-600 dark:text-amber-400 font-semibold">
                ⚠️ Minimum {MIN_CHARACTERS} characters required
              </p>
            )}
          </div>
        </div>

        {success && (
          <div className="p-4 rounded-xl text-sm font-semibold border-2 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-500/30">
            ✓ {success}
          </div>
        )}

        <button
          type="submit"
          disabled={!isBioValid || isSubmitting}
          className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg shadow-lg hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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

export default Bio;
