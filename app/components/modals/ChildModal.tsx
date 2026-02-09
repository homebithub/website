import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { handleApiError } from '../../utils/errorMessages';
import { XMarkIcon } from '@heroicons/react/24/outline';

const TRAITS = [
  'None', 'Allergies', 'Special Needs', 'Disabled', 'Asthma', 'ADHD',
  'Autism', 'Diabetes', 'Epilepsy', 'Other'
];

interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { gender: string; date_of_birth: string; traits: string[] }) => Promise<void>;
  initialData?: {
    gender?: string;
    date_of_birth?: string;
    dob?: string;
    traits?: string[];
  } | null;
}

const ChildModal: React.FC<ChildModalProps> = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [gender, setGender] = useState(initialData?.gender || '');
  const [dateOfBirth, setDateOfBirth] = useState(initialData?.date_of_birth || '');
  const [traits, setTraits] = useState<string[]>(initialData?.traits || []);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otherTrait, setOtherTrait] = useState('');

  // Reset form when modal is opened/closed or initialData changes
  useEffect(() => {
    if (isOpen) {
      setGender(initialData?.gender || '');
      setDateOfBirth(initialData?.date_of_birth || initialData?.dob || '');
      setTraits(initialData?.traits || []);
      setError('');
      setOtherTrait('');
    }
  }, [isOpen, initialData]);

  const isUnder18 = (birthDate: string): boolean => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    
    // Calculate age
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    
    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    
    return age < 18;
  };

  const handleTraitChange = (trait: string) => {
    if (trait === 'None') {
      // "None" is exclusive - if selected, clear all other traits
      if (traits.includes('None')) {
        setTraits([]);
      } else {
        setTraits(['None']);
        setOtherTrait(''); // Clear other trait input if any
      }
    } else if (trait === 'Other') {
      // Handle "Other" trait selection
      if (traits.includes('Other')) {
        // Remove "Other" and clear the custom input
        setTraits(prev => prev.filter(t => t !== 'Other'));
        setOtherTrait('');
      } else if (traits.length < 3 && !traits.includes('None')) {
        // Add "Other" trait (but not if "None" is selected)
        setTraits(prev => [...prev, 'Other']);
      }
    } else {
      // Handle regular traits
      // Remove "None" if it's selected and user picks another trait
      setTraits(prev => {
        const filtered = prev.filter(t => t !== 'None');
        return filtered.includes(trait)
          ? filtered.filter(t => t !== trait)
          : filtered.length < 3 ? [...filtered, trait] : filtered;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent forms
    setError('');
    setLoading(true);
    
    try {
      // Validate date of birth
      if (!dateOfBirth) {
        throw new Error('Please enter a valid date of birth');
      }
      
      if (!isUnder18(dateOfBirth)) {
        throw new Error('Child must be under 18 years old');
      }
      
      if (!gender) {
        throw new Error('Please select a gender');
      }
      
      if (traits.length === 0) {
        throw new Error('Please select at least one trait');
      }
      
      // If "Other" is selected, validate that custom trait is provided
      if (traits.includes('Other') && !otherTrait.trim()) {
        throw new Error('Please specify what the "Other" trait is');
      }
      
      // Prepare traits array, replacing "Other" with the custom trait text
      const finalTraits = traits.map(trait => 
        trait === 'Other' ? otherTrait.trim() : trait
      );
      
      await onSave({
        gender,
        date_of_birth: dateOfBirth,
        traits: finalTraits
      });
      
      // Reset form
      setGender('');
      setDateOfBirth('');
      setTraits([]);
      onClose();
    } catch (err: any) {
      setError(handleApiError(err, 'children', 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl border-2 border-purple-200 dark:border-purple-500/30 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">👶🏿</span>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Add Child</h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Gender <span className="text-red-500">*</span></h2>
            <div className="grid grid-cols-2 gap-4">
              <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer shadow-sm text-lg font-medium transition-all ${
                gender === 'female' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
              }`}>
              <input
                type="radio"
                name="gender"
                value="female"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="sr-only"
              />
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Female</span>
            </label>
            <label className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer shadow-sm text-lg font-medium transition-all ${
              gender === 'male' ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100' : 'border-purple-200 dark:border-purple-500/30 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'
            }`}>
              <input
                type="radio"
                name="gender"
                value="male"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="sr-only"
              />
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Male</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-900 dark:text-white">Date of Birth <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => {
              const selectedDate = e.target.value;
              setDateOfBirth(selectedDate);
              
              // Clear any previous error when changing the date
              if (error) setError('');
              
              // Validate date in real-time
              if (selectedDate && !isUnder18(selectedDate)) {
                setError('Child must be under 18 years old');
              }
            }}
            className="block w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold text-gray-900 dark:text-white">
            Traits <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(Select up to 3)</span>
          </label>
          <div className="flex flex-wrap gap-3">
            {TRAITS.map(trait => (
              <button
                key={trait}
                type="button"
                onClick={() => handleTraitChange(trait)}
                disabled={(traits.length === 3 && !traits.includes(trait)) || (traits.includes('None') && trait !== 'None') || (trait === 'None' && traits.length > 0 && !traits.includes('None'))}
                className={`px-4 py-1 rounded-xl border-2 text-base font-medium transition-all ${traits.includes(trait) ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-900 dark:text-purple-100' : 'bg-gray-50 dark:bg-gray-800 border-purple-200 dark:border-purple-500/30 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/10'} ${((traits.length === 3 && !traits.includes(trait)) || (traits.includes('None') && trait !== 'None') || (trait === 'None' && traits.length > 0 && !traits.includes('None'))) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                {trait}
              </button>
            ))}
          </div>
          
          {/* Custom input field for "Other" trait */}
          {traits.includes('Other') && (
            <div className="mt-4">
              <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Please specify the trait:
              </label>
              <input
                type="text"
                value={otherTrait}
                onChange={(e) => setOtherTrait(e.target.value)}
                placeholder="Enter custom trait..."
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all"
                maxLength={50}
              />
            </div>
          )}
        </div>

        {error && <div className="text-red-500 dark:text-red-400 text-sm text-center font-medium">{error}</div>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-6 py-1.5 rounded-xl border-2 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-1.5 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 hover:scale-105 transition-all flex justify-center items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            disabled={loading || !gender || !dateOfBirth || traits.length === 0 || (traits.includes('Other') && !otherTrait.trim())}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : 'Save Child'}
          </button>
        </div>
      </form>
      </div>
    </div>,
    document.body
  );
};

export default ChildModal;
